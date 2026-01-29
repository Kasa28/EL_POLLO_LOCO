class World {
  character = new Character();
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBarHealth = new StatusBar(images_health, 10, 0);
  statusBarCoins  = new StatusBar(images_coins, 10, 60);
  statusBarBottle = new StatusBar(images_bootles, 10, 120);
  statusBarBoss   = new StatusBar(images_boss, 480, 0);
  throwableObjects = [];
  lastThrow = 0;
  gameOver = false;
  gameInterval = null;
  rafId = null;

  constructor(canvas, keyboard, onEnd) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level = level_1;
    this.onEnd = onEnd;
    this.setWorldRefs();
    this.startLoops();
  }

  setWorldRefs() {
    this.character.world = this;
    this.character.start();
    const boss = this.getBoss();
    if (boss) boss.world = this;
  }

  startLoops() {
    this.startGameLoop();
    this.startDrawLoop();
  }

  startGameLoop() {
    this.gameInterval = setInterval(() => {
      if (this.gameOver) return;
      this.updateTick();
      this.cleanup();
    }, 50);
  }

  startDrawLoop() {
    const loop = () => {
      if (this.gameOver) return;
      this.drawFrame();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  updateTick() {
    this.checkCollisons();
    this.checkThrowObjects();
    this.checkCollectCoins();
    this.checkCollectBottles();
    this.checkStompOnChicken();
    this.checkBottleHitsChicken();
    this.checkBossTrigger();
    this.checkBottleHitsBoss();
    this.checkGameOver();
  }

  cleanup() {
    this.cleanupBottles();
    this.level.enemies = this.level.enemies.filter(e => !e.isRemoved);
  }


  drawFrame() {
    this.clearCanvas();
    this.drawWorld();
    this.drawHUD();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawWorld() {
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.clouds);

    this.addToMap(this.character);

    this.ctx.translate(-this.camera_x, 0);
  }

  drawHUD() {
    this.addToMap(this.statusBarHealth);
    this.addToMap(this.statusBarCoins);
    this.addToMap(this.statusBarBottle);

    const boss = this.getBoss();
    if (boss && boss.isActive && !boss.isRemoved) {
      this.statusBarBoss.setPercentage(boss.energy);
      this.addToMap(this.statusBarBoss);
    }
  }

  addObjectsToMap(objects) {
    if (!objects) return;
    objects.forEach(o => this.addToMap(o));
  }

  addToMap(mo) {
    if (!mo || mo.isRemoved) return;

    if (mo.otherDirection) this.flipImage(mo);
    mo.draw(this.ctx);
    if (mo.otherDirection) this.flipImageBack(mo);
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x *= -1;
  }

  flipImageBack(mo) {
    mo.x *= -1;
    this.ctx.restore();
  }


  getBoss() {
    return this.level.enemies.find(e => e instanceof Endboss);
  }


  checkThrowObjects() {
    const now = Date.now();
    const canThrow =
      this.keyboard.D &&
      now - this.lastThrow > 500 &&
      this.character.bottles > 0;

    if (!canThrow) return;

    this.spawnBottle();
    this.consumeBottle();
    this.lastThrow = now;
  }

  spawnBottle() {
    const bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
    this.throwableObjects.push(bottle);
  }

  consumeBottle() {
    this.character.bottles--;
    this.statusBarBottle.setPercentage((this.character.bottles / 10) * 100);
  }

  cleanupBottles() {
    this.throwableObjects = this.throwableObjects.filter(b => b.x > -1000);
  }


  checkCollisons() {
    this.level.enemies.forEach(enemy => {
      if (!enemy || enemy.isRemoved) return;
      if (enemy instanceof Chicken) return this.handleChickenCollision(enemy);
      if (!enemy.isDead && this.character.isColliding(enemy)) {
        this.damagePlayer();
      }
    });
  }

  handleChickenCollision(chicken) {
    if (chicken.isDead) return;
    if (!this.character.isColliding(chicken)) return;
    if (this.isStomping(chicken)) return;
    this.damagePlayer();
  }

  damagePlayer() {
    this.character.hit();
    this.statusBarHealth.setPercentage(this.character.energy);
  }

  isStomping(enemy) {
    const isFalling = this.character.speedY < 0;
    const charBottom = this.character.y + this.character.height;
    const enemyTop = enemy.y;
    return isFalling && charBottom < enemyTop + 30;
  }

  checkCollectCoins() {
    if (!this.level.coins) return;

    this.level.coins = this.level.coins.filter(coin => {
      if (!this.character.isColliding(coin)) return true;
      this.character.coins++;
      this.statusBarCoins.setPercentage((this.character.coins / 10) * 100);
      return false;
    });
  }

  checkCollectBottles() {
    if (!this.level.bottles) return;

    this.level.bottles = this.level.bottles.filter(bottle => {
      if (!this.character.isColliding(bottle)) return true;
      this.character.bottles++;
      this.statusBarBottle.setPercentage((this.character.bottles / 10) * 100);
      return false;
    });
  }


  checkStompOnChicken() {
    this.level.enemies.forEach(enemy => {
      if (!(enemy instanceof Chicken)) return;
      if (enemy.isDead) return;
      if (!this.character.isColliding(enemy)) return;
      if (!this.isStomping(enemy)) return;

      enemy.die();
      this.character.speedY = 15;
    });
  }

  checkBottleHitsChicken() {
    this.throwableObjects.forEach(bottle => {
      this.level.enemies.forEach(enemy => {
        if (!(enemy instanceof Chicken)) return;
        if (enemy.isDead) return;
        if (!bottle.isColliding(enemy)) return;
        enemy.die();
        bottle.x = -9999;
      });
    });
  }


  checkBossTrigger() {
    const boss = this.getBoss();
    if (!boss || boss.isDead || boss.isActive) return;

    const trigger = this.character.x > boss.x - 500;
    if (!trigger) return;

    boss.setActive();
    this.statusBarBoss.setPercentage(boss.energy);
  }

  checkBottleHitsBoss() {
    const boss = this.getBoss();
    if (!boss || boss.isDead || boss.isRemoved) return;

    this.throwableObjects.forEach(bottle => {
      if (!bottle.isColliding(boss)) return;

      boss.hitBoss(20);
      this.statusBarBoss.setPercentage(boss.energy);
      bottle.x = -9999;

      if (boss.isDead) setTimeout(() => (boss.isRemoved = true), 1000);
    });
  }


  checkGameOver() {
    if (this.character.energy <= 0) return this.endGame(false);
    const boss = this.getBoss();
    if (boss && boss.isDead) return this.endGame(true);
  }

  endGame(won) {
    if (this.gameOver) return;
    this.gameOver = true;
    this.stopLoops();
    if (typeof this.onEnd === "function") {
      this.onEnd(won);
    }
  }

  stopLoops() {
    clearInterval(this.gameInterval);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.throwableObjects = [];
  }
}
