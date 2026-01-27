class MovableObject {
x = 90;
y = 270;
img;
height = 150;
width = 100;
speed = 0.15;
imageCache = [];
    currentImage = 0;

loadImage(path) {
    this.img = new Image(); 
    this.img.src = path;

}

loadImages(arrays) {
arrays.forEach((path) =>{
let img = new Image();
img.src = path;
this.imageCache[path] = img;
})
}

moveRight() {
    console.log('Moving right');
}

    moveLeft() {
                setInterval(() => {
            this.x -= this.speed;
        }, 1000 / 60);

    }
}