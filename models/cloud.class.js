class Cloud extends MovableObject {
  y = 20;
  width = 450;
  height = 250;

  constructor() {
    super();
    const img = cloud_assets.images[Math.floor(Math.random() * cloud_assets.images.length)];
    this.loadImage(img);
    this.x = Math.random() * 500;
    this.speed = 0.2 + Math.random() * 0.3;
    this.startMoving();
  }

  startMoving() {
    setInterval(() => this.updateMove(), 1000 / 60);
  }

  updateMove() {
    this.moveLeft();
  }
}
