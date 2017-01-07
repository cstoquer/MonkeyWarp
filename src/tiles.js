var EMPTY   = exports.EMPTY   = { isEmpty: true,  isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: false };
var SOLID   = exports.SOLID   = { isEmpty: false, isSolid: true,  isTopSolid: true,  fruitSolid: true,  isTeleportable: false, kill: false, interactive: false };
var ONE_WAY = exports.ONE_WAY = { isEmpty: false, isSolid: false, isTopSolid: true,  fruitSolid: false, isTeleportable: true,  kill: false, interactive: false };
var KILL    = exports.KILL    = { isEmpty: true,  isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: false, kill: true,  interactive: false };
var GLASS   = exports.GLASS   = { isEmpty: false, isSolid: true,  isTopSolid: true,  fruitSolid: false, isTeleportable: false, kill: false, interactive: false };

var DOOR1   = exports.DOOR1   = { isEmpty: false, isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: true, door: 1 };
var DOOR2   = exports.DOOR2   = { isEmpty: false, isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: true, door: 2 };
var DOOR3   = exports.DOOR3   = { isEmpty: false, isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: true, door: 3 };

var tileBySprite = {
	'0': SOLID,
	'1': ONE_WAY,
	'6': KILL,
	'7': GLASS,
	'16': DOOR1,
	'33': GLASS, // Key item in glass
	'67': SOLID, // Chained ball in Solid tile
};

exports.getTileFromMapItem = function (mapItem) {
	if (!mapItem) return EMPTY;
	return tileBySprite[mapItem.tile] || EMPTY;
};

