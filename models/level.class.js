/**
 * Level container holding all spawnable objects for a stage.
 */
class Level {
  /** @type {MovableObject[]} */
  enemies;

  /** @type {Cloud[]} */
  clouds;

  /** @type {DrawableObject[]} */
  backgroundObjects;

  /** @type {Coin[]} */
  coins;

  /** @type {MovableObject[]} */
  bottles;

  /** @type {number} */
  level_end = 2200;

  /**
   * @param {MovableObject[]} enemies
   * @param {Cloud[]} clouds
   * @param {DrawableObject[]} backgroundObjects
   * @param {Coin[]} coins
   * @param {MovableObject[]} bottles
   */
  constructor(enemies, clouds, backgroundObjects, coins, bottles) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.coins = coins;
    this.bottles = bottles;
  }
}
