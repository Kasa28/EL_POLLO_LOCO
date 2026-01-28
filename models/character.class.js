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

    images_dead = [
        'img/2_character_pepe/5_dead/D-51.png',
        'img/2_character_pepe/5_dead/D-52.png',
        'img/2_character_pepe/5_dead/D-53.png',
        'img/2_character_pepe/5_dead/D-54.png',
        'img/2_character_pepe/5_dead/D-55.png',
        'img/2_character_pepe/5_dead/D-56.png',
        'img/2_character_pepe/5_dead/D-57.png',
    ];

    images_hurt = [
        'img/2_character_pepe/4_hurt/H-41.png',
        'img/2_character_pepe/4_hurt/H-42.png',
        'img/2_character_pepe/4_hurt/H-43.png',




    ];


    world;
    damage = 20;
    bottles = 0;
    coins = 0;
    throwBottles = [];
    offset = {
        top: 120,
        bottom: 30,
        left: 40, 
        right: 30
    }

    constructor() {
        super().loadImage('img/2_character_pepe/2_walk/W-21.png');
        this.loadImages( this.images_walking);
        this.loadImages( this.images_jumping);
        this.loadImages( this.images_dead);
        this.loadImages( this.images_hurt);
    }

    start() {
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

            if (this.isDead()) {
                this.playAnimation(this.images_dead);

            }else if(this.isHurt()) {
                this.playAnimation(this.images_hurt);

            }else if(this.isAboveGround()) {
                this.playAnimation(this.images_jumping);
            } else {

            if (this.world.keyboard.UP && !this.isAboveGround()) {
            this.jump();
            }

            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.images_walking);
           } else {
            this.img = this.imageCache[this.images_walking[0]];
  }
}
        }, 50);
    }


    jump() {
        this.speedY = 30;

    }
}
