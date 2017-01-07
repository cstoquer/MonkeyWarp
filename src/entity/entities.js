var level       = require('../level');
var gameView    = require('../view/gameView');
var ItemKey     = require('./ItemKey');
var ItemLife    = require('./ItemLife');
var Butterfly   = require('./Butterfly');
var Worm        = require('./Worm');
var Spark       = require('./Spark');
var ChainedBall = require('./ChainedBall');
var Bat         = require('./Bat');

var TILE_WIDTH  = settings.tileSize[0];
var TILE_HEIGHT = settings.tileSize[1];

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function createEntity(classRef, param, item, collide) {
	param = param || {};
	param.x = item.x * TILE_WIDTH;
	param.y = item.y * TILE_HEIGHT;

	var entity = new classRef(param);
	entity.x = param.x;
	entity.y = param.y;

	// add entity to the scene
	gameView.addEntity(entity, collide);
	return entity;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.createEntityfromMapItem = function (item) {
	switch (item.tile) {
		// items
		case 32:
		case 33: return createEntity(ItemKey,     null, item, true);
		case 34: return createEntity(ItemLife,    null, item, true);

		// enemies
		case 48: return createEntity(Butterfly,   null, item, false);
		case 64: return createEntity(Spark,       null, item, true);
		case 65: return createEntity(Worm,        null, item, true);
		case 66:
		case 67: return createEntity(ChainedBall, null, item, true);
		case 68: return createEntity(Bat,         null, item, true);

		default: return null;
	}
};
