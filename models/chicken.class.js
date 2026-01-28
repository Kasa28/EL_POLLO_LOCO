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

  constructor() {
    super().loadImage(this.images_walking[0]);
    this.x = 200 + Math.random() * 500;
    this.loadImages(this.images_walking);
    this.loadImages(this.images_dead_chicken);
    this.speed = 0.15 + Math.random() * 0.25;
    this.animation_chicken();
  }


  die() {
  if (this.isDead) return;         
  this.isDead = true;
  this.img = this.imageCache[this.images_dead_chicken[0]];
  this.speed = 0;

  setTimeout(() => {
    this.isRemoved = true;          
  }, 1000);
}


  animation_chicken() {
    setInterval(() => {
      if (!this.isDead) this.moveLeft();
    }, 1000 / 60);

    setInterval(() => {
      if (!this.isDead) this.playAnimation(this.images_walking);
    }, 100);
  }
}