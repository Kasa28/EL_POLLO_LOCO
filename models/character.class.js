class Character extends MovableObject {
  height = 300;
  y = 80;
  speed = 8;
  images_walking = CHARACTER_ASSETS.walking;
  images_jumping = CHARACTER_ASSETS.jumping;
  images_dead = CHARACTER_ASSETS.dead;
  images_hurt = CHARACTER_ASSETS.hurt;
  images_long_idle = CHARACTER_ASSETS.longIdle;
  images_idle = CHARACTER_ASSETS.idle;
  idleTime = 0;
  idleMode = "normal";
  lastIdleFrame = 0;
  energy = 100;
  coins = 0;
  bottles = 0;
  world;
  damage = 20;
  throwBottles = [];
  offset = { top: 120, bottom: 30, left: 40, right: 30 };
  deadFrame = 0;
  deadPlayedOnce = false;

  constructor() {
    super().loadImage(CHARACTER_ASSETS.startImage);
    this.loadImages(this.images_walking);
    this.loadImages(this.images_jumping);
    this.loadImages(this.images_dead);
    this.loadImages(this.images_hurt);
    this.loadImages(this.images_long_idle);
    this.loadImages(this.images_idle);
  }

  start() {
    this.applyGravitaty();
    this.animation();
  }

  animation() {
    setInterval(() => this.handleMovement(), 1000 / 60);
    setInterval(() => this.handleAnimations(), 50);
  }

  handleMovement() {
    if (this.isDead()) return;
    if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end) {
      this.moveRight();
      this.otherDirection = false;
    }
    if (this.world.keyboard.LEFT && this.x > 0) {
      this.otherDirection = true;
      this.moveLeft();
    }
    this.world.camera_x = -this.x + 100;
  }

  handleAnimations() {
    if (this.isDead()) return this.playDeadOnce();
    if (this.isHurt()) return this.playAnimation(this.images_hurt);
    if (this.isAboveGround()) return this.playAnimation(this.images_jumping);
    this.handleGroundState();
  }

  handleGroundState() {
    if (this.world.keyboard.UP && !this.isAboveGround()) this.jump();
    if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
      this.playAnimation(this.images_walking);
      this.resetIdle();
    } else {
      this.handleIdle();
    }
  }

  handleIdle() {
    this.idleTime += 50;
    const now = Date.now();
    if (now - this.lastIdleFrame < 500) return;
    if (this.idleTime > 20000) this.playAnimation(this.images_long_idle);
    else this.playAnimation(this.images_idle);
    this.lastIdleFrame = now;
  }

  resetIdle() {
    this.idleTime = 0;
    this.lastIdleFrame = 0;
  }

  jump() {
    this.resetIdle();
    this.speedY = 30;
    this.world.sfx.playOnce("jumping_audio", 250);
  }

  playDeadOnce() {
    if (this.deadPlayedOnce) return;
    const lastIndex = this.images_dead.length - 1;
    const i = Math.min(this.deadFrame, lastIndex);
    this.img = this.imageCache[this.images_dead[i]];
    if (this.deadFrame < lastIndex) this.deadFrame++;
    else this.deadPlayedOnce = true;
  }
}