var getAnyGamepad = require('../gamepad').getAnyGamepad;
var gameView      = require('./gameView');
var viewManager   = require('../viewManager');
var TextBox       = require('../TextBox');

var TILE_HEIGHT = settings.tileSize[1];
var FONDU = getMap('fondu');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var gameoverText = new TextBox(160, 8, assets.font.tetris).setColor(0);
var continueText = new TextBox(160, 8, assets.font.tetris).setColor(0);
gameoverText.addText('     GAME OVER', 0, 0);
continueText.addText('      RETRY ?', 0, 0);

var timer = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	timer = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	camera(0, 0);
	timer += 1;
	if (timer <= 40) {
		draw(FONDU, 0, (timer - FONDU.height) * TILE_HEIGHT);
		draw(FONDU, 0, (18 - timer) * TILE_HEIGHT, false, true);
		return;
	}

	// paper(0).cls();
	draw(gameoverText.texture, 0, 56);
	draw(continueText.texture, 0, 72);

	var gamepads = getAnyGamepad();
	if (gamepads.btnp.A || gamepads.btnp.B || gamepads.btnp.start) {
		// continue
		gameView.respawn();
		viewManager.open('game');
	}
};
