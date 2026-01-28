class MovableObject {
x = 90;
y = 270;
img;
height = 150;
width = 100;
speed = 0.15;
imageCache = [];
currentImage = 0;
otherDirection = false;
speedY = 0;
acceleration = 3;


applyGravitaty() {
    setInterval(() => {
        if(this.isAboveGround() ||  this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
    }
    }, 1000 / 25);
}

isAboveGround() {
  return this.y < 130;
}

loadImage(path) {
    this.img = new Image(); 
    this.img.src = path;

}

draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
}

drawFrame(ctx) {
    ctx.beginPath();
    ctx.lineWidth = "5";
    ctx.strokeStyle = "blue";
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
}

loadImages(arrays) {
arrays.forEach((path) =>{
let img = new Image();
img.src = path;
this.imageCache[path] = img;
})
}
 playAnimation(images){
        let i = this.currentImage % this.images_walking.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
 }

moveRight() {
        this.x += this.speed;
}

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 40;
    }


}
