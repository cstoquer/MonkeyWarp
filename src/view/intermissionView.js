var getAnyGamepad = require('../gamepad').getAnyGamepad;
var viewManager   = require('../viewManager');
var TextBox       = require('../TextBox');


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var textbox = new TextBox(160, 24, assets.font.tetris).setColor(3);
var timer = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	params = params || {};

	textbox.clear();
	// TODO center text ?
	textbox.addText('CHAPTER ' + params.chapter, 8, 0);
	textbox.addText(params.title, 8, 16);

	camera(0, 0);
	paper(3).cls();
	draw(textbox.texture, 0, 64);

	timer = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	// lock screen for few frames
	if (++timer < 10) {
		camera(0, 0);
		paper(3).cls();
		draw(textbox.texture, 0, 64);
		return;
	};

	var gamepads = getAnyGamepad();
	// action
	if (timer >= 150
	 || gamepads.btnp.A
	 || gamepads.btnp.B
	 || gamepads.btnp.start) viewManager.open('game');
};
