class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_end = 2200;

    constructor(enemies, clouds, backgroundObjects) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}