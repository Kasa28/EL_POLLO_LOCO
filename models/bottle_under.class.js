class BottlePickup extends MovableObject {
  width = 60;
  height = 80;

  images_bottles = [
    "img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
    "img/6_salsa_bottle/2_salsa_bottle_on_ground.png"
  ];

  constructor() {
    super();
    const randomImg = this.images_bottles[Math.floor(Math.random() * this.images_bottles.length)];
    this.loadImage(randomImg);
    this.x = 200 + Math.random() * 1800;
    this.y = 350;
  }
}