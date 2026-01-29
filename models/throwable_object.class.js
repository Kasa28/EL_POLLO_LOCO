class ThrowableObject extends MovableObject {
  width = 50;
  height = 100;

  images_rotation = [
    "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
  ];

  images_splash = [
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png"
  ];

  groundY = 450;

  constructor(x, y, throwRight = true) {
    super().loadImage(this.images_rotation[0]);
    this.loadImages(this.images_rotation);
    this.loadImages(this.images_splash);
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
    this.moveVertical();
    this.applyGravity();
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
    this.playAnimation(this.images_rotation);
  }

  splash() {
    if (this.isSplashed) return;
    this.isSplashed = true;

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
      this.playAnimation(this.images_splash);
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
}