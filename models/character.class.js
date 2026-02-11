/**
 * Player character entity with movement, animation state handling,
 * idle logic, damage/energy, and bottle throwing.
 *
 * @class
 * @extends MovableObject
 */
class Character extends MovableObject {
  /** @type {number} Rendered height in pixels. */
  height = 300;

  /** @type {number} Initial Y position (top-left). */
  y = 80;

  /** @type {number} Horizontal movement speed. */
  speed = 8;

  /** @type {string[]} Sprite paths for walking animation. */
  images_walking = CHARACTER_ASSETS.walking;

  /** @type {string[]} Sprite paths for jumping animation. */
  images_jumping = CHARACTER_ASSETS.jumping;

  /** @type {string[]} Sprite paths for dead animation. */
  images_dead = CHARACTER_ASSETS.dead;

  /** @type {string[]} Sprite paths for hurt animation. */
  images_hurt = CHARACTER_ASSETS.hurt;

  /** @type {string[]} Sprite paths for long-idle animation. */
  images_long_idle = CHARACTER_ASSETS.longIdle;

  /** @type {string[]} Sprite paths for idle animation. */
  images_idle = CHARACTER_ASSETS.idle;

  /** @type {number} Accumulated idle time in ms (increments by tick interval). */
  idleTime = 0;

  /** @type {number} Timestamp (ms) of last idle frame update. */
  lastIdleFrame = 0;

  /** @type {number} Character energy/health points. */
  energy = 6;

  /** @type {number} Collected coins count. */
  coins = 0;

  /** @type {number} Collected bottles count (ammo for throwing). */
  bottles = 0;

  /**
   * Reference to the current game world.
   * Set externally after construction.
   * @type {any}  // Replace "any" with your real World type if you have one.
   */
  world;

  /**
   * Sound effects handler used by the character.
   * @type {any} // Replace with a concrete typedef/interface if you want.
   */
  sfx;

  /**
   * Collision offsets for hitboxes (in px).
   * @type {{top:number, bottom:number, left:number, right:number}}
   */
  offset = { top: 90, bottom: 5, left: 10, right: 30 };

  /** @type {number} Current index/frame counter for dead sprite. */
  deadFrame = 0;

  /** @type {boolean} Whether the dead animation has been applied once. */
  deadPlayedOnce = false;

  /** @type {number} Throw cooldown duration in ms. */
  THROW_COOLDOWN = 500;

  /** @type {number} Timestamp (ms) of last successful throw. */
  lastThrow = 0;

  /**
   * Create a new Character.
   * @param {any} sfx Sound effects handler (must support stopLoop/playLoop/playOnce/playThrow).
   */
  constructor(sfx) {
    super().loadImage(CHARACTER_ASSETS.startImage);
    this.sfx = sfx;
    this.preloadAll();
  }

  /**
   * Starts the character logic loops (gravity, movement tick, animation tick).
   * NOTE: This spawns intervals; ensure you clear them elsewhere if needed.
   * @returns {void}
   */
  start() {
    this.applyGravitaty();
    setInterval(() => this.tickMove(), 1000 / 60);
    setInterval(() => this.tickAnim(), 50);
  }

  /**
   * Movement tick: reads inputs, moves, and updates camera.
   * @returns {void}
   */
  tickMove() {
    if (this.isDead()) return;
    this.moveByKeys();
    this.updateCamera();
  }

  /**
   * Animation/state tick: dead -> throw -> hurt -> air -> ground
   * @returns {void}
   */
  tickAnim() {
    if (this.playDeadState()) return;
    this.tryThrow();
    if (this.playHurtState()) return;
    if (this.playAirState()) return;
    this.playGroundState();
  }

  /**
   * Keyboard shortcut helper.
   * @returns {any|undefined} The world's keyboard object if available.
   */
  kb() {
    return this.world?.keyboard;
  }

  /**
   * Stops walking loop sound.
   * @returns {void}
   */
  stopWalk() {
    this.sfx.stopLoop("walk");
  }

  /**
   * Resets idle timers/counters.
   * @returns {void}
   */
  resetIdle() {
    this.idleTime = 0;
    this.lastIdleFrame = 0;
  }

  /**
   * Timestamp helper.
   * @returns {number} Current timestamp in ms.
   */
  now() {
    return Date.now();
  }

  /**
   * Preloads all animation image lists into the cache.
   * @returns {void}
   */
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

  /**
   * Handles horizontal movement based on pressed keys.
   * @returns {void}
   */
  moveByKeys() {
    const k = this.kb();
    if (k.RIGHT) this.moveRightIfPossible();
    if (k.LEFT) this.moveLeftIfPossible();
  }

  /**
   * Moves right if not beyond the level end.
   * @returns {void}
   */
  moveRightIfPossible() {
    if (this.x >= this.world.level.level_end) return;
    this.moveRight();
    this.otherDirection = false;
  }

