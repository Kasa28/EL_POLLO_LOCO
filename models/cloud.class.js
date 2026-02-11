/**
 * Moving cloud background object.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
  /** @type {number} */
  y = 20;

  /** @type {number} */
  width = 450;

  /** @type {number} */
  height = 250;

  /** @type {number} */
  static LEVEL_END = 4000;

  /** @type {number} */
  static SPAWN_GAP = 350;

  /** @type {number} */
  static nextX = 0;

  /**
   * Creates a cloud with a random sprite, spawn position, and speed.
   */
  constructor() {
    super();
    const img =
      cloud_assets.images[Math.floor(Math.random() * cloud_assets.images.length)];
    this.loadImage(img);
    /** @type {number} */
    this.x = Cloud.spawnX();
    /** @type {number} */
    this.speed = 0.2 + Math.random() * 0.3;
    this.startMoving();
    /** @type {boolean} */
    this.otherDirection = false;
  }

  /**
   * Calculates the next spawn x-position with jitter and spacing.
   * @returns {number}
   */
  static spawnX() {
    if (Cloud.nextX === 0) Cloud.nextX = Math.random() * 400;
    const jitter = (Math.random() - 0.5) * 180;
    const x = Cloud.nextX + jitter;
    Cloud.nextX += Cloud.SPAWN_GAP;
    return x;
  }

  /**
   * Starts the movement loop (~60 FPS).
   * @returns {void}
   */
  startMoving() {
    setInterval(() => this.updateMove(), 1000 / 60);
  }

  /**
   * Updates cloud movement and wraps it to the right when it leaves the screen.
   * Expects `this.world.camera_x` and `this.world.canvas.width` to exist.
   * @returns {void}
   */
  updateMove() {
    this.moveLeft();
    if (this.x < -this.width) {
      const rightEdge = -this.world.camera_x + this.world.canvas.width;
      this.x = rightEdge + 200 + Math.random() * 400;
    }
  }
}
