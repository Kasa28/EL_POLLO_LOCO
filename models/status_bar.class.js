class StatusBar extends DrawableObject {
  images;
  percentage = 0;
  lastPercentage = 0;
  pulseUntil = 0;
  PULSE_MS = 140;
  PULSE_SCALE = 1.06;

  constructor(images, x, y, startPercentage = 0) {
    super();
    this.images = images;
    this.loadImages(this.images);
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 60;
    this.setPercentage(startPercentage);
  }

setPercentage(percentage) {
  this.percentage = Math.max(0, Math.min(100, percentage));
  const path = this.images[this.resolveImageIndex()];
  this.img = this.imageCache[path];
}

resolveImageIndex() {
  const maxIndex = this.images.length - 1;
  const pct = Math.max(0, Math.min(100, this.percentage));
  if (pct === 0) return 0;
  const idx = Math.ceil((pct / 100) * maxIndex);
  return Math.min(maxIndex, idx);
}
}
