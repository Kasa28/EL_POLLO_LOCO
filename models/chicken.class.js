class Chicken extends MovableObject {
  y = 330;
  height = 100;
  isDead = false;

  constructor(x) {
    super();
    this.loadImage(chicken_assets.walking[0]);
    this.x = x;
    this.loadChickenImages();
    this.setRandomSpeed();
    this.startChicken();
  }

  loadChickenImages() {
    this.loadImages(chicken_assets.walking);
    this.loadImages(chicken_assets.dead);
  }

  setRandomSpeed() {
    this.speed = 0.15 + Math.random() * 0.25;
  }

  startChicken() {
    this.startMoveLeftLoop();
    this.startWalkAnimationLoop();
  }

  startMoveLeftLoop() {
    setInterval(() => {
      if (!this.isDead) this.moveLeft();
    }, 1000 / 60);
  }

  startWalkAnimationLoop() {
    setInterval(() => {
      if (!this.isDead) this.playAnimation(chicken_assets.walking);
    }, 100);
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.speed = 0;
    this.img = this.imageCache[chicken_assets.dead[0]];
    setTimeout(() => (this.isRemoved = true), 1000);
    this.world?.sfx?.playOnce?.("chicken_dead", 150) 
  }
}
