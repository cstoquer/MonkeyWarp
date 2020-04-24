var Particle = require('../Particle');

var TURN_SPEED  = 0.05;
var FULL_CYCLE  = 2 * Math.PI;
var CHAIN_LENGTH = 32;

var ANIMATION = [
	assets.entity.chainedBall.ball0,
	assets.entity.chainedBall.ball1
];

var PARTICLE_ANIMATION = [
	assets.entity.chainedBall.particle0,
	assets.entity.chainedBall.particle1,
	assets.entity.chainedBall.particle2
];

var PARTICLE_PARAMS = {
	animation: PARTICLE_ANIMATION,
	animSpeed: 0.2,
	lifetime: null,
	gravity: 0
};

var ANIMATION_LENGTH = ANIMATION.length;
var ANIMATION_SPEED  = 0.5;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function ChainedBall(params) {
	params = params || {};

	this.hx = params.x;
	this.hy = params.y;
	this.x  = 0;
	this.y  = 0;
	this.w  = 8;
	this.h  = 8;
	this.a  = 0;

	this.frame = 0;
}

module.exports = ChainedBall;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ChainedBall.prototype.draw = function () {
	// rotation
	this.a += TURN_SPEED;
	if (this.a > FULL_CYCLE) this.a -= FULL_CYCLE;

	// fetch position
	var x = Math.cos(this.a);
	var y = Math.sin(this.a);

	this.x = this.hx + x * CHAIN_LENGTH - 4;
	this.y = this.hy + y * CHAIN_LENGTH - 4;

	// draw
	this.frame += ANIMATION_SPEED;
	if (this.frame >= ANIMATION_LENGTH) {
		this.frame = 0;
		var particle = new Particle(PARTICLE_PARAMS);
		particle.x = this.x;
		particle.y = this.y;
		particle.sx = 0.2 * (Math.random() - 0.5);
		particle.sy = 0.2 * (Math.random() - 0.5);
	}
	draw(ANIMATION[~~this.frame], this.x - 1, this.y - 1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// ChainedBall.prototype.collisionBanana = function (banana) {};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ChainedBall.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};

