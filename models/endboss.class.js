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
  spriteIntervalId = null;
  logicIntervalId = null;

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
    this.stop();
    this.startSpriteLoop();
    this.startLogicLoop();
  }

  stop() {
    if (this.spriteIntervalId) clearInterval(this.spriteIntervalId);
    if (this.logicIntervalId) clearInterval(this.logicIntervalId);
    this.spriteIntervalId = null;
    this.logicIntervalId = null;
  }

  startSpriteLoop() {
    this.spriteIntervalId = setInterval(() => this.animateSprite(), 160);
  }

  startLogicLoop() {
    this.logicIntervalId = setInterval(() => this.updateLogic(), 1000 / 60);
  }

  animateSprite() {
    this.playAnimation(this.getSpriteFrames());
  }

  getSpriteFrames() {
    if (this.isDead) return endboss_assets.dead;
    if (this.isHurtBoss) return endboss_assets.hurt;
    if (!this.isActive) return endboss_assets.walking;
    if (this.currentState === "alert") return endboss_assets.alert;
    if (this.currentState === "attack") return endboss_assets.attack;
    return endboss_assets.walking;
  }

  updateLogic() {
    if (this.shouldSkipLogic()) return;
    const character = this.world.character;
    const distance = this.getDistanceTo(character);
    if (this.isInAlert()) return;
    if (this.isInAttackRange(distance)) return this.attack(character);
    this.walkTowards(character);
  }

  shouldSkipLogic() {
    if (!this.world) return true;
    if (this.world.ending || this.world.gameOver) return true;
    if (!this.isActive || this.isDead) return true;
    return false;
  }

  getDistanceTo(character) {
    return Math.abs(character.x - this.x);
  }

  isInAlert() {
    return this.currentState === "alert";
  }

  isInAttackRange(distance) {
    return distance < 95;
  }

  walkTowards(character) {
    this.currentState = "walk";
    this.moveDirectionTo(character);
    this.moveStep();
  }

  moveDirectionTo(character) {
    const goLeft = character.x < this.x;
    this.otherDirection = !goLeft;
    this.walkDir = goLeft ? -1 : 1;
  }

  moveStep() {
    this.x += this.walkDir * this.speed;
  }

  setActive() {
    if (this.isActive) return;
    this.isActive = true;
    this.setAlertState();
    this.leaveAlertLater();
  }

  setAlertState() {
    this.currentState = "alert";
  }

  leaveAlertLater() {
    setTimeout(() => this.trySetWalkState(), 1200);
  }

  trySetWalkState() {
    if (!this.isDead) this.currentState = "walk";
  }

  canAttack() {
    return Date.now() - this.lastAttack > this.attackCooldown;
  }

  attack(character) {
    if (this.shouldSkipAttack()) return;
    if (!this.canAttack()) return;
    this.startAttack();
    this.doAttackDamage(character);
    this.finishAttackLater();
  }

  shouldSkipAttack() {
    if (!this.world) return true;
    if (this.world.ending || this.world.gameOver) return true;
    if (this.currentState === "attack") return true;
    if (this.isDead) return true;
    return false;
  }

  startAttack() {
    this.currentState = "attack";
    this.lastAttack = Date.now();
    this.world?.sfx?.playOnce("attack_audio", 800);
  }

  doAttackDamage(character) {
    character.hit(25);
  }

  finishAttackLater() {
    setTimeout(() => this.trySetWalkState(), 600);
  }

  hitBoss(dmg = 30) {
    if (this.isDead) return;
    this.energy -= dmg;
    if (this.energy <= 0) return this.die();
    this.triggerHurt();
    this.clearHurtLater();
  }

  triggerHurt() {
    this.isHurtBoss = true;
  }

  clearHurtLater() {
    setTimeout(() => (this.isHurtBoss = false), 350);
  }

  die() {
    if (this.isDead) return;
    this.energy = 0;
    this.isDead = true;
    this.stop();
    setTimeout(() => (this.isRemoved = true), 1000);
  }
}