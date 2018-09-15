var gameController = require('../view/gameView');
var level          = require('../level');


var TILE_WIDTH  = settings.tileSize.width  || settings.tileSize[0];
var TILE_HEIGHT = settings.tileSize.height || settings.tileSize[1];

var ANIM_SPEED  = 0.2;
var FREEZE_DURATION = 240;

var DIRECTIONS = [
	{ x:  1, y:  0 },
	{ x:  0, y:  1 },
	{ x: -1, y:  0 },
	{ x:  0, y: -1 }
];

var ANIMATION = [
	assets.entity.spark.frame0,
	assets.entity.spark.frame1,
];


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Spark(params) {
	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;
	this.frame = 0;

	this.directionId = 0;
	this.direction   = DIRECTIONS[0];
	this.moveCounter = 0;

	this.freezed = false;
	this.freezeCounter = 0;
}

module.exports = Spark;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype.draw = function () {
	if (this.freezed) {
		if (this.freezeCounter++ >= FREEZE_DURATION) this.freezed = false;
		draw(ANIMATION[~~this.frame], this.x - 1, this.y - 1);
		return;
	}

	// move
	this.x += this.direction.x;
	this.y += this.direction.y;

	this.moveCounter += 1;
	if (this.moveCounter >= TILE_WIDTH) {
		this.moveCounter = 0;
		this._getNextMove();
	}
	
	// draw
	this.frame += ANIM_SPEED;
	if (this.frame >= 2) this.frame = 0;
	draw(ANIMATION[~~this.frame], this.x - 1, this.y - 1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype.collisionBanana = function (banana) {
	this.freezed = true;
	this.freezeCounter = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getTile(level, i, j, direction) {
	return level.getTile(i + direction.x, j + direction.y);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype._getNextMove = function () {

	// choose the next direction
	var i = ~~(this.x / TILE_WIDTH);
	var j = ~~(this.y / TILE_HEIGHT);

	var direction = this.direction;
	var anchorId  = (this.directionId + 1) % 4;
	var anchor    = DIRECTIONS[anchorId];

	if (getTile(level, i, j, anchor).isEmpty) {
		// turn to anchor direction
		this.directionId = anchorId;
		this.direction   = anchor;
		return;
	}

	while (getTile(level, i, j, this.direction).isSolid) {
		// turn in inverse direction
		this.directionId = this.directionId - 1;
		if (this.directionId < 0) this.directionId = 3;
		this.direction = DIRECTIONS[this.directionId];
		// TODO avoid infinite loop if geometry can change
	}
};

