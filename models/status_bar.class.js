class StatusBar extends DrawableObject {
  images;
  percentage = 0;

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
    this.percentage = percentage;
    const path = this.images[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

resolveImageIndex() {
  const maxIndex = this.images.length - 1; 
  const pct = Math.max(0, Math.min(100, this.percentage));
  return Math.min(maxIndex, Math.floor(pct / 10));
}
}
