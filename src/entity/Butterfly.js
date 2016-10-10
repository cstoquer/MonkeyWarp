var ANIM_SPEED = 0.2;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Butterfly() {
	this.x  = 0;
	this.y  = 0;
	this.sx = 0;
	this.sy = 0;
	this.frame = 0;
}

module.exports = Butterfly;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Butterfly.prototype.draw = function () {

	// move
	this.x += this.sx;
	this.y += this.sy;
	// TODO

	// draw
	this.frame += ANIM_SPEED;
	if (this.frame >= 2) this.frame = 0;
	sprite(230, this.x, this.y, false, this.frame > 1);
};