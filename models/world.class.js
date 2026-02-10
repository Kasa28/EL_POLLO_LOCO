class World {
  camera_x = 0;
  throwableObjects = [];
  lastThrow = 0;

  gameOver = false;
  ending = false;

  tickIntervalId = null;
  rafId = null;

  BOTTLE_THROW_COOLDOWN = 500;
  MAX_BOTTLES = 6;
  MAX_COINS = 10;

  constructor(canvas, keyboard, onEnd, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.onEnd = onEnd;
    this.sfx = sfx;

    this.level = level_1;

    this.initHud();
    this.initGameObjects();
    this.linkWorldToObjects();

    // ✅ Bars initial korrekt setzen
    this.updateHealthBar();
    this.updateCoinBar();
    this.updateBottleBar();

    this.startLoops();
  }

  initHud() {
    this.statusBarHealth = new StatusBar(statusbar_assets.health, 10, 0, 100);
    this.statusBarCoins  = new StatusBar(statusbar_assets.coins, 10, 60, 0);
    this.statusBarBottle = new StatusBar(statusbar_assets.bottles, 10, 120, 0);
    this.statusBarBoss   = new StatusBar(statusbar_assets.boss, 480, 0, 0);
  }

  initGameObjects() {
    this.character = new Character();
  }

  linkWorldToObjects() {
    this.character.world = this;
    this.character.start();

    this.level.enemies?.forEach(e => (e.world = this));
    const boss = this.getBoss();
    if (boss) boss.world = this;
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
    this.handleThrowing();
    this.collectCoins();
    this.collectBottles();
    this.stompChicken();
    this.activateBossIfNear();
    this.updateBossBar();
    this.updateHealthBar();
  }

  cleanupAfterTick() {
    this.removeDeadEnemies();
    this.removeInvisibleBottles();
  }

  // ---------- HUD Updates ----------
  updateHealthBar() {
    // energy ist bei dir 0..100 -> direkt ok
    this.statusBarHealth.setPercentage(this.character.energy);
  }

  updateCoinBar() {
    const c = Math.max(0, Math.min(this.MAX_COINS, this.character.coins));
    this.character.coins = c;
    this.statusBarCoins.setPercentage((c / this.MAX_COINS) * 100);
  }

  updateBottleBar() {
    const b = Math.max(0, Math.min(this.MAX_BOTTLES, this.character.bottles));
    this.character.bottles = b;

    const pct = (b / this.MAX_BOTTLES) * 100;
    this.statusBarBottle.setPercentage(pct);
  }

  removeDeadEnemies() {
    this.level.enemies = (this.level.enemies || []).filter(
      e => (e instanceof Endboss) || !e.isRemoved
    );
  }

  removeInvisibleBottles() {
    this.throwableObjects = this.throwableObjects.filter(b => !b.isRemoved);
  }

  // ---------- Drawing ----------
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
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.level.coins);
    this.drawObjects(this.level.bottles);
    this.drawObjects(this.throwableObjects);
    this.drawObjects(this.level.clouds);
  }

  drawHud() {
    this.drawObject(this.statusBarHealth);
    this.drawObject(this.statusBarCoins);
    this.drawObject(this.statusBarBottle);

    const boss = this.getBoss();
    if (this.shouldShowBossBar(boss)) this.drawObject(this.statusBarBoss);
  }

  shouldShowBossBar(boss) {
    return boss && boss.isActive && !boss.isRemoved;
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

  // ---------- Throwing ----------
  handleThrowing() {
    if (!this.canThrowBottle()) return;
    this.spawnBottle();
    this.useOneBottle();
    this.lastThrow = Date.now();
  }

  canThrowBottle() {
    const cooldownReady = Date.now() - this.lastThrow > this.BOTTLE_THROW_COOLDOWN;
    return this.keyboard.D && cooldownReady && this.character.bottles > 0;
  }

  spawnBottle() {
    const throwRight = !this.character.otherDirection;
    const x = throwRight ? this.character.x + 100 : this.character.x - 20;
    const y = this.character.y + 120;

    const bottle = new ThrowableObject(x, y, throwRight, this.sfx);
    bottle.world = this;

    this.throwableObjects.push(bottle);
    this.sfx.playThrow();
  }

  useOneBottle() {
    this.character.bottles = Math.max(0, this.character.bottles - 1);
    this.updateBottleBar();
  }

  // ---------- Collisions ----------
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
    if (this.isStompHit(chicken)) return;
    this.damagePlayer();
  }

  handleOtherEnemyTouch(enemy) {
    if (enemy.isDead) return;
    this.damagePlayer();
  }

  damagePlayer() {
    this.character.hit();
    this.updateHealthBar();
    this.sfx.playHurt();
  }

  isStompHit(enemy) {
    const fallingDown = this.character.speedY < 0;
    const charBottom = this.character.y + this.character.height;
    const enemyTop = enemy.y;
    return fallingDown && charBottom < enemyTop + 30;
  }

  // ---------- Collect ----------
  collectCoins() {
    if (!this.level.coins) return;

    this.level.coins = this.level.coins.filter(coin => {
      if (!this.character.isColliding(coin)) return true;

      this.character.coins++;
      this.character.coins = Math.min(this.character.coins, this.MAX_COINS);

      this.updateCoinBar();
      this.sfx.playCollect();
      return false;
    });
  }

  collectBottles() {
    if (!this.level.bottles) return;

    this.level.bottles = this.level.bottles.filter(bottle => {
      if (!this.character.isColliding(bottle)) return true;

      // ✅ sauber clampen
      this.character.bottles++;
      this.character.bottles = Math.min(this.character.bottles, this.MAX_BOTTLES);

      this.updateBottleBar();
      this.sfx.playCollect();
      return false;
    });
  }

  stompChicken() {
    this.level.enemies?.forEach(enemy => {
      if (!(enemy instanceof Chicken)) return;
      if (enemy.isDead) return;
      if (!this.character.isColliding(enemy)) return;
      if (!this.isStompHit(enemy)) return;

      enemy.die();
      this.character.speedY = 15;
    });
  }

  // ---------- Boss ----------
  activateBossIfNear() {
    const boss = this.getBoss();
    if (!boss) return;
    if (boss.isDead || boss.isActive) return;
    if (!this.isBossTriggerReached(boss)) return;

    boss.setActive();
    this.sfx.musicBoss();
    this.statusBarBoss.setPercentage(boss.energy);
  }

  isBossTriggerReached(boss) {
    return this.character.x > boss.x - 500;
  }

  updateBossBar() {
    const boss = this.getBoss();
    if (!boss || !boss.isActive || boss.isRemoved) return;
    this.statusBarBoss.setPercentage(boss.energy);
  }

  // ---------- End Game ----------
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