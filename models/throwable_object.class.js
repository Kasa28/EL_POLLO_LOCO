/**
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
  /** @type {number} */
  width = 50;
  /** @type {number} */
  height = 100;
  /** @type {number} */
  groundY = 450;

  /** @type {any|null} */
  world = null;

  /** @type {boolean} */
  hasHitEnemy = false;
  /** @type {boolean} */
  hasHitBoss = false;

  /**
   * @param {number} x
   * @param {number} y
   * @param {boolean} [throwRight=true]
   * @param {{ play?: (name:string)=>void, playOnce?: (name:string, cd?:number)=>void } | any} [sfx]
   */
  constructor(x, y, throwRight = true, sfx) {
    super().loadImage(throwable_assets.rotation[0]);
    this.loadImages(throwable_assets.rotation);
    this.loadImages(throwable_assets.splash);
    /** @type {any} */
    this.sfx = sfx;
    this.setStartPosition(x, y);
    this.setThrowDirection(throwRight);
    this.resetThrowPhysics();
    this.startFlying();
    this.startRotation();
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  setStartPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * @param {boolean} throwRight
   * @returns {void}
   */
  setThrowDirection(throwRight) {
    /** @type {number} */
    this.speedX = throwRight ? 10 : -10;
  }

  /** @returns {void} */
  resetThrowPhysics() {
    /** @type {boolean} */
    this.isSplashed = false;
    /** @type {number} */
    this.speedY = 18;
    /** @type {number} */
    this.gravity = 1.2;
  }

  /** @returns {void} */
  startFlying() {
    /** @type {number} */
    this.flyInterval = setInterval(() => this.updateFlightStep(), 25);
  }

  /** @returns {void} */
  updateFlightStep() {
    if (this.isSplashed) return;
    this.moveHorizontal();
    this.applyGravity();
    this.moveVertical();
    this.checkHits();
    this.trySplashOnGround();
  }

  /** @returns {void} */
  moveHorizontal() {
    this.x += this.speedX;
  }

  /** @returns {void} */
  moveVertical() {
    this.y -= this.speedY;
  }

  /** @returns {void} */
  applyGravity() {
    this.speedY -= this.gravity;
  }

  /** @returns {void} */
  trySplashOnGround() {
    if (!this.isFallingDown()) return;
    if (!this.hasHitGround()) return;
    this.splash();
  }

  /** @returns {boolean} */
  isFallingDown() {
    return this.speedY < 0;
  }

  /** @returns {boolean} */
  hasHitGround() {
    const bottom = this.y + this.height;
    return bottom >= this.groundY;
  }

  /** @returns {void} */
  startRotation() {
    /** @type {number} */
    this.rotInterval = setInterval(() => this.updateRotationFrame(), 80);
  }

  /** @returns {void} */
  updateRotationFrame() {
    if (this.isSplashed) return;
    this.playAnimation(throwable_assets.rotation);
  }

  /** @returns {void} */
  splash() {
    if (this.isSplashed) return;
    this.isSplashed = true;
    this.sfx?.play?.("breaking");
    this.stopFlightLoop();
    this.stopRotationLoop();
    this.startSplashAnimation();
    this.scheduleRemove();
  }

  /** @returns {void} */
  stopFlightLoop() {
    clearInterval(this.flyInterval);
  }

  /** @returns {void} */
  stopRotationLoop() {
    clearInterval(this.rotInterval);
  }

  /** @returns {void} */
  startSplashAnimation() {
    /** @type {number} */
    this.splashInterval = setInterval(() => {
      this.playAnimation(throwable_assets.splash);
    }, 60);
  }

  /** @returns {void} */
  scheduleRemove() {
    setTimeout(() => this.removeSplash(), 400);
  }

  /** @returns {void} */
  removeSplash() {
    clearInterval(this.splashInterval);
    /** @type {boolean} */
    this.isRemoved = true;
    this.x = -9999;
  }

  /** @returns {void} */
  checkHits() {
    if (!this.world) return;
    this.hitChickens();
    this.hitBoss();
  }

  /** @returns {void} */
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

  /** @returns {void} */
  hitBoss() {
    if (this.hasHitBoss) return;
    const boss = (this.world.level?.enemies || []).find((e) => e instanceof Endboss);
    if (!boss || boss.isDead || boss.isRemoved) return;
    if (!this.isColliding(boss)) return;
    this.hasHitBoss = true;
    boss.hitByBottle();
    this.splash();
  }
}
