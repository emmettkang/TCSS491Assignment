    var AM = new AssetManager();

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.drawFrameFromRow = function (tick, ctx, x, y, row) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrameRow();
    var yindex = this.frameHeight * row;

    ctx.drawImage(this.spriteSheet,
                 frame * this.frameWidth, yindex,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}
Animation.prototype.currentFrameRow = function () {
    return Math.floor(this.elapsedTime / this.frameDuration)%this.sheetWidth;
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

//(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
function Skeleton(game, spritesheet) {
    this.walkAnimation = new Animation(spritesheet, 0, 704, 64, 64, 0.1, 8, true, false);
    this.backAnimation = new Animation(spritesheet, 0, 576, 64, 64, 0.1, 8, true, false);
    this.castingAnimation = new Animation(spritesheet, 0, 128, 64, 64, 0.10, 7, false, false);
    this.speed = 100;
    this.ctx = game.ctx;
    this.magic = false;
    this.added = false;
    this.flyBack = false;

    Entity.call(this, game, 0, 350);
}

Skeleton.prototype = new Entity();
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.update = function () {
    
    if (!this.magic && !this.flyBack) {
        this.x += this.game.clockTick * this.speed;
    } else if (!this.magic && this.flyBack) {
        this.x -= this.game.clockTick * this.speed;
    }
    if (this.x > 750) {
        this.flyBack = true;
    } else if (this.x < 5) {
        this.flyBack = false;
    }

    Entity.prototype.update.call(this);
    if (this.x > 380 && this.x < 382) this.magic = true;
    if (this.magic) {
        if (this.castingAnimation.isDone()) {
            this.magic = false;
            this.castingAnimation.elapsedTime = 0;
            this.added = false;
            if (this.flyBack) {
                this.x -= 1;
            } else {
                this.x += 1;
            }
        if (this.added == false) {
            this.added=true;
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x-100, this.y-200));
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x-100, this.y));
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x, this.y-100));
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x-200, this.y-100));

            //Diagonals
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x-200, this.y));//bottom left
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x, this.y)); //bottom right
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x-200, this.y-200));
            this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x, this.y-200));
           /* for (var i = 0; i < 100; i++) {
                var randX = Math.floor(Math.random()*600+1);
                var randY = Math.floor(Math.random()*600+1);
                this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), randX, randY));*/
            
        } 
            // this.game.addEntity(new Test(this.game, AM.getAsset("./img/napper.png"), this.x-200, this.y-100));
                
            
        }
        
    } 
}

Skeleton.prototype.draw = function () {
    if (this.magic){
        this.castingAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    } else {
        if (!this.flyBack){
           this.walkAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        } else {
            this.backAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
        }
    }
    Entity.prototype.draw.call(this);
}


function Bunny(game, spritesheet) {
    this.x = 300;
    this.y = 200;
    this.animation = new Animation(spritesheet, 0, 128, 48, 64, 0.1, 7, true, false);
    this.speed = 100;
    this.ctx = game.ctx;
    Entity.call(this, game, 300, 200);
}

Bunny.prototype = new Entity();
Bunny.prototype.constructor = Bunny;

Bunny.prototype.update = function () {
  //  this.x += this.game.clockTick * this.speed;
  
    Entity.prototype.update.call(this);
}

Bunny.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 1);
    Entity.prototype.draw.call(this);
}

function Test(game, spritesheet, x, y) {
    this.animation = new Animation(spritesheet, 0,0, 256, 256, 0.03, 32, false, false);
    this.speed = 100;
    this.ctx = game.ctx;
    Entity.call(this, game, x, y);
}

Test.prototype = new Entity();
Test.prototype.constructor = Test;

Test.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Test.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 1);
    Entity.prototype.draw.call(this);
}


AM.queueDownload("./img/bunbun.png");
AM.queueDownload("./img/napper.png");
AM.queueDownload("./img/yap.png");
AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    
    gameEngine.addEntity(new Skeleton(gameEngine, AM.getAsset("./img/yap.png")));
    //gameEngine.addEntity(new Bunny(gameEngine, AM.getAsset("./img/bunbun.png")));
    console.log("All Done!");
});