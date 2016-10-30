var viewManager = require('./viewManager');
var util        = require('domUtils');


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function onClic(e, dom) {
	console.log('open', dom.index)
	viewManager.open('game', { level: dom.index });
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var panel   = util.createDiv('panel');
var openBtn = util.createDiv('button', panel);
var content = util.createDiv('', panel);

var isDisplayed = false;
content.style.display = 'none';
openBtn.innerText = '+';

util.makeButton(openBtn, function () {
	isDisplayed = !isDisplayed;
	content.style.display = isDisplayed ? '' : 'none';
})

var levels = assets.levels;
for (var i = 0; i < levels.length; i++) {
	if (levels[i].intermission) continue;
	var button = util.createDiv('button', content);
	button.innerText = levels[i].id;
	button.index = i;
	util.makeButton(button, onClic);
}

