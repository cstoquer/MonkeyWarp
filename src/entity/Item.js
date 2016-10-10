var gameController = require('../view/gameView');
var ShortAnimation = require('../ShortAnimation');
var animations     = require('../animations');


var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var ANIM_SPEED = 0.2;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Item(params) {
	params = params || {};

	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;
	this.ox = params.offsetX || 0;
	this.oy = params.offsetY || 0;

	this.sprites  = params.sprites;
	this.frame    = 0;
	this.animated = this.sprites.length > 1;
}

module.exports = Item;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.draw = function () {
	if (this.animated) {
		this.frame += ANIM_SPEED;
		if (this.frame >= this.sprites.length) this.frame = 0;
	}

	var s = this.sprites[~~this.frame];
	draw(s, this.x + this.ox, this.y + this.oy);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.collisionBanana = function (banana) {
	banana.grab(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.collisionMonkey = function (monkey) {
	this.collectItem(monkey);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.collectItem = function (monkey) {
	sfx('item');
	gameController.removeEntity(this);
	var vfx = new ShortAnimation(animations.getFX, 0.4);
	vfx.setPosition(this.x - 12, this.y - 12);
	gameController.addEntity(vfx, false);
};