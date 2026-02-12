/**
 * Main game world: owns canvas rendering, game loops, collisions, pickups and end conditions.
 */
class World {
  /** @type {number} */
  camera_x = 0;

  /** @type {ThrowableObject[]} */
  throwableObjects = [];

  /** @type {boolean} */
  gameOver = false;

  /** @type {boolean} */
  ending = false;

  /** @type {number|null} */
  tickIntervalId = null;

  /** @type {number|null} */
  rafId = null;

  /** @type {number} */
  MAX_BOTTLES = 6;

  /** @type {number} */
  MAX_COINS = 6;

  /** @type {number} */
  MAX_HEALTH = 6;

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Keyboard} keyboard
   * @param {(won:boolean)=>void} onEnd
   * @param {GameAudio} sfx
   */
  constructor(canvas, keyboard, onEnd, sfx) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = canvas.getContext("2d");
    /** @type {Keyboard} */
    this.keyboard = keyboard;
    /** @type {(won:boolean)=>void} */
    this.onEnd = onEnd;
    /** @type {GameAudio} */
    this.sfx = sfx;
    /** @type {Level} */
    this.level = level_1;
    this.initGameObjects();
    this.linkWorldToObjects();
    /** @type {StatusBarController} */
    this.hud = new StatusBarController(this, statusbar_assets, {
      health: this.MAX_HEALTH,
      coins: this.MAX_COINS,
      bottles: this.MAX_BOTTLES,
    });

    this.hud.update();
    this.startLoops();
  }

  /** @returns {void} */
  initGameObjects() {
    /** @type {Character} */
    this.character = new Character(this.sfx);
  }

  /** @returns {void} */
  linkWorldToObjects() {
    this.character.world = this;
    this.character.start();
    this.level.enemies?.forEach((e) => (e.world = this));
    const boss = this.getBoss();
    if (boss) boss.world = this;
    this.level.clouds?.forEach((c) => (c.world = this));
  }

  /** @returns {Endboss|undefined} */
  getBoss() {
    return this.level.enemies?.find((e) => e instanceof Endboss);
  }

  /** @returns {void} */
  startLoops() {
    this.startTickLoop();
    this.startDrawLoop();
  }

  /** @returns {void} */
  startTickLoop() {
    this.tickIntervalId = setInterval(() => {
      if (this.gameOver || this.ending) return;
      this.updateTick();
      this.cleanupAfterTick();
      this.checkEndConditions();
    }, 50);
  }

  /** @returns {void} */
  startDrawLoop() {
    const draw = () => {
      if (this.gameOver) return;
      this.drawFrame();
      this.rafId = requestAnimationFrame(draw);
    };
    draw();
  }

  /** @returns {void} */
  stopLoops() {
    if (this.tickIntervalId) clearInterval(this.tickIntervalId);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.tickIntervalId = null;
    this.rafId = null;
  }

  /** @returns {void} */
  updateTick() {
    this.handleEnemyCollisions();
    this.collectCoins();
    this.collectBottles();
    this.activateBossIfNear();
    this.hud.update();
  }

  /** @returns {void} */
  cleanupAfterTick() {
    this.removeDeadEnemies();
    this.removeInvisibleBottles();
  }

  /** @returns {void} */
  removeDeadEnemies() {
    this.level.enemies = (this.level.enemies || []).filter(
      (e) => e instanceof Endboss || !e.isRemoved
    );
  }

  /** @returns {void} */
  removeInvisibleBottles() {
    this.throwableObjects = this.throwableObjects.filter((b) => !b.isRemoved);
  }

  /** @returns {void} */
  drawFrame() {
    this.clearCanvas();
    this.drawWorld();
    this.drawHud();
  }

  /** @returns {void} */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** @returns {void} */
  drawWorld() {
    this.ctx.translate(this.camera_x, 0);
    this.drawLayerObjects();
    this.drawObject(this.character);
    this.ctx.translate(-this.camera_x, 0);
  }

  /** @returns {void} */
  drawLayerObjects() {
    this.drawObjects(this.level.backgroundObjects);
    this.drawObjects(this.level.clouds);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.level.coins);
    this.drawObjects(this.level.bottles);
    this.drawObjects(this.throwableObjects);
  }

  /** @returns {void} */
  drawHud() {
    this.hud.draw(this.ctx);
  }

  /**
   * @param {Array<any>|undefined|null} list
   * @returns {void}
   */
  drawObjects(list) {
    if (!list) return;
    list.forEach((obj) => this.drawObject(obj));
  }

  /**
   * @param {any} obj
   * @returns {void}
   */
  drawObject(obj) {
    if (!obj || obj.isRemoved) return;
    if (obj.otherDirection) this.flipObject(obj);
    obj.draw(this.ctx);
    if (obj.otherDirection) this.unflipObject(obj);
  }

  /**
   * @param {{width:number,x:number}} obj
   * @returns {void}
   */
  flipObject(obj) {
    this.ctx.save();
    this.ctx.translate(obj.width, 0);
    this.ctx.scale(-1, 1);
    obj.x *= -1;
  }

  /**
   * @param {{x:number}} obj
   * @returns {void}
   */
  unflipObject(obj) {
    obj.x *= -1;
    this.ctx.restore();
  }

  /** @returns {void} */
  handleEnemyCollisions() {
    this.level.enemies?.forEach((enemy) => this.handleSingleEnemyCollision(enemy));
  }

  /**
   * @param {any} enemy
   * @returns {void}
   */
  handleSingleEnemyCollision(enemy) {
    if (!enemy || enemy.isRemoved) return;
    if (!this.character.isColliding(enemy)) return;
    if (enemy instanceof Chicken) return this.handleChickenTouch(enemy);
    return this.handleOtherEnemyTouch(enemy);
  }

  /**
   * @param {Chicken} chicken
   * @returns {void}
   */

  /**
 * @param {Chicken} chicken
 * @returns {void}
 */
