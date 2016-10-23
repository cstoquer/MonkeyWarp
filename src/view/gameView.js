var Texture       = require('Texture');
var viewManager   = require('../viewManager');
var getAnyGamepad = require('../gamepad').getAnyGamepad;
var Monkey        = require('../Monkey');
var level         = require('../level');
var TextBox       = require('../TextBox');


var SCREEN_W = settings.screen.width;
var SCREEN_H = settings.screen.height;
var TILE_W   = settings.spriteSize[0];
var TILE_H   = settings.spriteSize[0];
var CENTER_X = ~~(SCREEN_W / 2) - 4;
var CENTER_Y = ~~(SCREEN_H / 2) - 4;

var CAMERA_ACCELERATION       = 0.1;
var CAMERA_SHAKE_ACCELERATION = 0.35;
var CAMERA_SHAKE_FRICTION     = 0.85;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// monkey
var monkey = exports.monkey = new Monkey();

// camera
var backgroundColor = 0;
var parallax       = 1;
var camX           = 0;
var camY           = 0;
var camShakeX      = 0;
var camShakeY      = 0;
var camShakeSpeedX = 0;
var camShakeSpeedY = 0;


// level
var CURRENT_LEVEL = 0;
var MAX_LEVEL_W   = 0;
var MAX_LEVEL_H   = 0;
var needKey = false;

// entities
var entitiesDraw    = [];
var entitiesCollide = [];

// HUD
var isDisplayingMessage = false;
var displayMessageCounter = 0;
var messageBanner = new TextBox(160, 8, assets.font.tetris).setColor(3);
messageBanner.paper = 3;

var healthHUD = new Texture(160, 8);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function resetCamera() {
	camShakeX      = 0;
	camShakeY      = 0;
	camShakeSpeedX = 0;
	camShakeSpeedY = 0;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.shakeCamera = function (force) {
	camShakeSpeedX = force;
	camShakeSpeedY = force * 2 * (Math.random() - 0.5);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function drawDoor(entryPoint, direction, type) {
	level.layer.draw(
		assets.entity.doors[direction + type],
		entryPoint[direction].x * TILE_W - 8,
		entryPoint[direction].y * TILE_H - 8
	);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function loadLevel() {
	resetCamera();

	// reset level
	entitiesDraw    = [];
	entitiesCollide = [];

	// get data
	var levelData = assets.levels[CURRENT_LEVEL];

	// we reach the end
	if (!levelData) {
		CURRENT_LEVEL = 0;
		viewManager.open('ending');
		return;
	}

	// music
	var musicId = levelData.music;
	if (musicId === null) {
		// stop music
		audioManager.stopLoopSound('sfx');
	} else if (musicId) {
		var loopData = assets.music[musicId];
		audioManager.playLoopSound('sfx', musicId, 1, 0, 0, loopData.start, loopData.end);
	}

	// intermission
	if (levelData.intermission) {
		CURRENT_LEVEL += 1;
		viewManager.open('intermission', levelData);
		return;
	}

	// load level
	level.load(levelData.id);
	backgroundColor = levelData.paper;
	parallax        = levelData.parallax;
	var entryPoint  = level.getEntryPoints();

	// add doors
	var doorType = levelData.doorType || 1;
	drawDoor(entryPoint, 'entry', doorType);
	drawDoor(entryPoint, 'exit',  doorType);
	needKey = entryPoint.needKey;

	// level boundaries
	MAX_LEVEL_W = level.width  * TILE_W - SCREEN_W;
	MAX_LEVEL_H = level.height * TILE_H - SCREEN_H;

	// set monkey position
	monkey.x = entryPoint.entry.x * TILE_W;
	monkey.y = entryPoint.entry.y * TILE_H;

	// init camera on monkey
	camX = clip(monkey.x - CENTER_X, 0, MAX_LEVEL_W);
	camY = clip(monkey.y - CENTER_Y, 0, MAX_LEVEL_H);

	exports.updateHealthHUD();
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function(params) {
	params = params || {};
	if (params.level !== undefined) CURRENT_LEVEL = params.level;
	loadLevel();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.respawn = function () {
	// TODO animation
	monkey.reset();
	loadLevel();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.gotoNextLevel = function () {
	if (needKey && !monkey.hasKey) {
		exports.displayMessage(' THE DOOR IS LOCKED');
		// play sound
		sfx('wrong');
		return;
	}
	// TODO animation
	monkey.reset();
	CURRENT_LEVEL += 1;
	loadLevel();
};
	
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Update is called once per frame
exports.update = function () {
	paper(backgroundColor).cls();

	// controls
	var gamepad = getAnyGamepad();
	monkey.update(gamepad);

	// update camera position
	var scrollX = clip(monkey.x - CENTER_X, 0, MAX_LEVEL_W);
	var scrollY = clip(monkey.y - CENTER_Y, 0, MAX_LEVEL_H);

	var diffX = scrollX - camX;
	if (diffX > -1 && diffX < 1) camX = scrollX;
	else camX += diffX * CAMERA_ACCELERATION;
	camY += (scrollY - camY) * CAMERA_ACCELERATION;

	// camera shaking
	
	camShakeSpeedX -= camShakeX * CAMERA_SHAKE_ACCELERATION;
	camShakeSpeedY -= camShakeY * CAMERA_SHAKE_ACCELERATION;
	camShakeSpeedX *= CAMERA_SHAKE_FRICTION;
	camShakeSpeedY *= CAMERA_SHAKE_FRICTION;
	camShakeX += camShakeSpeedX;
	camShakeY += camShakeSpeedY;


	var cx = camX + camShakeX;
	var cy = camY + camShakeY;
	// background with parallax effect
	camera(cx * parallax, cy * parallax);
	level.drawBackground();

	// main level
	camera(cx, cy);
	level.draw();
	monkey.draw();

	// entities draw
	for (var i = 0; i < entitiesDraw.length; i++) {
		entitiesDraw[i].draw();
	}

	// entities collisions
	for (var i = 0; i < entitiesCollide.length; i++) {
		monkey.checkCollisionWithEntity(entitiesCollide[i]);
	}

	// HUD
	camera(0, 0);
	if (isDisplayingMessage) {
		draw(messageBanner.texture, 0, 136);
		if (--displayMessageCounter <= 0) isDisplayingMessage = false;
	} else {
		draw(healthHUD, 0, 136);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.addEntity = function (entity, doCollide) {
	entitiesDraw.push(entity);
	if (doCollide) entitiesCollide.push(entity);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.removeEntityFromCollisions = function (entity) {
	// remove from collide
	index = entitiesCollide.indexOf(entity);
	if (index !== -1) entitiesCollide.splice(index, 1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.removeEntity = function (entity) {
	// remove from draw
	var index = entitiesDraw.indexOf(entity);
	if (index !== -1) entitiesDraw.splice(index, 1);

	// remove from collisions
	exports.removeEntityFromCollisions(entity);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.displayMessage = function (message) {
	isDisplayingMessage   = true;
	displayMessageCounter = 80;
	messageBanner.cls();
	messageBanner.addText(message, 0, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.updateHealthHUD = function () {
	healthHUD.clear();
	for (var i = 0; i < monkey.maxLife; i++) {
		s = i < monkey.lifePoints ? assets.hud.healthFull : assets.hud.healthEmpty;
		healthHUD.draw(s, 1 + i * 5, 0);
	}
};
