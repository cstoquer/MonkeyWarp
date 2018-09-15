
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports = {
	name: 'randomizer',
	description: 'Draw a random tile from the clipboard',

	draw: function (x, y, map, toolbox, isStart) {
		//delete
		if (toolbox.keyboard.shift) {
			map.remove(x, y);
			return;
		}

		//draw
		var clipboard = toolbox.mapClipboard;
		var item = clipboard.get(
			~~(Math.random() * clipboard.width),
			~~(Math.random() * clipboard.height)
		);
		map.set(x, y, item.sprite, item.flipH, item.flipV, item.flipR, item.flagA, item.flagB);
	}
}