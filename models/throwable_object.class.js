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

  speedX = 10;
  isSplashed = false;
  groundY = 450;

  constructor(x, y, throwRight = true) {
    super().loadImage(this.images_rotation[0]);
    this.loadImages(this.images_rotation);
    this.loadImages(this.images_splash);
    this.x = x;
    this.y = y;
    this.speedy;
    this.throw();
    this.playRotation();
  }

  throw() {
  this.isSplashed = false;
  this.speedy = 18;         
  const gravity = 1.2;      
  this.flyInterval = setInterval(() => {
    if (this.isSplashed) return;
    this.x += this.speedX;
    this.y -= this.speedy;
    this.speedy -= gravity;
    this.checkGroundHit();
  }, 25);
}

  playRotation() {
    this.rotInterval = setInterval(() => {
      if (this.isSplashed) return;
      this.playAnimation(this.images_rotation);
    }, 80);
  }

checkGroundHit() {
  if (this.isSplashed) return;
  const bottom = this.y + this.height;
  const fallingDown = this.speedy < 0;   
  if (fallingDown && bottom >= this.groundY) this.splash();
}

  splash() {
    if (this.isSplashed) return;
    this.isSplashed = true;
    clearInterval(this.flyInterval);
    clearInterval(this.rotInterval);
    this.splashInterval = setInterval(() => {
      this.playAnimation(this.images_splash);
    }, 60);
    setTimeout(() => {
      clearInterval(this.splashInterval);
      this.isRemoved = true;
      this.x = -9999;
    }, 400);
  }
}