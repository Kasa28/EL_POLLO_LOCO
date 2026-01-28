class World {
character = new Character();
clouds = level_1.clouds;
backgroundObjects = level_1.backgroundObjects;
canvas; 
ctx;
keyboard;
camera_x = 0;
statusBarHealth = new StatusBar(images_health, 10, 0);
statusBarCoins  = new StatusBar(images_coins, 10, 60);
statusBarBottle = new StatusBar(images_bootles, 10, 120);

throwableObjects = [];
lastThrow = 0;


constructor(canvas, keyboard) {
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level =  level_1;
    this.enemies = level_1.enemies;
    this.draw();
    this.setWorld();
    this.run();
}

setWorld() {
    this.character.world = this;
    this.character.start();
}

run() {
    setInterval(() => {
        this.checkCollisons();
        this.checkThrowObjects();
        this.checkCollectCoins();
        this.checkCollectBottles();

    }, 200);
}

checkThrowObjects() {
    const now = Date.now();
    if (this.keyboard.D && now - this.lastThrow > 500) {
        let bootle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
        this.throwableObjects.push(bootle);
        this.lastThrow = now;
    }
}


checkCollisons() {
    this.level.enemies.forEach( (enemy)=> {
    if(this.character.isColliding(enemy) ) {
    this.character.hit();
    this.statusBarHealth.setPercentage(this.character.energy);

        }
    });
}


draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBarHealth);
    this.addToMap(this.statusBarCoins);
    this.addToMap(this.statusBarBottle);
    this.ctx.translate(this.camera_x, 0);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.level.coins);
    this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.clouds);
    this.ctx.translate(-this.camera_x, 0);

    let self = this;
    requestAnimationFrame(function() {
    self.draw()
    });
    }

    addObjectsToMap(objects) {
        objects.forEach(objects => {
             this.addToMap(objects);
        });
    }

    addToMap(mo) {
        if(mo.otherDirection) {
            this.flippImage(mo);
        }
        mo.draw(this.ctx);


        if (mo.otherDirection) {
            this.flippImageBack(mo);
        }
    }

    flippImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width,0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1
    }
    flippImageBack(mo) {
             mo.x = mo.x * -1
            this.ctx.restore();
    }

    checkCollectCoins() {
  this.level.coins = this.level.coins.filter((coin) => {
    if (this.character.isColliding(coin)) {
      this.character.coins++;
      this.statusBarCoins.setPercentage((this.character.coins / 10) * 100);
      return false; 
    }
    return true;
  });
}

checkCollectBottles() {
  this.level.bottles = this.level.bottles.filter((bottle) => {
    if (this.character.isColliding(bottle)) {
      this.character.bottles++;
      this.statusBarBottle.setPercentage((this.character.bottles / 10) * 100);
      return false; 
    }
    return true;
  });
}

}