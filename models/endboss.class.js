/**
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  /** @type {number} */ height = 400;
  /** @type {number} */ width = 250;
  /** @type {number} */ y = 60;

  /** @type {number} */ MAX_ENERGY = 6;
  /** @type {number} */ energy = 6;

  /** @type {boolean} */ isDead = false;
  /** @type {boolean} */ isActive = false;
  /** @type {boolean} */ isHurtBoss = false;
  /** @type {boolean} */ isRemoved = false;

  /** @type {"walk"|"alert"|"attack"|"dead"} */
  currentState = "walk";

  /** @type {number} */ speed = 1.2;
  /** @type {number} */ lastAttack = 0;
  /** @type {number} */ attackCooldown = 1200;

  /** @type {number|null} */ spriteIntervalId = null;
  /** @type {number|null} */ logicIntervalId = null;

  /** @type {number} */ bottlesHit = 0;
  /** @type {number} */ BOTTLES_TO_KILL = 5;

  constructor() {
    super();
    this.x = 2500;
    this.loadImage(endboss_assets.walking[0]);
    this.preloadImages();
    this.animate();
  }

  /** @returns {void} */
  preloadImages() {
    this.loadImages(endboss_assets.walking);
    this.loadImages(endboss_assets.alert);
    this.loadImages(endboss_assets.attack);
    this.loadImages(endboss_assets.hurt);
    this.loadImages(endboss_assets.dead);
  }

  /** @returns {void} */
  animate() {
    this.stop();
    this.startSpriteLoop();
    this.startLogicLoop();
  }

  /** @returns {void} */
  stop() {
    if (this.spriteIntervalId) clearInterval(this.spriteIntervalId);
    if (this.logicIntervalId) clearInterval(this.logicIntervalId);
    this.spriteIntervalId = null;
    this.logicIntervalId = null;
  }

  /** @returns {void} */
  startSpriteLoop() {
    this.spriteIntervalId = setInterval(() => this.animateSprite(), 160);
  }

  /** @returns {void} */
  startLogicLoop() {
    this.logicIntervalId = setInterval(() => this.updateLogic(), 1000 / 60);
  }

  /** @returns {void} */
  animateSprite() {
    this.playAnimation(this.getSpriteFrames());
  }

  /** @returns {string[]} */
  getSpriteFrames() {
    if (this.isDead) return endboss_assets.dead;
    if (this.isHurtBoss) return endboss_assets.hurt;
    if (!this.isActive) return endboss_assets.walking;
    if (this.currentState === "alert") return endboss_assets.alert;
    if (this.currentState === "attack") return endboss_assets.attack;
    return endboss_assets.walking;
  }

  /** @returns {void} */
  updateLogic() {
    if (this.shouldSkipLogic()) return;
    const character = this.world.character;
    const distance = this.getDistanceTo(character);
    if (this.isInAlert()) return;
    if (this.isInAttackRange(distance)) return this.attack(character);
    this.walkTowards(character);
  }

  /** @returns {boolean} */
  shouldSkipLogic() {
    if (!this.world) return true;
    if (this.world.ending || this.world.gameOver) return true;
    if (!this.isActive || this.isDead) return true;
    return false;
  }

  /**
   * @param {{x:number}} character
   * @returns {number}
   */
  getDistanceTo(character) {
    return Math.abs(character.x - this.x);
  }

  /** @returns {boolean} */
  isInAlert() {
    return this.currentState === "alert";
  }

  /**
   * @param {number} distance
   * @returns {boolean}
   */
  isInAttackRange(distance) {
    return distance < 95;
  }

  /**
   * @param {{x:number}} character
   * @returns {void}
   */
  walkTowards(character) {
    this.currentState = "walk";
    this.moveDirectionTo(character);
    this.moveStep();
  }

  /**
   * @param {{x:number}} character
   * @returns {void}
   */
  moveDirectionTo(character) {
    const goLeft = character.x < this.x;
    this.otherDirection = !goLeft;
    this.walkDir = goLeft ? -1 : 1;
  }

  /** @returns {void} */
  moveStep() {
    this.x += this.walkDir * this.speed;
  }

  /** @returns {void} */
  setActive() {
    if (this.isActive) return;
    this.isActive = true;
    this.setAlertState();
    this.leaveAlertLater();
  }

  /** @returns {void} */
  setAlertState() {
    this.currentState = "alert";
  }

  /** @returns {void} */
  leaveAlertLater() {
    setTimeout(() => this.trySetWalkState(), 1200);
  }

  /** @returns {void} */
  trySetWalkState() {
    if (!this.isDead) this.currentState = "walk";
  }

  /** @returns {boolean} */
  canAttack() {
    return Date.now() - this.lastAttack > this.attackCooldown;
  }

  /**
   * @param {{hit:(dmg:number)=>void}} character
   * @returns {void}
   */
  attack(character) {
    if (this.shouldSkipAttack()) return;
    if (!this.canAttack()) return;
    this.startAttack();
    this.doAttackDamage(character);
    this.finishAttackLater();
  }

  /** @returns {boolean} */
  shouldSkipAttack() {
    if (!this.world) return true;
    if (this.world.ending || this.world.gameOver) return true;
    if (this.currentState === "attack") return true;
    if (this.isDead) return true;
    return false;
  }

  /** @returns {void} */
  startAttack() {
    this.currentState = "attack";
    this.lastAttack = Date.now();
    this.world?.sfx?.playOnce("attack_audio", 800);
  }

  /**
   * @param {{hit:(dmg:number)=>void}} character
   * @returns {void}
   */
  doAttackDamage(character) {
    character.hit(2);
    this.world?.hud?.update?.();
  }

  /** @returns {void} */
  finishAttackLater() {
    setTimeout(() => this.trySetWalkState(), 600);
  }

  /**
   * Bottle hit (counts hits) -> dies after 5 bottles.
   * @returns {void}
   */
  hitByBottle() {
    if (this.isDead) return;
    this.bottlesHit++;
    this.syncEnergyFromBottleHits();
    if (this.bottlesHit >= this.BOTTLES_TO_KILL) return this.die();
    this.triggerHurt();
    this.clearHurtLater();
  }

  /** @returns {void} */
  syncEnergyFromBottleHits() {
    const ratio = this.bottlesHit / this.BOTTLES_TO_KILL;         
    const left = Math.ceil(this.MAX_ENERGY * (1 - ratio));        
    this.energy = Math.max(0, Math.min(this.MAX_ENERGY, left));
  }

  /** @returns {void} */
  triggerHurt() {
    this.isHurtBoss = true;
  }

  /** @returns {void} */
  clearHurtLater() {
    setTimeout(() => (this.isHurtBoss = false), 350);
  }

  /** @returns {void} */
  die() {
    if (this.isDead) return;
    this.energy = 0;
    this.isDead = true;
    this.isHurtBoss = false;
    this.currentState = "dead";
    this.stopLogic();
    this.animateSprite();
    setTimeout(() => {
      this.isRemoved = true;
      this.stopSprite();
    }, 1600);
  }

  /** @returns {void} */
  stopSprite() {
    if (this.spriteIntervalId) clearInterval(this.spriteIntervalId);
    this.spriteIntervalId = null;
  }

  /** @returns {void} */
  stopLogic() {
    if (this.logicIntervalId) clearInterval(this.logicIntervalId);
    this.logicIntervalId = null;
  }
}