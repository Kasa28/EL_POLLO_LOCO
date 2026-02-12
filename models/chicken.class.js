/**
 * Enemy chicken that walks left with a random speed and can die.
 * Extends MovableObject (movement, image loading, animation).
 * @extends MovableObject
 */
class Chicken extends MovableObject {
  /** @type {number} Vertical position on canvas. */
  y = 330;

  /** @type {number} Render height in px. */
  height = 110;

  /** @type {boolean} Whether the chicken is dead (stops moving/animating). */
  isDead = false;
  offset = { top: 20, bottom: 10, left: 20, right: 12 };
  /**
   * Creates a chicken at the given x-position.
   * @param {number} x - Initial horizontal position.
   */
  constructor(x) {
    super();
    this.loadImage(chicken_assets.walking[0]);
    /** @type {number} Horizontal position on canvas. */
    this.x = x;
    this.loadChickenImages();
    this.setRandomSpeed();
    this.startChicken();
  }

  /**
   * Preloads all chicken sprites (walking + dead).
   * @returns {void}
   */
  loadChickenImages() {
    this.loadImages(chicken_assets.walking);
    this.loadImages(chicken_assets.dead);
  }

  /**
   * Sets a random movement speed for the chicken.
   * Range: 0.15 .. 0.40
   * @returns {void}
   */
  setRandomSpeed() {
    this.speed = 0.15 + Math.random() * 0.25;
  }

  /**
   * Starts movement and walking animation loops.
   * @returns {void}
   */
  startChicken() {
    this.startMoveLeftLoop();
    this.startWalkAnimationLoop();
  }

  /**
   * Moves the chicken left at ~60 FPS while alive.
   * @returns {void}
   */
  startMoveLeftLoop() {
    setInterval(() => {
      if (!this.isDead) this.moveLeft();
    }, 1000 / 60);
  }

  /**
   * Plays walking animation while alive.
   * @returns {void}
   */
  startWalkAnimationLoop() {
    setInterval(() => {
      if (!this.isDead) this.playAnimation(chicken_assets.walking);
    }, 100);
  }

  /**
   * Kills the chicken, switches sprite to dead image,
   * stops movement, marks it for removal after 1s and plays SFX (if available).
   * @returns {void}
   */
  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.speed = 0;
    /** @type {HTMLImageElement} */
    this.img = this.imageCache[chicken_assets.dead[0]];
    /** @type {boolean} Flag used by the world/game loop to remove this enemy. */
    setTimeout(() => (this.isRemoved = true), 1000);
    this.world?.sfx?.playOnce?.("chicken_dead", 150);
  }
}