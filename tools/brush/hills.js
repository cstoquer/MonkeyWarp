
var clipboard;
var mapInit;
var tilesheet;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function drawRectangle(map, x0, y0, x1, y1) {
	// check that rectangle have dimension
	if (x0 === x1 && y0 === y1) return;

	// set start and end coordinate in correct order
	if (x0 > x1) { var x = x0; x0 = x1; x1 = x; }
	if (y0 > y1) { var y = y0; y0 = y1; y1 = y; }

	// top-left sprite
	var s = tilesheet.sprite;

	// special case: if hill width is 1
	if (x1 === x0) {
		for (var y = y0; y <= y1; y++) {
			var j = y === y0 ? 0 : 1;
			map.set(x0, y, 3 + s + j * 16);
		}
		return;
	}

	// fill rectangle
	for (var x = x0; x <= x1; x++) {
	for (var y = y0; y <= y1; y++) {
		var i = x === x0 ? 0 : x === x1 ? 2 : 1;
		var j = y === y0 ? 0 : 1;
		map.set(x, y, s + i + j * 16);
	}}
}

var sx, sy; // start position
var pw, ph; // previous position

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name: 'hills',
	description: 'Draw rectangular hills using 6 + 2 grid.\nSelect the top left corner of the hill pattern in the tilesheet.',
	select: function (toolbox, listItem) {
		clipboard = toolbox.mapClipboard;
		tilesheet = toolbox.tilesheet;
	},

	start: function (x, y, map, toolbox, e) {
		mapInit = map.copy();
		sx = x;
		sy = y;
		pw = ph = 0;
	},

	draw: function (x, y, map, toolbox, isStart, e) {
		var h = Math.abs(x - sx);
		var w = Math.abs(y - sy);
		if (w < pw || h < ph) map.paste(mapInit);
		drawRectangle(map, sx, sy, x, y);
		pw = w;
		ph = h;
	},

	end: function (x, y, toolbox) {
		mapInit = null;
	}
};