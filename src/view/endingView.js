var TextBox     = require('../TextBox');
var viewManager = require('../viewManager');

var SPEED = 15;

var ILLUSTRATIONS = [
	[
		{ img: null,                                  duration: 4  },
		{ img: assets.illustrations.monkeyReunion2,   duration: 1  },
		{ img: assets.illustrations.monkeyReunion1,   duration: 1  },
		{ img: assets.illustrations.monkeyReunion0,   duration: 30 },
		{ img: assets.illustrations.monkeyReunion1,   duration: 1  },
		{ img: assets.illustrations.monkeyReunion2,   duration: 1  },
		{ img: null,                                  duration: 2  }
	],
	[
		{ img: null,                                  duration: 4  },
		{ img: assets.illustrations.monkeyStorytime2, duration: 1  },
		{ img: assets.illustrations.monkeyStorytime1, duration: 1  },
		{ img: assets.illustrations.monkeyStorytime0, duration: 30 },
		{ img: assets.illustrations.monkeyStorytime1, duration: 1  },
		{ img: assets.illustrations.monkeyStorytime2, duration: 1  },
		{ img: null,                                  duration: 8  },
		{ img: null,                                  duration: 1  }
	],
];

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var textbox = new TextBox(160, 24, assets.font.tetris).setColor(0);
textbox.addText("      THE END.", 0, 0);
textbox.addText(" THANKS FOR PLAYING", 0, 16);


var timer        = 0;
var illustration = 0;
var frame        = 0;
var speedrunEnabled = false;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	params = params || {};
	speedrunEnabled = !!params.speedrun;
	timer = 0;
	camera(0, 0);
	paper(0).cls();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	timer -= 1;

	if (timer > 0) return;
	var data = ILLUSTRATIONS[illustration][frame];
	timer = data.duration * SPEED;
	if (data.img) {
		draw(data.img, 0, 0);
	} else {
		paper(0).cls();
	}
	
	frame += 1;
	if (frame >= ILLUSTRATIONS[illustration].length) {
		frame = 0;
		illustration += 1;
		if (illustration >= ILLUSTRATIONS.length) {
			// finish
			if (speedrunEnabled) return viewManager.open('speedrunResult');
			draw(textbox.texture, 0, 64);
			timer = Infinity;
		}
	}
};
