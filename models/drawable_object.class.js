class DrawableObject{
    img;
    imageCache = [];
    currentImage = 0;
    x = 90;
    y = 270;
    height = 150;
    width = 100;


loadImage(path) {
    this.img = new Image(); 
    this.img.src = path;

}

draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
}


drawFrame(ctx) {
    if(this instanceof Character || this instanceof Chicken) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
    }
}

loadImages(arrays) {
arrays.forEach((path) =>{
let img = new Image();
img.src = path;
this.imageCache[path] = img;
})
}


}
