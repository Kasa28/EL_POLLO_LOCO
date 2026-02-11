/**
 * Base drawable entity with image loading, drawing and basic collision helpers.
 */
class DrawableObject {
  /** @type {HTMLImageElement | undefined} */
  img;

  /** @type {Object.<string, HTMLImageElement>} */
  imageCache = [];

  /** @type {number} */
  currentImage = 0;

  /** @type {number} */
  x = 90;

  /** @type {number} */
  y = 270;

  /** @type {number} */
  height = 150;

  /** @type {number} */
  width = 100;

  /**
   * @param {string} path
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    if (!this.img) return;
    const pulsing = Date.now() < this.pulseUntil;
    if (!pulsing) return ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.PULSE_SCALE, this.PULSE_SCALE);
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  drawFrame(ctx) {
    if (this instanceof Character || this instanceof Chicken) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    }
  }

  /**
   * @param {string[]} arrays
   * @returns {void}
   */
  loadImages(arrays) {
    arrays.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /**
   * @param {{ getHitbox?: () => {x:number,y:number,w:number,h:number} } | {x:number,y:number,w:number,h:number}} mo
   * @returns {boolean}
   */
  isColliding(mo) {
    const a = this.getHitbox();
    const b = mo.getHitbox ? mo.getHitbox() : mo;
    return (
      a.x + a.w > b.x &&
      a.y + a.h > b.y &&
      a.x < b.x + b.w &&
      a.y < b.y + b.h
    );
  }

  /**
   * @returns {{x:number,y:number,w:number,h:number}}
   */
  getHitbox() {
    const o = this.offset || { top: 0, right: 0, bottom: 0, left: 0 };
    return {
      x: this.x + o.left,
      y: this.y + o.top,
      w: this.width - o.left - o.right,
      h: this.height - o.top - o.bottom,
    };
  }
}
