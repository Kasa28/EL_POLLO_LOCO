class World {
  character = new Character();
  clouds = level_1.clouds;
  backgroundObjects = level_1.backgroundObjects;
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

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level = level_1;

    this.draw();
    this.setWorld();
    this.run();
  }

  setWorld() {
    this.character.world = this;
    this.character.start();

    const boss = this.getBoss();
    if (boss) boss.world = this;
  }

  run() {
    setInterval(() => {
      this.checkCollisons();
      this.checkThrowObjects();
      this.checkCollectCoins();
      this.checkCollectBottles();
      this.checkStompOnChicken();
      this.checkBottleHitsChicken();
      this.checkBossTrigger();    
      this.checkBoss();            
      this.checkBottleHitsBoss();  
      this.level.enemies = this.level.enemies.filter(e => !e.isRemoved);
    }, 50);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);    
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.enemies);
    if (this.level.coins) this.addObjectsToMap(this.level.coins);
    if (this.level.bottles) this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.clouds);
    this.addToMap(this.character);
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBarHealth);
    this.addToMap(this.statusBarCoins);
    this.addToMap(this.statusBarBottle);

    const boss = this.getBoss();
    if (boss && boss.isActive && !boss.isRemoved) {
      this.addToMap(this.statusBarBoss);
    }

    requestAnimationFrame(() => this.draw());
  }

  addObjectsToMap(objects) {
    if (!objects) return;
    objects.forEach(o => this.addToMap(o));
  }

  addToMap(mo) {
    if (mo.otherDirection) this.flippImage(mo);
    mo.draw(this.ctx);
    if (mo.otherDirection) this.flippImageBack(mo);
  }

  flippImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flippImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }

  getBoss() {
    return this.level.enemies.find(e => e instanceof Endboss);
  }

  checkThrowObjects() {
    const now = Date.now();
    if (this.keyboard.D && now - this.lastThrow > 500 && this.character.bottles > 0) {
      let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
      this.throwableObjects.push(bottle);
      this.lastThrow = now;
      this.character.bottles--;
      this.statusBarBottle.setPercentage((this.character.bottles / 10) * 100);
    }
  }

  checkCollisons() {
    this.level.enemies.forEach((enemy) => {
      if (enemy.isRemoved) return;
      if (enemy instanceof Chicken) {
        if (enemy.isDead) return;
        if (this.character.isColliding(enemy) && !this.isStomping(enemy)) {
          this.character.hit();
          this.statusBarHealth.setPercentage(this.character.energy);
        }
        return;
      }
      if (this.character.isColliding(enemy) && !enemy.isDead) {
        this.character.hit();
        this.statusBarHealth.setPercentage(this.character.energy);
      }
    });
  }

  isStomping(enemy) {
    const isFalling = this.character.speedY < 0;
    const charBottom = this.character.y + this.character.height;
    const enemyTop = enemy.y;
    return isFalling && charBottom < enemyTop + 30;
  }

  checkCollectCoins() {
    if (!this.level.coins) return;
    this.level.coins = this.level.coins.filter((coin) => {
      if (this.character.isColliding(coin)) {
        this.character.coins++;
        this.statusBarCoins.setPercentage((this.character.coins / 10) * 100);
        return false;
      }
      return true;
    });
  }

  checkCollectBottles() {
    if (!this.level.bottles) return;
    this.level.bottles = this.level.bottles.filter((bottle) => {
      if (this.character.isColliding(bottle)) {
        this.character.bottles++;
        this.statusBarBottle.setPercentage((this.character.bottles / 10) * 100);
        return false;
      }
      return true;
    });
  }

  checkStompOnChicken() {
    this.level.enemies.forEach((enemy) => {
      if (enemy instanceof Chicken && !enemy.isDead) {
        if (this.character.isColliding(enemy) && this.isStomping(enemy)) {
          enemy.die();
          this.character.speedY = 15;
        }
      }
    });
  }

  checkBottleHitsChicken() {
    this.throwableObjects.forEach((bottle) => {
      this.level.enemies.forEach((enemy) => {
        if (enemy instanceof Chicken && !enemy.isDead) {
          if (bottle.isColliding(enemy)) {
            enemy.die();
            bottle.x = -9999;
          }
        }
      });
    });
    this.throwableObjects = this.throwableObjects.filter(b => b.x > -1000);
  }


  checkBossTrigger() {
    const boss = this.getBoss();
    if (!boss || boss.isDead) return;
    if (!boss.isActive && this.character.x > boss.x - 500) {
      boss.setActive();
      this.statusBarBoss.setPercentage(boss.energy);
    }
  }

  checkBoss() {
  const boss = this.getBoss();
  if (!boss || boss.isDead || boss.isRemoved) return;
  if (boss.isActive) {
    this.statusBarBoss.setPercentage(boss.energy);
  }
}

  checkBottleHitsBoss() {
    const boss = this.getBoss();
    if (!boss || boss.isDead || boss.isRemoved) return;
    this.throwableObjects.forEach((bottle) => {
      if (bottle.isColliding(boss)) {
        boss.hitBoss(20);
        this.statusBarBoss.setPercentage(boss.energy);
        bottle.x = -9999;
        if (boss.isDead) {
          setTimeout(() => boss.isRemoved = true, 1000);
        }
      }
    });

    this.throwableObjects = this.throwableObjects.filter(b => b.x > -1000);
  }
}