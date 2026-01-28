class Coin extends MovableObject {
  width = 80;
  height = 80;

  constructor() {
    super().loadImage('img/7_statusbars/3_icons/icon_coin.png');
    this.x = 200 + Math.random() * 1800;
    this.y = 180 + Math.random() * 120;
  }
}
