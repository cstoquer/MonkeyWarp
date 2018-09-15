
var clipboard;
var tilesheet;


var mapInit; // copy of the map
var mapCopy; // the map to stamp
var isCopying;
var sx, sy; // start position

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var timeout = null;
var flip = false;

function displaySelectedZone(map, x0, y0, x1, y1) {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}
	timeout = setTimeout(function () {
		displaySelectedZone(map, x0, y0, x1, y1);
	}, 200);

	flip = !flip;

	if (flip) {
		map.paste(mapInit);
	} else {
		for (var x = x0; x <= x1; x++) {
		for (var y = y0; y <= y1; y++) {
			map.remove(x, y);
		}}
	}
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name: 'Copy',
	icon: 'stamp', // icon to use: "brush" | "bucket" | "dashbox" | "pencil" | "rubber" | "stamp" |
	description: 'Paste clipboard content at choosen position. Right-clic to copy a rectangle area to clipboard.',
	select: function (toolbox, listItem) {
		clipboard = toolbox.mapClipboard;
		tilesheet = toolbox.tilesheet;
	},

	start: function (x, y, map, toolbox, e) {
		mapInit = map.copy();
		sx = x;
		sy = y;
		isCopying = false;
	},

	draw: function (x, y, map, toolbox, isStart, e) {
		map.paste(mapInit);
		map.paste(clipboard.map, x - ~~(clipboard.map.width / 2), y - ~~(clipboard.map.height / 2), true);
	},

	erase: function (x, y, map, toolbox, isStart, e) {
		isCopying = true;
		displaySelectedZone(map, sx, sy, x, y);
	},

	end: function (x, y, map, toolbox, e) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}

		if (isCopying) {
			map.paste(mapInit);
			// TODO: check that map has size
			// TODO: sort top-left and bottm right
			toolbox.mapClipboard.setMap(mapInit.copy(sx, sy, x - sx + 1, y - sy + 1));
		}

		mapInit = null;
	}
};