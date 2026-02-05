class Cloud extends MovableObject {
  y = 20;
  width = 450;
  height = 250;

  constructor() {
    super().loadImage('img/5_background/layers/4_clouds/1.png');
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