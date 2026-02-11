class Cloud extends MovableObject {
  y = 20;
  width = 450;
  height = 250;
  static LEVEL_END = 4000;     
  static SPAWN_GAP = 350;     
  static nextX = 0;

  constructor() {
    super();
    const img = cloud_assets.images[Math.floor(Math.random() * cloud_assets.images.length)];
    this.loadImage(img);
    this.x = Cloud.spawnX();
    this.speed = 0.2 + Math.random() * 0.3;
    this.startMoving();
    this.otherDirection = false;
  }

  static spawnX() {
    if (Cloud.nextX === 0) Cloud.nextX = Math.random() * 400;
    const jitter = (Math.random() - 0.5) * 180; 
    const x = Cloud.nextX + jitter;
    Cloud.nextX += Cloud.SPAWN_GAP; 
    return x;
  }

  startMoving() {
    setInterval(() => this.updateMove(), 1000 / 60);
  }

  updateMove() {
  this.moveLeft();
  if (this.x < -this.width) {
    const rightEdge = -this.world.camera_x + this.world.canvas.width; 
    this.x = rightEdge + 200 + Math.random() * 400;
  }
}
}