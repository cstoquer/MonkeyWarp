
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name: 'randomizer',
	description: 'Draw a random tile from the clipboard',

	erase: function (x, y, map) {
		map.remove(x, y);
	},

	draw: function (x, y, map, toolbox, isStart) {
		var clipboard = toolbox.mapClipboard.map;
		var tile = clipboard.get(
			~~(Math.random() * clipboard.width),
			~~(Math.random() * clipboard.height)
		);
		map.set(x, y, tile.sprite, tile.flipH, tile.flipV, tile.flipR);
	}
};