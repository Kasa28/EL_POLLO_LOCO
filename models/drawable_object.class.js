class DrawableObject {
    img;
    imageCache = [];
    currentImage = 0;
    x = 90;
    y = 270;
    height = 150;
    width = 100;


loadImage(path) {
    this.img = new Image(); 
    this.img.src = path;
}

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

drawFrame(ctx) {
    if(this instanceof Character || this instanceof Chicken) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    }
}

loadImages(arrays) {
arrays.forEach((path) =>{
let img = new Image();
img.src = path;
this.imageCache[path] = img;
})
}

isColliding(mo) {
  const a = this.getHitbox();
  const b = mo.getHitbox ? mo.getHitbox() : mo;
  return a.x + a.w > b.x &&
         a.y + a.h > b.y &&
         a.x < b.x + b.w &&
         a.y < b.y + b.h;
}

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
