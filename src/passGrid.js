var Map = require('Map');

var GRID = getMap('passGrid');
var BUBBLE = 7;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var SYMBOLS = '.D*Rw<4yAp1ilc83-z>q#t02rxBj+CkE';
var SYMBOL_MAP = {};

(function createSymbolMap() {
	for (var i = 0; i < SYMBOLS.length; i++) {
		var chr = SYMBOLS[i];
		SYMBOL_MAP[chr] = i;
	}
})();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getMatrixFromWord(word) {
	if (word.length != 5) return null;
	var matrix = [];
	for (var w = 0; w < word.length; w++) {
		var chr = word[w];
		var symbol = SYMBOL_MAP[chr];
		if (symbol === undefined) return null;
		for (var c = 0; c < 5; c++) {
			var value = (symbol >> c) & 1;
			matrix.push(!!value);
		}
	}
	return matrix;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getWordFromMatrix(matrix) {
	if (matrix.length !== 25) return null;
	var word = '';
	for (var w = 0; w < 5; w++) {
		var chr = 0;
		for (var c = 0; c < 5; c++) {
			var value = matrix[w * 5 + c];
			if (value) chr += 1 << c;
		}
		word += SYMBOLS[chr];
	}
	return word;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function PassGrid() {
	this.matrix = new Array(25);
	this.grid   = new Map(5, 5).setTilesheet(assets.tilesheet);
}

module.exports = PassGrid;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PassGrid.prototype.setPassword = function(word) {
	var matrix = getMatrixFromWord(word);
	for (x = 0; x < 5; x++) {
	for (y = 0; y < 5; y++) {
		var value = matrix[x * 5 + y];
		if (value) this.grid.set(x, y, BUBBLE);
		else this.grid.remove(x, y);
	}}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PassGrid.prototype.getPassword = function() {
	return getWordFromMatrix(this.matrix);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PassGrid.prototype.switchBit = function(x, y) {
	if (this.grid.get(x, y)) {
		this.grid.remove(x, y);
		this.matrix[x * 5 + y] = false;
	} else {
		this.grid.set(x, y, BUBBLE);
		this.matrix[x * 5 + y] = true;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PassGrid.prototype.draw = function(x, y) {
	draw(GRID, x, y);
	draw(this.grid, x + 8, y + 8);
};