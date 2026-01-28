class Character extends MovableObject {

    height = 300;
    y = 80;
    speed = 8;

    
    images_walking = [
            'img/2_character_pepe/2_walk/W-21.png',
            'img/2_character_pepe/2_walk/W-22.png',
            'img/2_character_pepe/2_walk/W-23.png',
            'img/2_character_pepe/2_walk/W-24.png',
            'img/2_character_pepe/2_walk/W-25.png',
            'img/2_character_pepe/2_walk/W-26.png'
    ];

    images_jumping = [
        'img/2_character_pepe/3_jump/J-31.png',
        'img/2_character_pepe/3_jump/J-32.png',
        'img/2_character_pepe/3_jump/J-33.png',
        'img/2_character_pepe/3_jump/J-34.png',
        'img/2_character_pepe/3_jump/J-35.png',
        'img/2_character_pepe/3_jump/J-36.png',
        'img/2_character_pepe/3_jump/J-37.png',
        'img/2_character_pepe/3_jump/J-38.png',
        'img/2_character_pepe/3_jump/J-39.png',
    ];

    world;

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages( this.images_walking);
        this.loadImages( this.images_jumping);
        this.applyGravitaty();
        this.animation();
    }

    animation(){


        setInterval(() => {
            if(this.world.keyboard.RIGHT  && this.x < this.world.level.level_end) {
            this.moveRight();
            this.otherDirection = false;
          // this.walking_sound.play();
            }
            if(this.world.keyboard.LEFT && this.x > 0) {
                this.otherDirection = true;
            this.moveLeft();
            //this.walking_sound.play();
            }
            this.world.camera_x = -this.x + 100;
        }, 1000/60);

        setInterval(() => {

            if(this.isAboveGround()) {
                this.playAnimation(this.images_jumping);
            } else {

        if(this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.images_walking);
        }

        if(this.world.keyboard.UP && !this.isAboveGround()) {
            this.jump();
        }
    }
        }, 50);
    }


    jump() {
        this.speedY = 30;

    }
}