  /**
   * Moves left if not beyond the level start.
   * @returns {void}
   */
  moveLeftIfPossible() {
    if (this.x <= 0) return;
    this.moveLeft();
    this.otherDirection = true;
  }

  /**
   * Updates the camera offset based on the character position.
   * @returns {void}
   */
  updateCamera() {
    this.world.camera_x = -this.x + 100;
  }

  /**
   * Plays dead state (once) if character is dead.
   * @returns {boolean} True if dead state handled and should short-circuit the tick.
   */
  playDeadState() {
    if (!this.isDead()) return false;
    this.stopWalk();
    this.playDeadOnce();
    return true;
  }

  /**
   * Plays hurt animation if character is hurt.
   * @returns {boolean} True if hurt state handled and should short-circuit the tick.
   */
  playHurtState() {
    if (!this.isHurt()) return false;
    this.stopWalk();
    this.resetIdle();
    this.playAnimation(this.images_hurt);
    return true;
  }

  /**
   * Plays air/jump animation if character is above ground.
   * @returns {boolean} True if air state handled and should short-circuit the tick.
   */
  playAirState() {
    if (!this.isAboveGround()) return false;
    this.stopWalk();
    this.playAnimation(this.images_jumping);
    return true;
  }

  /**
   * Ground state behavior: jump, walk, or idle.
   * @returns {void}
   */
  playGroundState() {
    if (this.wantJump()) return this.jump();
    if (this.wantWalk()) return this.walk();
    this.idle();
  }

  /**
   * Whether jump is requested (UP pressed and on ground).
   * @returns {boolean}
   */
  wantJump() {
    return this.kb().UP && !this.isAboveGround();
  }

  /**
   * Whether walking is requested (LEFT or RIGHT).
   * @returns {boolean}
   */
  wantWalk() {
    const k = this.kb();
    return k.RIGHT || k.LEFT;
  }

  /**
   * Whether throwing is requested (D key).
   * @returns {boolean}
   */
  wantThrow() {
    return this.kb().D;
  }

  /**
   * Plays walking animation and walking loop sound.
   * @returns {void}
   */
  walk() {
    this.playAnimation(this.images_walking);
    this.resetIdle();
    this.sfx.playLoop("walking_audio", "walk");
  }

  /**
   * Idle behavior: updates idle time and plays idle/long-idle animations.
   * Throttles frame updates to max every 500ms.
   * @returns {void}
   */
  idle() {
    this.stopWalk();
    this.idleTime += 50;
    const t = this.now();
    if (t - this.lastIdleFrame < 500) return;

    this.playAnimation(
      this.idleTime > 20000 ? this.images_long_idle : this.images_idle
    );
    this.lastIdleFrame = t;
  }

  /**
   * Initiates jump: sets vertical speed and plays jump sound.
   * @returns {void}
   */
  jump() {
    this.resetIdle();
    this.stopWalk();
    this.speedY = 30;
    this.sfx.playOnce("jumping_audio", 250);
  }

  /**
   * Checks whether throwing is currently allowed.
   * Requires world, bottles > 0, throw input, and cooldown passed.
   * @returns {boolean}
   */
  throwReady() {
    return (
      this.world &&
      this.bottles > 0 &&
      this.wantThrow() &&
      this.now() - this.lastThrow > this.THROW_COOLDOWN
    );
  }

  /**
   * Attempts to throw a bottle if ready.
   * @returns {void}
   */
  tryThrow() {
    if (!this.throwReady()) return;
    this.spawnBottle();
    this.consumeBottle();
    this.lastThrow = this.now();
  }

  /**
   * Creates and registers a new ThrowableObject in the world.
   * @returns {void}
   */
  spawnBottle() {
    const right = !this.otherDirection;

    /** @type {ThrowableObject} */
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

  /**
   * Decreases bottle ammo and updates HUD.
   * @returns {void}
   */
  consumeBottle() {
    this.bottles = Math.max(0, this.bottles - 1);
    this.world?.hud?.update();
  }

  /**
   * Applies the dead image frame once (stays on last frame after finishing).
   * @returns {void}
   */
  playDeadOnce() {
    if (this.deadPlayedOnce) return;
    const last = this.images_dead.length - 1;
    this.img =
      this.imageCache[this.images_dead[Math.min(this.deadFrame, last)]];
    this.deadPlayedOnce = this.deadFrame++ >= last;
  }

  /**
   * Applies damage to the character unless currently hurt.
   * @param {number} [dmg=1] Damage amount.
   * @returns {void}
   */
  hit(dmg = 1) {
    if (this.isHurt()) return;
    this.energy = Math.max(0, this.energy - dmg);
    this.lastHit = this.now();
  }
}
