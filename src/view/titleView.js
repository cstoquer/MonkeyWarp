var viewManager = require('../viewManager');
var TextBox     = require('../TextBox');
var gamepad     = require('../gamepad');

var SCREEN_HEIGHT = settings.screen.height;
var OPTIONS_COUNT = 4;
var OPTIONS_Y     = 88;
// var CONTROLS = ['KEYB', 'JOY1', 'JOY2', 'JOY3', 'JOY4'];

// assets
var BACKGROUND = getMap('title/background');
var MONKEY     = assets.icon.monkey;
var WARP       = assets.icon.warp;
var CURSOR     = assets.hud.cursor;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var backY  = 0;
var option = 0;
// var controlChoice = 1;
var speedrunEnabled = false;

// text boxes
var textbox = new TextBox(128, 32, assets.font.tetris).setColor(3);
var footer  = new TextBox(128, 8,  assets.font.tetris).setColor(3);
footer.addText('  GBJAM#5 2016', 0, 0);

function updateText() {
	// if (controlChoice >= CONTROLS.length) controlChoice = 0;
	// if (controlChoice < 0) controlChoice = CONTROLS.length - 1;
	// gamepad.setInpuMode(controlChoice - 1);
	var y = 0;
	textbox.clear();
	textbox.addText('START GAME',                                    0, 8 * y++);
	textbox.addText('SPEEDRUN:' + (speedrunEnabled ? 'ON' : 'OFF'),  0, 8 * y++);
	textbox.addText('PASSWORD',                                      0, 8 * y++);
	textbox.addText('CREDITS',                                       0, 8 * y++);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var monkeyAnchor = { x: 0, y: 0, sx: 0, sy: 0, ax: 16, ay: 20 };
var warpAnchor   = { x: 0, y: 0, sx: 0, sy: 0, ax: 36, ay: 40 };

var ACCELERATION = 0.01;
var FRICTION     = 0.95;

function bounce(obj) {
	// if (Math.random() > 0.95) {
	// 	obj.sx += (Math.random() - 0.5) * 0.7;
	// 	obj.sy += (Math.random() - 0.5) * 0.7;
	// }

	obj.sx += (obj.ax - obj.x) * ACCELERATION;
	obj.sy += (obj.ay - obj.y) * ACCELERATION;
	obj.sx *= FRICTION;
	obj.sy *= FRICTION;
	obj.x += obj.sx;
	obj.y += obj.sy;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function () {
	monkeyAnchor = { x: -150, y:  10, sx: 0, sy: -2, ax: 16, ay: 20 };
	warpAnchor   = { x:  190, y: -20, sx: 0, sy:  2, ax: 36, ay: 40 };

	camera(0, 0);
	paper(2);
	updateText();

	var loopData = assets.music.title;
	audioManager.playLoopSound('sfx', 'title', 1, 0, 0, loopData.start, loopData.end);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// function getBtn(gamepads, key) {
// 	if (gamepads[0].btnp[key]
// 	 || gamepads[1].btnp[key]
// 	 || gamepads[2].btnp[key]
// 	 || gamepads[3].btnp[key]
// 	 || btnp[key]) return true;
// 	return false;
// }

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function action() {
	switch (option) {
		case 0: viewManager.open('game', { levelId: 0, speedrun: speedrunEnabled }); break;
		// case 1: viewManager.open('game', { levelId: 0, speedrun: true  }); break;
		// case 1: controlChoice++; updateText(); break;
		case 1: speedrunEnabled = !speedrunEnabled; updateText(); break;
		case 2: viewManager.open('password'); break;
		case 3: viewManager.open('credit'); break;
	}
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	cls();

	// background scroll
	if (++backY > SCREEN_HEIGHT) backY = 0;
	draw(BACKGROUND, 0, backY);
	draw(BACKGROUND, 0, backY - SCREEN_HEIGHT);

	// title
	bounce(monkeyAnchor);
	bounce(warpAnchor);

	draw(MONKEY, monkeyAnchor.x, monkeyAnchor.y);
	draw(WARP,   warpAnchor.x,   warpAnchor.y);

	// menu
	draw(textbox.texture, 40, OPTIONS_Y);
	draw(CURSOR, 32, option * 8 + OPTIONS_Y);

	// footer
	draw(footer.texture, 16, 136);

	// inputs
	var gamepads = gamepad.getAnyGamepad();
	if (gamepads.btnp.down ) { option += 1; if (option >= OPTIONS_COUNT) option = 0; }
	if (gamepads.btnp.up   ) { option -= 1; if (option < 0) option = OPTIONS_COUNT - 1; }

	// action
	if (gamepads.btnp.A    ) action();
	if (gamepads.btnp.B    ) action();
	if (gamepads.btnp.start) action();

	if (option === 1 && gamepads.btnp.right) { speedrunEnabled = !speedrunEnabled; updateText(); }
	if (option === 1 && gamepads.btnp.left ) { speedrunEnabled = !speedrunEnabled; updateText(); }
};