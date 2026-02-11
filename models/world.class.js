class World {
  camera_x = 0;
  throwableObjects = [];
  gameOver = false;
  ending = false;
  tickIntervalId = null;
  rafId = null;
  MAX_BOTTLES = 6;
  MAX_COINS = 6;
  MAX_HEALTH = 6;

  constructor(canvas, keyboard, onEnd, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.onEnd = onEnd;
    this.sfx = sfx;
    this.level = level_1;
    this.initGameObjects();
    this.linkWorldToObjects();
    this.hud = new StatusBarController(this, statusbar_assets, {
      health: this.MAX_HEALTH,
      coins: this.MAX_COINS,
      bottles: this.MAX_BOTTLES,
    });
    this.hud.update();
    this.startLoops();
  }

  initGameObjects() {
    this.character = new Character(this.sfx);
  }

  linkWorldToObjects() {
    this.character.world = this;
    this.character.start();
    this.level.enemies?.forEach(e => (e.world = this));
    const boss = this.getBoss();
    if (boss) boss.world = this;
    this.level.clouds?.forEach(c => (c.world = this));
  }

  getBoss() {
    return this.level.enemies?.find(e => e instanceof Endboss);
  }

  startLoops() {
    this.startTickLoop();
    this.startDrawLoop();
  }

  startTickLoop() {
    this.tickIntervalId = setInterval(() => {
      if (this.gameOver || this.ending) return;
      this.updateTick();
      this.cleanupAfterTick();
      this.checkEndConditions();
    }, 50);
  }

  startDrawLoop() {
    const draw = () => {
      if (this.gameOver) return;
      this.drawFrame();
      this.rafId = requestAnimationFrame(draw);
    };
    draw();
  }

  stopLoops() {
    if (this.tickIntervalId) clearInterval(this.tickIntervalId);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.tickIntervalId = null;
    this.rafId = null;
  }

  updateTick() {
    this.handleEnemyCollisions();
    this.collectCoins();
    this.collectBottles();
    this.activateBossIfNear();
    this.hud.update();
  }

  cleanupAfterTick() {
    this.removeDeadEnemies();
    this.removeInvisibleBottles();
  }

  removeDeadEnemies() {
    this.level.enemies = (this.level.enemies || []).filter(
      e => (e instanceof Endboss) || !e.isRemoved
    );
  }

  removeInvisibleBottles() {
    this.throwableObjects = this.throwableObjects.filter(b => !b.isRemoved);
  }

  drawFrame() {
    this.clearCanvas();
    this.drawWorld();
    this.drawHud();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawWorld() {
    this.ctx.translate(this.camera_x, 0);
    this.drawLayerObjects();
    this.drawObject(this.character);
    this.ctx.translate(-this.camera_x, 0);
  }

  drawLayerObjects() {
    this.drawObjects(this.level.backgroundObjects);
    this.drawObjects(this.level.clouds);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.level.coins);
    this.drawObjects(this.level.bottles);
    this.drawObjects(this.throwableObjects);
  }

  drawHud() {
    this.hud.draw(this.ctx);
  }

  drawObjects(list) {
    if (!list) return;
    list.forEach(obj => this.drawObject(obj));
  }

  drawObject(obj) {
    if (!obj || obj.isRemoved) return;
    if (obj.otherDirection) this.flipObject(obj);
    obj.draw(this.ctx);
    if (obj.otherDirection) this.unflipObject(obj);
  }

  flipObject(obj) {
    this.ctx.save();
    this.ctx.translate(obj.width, 0);
    this.ctx.scale(-1, 1);
    obj.x *= -1;
  }

  unflipObject(obj) {
    obj.x *= -1;
    this.ctx.restore();
  }

  handleEnemyCollisions() {
    this.level.enemies?.forEach(enemy => this.handleSingleEnemyCollision(enemy));
  }

  handleSingleEnemyCollision(enemy) {
    if (!enemy || enemy.isRemoved) return;
    if (!this.character.isColliding(enemy)) return;
    if (enemy instanceof Chicken) return this.handleChickenTouch(enemy);
    return this.handleOtherEnemyTouch(enemy);
  }

  handleChickenTouch(chicken) {
  if (chicken.isDead) return;
  if (this.isStompHit(chicken)) {
    chicken.die();
    this.character.speedY = 15; 
    return;
  }
  this.damagePlayer();
}

  handleOtherEnemyTouch(enemy) {
    if (enemy.isDead) return;
    this.damagePlayer();
  }

  damagePlayer() {
    this.character.hit();
    this.sfx.playHurt();
  }

  isStompHit(enemy) {
  const falling = this.character.speedY < 0;
  if (!falling) return false;
  const charBottomNow = this.character.y + this.character.height;
  const charBottomPrev = (this.character.y + this.character.speedY) + this.character.height; 
  const enemyTop = enemy.y;
  const MARGIN = 35; 
  const cameFromAbove = charBottomPrev <= enemyTop + MARGIN;
  const isNowAtOrBelowTop = charBottomNow >= enemyTop; 
  return cameFromAbove && isNowAtOrBelowTop;
}

  collectCoins() {
    if (!this.level.coins) return;
    this.level.coins = this.level.coins.filter(coin => {
      if (!this.character.isColliding(coin)) return true;
      this.character.coins++;
      this.sfx.playCollect();
      return false;
    });
  }

  collectBottles() {
    if (!this.level.bottles) return;
    this.level.bottles = this.level.bottles.filter(bottle => {
      if (!this.character.isColliding(bottle)) return true;
      this.character.bottles++;
      this.sfx.playCollect();
      return false;
    });
  }



  activateBossIfNear() {
    const boss = this.getBoss();
    if (!boss) return;
    if (boss.isDead || boss.isActive) return;
    if (!this.isBossTriggerReached(boss)) return;
    boss.setActive();
    this.sfx.musicBoss();
  }

  isBossTriggerReached(boss) {
    return this.character.x > boss.x - 500;
  }

  checkEndConditions() {
    if (this.isPlayerDead()) return this.finishGame(false);
    if (this.isBossRemovedAfterDeath()) return this.finishGame(true);
  }

  isPlayerDead() {
    return this.character.energy <= 0;
  }

  isBossRemovedAfterDeath() {
    const boss = this.getBoss();
    return !!boss && boss.isDead && boss.isRemoved;
  }

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