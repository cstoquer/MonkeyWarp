var viewManager = require('./viewManager');
require('./debug');

viewManager.addView('splash',       require('./view/splashView'));
viewManager.addView('title',        require('./view/titleView'));
viewManager.addView('game',         require('./view/gameView'));
viewManager.addView('intermission', require('./view/intermissionView'));
viewManager.addView('credit',       require('./view/creditView'));
viewManager.addView('gameover',     require('./view/gameoverView'));
viewManager.addView('ending',       require('./view/endingView'));

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// setting audiomanager
audioManager.settings.defaultFade = 0.01;
audioManager.addChannel('banana'); // channel for the flying banana looped sound
audioManager.channels.sfx.setVolume(0.8);
audioManager.channels.banana.setVolume(0.8);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
viewManager.open('splash');

require('./audioPreloading');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Update is called once per frame
exports.update = viewManager.update;
