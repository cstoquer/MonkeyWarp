var gameView = require('../view/gameView');
var Item     = require('./Item');
var level    = require('../level');

var TILE_WIDTH  = settings.tileSize[0];
var TILE_HEIGHT = settings.tileSize[1];

var ANIMATION = [
	assets.entity.item.life0,
	assets.entity.item.life1,
	assets.entity.item.life2,
	assets.entity.item.life3,
	assets.entity.item.life4,
	assets.entity.item.life5,
	assets.entity.item.life6,
	assets.entity.item.life7,
	assets.entity.item.life8
];

var PARAMS = {
	sprites: ANIMATION,
	offsetX: -2,
	offsetY: -3
};

var GRAVITY     = 0.15;
var MAX_GRAVITY = 2.5;
var DAMPING     = 0.7;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function ItemLife() {
	Item.call(this, PARAMS);
	this.grounded = false;
	this.rebound  = 0;
	this.sy = 0;

	// when spawning, item is not grabbable by banana for few frames
	this.isLocked = true;
	this.lockedCounter = 30;
}
inherits(ItemLife, Item);
module.exports = ItemLife;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemLife.prototype.draw = function () {
	// counter
	if (this.isLocked && this.lockedCounter-- <= 0) this.isLocked = false;


	// move
	if (!this.grounded) {
		this.sy += GRAVITY;
		this.sy = Math.min(this.sy, MAX_GRAVITY);
		var y = this.y + this.sy;
		if (level.getTileAt(this.x + 4, y + 8).isTopSolid) {
			y = this.y;
			this.sy *= -DAMPING;
			this.rebound += 1;
			sfx('bounce', Math.min(1, -this.sy));
			if (this.rebound > 3) {
				this.grounded = true;
				y = ~~(this.y / TILE_HEIGHT + 1) * TILE_HEIGHT;
			}
		}
		this.y = y;
	}
	
	// draw item
	Item.prototype.draw.call(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemLife.prototype.collisionBanana = function (banana) {
	if (this.isLocked) return;
	banana.grab(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemLife.prototype.collectItem = function (monkey) {
	Item.prototype.collectItem.call(this, monkey);
	if (monkey.lifePoints < monkey.maxLife) monkey.lifePoints += 1;
	gameView.updateHealthHUD();
};
