class Coin extends MovableObject {
  width = 80;
  height = 80;

  constructor(x, y) {
    super();
    this.loadImage(coin_assets.icon);
    this.x = x ?? (200 + Math.random() * 1800);
    this.y = y ?? (80 + Math.random() * 120);
  }
}
