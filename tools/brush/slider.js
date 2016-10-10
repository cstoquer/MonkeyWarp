function shiftMap(map, dx, dy, w, h) {
	var copy = map.copy();
	map.paste(copy, dx, dy);
	if (dx < 0) map.paste(copy, w + dx, dy);
	if (dx > 0) map.paste(copy, dx - w, dy);
	if (dy < 0) map.paste(copy, dx, h + dy);
	if (dy > 0) map.paste(copy, dx, dy - h);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name: 'slider',
	description: 'Shift the whole map in any of 4 directions.',

	start: function (x, y, toolbox) {
		var map = toolbox.mapEditor.map;
		var w = map.width;
		var h = map.height;

		// decide which direction we should shift
		var a = Math.atan2(y - h / 2, x - w / 2) * (4 / Math.PI);
		if (a < 0) a += 8;
		var dx = 0;
		var dy = 0;

		     if (a < 1) dx =  1;
		else if (a < 3) dy =  1;
		else if (a < 5) dx = -1;
		else if (a < 7) dy = -1;
		else            dx =  1;

		shiftMap(map, dx, dy, w, h);
	}
}