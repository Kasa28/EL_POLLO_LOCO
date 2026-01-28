class Chicken extends MovableObject{

    y = 330;
    height = 100;
    images_walking = [
        'img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        'img/3_enemies_chicken/chicken_normal/1_walk/3_w.png',
];  
        constructor() {
        super().loadImage('img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');

        this.x = 200 + Math.random() * 500;
        this.loadImages( this.images_walking);

        this.speed = 0.15 + Math.random() * 0.25;

        this.animation_chicken();
    }
    animation_chicken(){
        setInterval(() => {
            this.moveLeft();
        }, 1000 / 60);


        setInterval(() =>{
            this.playAnimation(this.images_walking);
        }, 100)



    }
    }
