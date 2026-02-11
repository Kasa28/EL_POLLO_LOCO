class StatusBar extends DrawableObject {
  images;
  percentage = 0;

  constructor(images, x, y, startValue = 0, maxValue = 100) {
    super();
    this.images = images;
    this.loadImages(this.images);
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 60;
    this.maxValue = maxValue;
    this.setValue(startValue, maxValue);
  }

  setValue(value, maxValue = this.maxValue) {
    this.maxValue = maxValue;
    const v = this.clamp(value, 0, maxValue);
    const pct = maxValue <= 0 ? 0 : (v / maxValue) * 100;
    this.setPercentage(pct);
    return v; 
  }

  setPercentage(percentage) {
    this.percentage = this.clamp(percentage, 0, 100);
    const path = this.images[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  resolveImageIndex() {
    const maxIndex = this.images.length - 1;
    if (this.percentage <= 0) return 0;
    const idx = Math.ceil((this.percentage / 100) * maxIndex);
    return this.clamp(idx, 0, maxIndex);
  }

  clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
}