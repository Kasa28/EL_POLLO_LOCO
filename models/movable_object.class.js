/**
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
  /** @type {number} */
  speed = 0.15;

  /** @type {boolean} */
  otherDirection = false;

  /** @type {number} */
  speedY = 0;

  /** @type {number} */
  acceleration = 3;

  /** @type {number} */
  energy = 100;

  /** @type {number} */
  lastHit = 0;

  /** @returns {void} */
  /** @returns {void} */
applyGravitaty() {
  const groundY = 130; 
  setInterval(() => {
    if (this.isAboveGround() || this.speedY > 0) {
      this.y -= this.speedY;
      this.speedY -= this.acceleration;
      if (this.y > groundY) {
        this.y = groundY;
        this.speedY = 0;
      }
    }
  }, 1000 / 25);
}

  /** @returns {boolean} */
  isAboveGround() {
    if (this instanceof ThrowableObject) {
      const groundY = 340;
      return this.y + this.height < groundY;
    }
    return this.y < 130;
  }

  /**
   * @param {number} [dmg=5]
   * @returns {void}
   */
  hit(dmg = 5) {
    if (this.isHurt()) return;
    this.energy -= dmg;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = Date.now();
    }
  }

  /** @returns {boolean} */
  isHurt() {
    return Date.now() - this.lastHit < 250;
  }

  /** @returns {boolean} */
  isDead() {
    return this.energy == 0;
  }

  /**
   * @param {string[]} images
   * @returns {void}
   */
  playAnimation(images) {
    const i = this.currentImage % images.length;
    const path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }

  /** @returns {void} */
  moveRight() {
    this.x += this.speed;
  }

  /** @returns {void} */
  moveLeft() {
    this.x -= this.speed;
  }

  /** @returns {void} */
  jump() {
    this.speedY = 40;
  }

  /**
 * @param {{x:number,y:number,width:number,height:number,offset?:{top:number,bottom:number,left:number,right:number}}} obj
 * @returns {boolean}
 */
isColliding(obj) {
  const a = this.getHitbox(this);
  const b = this.getHitbox(obj);
  return (
    a.right > b.left &&
    a.left < b.right &&
    a.bottom > b.top &&
    a.top < b.bottom
  );
}

/**
 * @param {{x:number,y:number,width:number,height:number,offset?:{top:number,bottom:number,left:number,right:number}}} o
 * @returns {{left:number,right:number,top:number,bottom:number}}
 */
getHitbox(o) {
  const off = o.offset ?? { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    left: o.x + off.left,
    right: o.x + o.width - off.right,
    top: o.y + off.top,
    bottom: o.y + o.height - off.bottom,
  };
}
}
