var level          = require('./level');
var gameController = require('./view/gameView');
var AABB           = require('./AABBcollision');

var ASSET = assets.entity.banana;

var TILE_WIDTH  = settings.tileSize.width  || settings.tileSize[0];
var TILE_HEIGHT = settings.tileSize.height || settings.tileSize[1];

var FRICTION         = 0.9;
var ACCELERATION     = 0.01;
var MAX_ACCELERATION = 0.8;
var THROW_DURATION   = 20;
var MAX_SPEED        = 3;

var AUDIO_LOOP_START =  0.433;
var AUDIO_LOOP_END   =  1.369;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Banana(owner) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 2;
	this.h  = 2;

	this.owner = owner;
	this.reset();
}

module.exports = Banana;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.reset = function () {
	audioManager.stopLoopSound('banana');

	this.sx = 0;
	this.sy = 0;

	this.grabbing = null;

	// flags
	this.flying   = false;
	this.throwing = false;

	//counters
	this.throwCounter = 0;

	// rendering
	this.frame = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.draw = function () {
	var img = ASSET.idle;
	if (this.flying) {
		this.frame += 0.2;
		if (this.frame >= 4) this.frame = 0;
		img = ASSET['fly' + ~~this.frame];
	}
	draw(img, this.x - 4, this.y - 4);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.maxSpeed = function () {
	if (this.sx >  MAX_SPEED) this.sx =  MAX_SPEED;
	if (this.sx < -MAX_SPEED) this.sx = -MAX_SPEED;
	if (this.sy >  MAX_SPEED) this.sy =  MAX_SPEED;
	if (this.sy < -MAX_SPEED) this.sy = -MAX_SPEED;
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** computing movement */
Banana.prototype.update = function () {
	if (this.throwing) {
		if (this.throwCounter++ > THROW_DURATION) {
			this.throwing = false;
		}
		this.levelCollisions();
	} else if (this.flying) {
		this.sx += clip((this.owner.x - this.x) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);
		this.sy += clip((this.owner.y - this.y) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);

		this.sx *= FRICTION;
		this.sy *= FRICTION;

		this.maxSpeed();
		this.levelCollisions();

		// the monkey catch the banana
		if (AABB(this, this.owner)) this._catchBanana();
		
	} else {
		this.x = this.owner.x + 3;
		this.y = this.owner.y - 5;
	}

	// if banana is grabbing something, also update this
	if (this.grabbing) {
		this.grabbing.x = this.x - 2;
		this.grabbing.y = this.y - 6;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** actually move the entity and check for collisions with level */
Banana.prototype.levelCollisions = function () {

	var x = this.x + this.sx;
	var y = this.y + this.sy;

	// check level boundaries
	var maxX = level.width * TILE_WIDTH; // TODO don't need to be calculated each frames
	if (this.sx < 0 && x < 0   ) { x = 0;    this.sx *= -1; }
	if (this.sx > 0 && x > maxX) { x = maxX; this.sx *= -1; }


	if (level.getTileAt(x, this.y).fruitSolid) {
		this.sx *= -1;
		x = this.x; // TODO
		// x = ~~(x / TILE_WIDTH) * TILE_WIDTH + frontOffset;
	}

	if (level.getTileAt(this.x, y).fruitSolid) {
		this.sy *= -1;
		y = this.y; // TODO
	}


	// fetch position
	this.x = x;
	this.y = y;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.getTeleportPosition = function () {
	// inside GLASS
	if (level.getTileAt(this.x, this.y).isSolid) return null;

	// find a empty space for monkey to teleport
	var x = this.x - 3;
	var y = this.y - 3;
	var monkey = this.owner;
	var w = monkey.w;
	var h = monkey.h;

	if (
		level.getTileAt(x    , y    ).isTeleportable &&
		level.getTileAt(x + w, y    ).isTeleportable &&
		level.getTileAt(x    , y + h).isTeleportable &&
		level.getTileAt(x + w, y + h).isTeleportable
	) return { x: x, y: y };

	// try on tile values
	var X = ~~(x / TILE_WIDTH)  * TILE_WIDTH;
	var Y = ~~(y / TILE_HEIGHT) * TILE_HEIGHT;

	if (level.getTileAt(X,              Y              ).isTeleportable) return { x: X,              y: Y               };
	if (level.getTileAt(X + TILE_WIDTH, Y              ).isTeleportable) return { x: X + TILE_WIDTH, y: Y               };
	if (level.getTileAt(X,              Y + TILE_HEIGHT).isTeleportable) return { x: X,              y: Y + TILE_HEIGHT };
	if (level.getTileAt(X + TILE_WIDTH, Y + TILE_HEIGHT).isTeleportable) return { x: X + TILE_WIDTH, y: Y + TILE_HEIGHT };
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** called when the monkey want to throw the banana */
Banana.prototype.fire = function (sx, sy) {
	if (level.getTileAt(this.x, this.y).fruitSolid) {
		return;
		// TODO: play "error" sound
	}

	audioManager.playLoopSound('banana', 'banana fly', 1, 0, 0, AUDIO_LOOP_START, AUDIO_LOOP_END);

	this.flying   = true;
	this.throwing = true;
	this.throwCounter = 0;
	this.sx = sx;
	this.sy = sy;
	this.maxSpeed();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** while flying, the banana collide with an item that can be grabbed */
Banana.prototype.grab = function (item) {
	if (this.grabbing) return;
	sfx('catch');
	this.grabbing = item;
	gameController.removeEntityFromCollisions(item);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** the monkey catch the banana */
Banana.prototype._catchBanana = function () {
	sfx('catch');
	this.flying = false;
	audioManager.stopLoopSound('banana');
	if (this.grabbing) {
		this.grabbing.collectItem(this.owner);
		this.grabbing = null;
	}
};
