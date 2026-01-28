class BottlePickup extends MovableObject {
  width = 60;
  height = 80;

  constructor() {
    super().loadImage('img/7_statusbars/3_icons/icon_salsa_bottle.png');
    this.x = 200 + Math.random() * 1800;
    this.y = 330;
  }
}
