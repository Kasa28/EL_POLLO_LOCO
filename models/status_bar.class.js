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
    if (this.percentage <= 0) return 0;
    return Math.min(5, Math.ceil(this.percentage / 20));
  }
}
