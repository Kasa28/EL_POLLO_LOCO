class StatusBarController {
  constructor(world, assets, max) {
    this.world = world;
    this.assets = assets;
    this.max = max;
    this.createBars();
  }

  createBars() {
    const c = this.world.character;
    const boss = this.world.getBoss();
    this.health = new StatusBar(this.assets.health, 10, 0, c.energy, this.max.health);
    this.coins  = new StatusBar(this.assets.coins, 10, 60, c.coins, this.max.coins);
    this.bottle = new StatusBar(this.assets.bottles, 10, 120, c.bottles, this.max.bottles);
    this.boss = new StatusBar(
      this.assets.boss,
      300, 0,
      boss?.energy ?? 0,
      boss?.MAX_ENERGY ?? 6
    );
  }

  update() {
    this.syncPlayerBars();
    this.syncBossBar();
  }

  syncPlayerBars() {
    const c = this.world.character;
    c.energy  = this.health.setValue(c.energy, this.max.health);
    c.coins   = this.coins.setValue(c.coins, this.max.coins);
    c.bottles = this.bottle.setValue(c.bottles, this.max.bottles);
  }

  syncBossBar() {
    const boss = this.world.getBoss();
    if (!boss || !boss.isActive || boss.isRemoved) return;
    this.boss.setValue(boss.energy, boss.MAX_ENERGY);
  }

  shouldShowBoss() {
    const boss = this.world.getBoss();
    return boss && boss.isActive && !boss.isRemoved;
  }

  draw(ctx) {
    this.health.draw(ctx);
    this.coins.draw(ctx);
    this.bottle.draw(ctx);
    if (this.shouldShowBoss()) this.boss.draw(ctx);
  }
}