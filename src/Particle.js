var gameView = require('./view/gameView');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Particle(params, controller) {
	params = params || {};
	this.controller = controller || gameView;

	this.x  = 0;
	this.y  = 0;
	this.sx = 0;
	this.sy = 0;

	this.frame = 0;
	this.life  = 0;
	this.flipH = false;
	this.flipV = false;

	this.animation = params.animation;
	this.animSpeed = params.animSpeed || 0;
	this.lifetime  = params.lifetime  || this.animation.length / this.animSpeed;
	this.gravity   = params.gravity   || 0;

	this.controller.addEntity(this);
}
module.exports = Particle;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Particle.prototype.draw = function () {
	this.life += 1;
	if (this.life >= this.lifetime) {
		this.controller.removeEntity(this);
		return;
	}

	// TODO movement & gravity
	this.sy += this.gravity;
	this.x  += this.sx;
	this.y  += this.sy;

	this.frame += this.animSpeed;
	if (this.frame >= this.animation.length) this.frame = 0;

	var current = this.animation[~~this.frame];
	draw(current, this.x, this.y, this.flipH, this.flipV);
};
