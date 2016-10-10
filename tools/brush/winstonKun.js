var tilePartByNeighbour = [
	{ x: 0, y: 0 }, // 0
	{ x: 3, y: 0 }, // 3
	{ x: 0, y: 1 }, // 4
	{ x: 3, y: 1 }, // 7
	{ x: 1, y: 0 }, // 1
	{ x: 2, y: 0 }, // 2
	{ x: 1, y: 1 }, // 5
	{ x: 2, y: 1 }, // 6
	{ x: 0, y: 3 }, // 12
	{ x: 3, y: 3 }, // 15
	{ x: 0, y: 2 }, // 8
	{ x: 3, y: 2 }, // 11
	{ x: 1, y: 3 }, // 13
	{ x: 2, y: 3 }, // 14
	{ x: 1, y: 2 }, // 9
	{ x: 2, y: 2 }  // 10
];

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getTile(sprite) {
	var x = sprite % 16;
	var y = ~~(sprite / 16);
	var i = ~~(x / 4);
	var j = ~~(y / 4);
	return { x: i, y: j, id: i + j * 4 };
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getMapTile(map, x, y) {
	var item = map.get(x, y);
	if (item === null) return -1;
	return getTile(item.sprite);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getTileNeighbour(x, y, map, tile) {
	var t0 = y <= 0              ? true : getMapTile(map, x,     y - 1).id === tile.id;
	var t1 = x >= map.width  - 1 ? true : getMapTile(map, x + 1, y    ).id === tile.id;
	var t2 = y >= map.height - 1 ? true : getMapTile(map, x,     y + 1).id === tile.id;
	var t3 = x <= 0              ? true : getMapTile(map, x - 1, y    ).id === tile.id;

	var neighbour = t0 * 8 + t1 * 4 + t2 * 2 + t3;
	return neighbour;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function setSpriteAtPosition(x, y, sprite, map) {
	var tile = getTile(sprite);
	var neighbour = getTileNeighbour(x, y, map, tile);
	var part = tilePartByNeighbour[neighbour];

	var sprite = tile.x * 4 + part.x + (tile.y * 4 + part.y) * 16;
	map.set(x, y, sprite, false, false, false);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function setNeighbourSprite(x, y, map) {
	if (x < 0 || x >= map.width || y < 0 || y >= map.height) return;
	var item = map.get(x, y);
	if (item === null) return;
	setSpriteAtPosition(x, y, item.sprite, map);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name:     'winston-kun',
	description: 'Simple autotiler',
	select:   null,
	deselect: null,
	start:    null,
	end:      null,
	draw: function (x, y, toolbox, isStart) {
		var toolbox     = toolbox;
		var mapEditor   = toolbox.mapEditor;
		var spritesheet = toolbox.spritesheet;
		var keyboard    = toolbox.keyboard;
		var map = mapEditor.map;

		if (keyboard.shift) {
			map.remove(x, y);
		} else {
			// set sprite at position
			setSpriteAtPosition(x, y, spritesheet.sprite, map);
		}

		// update around
		setNeighbourSprite(x + 1, y, map);
		setNeighbourSprite(x - 1, y, map);
		setNeighbourSprite(x, y + 1, map);
		setNeighbourSprite(x, y - 1, map);
	}
}