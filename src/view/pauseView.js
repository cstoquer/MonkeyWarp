var gameView      = require('./gameView');
var getAnyGamepad = require('../gamepad').getAnyGamepad;
var viewManager   = require('../viewManager');
var TextBox       = require('../TextBox');
var PassGrid      = require('../passGrid');


var passGrid = new PassGrid();
var showPassGrid = false;
var timer = 0;

var pauseText = new TextBox(5 * 8, 8, assets.font.tetris).setColor(0);
pauseText.addText('PAUSE', 0, 0);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	timer = 5;
	params = params || {};
	showPassGrid = false;
	// if (gameView.isSpeedrunEnabled()) return;
	var level = gameView.getLevel();
	if (level.password) {
		passGrid.setPassword(level.password);
		showPassGrid = true;
	}
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	if (timer > 1) {
		paper(1).pen(1);
		camera(0, 0);
		rectfill(timer * 8, timer * 8, 160 - timer * 16, 144 - timer * 16);
		timer -= 1;
		return;
	}

	draw(pauseText.texture, 60, 32);

	if (showPassGrid) passGrid.draw(52, 56);

	var gamepads = getAnyGamepad();
	if (gamepads.btnp.start) {
		// continue
		viewManager.open('game', { resume: true });
	}
};
