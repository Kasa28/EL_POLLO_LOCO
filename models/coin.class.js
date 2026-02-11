/**
 * Collectible coin object.
 * @extends MovableObject
 */
class Coin extends MovableObject {
  /** @type {number} */
  width = 80;

  /** @type {number} */
  height = 80;

  /**
   * Creates a coin at a given position or at a random position if not provided.
   * @param {number} [x] - Initial x-position. If omitted, a random x is used.
   * @param {number} [y] - Initial y-position. If omitted, a random y is used.
   */
  constructor(x, y) {
    super();
    this.loadImage(coin_assets.icon);
    /** @type {number} */
    this.x = x ?? (200 + Math.random() * 1800);
    /** @type {number} */
    this.y = y ?? (80 + Math.random() * 120);
  }
}
