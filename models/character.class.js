/**
 * Player character entity with movement, animation state handling,
 * idle logic, damage/energy, and bottle throwing.
 *
 * @class
 * @extends MovableObject
 */
class Character extends MovableObject {
  height = 300;
  y = 80;
  speed = 8;
  width = 100;
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
  /** @type {any} */
  world;
  /** @type {any} */
  sfx;
  offset = { top: 130, bottom: 2, left: 0, right: 0 };
  deadFrame = 0;
  deadPlayedOnce = false;
  THROW_COOLDOWN = 500;
  lastThrow = 0;
  wasAboveGround = false;
  jumpFrame = 0;
  jumpAnimDone = false;
  lastJumpFrameAt = 0;
  JUMP_FRAME_MS = 130; 
  JUMP_SPEED = 35;     
  canJump = true;      
  accelereration = 4;
  /**
   * @param {any} sfx Sound effects handler
   */
  constructor(sfx) {
    super().loadImage(CHARACTER_ASSETS.startImage);
    this.sfx = sfx;
    this.preloadAll();
  }

  /** @returns {void} */
  start() {
    this.applyGravitaty();
    setInterval(() => this.tickMove(), 1000 / 60);
    setInterval(() => this.tickAnim(), 70);
  }

  /** @returns {void} */
  tickMove() {
    if (this.isDead()) return;
    this.moveByKeys();
    this.world.camera_x = -this.x + 100;
  }

  /** @returns {void} */
  tickAnim() {
    const above = this.isAboveGround();
    const t = this.now();
    this.updateJumpAnimState(above, t);
    if (this.playDeadState()) return;
    this.tryThrow();
    if (this.playHurtState()) return;
    if (this.playAirState(above, t)) return;
    this.playGroundState();
  }

  /** @returns {any|undefined} */
  kb() {
    return this.world?.keyboard;
  }

  /** @returns {number} */
  now() {
    return Date.now();
  }

  /** @returns {void} */
  preloadAll() {
    [
      this.images_walking,
      this.images_jumping,
      this.images_dead,
      this.images_hurt,
      this.images_long_idle,
      this.images_idle,
    ].forEach((list) => this.loadImages(list));
  }

  /** @returns {void} */
  moveByKeys() {
    const k = this.kb();
    if (!k) return;

    if (k.RIGHT) this.moveRightIfPossible();
    if (k.LEFT) this.moveLeftIfPossible();
  }

  /** @returns {void} */
  moveRightIfPossible() {
    if (this.x >= this.world.level.level_end) return;
    this.moveRight();
    this.otherDirection = false;
  }

  /** @returns {void} */
  moveLeftIfPossible() {
    if (this.x <= 0) return;
    this.moveLeft();
    this.otherDirection = true;
  }

  /** @returns {void} */
  stopWalk() {
    this.sfx.stopLoop("walk");
  }

  /** @returns {void} */
  resetIdle() {
    this.idleTime = 0;
    this.lastIdleFrame = 0;
  }

  /** @returns {boolean} */
  playDeadState() {
    if (!this.isDead()) return false;
    this.stopWalk();
    this.playDeadOnce();
    return true;
  }

  /** @returns {boolean} */
  playHurtState() {
    if (!this.isHurt()) return false;
    this.stopWalk();
    this.resetIdle();
    this.playAnimation(this.images_hurt);
    return true;
  }

  /**
   * Air/jump animation (Frames 1x, dann letzter Frame bis Landung)
   * @param {boolean} above
   * @param {number} t
   * @returns {boolean}
   */
  playAirState(above, t) {
    if (!above) return false;
    this.stopWalk();
    this.resetIdle();
    this.applyJumpFrame(t);
    return true;
  }

  /** @returns {void} */
  playGroundState() {
    if (this.wantJump()) return this.jump();
    if (this.wantWalk()) return this.walk();
    this.idle();
  }

  /** @returns {boolean} */
  wantWalk() {
    const k = this.kb();
    return !!k && (k.RIGHT || k.LEFT);
  }

  /** @returns {boolean} */
  wantThrow() {
    return !!this.kb()?.D;
  }

  /** @returns {boolean} */
  wantJump() {
    const k = this.kb();
    if (!k) return false;
    if (!k.UP) this.canJump = true;
    return k.UP && this.canJump && !this.isAboveGround();
  }

  /** @returns {void} */
  walk() {
    this.playAnimation(this.images_walking);
    this.resetIdle();
    this.sfx.playLoop("walking_audio", "walk");
  }

  /** @returns {void} */
  idle() {
    this.stopWalk();
    this.idleTime += 50;
    const t = this.now();
    if (t - this.lastIdleFrame < 500) return;
    const list = this.idleTime > 4000 ? this.images_long_idle : this.images_idle;
    this.playAnimation(list);
    this.lastIdleFrame = t;
  }

  /** @returns {void} */
  jump() {
    this.canJump = false; 
    this.resetIdle();
    this.stopWalk();
    this.resetJumpAnimState(this.now());
    this.speedY = this.JUMP_SPEED;
    this.sfx.playOnce("jumping_audio", 250);
  }

  /**
   * Reset Jump-State nur bei Transition (ground<->air)
   * @param {boolean} above
   * @param {number} t
   * @returns {void}
   */
  updateJumpAnimState(above, t) {
    if (above === this.wasAboveGround) return;
    this.resetJumpAnimState(t);
    this.wasAboveGround = above;
  }

  /**
   * @param {number} t
   * @returns {void}
   */
  resetJumpAnimState(t) {
    this.jumpFrame = 0;
    this.jumpAnimDone = false;
    this.lastJumpFrameAt = t;
  }

  /**
   * Frame-Advance nur alle JUMP_FRAME_MS ms
   * @param {number} t
   * @returns {void}
   */
  applyJumpFrame(t) {
    const last = this.images_jumping.length - 1;
    if (!this.jumpAnimDone && t - this.lastJumpFrameAt >= this.JUMP_FRAME_MS) {
      this.jumpFrame = Math.min(this.jumpFrame + 1, last);
      this.lastJumpFrameAt = t;
      if (this.jumpFrame === last) this.jumpAnimDone = true;
    }
    const path = this.images_jumping[this.jumpFrame];
    this.img = this.imageCache[path];
  }


  /** @returns {boolean} */
  throwReady() {
    return (
      this.world &&
      this.bottles > 0 &&
      this.wantThrow() &&
      this.now() - this.lastThrow > this.THROW_COOLDOWN
    );
  }

  /** @returns {void} */
  tryThrow() {
    if (!this.throwReady()) return;
    this.spawnBottle();
    this.consumeBottle();
    this.lastThrow = this.now();
  }

  /** @returns {void} */
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

  /** @returns {void} */
  consumeBottle() {
    this.bottles = Math.max(0, this.bottles - 1);
    this.world?.hud?.update();
  }


  /** @returns {void} */
  playDeadOnce() {
    if (this.deadPlayedOnce) return;
    const last = this.images_dead.length - 1;
    const idx = Math.min(this.deadFrame, last);
    this.img = this.imageCache[this.images_dead[idx]];
    this.deadFrame++;
    if (this.deadFrame >= last) this.deadPlayedOnce = true;
  }

  /**
   * @param {number} [dmg=1]
   * @returns {void}
   */
  hit(dmg = 1) {
    if (this.isHurt()) return;
    this.energy = Math.max(0, this.energy - dmg);
    this.lastHit = this.now();
  }
}