class World {
  camera_x = 0;
  throwableObjects = [];
  lastThrow = 0;
  gameOver = false;
  tickIntervalId = null;
  rafId = null;
  BOTTLE_THROW_COOLDOWN = 500;
  BOSS_FALL_DELAY = 500;
  ending = false;

  constructor(canvas, keyboard, onEnd, audioManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.keyboard = keyboard;
    this.onEnd = onEnd;
    this.sfx = audioManager;
    this.level = level_1;
    this.character = new Character();
    this.statusBarHealth = new StatusBar(statusbar_assets.health, 10, 0, 100);
    this.statusBarCoins  = new StatusBar(statusbar_assets.coins, 10, 60, 0);
    this.statusBarBottle = new StatusBar(statusbar_assets.bottles, 10, 120, 0);
    this.statusBarBoss   = new StatusBar(statusbar_assets.boss, 480, 0, 0);
    this.linkWorldToObjects();
    this.startLoops();
  }


  linkWorldToObjects() {
    this.character.world = this;
    this.character.start();
    this.level.enemies.forEach(e => e.world = this);
    const boss = this.getBoss();
    if (boss) boss.world = this;
  }

  getBoss() {
    return this.level.enemies.find(e => e instanceof Endboss);
  }


  startLoops() {
    this.startTickLoop();
    this.startDrawLoop();
  }


startTickLoop() {
this.tickIntervalId = setInterval(() => {
  if (this.gameOver || this.ending) return;
  this.updateTick();
  this.removeDeadEnemies();
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
    clearInterval(this.tickIntervalId);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }


  updateTick() {
    this.handleEnemyCollisions();
    this.handleThrowing();
    this.collectCoins();
    this.collectBottles();
    this.stompChicken();
    this.bottleHitsChicken();
    this.activateBossIfNear();
    this.updateBossBar();
    this.bottleHitsBoss();
    this.statusBarHealth.setPercentage(this.character.energy);
  }

removeDeadEnemies() {
  this.level.enemies = this.level.enemies.filter(e => (e instanceof Endboss) || !e.isRemoved);
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
    this.drawObjects(this.level.backgroundObjects);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.level.coins);
    this.drawObjects(this.level.bottles);
    this.drawObjects(this.throwableObjects);
    this.drawObjects(this.level.clouds);
    this.drawObject(this.character);
    this.ctx.translate(-this.camera_x, 0);
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


  handleThrowing() {
    if (!this.canThrowBottle()) return;
    this.createBottle();
    this.useOneBottle();
    this.lastThrow = Date.now();
  }

  canThrowBottle() {
    const now = Date.now();
    const cooldownReady = now - this.lastThrow > this.BOTTLE_THROW_COOLDOWN;
    return this.keyboard.D && cooldownReady && this.character.bottles > 0;
  }

  createBottle() {
  const throwRight = !this.character.otherDirection;
  const x = throwRight ? this.character.x + 100 : this.character.x - 20;
  const y = this.character.y + 120;
  const bottle = new ThrowableObject(x, y, throwRight);
  this.throwableObjects.push(bottle);
  this.sfx.play("throw");
}

  useOneBottle() {
    this.character.bottles--;
    this.updateBottleBar();
  }

  updateBottleBar() {
    this.statusBarBottle.setPercentage((this.character.bottles / 10) * 100);
  }


  handleEnemyCollisions() {
    this.level.enemies.forEach(enemy => this.handleSingleEnemyCollision(enemy));
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
    this.statusBarHealth.setPercentage(this.character.energy);
    this.sfx.playOnce("hurt_audio", 500);
  }

  isStompHit(enemy) {
    const fallingDown = this.character.speedY < 0;
    const charBottom = this.character.y + this.character.height;
    const enemyTop = enemy.y;
    return fallingDown && charBottom < enemyTop + 30;
  }


  collectCoins() {
    if (!this.level.coins) return;
    this.level.coins = this.level.coins.filter(coin => {
      if (!this.character.isColliding(coin)) return true;
      this.character.coins++;
      this.statusBarCoins.setPercentage((this.character.coins / 10) * 100);
      this.sfx.play("collect");
      return false;
    });
  }

  collectBottles() {
    if (!this.level.bottles) return;

    this.level.bottles = this.level.bottles.filter(bottle => {
      if (!this.character.isColliding(bottle)) return true;
      this.character.bottles++;
      this.updateBottleBar();
      this.sfx.play("collect");

      return false;
    });
  }

  stompChicken() {
    this.level.enemies.forEach(enemy => {
      if (!(enemy instanceof Chicken)) return;
      if (enemy.isDead) return;
      if (!this.character.isColliding(enemy)) return;
      if (!this.isStompHit(enemy)) return;

      enemy.die();
      this.character.speedY = 15;
    });
  }

  bottleHitsChicken() {
    this.throwableObjects.forEach(bottle => this.checkBottleAgainstChickens(bottle));
    this.removeInvisibleBottles();
  }

  checkBottleAgainstChickens(bottle) {
    this.level.enemies.forEach(enemy => {
      if (!(enemy instanceof Chicken)) return;
      if (enemy.isDead) return;
      if (!bottle.isColliding(enemy)) return;
      bottle.hasHitEnemy = true;   
      enemy.die();
      bottle.splash();
      this.sfx.play("breaking")
    });
  }

  activateBossIfNear() {
    const boss = this.getBoss();
    if (!boss) return;
    if (boss.isDead || boss.isActive) return;
    if (!this.isBossTriggerReached(boss)) return;
    boss.setActive();
    this.statusBarBoss.setPercentage(boss.energy);
  }

  isBossTriggerReached(boss) {
    return this.character.x > boss.x - 500;
  }

  updateBossBar() {
    const boss = this.getBoss();
    if (!boss) return;
    if (!boss.isActive || boss.isRemoved) return;
    this.statusBarBoss.setPercentage(boss.energy);
  }

  bottleHitsBoss() {
    const boss = this.getBoss();
    if (!this.canHitBoss(boss)) return;
    this.throwableObjects.forEach(bottle => this.checkBottleAgainstBoss(bottle, boss));
    this.removeInvisibleBottles();
  }

  canHitBoss(boss) {
    return boss && !boss.isDead && !boss.isRemoved;
  }

  checkBottleAgainstBoss(bottle, boss) {
  if (bottle.hasHitBoss) return;
  if (!bottle.isColliding(boss)) return;
  bottle.hasHitBoss = true;    
  this.hitBoss(boss);
  bottle.splash();
   this.sfx.play("breaking")
}

 
  hitBoss(boss) {
    boss.hitBoss(20);
    this.statusBarBoss.setPercentage(boss.energy);
  }

  scheduleBossRemove(boss) {
    setTimeout(() => {
      boss.isRemoved = true;
    }, this.BOSS_FALL_DELAY);
  }

  hideBottle(bottle) {
    bottle.x = -9999;
  }

  removeInvisibleBottles() {
    this.throwableObjects = this.throwableObjects.filter(b => b.x > -1000);
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
    if (!boss) return false;
    return boss.isDead && boss.isRemoved; 
  }

finishGame(won) {
  if (this.gameOver || this.ending) return;
  this.ending = true; 
  setTimeout(() => {
    this.gameOver = true;
    this.stopLoops();
    if (typeof this.onEnd === "function") this.onEnd(won);
  }, 400);
}
};