class Character extends MovableObject {

    height = 300;
    y = 130;
    speed = 10;

    
    images_walking = [
            'img/2_character_pepe/2_walk/W-21.png',
            'img/2_character_pepe/2_walk/W-22.png',
            'img/2_character_pepe/2_walk/W-23.png',
            'img/2_character_pepe/2_walk/W-24.png',
            'img/2_character_pepe/2_walk/W-25.png',
            'img/2_character_pepe/2_walk/W-26.png'
    ];

    world;

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages( this.images_walking);

        this.animation();
    }

    animation(){


        setInterval(() => {
            if(this.world.keyboard.RIGHT  && this.x < this.world.level.level_end) {
                this.x += this.speed;
                this.otherDirection = false;
            }
            if(this.world.keyboard.LEFT && this.x > 0) {
                this.x -= this.speed;
                this.otherDirection = true;
            }
            this.world.camera_x = -this.x + 100;
        }, 1000/60);

        setInterval(() =>{
        if(this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        let i = this.currentImage % this.images_walking.length;
        let path = this.images_walking[i];
        this.img = this.imageCache[path];
        this.currentImage++;
        }
        }, 50);


    }


    jump() {

    }
}
