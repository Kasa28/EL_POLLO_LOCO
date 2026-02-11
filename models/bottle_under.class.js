class BottlePickup extends MovableObject {
  width = 60;
  height = 80;
  y = 350;

  /**
   * @param {number} [x]
   */
  constructor(x) {
    super();
    this.loadImages(bottle_assets.images_bottles);
    const randomImg =
      bottle_assets.images_bottles[
        Math.floor(Math.random() * bottle_assets.images_bottles.length)
      ];
    this.loadImage(randomImg);
    this.x = x ?? (200 + Math.random() * 1800);
  }
}
