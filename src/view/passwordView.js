var viewManager   = require('../viewManager');
var PassGrid      = require('../passGrid');
var TextBox       = require('../TextBox');

var PASSWORDS   = {};
var TILE_WIDTH  = settings.tileSize.width;
var TILE_HEIGHT = settings.tileSize.height;
var OFFSET_X    = 52;
var OFFSET_Y    = 44;
var BACKGROUND  = getMap('passBG');
var BACKGROUND_WIDTH = BACKGROUND.width * TILE_WIDTH;

var CURSOR_ANIMATION = [
	assets.hud.target.f0,
	assets.hud.target.f1,
	assets.hud.target.f1
];

var ANIMATION_SPEED = 0.1;

var passwordText = new TextBox(8 * TILE_WIDTH, TILE_HEIGHT, assets.font.tetris).setColor(0);
passwordText.addText('PASSWORD', 0, 0);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
(function () {
	var levels = assets.levels;
	for (var i = 0; i < levels.length; i++) {
		var level = levels[i];
		if (!level.password) continue;
		PASSWORDS[level.password] = i;
	}
})()

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var cursor = { x: 0, y: 0, frame: 0 };
var passGrid = new PassGrid();
var scroll = 0;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function () {
	camera(0, 0);
	paper(1).cls();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	// action
	if (gamepad.btnp.right) cursor.x = (cursor.x + 1) % 5;
	if (gamepad.btnp.left ) cursor.x = (cursor.x + 4) % 5;
	if (gamepad.btnp.down ) cursor.y = (cursor.y + 1) % 5;
	if (gamepad.btnp.up   ) cursor.y = (cursor.y + 4) % 5;
	if (gamepad.btnp.A    ) passGrid.switchBit(cursor.x, cursor.y);

	if (gamepad.btnr.B) {
		var word  = passGrid.getPassword();
		var level = PASSWORDS[word]
		if (level) {
			viewManager.open('game', { level: level });
		} else {
			sfx('wrong');
			console.log(word)
		}
	}

	if (gamepad.btnp.start) viewManager.open('title');

	// animations
	cursor.frame += ANIMATION_SPEED;
	if (cursor.frame >= CURSOR_ANIMATION.length) cursor.frame = 0;
	scroll += 0.5;
	if (scroll >= BACKGROUND_WIDTH) scroll = 0;

	// draw
	cls();
	draw(BACKGROUND, scroll, 0);
	draw(BACKGROUND, scroll - BACKGROUND_WIDTH, 0);
	draw(passwordText.texture, 48, 32);

	passGrid.draw(OFFSET_X, OFFSET_Y);
	draw(CURSOR_ANIMATION[~~cursor.frame], cursor.x * TILE_WIDTH + OFFSET_X + 4, cursor.y * TILE_HEIGHT + OFFSET_Y + 4);
};
