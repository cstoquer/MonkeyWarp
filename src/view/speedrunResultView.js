var TextBox  = require('../TextBox');
var speedrun = require('../speedrun');
var gamepad  = require('../gamepad');

var DEATH = chr$(64);
var MAX_LINE = 11;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var textbox = new TextBox(160, 144, assets.font.tetris).setColor(3);
textbox.paper = 3;

var result;
var resultOffset = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function displayResult(offset) {
	textbox.cls();
	textbox.addText('RESULT', 56, 0);

	textbox.addText('STAGE   TIME    TRY', 0, 16);

	var i = offset;
	var line = 0;
	var levels = result.levels;

	while (line < MAX_LINE && i < levels.length) {
		var level = levels[i];
		i += 1;
		line += 1;

		if (level.data.intermission) {
			textbox.addText(level.data.title, 0, 8 * line + 24);
			continue;
		}
		textbox.addText((' ' + level.data.stage).slice(-2) + '   ' + level.getTime() + '  ' + DEATH + '*' + level.death, 8, 8 * line + 24);
	}

	var total = result.total;
	textbox.addText('TOTAL ' + total.getTime() + '  ' + DEATH + '*' + total.death, 0, 136);

	draw(textbox.texture, 0, 0);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	camera(0, 0);
	result = speedrun.getResult();
	displayResult(resultOffset);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function scrollResult() {
	resultOffset += MAX_LINE;
	if (resultOffset >= result.levels.length) resultOffset = 0;
	displayResult(resultOffset);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	var gamepads = gamepad.getAnyGamepad();
	// action
	if (gamepads.btnp.A    ) scrollResult();
	if (gamepads.btnp.B    ) scrollResult();
	if (gamepads.btnp.start) scrollResult();
};
