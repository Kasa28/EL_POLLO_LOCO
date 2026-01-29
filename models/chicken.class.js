class Chicken extends MovableObject {
  y = 330;
  height = 100;
  isDead = false;

  images_walking = [
    'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
    'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
    'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
  ];

  images_dead_chicken = [
    'img/3_enemies_chicken/chicken_normal/2_dead/dead.png'
  ];

  constructor(x) {
    super().loadImage(this.images_walking[0]);
    this.setStartPosition(x);
    this.loadChickenImages();
    this.setRandomSpeed();
    this.startChicken();
  }

  setStartPosition(x) {
    this.x = x;
  }

  loadChickenImages() {
    this.loadImages(this.images_walking);
    this.loadImages(this.images_dead_chicken);
  }

  setRandomSpeed() {
    this.speed = 0.15 + Math.random() * 0.25;
  }

  startChicken() {
    this.startMoveLeftLoop();
    this.startWalkAnimationLoop();
  }

  startMoveLeftLoop() {
    setInterval(() => this.moveLeftIfAlive(), 1000 / 60);
  }

  moveLeftIfAlive() {
    if (this.isDead) return;
    this.moveLeft(); 
  }

  startWalkAnimationLoop() {
    setInterval(() => this.playWalkAnimationIfAlive(), 100);
  }

  playWalkAnimationIfAlive() {
    if (this.isDead) return;
    this.playAnimation(this.images_walking);
  }

  die() {
    if (this.isDead) return;
    this.setDeadState();
    this.scheduleRemove();
  }

  setDeadState() {
    this.isDead = true;
    this.speed = 0;
    this.img = this.imageCache[this.images_dead_chicken[0]];
  }

  scheduleRemove() {
    setTimeout(() => this.removeChicken(), 1000);
  }

  removeChicken() {
    this.isRemoved = true;
  }
}