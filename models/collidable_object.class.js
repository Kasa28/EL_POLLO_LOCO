/**
 * Base class for objects that can participate in collisions.
 * Provides collision toggles, damage value, and hitbox offsets.
 * @extends MovableObject
 */
class CollidableObject extends MovableObject {
  /** @type {boolean} */
  collidable = true;

  /** @type {number} */
  damage = 0;

  /**
   * Hitbox offset values (in px) used to shrink/adjust the collision box.
   * @type {{top:number,left:number,right:number,bottom:number}}
   */
  offset = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  /**
   * Whether this object is currently allowed to collide.
   * @returns {boolean}
   */
  canCollide() {}
}
