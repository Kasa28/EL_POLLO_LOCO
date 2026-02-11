/**
 * @extends DrawableObject
 */
class StatusBar extends DrawableObject {
  /** @type {string[]} */
  images;

  /** @type {number} */
  percentage = 0;

  /**
   * @param {string[]} images
   * @param {number} x
   * @param {number} y
   * @param {number} [startValue=0]
   * @param {number} [maxValue=100]
   */
  constructor(images, x, y, startValue = 0, maxValue = 100) {
    super();
    this.images = images;
    this.loadImages(this.images);
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {number} */
    this.width = 200;
    /** @type {number} */
    this.height = 60;
    /** @type {number} */
    this.maxValue = maxValue;
    this.setValue(startValue, maxValue);
  }

  /**
   * @param {number} value
   * @param {number} [maxValue=this.maxValue]
   * @returns {number}
   */
  setValue(value, maxValue = this.maxValue) {
    this.maxValue = maxValue;
    const v = this.clamp(value, 0, maxValue);
    const pct = maxValue <= 0 ? 0 : (v / maxValue) * 100;
    this.setPercentage(pct);
    return v;
  }

  /**
   * @param {number} percentage
   * @returns {void}
   */
  setPercentage(percentage) {
    this.percentage = this.clamp(percentage, 0, 100);
    const path = this.images[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /** @returns {number} */
  resolveImageIndex() {
    const maxIndex = this.images.length - 1;
    if (this.percentage <= 0) return 0;
    const idx = Math.floor((this.percentage / 100) * maxIndex);
    return this.clamp(idx, 0, maxIndex);
  }

  /**
   * @param {number} n
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
}
