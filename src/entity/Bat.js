var gameView       = require('../view/gameView');
var ShortAnimation = require('../ShortAnimation');
var animations     = require('../animations');
var level          = require('../level');
var ItemLife       = require('./ItemLife');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var ANIMATION_SPEED = 0.2;
var ANIMATION = [
	assets.entity.bat.fly0,
	assets.entity.bat.fly1,
	assets.entity.bat.fly2,
	assets.entity.bat.fly1
];

var FRICTION         = 0.9;
var ACCELERATION     = 0.01;
var MAX_ACCELERATION = 0.03;
var MAX_SPEED        = 0.5;


var ANIMATION_LENGTH = ANIMATION.length;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Worm(params) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 8;
	this.h  = 8
	this.sx = 0;
	this.sy = 0;

	this.sleeping = true;
	this.frame = random(ANIMATION_LENGTH);
}

module.exports = Worm;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.draw = function () {
	var monkey = gameView.monkey;

	if (this.sleeping) {
		draw(assets.entity.bat.hang0, this.x, this.y);
		// wake up when monkey is under
		if (
			Math.abs(monkey.x - this.x) < 24 // monkey is close horizontally
		 &&  monkey.y > this.y               // monkey is under the bat
		 &&  monkey.y - this.y < 64          // bat is in the screen
		) this.sleeping = false;
		return;
	}

	// move toward monkey
	var tx = monkey.x + 4;
	var ty = monkey.y - 4;

	this.sx += clip((tx - this.x) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);
	this.sy += clip((ty - this.y) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);

	this.sx *= FRICTION;
	this.sy *= FRICTION;

	// max speed
	if (this.sx >  MAX_SPEED) this.sx =  MAX_SPEED;
	if (this.sx < -MAX_SPEED) this.sx = -MAX_SPEED;
	if (this.sy >  MAX_SPEED) this.sy =  MAX_SPEED;
	if (this.sy < -MAX_SPEED) this.sy = -MAX_SPEED;

	var x = this.x + this.sx;
	var y = this.y + this.sy;

	// level collisions

	// TODO

	// fetch position
	this.x = x;
	this.y = y;
	
	// draw
	this.frame += ANIMATION_SPEED;
	if (this.frame >= ANIMATION_LENGTH) this.frame = 0;
	draw(ANIMATION[~~this.frame], this.x - 7, this.y - 3);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionBanana = function (banana) {
	sfx('explosion');

	gameView.removeEntity(this);

	var explosion = new ShortAnimation(animations.explosion, 0.5);
	explosion.setPosition(this.x - 8, this.y - 8);
	gameView.addEntity(explosion, false);

	// a small chance to drop something
	if (Math.random() < 0.3) {
		var item = new ItemLife();
		item.sy = -1;
		item.x = ~~this.x;
		item.y = ~~this.y;
		gameView.addEntity(item, true);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};

