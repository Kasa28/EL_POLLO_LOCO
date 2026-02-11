class ThrowableObject extends MovableObject {
  width = 50;
  height = 100;
  groundY = 450;
  world = null;
  hasHitEnemy = false;
  hasHitBoss = false;

  constructor(x, y, throwRight = true, sfx) {
    super().loadImage(throwable_assets.rotation[0]);
    this.loadImages(throwable_assets.rotation);
    this.loadImages(throwable_assets.splash);
    this.sfx = sfx;
    this.setStartPosition(x, y);
    this.setThrowDirection(throwRight);
    this.resetThrowPhysics();
    this.startFlying();
    this.startRotation();
  }

  setStartPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setThrowDirection(throwRight) {
    this.speedX = throwRight ? 10 : -10;
  }

  resetThrowPhysics() {
    this.isSplashed = false;
    this.speedY = 18;
    this.gravity = 1.2;
  }

  startFlying() {
    this.flyInterval = setInterval(() => this.updateFlightStep(), 25);
  }

  updateFlightStep() {
    if (this.isSplashed) return;
    this.moveHorizontal();
    this.applyGravity();
    this.moveVertical();
    this.checkHits();
    this.trySplashOnGround();
  }

  moveHorizontal() {
    this.x += this.speedX;
  }

  moveVertical() {
    this.y -= this.speedY;
  }

  applyGravity() {
    this.speedY -= this.gravity;
  }

  trySplashOnGround() {
    if (!this.isFallingDown()) return;
    if (!this.hasHitGround()) return;
    this.splash();
  }

  isFallingDown() {
    return this.speedY < 0;
  }

  hasHitGround() {
    const bottom = this.y + this.height;
    return bottom >= this.groundY;
  }

  startRotation() {
    this.rotInterval = setInterval(() => this.updateRotationFrame(), 80);
  }

  updateRotationFrame() {
    if (this.isSplashed) return;
    this.playAnimation(throwable_assets.rotation);
  }

  splash() {
    if (this.isSplashed) return;
    this.isSplashed = true;
    this.sfx?.play("breaking");
    this.stopFlightLoop();
    this.stopRotationLoop();
    this.startSplashAnimation();
    this.scheduleRemove();
  }

  stopFlightLoop() {
    clearInterval(this.flyInterval);
  }

  stopRotationLoop() {
    clearInterval(this.rotInterval);
  }

  startSplashAnimation() {
    this.splashInterval = setInterval(() => {
      this.playAnimation(throwable_assets.splash);
    }, 60);
  }

  scheduleRemove() {
    setTimeout(() => this.removeSplash(), 400);
  }

  removeSplash() {
    clearInterval(this.splashInterval);
    this.isRemoved = true;
    this.x = -9999;
  }

  checkHits() {
  if (!this.world) return;
  this.hitChickens();
  this.hitBoss();
}

hitChickens() {
  if (this.hasHitEnemy) return;
  const enemies = this.world.level?.enemies || [];
  for (const enemy of enemies) {
    if (!(enemy instanceof Chicken)) continue;
    if (enemy.isDead) continue;
    if (!this.isColliding(enemy)) continue;
    this.hasHitEnemy = true;
    enemy.die();           
    this.splash();
    return;
  }
}

hitBoss() {
  if (this.hasHitBoss) return;
  const boss = (this.world.level?.enemies || []).find(e => e instanceof Endboss);
  if (!boss || boss.isDead || boss.isRemoved) return;
  if (!this.isColliding(boss)) return;
  this.hasHitBoss = true;
  boss.hitBoss(2);
  this.splash();
}
}