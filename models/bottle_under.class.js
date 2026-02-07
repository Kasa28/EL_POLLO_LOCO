class BottlePickup extends MovableObject {
  width = 60;
  height = 80;
  y = 350;

  constructor(x) {
    super();
    this.loadImages(this.images_bottles);

    const randomImg = this.images_bottles[Math.floor(Math.random() * this.images_bottles.length)];
    this.loadImage(randomImg);

    this.x = x ?? (200 + Math.random() * 1800);
  }
}