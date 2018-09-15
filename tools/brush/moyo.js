var sx, sy;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name: 'moyo',
	description: 'Draw tile pattern from the clipboard',

	start: function (x, y, toolbox) {
		sx = x;
		sy = y;
	},

	draw: function (x, y, map, toolbox, isStart) {
		var clipboard = toolbox.mapClipboard;
		var tx = (x + sx) % clipboard.width;
		var ty = (y + sy) % clipboard.height;
		var item = clipboard.get(tx, ty);
		map.set(x, y, item.sprite, item.flipH, item.flipV, item.flipR, item.flagA, item.flagB);
	}
}