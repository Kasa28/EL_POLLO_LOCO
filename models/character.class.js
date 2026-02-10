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
  lastIdleFrame = 0;
  energy = 6;
  coins = 0;
  bottles = 0;
  world;
  sfx;
  offset = { top: 90, bottom: 5, left: 10, right: 30 };
  deadFrame = 0;
  deadPlayedOnce = false;
  THROW_COOLDOWN = 500;
  lastThrow = 0;

  constructor(sfx) {
    super().loadImage(CHARACTER_ASSETS.startImage);
    this.sfx = sfx;
    this.preloadAll();
  }

  start() {
    this.applyGravitaty();
    setInterval(() => this.tickMove(), 1000 / 60);
    setInterval(() => this.tickAnim(), 50);
  }

  tickMove() {
    if (this.isDead()) return;
    this.moveByKeys();
    this.updateCamera();
  }

  tickAnim() {
    if (this.playDeadState()) return;
    this.tryThrow();
    if (this.playHurtState()) return;
    if (this.playAirState()) return;
    this.playGroundState();
  }

  kb() { 
    return this.world?.keyboard; 
  }

  stopWalk() { 
    this.sfx.stopLoop("walk"); 
  }

  resetIdle() { 
    this.idleTime = 0; this.lastIdleFrame = 0;
   }

  now() {
     return Date.now(); 
    }

  preloadAll() {
    [this.images_walking, this.images_jumping, this.images_dead, this.images_hurt, this.images_long_idle, this.images_idle]
      .forEach(list => this.loadImages(list));
  }

  moveByKeys() {
    const k = this.kb();
    if (k.RIGHT) this.moveRightIfPossible();
    if (k.LEFT) this.moveLeftIfPossible();
  }

  moveRightIfPossible() {
    if (this.x >= this.world.level.level_end) return;
    this.moveRight();
    this.otherDirection = false;
  }

  moveLeftIfPossible() {
    if (this.x <= 0) return;
    this.moveLeft();
    this.otherDirection = true;
  }

  updateCamera() {
    this.world.camera_x = -this.x + 100;
  }

  playDeadState() {
    if (!this.isDead()) return false;
    this.stopWalk();
    this.playDeadOnce();
    return true;
  }

  playHurtState() {
    if (!this.isHurt()) return false;
    this.stopWalk();
    this.resetIdle();
    this.playAnimation(this.images_hurt);
    return true;
  }

  playAirState() {
    if (!this.isAboveGround()) return false;
    this.stopWalk();
    this.playAnimation(this.images_jumping);
    return true;
  }

  playGroundState() {
    if (this.wantJump()) return this.jump();
    if (this.wantWalk()) return this.walk();
    this.idle();
  }

  wantJump() {
     return this.kb().UP && !this.isAboveGround();
  }

  wantWalk() {
     const k = this.kb(); return k.RIGHT || k.LEFT; 
  }

  wantThrow() { 
    return this.kb().D; 
  }

  walk() {
    this.playAnimation(this.images_walking);
    this.resetIdle();
    this.sfx.playLoop("walking_audio", "walk");
  }

  idle() {
    this.stopWalk();
    this.idleTime += 50;
    const t = this.now();
    if (t - this.lastIdleFrame < 500) return;
    this.playAnimation(this.idleTime > 20000 ? this.images_long_idle : this.images_idle);
    this.lastIdleFrame = t;
  }

  jump() {
    this.resetIdle();
    this.stopWalk();
    this.speedY = 30;
    this.sfx.playOnce("jumping_audio", 250);
  }

  throwReady() {
    return this.world &&
      this.bottles > 0 &&
      this.wantThrow() &&
      (this.now() - this.lastThrow > this.THROW_COOLDOWN);
  }

  tryThrow() {
    if (!this.throwReady()) return;
    this.spawnBottle();
    this.consumeBottle();
    this.lastThrow = this.now();
  }

  spawnBottle() {
    const right = !this.otherDirection;
    const bottle = new ThrowableObject(
      right ? this.x + 100 : this.x - 20,
      this.y + 120,
      right,
      this.sfx
    );
    bottle.world = this.world;
    this.world.throwableObjects.push(bottle);
    this.sfx.playThrow();
  }

  consumeBottle() {
    this.bottles = Math.max(0, this.bottles - 1);
    this.world.updateBottleBar();
  }

  playDeadOnce() {
    if (this.deadPlayedOnce) return;
    const last = this.images_dead.length - 1;
    this.img = this.imageCache[this.images_dead[Math.min(this.deadFrame, last)]];
    this.deadPlayedOnce = this.deadFrame++ >= last;
  }

  hit(dmg = 1) {
    if (this.isHurt()) return;
    this.energy = Math.max(0, this.energy - dmg);
    this.lastHit = this.now();
  }
}