handleChickenTouch(chicken) {
  if (chicken.isDead) return;
  if (this.isStompHit(chicken)) {
    chicken.die();
    this.character.y = chicken.y - this.character.height + 1;
    return;
  }

  this.damagePlayer();
}
  /**
   * @param {any} enemy
   * @returns {void}
   */
  handleOtherEnemyTouch(enemy) {
    if (enemy.isDead) return;
    this.damagePlayer();
  }

  /** @returns {void} */
  damagePlayer() {
    this.character.hit();
    this.sfx.playHurt();
  }

  /**
   * @param {{y:number}} enemy
   * @returns {boolean}
   */
  isStompHit(enemy) {
    const falling = this.character.speedY < 0;
    if (!falling) return false;
    const charBottomNow = this.character.y + this.character.height;
    const charBottomPrev =
      this.character.y + this.character.speedY + this.character.height;
    const enemyTop = enemy.y;
    const MARGIN = 35;
    const cameFromAbove = charBottomPrev <= enemyTop + MARGIN;
    const isNowAtOrBelowTop = charBottomNow >= enemyTop;
    return cameFromAbove && isNowAtOrBelowTop;
  }

  /** @returns {void} */
  collectCoins() {
    if (!this.level.coins) return;
    this.level.coins = this.level.coins.filter((coin) => {
      if (!this.character.isColliding(coin)) return true;
      this.character.coins++;
      this.sfx.playCollect();
      return false;
    });
  }

  /** @returns {void} */
  collectBottles() {
    if (!this.level.bottles) return;
    this.level.bottles = this.level.bottles.filter((bottle) => {
      if (!this.character.isColliding(bottle)) return true;
      this.character.bottles++;
      this.sfx.playCollect();
      return false;
    });
  }

  /** @returns {void} */
  activateBossIfNear() {
    const boss = this.getBoss();
    if (!boss) return;
    if (boss.isDead || boss.isActive) return;
    if (!this.isBossTriggerReached(boss)) return;
    boss.setActive();
    this.sfx.musicBoss();
  }

  /**
   * @param {{x:number}} boss
   * @returns {boolean}
   */
  isBossTriggerReached(boss) {
    return this.character.x > boss.x - 500;
  }

  /** @returns {void} */
  checkEndConditions() {
    if (this.isPlayerDead()) return this.finishGame(false);
    if (this.isBossRemovedAfterDeath()) return this.finishGame(true);
  }

  /** @returns {boolean} */
  isPlayerDead() {
    return this.character.energy <= 0;
  }

  /** @returns {void} */
  syncHud() {
    this.hud.update();
  }

  /** @returns {boolean} */
  isBossRemovedAfterDeath() {
    const boss = this.getBoss();
    return !!boss && boss.isDead && boss.isRemoved;
  }

  /**
   * @param {boolean} won
   * @returns {void}
   */
  finishGame(won) {
    if (this.gameOver || this.ending) return;
    this.ending = true;
    const boss = this.getBoss();
    boss?.stop?.();
    this.sfx.endGame(won);
    setTimeout(() => {
      this.gameOver = true;
      this.stopLoops();
      if (typeof this.onEnd === "function") this.onEnd(won);
    }, 400);
  }
}
