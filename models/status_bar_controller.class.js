/**
 * Manages all HUD status bars (player + boss) and keeps them in sync with the world state.
 */
class StatusBarController {
  /**
   * @param {{ character:any, getBoss:() => any }} world
   * @param {{ health:string[], coins:string[], bottles:string[], boss:string[] }} assets
   * @param {{ health:number, coins:number, bottles:number }} max
   */
  constructor(world, assets, max) {
    /** @type {any} */
    this.world = world;
    /** @type {{ health:string[], coins:string[], bottles:string[], boss:string[] }} */
    this.assets = assets;
    /** @type {{ health:number, coins:number, bottles:number }} */
    this.max = max;
    this.createBars();
  }

  /** @returns {void} */
  createBars() {
    const c = this.world.character;
    const boss = this.world.getBoss();

    /** @type {StatusBar} */
    this.health = new StatusBar(this.assets.health, 10, 0, c.energy, this.max.health);
    /** @type {StatusBar} */
    this.coins = new StatusBar(this.assets.coins, 10, 60, c.coins, this.max.coins);
    /** @type {StatusBar} */
    this.bottle = new StatusBar(this.assets.bottles, 10, 120, c.bottles, this.max.bottles);
    /** @type {StatusBar} */
    this.boss = new StatusBar(
      this.assets.boss,
      300,
      0,
      boss?.energy ?? 0,
      boss?.MAX_ENERGY ?? 6
    );
  }

  /** @returns {void} */
  update() {
    this.syncPlayerBars();
    this.syncBossBar();
  }

  /** @returns {void} */
  syncPlayerBars() {
    const c = this.world.character;
    c.energy = this.health.setValue(c.energy, this.max.health);
    c.coins = this.coins.setValue(c.coins, this.max.coins);
    c.bottles = this.bottle.setValue(c.bottles, this.max.bottles);
  }

  /** @returns {void} */
  syncBossBar() {
    const boss = this.world.getBoss();
    if (!boss || !boss.isActive || boss.isRemoved) return;
    this.boss.setValue(boss.energy, boss.MAX_ENERGY);
  }

  /** @returns {boolean} */
  shouldShowBoss() {
    const boss = this.world.getBoss();
    return !!(boss && boss.isActive && !boss.isRemoved);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    this.health.draw(ctx);
    this.coins.draw(ctx);
    this.bottle.draw(ctx);
    if (this.shouldShowBoss()) this.boss.draw(ctx);
  }
}
