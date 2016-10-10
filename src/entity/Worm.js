var gameController = require('../view/gameView');
var ShortAnimation = require('../ShortAnimation');
var animations     = require('../animations');
var level          = require('../level');
var ItemLife       = require('./ItemLife');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var SPEED = 0.1;

var ANIMATION = [
	assets.entity.worm.walk0,
	assets.entity.worm.walk1,
	assets.entity.worm.walk2,
	assets.entity.worm.walk3,
	assets.entity.worm.walk2,
	assets.entity.worm.walk1
];

var ANIMATION_LENGTH = ANIMATION.length;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Worm(params) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 8;
	this.h  = 8
	this.sx = SPEED;
	this.sy = 0;
	this.frame = random(ANIMATION_LENGTH);
}

module.exports = Worm;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.draw = function () {
	var x = this.x;
	var y = this.y;

	// move
	x += this.sx;
	if (this.sx > 0 && level.getTileAt(x + this.w, this.y         ).isSolid
	 || this.sx > 0 && level.getTileAt(x + this.w, this.y + this.h).isEmpty
	 || this.sx < 0 && level.getTileAt(x + 4     , this.y         ).isSolid
	 || this.sx < 0 && level.getTileAt(x + 4     , this.y + this.h).isEmpty) {
		x = this.x;
		this.sx *= -1;
	}

	// fetch position
	this.x = x;
	this.y = y;
	
	// draw
	this.frame += SPEED;
	if (this.frame >= ANIMATION_LENGTH) this.frame = 0;
	draw(ANIMATION[~~this.frame], this.x - 3, this.y);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionBanana = function (banana) {
	sfx('explosion');

	gameController.removeEntity(this);

	var explosion = new ShortAnimation(animations.explosion, 0.5);
	explosion.setPosition(this.x - 8, this.y - 8);
	gameController.addEntity(explosion, false);

	// a small chance to drop something
	if (Math.random() < 0.1) {
		var item = new ItemLife();
		item.sy = -2;
		item.x = ~~this.x;
		item.y = ~~this.y;
		gameController.addEntity(item, true);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};

