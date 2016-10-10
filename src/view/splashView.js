var viewManager = require('../viewManager');
var LOGO = assets.icon.pixelbox;

var y = 0;

exports.open = function () {
	y = -LOGO.height;
	paper(3);
	audioManager.loadSound('logo');
};

exports.update = function () {
	y += 0.5;
	cls();
	if (y >= 130) return viewManager.open('title');
	if (y >= 125) return;
	if (y == 64) sfx('logo');
	draw(LOGO, 32, Math.min(y, 64));
};