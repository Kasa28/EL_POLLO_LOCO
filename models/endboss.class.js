class Endboss extends MovableObject {
  height = 400;
  width = 250;
  y = 60;

  energy = 100;
  isDead = false;
  isActive = false;
  isHurtBoss = false;
  isRemoved = false;

  currentState = "walk";
  speed = 1.2;

  images_walking = [
    'img/4_enemie_boss_chicken/1_walk/G1.png',
    'img/4_enemie_boss_chicken/1_walk/G2.png',
    'img/4_enemie_boss_chicken/1_walk/G3.png',
    'img/4_enemie_boss_chicken/1_walk/G4.png',
  ];

  images_alert = [
    'img/4_enemie_boss_chicken/2_alert/G5.png',
    'img/4_enemie_boss_chicken/2_alert/G6.png',
    'img/4_enemie_boss_chicken/2_alert/G7.png',
    'img/4_enemie_boss_chicken/2_alert/G8.png',
    'img/4_enemie_boss_chicken/2_alert/G9.png',
    'img/4_enemie_boss_chicken/2_alert/G10.png',
    'img/4_enemie_boss_chicken/2_alert/G11.png',
    'img/4_enemie_boss_chicken/2_alert/G12.png'
  ];

  images_attack = [
    'img/4_enemie_boss_chicken/3_attack/G13.png',
    'img/4_enemie_boss_chicken/3_attack/G14.png',
    'img/4_enemie_boss_chicken/3_attack/G15.png',
    'img/4_enemie_boss_chicken/3_attack/G16.png',
    'img/4_enemie_boss_chicken/3_attack/G17.png',
    'img/4_enemie_boss_chicken/3_attack/G18.png',
    'img/4_enemie_boss_chicken/3_attack/G19.png',
    'img/4_enemie_boss_chicken/3_attack/G20.png',
  ];

  images_hurt = [
    'img/4_enemie_boss_chicken/4_hurt/G21.png',
    'img/4_enemie_boss_chicken/4_hurt/G22.png',
    'img/4_enemie_boss_chicken/4_hurt/G23.png'
  ];

  images_dead = [
    'img/4_enemie_boss_chicken/5_dead/G24.png',
    'img/4_enemie_boss_chicken/5_dead/G25.png',
    'img/4_enemie_boss_chicken/5_dead/G26.png'
  ];

  constructor() {
    super().loadImage(this.images_walking[0]);

    this.loadImages(this.images_walking);
    this.loadImages(this.images_alert);
    this.loadImages(this.images_attack);
    this.loadImages(this.images_hurt);
    this.loadImages(this.images_dead);

    this.x = 2500;

    this.animate();
  }

  animate() {
    // Animation State Loop
    setInterval(() => {
      if (this.isDead) {
        this.playAnimation(this.images_dead);
        return;
      }

      if (this.isHurtBoss) {
        this.playAnimation(this.images_hurt);
        return;
      }

      if (!this.isActive) {
        this.playAnimation(this.images_walking);
        return;
      }

      if (this.currentState === "alert") {
        this.playAnimation(this.images_alert);
        return;
      }

      if (this.currentState === "attack") {
        this.playAnimation(this.images_attack);
        return;
      }

      this.playAnimation(this.images_walking);
    }, 200);

    setInterval(() => {
      if (!this.isActive || this.isDead || !this.world) return;
      if (this.world.character.x < this.x) {
        this.otherDirection = false;
        this.moveLeft();
      } else {
        this.otherDirection = true;
        this.moveRight();
      }
    }, 1000 / 60);
  }

  setActive() {
    if (this.isActive) return;
    this.isActive = true;
    this.currentState = "alert";

    setTimeout(() => {
      if (!this.isDead) this.currentState = "attack";
    }, 1500);
  }

  hitBoss(dmg = 20) {
    if (this.isDead) return;

    this.energy -= dmg;

    if (this.energy <= 0) {
      this.energy = 0;
      this.die();
      return;
    }

    this.isHurtBoss = true;
    setTimeout(() => {
      this.isHurtBoss = false;
    }, 400);
  }

  die() {
    this.isDead = true;
    this.currentState = "dead";

    setTimeout(() => {
      this.isRemoved = true; 
    }, 1000);
  }
}