// models/endboss.class.js
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
  lastAttack = 0;
  attackCooldown = 1200;
  constructor() {
    super();
    this.x = 2500;
    this.loadImage(endboss_assets.walking[0]);
    this.preloadImages();
    this.animate();
  }

  preloadImages() {
    this.loadImages(endboss_assets.walking);
    this.loadImages(endboss_assets.alert);
    this.loadImages(endboss_assets.attack);
    this.loadImages(endboss_assets.hurt);
    this.loadImages(endboss_assets.dead);
  }

  animate() {
    setInterval(() => this.animateSprite(), 160);
    setInterval(() => this.updateMovementAndAttack(), 1000 / 60);
  }

  animateSprite() {
    if (this.isDead) return this.playAnimation(endboss_assets.dead);
    if (this.isHurtBoss) return this.playAnimation(endboss_assets.hurt);
    if (!this.isActive) return this.playAnimation(endboss_assets.walking);

    if (this.currentState === "alert") return this.playAnimation(endboss_assets.alert);
    if (this.currentState === "attack") return this.playAnimation(endboss_assets.attack);

    return this.playAnimation(endboss_assets.walking);
  }

  updateMovementAndAttack() {
    if (!this.isActive || this.isDead || !this.world) return;

    const character = this.world.character;
    const distance = Math.abs(character.x - this.x);

    if (this.currentState === "alert") return;

    if (distance < 95) {
      this.attack(character);
      return;
    }

    this.currentState = "walk";

    if (character.x < this.x) {
      this.otherDirection = false;
      this.x -= this.speed;
    } else {
      this.otherDirection = true;
      this.x += this.speed;
    }
  }

  setActive() {
    if (this.isActive) return;

    this.isActive = true;
    this.currentState = "alert";

    setTimeout(() => {
      if (!this.isDead) this.currentState = "walk";
    }, 1200);
  }

  canAttack() {
    return Date.now() - this.lastAttack > this.attackCooldown;
  }

  attack(character) {
    if (!this.canAttack() || this.currentState === "attack") return;

    this.currentState = "attack";
    this.lastAttack = Date.now();

    character.hit(25);

    setTimeout(() => {
      if (!this.isDead) this.currentState = "walk";
    }, 600);
  }

  hitBoss(dmg = 30) {
    if (this.isDead) return;

    this.energy -= dmg;

    if (this.energy <= 0) {
      this.energy = 0;
      this.die();
      return;
    }

    this.isHurtBoss = true;
    setTimeout(() => (this.isHurtBoss = false), 350);
  }

  die() {
    this.isDead = true;
    setTimeout(() => (this.isRemoved = true), 1000);
  }
}
