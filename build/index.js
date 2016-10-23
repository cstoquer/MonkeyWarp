(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function EventEmitter() {
	this._events = {};
};

module.exports = EventEmitter;

EventEmitter.listenerCount = function (emitter, evt) {
	var handlers = emitter._events[evt];
	return handlers ? handlers.length : 0;
};

EventEmitter.prototype.on = function (evt, fn) {
	if (typeof fn !== 'function') {
		throw new TypeError('Tried to register non-function as event handler for event: ' + evt);
	}

	// we emit first, because if evt is "newListener" it would go recursive
	this.emit('newListener', evt, fn);

	var allHandlers = this._events;
	var evtHandlers = allHandlers[evt];
	if (evtHandlers === undefined) {
		// first event handler for this event type
		allHandlers[evt] = [fn];
	} else {
		evtHandlers.push(fn);
	}

	return this;
};

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.once = function (evt, fn) {
	if (!fn.once) {
		fn.once = 1;
	} else {
		fn.once += 1;
	}

	return this.on(evt, fn);
};

EventEmitter.prototype.setMaxListeners = function () {
	console.warn('Method setMaxListeners not supported, there is no limit to the number of listeners');
};

EventEmitter.prototype.removeListener = function (evt, handler) {
	// like node.js, we only remove a single listener at a time, even if it occurs multiple times

	var handlers = this._events[evt];
	if (handlers !== undefined) {
		var index = handlers.indexOf(handler);
		if (index !== -1) {
			handlers.splice(index, 1);

			if (handlers.length === 0) {
				delete this._events[evt];
			}

			this.emit('removeListener', evt, handler);
		}
	}
	return this;
};

EventEmitter.prototype.removeAllListeners = function (evt) {
	if (evt) {
		delete this._events[evt];
	} else {
		this._events = {};
	}
	return this;
};

EventEmitter.prototype.hasListeners = function (evt) {
	return this._events[evt] !== undefined;
};

EventEmitter.prototype.listeners = function (evt) {
	var handlers = this._events[evt];
	if (handlers !== undefined) {
		return handlers.slice();
	}

	return [];
};

EventEmitter.prototype.emit = function (evt) {
	var handlers = this._events[evt];
	if (handlers === undefined) {
		return false;
	}

	// copy handlers into a new array, so that handler removal doesn't affect array length
	handlers = handlers.slice();

	var hadListener = false;

	// copy all arguments, but skip the first (the event name)
	var args = [];
	for (var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	}

	for (var i = 0, len = handlers.length; i < len; i++) {
		var handler = handlers[i];

		handler.apply(this, args);
		hadListener = true;

		if (handler.once) {
			if (handler.once > 1) {
				handler.once--;
			} else {
				delete handler.once;
			}

			this.removeListener(evt, handler);
		}
	}

	return hadListener;
};
},{}],2:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Map
 * @author Cedric Stoquer
 */

// var settings = require('../../settings.json');
var Texture  = require('../Texture');

var SPRITE_WIDTH  = settings.spriteSize[0];
var SPRITE_HEIGHT = settings.spriteSize[1];


var _mapById = {};
window.getMap = function (name) {
	return _mapById[name];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function MapItem(x, y, sprite, flipH, flipV, flipR, flagA, flagB) {
	this.x      = ~~x;
	this.y      = ~~y;
	this.sprite = ~~sprite;
	this.flipH  = !!flipH;
	this.flipV  = !!flipV;
	this.flipR  = !!flipR;
	this.flagA  = !!flagA;
	this.flagB  = !!flagB;
}

MapItem.prototype.draw = function (texture) {
	texture.sprite(this.sprite, this.x * SPRITE_WIDTH, this.y * SPRITE_HEIGHT, this.flipH, this.flipV, this.flipR);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function PixelboxMap(width, height) {
	this._name  = '';
	this.width  = 0;
	this.height = 0;
	this.items  = [];
	this.texture = new Texture(width * SPRITE_WIDTH, height * SPRITE_HEIGHT);
	this._spritesheetPath = '';

	if (width && height) this._init(width, height);
}
module.exports = PixelboxMap;

PixelboxMap.prototype._isMap = true;

Object.defineProperty(PixelboxMap.prototype, 'name', {
	get: function () { return this._name; },
	set: function (name) {
		if (this._name && _mapById[this._name] && _mapById[this._name] === this) delete _mapById[this._name];
		this._name = name;
		if (name && !_mapById[name]) _mapById[name] = this;
	}
});

PixelboxMap.prototype._init = function (width, height) {
	this.texture.resize(width * SPRITE_WIDTH, height * SPRITE_HEIGHT);
	this.width  = width;
	this.height = height;
	this.items  = [];
	for (var x = 0; x < width; x++) {
		this.items.push([]);
		for (var y = 0; y < height; y++) {
			this.items[x][y] = null;
		}
	}
};

PixelboxMap.prototype.resize = function (width, height) {
	var items = this.items;
	var w = Math.min(this.width,  width);
	var h = Math.min(this.height, height);
	this.texture.resize(width * SPRITE_WIDTH, height * SPRITE_HEIGHT);
	this._init(width, height);
	for (var x = 0; x < w; x++) {
	for (var y = 0; y < h; y++) {
		this.items[x][y] = items[x][y];
	}}
	this.redraw();
	return this;
};

PixelboxMap.prototype.set = function (x, y, sprite, flipH, flipV, flipR, flagA, flagB) {
	if (sprite === null || sprite === undefined) return this.remove(x, y);
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
	var item = this.items[x][y] = new MapItem(x, y, sprite, flipH, flipV, flipR, flagA, flagB);
	this.texture.ctx.clearRect(x * SPRITE_WIDTH, y * SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT);
	item.draw(this.texture);
	return this;
};

PixelboxMap.prototype.remove = function (x, y) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
	this.items[x][y] = null;
	this.texture.ctx.clearRect(x * SPRITE_WIDTH, y * SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT);
	return this;
};

PixelboxMap.prototype.get = function (x, y) {
	if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null;
	return this.items[x][y];
};

PixelboxMap.prototype.redraw = function () {
	this.texture.clear();
	for (var x = 0; x < this.width;  x++) {
	for (var y = 0; y < this.height; y++) {
		this.items[x][y] && this.items[x][y].draw(this.texture);
	}}
	return this;
};

PixelboxMap.prototype.draw = function (x, y) {
	draw(this.texture, x, y);
};

PixelboxMap.prototype.setSpritesheet = function (spritesheet) {
	this._spritesheetPath = spritesheet && spritesheet.path || '';
	this.texture.setSpritesheet(spritesheet);
	this.redraw();
	return this;
};

PixelboxMap.prototype._setSpritesheetPath = function (path) {
	this._spritesheetPath = path || '';
	if (!path) return this.setSpritesheet();
	path = path.split('/');
	fileId = path.pop();
	var dir = assets;
	for (var i = 0; i < path.length; i++) {
		dir = dir[path[i]];
		if (!dir) return console.warn('Could not find spritesheet', path); // failed to find spritesheet.
	}
	var img = dir[fileId];
	if (img && img instanceof Image) this.setSpritesheet(img);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var encode, decode;

(function () {
	var BASE = "#$%&'()*+,-~/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}. !";
	var INVERSE = {};
	for (var i = 0; i < BASE.length; i++) INVERSE[BASE[i]] = i;

	var LENGTH = BASE.length;
	var NULL = LENGTH * LENGTH - 1;
	var DUPL = Math.pow(2, 13);
	var MAX_DUPL = NULL - DUPL - 1;

	function getCode(value) {
		var be = ~~(value / LENGTH);
		var le = value % LENGTH;
		return BASE[be] + BASE[le];
	}

	encode = function (arr) {
		str = '';
		count = 0;
		for (var i = 0; i < arr.length; i++) {
			var value = arr[i];
			if (value === arr[i + 1] && ++count < MAX_DUPL) continue;
			if (value === null) value = NULL;
			str += getCode(value);
			if (count === MAX_DUPL) count--;
			if (count !== 0) str += getCode(DUPL + count);
			count = 0;
		}

		if (count === MAX_DUPL) count--;
		if (count !== 0) str += getCode(DUPL + count);
		return str;
	}

	decode = function (str) {
		arr = [];
		for (var i = 0; i < str.length;) {
			var be = str[i++];
			var le = str[i++];
			var value = INVERSE[be] * LENGTH + INVERSE[le];
			if (value === NULL) {
				arr.push(null);
			} else if (value > DUPL) {
				var count = value - DUPL;
				var duplicate = arr[arr.length - 1];

				for (var j = 0; j < count; j++) {
					arr.push(duplicate);
				}
			} else {
				arr.push(value);
			}
		}
		return arr;
	}
})();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PixelboxMap.prototype.save = function () {
	var w = this.width;
	var h = this.height;
	var arr = new Array(w * h);
	for (var x = 0; x < w; x++) {
	for (var y = 0; y < h; y++) {
		var item = this.items[x][y];
		arr[x + y * w] = item ? item.sprite + (item.flipH << 8) + (item.flipV << 9) + (item.flipR << 10) + (item.flagA << 11)  + (item.flagB << 12) : null;
	}}

	var obj = { w: w, h: h, name: this.name, sheet: this._spritesheetPath || '', data: encode(arr) };
	return obj;
};

PixelboxMap.prototype.load = function (obj) {
	var w = obj.w;
	var h = obj.h;
	this._init(w, h);
	this.name = obj.name || '';
	this._setSpritesheetPath(obj.sheet);
	var arr = decode(obj.data);
	for (var x = 0; x < w; x++) {
	for (var y = 0; y < h; y++) {
		var d = arr[x + y * w];
		if (d === null) continue;
		var sprite =  d & 255;
		var flipH  = (d >> 8 ) & 1;
		var flipV  = (d >> 9 ) & 1;
		var flipR  = (d >> 10) & 1;
		var flagA  = (d >> 11) & 1;
		var flagB  = (d >> 12) & 1;
		this.set(x, y, sprite, flipH, flipV, flipR, flagA, flagB);
	}}

	this.redraw();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PixelboxMap.prototype.copy = function (x, y, w, h) {
	x = x || 0;
	y = y || 0;
	if (w === undefined || w === null) w = this.width; 
	if (h === undefined || h === null) h = this.height;
	var map = new PixelboxMap(w, h);
	map.paste(this, -x, -y);
	return map;
};

PixelboxMap.prototype.paste = function (map, x, y, merge) {
	x = x || 0;
	y = y || 0;
	var width  = Math.min(map.width,  this.width  - x);
	var height = Math.min(map.height, this.height - y);
	var sx = Math.max(0, -x);
	var sy = Math.max(0, -y);

	for (var i = sx; i < width; i++) {
		for (var j = sy; j < height; j++) {
			var item = map.items[i][j];
			if (!item) {
				if (merge) continue;
				this.remove(i + x, j + y);
				continue;
			}
			this.set(i + x, j + y, item.sprite, item.flipH, item.flipV, item.flipR, item.flagA, item.flagB);
		}
	}
	this.redraw();
	return this;
};

PixelboxMap.prototype.clear = function () {
	for (var x = 0; x < this.width;  x++) {
	for (var y = 0; y < this.height; y++) {
		this.items[x][y] = null;
	}}
	this.texture.clear();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
PixelboxMap.prototype._findNull = function () {
	var result = [];
	for (var x = 0; x < this.width;  x++) {
	for (var y = 0; y < this.height; y++) {
		if (this.items[x][y] === null) result.push({ x: x, y: y });
	}}
	return result;
};

PixelboxMap.prototype.find = function (sprite, flagA, flagB) {
	if (sprite === null) return this._findNull();
	if (flagA === undefined) flagA = null;
	if (flagB === undefined) flagB = null;
	var result = [];
	for (var x = 0; x < this.width;  x++) {
	for (var y = 0; y < this.height; y++) {
		var item = this.items[x][y];
		if (!item) continue;
		var isSameFlagA = flagA === null || item.flagA === flagA;
		var isSameFlagB = flagB === null || item.flagB === flagB;
		if (item.sprite === sprite && isSameFlagA && isSameFlagB) result.push(item);
	}}
	return result;
};


},{"../Texture":26}],3:[function(require,module,exports){
var Transition         = require('./Transition');
var TransitionRelative = require('./TransitionRelative');

var easingFunctions        = require('./easing');
var interpolationFunctions = require('./interpolation');


// Temporisation, used for waiting
function Temporisation(start, duration, toObject, properties) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.properties = properties;
	this.to = toObject;
}

Temporisation.prototype.update = function (object) {
	for (var p = 0; p < this.properties.length; p += 1) {
		var property = this.properties[p];
		object[property] = this.to[property];
	}
};

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function AbstractTween(object, properties) {
	// Tweened object
	this._object = object;

	if ((properties === null || properties === undefined) && (object instanceof Array)) {
		// Given object is an array
		// Its properties to tween are the indices of the array
		properties = [];
		for (var p = 0; p < object.length; p += 1) {
			properties[p] = p;
		}
	}

	// Properties to tween
	this._properties = properties;

	// Starting property values
	// By default is a copy of given object property values
	this._from = null;

	// Property interpolations
	this._interpolations = null;

	// Current transition index
	this._index = 0;

	// List of transitions of the tween
	this._transitions = [];

	// Whether the tween is relative
	this._relative = false;

	// Current time
	this._time = 0;

	// Total duration
	this._duration = 0;
}
module.exports = AbstractTween;

AbstractTween.prototype.relative = function (relative) {
	this._relative = relative;
	return this;
};

AbstractTween.prototype.reset = function () {
	this._index       = 0;
	this._duration    = 0;
	this._transitions = [];
	return this;
};

AbstractTween.prototype.interpolations = function (interpolations) {
	// The API allows to pass interpolation names that will be replaced
	// by the corresponding interpolation functions
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		var interpolation = interpolations[property];
		if (interpolation === undefined) {
			interpolations[property] = interpolationFunctions.linear;
			continue;
		}

		if (typeof(interpolation) === 'string') {
			// Replacing interpolation name by interpolation function
			if (interpolationFunctions[interpolation] === undefined) {
				console.warn('[AbstractTween.interpolations] Given interpolation does not exist');
				interpolations[property] = interpolationFunctions.linear;
			} else {
				interpolations[property] = interpolationFunctions[interpolation];
			}
		}
	}

	this._interpolations = interpolations;
	return this;
};

AbstractTween.prototype.from = function (fromObject) {
	this._from = fromObject;

	if (this._transitions.length > 0) {
		this._transitions[0].from = fromObject;
	}

	return this;
};

AbstractTween.prototype._setFrom = function () {
	// Copying properties of tweened object
	this._from = {};
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		this._from[property] = (this._relative === true) ? 0 : this._object[property];
	}

	return this._from;
};

AbstractTween.prototype._getLastTransitionEnding = function () {
	if (this._transitions.length > 0) {
		return (this._relative === true) ? this._setFrom() : this._transitions[this._transitions.length - 1].to;
	} else {
		return (this._from === null) ? this._setFrom() : this._from;
	}
};

AbstractTween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	// The API allows to pass easing names that will be replaced
	// by the corresponding easing functions
	if (typeof(easing) === 'string') {
		// Replacing easing name by easing function
		if (easingFunctions[easing] === undefined) {
			console.warn('[AbstractTween.to] Given easing does not exist');
			easing = undefined;
		} else {
			easing = easingFunctions[easing];
		}
	}

	// Getting previous transition ending as the beginning for the new transition
	var fromObject = this._getLastTransitionEnding();

	var TransitionConstructor = (this._relative === true) ? TransitionRelative : Transition;
	var transition = new TransitionConstructor(
		this._properties,
		fromObject,
		toObject,
		this._duration, // starting time
		duration,
		easing,
		easingParam,
		this._interpolations,
		interpolationParams
	);

	this._transitions.push(transition);
	this._duration += duration;
	return this;
};

AbstractTween.prototype.wait = function (duration) {
	var toObject = this._getLastTransitionEnding();
	this._transitions.push(new Temporisation(this._duration, duration, toObject, this._properties));
	this._duration += duration;
	return this;
};

AbstractTween.prototype._update = function () {
	// Finding transition corresponding to current time
	var transition = this._transitions[this._index];
	while (transition.end <= this._time) {
		if (this._index === (this._transitions.length - 1)) {
			transition.update(this._object, 1);
			return;
		}

		if (this._relative === true ) {
			transition.update(this._object, 1);
		}

		transition = this._transitions[++this._index];
	}

	while (this._time <= transition.start) {
		if (this._index === 0) {
			transition.update(this._object, 0);
			return;
		}

		if (this._relative === true ) {
			transition.update(this._object, 0);
		}

		transition = this._transitions[--this._index];
	}

	// Updating the object with respect to the current transition and time
	transition.update(this._object, (this._time - transition.start) / transition.duration);
};

AbstractTween.prototype._validate = function () {
	if (this._transitions.length === 0) {
		console.warn('[AbstractTween._validate] Cannot start a tween with no transition:', this);
		return false;
	}

	return true;
};
},{"./Transition":18,"./TransitionRelative":19,"./easing":22,"./interpolation":25}],4:[function(require,module,exports){

function BriefExtension() {
	// Local duration of the playable, independent from speed and iterations
	this._duration = 0;

	// On complete callback
	this._onComplete = null;

	// Playing options
	this._iterations = 1; // Number of times to iterate the playable
	this._pingpong = false; // To make the playable go backward on even iterations
	this._persist  = false; // To keep the playable running instead of completing
}

module.exports = BriefExtension;

BriefExtension.prototype.setSpeed = function (speed) {
	if (speed === 0) {
		if (this._speed !== 0) {
			// Setting timeStart as if new speed was 1
			this._startTime += this._time / this._speed - this._time;
		}
	} else {
		if (this._speed === 0) {
			// If current speed is 0,
			// it corresponds to a virtual speed of 1
			// when it comes to determing where the starting time is
			this._startTime += this._time - this._time / speed;
		} else {
			this._startTime += this._time / this._speed - this._time / speed;
		}
	}

	this._speed = speed;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

BriefExtension.prototype.onComplete = function (onComplete) {
	this._onComplete = onComplete;
	return this;
};

BriefExtension.prototype.getDuration = function () {
	// Duration from outside the playable
	return this._duration * this._iterations / this._speed;
};

BriefExtension.prototype._setDuration = function (duration) {
	this._duration = duration;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

BriefExtension.prototype._extendDuration = function (durationExtension) {
	this._duration += durationExtension;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

BriefExtension.prototype._getEndTime = function () {
	if (this._speed > 0) {
		return this._startTime + this.getDuration();
	} else if (this._speed < 0) {
		return this._startTime;
	} else {
		return Infinity;
	}
};

BriefExtension.prototype._setStartTime = function (startTime) {
	if (this._speed > 0) {
		this._startTime = startTime;
	} else if (this._speed < 0) {
		this._startTime = startTime - this.getDuration();
	} else {
		this._startTime = Infinity;
	}
};

BriefExtension.prototype._getStartTime = function () {
	if (this._speed > 0) {
		return this._startTime;
	} else if (this._speed < 0) {
		return this._startTime + this.getDuration();
	} else {
		return -Infinity;
	}
};

BriefExtension.prototype._isTimeWithin = function (time) {
	if (this._speed > 0) {
		return (this._startTime < time) && (time < this._startTime + this.getDuration());
	} else if (this._speed < 0) {
		return (this._startTime + this.getDuration() < time) && (time < this._startTime);
	} else {
		return true;
	}
};

BriefExtension.prototype._overlaps = function (time0, time1) {
	if (this._speed > 0) {
		return (this._startTime - time1) * (this._startTime + this.getDuration() - time0) <= 0;
	} else if (this._speed < 0) {
		return (this._startTime + this.getDuration() - time1) * (this._startTime - time0) <= 0;
	} else {
		return true;
	}
};

BriefExtension.prototype.goToEnd = function () {
	return this.goTo(this.getDuration(), this._iterations - 1);
};

BriefExtension.prototype.loop = function () {
	return this.iterations(Infinity);
};

BriefExtension.prototype.iterations = function (iterations) {
	if (iterations < 0) {
		console.warn('[BriefExtension.iterations] Number of iterations cannot be negative');
		return this;
	}

	this._iterations = iterations;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

BriefExtension.prototype.persist = function (persist) {
	this._persist = persist;
	return this;
};

BriefExtension.prototype.pingpong = function (pingpong) {
	this._pingpong = pingpong;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

BriefExtension.prototype._complete = function (overflow) {
	if (this._persist === true) {
		// Playable is persisting
		// i.e it never completes
		this._startTime += overflow;
		this._player._onPlayableChanged(this);
		return;
	}

	// Inactivating playable before it completes
	// So that the playable can be reactivated again within _onComplete callback
	if (this._player._inactivate(this) === false) {
		// Could not be completed
		return this;
	}

	if (this._onComplete !== null) { 
		this._onComplete(overflow);
	}
};

var epsilon = 1e-6;
BriefExtension.prototype._moveTo = function (time, dt, playerOverflow) {
	dt *= this._speed;

	// So many conditions!!
	// That is why this extension exists
	// i.e playables without durations do not need all those options

	// Computing overflow and clamping time
	var overflow;
	if (dt !== 0) {
		if (this._iterations === 1) {
			// Converting into local time (relative to speed and starting time)
			this._time = (time - this._startTime) * this._speed;
			if (dt > 0) {
				if (this._time >= this._duration) {
					overflow = this._time - this._duration;
					// dt -= overflow;
					this._time = this._duration;
				} else if (this._time < 0) {

				}
			} else if (dt < 0) {
				if (this._time <= 0) {
					overflow = this._time;
					// dt -= overflow;
					this._time = 0;
				}
			}
		} else {
			time = (time - this._startTime) * this._speed;

			// Iteration at current update
			var iteration = time / this._duration;
			if (dt > 0) {
				if (0 < iteration && iteration < this._iterations) {
					this._time = time % this._duration;
				} else {
					overflow = (iteration - this._iterations) * this._duration;
					this._time = this._duration * (1 - (Math.ceil(this._iterations) - this._iterations));
				}
			} else if (dt < 0) {
				if (0 < iteration && iteration < this._iterations) {
					this._time = time % this._duration;
				} else {
					overflow = iteration * this._duration;
					this._time = 0;
				}
			}

			if ((this._pingpong === true)) {
				if (overflow === undefined) {
					if ((Math.ceil(iteration) & 1) === 0) {
						this._time = this._duration - this._time;
					}
				} else {
					if (Math.ceil(this._iterations) === this._iterations) {
						if ((Math.ceil(this._iterations) & 1) === 0) {
							this._time = this._duration - this._time;
						}
					}
				}
			}
		}
	}

	if (playerOverflow !== undefined && overflow === undefined) {
		// Ensuring that the playable overflows when its player overflows
		// This conditional is to deal with Murphy's law:
		// There is one in a billion chance that a player completes while one of his playable
		// does not complete due to stupid rounding errors
		if (dt > 0 && this.duration - this._time < epsilon) {
			// overflow = Math.max((time - this._startTime) * this._speed - this._duration * this._iterations, overflow);
			overflow = playerOverflow;
			this._time = this._duration;
		} else if (dt < 0 && this._time < epsilon) {
			// overflow = Math.min((time - this._startTime) * this._speed, overflow);
			overflow = playerOverflow;
			this._time = 0;
		}
	}

	this._update(dt, overflow);

	if (this._onUpdate !== null) {
		if (overflow === undefined) {
			this._onUpdate(this._time, dt);
		} else {
			this._onUpdate(this._time, dt - overflow);
		}
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};
},{}],5:[function(require,module,exports){
var inherit        = require('./inherit');
var Playable       = require('./Playable');
var BriefExtension = require('./BriefExtension');

function BriefPlayable() {
	Playable.call(this);
	BriefExtension.call(this);
}

BriefPlayable.prototype = Object.create(Playable.prototype);
BriefPlayable.prototype.constructor = BriefPlayable;
inherit(BriefPlayable, BriefExtension);

module.exports = BriefPlayable;
},{"./BriefExtension":4,"./Playable":10,"./inherit":24}],6:[function(require,module,exports){
var inherit        = require('./inherit');
var Player         = require('./Player');
var BriefExtension = require('./BriefExtension');

function BriefPlayer() {
	Player.call(this);
	BriefExtension.call(this);
}
BriefPlayer.prototype = Object.create(Player.prototype);
BriefPlayer.prototype.constructor = BriefPlayer;
inherit(BriefPlayer, BriefExtension);

module.exports = BriefPlayer;

BriefPlayer.prototype._onAllPlayablesRemoved = function () {
	this._duration = 0;
};

BriefPlayer.prototype._updateDuration = function () {
	var totalDuration = 0;

	var handle, playable, playableDuration;
	for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		playableDuration = playable._getStartTime() + playable.getDuration();
		if (playableDuration > totalDuration) {
			totalDuration = playableDuration;
		}
	}

	for (handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		playableDuration = playable._getStartTime() + playable.getDuration();
		if (playableDuration > totalDuration) {
			totalDuration = playableDuration;
		}
	}

	this._setDuration(totalDuration);
};

BriefPlayer.prototype._onPlayableChanged = BriefPlayer.prototype._updateDuration;
BriefPlayer.prototype._onPlayableRemoved = BriefPlayer.prototype._updateDuration;

// BriefPlayer.prototype._onPlayableChanged = function (changedPlayable) {
// 	this._warn('[BriefPlayer._onPlayableChanged] Changing a playable\'s property after attaching it to a player may have unwanted side effects',
// 		'playable:', changedPlayable, 'player:', this);
// };
},{"./BriefExtension":4,"./Player":11,"./inherit":24}],7:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');

/**
 * @classdesc
 * Manages tweening of one property or several properties of an object
 */

function Delay(duration) {
	if ((this instanceof Delay) === false) {
		return new Delay(duration);
	}

	BriefPlayable.call(this);
	this._duration = duration;
}
Delay.prototype = Object.create(BriefPlayable.prototype);
Delay.prototype.constructor = Delay;
module.exports = Delay;
},{"./BriefPlayable":5}],8:[function(require,module,exports){
/**
 * DOUBLY LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc Doubly list data structure
 *
 * Method      Time Complexity
 * ___________________________________
 *
 * add         O(1)
 * remove      O(1)
 * clear       O(n)
 *
 * Memory Complexity in O(n)
 */

function ListNode(obj, previous, next, container) {
	this.object    = obj;
	this.previous  = previous;
	this.next      = next;
	this.container = container;
}

function DoublyList() {
	this.first  = null;
	this.last   = null;
	this.length = 0;
}
module.exports = DoublyList;

DoublyList.prototype.addFront = function (obj) {
	var newNode = new ListNode(obj, null, this.first, this);
	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
	} else {
		this.first.previous = newNode;
		this.first = newNode;
	}

	this.length += 1;
	return newNode;
};
DoublyList.prototype.add = DoublyList.prototype.addFront;

DoublyList.prototype.addBack = function (obj) {
	var newNode = new ListNode(obj, this.last, null, this);
	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
	} else {
		this.last.next = newNode;
		this.last      = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.popFront = function (obj) {
	var object = this.first.object;
	this.removeByReference(this.first);
	return object;
};
DoublyList.prototype.pop = DoublyList.prototype.popFront;

DoublyList.prototype.popBack = function (obj) {
	var object = this.last.object;
	this.removeByReference(this.last);
	return object;
};

DoublyList.prototype.addBefore = function (node, obj) {
	var newNode = new ListNode(obj, node.previous, node, this);

	if (node.previous !== null) {
		node.previous.next = newNode;
	}

	node.previous = newNode;

	if (this.first === node) {
		this.first = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.addAfter = function (node, obj) {
	var newNode = new ListNode(obj, node, node.next, this);

	if (node.next !== null) {
		node.next.previous = newNode;
	}

	node.next = newNode;

	if (this.last === node) {
		this.last = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.moveToTheBeginning = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.previous === null) {
		// node is already the first one
		return true;
	}

	// Connecting previous node to next node
	node.previous.next = node.next;

	if (this.last === node) {
		this.last = node.previous;
	} else {
		// Connecting next node to previous node
		node.next.previous = node.previous;
	}

	// Adding at the beginning
	node.previous = null;
	node.next = this.first;
	node.next.previous = node;
	this.first = node;
	return true;
};

DoublyList.prototype.moveToTheEnd = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.next === null) {
		// node is already the last one
		return true;
	}

	// Connecting next node to previous node
	node.next.previous = node.previous;

	if (this.first === node) {
		this.first = node.next;
	} else {
		// Connecting previous node to next node
		node.previous.next = node.next;
	}

	// Adding at the end
	node.next = null;
	node.previous = this.last;
	node.previous.next = node;
	this.last = node;
	return true;
};

DoublyList.prototype.removeByReference = function (node) {
	if (node.container !== this) {
		console.warn('[DoublyList.removeByReference] Trying to remove a node that does not belong to the list');
		return node;
	}

	// Removing any existing reference to the node
	if (node.next === null) {
		this.last = node.previous;
	} else {
		node.next.previous = node.previous;
	}

	if (node.previous === null) {
		this.first = node.next;
	} else {
		node.previous.next = node.next;
	}

	// Removing any existing reference from the node
	node.next = null;
	node.previous = null;
	node.container = null;

	// One less node in the list
	this.length -= 1;

	return null;
};

DoublyList.prototype.remove = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			this.removeByReference(node);
			return true;
		}
	}

	return false;
};

DoublyList.prototype.getNode = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			return node;
		}
	}

	return null;
};

DoublyList.prototype.clear = function () {
	// Making sure that nodes containers are being resetted
	for (var node = this.first; node !== null; node = node.next) {
		node.container = null;
	}

	this.first  = null;
	this.last   = null;
	this.length = 0;
};

DoublyList.prototype.forEach = function (processingFunc, params) {
	for (var node = this.first; node; node = node.next) {
		processingFunc(node.object, params);
	}
};

DoublyList.prototype.toArray = function () {
	var objects = [];
	for (var node = this.first; node !== null; node = node.next) {
		objects.push(node.object);
	}

	return objects;
};
},{}],9:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');
var AbstractTween   = require('./AbstractTween');

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function NestedTween(object, properties) {
	if ((this instanceof NestedTween) === false) {
		return new NestedTween(object, properties);
	}

	BriefPlayable.call(this);

	// Map if tween per object for fast access
	this._tweensPerObject = {};

	// Array of tween for fast iteration when udpating
	this._tweens = [];

	// Property chains per object
	this._propertyChains = {};

	// Array of object chains
	this._propertyChainStrings = [];

	var objects = {};
	var propertiesPerObject = {};
	var property, propertyChainString;

	for (var p = 0; p < properties.length; p += 1) {
		var propertyString = properties[p];
		propertyChainString = propertyString.substring(0, propertyString.lastIndexOf('.'));

		if (propertiesPerObject[propertyChainString] === undefined) {
			// Fetching object and property
			var propertyChain = propertyString.split('.');
			var propertyIndex = propertyChain.length - 1;
			var propertyObject = object;

			// Following the chain to get the object
			for (var c = 0; c < propertyIndex; c += 1) {
				propertyObject = propertyObject[propertyChain[c]];
			}

			property = propertyChain[propertyIndex];
			if (propertyObject[property] instanceof Array) {
				propertiesPerObject[propertyString] = null;
				objects[propertyString] = propertyObject[property];
				this._propertyChainStrings.push(propertyString);
				this._propertyChains[propertyString] = propertyChain;
			} else {
				propertiesPerObject[propertyChainString] = [property];
				objects[propertyChainString] = propertyObject;
				this._propertyChainStrings.push(propertyChainString);

				// Removing last element of the property chain
				propertyChain.pop();

				this._propertyChains[propertyChainString] = propertyChain;
			}

		} else {
			// Object was already fetched
			property = propertyString.substring(propertyString.lastIndexOf('.') + 1);
			propertiesPerObject[propertyChainString].push(property);
		}
	}

	// Creating the tweens
	for (propertyChainString in objects) {
		var tweenObject     = objects[propertyChainString];
		var tweenProperties = propertiesPerObject[propertyChainString];
		var tween = new AbstractTween(tweenObject, tweenProperties);
		this._tweens.push(tween);
		this._tweensPerObject[propertyChainString] = tween;
	}
}
NestedTween.prototype = Object.create(BriefPlayable.prototype);
NestedTween.prototype.constructor = NestedTween;
module.exports = NestedTween;

NestedTween.prototype.relative = function (relative) {
	// Dispatching relative
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].relative(relative);
	}
	return this;
};

NestedTween.prototype.reset = function () {
	// Dispatching reset
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].reset();
	}

	this._duration = 0;
	return this;
};

NestedTween.prototype.interpolations = function (interpolations) {
	// Dispatching interpolations
	for (var o = 0; o < this._propertyChainStrings.length; o += 1) {
		var propertyChainString = this._propertyChainStrings[o];
		var propertyChain = this._propertyChains[propertyChainString];
		var chainLength   = propertyChain.length;

		var objectInterpolations = interpolations;
		for (var c = 0; c < chainLength && objectInterpolations !== undefined; c += 1) {
			objectInterpolations = objectInterpolations[propertyChain[c]];
		}

		if (objectInterpolations !== undefined) {
			this._tweensPerObject[propertyChainString].interpolations(objectInterpolations);
		}
	}

	return this;
};

NestedTween.prototype.from = function (fromObject) {
	// Dispatching from
	for (var o = 0; o < this._propertyChainStrings.length; o += 1) {
		var propertyChainString = this._propertyChainStrings[o];
		var propertyChain = this._propertyChains[propertyChainString];
		var chainLength = propertyChain.length;

		var object = fromObject;
		for (var c = 0; c < chainLength && object !== undefined; c += 1) {
			object = object[propertyChain[c]];
		}

		if (object !== undefined) {
			this._tweensPerObject[propertyChainString].from(object);
		}
	}

	return this;
};

NestedTween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	// Dispatching to
	for (var o = 0; o < this._propertyChainStrings.length; o += 1) {
		var propertyChainString = this._propertyChainStrings[o];
		var propertyChain = this._propertyChains[propertyChainString];
		var chainLength = propertyChain.length;

		var object = toObject;
		for (var c = 0; c < chainLength; c += 1) {
			object = object[propertyChain[c]];
		}

		var objectInterpolationParams = interpolationParams;
		for (c = 0; c < chainLength && objectInterpolationParams !== undefined; c += 1) {
			objectInterpolationParams = objectInterpolationParams[propertyChain[c]];
		}

		this._tweensPerObject[propertyChainString].to(object, duration, easing, easingParam, objectInterpolationParams);
	}

	this._extendDuration(duration);
	return this;
};

NestedTween.prototype.wait = function (duration) {
	// Dispatching wait
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].wait(duration);
	}

	this._extendDuration(duration);
	return this;
};

NestedTween.prototype._update = function () {
	for (var t = 0; t < this._tweens.length; t += 1) {
		var tween = this._tweens[t];
		tween._time = this._time;
		tween._update();
	}
};
},{"./AbstractTween":3,"./BriefPlayable":5}],10:[function(require,module,exports){
/** @class */
function Playable() {
	// Player component handling this playable
	this._player = null;

	// Handle of the playable within its player
	this._handle = null;

	// Starting time, is global (relative to its player time)
	this._startTime = 0;

	// Current time, is local (relative to starting time)
	// i.e this._time === 0 implies this._player._time === this._startTime
	this._time  = 0;

	// Playing speed of the playable
	this._speed = 1;

	// Callbacks
	this._onStart  = null;
	this._onPause  = null;
	this._onResume = null;
	this._onUpdate = null;
	this._onStop   = null;
}

module.exports = Playable;

Object.defineProperty(Playable.prototype, 'speed', {
	get: function () { return this._speed; },
	set: function (speed) {
		this.setSpeed(speed);
	}
});

Object.defineProperty(Playable.prototype, 'time', {
	get: function () { return this._time; },
	set: function (time) {
		this.goTo(time);
	}
});

Playable.prototype.onStart  = function (onStart)  { this._onStart  = onStart;  return this; };
Playable.prototype.onUpdate = function (onUpdate) { this._onUpdate = onUpdate; return this; };
Playable.prototype.onStop   = function (onStop)   { this._onStop   = onStop;   return this; };
Playable.prototype.onPause  = function (onPause)  { this._onPause  = onPause;  return this; };
Playable.prototype.onResume = function (onResume) { this._onResume = onResume; return this; };

Playable.prototype.tweener = function (tweener) {
	if (tweener === null || tweener === undefined) {
		console.warn('[Playable.tweener] Given tweener is invalid:', tweener);
		return this;
	}

	this._player = tweener;
	return this;
};

Playable.prototype.setSpeed = function (speed) {
	if (speed < 0) {
		console.warn('[Playable.speed] This playable cannot have negative speed');
		return;
	}

	if (speed === 0) {
		if (this._speed !== 0) {
			// Setting timeStart as if new speed was 1
			this._startTime += this._time / this._speed - this._time;
		}
	} else {
		if (this._speed === 0) {
			// If current speed is 0,
			// it corresponds to a virtual speed of 1
			// when it comes to determing where the starting time is
			this._startTime += this._time - this._time / speed;
		} else {
			this._startTime += this._time / this._speed - this._time / speed;
		}
	}

	this._speed = speed;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

Playable.prototype.goTo = function (timePosition, iteration) {
	if (this._iterations === 1) {
		if(this._speed === 0) {
			// Speed is virtually 1
			this._startTime += this._time - timePosition;
		} else {
			// Offsetting starting time with respect to current time and speed
			this._startTime += (this._time - timePosition) / this._speed;
		}
	} else {
		iteration = iteration || 0;
		if(this._speed === 0) {
			// Speed is virtually 1
			this._startTime += this._time - timePosition - iteration * this._duration;
		} else {
			// Offsetting starting time with respect to current time and speed
			this._startTime += (this._time - timePosition - iteration * this._duration) / this._speed;
		}
	}

	this._time = timePosition;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

Playable.prototype.goToBeginning = function () {
	return this.goTo(0, 0);
};

Playable.prototype.getDuration = function () {
	return Infinity;
};

Playable.prototype._getEndTime = function () {
	return Infinity;
};

Playable.prototype._setStartTime = function (startTime) {
	this._startTime = startTime;
};

Playable.prototype._getStartTime = function () {
	return this._startTime;
};

Playable.prototype._isWithin = function (time) {
	return this._startTime < time;
};

Playable.prototype._overlaps = function (time0, time1) {
	return (time0 - this._startTime) * (time1 - this._startTime) <= 0;
};

Playable.prototype.rewind = function () {
	this.goTo(0, 0);
	return this;
};

Playable.prototype.delay = function (delay) {
	return this.start(-delay);
};

Playable.prototype.start = function (timeOffset) {
	if (this._player === null) {
		this._player = TINA._startDefaultTweener();
	}

	if (this._validate() === false) {
		// Did not pass validation
		return this;
	}

	if (this._player._add(this) === false) {
		// Could not be added to player
		return this;
	}

	if (timeOffset === undefined || timeOffset === null) {
		timeOffset = 0;
	}

	this._startTime = this._player._time - timeOffset;
	return this;
};

Playable.prototype._start = function () {
	if (this._onStart !== null) {
		this._onStart();
	}
};

Playable.prototype.stop = function () {
	if (this._player === null) {
		console.warn('[Playable.stop] Trying to stop a playable that was never started.');
		return;
	}

	// Stopping playable without performing any additional update nor completing
	if (this._player._remove(this) === false) {
		// Could not be removed
		return this;
	}

	if (this._onStop !== null) {
		this._onStop();
	}
	return this;
};

Playable.prototype.resume = function () {
	if (this._player._activate(this) === false) {
		// Could not be resumed
		return this;
	}

	if (this._onResume !== null) {
		this._onResume();
	}
	return this;
};

Playable.prototype.pause = function () {
	if (this._player._remove(this) === false) {
		// Could not be paused
		return this;
	}

	if (this._onPause !== null) {
		this._onPause();
	}

	return this;
};

Playable.prototype._moveTo = function (time, dt) {
	dt *= this._speed;

	this._time = (time - this._startTime) * this._speed;
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

// Overridable methods
Playable.prototype._update   = function () {};
Playable.prototype._validate = function () {};
},{}],11:[function(require,module,exports){
var Playable   = require('./Playable');
var DoublyList = require('./DoublyList');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Player() {
	Playable.call(this);

	// A DoublyList, rather than an Array, is used to store playables.
	// It allows for faster removal and is similar in speed for iterations.

	// Quick note: as of mid 2014 iterating through linked list was slower than iterating through arrays
	// in safari and firefox as only V8 managed to have linked lists work as fast as arrays.
	// As of mid 2015 it seems that performances are now identical in every major browsers.
	// (KUDOs to the JS engines guys)

	// List of active playables handled by this player
	this._activePlayables = new DoublyList();

	// List of inactive playables handled by this player
	this._inactivePlayables = new DoublyList();

	// List of playables that are not handled by this player anymore and are waiting to be removed
	this._playablesToRemove = new DoublyList();

	// Whether to silence warnings
	this._silent = true;

	// Whether to trigger the debugger on warnings
	this._debug = false;
}
Player.prototype = Object.create(Playable.prototype);
Player.prototype.constructor = Player;
module.exports = Player;

Player.prototype._add = function (playable) {
	if (playable._handle === null) {
		// Playable can be added
		playable._handle = this._inactivePlayables.add(playable);
		playable._player = this;
		// this._onPlayableAdded(playable);
		return true;
	}

	// Playable is already handled, either by this player or by another one
	if (playable._handle.container === this._playablesToRemove) {
		// Playable was being removed, removing from playables to remove
		playable._handle = this._playablesToRemove.removeByReference(playable._handle);
		return true;
	}

	if (playable._handle.container === this._activePlayables) {
		this._warn('[Player._add] Playable is already present, and active');
		return false;
	}

	if (playable._handle.container === this._inactivePlayables) {
		this._warn('[Player._add] Playable is already present, but inactive (could be starting)');
		return false;
	}

	this._warn('[Player._add] Playable is used elsewhere');
	return false;
};

Player.prototype._remove = function (playable) {
	if (playable._handle === null) {
		this._warn('[Player._remove] Playable is not being used');
		return false;
	}

	// Playable is handled, either by this player or by another one
	if (playable._handle.container === this._activePlayables) {
		// Playable was active, adding to remove list
		playable._handle = this._playablesToRemove.add(playable._handle);
		return true;
	}

	if (playable._handle.container === this._inactivePlayables) {
		// Playable was inactive, removing from inactive playables
		playable._handle = this._inactivePlayables.removeByReference(playable._handle);
		return true;
	}

	if (playable._handle.container === this._playablesToRemove) {
		this._warn('[Player._remove] Playable is already being removed');
		return false;
	}

	this._warn('[Player._add] Playable is used elsewhere');
	return false;
};

Player.prototype.remove = function (playable) {
	if (playable._handle.container === this._activePlayables) {
		playable.stop();
	}

	this._remove(playable);
	this._onPlayableRemoved(playable);
	return this;
};

Player.prototype.removeAll = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		handle.object.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();
	return this;
};

Player.prototype.possess = function (playable) {
	if (playable._handle === null) {
		return false;
	}

	return (playable._handle.container === this._activePlayables) || (playable._handle.container === this._inactivePlayables);
};

Player.prototype._handlePlayablesToRemove = function () {
	while (this._playablesToRemove.length > 0) {
		// O(1) where O stands for "Oh yeah"

		// Removing from list of playables to remove
		var handle = this._playablesToRemove.pop();

		// Removing from list of active playables
		var playable = handle.object;
		playable._handle = this._activePlayables.removeByReference(handle);
	}

	if ((this._activePlayables.length === 0) && (this._inactivePlayables.length === 0)) {
		this._onAllPlayablesRemoved();
	}
};

Player.prototype.clear = function () {
	this._activePlayables.clear();
	this._inactivePlayables.clear();
	this._playablesToRemove.clear();
	this._controls.clear();
	return this;
};

Player.prototype._warn = function (warning) {
	// jshint debug: true
	if (this._silent === false) {
		console.warn(warning);
	}

	if (this._debug === true) {
		debugger;
	}
};

Player.prototype.silent = function (silent) {
	this._silent = silent || false;
	return this;
};

Player.prototype.debug = function (debug) {
	this._debug = debug || false;
	return this;
};

Player.prototype.stop = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		var playable = handle.object;
		playable.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();
	Playable.prototype.stop.call(this);
};

Player.prototype._activate = function (playable) {
	// O(1)
	this._inactivePlayables.removeByReference(playable._handle);
	playable._handle = this._activePlayables.addBack(playable);
};

Player.prototype._inactivate = function (playable) {
	if (playable._handle === null) {
		this._warn('[Playable.stop] Cannot stop a playable that is not running');
		return;
	}

	// O(1)
	this._activePlayables.removeByReference(playable._handle);
	playable._handle = this._inactivePlayables.addBack(playable);
};

Player.prototype._updatePlayableList = function (dt) {
	this._handlePlayablesToRemove();

	var time0, time1;
	if (dt > 0) {
		time0 = this._time - dt;
		time1 = this._time;
	} else {
		time0 = this._time;
		time1 = this._time - dt;
	}

	// Activating playables
	var handle = this._inactivePlayables.first;
	while (handle !== null) {
		var playable = handle.object;

		// Fetching handle of next playable
		handle = handle.next;

		// Starting if player time within playable bounds
		// console.log('Should playable be playing?', playable._startTime, time0, time1, dt)
		if (playable._overlaps(time0, time1)) {
			this._activate(playable);
			playable._start();
		}
	}
};

Player.prototype._update = function (dt, overflow) {
	this._updatePlayableList(dt);
	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		if (overflow === undefined) {
			handle.object._moveTo(this._time, dt);
		} else {
			handle.object._moveTo(this._time, dt, overflow);
		}
	}
};

// Overridable methods
// Player.prototype._onPlayableAdded   = function (/* playable */) {};
Player.prototype._onPlayableChanged = function (/* playable */) {};
Player.prototype._onPlayableRemoved = function (/* playable */) {};
Player.prototype._onAllPlayablesRemoved = function () {};
},{"./DoublyList":8,"./Playable":10}],12:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');
var DoublyList    = require('./DoublyList');

function Record(time, values) {
	this.time   = time;
	this.values = values;
}

function ObjectRecorder(object, properties, onIn, onOut) {
	this.object      = object;
	this.properties  = properties;

	this.records = new DoublyList();
	this.currentRecord = null;

	// Whether or not the playing head is within the recording duration
	this.isIn = false;

	this.onIn  = onIn  || null;
	this.onOut = onOut || null;
}

ObjectRecorder.prototype.erase = function (t0, t1) {
	// Removing every record between t0 and t1
	if (t1 < t0) {
		var t2 = t0;
		t0 = t1;
		t1 = t2;
	}

	// Heuristic: removing records from the end if last object concerned by the removal
	var last = this.records.last;
	if (last.object.time <= t1) {
		// Removing from the end
		while (last !== null && last.object.time >= t0) {
			var previous = last.previous;
			this.records.removeBeReference(last);
			last = previous;
		}

		if (this.currentRecord.container === null) {
			// current record was removed from the list
			this.currentRecord = last;
		}
		return;
	}

	// Removing from the beginning
	var recordRef = this.records.first;
	while (recordRef !== null && recordRef.object.time <= t1) {
		var next = recordRef.next;
		if (recordRef.object.time >= t0) {
			this.records.removeBeReference(recordRef);
		}
		recordRef = next;
	}

	if (this.currentRecord.container === null) {
		// current record was removed from the list
		this.currentRecord = recordRef;
	}
};

ObjectRecorder.prototype.record = function (time, dt) {
	if (dt === 0 && this.currentRecord !== null && this.currentRecord.time === time) {
		return;
	}

	// Creating the record
	var recordValues = [];
	for (var p = 0; p < this.properties.length; p += 1) {
		recordValues.push(this.object[this.properties[p]]);
	}
	var record = new Record(time, recordValues);

	// Saving the record
	if (this.records.length === 0) {
		// First record, ever
		this.currentRecord = this.records.add(record);
		return;
	}

	if (this.currentRecord.object.time < time) {
		this.currentRecord = this.records.addAfter(this.currentRecord, record);
	} else {
		this.currentRecord = this.records.addBefore(this.currentRecord, record);
	}
};

ObjectRecorder.prototype.goTo = function (time) {
	// Selecting record that corresponds to the record closest to time
	while (this.currentRecord.object.time < time) {
		this.currentRecord = this.currentRecord.next;
	}

	while (time < this.currentRecord.object.time) {
		this.currentRecord = this.currentRecord.previous;
	}
};

ObjectRecorder.prototype.play = function (time, dt, smooth) {
	var nbProperties = this.properties.length;
	var firstRecord  = this.records.first;
	var lastRecord   = this.records.last;

	var isIn;
	if (dt === 0) {
		isIn = this.isIn;
	} else {
		if (this.isIn === true) {
			isIn = (firstRecord.object.time < time) && (time < lastRecord.object.time);
		} else {
			isIn = (firstRecord.object.time <= time) && (time <= lastRecord.object.time);
		}
	}

	if (isIn !== this.isIn) {
		this.isIn = !this.isIn;
		if (isIn === true && this.onIn !== null) {
			this.onIn();
		}
	} else if (this.isIn === false) {
		return;
	}

	var previousRecord = (this.currentRecord.previous === null) ? this.currentRecord : this.currentRecord.previous;

	while (this.currentRecord.object.time <= time) {
		previousRecord = this.currentRecord;
		var next = this.currentRecord.next;
		if (next === null) {
			break;
		} else {
			this.currentRecord = next;
		}
	}

	while (time <= previousRecord.object.time) {
		this.currentRecord = previousRecord;
		var previous = previousRecord.previous;
		if (previous === null) {
			break;
		} else {
			previousRecord = previous;
		}
	}

	var p;
	if (smooth) {
		var t0 = previousRecord.object.time;
		var t1 = this.currentRecord.object.time;
		var record0 = previousRecord.object.values;
		var record1 = this.currentRecord.object.values;

		var timeInterval = t1 - t0;

		var delta0 = (t - t0) / timeInterval;
		var delta1 = (t1 - t) / timeInterval;

		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = record0[p] * delta0 + record1[p] * delta1;
		}
	} else {
		var record = this.currentRecord.object.values;
		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = record[p];
		}
	}

	// Triggering onOut callback
	if (isIn === false && this.onOut !== null) {
		this.onOut();
	}
};

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function Recorder(maxRecordingDuration) {
	if ((this instanceof Recorder) === false) {
		return new Recorder();
	}

	BriefPlayable.call(this);

	// Can end only in playing mode
	this._duration = Infinity;

	// Time difference between this._time and recorded times
	this._slackTime = 0;

	// Maximum recording duration
	this._maxRecordingDuration = maxRecordingDuration || Infinity;

	// List of objects and properties recorded
	this._recordedObjects = [];

	// List of objects and properties recording
	this._recordingObjects = {};

	// List of object labels
	this._recordingObjectLabels = [];

	// Whether the recorder is in recording mode
	this._recording = true;

	// Whether the recorder is in playing mode
	this._playing = false;

	// Whether the recorder enables interpolating at play time
	this._smooth = false;

	this._onStartRecording = null;
	this._onStopRecording  = null;

	this._onStartPlaying = null;
	this._onStopPlaying  = null;
}
Recorder.prototype = Object.create(BriefPlayable.prototype);
Recorder.prototype.constructor = Recorder;
module.exports = Recorder;

Recorder.prototype.getDuration = function () {
	// Duration from outside the playable
	var duration;
	if (this._playing === true) {
		duration = (this._time > this._maxRecordingDuration) ? this._maxRecordingDuration : this._time;
	} else {
		duration = Infinity;
	}
	return duration * this._iterations / this._speed;
};

Recorder.prototype.smooth = function (smooth) {
	this._smooth = smooth;
	return this;
};

Recorder.prototype.onStartRecording = function (onStartRecording) {
	this._onStartRecording = onStartRecording;
	return this;
};

Recorder.prototype.onStopRecording = function (onStopRecording) {
	this._onStopRecording = onStopRecording;
	return this;
};

Recorder.prototype.onStartPlaying = function (onStartPlaying) {
	this._onStartPlaying = onStartPlaying;
	return this;
};

Recorder.prototype.onStopPlaying = function (onStopPlaying) {
	this._onStopPlaying = onStopPlaying;
	return this;
};

Recorder.prototype.reset = function () {
	this._recordedObjects       = [];
	this._recordingObjects      = {};
	this._recordingObjectLabels = [];
	return this;
};

Recorder.prototype.record = function (label, object, properties, onIn, onOut) {
	var objectRecorder = new ObjectRecorder(object, properties, onIn, onOut);
	this._recordingObjects[label] = objectRecorder;
	this._recordedObjects.push(objectRecorder);
	this._recordingObjectLabels.push(label);
	return this;
};

Recorder.prototype.stopRecordingObject = function (label) {
	delete this._recordingObjects[label];

	var labelIdx = this._recordingObjectLabels.indexOf(label);
	if (labelIdx === -1) {
		console.warn('[Recorder.stopRecordingObject] Trying to stop recording an object that is not being recording:', label);
		return this;
	}

	this._recordingObjectLabels.splice(labelIdx, 1);
	return this;
};

Recorder.prototype.removeRecordedObject = function (label) {
	var recorder = this._recordingObjects[label];
	delete this._recordingObjects[label];

	var labelIdx = this._recordingObjectLabels.indexOf(label);
	if (labelIdx !== -1) {
		this._recordingObjectLabels.splice(labelIdx, 1);
	}

	var recorderIdx = this._recordedObjects.indexOf(recorder);
	if (recorderIdx === -1) {
		console.warn('[Recorder.removeRecordedObject] Trying to remove an object that was not recorded:', label);
		return this;
	}

	this._recordingObjectLabels.splice(recorderIdx, 1);
	return this;
};

Recorder.prototype.recording = function (recording) {
	if (this._recording !== recording) {
		this._recording = recording;
		if (this._recording === true) {
			if (this._playing === true) {
				if (this._onStopPlaying !== null) {
					this._onStopPlaying();
				}
				this._playing = false;
			}

			// Not resetting starting time
			// and setting duration to Infinity
			this._duration = Infinity;
			if (this._player !== null) {
				this._player._onPlayableChanged(this);
			}

			if (this._onStartRecording !== null) {
				this._onStartRecording();
			}
		} else {
			if (this._onStopRecording !== null) {
				this._onStopRecording();
			}
		}
	}
	return this;
};

Recorder.prototype.playing = function (playing) {
	if (this._playing !== playing) {
		this._playing = playing;
		if (this._playing === true) {
			if (this._recording === true) {
				if (this._onStopRecording !== null) {
					this._onStopRecording();
				}
				this._recording = false;
			}

			// Setting duration to current position of the playing head
			this._duration = this._time;
			this.goToBeginning(this._startTime + this.getDuration());

			if (this._onStartPlaying !== null) {
				this._onStartPlaying();
			}
		} else {
			if (this._onStopPlaying !== null) {
				this._onStopPlaying();
			}
		}
	}
	return this;
};

Recorder.prototype._update = function (dt) {
	var time = this._slackTime + this._time;

	var r;
	if (this._recording === true) {
		var overflow, isOverflowing;
		if (dt > 0) {
			overflow = this._time - this._maxRecordingDuration;
			isOverflowing = (overflow > 0);
		} else {
			overflow = this._time;
			isOverflowing = (overflow < 0);
		}

		var nbRecordingObjects = this._recordingObjectLabels.length;
		for (r = 0; r < nbRecordingObjects; r += 1) {
			var label = this._recordingObjectLabels[r];
			var recordingObject = this._recordingObjects[label];

			// Recording object at current time
			recordingObject.record(time, dt);

			// Clearing the records that overflow from the maximum recording duration
			if (isOverflowing === true) {
				recordingObject.erase(0, overflow);
			}
		}

		if (overflow > 0) {
			this._slackTime += overflow;
			this._setStartTime(this._startTime + overflow);
			this._player._onPlayableChanged(this);
		}
	} else if (this._playing === true) {
		var nbObjectRecorded = this._recordedObjects.length;
		for (r = 0; r < nbObjectRecorded; r += 1) {
			this._recordedObjects[r].play(time, dt, this._smooth);
		}
	}
};

},{"./BriefPlayable":5,"./DoublyList":8}],13:[function(require,module,exports){
var Timeline   = require('./Timeline');
var Delay      = require('./Delay');
var DoublyList = require('./DoublyList');

/**
 *
 * @classdesc
 * Manages tweening of one property or several properties of an object
 *
 * @param {object} element Object to tween
 * @param {string} property Property to tween
 * @param {number} a starting value of property
 * @param {number} b ending value of property
 *
 */

function Sequence() {
	if ((this instanceof Sequence) === false) {
		return new Sequence();
	}

	this._sequencedPlayables = new DoublyList();

	Timeline.call(this);
}
Sequence.prototype = Object.create(Timeline.prototype);
Sequence.prototype.constructor = Sequence;
module.exports = Sequence;

Sequence.prototype.add = function (playable) {
	this._sequencedPlayables.addBack(playable);
	return Timeline.prototype.add.call(this, playable, this._duration);
};

Sequence.prototype.addDelay = function (duration) {
	return this.add(new Delay(duration));
};

Sequence.prototype._reconstruct = function () {
	// O(n)
	var activePlayable, timeInActiveBefore;
	var activePlayableHandle = this._activePlayables.first;

	if (activePlayableHandle !== null) {
		// How far is the sequence within the active playable?
		activePlayable = activePlayableHandle.object; // only one active playable
		timeInActiveBefore = this._time - activePlayable._getStartTime();
	}

	// Reconstructing the sequence of playables
	var duration = 0;
	for (var handle = this._sequencedPlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		playable._setStartTime(duration);
		duration = playable._getEndTime();
	}

	if (activePlayableHandle !== null) {
		// Determining where to set the sequence's starting time so that the local time within
		// the active playable remains the same
		var currentStartTime = this._getStartTime();
		var timeInActiveAfter = this._time - activePlayable._getStartTime();
		var shift = timeInActiveBefore - timeInActiveAfter;
		this._startTime += shift;
	}

	// Updating duration
	this._duration = duration;

	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

Sequence.prototype.substitute = function (playableA, playableB) {
	// O(n)
	if (this._sequencedPlayables.length === 0) {
		this._warn('[Sequence.substitute] The sequence is empty!');
		return;
	}

	// Fetching handle for playable A
	var handleA = this._sequencedPlayables.getNode(playableA);

	// Adding playable B right after playable A in this._sequencedPlayables
	this._sequencedPlayables.addAfter(handleA, playableB);

	// Adding playable B in this player
	this._add(playableB);

	// Removing playable A
	// Will have the effect of:
	// - Stopping playable A (with correct callback)
	// - Removing playable A from the sequence
	// - Reconstructing the sequence
	this.remove(playableA);
};

Sequence.prototype._onPlayableRemoved = function (removedPlayable) {
	// O(n)
	this._sequencedPlayables.remove(removedPlayable);
	if (this._sequencedPlayables.length === 0) {
		return;
	}

	this._reconstruct();
};

Sequence.prototype._onPlayableChanged = Sequence.prototype._reconstruct;

},{"./Delay":7,"./DoublyList":8,"./Timeline":16}],14:[function(require,module,exports){
(function (global){

var DoublyList = require('./DoublyList');

/**
 *
 * @module TINA
 *
 * @author Brice Chevalier
 *
 * @desc 
 *
 * Tweening and INterpolations for Animation
 *
 * Note: if you want a particular component to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina.js
 */

// window within a browser, global within node
var root;
if (typeof(window) !== 'undefined') {
	root = window;
} else if (typeof(global) !== 'undefined') {
	root = global;
} else {
	console.warn('[TINA] Your environment might not support TINA.');
	root = this;
}

// Method to trigger automatic updates
var requestAnimFrame = (function(){
	return root.requestAnimationFrame    || 
		root.webkitRequestAnimationFrame || 
		root.mozRequestAnimationFrame    || 
		root.oRequestAnimationFrame      || 
		root.msRequestAnimationFrame     ||
		function(callback){
			root.setTimeout(callback, 1000 / 60);
		};
})();

// Performance.now gives better precision than Date.now
var clock = root.performance || Date;

var TINA = {
	// List of active tweeners handled by TINA
	_activeTweeners: new DoublyList(),

	// List of inactive tweeners handled by TINA
	_inactiveTweeners: new DoublyList(),

	// List of tweeners that are not handled by this player anymore and are waiting to be removed
	_tweenersToRemove: new DoublyList(),

	// _tweeners: [],

	_defaultTweener: null,

	_startTime: 0,
	_time:      0,

	_running: false,

	// callbacks
	_onStart:  null,
	_onPause:  null,
	_onResume: null,
	_onUpdate: null,
	_onStop:   null,

	_pauseOnLostFocus:            false,
	_pauseOnLostFocusInitialised: false,

	onStart: function (onStart) {
		this._onStart = onStart;
		return this;
	},

	onUpdate: function (onUpdate) {
		this._onUpdate = onUpdate;
		return this;
	},

	onStop: function (onStop) {
		this._onStop = onStop;
		return this;
	},

	onPause: function (onPause) {
		this._onPause = onPause;
		return this;
	},

	isRunning: function () {
		return (this._running === true);
	},

	update: function () {
		var now = clock.now() - this._startTime;
		var dt = now - this._time;
		if (dt < 0) {
			// Clock error
			// Date.now is based on a clock that is resynchronized
			// every 15-20 mins and could cause the timer to go backward in time.
			// (legend or reality? not sure, but I think I noticed it once)
			// To get some explanation from Paul Irish:
			// http://updates.html5rocks.com/2012/08/When-milliseconds-are-not-enough-performance-now
			dt = 1; // incrementing time by 1 millisecond
			this._startTime -= 1;
			this._time += 1;
		} else {
			this._time = now;
		}

		// Removing any tweener that is requested to be removed
		while (this._tweenersToRemove.length > 0) {
			// Removing from list of tweeners to remove
			var tweenerToRemove = this._tweenersToRemove.pop();

			// Removing from list of active tweeners
			tweenerToRemove._handle = this._activeTweeners.removeByReference(tweenerToRemove._handle);
		}

		// Activating any inactive tweener
		while (this._inactiveTweeners.length > 0) {
			// Removing from list of inactive tweeners
			var tweenerToActivate = this._inactiveTweeners.pop();

			// Adding to list of active tweeners
			tweenerToActivate._handle = this._activeTweeners.addBack(tweenerToActivate);
			tweenerToActivate._start();
		}

		for (var handle = this._activeTweeners.first; handle !== null; handle = handle.next) {
			handle.object._moveTo(this._time, dt);
		}

		if (this._onUpdate !== null) {
			this._onUpdate(this._time, dt);
		}
	},

	reset: function () {
		// Resetting the clock
		// Getting time difference between last update and now
		var now = clock.now();
		var dt = now - this._time;

		// Moving starting time by this difference
		// As if the time had virtually not moved
		this._startTime += dt;
		this._time = 0;
	},

	start: function () {
		if (this._startAutomaticUpdate() === false) {
			return;
		}

		if (this._onStart !== null) {
			this._onStart();
		}

		while (this._inactiveTweeners.length > 0) {
			var handle = this._inactiveTweeners.first;
			this._activate(handle.object);
		}

		return this;
	},

	stop: function () {
		if (this._stopAutomaticUpdate() === false) {
			return;
		}

		while (this._activePlayables.length > 0) {
			var handle = this._activePlayables.first;
			handle.object.stop();
		}

		if (this._onStop !== null) {
			this._onStop();
		}

		return this;
	},

	// Internal start method, called by start and resume
	_startAutomaticUpdate: function () {
		if (this._running === true) {
			console.warn('[TINA.start] TINA is already running');
			return false;
		}

		function updateTINA() {
			if (TINA._running === true) {
				TINA.update();
				requestAnimFrame(updateTINA);
			}
		}

		this.reset();

		// Starting the animation loop
		this._running = true;
		requestAnimFrame(updateTINA);
		return true;
	},

	// Internal stop method, called by stop and pause
	_stopAutomaticUpdate: function () {
		if (this._running === false) {
			console.warn('[TINA.pause] TINA is not running');
			return false;
		}

		// Stopping the animation loop
		this._running = false;
		return true;
	},

	pause: function () {
		if (this._stopAutomaticUpdate() === false) {
			return;
		}

		for (var handle = this._activeTweeners.first; handle !== null; handle = handle.next) {
			handle.object._pause();
		}

		if (this._onPause !== null) {
			this._onPause();
		}
		return this;
	},

	resume: function () {
		if (this._startAutomaticUpdate() === false) {
			return;
		}

		if (this._onResume !== null) {
			this._onResume();
		}

		for (var handle = this._activeTweeners.first; handle !== null; handle = handle.next) {
			handle.object._resume();
		}

		return this;
	},

	_initialisePauseOnLostFocus: function () {
		if (this._pauseOnLostFocusInitialised === true) {
			return;
		}

		if (document === undefined) {
			// Document is not defined (TINA might be running on node.js)
			console.warn('[TINA.pauseOnLostFocus] Cannot pause on lost focus because TINA is not running in a webpage (node.js does not allow this functionality)');
			return;
		}

		// To handle lost of focus of the page
		var hidden, visbilityChange; 
		if (typeof document.hidden !== 'undefined') {
			// Recent browser support 
			hidden = 'hidden';
			visbilityChange = 'visibilitychange';
		} else if (typeof document.mozHidden !== 'undefined') {
			hidden = 'mozHidden';
			visbilityChange = 'mozvisibilitychange';
		} else if (typeof document.msHidden !== 'undefined') {
			hidden = 'msHidden';
			visbilityChange = 'msvisibilitychange';
		} else if (typeof document.webkitHidden !== 'undefined') {
			hidden = 'webkitHidden';
			visbilityChange = 'webkitvisibilitychange';
		}

		if (typeof document[hidden] === 'undefined') {
			console.warn('[Tweener] Cannot pause on lost focus because the browser does not support the Page Visibility API');
			return;
		}

		this._pauseOnLostFocusInitialised = true;

		// Handle page visibility change
		var wasRunning = false;
		document.addEventListener(visbilityChange, function () {
			if (document[hidden]) {
				// document is hiding
				wasRunning = TINA.isRunning();
				if (wasRunning && TINA._pauseOnLostFocus) {
					TINA.pause();
				}
			}

			if (!document[hidden]) {
				// document is back (we missed you buddy)
				if (wasRunning && TINA._pauseOnLostFocus) {
					// Running TINA only if it was running when the document focus was lost
					TINA.resume();
				}
			}
		}, false);
	},

	pauseOnLostFocus: function (pauseOnLostFocus) {
		if (pauseOnLostFocus === true && this._pauseOnLostFocusInitialised === false) {
			this._initialisePauseOnLostFocus();
		}

		this._pauseOnLostFocus = pauseOnLostFocus;
		return this;
	},

	_add: function (tweener) {
		// A tweener is starting
		if (this._running === false) {
			// TINA is not running, starting now
			this.start();
		}

		if (tweener._handle === null) {
			// Tweener can be added
			tweener._handle = this._inactiveTweeners.add(tweener);
			tweener._player = this;
			return;
		}

		// Tweener is already handled
		if (tweener._handle.container === this._tweenersToRemove) {
			// Playable was being removed, removing from playables to remove
			tweener._handle = this._tweenersToRemove.removeByReference(tweener._handle);
			return;
		}
	},

	add: function (tweener) {
		this._add(tweener);
		return this;
	},

	_inactivate: function (tweener) {
		if (tweener._handle !== null) {
			this._activePlayables.removeByReference(tweener._handle);
		}

		tweener._handle = this._inactivePlayables.addBack(tweener);
	},

	_remove: function (tweener) {
		if (tweener._handle === null) {
			return;
		}

		// Playable is handled, either by this player or by another one
		if (tweener._handle.container === this._activeTweeners) {
			// Tweener was active, adding to remove list
			tweener._handle = this._tweenersToRemove.add(tweener._handle);
			return;
		}

		if (tweener._handle.container === this._inactiveTweeners) {
			// Tweener was inactive, removing from inactive tweeners
			tweener._handle = this._inactiveTweeners.removeByReference(tweener._handle);
			return;
		}
	},

	remove: function (tweener) {
		this._remove(tweener);
		return this;
	},

	setDefaultTweener: function (tweener) {
		this._defaultTweener = tweener;
		return this;
	},

	getDefaultTweener: function () {
		if (this._defaultTweener === null) {
			// If a default tweener is required but none exist
			// Then we create one
			var DefaultTweener = this.Timer;
			this._defaultTweener = new DefaultTweener();
		}

		return this._defaultTweener;
	},

	_startDefaultTweener: function () {
		var defaultTweener = this.getDefaultTweener();
		this._add(defaultTweener);
		return defaultTweener;
	}
};

module.exports = root.TINA = TINA;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./DoublyList":8}],15:[function(require,module,exports){
var Tweener = require('./Tweener');

/**
 *
 * @classdesc
 * Tweener that manages the update of time independantly of the actual passing of time.
 * Every update, the time interval is equal to the given tupt (time units per tick).
 *
 */
function Ticker(tupt) {
	if ((this instanceof Ticker) === false) {
		return new Ticker(tupt);
	}

	Tweener.call(this);

	// Time units per tick (tupt)
	// Every second, 'tupt' time units elapse
	this.tupt = tupt || 1;

}
Ticker.prototype = Object.create(Tweener.prototype);
Ticker.prototype.constructor = Ticker;
module.exports = Ticker;

Ticker.prototype._moveTo = function (time, dt) {
	this._time += this.tupt;

	// overwriting elapsed time since previous iteration
	dt = this.tupt;

	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

Ticker.prototype.convertToTicks = function(timeUnits) {
	return timeUnits / this.tupt;
};

Ticker.prototype.convertToTimeUnits = function(nbTicks) {
	return nbTicks * this.tupt;
};

},{"./Tweener":21}],16:[function(require,module,exports){
var BriefPlayer = require('./BriefPlayer');

/**
 *
 * @classdesc
 * Manages tweening of one property or several properties of an object
 *
 * @param {object} element Object to tween
 * @param {string} property Property to tween
 * @param {number} a starting value of property
 * @param {number} b ending value of property
 *
 */

function Timeline() {
	if ((this instanceof Timeline) === false) {
		return new Timeline();
	}

	BriefPlayer.call(this);
}
Timeline.prototype = Object.create(BriefPlayer.prototype);
Timeline.prototype.constructor = Timeline;
module.exports = Timeline;

Timeline.prototype.add = function (playable, startTime) {
	if (startTime === null || startTime === undefined) {
		startTime = 0;
	}

	playable._setStartTime(startTime);
	this._add(playable);

	var endTime = playable._getEndTime();
	if (endTime > this._duration) {
		this._setDuration(endTime);
	}

	return this;
};
},{"./BriefPlayer":6}],17:[function(require,module,exports){
var Tweener = require('./Tweener');

/**
 *
 * @classdesc
 * Tweener that manages the update of time relatively to the actual passing of time.
 * Every update, the time interval is equal to the elapsed time in seconds multiplied by the tups (time units per second).
 *
 */
function Timer(tups) {
	if ((this instanceof Timer) === false) {
		return new Timer(tups);
	}

	Tweener.call(this);

	// Time units per second (tups)
	// Every second, 'tups' time units elapse
	this._speed = (tups / 1000) || 1;
}
Timer.prototype = Object.create(Tweener.prototype);
Timer.prototype.constructor = Timer;
module.exports = Timer;

Object.defineProperty(Timer.prototype, 'tups', {
	get: function () { return this._speed * 1000; },
	set: function (tups) { this.speed = tups / 1000; }
});

Timer.prototype.convertToSeconds = function(timeUnits) {
	return timeUnits / (this._speed * 1000);
};

Timer.prototype.convertToTimeUnits = function(seconds) {
	return seconds * this._speed * 1000;
};
},{"./Tweener":21}],18:[function(require,module,exports){
// The file is a good representation of the constant fight between maintainability and performance
// For performance reasons several update methods are created
// The appropriate method should be used for tweening. The selection depends on:
// 	- The number of props to tween
//  - Whether or not an easing is being used
//  - Whether or not an interpolation is being used

// One property
function update(object, t) {
	var p = this.prop;
	object[p] = this.from[p] * (1 - t) + this.to[p] * t;
}

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
}

// Interpolation
function updateI(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
}

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
}

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParam);
	var p = this.prop;
	object[p] = this.from[p] * (1 - t) + this.to[p] * t;
}

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
}

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](this.easing(t, this.easingParam), this.from[p], this.to[p], this.interpParams[p]);
}

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
}

var updateMethods = [
	[
		[update, updateP],
		[updateI, updatePI]
	], [
		[updateE, updatePE],
		[updateIE, updatePIE]
	]
];

function Transition(properties, from, to, start, duration, easing, easingParam, interpolations, interpolationParams) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.from = from;
	this.to   = to;

	// Easing flag - Whether an easing function is used
	// 0 => Using linear easing
	// 1 => Using custom easing
	var easingFlag;
	if (easing) {
		easingFlag = 1;
		this.easing = easing;
		this.easingParam = easingParam;
	} else {
		easingFlag = 0;
	}

	// Interpolation flag - Whether an interpolation function is used
	// 0 => No Interpolation
	// 1 => At least one interpolation
	var interpFlag;
	if (interpolations === null) {
		interpFlag = 0;
	} else {
		interpFlag = 1;
		this.interps = interpolations;
		this.interpParams = interpolationParams || {};
	}

	// Property flag - Whether the transition has several properties
	// 0 => Only one property
	// 1 => Several properties
	var propsFlag;
	if (properties.length === 1) {
		propsFlag  = 0;
		this.prop  = properties[0]; // string
		this.props = null;
	} else {
		propsFlag  = 1;
		this.prop  = null;
		this.props = properties; // array
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = Transition;
},{}],19:[function(require,module,exports){

// One property
function update(object, t) {
	var p = this.prop;
	var now = this.from[p] * (1 - t) + this.to[p] * t;
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		var now = this.from[p] * (1 - t) + this.to[p] * t;
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

// Interpolation
function updateI(object, t) {
	var p  = this.prop;
	var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParams);
	var p = this.prop;
	var now = this.from[p] * (1 - t) + this.to[p] * t;
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.from[p] * (1 - t) + this.to[p] * t;
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	var now = this.interps[p](this.easing(t, this.easingParams), this.from[p], this.to[p], this.interpParams[p]);
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

var updateMethods = [
	[
		[update, updateP],
		[updateI, updatePI]
	], [
		[updateE, updatePE],
		[updateIE, updatePIE]
	]
];

function Transition(properties, from, to, start, duration, easing, easingParam, interpolations, interpolationParams) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.from = from;
	this.to   = to;

	// Easing flag - Whether an easing function is used
	// 0 => Using linear easing
	// 1 => Using custom easing
	var easingFlag;
	if (easing) {
		easingFlag = 1;
		this.easing = easing;
		this.easingParam = easingParam;
	} else {
		easingFlag = 0;
	}

	// Interpolation flag - Whether an interpolation function is used
	// 0 => No Interpolation
	// 1 => At least one interpolation
	var interpFlag;
	if (interpolations === null) {
		interpFlag = 0;
	} else {
		interpFlag = 1;
		this.interps = interpolations;
		this.interpParams = interpolationParams || {};
	}

	// Property flag - Whether the transition has several properties
	// 0 => Only one property
	// 1 => Several properties
	var propsFlag;
	if (properties.length === 1) {
		propsFlag  = 0;
		this.prop  = properties[0]; // string
		this.props = null;
		this.prev  = 0;
		this.prevs = null;
	} else {
		propsFlag  = 1;
		this.prop  = null;
		this.props = properties; // array
		this.prev  = null;
		this.prevs = {};
		for (var p = 0; p < properties.length; p += 1) {
			this.prevs[properties[p]] = 0;
		}
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = Transition;
},{}],20:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');
var AbstractTween = require('./AbstractTween');

var inherit = require('./inherit');
/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */
function Tween(object, properties) {
	if ((this instanceof Tween) === false) {
		return new Tween(object, properties);
	}

	BriefPlayable.call(this);
	AbstractTween.call(this, object, properties);
}
Tween.prototype = Object.create(BriefPlayable.prototype);
Tween.prototype.constructor = Tween;
inherit(Tween, AbstractTween);
module.exports = Tween;


Tween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	AbstractTween.prototype.to.call(this, toObject, duration, easing, easingParam, interpolationParams);
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

Tween.prototype.wait = function (duration) {
	AbstractTween.prototype.to.wait(this, duration);
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};
},{"./AbstractTween":3,"./BriefPlayable":5,"./inherit":24}],21:[function(require,module,exports){
var Player = require('./Player');
var TINA   = require('./TINA');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Tweener() {
	Player.call(this);

	// TINA is the player for all the tweeners
	this._player = TINA;
}
Tweener.prototype = Object.create(Player.prototype);
Tweener.prototype.constructor = Tweener;
module.exports = Tweener;

Tweener.prototype._inactivate = function (playable) {
	// In a tweener, playables are removed when inactivated
	this._remove(playable);
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};
},{"./Player":11,"./TINA":14}],22:[function(require,module,exports){
/**
 *
 * @file A set of ease functions
 *
 * @author Brice Chevalier
 *
 * @param {Number} t Progress of the transition in [0, 1]
 * @param (Number) p Additional parameter, when required.
 *
 * @return {Number} Interpolated time
 *
 * @desc Ease functions
 *
 * Initial and final values of the ease functions are either 0 or 1.
 * All the ease functions are continuous for times t in [0, 1]
 *
 * Note: if you want a particular easing method to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina.js
 */

// Math constants (for readability)
var PI          = Math.PI;
var PI_OVER_TWO = Math.PI / 2;
var TWO_PI      = Math.PI * 2;
var EXP         = 2.718281828;

// No easing
exports.none = function () {
	return 1;
};

// Linear
exports.linear = function (t) {
	return t;
};

// Flash style transition
// ease in [-1, 1] for usage similar to flash
// but works with ease in ]-Inf, +Inf[
exports.flash = function (t, ease) {
	return t + t * ease - t * t * ease;
};

// Parabolic
exports.parabolic = function (t) {
	var r = (2 * t - 1);
	return 1 - r * r;
};

// Trigonometric, n = number of iterations in ]-Inf, +Inf[
exports.trigo = function (t, n) {
	return 0.5 * (1 - Math.cos(TWO_PI * t * n));
};

// Elastic, e = elasticity in ]0, +Inf[
exports.elastic = function (t, e) {
	if (t === 1) return 1;
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return Math.cos(n - PI_OVER_TWO) * Math.pow(e, n);
};

// Quadratric
exports.quadIn = function (t) { 
	return t * t;
};

exports.quadOut = function (t) {
	return 2 * t - t * t;
};

exports.quadInOut = function (t) {
	if (t < 0.5) {
		return 2 * t * t;
	} else {
		return 2 * (2 * t - t * t) - 1;
	}
};

// Cubic
exports.cubicIn = function (t) { 
	return t * t * t;
};

exports.cubicOut = function (t) {
	return 3 * t - 3 * t * t + t * t * t;
};

exports.cubicInOut = function (t) {
	if (t < 0.5) {
		return 4 * t * t * t;
	} else {
		return 4 * (3 * t - 3 * t * t + t * t * t) - 3;
	}
};

// Quartic
exports.quarticIn = function (t) { 
	return t * t * t * t;
};

exports.quarticOut = function (t) {
	var t2 = t * t;
	return 4 * t - 6 * t2 + 4 * t2 * t - t2 * t2;
};

exports.quarticInOut = function (t) {
	if (t < 0.5) {
		return 8 * t * t * t * t;
	} else {
		var t2 = t * t;
		return 8 * (4 * t - 6 * t2 + 4 * t2 * t - t2 * t2) - 7;
	}
};

// Polynomial, p = power in ]0, + Inf[
exports.polyIn = function (t, p) { 
	return Math.pow(t, p);
};

exports.polyOut = function (t, p) {
	return 1 - Math.pow(1 - t, p);
};

exports.polyInOut = function (t, p) {
	if (t < 0.5) {
		return Math.pow(2 * t, p) / 2;
	} else {
		return (2 - Math.pow(2 * (1 - t), p)) / 2;
	}
};

// Sine
exports.sineIn = function (t) {
	return 1 - Math.cos(PI_OVER_TWO * t);
};

exports.sineOut = function (t) {
	return Math.sin(PI_OVER_TWO * t);
};

exports.sineInOut = function (t) {
	if (t < 0.5) {
		return (1 - Math.cos(PI * t)) / 2;
	} else {
		return (1 + Math.sin(PI * (t - 0.5))) / 2;
	}
};

// Exponential, e = exponent in ]0, + Inf[
exports.expIn = function (t, e) {
	return (1 - Math.pow(EXP, e * t)) / (1 - Math.pow(EXP, e));
};

exports.expOut = function (t, e) {
	return (1 - Math.pow(EXP, - e * t)) / (1 - Math.pow(EXP, - e));
};

exports.expInOut = function (t, e) {
	if (t < 0.5) {
		return (1 - Math.pow(EXP, 2 * e * t)) / (1 - Math.pow(EXP, e)) / 2;
	} else {
		return 0.5 + (1 - Math.pow(EXP, e - 2 * e * t)) / (1 - Math.pow(EXP, - e)) / 2;
	}
};

// Circular
exports.circIn = function (t) {
	return 1 - Math.sqrt(1 - Math.pow(t, 2));
};

exports.circOut = function (t) {
	return Math.sqrt(1 - Math.pow(1 - t, 2));
};

exports.circInOut = function (t) {
	if (t < 0.5) {
		return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
	} else {
		return (1 + Math.sqrt(-3 + 8 * t - 4 * t * t)) / 2;
	}
};

// Elastic, e = elasticity in ]0, +Inf[
exports.elasticIn = function (t, e) {
	if (t === 0) { return 0; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(t) / Math.log(e);
	return Math.cos(n) * Math.pow(e, n);
};

exports.elasticOut = function (t, e) {
	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return 1.0 - Math.cos(n) * Math.pow(e, n);
};

exports.elasticInOut = function (t, e) {
	var n;
	if (t < 0.5) {
		if (t === 0) { return 0; }
		e /= (e + 1); // transforming e
		n = (1 + e) * Math.log(2 * t) / Math.log(e);
		return 0.5 * Math.cos(n) * Math.pow(e, n);
	}

	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	n = (1 + e) * Math.log(2 - 2 * t) / Math.log(e);
	return 0.5 + 0.5 * (1.0 - Math.cos(n) * Math.pow(e, n));
};

// Bounce, e = elasticity in ]0, +Inf[
exports.bounceIn = function (t, e) {
	if (t === 0) { return 0; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(t) / Math.log(e);
	return Math.abs(Math.cos(n) * Math.pow(e, n));
};

exports.bounceOut = function (t, e) {
	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return 1.0 - Math.abs(Math.cos(n) * Math.pow(e, n));
};

exports.bounceInOut = function (t, e) {
	var n;
	if (t < 0.5) {
		if (t === 0) { return 0; }
		e /= (e + 1); // transforming e
		n = (1 + e) * Math.log(2 * t) / Math.log(e);
		return Math.abs(0.5 * Math.cos(n) * Math.pow(e, n));
	}

	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	n = (1 + e) * Math.log(2 - 2 * t) / Math.log(e);
	return 0.5 + 0.5 * (1.0 - Math.abs(Math.cos(n) * Math.pow(e, n)));
};

// Back, e = elasticity in [0, +Inf[
exports.backIn = function (t, e) {
	return t * t * ((e + 1) * t - e);
};

exports.backOut = function (t, e) {
	t -= 1;
	return t * t * ((e + 1) * t + e) + 1;
};

exports.backInOut = function (t, e) {
	if (t < 0.5) {
		t *= 2;
		return 0.5 * (t * t * ((e + 1) * t - e));
	}
	t = 2 * t - 2;
	return 0.5 * (t * t * ((e + 1) * t + e)) + 1;
};

},{}],23:[function(require,module,exports){
var TINA = require('./TINA.js');

// TINA.CSSTween        = require('./CSSTween');
TINA.Delay           = require('./Delay');
TINA.BriefExtension  = require('./BriefExtension');
TINA.BriefPlayable   = require('./BriefPlayable');
TINA.BriefPlayer     = require('./BriefPlayer');
TINA.easing          = require('./easing');
TINA.interpolation   = require('./interpolation');
TINA.NestedTween     = require('./NestedTween');
TINA.PixiTween       = require('./NestedTween');
TINA.Playable        = require('./Playable');
TINA.Player          = require('./Player');
TINA.Recorder        = require('./Recorder');
TINA.Sequence        = require('./Sequence');
TINA.Ticker          = require('./Ticker');
TINA.Timeline        = require('./Timeline');
TINA.Timer           = require('./Timer');
TINA.Tween           = require('./Tween');
TINA.Tweener         = require('./Tweener');

module.exports = TINA;

},{"./BriefExtension":4,"./BriefPlayable":5,"./BriefPlayer":6,"./Delay":7,"./NestedTween":9,"./Playable":10,"./Player":11,"./Recorder":12,"./Sequence":13,"./TINA.js":14,"./Ticker":15,"./Timeline":16,"./Timer":17,"./Tween":20,"./Tweener":21,"./easing":22,"./interpolation":25}],24:[function(require,module,exports){
module.exports = function (subobject, superobject) {
	var prototypes = Object.keys(superobject.prototype);
	for (var p = 0; p < prototypes.length; p += 1) {
		var prototypeName = prototypes[p];
		subobject.prototype[prototypeName] = superobject.prototype[prototypeName];
	}
};
},{}],25:[function(require,module,exports){
/**
 *
 * @file A set of interpolation functions
 *
 * @author Brice Chevalier
 *
 * @param {Number} t Progress of the transition in [0, 1]
 * @param (Number) a Value to interpolate from
 * @param (Number) b Value to interpolate to
 * @param (Number) p Additional parameter
 *
 * @return {Number} Interpolated value
 *
 * @desc Interpolation functions
 * Define how to interpolate between object a and b.
 * 
 * Note: if you want a particular interpolation method to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina.js
 */

// TODO: Test them all!

exports.none = function (t, a, b) {
	return b;
};

exports.linear = function (t, a, b) {
	return a * (1 - t) + b * t;
};

// d = discretization
exports.discrete = function (t, a, b, d) {
	if (d === undefined) { d = 1; }
	return Math.floor((a * (1 - t) + b * t) / d) * d;
};

exports.vectorXY = function (t, a, b) {
	return {
		x: a.x * (1 - t) + b.x * t,
		y: a.y * (1 - t) + b.y * t
	};
};

exports.vectorXYZ = function (t, a, b) {
	return {
		x: a.x * (1 - t) + b.x * t,
		y: a.y * (1 - t) + b.y * t,
		z: a.z * (1 - t) + b.z * t
	};
};

// a, b = vectors
exports.vector = function (t, a, b) {
	var c = [];
	for (var i = 0; i < a.length; i += 1) {
		c[i] = a[i] * (1 - t) + b[i] * t;
	}
	return c;
};

// a, b = states, c = array of intermediary states
exports.state = function (t, a, b, c) {
	var nbStates = b.length + 2;
	var stateIdx = Math.floor(t * nbStates);
	if (stateIdx < 1) { return a; }
	if (stateIdx >= (nbStates - 1)) { return b; }
	return c[stateIdx - 1];
};

// a, b = colors
exports.colorRGB = function (t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t
	};
};

exports.colorRGBA = function (t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t,
		a: a.a * (1 - t) + b.a * t
	};
};

exports.colorRGBToHexa = function (t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return '#' + cr.toString(16) + cg.toString(16) + cb.toString(16);
};

exports.colorRGBToString = function (t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return 'rgb(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ')';
};

exports.colorRGBAToString = function (t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);
	var ca = Math.round(a.a * (1 - t) + b.a * t);

	return 'rgba(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ',' + ca + ')';
};

// Interpolation between 2 strings a and b (yes that's possible)
// Returns a string of the same size as b
exports.string = function (t, a, b) {
	var nbCharsA = a.length;
	var nbCharsB = b.length;
	var newString = '';

	for (var c = 0; c < nbCharsB; c += 1) {
		// Simple heuristic:
		// if charCodeB is closer to a capital letter
		// then charCodeA corresponds to an "A"
		// otherwise chardCodeA corresponds to an "a"
		var charCodeB = b.charCodeAt(c);
		var charCodeA = (c >= nbCharsA) ? ((charCodeB < 97) ? 65 : 97) : a.charCodeAt(c);

		var charCode = Math.round(charCodeA * (1 - t) + charCodeB * t);
		newString += String.fromCharCode(charCode);
	}

	return newString;
};

// Bezier, c = array of control points in ]-Inf, +Inf[
exports.bezierQuadratic = function (t, a, b, c) {
	var u = 1 - t;
	return u * u * a + t * (2 * u * c[0] + t * b);
};

exports.bezierCubic = function (t, a, b, c) {
	var u = 1 - t;
	return u * u * u * a + t * (3 * u * u * c[0] + t * (3 * u * c[1] + t * b));
};

exports.bezierQuartic = function (t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * a + t * (4 * u * u2 * c[0] + t * (6 * u2 * c[1] + t * (4 * u * c[2] + t * b)));
};

exports.bezierQuintic = function (t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * u * a + t * (5 * u2 * u2 * c[0] + t * (10 * u * u2 * c[1] + t * (10 * u2 * c[2] + t * (5 * u * c[3] + t * b))));
};

exports.bezier = function (t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b;

	var term = n;
	for (k = 1; k < n; k -= 1) {
		x = x * t + term * Math.pow(u, k) * c[n - k];
		term *= (n - k) / (k + 1);
	}

	return x * t + a * Math.pow(u, n);
};

// Bezier 2D, c = array of control points in ]-Inf, +Inf[ ^ 2
exports.bezier2d = function (t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b[0];
	var y = b[1];

	var p, q;
	var term = n;
	for (var k = 1; k < n; k -= 1) {
		p = term * Math.pow(u, k);
		q = c[n - k];
		x = x * t + p * q[0];
		y = y * t + p * q[1];
		term *= (n - k) / (k + 1);
	}

	p = Math.pow(u, n);
	return [
		x * t + a[0] * p,
		y * t + a[1] * p
	];
};

// Bezier 3D, c = array of control points in ]-Inf, +Inf[ ^ 3
exports.bezier3d = function (t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b[0];
	var y = b[1];
	var z = b[2];

	var p, q;
	var term = n;
	for (var k = 1; k < n; k -= 1) {
		p = term * Math.pow(u, k);
		q = c[n - k];
		x = x * t + p * q[0];
		y = y * t + p * q[1];
		z = z * t + p * q[2];
		term *= (n - k) / (k + 1);
	}

	p = Math.pow(u, n);
	return [
		x * t + a[0] * p,
		y * t + a[1] * p,
		z * t + a[2] * p
	];
};

// Bezier k-dimensions, c = array of control points in ]-Inf, +Inf[ ^ k
exports.bezierKd = function (t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var k = a.length;

	var res = [];
	for (var i = 0; i < k; i += 1) {
		res[i] = b[i];
	}

	var p, q;
	var term = n;
	for (var l = 1; l < n; l -= 1) {
		p = term * Math.pow(u, l);
		q = c[n - l];

		for (i = 0; i < k; i += 1) {
			res[i] = res[i] * t + p * q[i];
		}

		term *= (n - l) / (l + 1);
	}

	p = Math.pow(u, n);
	for (i = 0; i < k; i += 1) {
		res[i] = res[i] * t + a[i] * p;
	}

	return res;
};

// CatmullRom, b = array of control points in ]-Inf, +Inf[
exports.catmullRom = function (t, a, b, c) {
	if (t === 1) {
		return c;
	}

	// Finding index corresponding to current time
	var k = a.length;
	var n = b.length + 1;
	t *= n;
	var i = Math.floor(t);
	t -= i;

	var t2 = t * t;
	var t3 = t * t2;
	var w = -0.5 * t3 + 1.0 * t2 - 0.5 * t;
	var x =  1.5 * t3 - 2.5 * t2 + 1.0;
	var y = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
	var z =  0.5 * t3 - 0.5 * t2;

	var i0 = i - 2;
	var i1 = i - 1;
	var i2 = i;
	var i3 = i + 1;

	var p0 = (i0 < 0) ? a : b[i0];
	var p1 = (i1 < 0) ? a : b[i1];
	var p2 = (i3 < n - 2) ? b[i2] : c;
	var p3 = (i3 < n - 2) ? b[i3] : c;

	var res = [];
	for (var j = 0; j < k; j += 1) {
		res[j] = p0[j] * w + p1[j] * x + p2[j] * y + p3[j] * z;
	}

	return res;
};

// Noises functions! (you are welcome)
// Only 1d and 2d for now, if any request for 3d then I will add it to the list

// Creating a closure for the noise function to make 'perm' and 'grad' only accessible to it
exports.noise = (function () {
	// permutation table
	var perm = [
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
		182
	];

	// gradients
	var grad = [-1, 1];

	return function (t, a, b, p) {
		var amp = 2.0;   // amplitude
		var per = p.per || 1; // persistance
		var frq = p.frq || 2; // frequence
		var oct = p.oct || 4; // octaves
		var off = p.off || 0; // offset

		var c = 0;
		var x = p.x + off;

		for (var o = 0; o < oct; o += 1) {

			var i = (x | x) & 255;
			var x1 = x - (x | x);
			var x0 = 1.0 - x1;

			c += amp * (x0 * x0 * x1 * (3 - 2 * x0) * grad[perm[i] & 1] - x1 * x1 * x0 * (3 - 2 * x1) * grad[perm[i + 1] & 1]);

			x *= (x - off) * frq + off;
			amp *= per;
		}

		// Scaling the result
		var scale = ((per === 1) ? 1 / oct : 0.5 * (1 - per) / (1 - Math.pow(per, oct)));
		t = t + c * scale;
		return a * (1 - t) + b * t;
	};
})();

exports.simplex2d = (function () {
	// permutation table
	var perm = [
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216
	];

	// gradients
	var grad = [
		[1,1], [-1,1], [1,-1], [-1,-1],
		[1,0], [-1,0], [1,0], [-1,0],
		[0,1], [0,-1], [0,1], [0,-1],
		[1,1], [-1,1], [1,-1], [-1,-1]
	];

	function dot2D(g, x, y) {
		return g[0] * x + g[1] * y;
	}

	return function (t, a, b, p) {
		var amp = 2.0; // amplitude
		var per = p.per || 1; // persistance
		var frq = p.frq || 2; // frequence
		var oct = p.oct || 4; // octaves
		var off = p.off || { x: 0, y: 0 }; // offset

		var c = c;
		var x = p.x + off.x;
		var y = p.y + off.y;

		for (var o = 0; o < oct; o += 1) {
			var n0, n1, n2; // Noise contributions from the three corners

			// Skew the input space to determine which simplex cell we're in
			var f2 = 0.5 * (Math.sqrt(3.0) - 1.0);
			var s = (x + y) * f2; // Hairy factor for 2D
			var i = Math.floor(x + s);
			var j = Math.floor(y + s);
			var g2 = (3.0 - Math.sqrt(3.0)) / 6.0;
			var r = (i + j) * g2;

			var x0 = i - r; // Unskew the cell origin back to (x, y) space
			var y0 = j - r;
			x0 = x - x0; // The x, y distances from the cell origin
			y0 = y - y0;

			// For the 2D case, the simplex shape is an equilateral triangle.
			// Determine which simplex we are in.
			var i1, j1; // Offsets for second (middle) corner of simplex in (i, j) coords
			if (x0 > y0) {
				i1 = 1; j1 = 0; // lower triangle, XY order: (0, 0) -> (1, 0) -> (1, 1)
			} else {
				i1 = 0; j1 = 1; // upper triangle, YX order: (0, 0) -> (0, 1) -> (1, 1)
			}

			// A step of (1, 0) in (i, j) means a step of (1 - c, -c) in (x, y), and
			// a step of (0, 1) in (i, j) means a step of (-c, 1 - c) in (x, y), where
			// c = (3 - sqrt(3)) / 6
			var x1 = x0 - i1 + g2; // Offsets for middle corner in (x, y) unskewed coords
			var y1 = y0 - j1 + g2;
			var x2 = x0 - 1.0 + 2.0 * g2; // Offsets for last corner in (x, y) unskewed coords
			var y2 = y0 - 1.0 + 2.0 * g2;

			// Working out the hashed gradient indices of the three simplex corners
			var ii = i & 255;
			var jj = j & 255;

			// Calculating the contribution from the three corners
			var t0 = 0.5 - x0 * x0 - y0 * y0;
			var t1 = 0.5 - x1 * x1 - y1 * y1;
			var t2 = 0.5 - x2 * x2 - y2 * y2;

			if (t0 < 0) {
				n0 = 0.0;
			} else {
				var gi0 = perm[ii + perm[jj]] & 15;
				t0 *= t0;
				n0 = t0 * t0 * dot2D(grad[gi0], x0, y0);
			}

			if (t1 < 0) {
				n1 = 0.0;
			} else {
				var gi1 = perm[ii + i1 + perm[jj + j1]] & 15;
				t1 *= t1;
				n1 = t1 * t1 * dot2D(grad[gi1], x1, y1);
			}

			if (t2 < 0) {
				n2 = 0.0;
			} else {
				var gi2 = perm[ii + 1 + perm[jj + 1]] & 15;
				t2 *= t2;
				n2 = t2 * t2 * dot2D(grad[gi2], x2, y2);
			}

			// Adding contributions from each corner to get the final noise value.
			// The result is scaled to return values in the interval [-amp, amp]
			c += amp * 70.0 * (n0 + n1 + n2);

			x *= (x - off.x) * frq + off.x;
			y *= (y - off.y) * frq + off.y;
			amp *= per;
		}

		// Scaling the result
		var scale = ((per === 1) ? 1 / oct : 0.5 * (1 - per) / (1 - Math.pow(per, oct)));
		t = t + c * scale;
		return a * (1 - t) + b * t;
	};
})();
},{}],26:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Texture
 * @author Cedric Stoquer
 */

// var settings = require('../../settings.json');
var SPRITE_WIDTH  = settings.spriteSize[0];
var SPRITE_HEIGHT = settings.spriteSize[1];
var SPRITES_PER_LINE = 16;

function createCanvas(width, height) {
	var canvas = document.createElement('canvas');
	canvas.width  = width;
	canvas.height = height;
	return canvas;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Texture(width, height) {
	this.canvas  = createCanvas(width, height);
	this.ctx     = this.canvas.getContext('2d');
	this._cursor = { i: 0, j: 0 };
	this._paper  = 0;
	this._pen    = 1;

	this._textColumn  = ~~(width  / 4);
	this._textLine    = ~~(height / 6);
	this._textOffset  = 1; // TODO
	this._textPadding = height - this._textLine * 6 - this._textOffset;

	// camera offset
	this.camera = { x: 0, y: 0 };

	this.ctx.fillStyle   = this.palette[0];
	this.ctx.strokeStyle = this.palette[1];
}
module.exports = Texture;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype._isTexture = true;

// FIXME better have all these private
Texture.prototype.palette = ['#000000', '#FFFFFF']; // default palette
Texture.prototype.spritesheet = new Texture(SPRITE_WIDTH * SPRITES_PER_LINE, SPRITE_HEIGHT * SPRITES_PER_LINE);
Texture.prototype.textCharset = new Texture(128 * 3, 5 * Texture.prototype.palette.length);


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.resize = function (width, height) {
	this.canvas.width  = width;
	this.canvas.height = height;
	this._textColumn = ~~(width  / 4);
	this._textLine   = ~~(height / 6);
	this._textOffset = 1; // TODO
	this._cursor.i = 0;
	this._cursor.j = 0;
	this.clear();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// text charset generation

function getTextCharcodes(texture) {
	var canvas = texture.canvas;
	var ctx = texture.ctx;
	var charcodes = [];
	for (var chr = 0; chr < 128; chr++) {
		var imageData = ctx.getImageData(chr * 3, 0, 3, 5);
		var pixels = imageData.data;
		var code = 0;
		var bit = 0;
		for (var i = 0, len = pixels.length; i < len; i += 4) {
			var pixel = pixels[i]; // only the first pixel is enough
			if (pixel > 0) code += 1 << bit;
			bit += 1;
		}
		charcodes.push(code);
	}
	return charcodes;
}

function generateTextCharset(ctx, palette) {
	var codes = [
		219,438,511,14016,14043,14326,14335,28032,28123,28086,28159,32704,32731,
		32758,32767,128,146,384,402,9344,9362,9600,9618,192,210,448,466,9408,9426,
		9664,9682,32767,0,8338,45,11962,5588,21157,29354,10,17556,5265,21973,1488,
		5312,448,13824,5268,31599,29843,29671,31143,18925,31183,31689,18735,31727,
		18927,1040,5136,17492,3640,5393,8359,25450,23530,31467,25166,15211,29391,
		4815,27470,23533,29847,15142,23277,29257,23421,23403,11114,4843,26474,
		23279,14798,9367,27501,12141,24429,23213,14829,29351,25750,17553,13459,
		9402,28672,34,23530,31467,25166,15211,29391,4815,27470,23533,29847,15142,
		23277,29257,23421,23403,11114,4843,26474,23279,14798,9367,27501,12141,
		24429,23213,14829,29351,25686,9362,13587,42,21845
	];

	for (var pen = 0; pen < palette.length; pen++) {
		ctx.fillStyle = palette[pen];
		for (var i = 0; i < codes.length; i++) {
			var code = codes[i];
			for (var bit = 0; bit < 15; bit++) {
				var x = bit % 3;
				var y = ~~(bit / 3);
				var pixel = (code >> bit) & 1;
				if (pixel !== 1) continue;
				ctx.fillRect(i * 3 + x, pen * 5 + y, 1, 1);
			}
		}
	}
	ctx.fillStyle = palette[0];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.setPalette = function (palette) {
	Texture.prototype.palette = palette;
	Texture.prototype.textCharset = new Texture(128 * 3, 5 * palette.length);
	generateTextCharset(Texture.prototype.textCharset.ctx, palette);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.setGlobalSpritesheet = function (spritesheet) {
	Texture.prototype.spritesheet.clear().draw(spritesheet, 0, 0);
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.setSpritesheet = function (spritesheet) {
	if (!spritesheet) {
		delete this.spritesheet;
		return;
	} 
	if (this.spritesheet === Texture.prototype.spritesheet) {
		this.spritesheet = new Texture(SPRITE_WIDTH * SPRITES_PER_LINE, SPRITE_HEIGHT * SPRITES_PER_LINE);
	}
	this.spritesheet.clear().draw(spritesheet, 0, 0);
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.setCamera = function (x, y) {
	this.camera.x = x || 0;
	this.camera.y = y || 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var PI2 = Math.PI / 2;

Texture.prototype.sprite = function (sprite, x, y, flipH, flipV, rot) {
	var sx = sprite % SPRITES_PER_LINE;
	var sy = ~~(sprite / SPRITES_PER_LINE);
	var ctx = this.ctx;

	// add camera and round to the pixel
	x = x || 0;
	y = y || 0;
	x = ~~Math.round(x - this.camera.x);
	y = ~~Math.round(y - this.camera.y);

	if (!flipH && !flipV && !rot) {
		ctx.drawImage(this.spritesheet.canvas, sx * SPRITE_WIDTH, sy * SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT, x, y, SPRITE_WIDTH, SPRITE_HEIGHT);
		return this;
	}
	ctx.save();

	if (flipH) {
		ctx.scale(-1, 1);
		x *= -1;
		x -= SPRITE_WIDTH;
	}

	if (flipV) {
		ctx.scale(1, -1);
		y *= -1
		y -= SPRITE_HEIGHT;
	}

	if (rot) {
		ctx.translate(x + SPRITE_HEIGHT, y);
		ctx.rotate(PI2);
	} else {
		ctx.translate(x, y);
	}

	ctx.drawImage(this.spritesheet.canvas, sx * SPRITE_WIDTH, sy * SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
	ctx.restore();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.draw = function (img, x, y, flipH, flipV) {
	if (img._isMap) img = img.texture.canvas;
	if (img._isTexture) img = img.canvas;
	var px = ~~Math.round((x || 0) - this.camera.x);
	var py = ~~Math.round((y || 0) - this.camera.y);
	if (!flipH && !flipV) {
		// fast version
		this.ctx.drawImage(img, px, py);
		return this;
	}
	var ctx = this.ctx;
	ctx.save();
	if (flipH) {
		ctx.scale(-1, 1);
		px *= -1;
		px -= img.width;
	}
	if (flipV) {
		ctx.scale(1, -1);
		py *= -1
		py -= img.height;
	}
	ctx.translate(px, py);
	this.ctx.drawImage(img, 0, 0);
	ctx.restore();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.clear = function () {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.cls = function () {
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.locate(0, 0);
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// colors

Texture.prototype.pen = function (p) {
	this._pen = p % this.palette.length;
	this.ctx.strokeStyle = this.palette[this._pen];
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.paper = function (p) {
	this._paper = p % this.palette.length;
	this.ctx.fillStyle = this.palette[this._paper];
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// shape

Texture.prototype.rect = function (x, y, w, h) {
	this.ctx.strokeRect(~~(x - this.camera.x) + 0.5, ~~(y - this.camera.y) + 0.5, w - 1, h - 1);
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.rectfill = function (x, y, w, h) {
	this.ctx.fillRect(~~(x - this.camera.x), ~~(y - this.camera.y), w, h);
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// text

Texture.prototype.locate = function (i, j) {
	this._cursor.i = ~~i;
	this._cursor.j = ~~j;
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.print = function (str, x, y) {
	if (typeof str === 'object') {
		try {
			str = JSON.stringify(str);
		} catch (error) {
			str = "[Object]";
		}
	} else if (typeof str !== 'string') {
		str = str.toString();
	}
	if (x !== undefined) {
		x = ~~Math.round(x - this.camera.x);
		y = ~~Math.round(y - this.camera.y);
		for (var i = 0; i < str.length; i++) {
			this.ctx.drawImage(
				this.textCharset.canvas,
				3 * str.charCodeAt(i),
				5 * this._pen,
				3, 5,
				x, y,
				3, 5
			);
			x += 4;
		}
		return this;
	}
	for (var i = 0; i < str.length; i++) {
		if (this._cursor.j >= this._textLine) {
			this.textScroll();
		}
		var chr = str.charCodeAt(i);
		if (chr === 10 || chr === 13) {
			this._cursor.i = 0;
			this._cursor.j += 1;
			continue;
		}
		this.ctx.drawImage(
			this.textCharset.canvas,
			3 * chr,
			5 * this._pen,
			3, 5,
			this._cursor.i * 4,
			this._cursor.j * 6 + this._textOffset,
			3, 5
		);
		this._cursor.i += 1;
		if (this._cursor.i > this._textColumn) {
			this._cursor.i = 0;
			this._cursor.j += 1;
		}
	}
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.println = function (str) {
	this.print(str);
	this.print('\n');
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Texture.prototype.textScroll = function (n) {
	if (n === undefined) n = 1;
	this._cursor.j -= n;
	n *= 6;
	this.ctx.drawImage(this.canvas, 0, -n);
	this.ctx.fillRect(0, this.canvas.height - n - this._textPadding, this.canvas.width, n + this._textPadding);
	return this;
};


},{}],27:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @module loader
 * @desc   Loading functions helpers
 *
 * @author Cedric Stoquer
 */


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @function module:loader.loadJson
 * @desc     load a json file
 *
 * @param {String}   path - file path
 * @param {Function} cb   - asynchronous callback function
 */
function loadJson(path, cb) {
	var xobj = new XMLHttpRequest();
	xobj.onreadystatechange = function () {
		if (~~xobj.readyState !== 4) return;
		if (~~xobj.status !== 200) return cb('xhr:' + xobj.status);
		return cb && cb(null, JSON.parse(xobj.response));
	};
	xobj.open('GET', path, true);
	xobj.send();
}
exports.loadJson = loadJson;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @function module:loader.sendRequest
 * @desc     send some data to server
 *
 * @param {Object}   data - data to send to the server
 * @param {Function} cb   - asynchronous callback function
 */
function sendRequest(data, cb) {
	var xobj = new XMLHttpRequest();
	xobj.open('POST', 'req', true);
	xobj.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xobj.onreadystatechange = function () {
		if (~~xobj.readyState !== 4) return;
		if (~~xobj.status !== 200) return cb && cb('xhr:' + xobj.status);
		var res = JSON.parse(xobj.response);
		return cb && cb(res.error, res.result);
	};
	xobj.send(JSON.stringify(data));
}
exports.sendRequest = sendRequest;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @function  module:loader.loadImage
 * @desc      load an image file
 *
 * @param {String}   path - file path
 * @param {Function} cb   - asynchronous callback function
 */
function loadImage(path, cb) {
	var img = new Image();
	// TODO: remove listeners when load / error
	img.onload  = function () {
		this.onload  = null;
		this.onerror = null;
		cb && cb(null, this);
	};
	img.onerror = function () {
		this.onload  = null;
		this.onerror = null;
		cb && cb('img:' + path);
	};
	img.src = path;
}
exports.loadImage = loadImage;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @function module:loader.loadSound
 * @desc     load an image file
 *
 * @param {String}   path - file path
 * @param {Function} cb   - asynchronous callback function
 */
function loadSound(path, cb) {
	var snd = new Audio();
	snd.preload = true;
	snd.loop = false;
	
	function onSoundLoad() {
		cb && cb(null, snd);
		snd.removeEventListener('canplaythrough', onSoundLoad);
		snd.removeEventListener('error', onSoundError);
	}

	function onSoundError() {
		cb && cb('snd:load');
		snd.removeEventListener('canplaythrough', onSoundLoad);
		snd.removeEventListener('error', onSoundError);
	}

	snd.addEventListener('canplaythrough', onSoundLoad);
	snd.addEventListener('error', onSoundError);
	snd.src = path;
	snd.load();
}
exports.loadSound = loadSound;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * @function module:loader.preloadStaticAssets
 *
 * @desc   Preload all static assets of the game.
 *         The function first ask the server for the asset list.
 *         Server respond with an object containing the list of images
 *         to load and all data that are put in the www/asset folder.
 *         At this step, if request fail, function send an error.
 *         The function then proceed the loading of image assets. 
 *         If an image loading fail, the loading continue, and loading
 *         status is set to 1 (an image load fail).
 *         Images are load by 5 in parallel.
 *
 *         Function end and wil return an object that mix all data and 
 *         all assets so that it will have the same structure as the 
 *         'www/asset' folder.
 *
 *
 *         Assets list and data are automaticaly generated by server
 *         Just drop images and json files in the www/asset/ folder
 *         and the server will take care of it !
 *                 
 *
 * @param {Function} cb         - asynchronous callback function to 
 *                                call when all is preloaded
 *
 * @param {Function} onEachLoad - optional callback function called
 *                                every time one file is loaded
 *                                (for loading progress purpose)
 *                          
 */

function preloadStaticAssets(cb, onEachLoad) {
	loadJson('build/data.json', function onAssetListLoaded(error, assetList) {
		if (error) return cb(error);
		var data     = assetList.dat;
		var imgCount = assetList.img.length;
		var count    = imgCount + assetList.snd.length;
		var root     = assetList.root;
		var load     = 0;
		var done     = 0;
		function storeAsset(path, obj) {
			var splitted = path.split('/');
			var filename = splitted.pop();
			var id = filename.split('.');
			id.pop();
			id = id.join('.');
			var container = data;
			for (var i = 0, len = splitted.length; i < len; i++) {
				container = container[splitted[i]];
			}
			container[id] = obj;
			splitted.push(id);
			obj.name = id;
			obj.path = splitted.join('/');
		}
		function loadAssets() {
			var current = load + done;
			var percent = current / count;
			onEachLoad && onEachLoad(load, current, count, percent);
			var path;
			var loadFunc;
			if (current < imgCount) {
				path = assetList.img[current];
				loadFunc = loadImage;
			} else {
				path = assetList.snd[current - imgCount];
				loadFunc = loadSound;
			}
			done += 1;
			loadFunc(root + path, function onAssetLoaded(error, img) {
				if (!error) storeAsset(path, img);
				load += 1;
				done -= 1;
				if (load + done < count) loadAssets()
				else if (done === 0) cb(null, data);
			});
		}
		// loading assets in parallel, with a limit of 5 parallel downloads.
		if (count === 0) return cb(null, data);
		var parallel = Math.min(5, count - 1);
		for (var j = 0; j <= parallel; j++) loadAssets();
	});
}
exports.preloadStaticAssets = preloadStaticAssets;

},{}],28:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Audio Channel class.
 *
 * @author  Cedric Stoquer
 *
 *
 * @param {string} id - channel name id
 */
function AudioChannel(id) {
	this.id        = id;
	this.volume    = 1.0;
	this.muted     = true;
	this.loopSound = null;
	this.loopId    = null;
	this.loopVol   = 0.0;
	this.nextLoop  = null;
}
module.exports = AudioChannel;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
AudioChannel.prototype.setVolume = function (volume, muted) {
	var wasChannelMuted = this.muted;
	this.muted = volume === 0 || muted || false;
	if (volume !== undefined && volume !== null) {
		this.volume = volume;
	} else {
		volume = this.volume;
	}

	if (!this.loopId) return;

	// this channel have a looped sound (music, ambient sfx)
	// we have to take care of this looped sound playback if channel state changed
	if (this.loopSound && this.muted) {
		// a sound was playing, channel becomes muted
		this.loopSound.stop();
		// TODO: unload sound ?
	} else if (this.loopSound && this.loopSound.id === this.loopId) {
		// correct sound is loaded in channel, updating volume & playback
		this.loopSound.setVolume(Math.max(0, Math.min(1, volume * this.loopVol)));
		if (wasChannelMuted) { this.loopSound.play(); }
	} else if (!this.muted) {
		// sound is not loaded in channel, channel has been unmutted
		this.audioManager.playLoopSound(this.id, this.loopId, this.loopVol);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
AudioChannel.prototype.setMute = function (mute) {
	this.setVolume(null, mute);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play a long looped sound (e.g. background music).
 *  Only one looped sound can play per channel.
 *
 * @param {string} soundId   - sound id
 * @param {number} [volume]  - optional volume, a integer in range ]0..1]
 * @param {number} [pan]     - optional panoramic, a integer in rage [-1..1]
 * @param {number} [pitch]   - optional pitch, in semi-tone
 */
AudioChannel.prototype.playLoopSound = function (soundId, volume, pan, pitch, loopStart, loopEnd) {
	var audioManager   = this.audioManager;
	var defaultFade    = audioManager.settings.defaultFade;
	var crossFading    = audioManager.settings.crossFading;
	var currentSound   = this.loopSound;
	var currentSoundId = currentSound && currentSound.id;

	volume = Math.max(0, Math.min(1, volume || 1));

	this.loopId  = soundId;
	this.loopVol = volume;

	// don't load or play sound if audio or channel is mutted
	if (audioManager.muted || this.muted) return;

	// if requested sound is already playing, update volume, pan and pitch
	if (soundId === currentSoundId && currentSound) {
		currentSound.play(volume * this.volume, pan, pitch);
		if (this.nextLoop) {
			this.nextLoop.cancelOnLoadCallbacks();
			this.nextLoop = null;
		}
		return;
	}

	currentSound = null;

	// check if requested sound is already scheduled to play next
	if (this.nextLoop && this.nextLoop.id === soundId) return;

	var self = this;

	function stopCurrentLoop(sound, cb) {
		if (!sound) return cb && cb();
		if (sound.stopping) return; // callback is already scheduled
		sound.stop(function () {
			audioManager.freeSound(sound); // TODO: add an option to keep file in memory
			sound = null;
			return cb && cb();
		});
	}

	function _playNextSound() {
		var sound = self.loopSound = self.nextLoop;
		self.nextLoop = null;
		if (!sound) return;
		sound.setLoop(true, loopStart, loopEnd);
		sound.fade = defaultFade;
		sound.load(function onSoundLoad(error) {
			if (error) {
				sound.unload();
				self.loopSound = null;
				return;
			}
			sound.play(volume * self.volume, pan, pitch);
		});
	}

	function playNextSound() {
		// remove reference to current loop sound to ease optimistic garbabe collection
		self.loopSound = null;
		// force loading to happen at next tick in order to let garbage collector to release previous audio.
		window.setTimeout(_playNextSound, 0);
	}

	if (crossFading) {
		if (this.nextLoop) {
			// if another nextSound already loading, cancel previous callback
			this.nextLoop.cancelOnLoadCallbacks();
		}
		this.nextLoop = audioManager.createSound(soundId, this.id);
		this.nextLoop.load(function onSoundLoad(error) {
			if (error) {
				self.nextLoop.unload();
				self.nextLoop = null;
				return;
			}
			stopCurrentLoop(self.loopSound);
			playNextSound();
		});

	} else {
		this.nextLoop = audioManager.createSound(soundId, this.id);
		stopCurrentLoop(this.loopSound, playNextSound);
	}
};

},{}],29:[function(require,module,exports){
var AudioContext = window.AudioContext || window.webkitAudioContext;
var OrderedList  = require('./OrderedList');
var SoundObject  = require('./SoundBuffered.js');
var SoundGroup   = require('./SoundGroup.js');
var AudioChannel = require('./AudioChannel.js');
var ISound       = require('./ISound.js');

if (!AudioContext) {
	console.warn('Web Audio API is not supported on this platform. Fallback to regular HTML5 <Audio>');
	SoundObject = require('./Sound.js');
	if (!window.Audio) {
		console.warn('HTML5 <Audio> is not supported on this platform. Sound features are unavailable.');
		SoundObject = ISound;
	}
}


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Audio manager
 * @author  Cedric Stoquer
 *
 * @param {String[]} channels - list of channel ids to be created
 */
function AudioManager(channels) {
	this.soundsById            = {};
	this.soundGroupsById       = {};
	this.permanentSounds       = {};
	this.freeSoundPool         = [];
	this.soundArchive          = new OrderedList(function () { return 1; });
	this.soundGroupArchive     = new OrderedList(function () { return 1; });
	this.soundArchiveById      = {};
	this.soundGroupArchiveById = {};
	this.usedMemory            = 0;
	this.channels              = {};
	this.audioContext          = null;
	this.muted                 = false;

	// settings
	this.settings = {
		audioPath:      '',   // path to audio assets folder
		maxSoundGroup:  500,
		maxUsedMemory:  300,  // seconds
		defaultFade:    2,    // seconds
		maxPlayLatency: 1000, // milliseconds
		crossFading:    false,
		getFileUri:     function getFileUri(audioPath, id) { return audioPath + id + '.mp3'; },
		getSoundConstructor: function getSoundConstructor(channelId, soundId) { return null; }
	};

	// create channels
	for (var i = 0; i < channels.length; i++) {
		var channelId = channels[i];
		this.channels[channelId] = new AudioChannel(channelId);
	}

	// register self
	ISound.prototype.audioManager       = this;
	SoundGroup.prototype.audioManager   = this;
	AudioChannel.prototype.audioManager = this;
}

module.exports = AudioManager;

// expose ISound for custom sound constructors
module.exports.ISound = ISound;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
AudioManager.prototype.addChannel = function (channelId) {
	if (this.channels[channelId]) return;
	this.channels[channelId] = new AudioChannel(channelId);
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Initialise audio.
 *  On iOS, this function must be called on an user interaction (e.g. tap a button) or sound won't play.
 */
AudioManager.prototype.init = function () {
	if (this.audioContext || !AudioContext) return;
	this.audioContext = new AudioContext();

	// register audioContext on sound Class
	SoundObject.prototype.audioContext = this.audioContext;
	
	// sounds could have been preloaded, initialize them.
	for (var id in this.soundsById) {
		this.soundsById[id].init();
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Get a unused sound object (or a new one if no more empty sounds are available in pool)
 *
 * @param {string} channelId - channel id where the sound will be used
 * @param {string} soundId   - sound id
 *
 * @return {Object} sound object
 */
AudioManager.prototype.getEmptySound = function (channelId, soundId) {
	var sound;

	// custom sound constructor
	var constructor = this.settings.getSoundConstructor(channelId, soundId);
	if (constructor) {
		sound = new constructor();
		return sound;
	}

	if (this.freeSoundPool.length > 0) {
		sound = this.freeSoundPool.pop();
		sound.init();
	} else {
		sound = new SoundObject();
	}
	return sound;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Setup channels volume and mute. This function is used when retrieving user preferences.
 *
 * @param {Object}  channels            - object containnig channels setup list. Keys are channel ids
 *        {number}  channels[id].volume - volume of channel id
 *        {boolean} channels[id].muted  - mute setting for channel id
 */
AudioManager.prototype.setup = function (channels) {
	for (var channelId in channels) {
		var params = channels[channelId];
		this.setVolume(channelId, params.volume, params.muted);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Set channel's volume
 *
 * @param {String} channelId - channel id
 * @param {number} volume    - channel volume, float in range [0..1]
 */
AudioManager.prototype.setVolume = function (channelId, volume, muted) {
	var channel = this.channels[channelId];
	if (!channel) return;
	channel.setVolume(volume, muted);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Mute / unmute all channels
 *
 * @param {boolean} [muted] - Should all channels be muted. If not specified, function will behave as toggle
 */
AudioManager.prototype.setMute = function (muted) {
	if (muted === undefined) muted = !this.muted;
	this.muted = !!muted;

	// take care of loop sounds in channels
	for (var channelId in this.channels) {
		var channel = this.channels[channelId];
		if (!channel.loopSound) continue;
		if (muted) {
			channel.loopSound.stop();
		} else {
			// FIXME: force channel.muted to change from true to its current value
			var channelMuted = channel.muted;
			channel.muted = true;
			channel.setVolume(null, channelMuted);
		}
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Create and load sound
 *
 * @param {number}   id   - sound id
 * @param {Function} [cb] - optional callback function called when sound has finished to load
 */
AudioManager.prototype.loadSound = function (id, cb) {
	var sound = this.createSound(id);
	sound.load(cb);
	return sound;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Create sound but don't load it
 *
 * @param {number} id - sound id
 */
AudioManager.prototype.createSound = function (id, channelId) {
	var sound = this.getSound(id);
	if (sound) return sound;
	sound = this.soundsById[id] = this.getEmptySound(channelId, id);
	sound.setId(id);
	return sound;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Create a sound that won't be unloaded.
 *
 * @param {number} id - sound id
 */
AudioManager.prototype.createSoundPermanent = function (id, channelId) {
	var sound = this.getSound(id);
	// TODO: Check if sound is permanent and move it to permanents list if it's not the case.
	//       Because permanents sound (UI sounds) are created at app startup, this should not happend.
	if (sound) return sound;

	var constructor = this.settings.getSoundConstructor(channelId, id) || SoundObject;
	sound = this.permanentSounds[id] = new constructor();
	sound.setId(id);
	return sound;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Get a sound by its id
 *
 * @param {number} id - sound id
 */
AudioManager.prototype.getSound = function (id) {
	// search sound in permanents
	var sound = this.permanentSounds[id];
	if (sound) return sound;

	// search sound in active list
	sound = this.soundsById[id];
	if (sound) return sound;

	// search sound in archives
	sound = this.soundArchiveById[id];
	if (!sound) return null;

	// remove sound from archives
	this.soundArchive.removeByRef(sound.poolRef);
	sound.poolRef = null;
	delete this.soundArchiveById[id];

	// add sound back in active list
	this.soundsById[id] = sound;
	return sound;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Get a soundGroup by it's id
 *
 * @param {number} id - sound group id
 */
AudioManager.prototype.getSoundGroup = function (id) {
	// search soundGroup in active list
	var soundGroup = this.soundGroupsById[id];
	if (soundGroup) return soundGroup;

	// search soundGroup in archives
	soundGroup = this.soundGroupArchiveById[id];
	if (!soundGroup) return null;

	// remove soundGroup from archives
	this.soundGroupArchive.removeByRef(soundGroup.poolRef);
	soundGroup.poolRef = null;
	delete this.soundGroupArchiveById[id];

	// check that all individual sound of the group are loaded
	soundGroup.verifySounds();

	// add soundGroup back in active list
	this.soundGroupsById[id] = soundGroup;
	return soundGroup;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Unload and remove sound to free memory.
 *  We keep Sound instance for later reuse.
 *
 * @param {number} sound - sound wrapper object
 */
AudioManager.prototype.freeSound = function (sound) {
	var soundId = sound.id;
	if (this.soundsById[soundId]) { delete this.soundsById[soundId]; }
	if (this.soundArchiveById[soundId]) {
		this.soundArchive.removeByRef(sound.poolRef);
		sound.poolRef = null;
		delete this.soundArchiveById[soundId];
	}
	sound.unload();

	// don't add freed sound in pool if it's created from a custom constructor
	if (sound instanceof SoundObject) this.freeSoundPool.push(sound);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play a long looped sound (e.g. background music) in specified channel.
 *  Only one looped sound can play per channel.
 *
 * @param {string} channelId - channel id.
 * @param {string} soundId   - sound id
 * @param {number} [volume]  - optional volume, a integer in range ]0..1]
 * @param {number} [pan]     - optional panoramic, a integer in rage [-1..1]
 * @param {number} [pitch]   - optional pitch, in semi-tone
 */
AudioManager.prototype.playLoopSound = function (channelId, soundId, volume, pan, pitch, loopStart, loopEnd) {
	var channel = this.channels[channelId];
	if (!channel) return console.warn('Channel id "' + channelId + '" does not exist.');
	channel.playLoopSound(soundId, volume, pan, pitch, loopStart, loopEnd);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Stop currently playing lopped sound in channel */
AudioManager.prototype.stopLoopSound = function (channelId) {
	var self = this;
	var channel = this.channels[channelId];
	if (!channel) return console.warn('Channel id "' + channelId + '" does not exist.');
	var currentSound = channel.loopSound;
	channel.loopId = null;
	if (!currentSound) return;
	currentSound.stop(function onSoundStop() {
		self.freeSound(currentSound);
		channel.loopSound = null;
	});
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Stop and cleanup all looped sounds */
AudioManager.prototype.stopAllLoopSounds = function () {
	for (var channelId in this.channels) {
		this.stopLoopSound(channelId);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Called when map is changed, or on disconnection.
 *  All current sounds are archived, and if memory limit is reached,
 *  oldest used sounds are unloadded.
 */
AudioManager.prototype.release = function () {
	var maxSoundGroup = this.settings.maxSoundGroup;
	var maxUsedMemory = this.settings.maxUsedMemory;
	var id, soundGroup, sound;

	// don't release looped sounds
	var loopedSounds = {};
	for (id in this.channels) {
		var channel = this.channels[id];
		if (channel.loopSound) {
			loopedSounds[channel.loopSound.id] = true;
		}
	}

	// archive all sound groups
	for (id in this.soundGroupsById) {
		soundGroup = this.soundGroupsById[id];
		soundGroup.poolRef = this.soundGroupArchive.add(soundGroup);
		this.soundGroupArchiveById[id] = soundGroup;
		delete this.soundGroupsById[id];
	}

	// archive all sounds
	for (id in this.soundsById) {
		if (loopedSounds[id]) continue;
		sound = this.soundsById[id];
		sound.poolRef = this.soundArchive.add(sound);
		this.soundArchiveById[id] = sound;
		delete this.soundsById[id];
	}

	// free sound groups if count limit is reached
	var count = this.soundGroupArchive.getCount();
	while (count > maxSoundGroup) {
		soundGroup = this.soundGroupArchive.popFirst();
		if (!soundGroup) break;
		soundGroup.poolRef = null;
		delete this.soundGroupArchiveById[soundGroup.id];
		count -= 1;
	}

	// free sounds if memory limit is reached
	while (this.usedMemory > maxUsedMemory) {
		sound = this.soundArchive.popFirst();
		if (!sound) break;
		sound.poolRef = null;
		delete this.soundArchiveById[sound.id];
		this.freeSound(sound);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play a sound in provided channel
 *
 * @param {String} channelId - channel id used to play sound
 * @param {String} soundId   - sound id
 * @param {number} [volume]  - optional volume value. volume:]0..1]
 * @param {number} [pan]     - optional panoramic value. pan:[-1..1]
 * @param {number} [pitch]   - optional pitch value in semi-tone. Only work with webAudio enabled
 */
AudioManager.prototype.playSound = function (channelId, soundId, volume, pan, pitch) {
	if (this.muted) return;
	var channel = this.channels[channelId];
	if (channel.muted) return;
	var sound = this.getSound(soundId);
	if (!sound) { sound = this.createSound(soundId, channelId); }
	volume = volume || 1.0;
	sound.play(channel.volume * volume, pan, pitch);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play a sound group
 *
 * @param {String} channelId    - channel id used to play sound
 * @param {String} soundGroupId - sound group id
 * @param {number} [volume]     - optional volume value. volume:]0..1]
 * @param {number} [pan]        - optional panoramic value. pan:[-1..1]
 */
AudioManager.prototype.playSoundGroup = function (channelId, soundGroupId, volume, pan, pitch) {
	if (this.muted) return;
	var channel = this.channels[channelId];
	if (!channel || channel.muted) return;
	var soundGroup = this.getSoundGroup(soundGroupId);
	if (!soundGroup) return console.warn('SoundGroup "' + soundGroupId + '" does not exist.');
	volume = volume || 1.0;
	soundGroup.play(volume * channel.volume, pan, pitch);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Create a list of sound groups.
 *
 * @param {String}   soundGroupId        - soundGroup id
 * @param {Object}   soundGroupDef       - definition of sound group
 *        {String[]} soundGroupDef.id    - sound ids
 *        {number[]} soundGroupDef.vol   - sound volumes. vol:[0..1]
 *        {number[]} soundGroupDef.pitch - sound pitches in semi-tone.
 * @param {String}  [muted]              - if muted, then sounds are created but not loaded
 */
AudioManager.prototype.createSoundGroup = function (soundGroupId, soundGroupDef, muted) {
	if (this.getSoundGroup(soundGroupId)) return;
	var soundGroup = new SoundGroup(soundGroupId, soundGroupDef.id, soundGroupDef.vol, soundGroupDef.pitch, muted);
	this.soundGroupsById[soundGroupId] = soundGroup;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Create a list of sound groups.
 *
 * @param {Object}   soundGroupDefs          - definitions of sound groups
 *        {String[]} soundGroupDefs[*].id    - sound ids
 *        {number[]} soundGroupDefs[*].vol   - sound volumes. vol:[0..1]
 *        {number[]} soundGroupDefs[*].pitch - sound pitches in semi-tone.
 * @param {String}  [channelId]              - channel id the sound group will play in
 */
AudioManager.prototype.createSoundGroups = function (soundGroupDefs, channelId) {
	var muted = channelId !== undefined ? this.channels[channelId].muted : false;
	for (var soundGroupId in soundGroupDefs) {
		this.createSoundGroup(soundGroupId, soundGroupDefs[soundGroupId], muted);
	}
};

},{"./AudioChannel.js":28,"./ISound.js":30,"./OrderedList":31,"./Sound.js":32,"./SoundBuffered.js":33,"./SoundGroup.js":34}],30:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Sound Abstract class.
 * Implement dynamic loading / unloading mechanism.
 *
 * @author  Cedric Stoquer
 * 
 */
function ISound() {
	// public properties
	this.playing         = false;
	this.stopping        = false;
	this.fade            = 0;
	this.usedMemory      = 0;
	this.poolRef         = null;

	// the following properties are public but should NOT be assigned directly.
	// instead, use the setter functions: setId, setVolume, setPan, setLoop, setPitch.
	this.id              = null;
	this.volume          = 1.0;
	this.pan             = 0.0;
	this.loop            = false;
	this.pitch           = 0.0;

	// private properties
	this._loaded         = false;
	this._loading        = false;
	this._unloading      = false;
	this._playTriggered  = 0;

	this._onLoadQueuedCallback = [];
}

module.exports = ISound;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ISound.prototype.setId = function (value) {
	this.id      = value;
	this._loaded = false;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Load sound
 *
 * @param {Function} [cd] - optional callback function
 */
ISound.prototype.load = function (cb) {
	if (!this.id) return cb && cb('noId');
	if (this._loaded) return cb && cb(null, this);

	if (cb) { this._onLoadQueuedCallback.push(cb); }
	if (this._loading) return;
	this._loading = true;

	return this._load();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Finalize sound loading
 *
 * @param {String} error - set when loading has failed
 */
ISound.prototype._finalizeLoad = function (error) {
	var maxPlayLatency = this.audioManager.settings.maxPlayLatency;

	this._loaded  = !error;
	this._loading = false;

	for (var i = 0; i < this._onLoadQueuedCallback.length; i++) {
		this._onLoadQueuedCallback[i](error, this);
	}
	this._onLoadQueuedCallback = [];

	if (this._unloading) {
		this._unloading = false;
		this.unload();
		return;
	}

	if (this._loaded && this._playTriggered) {
		if (this.loop || Date.now() - this._playTriggered < maxPlayLatency) { this._play(); }
		this._playTriggered = 0;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Remove callback set on load */
ISound.prototype.cancelOnLoadCallbacks = function () {
	this._onLoadQueuedCallback = [];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play sound. If sound is not yet loaded, it is loaded in memory and flagged to be played
 *  once loading has finished. If loading take too much time, playback may be cancelled.
 *
 * @param {number} [vol]   - optional volume
 * @param {number} [pan]   - optional panoramic
 * @param {number} [pitch] - optional pitch value in semi-tone (available only if using webAudio)
 */
ISound.prototype.play = function (vol, pan, pitch) {
	if (vol !== undefined && vol !== null) { this.setVolume(vol); }
	if (pan !== undefined && pan !== null) { this.setPan(pan); }

	if (!this._loaded) {
		this._playTriggered = Date.now();
		this.load();
		return;
	}

	// prevent a looped sound to play twice
	// TODO: add a flag to allow force restart
	if (this.loop && this.playing) {
		// update pitch if needed
		this._updatePlayPitch(pitch);
		return;
	}

	this._play(pitch);
};

//█████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████████████▄███████▄░██████████▄░███████▄░██████████
//█▀▄▄▄▄▀█▄░▄██▄░▄█▀▄▄▄▄▀█▄░▀▄▄▄█▄░▀▄▄▄█▄▄░███▀▄▄▄▀░██▀▄▄▄▄▀███░▀▄▄▄▀███░███▀▄▄▄▄▀█
//█░████░███░██░███░▄▄▄▄▄██░██████░███████░███░████░██▀▄▄▄▄░███░████░███░███░▄▄▄▄▄█
//█▄▀▀▀▀▄████░░████▄▀▀▀▀▀█▀░▀▀▀██▀░▀▀▀██▀▀░▀▀█▄▀▀▀▄░▀█▄▀▀▀▄░▀█▀░▄▀▀▀▄█▀▀░▀▀█▄▀▀▀▀▀█
//█████████████████████████████████████████████████████████████████████████████████

ISound.prototype.init      = function () { /* virtual function */ };
ISound.prototype.setVolume = function (value) { this.volume = value; };
ISound.prototype.setPan    = function (value) { this.pan    = value; };
ISound.prototype.setLoop   = function (value) { this.loop   = value; };
ISound.prototype.setPitch  = function (pitch) { this.pitch  = pitch; };
ISound.prototype._updatePlayPitch = function (pitch) { /* virtual */ };

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play sound. Abstract method to be overwritten */
ISound.prototype._play = function (pitch) {
	this.playing = true;
	console.log('ISound play call: "' + this.id + '"');
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Stop sound
 *
 * @param {Function} [cb] - optional callback function (use it when sound has a fade out)
 */
ISound.prototype.stop = function (cb) {
	this.playing = false;
	return cb && cb();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Load sound. Abstract method to be overwritten
 * @private
 */
ISound.prototype._load = function () {
	console.log('ISound load call: ' + this.id);
	return this._finalizeLoad(null);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Unload sound from memory */
ISound.prototype.unload = function () {
	this._playTriggered = 0;
	this.setLoop(false);
	this.fade  = 0;
	this.pitch = 0;
	this.stop();

	if (this._loading) {
		this._unloading = true;
		return false;
	}

	this.audioManager.usedMemory -= this.usedMemory;
	this.setVolume(1.0);
	this.setPan(0.0);
	this.id         = null;
	this._loaded    = false;
	this.usedMemory = 0;

	return true;
};

},{}],31:[function(require,module,exports){
/**
 * PRIORITY LIST Class
 *
 * @author Brice Chevalier
 *
 * @param {function} comparison function that takes two parameters a and b and returns a number
 *
 * @desc Priority list data structure, elements remain sorted
 *
 *    Method                Time Complexity
 *    ___________________________________
 *
 *    add                    O(n), O(1) if insertion at the beginning or at the end of the list
 *    remove                 O(1)
 *    getFirst               O(1)
 *    getLast                O(1)
 *    popFirst               O(1)
 *    popLast                O(1)
 *    getCount               O(1)
 *    forEach                O(n * P) where P is the complexity of the input function
 *    forEachReverse         O(n * P) where P is the complexity of the input function
 *    clear                  O(n) indirectly because of garbage collection
 *
 *    Memory Complexity in O(n)
 */

function Node(obj, previous, next, container) {
	this.object    = obj;
	this.previous  = previous;
	this.next      = next;
	this.container = container;
}

function OrderedList(comparisonFunction) {
	this.count   = 0;
	this.first   = null;
	this.last    = null;
	this.cmpFunc = comparisonFunction;
}

OrderedList.prototype.add = function (obj) {
	var newNode = new Node(obj, null, null, this);
	this.count += 1;

	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
		return newNode;
	}

	var cmpFirst = this.cmpFunc(obj, this.first.object);
	if (cmpFirst < 0) {
		// insertion at the beginning of the list
		newNode.next = this.first;
		this.first.previous = newNode;
		this.first = newNode;
		return newNode;
	}

	var cmpLast = this.cmpFunc(obj, this.last.object);
	if (cmpLast >= 0) {
		// insertion at the end
		newNode.previous = this.last;
		this.last.next = newNode;
		this.last = newNode;
		return newNode;
	}

	var current;
	if (cmpFirst + cmpLast < 0) {
		current = this.first.next;
		while (this.cmpFunc(obj, current.object) >= 0) {
			current = current.next;
		}

		// insertion before current
		newNode.next = current;
		newNode.previous = current.previous;
		newNode.previous.next = newNode;
		current.previous = newNode;
	} else {
		current = this.last.previous;
		while (this.cmpFunc(obj, current.object) < 0) {
			current = current.previous;
		}

		// insertion after current
		newNode.previous = current;
		newNode.next = current.next;
		newNode.next.previous = newNode;
		current.next = newNode;
	}
	return newNode;
};

OrderedList.prototype.removeByRef = function (node) {
	if (!node || node.container !== this) {
		return false;
	}
	this.count -= 1;

	// Removing any reference to the node
	if (node.previous === null) {
		this.first = node.next;
	} else {
		node.previous.next = node.next;
	}
	if (node.next === null) {
		this.last = node.previous;
	} else {
		node.next.previous = node.previous;
	}

	// Removing any reference from the node to any other element of the list
	node.previous = null;
	node.next     = null;
	node.container     = null;
	return true;
};

OrderedList.prototype.moveToTheBeginning = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.previous === null) {
		// node is already the first one
		return true;
	}

	// Connecting previous node to next node
	node.previous.next = node.next;

	if (this.last === node) {
		this.last = node.previous;
	} else {
		// Connecting next node to previous node
		node.next.previous = node.previous;
	}

	// Adding at the beginning
	node.previous = null;
	node.next = this.first;
	node.next.previous = node;
	this.first = node;
	return true;
};

OrderedList.prototype.moveToTheEnd = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.next === null) {
		// node is already the last one
		return true;
	}

	// Connecting next node to previous node
	node.next.previous = node.previous;

	if (this.first === node) {
		this.first = node.next;
	} else {
		// Connecting previous node to next node
		node.previous.next = node.next;
	}

	// Adding at the end
	node.next = null;
	node.previous = this.last;
	node.previous.next = node;
	this.last = node;
	return true;
};

OrderedList.prototype.possess = function (node) {
	return node && (node.container === this);
};

OrderedList.prototype.popFirst = function () {
	var node = this.first;
	if (!node) {
		return null;
	}

	this.count -= 1;
	var pop  = node.object;

	this.first = node.next;
	if (this.first !== null) {
		this.first.previous = null;
	}

	node.next = null;
	node.container = null;
	return pop;
};

OrderedList.prototype.popLast = function () {
	var node = this.last;
	if (!node) {
		return null;
	}

	this.count -= 1;
	var pop  = node.object;

	this.last = node.previous;
	if (this.last !== null) {
		this.last.next = null;
	}

	node.previous = null;
	node.container = null;
	return pop;
};

OrderedList.prototype.getFirst = function () {
	return this.first && this.first.object;
};

OrderedList.prototype.getLast = function () {
	return this.last && this.last.object;
};

OrderedList.prototype.clear = function () {
	for (var current = this.first; current; current = current.next) {
		current.container = null;
	}

	this.count = 0;
	this.first = null;
	this.last  = null;
};

OrderedList.prototype.getCount = function () {
	return this.count;
};

OrderedList.prototype.forEach = function (processingFunc, params) {
	for (var current = this.first; current; current = current.next) {
		processingFunc(current.object, params);
	}
};

OrderedList.prototype.forEachReverse = function (processingFunc, params) {
	for (var current = this.last; current; current = current.previous) {
		processingFunc(current.object, params);
	}
};

OrderedList.prototype.reposition = function (node) {
	if (node.container !== this) {
		return this.add(node.object);
	}

	var prev = node.previous;
	var next = node.next;
	var obj  = node.object;

	if (next === null) {
		this.last = prev;
	} else {
		next.previous = prev;
	}

	if (prev === null) {
		this.first = next;
	} else {
		prev.next = next;
	}

	while (prev !== null && this.cmpFunc(obj, prev.object) < 0) {
		next = prev;
		prev = prev.previous;
	}

	while (next !== null && this.cmpFunc(obj, next.object) >= 0) {
		prev = next;
		next = next.next;
	}

	node.next = next;
	if (next === null) {
		this.last = node;
	} else {
		next.previous = node;
	}

	node.previous = prev;
	if (prev === null) {
		this.first = node;
	} else {
		prev.next = node;
	}

	return node;
};

module.exports = OrderedList;
},{}],32:[function(require,module,exports){
var inherits     = require('util').inherits;
var ISound       = require('./ISound.js');
var PLAY_OPTIONS = { playAudioWhenScreenIsLocked: false };


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Audio wrapper using HTML5 <Audio>
 * @author  Cedric Stoquer
 * 
 */
function Sound() {
	ISound.call(this);

	var audio   = new Audio();
	audio.loop  = false;
	audio.type  = 'audio/mpeg';
	this._audio = audio;

	// if available, use webAudio for better performances
	if (this.audioContext) {
		this.source = this.audioContext.createMediaElementSource(audio);
		this.source.connect(this.audioContext.destination);
	}
}
inherits(Sound, ISound);
module.exports = Sound;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Sound.prototype.setVolume = function (value) {
	this.volume = this._audio.volume = value;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Sound.prototype.setLoop = function (value) {
	this.loop = this._audio.loop = value;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Load sound
 * @private
 */
Sound.prototype._load = function () {
	var self = this;

	function loadFail(error) {
		// TODO: keep track that loading has failed to not retry to loading it
		self._finalizeLoad(error);
	}

	function onAudioLoaded() {
		this.removeEventListener('canplaythrough', onAudioLoaded);
		this.removeEventListener('error', onAudioError);
		self.usedMemory = this.duration;
		self.audioManager.usedMemory += this.duration;
		self._finalizeLoad(null);
	}

	function onAudioError(error) {
		this.removeEventListener('canplaythrough', onAudioLoaded);
		this.removeEventListener('error', onAudioError);
		loadFail(error);
	}

	function loadAudio(uri) {
		self._loading = true;
		self._audio.addEventListener('canplaythrough', onAudioLoaded);
		self._audio.addEventListener('error', onAudioError);
		self._audio.src = uri;
		self._audio.load();
	}

	var getFileUri = this.audioManager.settings.getFileUri;
	var audioPath  = this.audioManager.settings.audioPath;

	if (getFileUri.length > 2) {
		// asynchronous
		getFileUri(audioPath, this.id, function onUri(error, uri) {
			if (error) return loadFail(error);
			loadAudio(uri);
		});
	} else {
		// synchronous
		try {
			var uri = getFileUri(audioPath, this.id);
			if (!uri) return loadFail('emptyUri');
			loadAudio(uri);
		} catch (error) {
			loadFail(error);
		}
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Unload sound from memory */
Sound.prototype.unload = function () {
	if (ISound.prototype.unload.call(this)) {
		this._audio.volume = 1.0;
		this._audio.src = '';
		this._audio.load();
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play sound. If sound is not yet loaded, it is loaded in memory and flagged to be played
 *  once loading has finished. If loading take too much time, playback may be cancelled.
 */
Sound.prototype._play = function (pitch) {
	// TODO: sound pan
	// TODO: fade-in
	this._audio.volume = this.volume;
	this._audio.pause();
	this._audio.currentTime = 0;
	this._audio.play(PLAY_OPTIONS);
	this.playing = true;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Stop sound
 *
 * @param {Function} [cb] - optional callback function (use it when sound has a fade out)
 */
Sound.prototype.stop = function (cb) {
	this._audio.pause();
	this._audio.currentTime = 0;
	this._playTriggered = 0;
	this.playing = false;
	return cb && cb(); // TODO: fade-out
};

},{"./ISound.js":30,"util":71}],33:[function(require,module,exports){
var inherits = require('util').inherits;
var ISound   = require('./ISound.js');

// setValueAtTime, exponentialRampToValueAtTime and linearRampToValueAtTime thrown an exception if
// provided value is less than or equal to 0.
// we use MIN_VALUE instead of 0 when calling these functions
// see:
// http://webaudio.github.io/web-audio-api/#widl-AudioParam-exponentialRampToValueAtTime-void-float-value-double-endTime
// http://stackoverflow.com/questions/29819382/how-does-the-audioparam-exponentialramptovalueattime-work
var MIN_VALUE = 0.000001;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Audio wrapper using AudioBufferSourceNode
 * @author  Cedric Stoquer
 * 
 */
function SoundBuffered() {
	ISound.call(this);

	this.buffer          = null;
	this.source          = null;
	this.sourceConnector = null;
	this.gain            = null;
	this.panNode         = null;
	this.rawAudioData    = null;

	this._playPitch      = 0.0;  // pitch for each independent play
	this._fadeTimeout    = null;
	this._onStopCallback = null;
	this._audioNodeReady = false;

	this.init();
}
inherits(SoundBuffered, ISound);
module.exports = SoundBuffered;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype._createAudioNodes = function () {
	if (this._audioNodeReady) return;
	if (!this.audioContext) return;

	// create webAudio nodes
	// source -> gain -> pan -> destination

	var audioContext = this.audioContext;
	var gainNode     = audioContext.createGain();
	var panNode;

	if (audioContext.createStereoPanner) {
		panNode = audioContext.createStereoPanner();
	} else {
		// fallback to 3D PannerNode
		panNode = audioContext.createPanner();
	}

	gainNode.connect(panNode);
	panNode.connect(audioContext.destination);

	gainNode.gain.value  = 0;
	this.sourceConnector = gainNode;
	this.gain            = gainNode.gain;
	this.panNode         = panNode;

	this._audioNodeReady = true;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype._destroyAudioNodes = function () {
	if (!this._audioNodeReady) return;

	var audioContext = this.audioContext;
	var panNode      = this.panNode;
	var gainNode     = this.sourceConnector;

	gainNode.disconnect(panNode);
	panNode.disconnect(audioContext.destination);

	if (this.source) {
		this.source.disconnect(gainNode);
		this.source.onended = null;
		this.source = null;
	}

	this.sourceConnector = null;
	this.gain            = null;
	this.panNode         = null;
	this.rawAudioData    = null;
	this._audioNodeReady = false;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype.init = function () {
	this._createAudioNodes();

	if (!this.rawAudioData) return;

	var self           = this;
	var maxPlayLatency = this.audioManager.settings.maxPlayLatency;
	var audioContext   = this.audioContext;


	function onAudioDecodeSuccess(buffer) {
		self.buffer = buffer;
		self.usedMemory = buffer.duration;
		self.audioManager.usedMemory += buffer.duration;
		self.rawAudioData = null;
		if (self._loaded && self._playTriggered) {
			if (self.loop || Date.now() - self._playTriggered < maxPlayLatency) { self._play(); }
			self._playTriggered = 0;
		}
	}

	function onAudioDecodeFail() {
		console.error('decode audio failed for sound ', self.id);
	}

	audioContext.decodeAudioData(this.rawAudioData, onAudioDecodeSuccess, onAudioDecodeFail);
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype.setVolume = function (value) {
	this.volume = value;
	if (!this.playing) return;
	if (!this.fade) {
		this.gain.value = value;
		return;
	}
	if (value <= 0) value = MIN_VALUE;
	var currentTime = this.audioContext.currentTime;
	this.gain.cancelScheduledValues(currentTime);
	this.gain.setValueAtTime(this.gain.value || MIN_VALUE, currentTime);
	this.gain.linearRampToValueAtTime(value, currentTime + this.fade);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype.setPan = function (value) {
	this.pan = value;
	if (!this.panNode) return;
	if (this.panNode.pan) {
		// stereo panning
		this.panNode.pan.value = value;
	} else {
		// 3D panning
		this.panNode.setPosition(value, 0, 0.2);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype.setLoop = function (value, loopStart, loopEnd) {
	this.loop       = !!value;
	this._loopStart = loopStart || 0;
	this._loopEnd   = loopEnd   || 0;
	if (!this.source || !this.buffer) return;

	this.source.loop = value;
	this._setLoopPoints();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype._setLoopPoints = function () {
	this.source.loopStart = this._loopStart || 0;

	var loopEnd = this._loopEnd;

	// When loop end point is negative, we set endPoint from the end of the buffer
	if (loopEnd < 0) loopEnd = this.buffer.duration + loopEnd;
	if (loopEnd < 0) loopEnd = 0;
	this.source.loopEnd = loopEnd || this.buffer.duration;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Set sound pitch
 *
 * @param {number} pitch        - pitch in semi-tone
 * @param {number} [portamento] - duration to slide from previous to new pitch.
 */
SoundBuffered.prototype.setPitch = function (pitch, portamento) {
	this.pitch = pitch;
	this._setPlaybackRate(portamento);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype._updatePlayPitch = function (pitch) {
	if ((pitch || pitch === 0) && pitch !== this._playPitch) {
		this._playPitch = pitch;
		this._setPlaybackRate(0);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype._setPlaybackRate = function (portamento) {
	if (!this.source) return;
	var rate = Math.pow(2, (this._playPitch + this.pitch) / 12);
	if (!portamento) {
		this.source.playbackRate.value = rate;
		return;
	}
	var currentTime = this.audioContext.currentTime;
	this.source.playbackRate.cancelScheduledValues(currentTime);
	this.source.playbackRate.setValueAtTime(this.source.playbackRate.value || MIN_VALUE, currentTime);
	this.source.playbackRate.linearRampToValueAtTime(rate, currentTime + portamento);
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Load sound
 * @private
 */
SoundBuffered.prototype._load = function () {
	var self = this;

	this._createAudioNodes();

	function loadFail(error) {
		// TODO: keep track that loading has failed so we don't retry to load it ?
		self._finalizeLoad(error);
	}

	function onAudioLoaded(buffer) {
		self.buffer = buffer;
		self.usedMemory = buffer.duration;
		self.audioManager.usedMemory += buffer.duration;
		self._finalizeLoad(null);
	}

	function loadAudio(uri) {
		var xobj = new XMLHttpRequest();
		xobj.responseType = 'arraybuffer';

		xobj.onreadystatechange = function onXhrStateChange() {
			if (~~xobj.readyState !== 4) return;
			if (~~xobj.status !== 200 && ~~xobj.status !== 0) {
				return loadFail('xhrError:' + xobj.status);
			}
			if (self.audioContext) {
				self.audioContext.decodeAudioData(xobj.response, onAudioLoaded, loadFail);
			} else {
				self.rawAudioData = xobj.response;
				self._finalizeLoad(null);
			}
		};

		xobj.open('GET', uri, true);
		xobj.send();
	}

	var getFileUri = this.audioManager.settings.getFileUri;
	var audioPath  = this.audioManager.settings.audioPath;

	if (getFileUri.length > 2) {
		// asynchronous
		getFileUri(audioPath, this.id, function onUri(error, uri) {
			if (error) return loadFail(error);
			loadAudio(uri);
		});
	} else {
		// synchronous
		try {
			var uri = getFileUri(audioPath, this.id);
			if (!uri) return loadFail('emptyUri');
			loadAudio(uri);
		} catch (error) {
			loadFail(error);
		}
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Unload sound from memory */
SoundBuffered.prototype.unload = function () {
	if (ISound.prototype.unload.call(this)) {
		if (this._fadeTimeout) {
			this._onStopCallback = null;
			this._stopAndClear();
		}
		this.buffer = null;
		if (this.source) {
			this.source.onended = null;
			this.source.stop(0);
			this.source = null;
		}
		this._destroyAudioNodes();
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play sound. If sound is not yet loaded, it is loaded in memory and flagged to be played
 *  once loading has finished. If loading take too much time, playback may be cancelled.
 */
SoundBuffered.prototype._play = function (pitch) {
	if (!this.buffer) {
		this._playTriggered = Date.now();
		return;
	}

	this.playing = true;

	var currentTime = this.audioContext.currentTime;
	this.gain.cancelScheduledValues(currentTime);
	if (this.fade) {
		this.gain.setValueAtTime(this.gain.value || MIN_VALUE, currentTime);
		this.gain.linearRampToValueAtTime(this.volume || MIN_VALUE, currentTime + this.fade);
	} else {
		this.gain.value = this.volume;
	}

	// if sound is still fading out, clear all onStop callback
	if (this._fadeTimeout) {
		this._onStopCallback = null;
		this.source.onended = null;
		this.stopping = false;
		window.clearTimeout(this._fadeTimeout);
		this._fadeTimeout = null;
		return;
	}

	if (this.source) {
		this.source.disconnect(this.sourceConnector);
		this.source.onended = null;
	}

	var sourceNode = this.source = this.audioContext.createBufferSource();
	sourceNode.connect(this.sourceConnector);

	var self = this;
	sourceNode.onended = function onPlaybackEnd() {
		self.playing       = false;
		sourceNode.onended = null;
		self.source        = null;
	};

	this._playPitch = pitch || 0;
	if (pitch || this.pitch) {
		this._setPlaybackRate(0);
	}

	sourceNode.loop      = this.loop;
	sourceNode.buffer    = this.buffer;
	this._setLoopPoints();
	sourceNode.start(0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
SoundBuffered.prototype._stopAndClear = function () {
	this.stopping = false;
	this.source.onended = null;
	this.source.stop(0);
	this.source = null;
	if (this._fadeTimeout) {
		window.clearTimeout(this._fadeTimeout);
		this._fadeTimeout = null;
	}
	if (this._onStopCallback) {
		this._onStopCallback();
		this._onStopCallback = null;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Stop sound
 *
 * @param {Function} [cb] - optional callback function
 */
SoundBuffered.prototype.stop = function (cb) {
	if (!this.playing && !this.stopping) return cb && cb();
	this._playTriggered = 0;
	this.stopping = true;
	this.playing  = false;
	if (!this.source) return cb && cb();

	this._onStopCallback = cb; // TODO: do we allow multiple stop cb ?

	if (this._fadeTimeout) return;

	if (this.fade) {
		var self = this;
		var currentTime = this.audioContext.currentTime;
		this.gain.cancelScheduledValues(currentTime);
		this.gain.setValueAtTime(this.gain.value || MIN_VALUE, currentTime);
		this.gain.linearRampToValueAtTime(MIN_VALUE, currentTime + this.fade);
		this._fadeTimeout = window.setTimeout(function onFadeEnd() {
			self._fadeTimeout = null;
			self._stopAndClear();
		}, this.fade * 1000);
		return;
	}

	this._stopAndClear();
};


},{"./ISound.js":30,"util":71}],34:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Set of sound played in sequence each times it triggers
 *  used for animation sfx
 * @author Cedric Stoquer
 *
 * @param {String}       id       - sound ground id
 * @param {number[]}     soundIds - array of sound ids
 * @param {number[]}     volumes  - array of volumes
 * @param {number[]}     pitches  - array of pitches
 */
function SoundGroup(id, soundIds, volumes, pitches, muted) {
	this.id         = id;
	this.soundIds   = soundIds;
	this.volumes    = volumes || [];
	this.pitches    = pitches || [];
	this.soundIndex = 0;
	this.volIndex   = 0;
	this.pitchIndex = 0;
	this.poolRef    = null;
	this._ready     = false;

	if (this.volumes.length === 0) this.volumes.push(1.0);
	if (this.pitches.length === 0) this.pitches.push(0.0);

	if (!muted) this._createSounds();
}
module.exports = SoundGroup;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Create and load all sound used in group */
SoundGroup.prototype._createSounds = function () {
	var soundIds = this.soundIds;
	for (var i = 0; i < soundIds.length; i++) {
		this.audioManager.loadSound(soundIds[i]);
	}
	this._ready = true;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Play sound group.
 *
 * @param {number} [volume] - optional volume
 * @param {number} [pan]    - optional panoramic
 * @param {number} [pitch]  - optional pitch value in semi-tone (available only if using webAudio)
 */
SoundGroup.prototype.play = function (volume, pan, pitch) {
	if (this.soundIds.length === 0) return;
	if (!this._ready) this._createSounds();
	var soundId = this.soundIds[this.soundIndex++];
	var sound = this.audioManager.getSound(soundId);
	if (!sound) return console.warn('[Sound Group: ' + this.id + '] sound id ' + soundId + '  cannot be played.');
	volume = volume || 1.0;
	pitch  = pitch  || 0.0;
	volume *= this.volumes[this.volIndex++];
	pitch  += this.pitches[this.pitchIndex++];
	sound.play(volume, pan, pitch);
	if (this.soundIndex >= this.soundIds.length) { this.soundIndex = 0; }
	if (this.volIndex   >= this.volumes.length)  { this.volIndex   = 0; }
	if (this.pitchIndex >= this.pitches.length)  { this.pitchIndex = 0; }
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** Check that all sounds in group are correctly created */
SoundGroup.prototype.verifySounds = function () {
	for (var i = 0; i < this.soundIds.length; i++) {
		var soundId = this.soundIds[i];
		this.audioManager.createSound(soundId);
	}
};

},{}],35:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/**
 * Pixelbox main framework module
 * 
 * @author Cedric Stoquer
 */

var settings     = require('../settings.json');
window.settings  = settings;

var assetLoader  = require('assetLoader');
var AudioManager = require('audio-manager');
var Texture      = require('Texture');
var TINA         = require('TINA');
var EventEmitter = require('EventEmitter');
var Map          = require('Map');


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// built-in modules

window.EventEmitter = EventEmitter;
window.TINA         = TINA;

window.inherits = function (Child, Parent) {
	Child.prototype = Object.create(Parent.prototype, {
		constructor: {
			value:        Child,
			enumerable:   false,
			writable:     true,
			configurable: true
		}
	});
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// audio

var audioManager = window.audioManager = new AudioManager(['sfx']);
audioManager.settings.audioPath = 'audio/';
audioManager.settings.defaultFade = 0.3;

audioManager.init();
audioManager.setVolume('sfx', 1.0);

window.sfx = function (soundId, volume, panoramic, pitch) {
	audioManager.playSound('sfx', soundId, volume, panoramic, pitch);
};

window.music = function (soundId, volume) {
	if (!soundId) {
		audioManager.stopLoopSound('sfx');
		return;
	}
	audioManager.playLoopSound('sfx', soundId, volume);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// controls

var keyMap   = {};
var button   = window.btn  = {};
var bpress   = window.btnp = {};
var brelease = window.btnr = {};
var buttonNames  = [];
var buttonLength = 0;

(function setupKeyMap() {
	var controls = settings.controls || { up: 38, down: 40, left: 37, right: 39, A: 32, B: 88 };
	for (var key in controls) {
		var keyCode = controls[key];
		keyMap[keyCode] = key;
		button[key]   = false;
		bpress[key]   = false;
		brelease[key] = false;
		buttonNames.push(key);
	}
	buttonLength = buttonNames.length;
})();

function resetControlTriggers() {
	for (var i = 0; i < buttonLength; i++) {
		bpress[buttonNames[i]]   = false;
		brelease[buttonNames[i]] = false;
	}
}

function keyChange(keyCode, isPressed) {
	var key = keyMap[keyCode];
	if (!key) return;
	if ( isPressed && !button[key])   bpress[key] = true;
	if (!isPressed &&  button[key]) brelease[key] = true;
	button[key] = isPressed;
}

window.addEventListener('keydown', function onKeyPressed(e) { e.preventDefault(); keyChange(e.keyCode, true);  });
window.addEventListener('keyup',   function onKeyRelease(e) { e.preventDefault(); keyChange(e.keyCode, false); });

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Texture

var currentSpritesheet = Texture.prototype.currentSpritesheet;
var textCharset = Texture.prototype.textCharset;

window.texture = function (img) {
	var texture = new Texture(img.width, img.height);
	texture.ctx.drawImage(img, 0, 0);
	return texture;
}

window.spritesheet = function(img) {
	return Texture.prototype.setGlobalSpritesheet(img);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// screen

function createScreen(width, height, pixelSize) {
	var texture = new Texture(width, height);
	var canvas = texture.canvas;
	document.body.appendChild(canvas);
	var style = canvas.style;
	style.width  = width  * pixelSize[0] + 'px';
	style.height = height * pixelSize[1] + 'px';
	return texture;
}

var screen = window.$screen = createScreen(settings.screen.width, settings.screen.height, settings.screen.pixelSize);
screen.setPalette(settings.palette);

window.cls      = function ()                 { return screen.cls();                    };
window.sprite   = function (s, x, y, h, v, r) { return screen.sprite(s, x, y, h, v, r); };
window.draw     = function (img, x, y, h, v)  { return screen.draw(img, x, y, h, v);    };
window.rect     = function (x, y, w, h)       { return screen.rect(x, y, w, h);         };
window.rectfill = function (x, y, w, h)       { return screen.rectfill(x, y, w, h);     };
window.camera   = function (x, y)             { return screen.setCamera(x, y);          };
window.pen      = function (p)                { return screen.pen(p);                   };
window.paper    = function (p)                { return screen.paper(p);                 };
window.locate   = function (i, j)             { return screen.locate(i, j);             };
window.print    = function (str, x, y)        { return screen.print(str, x, y);         };
window.println  = function (str)              { return screen.println(str);             };

/*Object.defineProperty(window, 'cls', {
	get: function () { return screen.cls(); },
	set: function () {}
});*/

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// utility functions

window.chr$ = function (chr) {
	return String.fromCharCode(chr);
};

window.clip = function (value, min, max) {
	return Math.max(min, Math.min(max, value));
};

window.random = function (n) {
	return ~~Math.round(n * Math.random());
};



//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// main

var FRAME_INTERVAL = 1 / 60;

var requestAnimationFrame = 
	window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function nextFrame(callback) { window.setTimeout(callback, FRAME_INTERVAL); };


function onAssetsLoaded(error, assets) {
	paper(0).pen(1).cls();

	if (error) {
		print(error);
		return console.error(error);
	}

	window.assets = assets;

	// set default spritesheet
	if (assets.spritesheet) spritesheet(assets.spritesheet);

	// setup all maps
	for (var i = 0; i < assets.maps.length; i++) {
		assets.maps[i] = new Map().load(assets.maps[i]);
	}

	// setup TINA with a ticker
	var ticker = new TINA.Ticker().useAsDefault();
	TINA.add(ticker);

	var main = require('../src/main.js');

	if (!main.update) return;

	function update() {
		TINA.update(); // update all tweeners
		main.update(); // call main update function
		resetControlTriggers(); // reset button pressed and release
		requestAnimationFrame(update);
	}

	resetControlTriggers();
	update();
}

var CENTER     = ~~(settings.screen.width  / 2);
var HALF_WIDTH = ~~(settings.screen.width  / 4);
var MIDDLE     = ~~(settings.screen.height / 2);


function showProgress(load, current, count, percent) {
	rectfill(CENTER - HALF_WIDTH, MIDDLE - 2, ~~(percent * HALF_WIDTH * 2), 4);
}

paper(3).cls().paper(2).pen(2).rect(CENTER - HALF_WIDTH - 2, MIDDLE - 4, HALF_WIDTH * 2 + 4, 8); // loading bar
assetLoader.preloadStaticAssets(onAssetsLoaded, showProgress);

},{"../settings.json":36,"../src/main.js":56,"EventEmitter":1,"Map":2,"TINA":23,"Texture":26,"assetLoader":27,"audio-manager":29}],36:[function(require,module,exports){
module.exports={
	"screen": {
		"width": 160,
		"height": 144,
		"pixelSize": [4, 4],
		"fullscreen": false
	},
	"spriteSize": [8, 8],
	"palette": [
		"#183725",
		"#416E2B",
		"#9FBB32",
		"#CFE581"
	],
	"controls": {
		"up": 87,
		"down": 83,
		"left": 65,
		"right": 68,
		"start": 13,
		"A": 75,
		"B": 76
	}
}
},{}],37:[function(require,module,exports){

function AABBcollision(a, b) {
	return a.x < b.x + b.w  
		&& a.y < b.y + b.h
		&& b.x < a.x + a.w 
		&& b.y < a.y + a.h;
}

module.exports = AABBcollision;

},{}],38:[function(require,module,exports){
var level          = require('./level');
var gameController = require('./view/gameView');
var AABB           = require('./AABBcollision');

var ASSET = assets.entity.banana;

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var FRICTION         = 0.9;
var ACCELERATION     = 0.01;
var MAX_ACCELERATION = 0.8;
var THROW_DURATION   = 20;
var MAX_SPEED        = 3;

var AUDIO_LOOP_START =  0.433;
var AUDIO_LOOP_END   =  1.369;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Banana(owner) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 2;
	this.h  = 2;

	this.owner = owner;
	this.reset();
}

module.exports = Banana;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.reset = function () {
	audioManager.stopLoopSound('banana');

	this.sx = 0;
	this.sy = 0;

	this.grabbing = null;

	// flags
	this.flying   = false;
	this.throwing = false;

	//counters
	this.throwCounter = 0;

	// rendering
	this.frame = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.draw = function () {
	var img = ASSET.idle;
	if (this.flying) {
		this.frame += 0.2;
		if (this.frame >= 4) this.frame = 0;
		img = ASSET['fly' + ~~this.frame];
	}
	draw(img, this.x - 4, this.y - 4);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.maxSpeed = function () {
	if (this.sx >  MAX_SPEED) this.sx =  MAX_SPEED;
	if (this.sx < -MAX_SPEED) this.sx = -MAX_SPEED;
	if (this.sy >  MAX_SPEED) this.sy =  MAX_SPEED;
	if (this.sy < -MAX_SPEED) this.sy = -MAX_SPEED;
};


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** computing movement */
Banana.prototype.update = function () {
	if (this.throwing) {
		if (this.throwCounter++ > THROW_DURATION) {
			this.throwing = false;
		}
		this.levelCollisions();
	} else if (this.flying) {
		this.sx += clip((this.owner.x - this.x) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);
		this.sy += clip((this.owner.y - this.y) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);

		this.sx *= FRICTION;
		this.sy *= FRICTION;

		this.maxSpeed();
		this.levelCollisions();

		// the monkey catch the banana
		if (AABB(this, this.owner)) this._catchBanana();
		
	} else {
		this.x = this.owner.x + 3;
		this.y = this.owner.y - 5;
	}

	// if banana is grabbing something, also update this
	if (this.grabbing) {
		this.grabbing.x = this.x - 2;
		this.grabbing.y = this.y - 6;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** actually move the entity and check for collisions with level */
Banana.prototype.levelCollisions = function () {

	var x = this.x + this.sx;
	var y = this.y + this.sy;

	// check level boundaries
	var maxX = level.width * TILE_WIDTH; // TODO don't need to be calculated each frames
	if (this.sx < 0 && x < 0   ) { x = 0;    this.sx *= -1; }
	if (this.sx > 0 && x > maxX) { x = maxX; this.sx *= -1; }


	if (level.getTileAt(x, this.y).fruitSolid) {
		this.sx *= -1;
		x = this.x; // TODO
		// x = ~~(x / TILE_WIDTH) * TILE_WIDTH + frontOffset;
	}

	if (level.getTileAt(this.x, y).fruitSolid) {
		this.sy *= -1;
		y = this.y; // TODO
	}


	// fetch position
	this.x = x;
	this.y = y;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Banana.prototype.getTeleportPosition = function () {
	// inside GLASS
	if (level.getTileAt(this.x, this.y).isSolid) return null;

	// find a empty space for monkey to teleport
	var x = this.x - 3;
	var y = this.y - 3;
	var monkey = this.owner;
	var w = monkey.w;
	var h = monkey.h;

	if (
		level.getTileAt(x    , y    ).isTeleportable &&
		level.getTileAt(x + w, y    ).isTeleportable &&
		level.getTileAt(x    , y + h).isTeleportable &&
		level.getTileAt(x + w, y + h).isTeleportable
	) return { x: x, y: y };

	// try on tile values
	var X = ~~(x / TILE_WIDTH)  * TILE_WIDTH;
	var Y = ~~(y / TILE_HEIGHT) * TILE_HEIGHT;

	if (level.getTileAt(X,              Y              ).isTeleportable) return { x: X,              y: Y               };
	if (level.getTileAt(X + TILE_WIDTH, Y              ).isTeleportable) return { x: X + TILE_WIDTH, y: Y               };
	if (level.getTileAt(X,              Y + TILE_HEIGHT).isTeleportable) return { x: X,              y: Y + TILE_HEIGHT };
	if (level.getTileAt(X + TILE_WIDTH, Y + TILE_HEIGHT).isTeleportable) return { x: X + TILE_WIDTH, y: Y + TILE_HEIGHT };
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** called when the monkey want to throw the banana */
Banana.prototype.fire = function (sx, sy) {
	if (level.getTileAt(this.x, this.y).fruitSolid) {
		return;
		// TODO: play "error" sound
	}

	audioManager.playLoopSound('banana', 'banana fly', 1, 0, 0, AUDIO_LOOP_START, AUDIO_LOOP_END);

	this.flying   = true;
	this.throwing = true;
	this.throwCounter = 0;
	this.sx = sx;
	this.sy = sy;
	this.maxSpeed();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** while flying, the banana collide with an item that can be grabbed */
Banana.prototype.grab = function (item) {
	if (this.grabbing) return;
	sfx('catch');
	this.grabbing = item;
	gameController.removeEntityFromCollisions(item);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
/** the monkey catch the banana */
Banana.prototype._catchBanana = function () {
	sfx('catch');
	this.flying = false;
	audioManager.stopLoopSound('banana');
	if (this.grabbing) {
		this.grabbing.collectItem(this.owner);
		this.grabbing = null;
	}
};

},{"./AABBcollision":37,"./level":55,"./view/gameView":62}],39:[function(require,module,exports){
var viewManager = require('./viewManager');
var gameView    = require('./view/gameView');
var level       = require('./level');
var Banana      = require('./Banana');
var AABB        = require('./AABBcollision');
var tiles       = require('./tiles');
var speedrun    = require('./speedrun');

var ASSET = assets.entity.monkey;
var ARROW = assets.entity.arrow;

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var GRAVITY     = 0.5;
var MAX_GRAVITY = 3;
var SPEED_WALK  = 1;
var SPEED_RUN   = 2;
var THROW_SPEED = 4;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Monkey(gamepadIndex) {
	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;

	this.gamepadIndex = gamepadIndex || 0;
	this.banana = new Banana(this);
	
	this.maxLife = 4;
	this.lifePoints = this.maxLife;

	// rendering
	this.sprite = gamepadIndex * 16;

	this.reset();
}

module.exports = Monkey;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.reset = function () {
	this.sx = 0;
	this.sy = 0;
	this.dx = 0;
	this.dy = 0;

	// inventory
	this.hasKey = false;

	// state
	this.onTile = tiles.EMPTY;

	// flags
	this.aiming   = false;
	this.jumping  = false;
	this.grounded = false;
	this.isLocked = false;
	this.isHit    = false;

	// counters
	this.jumpCounter = 0;
	this.hitCounter  = 0;

	// rendering
	this.frame = 0;
	this.flipH = false;
	
	this.banana.reset();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.draw = function () {
	if (this.aiming) draw(ARROW['' + this.dx + this.dy], this.x - 16, this.y - 20);

	// idle
	var img = ASSET.idle;

	// hit
	if (this.isHit && this.isLocked) img = ASSET.hit;

	//jumping
	else if (this.jumping) img = ASSET.jump;

	//running
	else if (this.sx > 0.5 || this.sx < -0.5) {
		this.frame += 0.3;
		if (this.frame >= 3) this.frame = 0;
		img = ASSET['run' + ~~this.frame];
	}

	draw(img, this.x - 1, this.y - 1, this.flipH);
	this.banana.draw();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.update = function (gamepad) {
	this._updateControls(gamepad);

	// movement, gravity, friction
	this.sx *= this.isHit ? 0.99 : 0.8;

	if (!this.grounded) {
		this.sy += GRAVITY;
		this.sy = Math.min(this.sy, MAX_GRAVITY);
	}

	// hit
	if (this.isHit) {
		this.hitCounter++;
		if (this.hitCounter > 16) {
			if (this.lifePoints <= 0) this.death();
			this.isLocked = false;
		}
		// keep Monkey invulnerable for few more frames
		if (this.hitCounter > 50) this.isHit = false;
	}

	this.levelCollisions();

	this.banana.update();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.aim = function (gamepad) {
	if (this.banana.flying) return;

	this.aiming = true;

	// throw direction
	this.dx = 0;
	this.dy = 0;
	if (gamepad.btn.right) { this.dx += 1; this.flipH = false; }
	if (gamepad.btn.left)  { this.dx -= 1; this.flipH = true;  }
	if (gamepad.btn.down)  this.dy += 1;
	if (gamepad.btn.up)    this.dy -= 1;

	// orient monkey in aiming direction
	if (this.dx === 0 && this.dy === 0) this.dx = this.flipH ? -1 : 1;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.teleport = function () {
	if (!this.banana.flying) return;
	var position = this.banana.getTeleportPosition();
	if (!position) return;
	// TODO: cooldown

	sfx('teleport');

	this.banana.x = this.x + 4;
	this.banana.y = this.y + 4;
	this.x = position.x;
	this.y = position.y;

	this.grounded = false;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.startJump = function () {
	if (!this.grounded) return;

	sfx('jump');

	// if there is a ceiling directly on top of Monkey's head, cancel jump.
	// if (level.getTileAt(this.x + 1, this.y - 2).isSolid || level.getTileAt(this.x + 6, this.y - 2).isSolid) return;
	this.grounded    = false;
	this.jumping     = true;
	this.jumpCounter = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.jump = function () {
	if (!this.jumping) return;
	if (this.jumpCounter++ > 12) this.jumping = false;
	this.sy = -3 + this.jumpCounter * 0.08;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype._updateControls = function (gamepad) {
	if (this.isLocked) return;

	// throw banana
	if (gamepad.btnr.B && !this.banana.flying) {
		this.aiming = false;
		this.banana.fire(this.dx * THROW_SPEED, this.dy * THROW_SPEED);
	}

	// teleport
	if (gamepad.btnp.B && this.banana.flying) this.teleport();

	// jump
	if (gamepad.btnp.A) this.startJump();
	if (gamepad.btnr.A) this.jumping = false;
	if (gamepad.btn.A)  this.jump();

	// aiming
	if (gamepad.btn.B) return this.aim(gamepad);

	// move
	if (gamepad.btn.right && !gamepad.btn.left)  { this.sx =  SPEED_WALK; this.flipH = false; } // going right
	if (gamepad.btn.left  && !gamepad.btn.right) { this.sx = -SPEED_WALK; this.flipH = true;  } // going left

	// door & interactive
	if (gamepad.btnp.up && !gamepad.btn.right && !gamepad.btn.left && this.onTile.interactive) {
		this.useInteractive();
	}

	// check tile
	var tile = this.onTile = level.getTileAt(this.x + 4, this.y + 4);
	if (tile.kill) return this.death();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.levelCollisions = function () {
	// round speed
	this.sx = ~~(this.sx * 100) / 100;
	this.sy = ~~(this.sy * 100) / 100;

	var x = this.x + this.sx; // TODO dt
	var y = this.y + this.sy; // TODO dt

	// check level boundaries
	var maxX = level.width  * TILE_WIDTH - this.w; // TODO don't need to be calculated each frames
	var maxY = level.height * TILE_HEIGHT + 64; // give monkey 8 more tiles for chnce to teleport
	if (x < 0)    x = 0;
	if (x > maxX) x = maxX;
	if (y > maxY) {
		sfx('fall');
		this.death();
		return;
	}

	var front       = this.w;
	var frontOffset = 0;
	if (this.sx < 0) { front = 0; frontOffset = this.w; }

	//---------------------------------------------------------
	// horizontal collisions (check 2 front point)
	if (this.sx !== 0) {
		if (level.getTileAt(x + front, this.y + 1).isSolid || level.getTileAt(x + front, this.y + this.h - 1).isSolid) {
			this.sx = 0;
			x = ~~(x / TILE_WIDTH) * TILE_WIDTH + frontOffset;
		}
	} else {
		// if no horizontal speed, round position to avoid flickering
		x = Math.round(x);
	}

	//---------------------------------------------------------
	// vertical collisions
	if (this.grounded) {
		// check if there is still floor under Monkey's feets
		var tileDL = level.getTileAt(x + 1,          y + this.h + 1);
		var tileDR = level.getTileAt(x + this.w - 2, y + this.h + 1);
		if (tileDL.isEmpty && tileDR.isEmpty) this.grounded = false;
	} else if (this.sy > 0) {
		// Monkey is falling. Check what is underneath
		var tileDL = level.getTileAt(x + 1,          y + this.h);
		var tileDR = level.getTileAt(x + this.w - 2, y + this.h);
		if (tileDL.isSolid || tileDR.isSolid) {
			// collided with solid ground
			this._ground();
			y = ~~(y / TILE_HEIGHT) * TILE_HEIGHT;
		} else if (tileDL.isTopSolid || tileDR.isTopSolid) {
			// collided with one-way thru platform. Check if Monkey where over the edge the frame before.
			var targetY = ~~(y / TILE_HEIGHT) * TILE_HEIGHT;
			if (this.y <= targetY) {
				this._ground();
				y = targetY;
			}
		}
	} else if (this.sy < 0) {
		// Monkey is moving upward. Check for ceiling collision
		var tileUL = level.getTileAt(x + 1,          y);
		var tileUR = level.getTileAt(x + this.w - 2, y);
		if (tileUL.isSolid || tileUR.isSolid) {
			this.sy = 0;
			y = ~~(y / TILE_HEIGHT) * TILE_HEIGHT + this.w;
		}
	}

	// fetch position
	this.x = x;
	this.y = y;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype._ground = function () {
	this.grounded = true;
	this.jumping  = false;
	this.sy = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.checkCollisionWithEntity = function (entity) {
	var banana = this.banana;
	if (                 entity.collisionMonkey && AABB(this,   entity)) entity.collisionMonkey(this);
	if (banana.flying && entity.collisionBanana && AABB(banana, entity)) entity.collisionBanana(banana);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.hit = function (entity) {
	if (this.isHit) return;

	sfx('hit');

	this.sx = entity.x < this.x ? 1.6 : -1.6;
	this.sy = entity.y < this.y ? 2 : -3;

	// TODO
	this.aiming     = false;
	this.grounded   = false;
	this.isLocked   = true;
	this.isHit      = true;
	this.hitCounter = 0;

	this.lifePoints -= 1;
	gameView.shakeCamera(3);
	gameView.updateHealthHUD();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.death = function () {
	audioManager.stopLoopSound('banana');
	// TODO animation
	this.lifePoints = this.maxLife;
	this.isHit      = true;
	this.isLocked   = true;
	speedrun.death();
	viewManager.open('gameover');
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Monkey.prototype.useInteractive = function () {
	if (this.onTile.door) gameView.gotoNextLevel();
};

},{"./AABBcollision":37,"./Banana":38,"./level":55,"./speedrun":57,"./tiles":58,"./view/gameView":62,"./viewManager":59}],40:[function(require,module,exports){
var gameView = require('./view/gameView');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Particle(params, controller) {
	params = params || {};
	this.controller = controller || gameView;

	this.x  = 0;
	this.y  = 0;
	this.sx = 0;
	this.sy = 0;

	this.frame = 0;
	this.life  = 0;
	this.flipH = false;
	this.flipV = false;

	this.animation = params.animation;
	this.animSpeed = params.animSpeed || 0;
	this.lifetime  = params.lifetime  || this.animation.length / this.animSpeed;
	this.gravity   = params.gravity   || 0;

	this.controller.addEntity(this);
}
module.exports = Particle;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Particle.prototype.draw = function () {
	this.life += 1;
	if (this.life >= this.lifetime) {
		this.controller.removeEntity(this);
		return;
	}

	// TODO movement & gravity
	this.sy += this.gravity;
	this.x  += this.sx;
	this.y  += this.sy;

	this.frame += this.animSpeed;
	if (this.frame >= this.animation.length) this.frame = 0;

	var current = this.animation[~~this.frame];
	draw(current, this.x, this.y, this.flipH, this.flipV);
};

},{"./view/gameView":62}],41:[function(require,module,exports){
var gameController = require('./view/gameView');


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function ShortAnimation(animation, animSpeed) {
	this.x = 0;
	this.y = 0;
	this.frame = 0;
	this.flipH = false;
	this.flipV = false;
	this.animSpeed = animSpeed || 0.2;
	this.animation = animation;
}

module.exports = ShortAnimation;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ShortAnimation.prototype.draw = function () {
	this.frame += this.animSpeed;
	if (this.frame >= this.animation.length) {
		gameController.removeEntity(this);
		return;
	}
	var current = this.animation[~~this.frame];
	if (typeof current === 'number') {
		sprite(current, this.x, this.y, this.flipH, this.flipV);
	} else {
		draw(current, this.x, this.y, this.flipH, this.flipV);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ShortAnimation.prototype.setAnimation = function (animation, animSpeed) {
	this.animation = animation;
	this.animSpeed = animSpeed || this.animSpeed || 0.2;
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ShortAnimation.prototype.setPosition = function (x, y) {
	this.x = x;
	this.y = y;
	return this;
};
},{"./view/gameView":62}],42:[function(require,module,exports){
var Texture = require('Texture');
var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var CHAR_OFFSET = 32;
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function TextBox(w, h, font, color) {
	this.w     = w;
	this.h     = h;
	this.paper = 0;
	this.color = 0;

	this.texture = new Texture(w, h);
	this.texture.setSpritesheet(font);
}

module.exports = TextBox;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
TextBox.prototype.clear = function () {
	this.texture.clear();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
TextBox.prototype.cls = function () {
	this.texture.paper(this.paper);
	this.texture.cls();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
TextBox.prototype.addText = function (text, x, y) {
	for (var t = 0; t < text.length; t++) {
		var c = text.charCodeAt(t);
		var s = this.color * 64 + c - CHAR_OFFSET;
		this.texture.sprite(s, x, y);
		x += TILE_WIDTH;
	}
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
TextBox.prototype.setColor = function (c) {
	this.color = (~~c) % 4;
	return this;
};

},{"Texture":26}],43:[function(require,module,exports){
exports.explosion = [
	assets.entity.explosion.frame0,
	assets.entity.explosion.frame1,
	assets.entity.explosion.frame2,
	assets.entity.explosion.frame3,
	assets.entity.explosion.frame4,
	assets.entity.explosion.frame5,
	assets.entity.explosion.frame6,
	assets.entity.explosion.frame7,
	assets.entity.explosion.frame8
];

exports.getFX = [
	assets.entity.getFX.frame0,
	assets.entity.getFX.frame1,
	assets.entity.getFX.frame2,
	assets.entity.getFX.frame3,
	assets.entity.getFX.frame4,
	assets.entity.getFX.frame5,
	assets.entity.getFX.frame6
];

},{}],44:[function(require,module,exports){
// preload SFX sounds
audioManager.loadSound('jump');
audioManager.loadSound('teleport');
audioManager.loadSound('catch');
audioManager.loadSound('wrong');
audioManager.loadSound('explosion');
audioManager.loadSound('fall');
audioManager.loadSound('hit');
audioManager.loadSound('item');
audioManager.loadSound('bounce');
},{}],45:[function(require,module,exports){
var gameView       = require('../view/gameView');
var ShortAnimation = require('../ShortAnimation');
var animations     = require('../animations');
var level          = require('../level');
var ItemLife       = require('./ItemLife');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var ANIMATION_SPEED = 0.2;
var ANIMATION = [
	assets.entity.bat.fly0,
	assets.entity.bat.fly1,
	assets.entity.bat.fly2,
	assets.entity.bat.fly1
];

var FRICTION         = 0.9;
var ACCELERATION     = 0.01;
var MAX_ACCELERATION = 0.03;
var MAX_SPEED        = 0.5;


var ANIMATION_LENGTH = ANIMATION.length;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Worm(params) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 8;
	this.h  = 8
	this.sx = 0;
	this.sy = 0;

	this.sleeping = true;
	this.frame = random(ANIMATION_LENGTH);
}

module.exports = Worm;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.draw = function () {
	var monkey = gameView.monkey;

	if (this.sleeping) {
		draw(assets.entity.bat.hang0, this.x, this.y);
		// wake up when monkey is under
		if (
			Math.abs(monkey.x - this.x) < 24 // monkey is close horizontally
		 &&  monkey.y > this.y               // monkey is under the bat
		 &&  monkey.y - this.y < 64          // bat is in the screen
		) this.sleeping = false;
		return;
	}

	// move toward monkey
	var tx = monkey.x + 4;
	var ty = monkey.y - 4;

	this.sx += clip((tx - this.x) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);
	this.sy += clip((ty - this.y) * ACCELERATION, -MAX_ACCELERATION, MAX_ACCELERATION);

	this.sx *= FRICTION;
	this.sy *= FRICTION;

	// max speed
	if (this.sx >  MAX_SPEED) this.sx =  MAX_SPEED;
	if (this.sx < -MAX_SPEED) this.sx = -MAX_SPEED;
	if (this.sy >  MAX_SPEED) this.sy =  MAX_SPEED;
	if (this.sy < -MAX_SPEED) this.sy = -MAX_SPEED;

	var x = this.x + this.sx;
	var y = this.y + this.sy;

	// level collisions

	// TODO

	// fetch position
	this.x = x;
	this.y = y;
	
	// draw
	this.frame += ANIMATION_SPEED;
	if (this.frame >= ANIMATION_LENGTH) this.frame = 0;
	draw(ANIMATION[~~this.frame], this.x - 7, this.y - 3);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionBanana = function (banana) {
	sfx('explosion');

	gameView.removeEntity(this);

	var explosion = new ShortAnimation(animations.explosion, 0.5);
	explosion.setPosition(this.x - 8, this.y - 8);
	gameView.addEntity(explosion, false);

	// a small chance to drop something
	if (Math.random() < 0.3) {
		var item = new ItemLife();
		item.sy = -1;
		item.x = ~~this.x;
		item.y = ~~this.y;
		gameView.addEntity(item, true);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};


},{"../ShortAnimation":41,"../animations":43,"../level":55,"../view/gameView":62,"./ItemLife":50}],46:[function(require,module,exports){
var ANIM_SPEED = 0.2;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Butterfly() {
	this.x  = 0;
	this.y  = 0;
	this.sx = 0;
	this.sy = 0;
	this.frame = 0;
}

module.exports = Butterfly;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Butterfly.prototype.draw = function () {

	// move
	this.x += this.sx;
	this.y += this.sy;
	// TODO

	// draw
	this.frame += ANIM_SPEED;
	if (this.frame >= 2) this.frame = 0;
	sprite(230, this.x, this.y, false, this.frame > 1);
};
},{}],47:[function(require,module,exports){
var level    = require('../level');
var Particle = require('../Particle');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var TURN_SPEED  = 0.05;
var FULL_CYCLE  = 2 * Math.PI;
var CHAIN_LENGTH = 32;

var ANIMATION = [
	assets.entity.chainedBall.ball0,
	assets.entity.chainedBall.ball1
];

var PARTICLE_ANIMATION = [
	assets.entity.chainedBall.particle0,
	assets.entity.chainedBall.particle1,
	assets.entity.chainedBall.particle2
];

var PARTICLE_PARAMS = {
	animation: PARTICLE_ANIMATION,
	animSpeed: 0.2,
	lifetime: null,
	gravity: 0
};

var ANIMATION_LENGTH = ANIMATION.length;
var ANIMATION_SPEED  = 0.5;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function ChainedBall(params) {
	params = params || {};

	this.hx = params.x;
	this.hy = params.y;
	this.x  = 0;
	this.y  = 0;
	this.w  = 8;
	this.h  = 8;
	this.a  = 0;

	this.frame = 0;
}

module.exports = ChainedBall;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ChainedBall.prototype.draw = function () {
	// rotation
	this.a += TURN_SPEED;
	if (this.a > FULL_CYCLE) this.a -= FULL_CYCLE;

	// fetch position
	var x = Math.cos(this.a);
	var y = Math.sin(this.a);

	this.x = this.hx + x * CHAIN_LENGTH - 4;
	this.y = this.hy + y * CHAIN_LENGTH - 4;

	// draw
	this.frame += ANIMATION_SPEED;
	if (this.frame >= ANIMATION_LENGTH) {
		this.frame = 0;
		var particle = new Particle(PARTICLE_PARAMS);
		particle.x = this.x;
		particle.y = this.y;
		particle.sx = 0.2 * (Math.random() - 0.5);
		particle.sy = 0.2 * (Math.random() - 0.5);
	}
	draw(ANIMATION[~~this.frame], this.x - 1, this.y - 1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// ChainedBall.prototype.collisionBanana = function (banana) {};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ChainedBall.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};


},{"../Particle":40,"../level":55}],48:[function(require,module,exports){
var gameController = require('../view/gameView');
var ShortAnimation = require('../ShortAnimation');
var animations     = require('../animations');


var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var ANIM_SPEED = 0.2;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Item(params) {
	params = params || {};

	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;
	this.ox = params.offsetX || 0;
	this.oy = params.offsetY || 0;

	this.sprites  = params.sprites;
	this.frame    = 0;
	this.animated = this.sprites.length > 1;
}

module.exports = Item;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.draw = function () {
	if (this.animated) {
		this.frame += ANIM_SPEED;
		if (this.frame >= this.sprites.length) this.frame = 0;
	}

	var s = this.sprites[~~this.frame];
	draw(s, this.x + this.ox, this.y + this.oy);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.collisionBanana = function (banana) {
	banana.grab(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.collisionMonkey = function (monkey) {
	this.collectItem(monkey);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Item.prototype.collectItem = function (monkey) {
	sfx('item');
	gameController.removeEntity(this);
	var vfx = new ShortAnimation(animations.getFX, 0.4);
	vfx.setPosition(this.x - 12, this.y - 12);
	gameController.addEntity(vfx, false);
};
},{"../ShortAnimation":41,"../animations":43,"../view/gameView":62}],49:[function(require,module,exports){
var gameView = require('../view/gameView');
var Item     = require('./Item');

var ANIMATION = [
	assets.entity.item.key0,
	assets.entity.item.key1,
	assets.entity.item.key2,
	assets.entity.item.key4,
	assets.entity.item.key5,
	assets.entity.item.key6,
	assets.entity.item.key7,
	assets.entity.item.key8,
	assets.entity.item.key9,
	assets.entity.item.key10,
	assets.entity.item.key11,
	assets.entity.item.key12
];

var PARAMS = {
	sprites: ANIMATION,
	offsetX: -1,
	offsetY: -1
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function ItemKey() {
	Item.call(this, PARAMS);
}
inherits(ItemKey, Item);
module.exports = ItemKey;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemKey.prototype.collectItem = function (monkey) {
	Item.prototype.collectItem.call(this, monkey);
	monkey.hasKey = true;
	gameView.displayMessage("   YOU FOUND A KEY");
};

},{"../view/gameView":62,"./Item":48}],50:[function(require,module,exports){
var gameView = require('../view/gameView');
var Item     = require('./Item');
var level    = require('../level');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var ANIMATION = [
	assets.entity.item.life0,
	assets.entity.item.life1,
	assets.entity.item.life2,
	assets.entity.item.life3,
	assets.entity.item.life4,
	assets.entity.item.life5,
	assets.entity.item.life6,
	assets.entity.item.life7,
	assets.entity.item.life8
];

var PARAMS = {
	sprites: ANIMATION,
	offsetX: -2,
	offsetY: -3
};

var GRAVITY     = 0.15;
var MAX_GRAVITY = 2.5;
var DAMPING     = 0.7;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function ItemLife() {
	Item.call(this, PARAMS);
	this.grounded = false;
	this.rebound  = 0;
	this.sy = 0;

	// when spawning, item is not grabbable by banana for few frames
	this.isLocked = true;
	this.lockedCounter = 30;
}
inherits(ItemLife, Item);
module.exports = ItemLife;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemLife.prototype.draw = function () {
	// counter
	if (this.isLocked && this.lockedCounter-- <= 0) this.isLocked = false;


	// move
	if (!this.grounded) {
		this.sy += GRAVITY;
		this.sy = Math.min(this.sy, MAX_GRAVITY);
		var y = this.y + this.sy;
		if (level.getTileAt(this.x + 4, y + 8).isTopSolid) {
			y = this.y;
			this.sy *= -DAMPING;
			this.rebound += 1;
			sfx('bounce', Math.min(1, -this.sy));
			if (this.rebound > 3) {
				this.grounded = true;
				y = ~~(this.y / TILE_HEIGHT + 1) * TILE_HEIGHT;
			}
		}
		this.y = y;
	}
	
	// draw item
	Item.prototype.draw.call(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemLife.prototype.collisionBanana = function (banana) {
	if (this.isLocked) return;
	banana.grab(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
ItemLife.prototype.collectItem = function (monkey) {
	Item.prototype.collectItem.call(this, monkey);
	if (monkey.lifePoints < monkey.maxLife) monkey.lifePoints += 1;
	gameView.updateHealthHUD();
};

},{"../level":55,"../view/gameView":62,"./Item":48}],51:[function(require,module,exports){
var gameController = require('../view/gameView');
var level          = require('../level');


var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

var ANIM_SPEED  = 0.2;
var FREEZE_DURATION = 240;

var DIRECTIONS = [
	{ x:  1, y:  0 },
	{ x:  0, y:  1 },
	{ x: -1, y:  0 },
	{ x:  0, y: -1 }
];

var ANIMATION = [
	assets.entity.spark.frame0,
	assets.entity.spark.frame1,
];


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Spark(params) {
	this.x  = 0;
	this.y  = 0;
	this.w  = TILE_WIDTH;
	this.h  = TILE_HEIGHT;
	this.frame = 0;

	this.directionId = 0;
	this.direction   = DIRECTIONS[0];
	this.moveCounter = 0;

	this.freezed = false;
	this.freezeCounter = 0;
}

module.exports = Spark;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype.draw = function () {
	if (this.freezed) {
		if (this.freezeCounter++ >= FREEZE_DURATION) this.freezed = false;
		draw(ANIMATION[~~this.frame], this.x - 1, this.y - 1);
		return;
	}

	// move
	this.x += this.direction.x;
	this.y += this.direction.y;

	this.moveCounter += 1;
	if (this.moveCounter >= TILE_WIDTH) {
		this.moveCounter = 0;
		this._getNextMove();
	}
	
	// draw
	this.frame += ANIM_SPEED;
	if (this.frame >= 2) this.frame = 0;
	draw(ANIMATION[~~this.frame], this.x - 1, this.y - 1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype.collisionBanana = function (banana) {
	this.freezed = true;
	this.freezeCounter = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getTile(level, i, j, direction) {
	return level.getTile(i + direction.x, j + direction.y);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Spark.prototype._getNextMove = function () {

	// choose the next direction
	var i = ~~(this.x / TILE_WIDTH);
	var j = ~~(this.y / TILE_HEIGHT);

	var direction = this.direction;
	var anchorId  = (this.directionId + 1) % 4;
	var anchor    = DIRECTIONS[anchorId];

	if (getTile(level, i, j, anchor).isEmpty) {
		// turn to anchor direction
		this.directionId = anchorId;
		this.direction   = anchor;
		return;
	}

	while (getTile(level, i, j, this.direction).isSolid) {
		// turn in inverse direction
		this.directionId = this.directionId - 1;
		if (this.directionId < 0) this.directionId = 3;
		this.direction = DIRECTIONS[this.directionId];
		// TODO avoid infinite loop if geometry can change
	}
};


},{"../level":55,"../view/gameView":62}],52:[function(require,module,exports){
var gameController = require('../view/gameView');
var ShortAnimation = require('../ShortAnimation');
var animations     = require('../animations');
var level          = require('../level');
var ItemLife       = require('./ItemLife');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];
var SPEED = 0.1;

var ANIMATION = [
	assets.entity.worm.walk0,
	assets.entity.worm.walk1,
	assets.entity.worm.walk2,
	assets.entity.worm.walk3,
	assets.entity.worm.walk2,
	assets.entity.worm.walk1
];

var ANIMATION_LENGTH = ANIMATION.length;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Worm(params) {
	this.x  = 0;
	this.y  = 0;
	this.w  = 8;
	this.h  = 8
	this.sx = SPEED;
	this.sy = 0;
	this.frame = random(ANIMATION_LENGTH);
}

module.exports = Worm;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.draw = function () {
	var x = this.x;
	var y = this.y;

	// move
	x += this.sx;
	if (this.sx > 0 && level.getTileAt(x + this.w, this.y         ).isSolid
	 || this.sx > 0 && level.getTileAt(x + this.w, this.y + this.h).isEmpty
	 || this.sx < 0 && level.getTileAt(x + 4     , this.y         ).isSolid
	 || this.sx < 0 && level.getTileAt(x + 4     , this.y + this.h).isEmpty) {
		x = this.x;
		this.sx *= -1;
	}

	// fetch position
	this.x = x;
	this.y = y;
	
	// draw
	this.frame += SPEED;
	if (this.frame >= ANIMATION_LENGTH) this.frame = 0;
	draw(ANIMATION[~~this.frame], this.x - 3, this.y);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionBanana = function (banana) {
	sfx('explosion');

	gameController.removeEntity(this);

	var explosion = new ShortAnimation(animations.explosion, 0.5);
	explosion.setPosition(this.x - 8, this.y - 8);
	gameController.addEntity(explosion, false);

	// a small chance to drop something
	if (Math.random() < 0.1) {
		var item = new ItemLife();
		item.sy = -2;
		item.x = ~~this.x;
		item.y = ~~this.y;
		gameController.addEntity(item, true);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Worm.prototype.collisionMonkey = function (monkey) {
	monkey.hit(this);
};


},{"../ShortAnimation":41,"../animations":43,"../level":55,"../view/gameView":62,"./ItemLife":50}],53:[function(require,module,exports){
var level       = require('../level');
var gameView    = require('../view/gameView');
var ItemKey     = require('./ItemKey');
var ItemLife    = require('./ItemLife');
var Butterfly   = require('./Butterfly');
var Worm        = require('./Worm');
var Spark       = require('./Spark');
var ChainedBall = require('./ChainedBall');
var Bat         = require('./Bat');

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function createEntity(classRef, param, item, collide) {
	param = param || {};
	param.x = item.x * TILE_WIDTH;
	param.y = item.y * TILE_HEIGHT;

	var entity = new classRef(param);
	entity.x = param.x;
	entity.y = param.y;

	// add entity to the scene
	gameView.addEntity(entity, collide);
	return entity;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.createEntityfromMapItem = function (item) {
	switch (item.sprite) {
		// items
		case 32:
		case 33: return createEntity(ItemKey,     null, item, true);
		case 34: return createEntity(ItemLife,    null, item, true);

		// enemies
		case 48: return createEntity(Butterfly,   null, item, false);
		case 64: return createEntity(Spark,       null, item, true);
		case 65: return createEntity(Worm,        null, item, true);
		case 66:
		case 67: return createEntity(ChainedBall, null, item, true);
		case 68: return createEntity(Bat,         null, item, true);

		default: return null;
	}
};

},{"../level":55,"../view/gameView":62,"./Bat":45,"./Butterfly":46,"./ChainedBall":47,"./ItemKey":49,"./ItemLife":50,"./Spark":51,"./Worm":52}],54:[function(require,module,exports){
var MAPPING_BUTTONS = [
	'A', 'B', 'X', 'Y',           // buttons
	'lb', 'rb', 'lt','rt',        // bumpers and triggers
	'back', 'start',              // menu
	'lp', 'rp',                   // axis push
	'up', 'down', 'left', 'right' // dpad
];

var GAMEPAD_AVAILABLE = !!(navigator && navigator.getGamepads);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Gamepad() {
	this.available = false;

	// buttons
	this.btn  = {};
	this.btnp = {};
	this.btnr = {};

	// axes
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.w = 0;

	// trigger analog value
	this.lt = 0;
	this.rt = 0;

	this._setupButtons();
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Gamepad.prototype._setupButtons = function () {
	for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
		var key = MAPPING_BUTTONS[i];
		this.btn[key]  = false;
		this.btnp[key] = false;
		this.btnr[key] = false;
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// function gamepadHandler(event, connecting) {
// 	console.log('Gamepad event', connecting)
// 	var gamepad = event.gamepad;
// 	if (connecting) {
// 		gamepads[gamepad.index] = gamepad;
// 	} else {
// 		delete gamepads[gamepad.index];
// 	}
// }

// window.addEventListener("gamepadconnected",    function (e) { gamepadHandler(e, true);  }, false);
// window.addEventListener("gamepaddisconnected", function (e) { gamepadHandler(e, false); }, false);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var GAMEPADS = [
	new Gamepad(),
	new Gamepad(),
	new Gamepad(),
	new Gamepad()
];

var ANY_GAMEPADS = new Gamepad();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getAllGamepads() {
	var gamepads = navigator.getGamepads();

	for (var gamepadIndex = 0; gamepadIndex < 4; gamepadIndex++) {
		var gamepad = gamepads[gamepadIndex];
		var GAMEPAD = GAMEPADS[gamepadIndex];
		if (!gamepad) {
			GAMEPAD.available = false;
			continue;
		}

		GAMEPAD.available = true;

		// buttons
		for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
			var key = MAPPING_BUTTONS[i];
			var button = gamepad.buttons[i].pressed;
			GAMEPAD.btnp[key] = !GAMEPAD.btn[key] &&  button;
			GAMEPAD.btnr[key] =  GAMEPAD.btn[key] && !button;
			GAMEPAD.btn[key]  =  button;
		}

		// axes
		GAMEPAD.x = gamepad.axes[0];
		GAMEPAD.y = gamepad.axes[1];
		GAMEPAD.z = gamepad.axes[2];
		GAMEPAD.w = gamepad.axes[3];

		// triggers
		GAMEPAD.lt = gamepad.buttons[6].value;
		GAMEPAD.rt = gamepad.buttons[7].value;
	}

	return GAMEPADS;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function getGamepadsFallback() {
	return GAMEPADS;
}

exports.getAllGamepads = GAMEPAD_AVAILABLE ? getAllGamepads : getGamepadsFallback;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.getAnyGamepad = function () {
	exports.getAllGamepads();
	
	// buttons
	for (var i = 0; i < MAPPING_BUTTONS.length; i++) {
		var key = MAPPING_BUTTONS[i];
		ANY_GAMEPADS.btnp[key] = btnp[key] || GAMEPADS[0].btnp[key] || GAMEPADS[1].btnp[key] || GAMEPADS[2].btnp[key] || GAMEPADS[3].btnp[key];
		ANY_GAMEPADS.btnr[key] = btnr[key] || GAMEPADS[0].btnr[key] || GAMEPADS[1].btnr[key] || GAMEPADS[2].btnr[key] || GAMEPADS[3].btnr[key];
		ANY_GAMEPADS.btn[key]  = btn[key]  || GAMEPADS[0].btn[key]  || GAMEPADS[1].btn[key]  || GAMEPADS[2].btn[key]  || GAMEPADS[3].btn[key];
	}

	// TODO: axes and triggers

	return ANY_GAMEPADS;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var inputMode = 0;

exports.setInpuMode = function (num) {
	inputMode = num;
};

exports.getGamepad = function () {
	// TODO optimize this (only  get the relevant gamepad)
	if (inputMode === -1) return window;
	return getAllGamepads()[inputMode];
};


},{}],55:[function(require,module,exports){
var Map      = require('Map');
var Texture  = require('Texture');
var tiles    = require('./tiles');
var entities = require('./entity/entities')

var TILE_WIDTH  = settings.spriteSize[0];
var TILE_HEIGHT = settings.spriteSize[1];


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var t = exports;

t.width  = 20;
t.height = 18;

t.background = null;
t.layer      = new Texture(t.width * TILE_WIDTH, t.height * TILE_HEIGHT);
t.geometry   = new Map(t.width, t.height);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.load = function (levelId) {
	// var id = levelDef.id;
	var path = levelId + '/';

	// geometry
	t.geometry = getMap(path + 'G');
	if (!t.geometry) console.error('Could not find map', path + 'G');

	// resize
	t.width  = t.geometry.width;
	t.height = t.geometry.height;
	var w = t.width  * TILE_WIDTH;
	var h = t.height * TILE_HEIGHT;

	// background
	t.background = getMap(path + 'B');

	// design
	t.layer.resize(w, h);
	t.layer.clear();

	var l = 0;
	var layer = getMap(path + 'L' + l);
	while (layer) {
		t.layer.draw(layer);
		layer = getMap(path + 'L' + (++l));
	}

	// add entities
	for (var x = 0; x < t.width;  x++) {
	for (var y = 0; y < t.height; y++) {
		// TODO
		var item = t.geometry.get(x, y);
		if (!item) continue;
		entities.createEntityfromMapItem(item);
	}}

	return t;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.drawBackground = function () {
	if (t.background) draw(t.background, 0, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.draw = function () {
	draw(t.layer, 0, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.getTileAt = function (x, y) {
	x = ~~(x / TILE_WIDTH);
	y = ~~(y / TILE_HEIGHT);
	// clamp position in level bondaries
	if (x < 0) x = 0; else if (x >= t.width)  x = t.width  - 1;
	if (y < 0) y = 0; else if (y >= t.height) y = t.height - 1;
	// if (x < 0 || y < 0 || x >= t.width || y >= t.height) return EMPTY;
	return tiles.getTileFromMapItem(t.geometry.get(x, y));
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.getTile = function (i, j) {
	// clamp position in level bondaries
	if (i < 0) i = 0; else if (i >= t.width)  i = t.width  - 1;
	if (j < 0) j = 0; else if (j >= t.height) j = t.height - 1;
	return tiles.getTileFromMapItem(t.geometry.get(i, j));
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.getEntryPoints = function () {
	var entries   = t.geometry.find(255);
	var exits     = t.geometry.find(16);
	var normalKey = t.geometry.find(32);
	var glassKey  = t.geometry.find(33);
	
	var needKey = !!(normalKey.length || glassKey.length);
	
	if (entries.length !== 1 || exits.length !== 1) {
		console.log('Level entry points miss configured');
	}

	return { entry: entries[0], exit: exits[0], needKey: needKey };
};

},{"./entity/entities":53,"./tiles":58,"Map":2,"Texture":26}],56:[function(require,module,exports){
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// setting audiomanager
audioManager.settings.defaultFade = 0.01;
audioManager.addChannel('banana'); // channel for the flying banana looped sound

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var viewManager = require('./viewManager');
// require('./debug');

viewManager.addView('splash',         require('./view/splashView'));
viewManager.addView('title',          require('./view/titleView'));
viewManager.addView('game',           require('./view/gameView'));
viewManager.addView('intermission',   require('./view/intermissionView'));
viewManager.addView('credit',         require('./view/creditView'));
viewManager.addView('gameover',       require('./view/gameoverView'));
viewManager.addView('ending',         require('./view/endingView'));
viewManager.addView('speedrunResult', require('./view/speedrunResultView'));

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
viewManager.open('splash');

require('./audioPreloading');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Update is called once per frame
exports.update = viewManager.update;

},{"./audioPreloading":44,"./view/creditView":60,"./view/endingView":61,"./view/gameView":62,"./view/gameoverView":63,"./view/intermissionView":64,"./view/speedrunResultView":65,"./view/splashView":66,"./view/titleView":67,"./viewManager":59}],57:[function(require,module,exports){
var TextBox = require('./TextBox');

var SECOND = 60; // 60 FPS
var MINUTE = SECOND * 60;
var HOUR   = MINUTE * 60;

var LEVELS = assets.levels;
var TOTAL_LEVEL = { index: -1, level: null, chapter: null };

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function initLevelData() {
	var chapter = { chapter: 0, title: "" };
	var stage = 1;
	for (var i = 0; i < assets.levels.length; i++) {
		var level = assets.levels[i];
		if (level.intermission) {
			chapter = assets.levels[i];
		} else {
			level.chapter = chapter;
			level.stage   = stage++;
		}
	}
}

initLevelData();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Speedrun(level) {
	this.data  = level;
	this.frame = 0;
	this.death = 0;
}

Speedrun.prototype.getTime = function () {
	var time = this.frame;

	// var hours   = ~~(time / HOUR);   time -= hours   * HOUR;
	var minutes = ~~(time / MINUTE); time -= minutes * MINUTE;
	var seconds = ~~(time / SECOND); time -= seconds * SECOND;
	var milli = ~~(100 * time / SECOND);

	var text = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + '.' + ('0' + milli).slice(-2);
	return text;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var speedruns;
var total;
var currentSpeedrun;
var timeDisplay = new TextBox(8 * 8, 8, assets.font.tetris).setColor(0);
timeDisplay.paper = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports.reset = function () {
	total = new Speedrun(TOTAL_LEVEL);
	speedruns = [];
	for (var i = 0; i < LEVELS.length; i++) {
		speedruns.push(new Speedrun(LEVELS[i]));
	}
	currentSpeedrun = speedruns[0];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports.setLevel = function (index) {
	currentSpeedrun = speedruns[index];
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports.update = function () {
	total.frame += 1;
	currentSpeedrun.frame += 1;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports.death = function () {
	total.death += 1;
	currentSpeedrun.death += 1;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports.draw = function () {
	timeDisplay.cls();
	timeDisplay.addText(total.getTime(), 0, 0);
	draw(timeDisplay.texture, 96, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
module.exports.getResult = function () {
	return { levels: speedruns, total: total };
};
},{"./TextBox":42}],58:[function(require,module,exports){
var EMPTY   = exports.EMPTY   = { isEmpty: true,  isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: false };
var SOLID   = exports.SOLID   = { isEmpty: false, isSolid: true,  isTopSolid: true,  fruitSolid: true,  isTeleportable: false, kill: false, interactive: false };
var ONE_WAY = exports.ONE_WAY = { isEmpty: false, isSolid: false, isTopSolid: true,  fruitSolid: false, isTeleportable: true,  kill: false, interactive: false };
var KILL    = exports.KILL    = { isEmpty: true,  isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: false, kill: true,  interactive: false };
var GLASS   = exports.GLASS   = { isEmpty: false, isSolid: true,  isTopSolid: true,  fruitSolid: false, isTeleportable: false, kill: false, interactive: false };

var DOOR1   = exports.DOOR1   = { isEmpty: false, isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: true, door: 1 };
var DOOR2   = exports.DOOR2   = { isEmpty: false, isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: true, door: 2 };
var DOOR3   = exports.DOOR3   = { isEmpty: false, isSolid: false, isTopSolid: false, fruitSolid: false, isTeleportable: true,  kill: false, interactive: true, door: 3 };

var tileBySprite = {
	'0': SOLID,
	'1': ONE_WAY,
	'6': KILL,
	'7': GLASS,
	'16': DOOR1,
	'33': GLASS, // Key item in glass
	'67': SOLID, // Chained ball in Solid tile
};

exports.getTileFromMapItem = function (mapItem) {
	if (!mapItem) return EMPTY;
	return tileBySprite[mapItem.sprite] || EMPTY;
};


},{}],59:[function(require,module,exports){
var views = {};

exports.view = null;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.addView = function (id, view) {
	views[id] = view;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (id, params) {
	var view = views[id];
	if (!view) return console.error('view does not exist', id);
	exports.view = view;
	view.open && view.open(params);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	exports.view.update();
};
},{}],60:[function(require,module,exports){
var getAnyGamepad = require('../gamepad').getAnyGamepad;
var viewManager   = require('../viewManager');
var TextBox       = require('../TextBox');

var SCREEN_HEIGHT = settings.screen.height;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var textbox = new TextBox(160, 144, assets.font.tetris).setColor(3);
var y = 0;
textbox.setColor(1).addText("      HI THERE.", 0, 8 * y++);
y++;
textbox.setColor(1).addText(" THIS IS OUR ENTRY", 0, 8 * y++);
textbox.setColor(1).addText("FOR THE GAMEBOYJAM#5", 0, 8 * y++);
textbox.setColor(1).addText("HELD BETWEEN OCT 1ST", 0, 8 * y++);
textbox.setColor(1).addText(" AND OCT 10TH 2016 ", 0, 8 * y++);
y++;
textbox.setColor(3).addText("   SARAH O'DONNELL", 0, 8 * y++);
textbox.setColor(2).addText("ENDING ILLUSTRATIONS", 0, 8 * y++);
y++;
textbox.setColor(3).addText("   MARK SPARLING", 0, 8 * y++);
textbox.setColor(2).addText("       MUSIC", 0, 8 * y++);
y++;
textbox.setColor(3).addText("   CEDRIC STOQUER", 0, 8 * y++);
textbox.setColor(2).addText("   PIXELS, CODING", 0, 8 * y++);
// textbox.addText(" USING PIXELBOX AND", 0, 8 * y++);
// textbox.addText("    FAMITRACKER", 0, 8 * y++);
y++;
y++;
textbox.setColor(1).addText(" THANKS FOR PLAYING ", 0, 8 * y++);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function () {
	camera(0, 0);
	paper(3).cls();
	draw(textbox.texture, 0, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	var gamepads = getAnyGamepad();
	// action
	if (gamepads.btnp.A    ) viewManager.open('title');
	if (gamepads.btnp.B    ) viewManager.open('title');
	if (gamepads.btnp.start) viewManager.open('title');
};

},{"../TextBox":42,"../gamepad":54,"../viewManager":59}],61:[function(require,module,exports){
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

},{"../TextBox":42,"../viewManager":59}],62:[function(require,module,exports){
var Texture       = require('Texture');
var viewManager   = require('../viewManager');
var getAnyGamepad = require('../gamepad').getAnyGamepad;
var Monkey        = require('../Monkey');
var level         = require('../level');
var TextBox       = require('../TextBox');
var speedrun      = require('../speedrun');


var SCREEN_W = settings.screen.width;
var SCREEN_H = settings.screen.height;
var TILE_W   = settings.spriteSize[0];
var TILE_H   = settings.spriteSize[0];
var CENTER_X = ~~(SCREEN_W / 2) - 4;
var CENTER_Y = ~~(SCREEN_H / 2) - 4;

var CAMERA_ACCELERATION       = 0.1;
var CAMERA_SHAKE_ACCELERATION = 0.35;
var CAMERA_SHAKE_FRICTION     = 0.85;


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// monkey
var monkey = exports.monkey = new Monkey();

// camera
var backgroundColor = 0;
var parallax       = 1;
var camX           = 0;
var camY           = 0;
var camShakeX      = 0;
var camShakeY      = 0;
var camShakeSpeedX = 0;
var camShakeSpeedY = 0;


// level
var CURRENT_LEVEL = 0;
var MAX_LEVEL_W   = 0;
var MAX_LEVEL_H   = 0;
var needKey = false;

// entities
var entitiesDraw    = [];
var entitiesCollide = [];

// HUD
var isDisplayingMessage = false;
var displayMessageCounter = 0;
var messageBanner = new TextBox(160, 8, assets.font.tetris).setColor(3);
messageBanner.paper = 3;

var healthHUD = new Texture(160, 8);

var speedrunEnabled = false;
speedrun.reset();

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function resetCamera() {
	camShakeX      = 0;
	camShakeY      = 0;
	camShakeSpeedX = 0;
	camShakeSpeedY = 0;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.shakeCamera = function (force) {
	camShakeSpeedX = force;
	camShakeSpeedY = force * 2 * (Math.random() - 0.5);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function drawDoor(entryPoint, direction, type) {
	level.layer.draw(
		assets.entity.doors[direction + type],
		entryPoint[direction].x * TILE_W - 8,
		entryPoint[direction].y * TILE_H - 8
	);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function loadLevel() {
	resetCamera();

	// reset level
	entitiesDraw    = [];
	entitiesCollide = [];

	// get data
	var levelData = assets.levels[CURRENT_LEVEL];

	// we reach the end
	if (!levelData) {
		CURRENT_LEVEL = 0;
		viewManager.open('ending', { speedrun: speedrunEnabled });
		return;
	}

	// music
	var musicId = levelData.music;
	if (musicId === null) {
		// stop music
		audioManager.stopLoopSound('sfx');
	} else if (musicId) {
		var loopData = assets.music[musicId];
		audioManager.playLoopSound('sfx', musicId, 1, 0, 0, loopData.start, loopData.end);
	}

	// intermission
	if (levelData.intermission) {
		CURRENT_LEVEL += 1;
		viewManager.open('intermission', levelData);
		return;
	}

	// speedrun
	speedrun.setLevel(CURRENT_LEVEL);

	// load level
	level.load(levelData.id);
	backgroundColor = levelData.paper;
	parallax        = levelData.parallax;
	var entryPoint  = level.getEntryPoints();

	// add doors
	var doorType = levelData.doorType || 1;
	drawDoor(entryPoint, 'entry', doorType);
	drawDoor(entryPoint, 'exit',  doorType);
	needKey = entryPoint.needKey;

	// level boundaries
	MAX_LEVEL_W = level.width  * TILE_W - SCREEN_W;
	MAX_LEVEL_H = level.height * TILE_H - SCREEN_H;

	// set monkey position
	monkey.x = entryPoint.entry.x * TILE_W;
	monkey.y = entryPoint.entry.y * TILE_H;

	// init camera on monkey
	camX = clip(monkey.x - CENTER_X, 0, MAX_LEVEL_W);
	camY = clip(monkey.y - CENTER_Y, 0, MAX_LEVEL_H);

	exports.updateHealthHUD();
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function(params) {
	params = params || {};
	if (params.speedrun !== undefined) speedrunEnabled = params.speedrun;
	if (params.level    !== undefined) CURRENT_LEVEL = params.level;
	loadLevel();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.respawn = function () {
	// TODO animation
	monkey.reset();
	loadLevel();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.gotoNextLevel = function () {
	if (needKey && !monkey.hasKey) {
		exports.displayMessage(' THE DOOR IS LOCKED');
		// play sound
		sfx('wrong');
		return;
	}
	// TODO animation
	monkey.reset();
	CURRENT_LEVEL += 1;
	loadLevel();
};
	
//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// Update is called once per frame
exports.update = function () {
	paper(backgroundColor).cls();

	// controls
	var gamepad = getAnyGamepad();
	monkey.update(gamepad);

	// update camera position
	var scrollX = clip(monkey.x - CENTER_X, 0, MAX_LEVEL_W);
	var scrollY = clip(monkey.y - CENTER_Y, 0, MAX_LEVEL_H);

	var diffX = scrollX - camX;
	if (diffX > -1 && diffX < 1) camX = scrollX;
	else camX += diffX * CAMERA_ACCELERATION;
	camY += (scrollY - camY) * CAMERA_ACCELERATION;

	// camera shaking
	
	camShakeSpeedX -= camShakeX * CAMERA_SHAKE_ACCELERATION;
	camShakeSpeedY -= camShakeY * CAMERA_SHAKE_ACCELERATION;
	camShakeSpeedX *= CAMERA_SHAKE_FRICTION;
	camShakeSpeedY *= CAMERA_SHAKE_FRICTION;
	camShakeX += camShakeSpeedX;
	camShakeY += camShakeSpeedY;


	var cx = camX + camShakeX;
	var cy = camY + camShakeY;
	// background with parallax effect
	camera(cx * parallax, cy * parallax);
	level.drawBackground();

	// main level
	camera(cx, cy);
	level.draw();
	monkey.draw();

	// entities draw
	for (var i = 0; i < entitiesDraw.length; i++) {
		entitiesDraw[i].draw();
	}

	// entities collisions
	for (var i = 0; i < entitiesCollide.length; i++) {
		monkey.checkCollisionWithEntity(entitiesCollide[i]);
	}

	// HUD
	camera(0, 0);

	if (speedrunEnabled) {
		speedrun.update();
		speedrun.draw();
	}

	if (isDisplayingMessage) {
		draw(messageBanner.texture, 0, 136);
		if (--displayMessageCounter <= 0) isDisplayingMessage = false;
	} else {
		draw(healthHUD, 0, 136);
	}
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.addEntity = function (entity, doCollide) {
	entitiesDraw.push(entity);
	if (doCollide) entitiesCollide.push(entity);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.removeEntityFromCollisions = function (entity) {
	// remove from collide
	index = entitiesCollide.indexOf(entity);
	if (index !== -1) entitiesCollide.splice(index, 1);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.removeEntity = function (entity) {
	// remove from draw
	var index = entitiesDraw.indexOf(entity);
	if (index !== -1) entitiesDraw.splice(index, 1);

	// remove from collisions
	exports.removeEntityFromCollisions(entity);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.displayMessage = function (message) {
	isDisplayingMessage   = true;
	displayMessageCounter = 80;
	messageBanner.cls();
	messageBanner.addText(message, 0, 0);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.updateHealthHUD = function () {
	healthHUD.clear();
	for (var i = 0; i < monkey.maxLife; i++) {
		s = i < monkey.lifePoints ? assets.hud.healthFull : assets.hud.healthEmpty;
		healthHUD.draw(s, 1 + i * 5, 0);
	}
};

},{"../Monkey":39,"../TextBox":42,"../gamepad":54,"../level":55,"../speedrun":57,"../viewManager":59,"Texture":26}],63:[function(require,module,exports){
var getAnyGamepad = require('../gamepad').getAnyGamepad;
var viewManager   = require('../viewManager');
var TextBox       = require('../TextBox');
var gameView      = require('./gameView');

var TILE_HEIGHT = settings.spriteSize[1];
var FONDU = getMap('fondu');

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var gameoverText = new TextBox(160, 8, assets.font.tetris).setColor(0);
var continueText = new TextBox(160, 8, assets.font.tetris).setColor(0);
gameoverText.addText('     GAME OVER', 0, 0);
continueText.addText('      RETRY ?', 0, 0);

var timer = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	params = params || {};
	timer = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	camera(0, 0);
	timer += 1;
	if (timer <= 40) {
		draw(FONDU, 0, (timer - FONDU.height) * TILE_HEIGHT);
		draw(FONDU, 0, (18 - timer) * TILE_HEIGHT, false, true);
		return;
	}

	// paper(0).cls();
	draw(gameoverText.texture, 0, 56);
	draw(continueText.texture, 0, 72);

	var gamepads = getAnyGamepad();
	if (gamepads.btnp.A || gamepads.btnp.B || gamepads.btnp.start) {
		// continue
		gameView.respawn();
		viewManager.open('game');
	}
};

},{"../TextBox":42,"../gamepad":54,"../viewManager":59,"./gameView":62}],64:[function(require,module,exports){
var getAnyGamepad = require('../gamepad').getAnyGamepad;
var viewManager   = require('../viewManager');
var TextBox       = require('../TextBox');


//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var textbox = new TextBox(160, 24, assets.font.tetris).setColor(3);
var timer = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	params = params || {};

	textbox.clear();
	// TODO center text ?
	textbox.addText('CHAPTER ' + params.chapter, 8, 0);
	textbox.addText(params.title, 8, 16);

	camera(0, 0);
	paper(3).cls();
	draw(textbox.texture, 0, 64);

	timer = 0;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	// lock screen for few frames
	if (++timer < 10) {
		camera(0, 0);
		paper(3).cls();
		draw(textbox.texture, 0, 64);
		return;
	};

	var gamepads = getAnyGamepad();
	// action
	if (timer >= 150
	 || gamepads.btnp.A
	 || gamepads.btnp.B
	 || gamepads.btnp.start) viewManager.open('game');
};

},{"../TextBox":42,"../gamepad":54,"../viewManager":59}],65:[function(require,module,exports){
var TextBox  = require('../TextBox');
var speedrun = require('../speedrun');
var gamepad  = require('../gamepad');

var DEATH = chr$(64);
var MAX_LINE = 11;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var textbox = new TextBox(160, 144, assets.font.tetris).setColor(3);
textbox.paper = 3;

var result;
var resultOffset = 0;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function displayResult(offset) {
	textbox.cls();
	textbox.addText('RESULT', 56, 0);

	textbox.addText('STAGE   TIME    TRY', 0, 16);

	var i = offset;
	var line = 0;
	var levels = result.levels;

	while (line < MAX_LINE && i < levels.length) {
		var level = levels[i];
		i += 1;
		line += 1;

		if (level.data.intermission) {
			textbox.addText(level.data.title, 0, 8 * line + 24);
			continue;
		}
		textbox.addText((' ' + level.data.stage).slice(-2) + '   ' + level.getTime() + '  ' + DEATH + '*' + level.death, 8, 8 * line + 24);
	}

	var total = result.total;
	textbox.addText('TOTAL ' + total.getTime() + '  ' + DEATH + '*' + total.death, 0, 136);

	draw(textbox.texture, 0, 0);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function (params) {
	camera(0, 0);
	result = speedrun.getResult();
	displayResult(resultOffset);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function scrollResult() {
	resultOffset += MAX_LINE;
	if (resultOffset >= result.levels.length) resultOffset = 0;
	displayResult(resultOffset);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	var gamepads = gamepad.getAnyGamepad();
	// action
	if (gamepads.btnp.A    ) scrollResult();
	if (gamepads.btnp.B    ) scrollResult();
	if (gamepads.btnp.start) scrollResult();
};

},{"../TextBox":42,"../gamepad":54,"../speedrun":57}],66:[function(require,module,exports){
var viewManager = require('../viewManager');
var LOGO = assets.icon.pixelbox;

var y = 0;

exports.open = function () {
	y = -LOGO.height;
	paper(3);
	audioManager.loadSound('logo');
};

exports.update = function () {
	y += 0.5;
	cls();
	if (y >= 130) return viewManager.open('title');
	if (y >= 125) return;
	if (y == 64) sfx('logo');
	draw(LOGO, 32, Math.min(y, 64));
};
},{"../viewManager":59}],67:[function(require,module,exports){
var viewManager = require('../viewManager');
var TextBox     = require('../TextBox');
var gamepad     = require('../gamepad');

var SCREEN_HEIGHT = settings.screen.height;
var OPTIONS_COUNT = 3;
// var CONTROLS = ['KEYB', 'JOY1', 'JOY2', 'JOY3', 'JOY4'];

// assets
var BACKGROUND = getMap('title/background');
var MONKEY     = assets.icon.monkey;
var WARP       = assets.icon.warp;
var CURSOR     = assets.hud.cursor;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var backY  = 0;
var option = 0;
// var controlChoice = 1;
var speedrunEnabled = false;

// text boxes
var textbox = new TextBox(128, 32, assets.font.tetris).setColor(3);
var footer  = new TextBox(128, 8,  assets.font.tetris).setColor(3);
footer.addText('  GBJAM#5 2016', 0, 0);

function updateText() {
	// if (controlChoice >= CONTROLS.length) controlChoice = 0;
	// if (controlChoice < 0) controlChoice = CONTROLS.length - 1;
	// gamepad.setInpuMode(controlChoice - 1);
	var y = 0;
	textbox.clear();
	textbox.addText('START GAME',                                    0, 8 * y++);
	textbox.addText('SPEEDRUN:' + (speedrunEnabled ? 'ON' : 'OFF'), 0, 8 * y++);
	textbox.addText('CREDITS',                                       0, 8 * y++);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var monkeyAnchor = { x: 0, y: 0, sx: 0, sy: 0, ax: 16, ay: 20 };
var warpAnchor   = { x: 0, y: 0, sx: 0, sy: 0, ax: 36, ay: 40 };

var ACCELERATION = 0.01;
var FRICTION     = 0.95;

function bounce(obj) {
	// if (Math.random() > 0.95) {
	// 	obj.sx += (Math.random() - 0.5) * 0.7;
	// 	obj.sy += (Math.random() - 0.5) * 0.7;
	// }

	obj.sx += (obj.ax - obj.x) * ACCELERATION;
	obj.sy += (obj.ay - obj.y) * ACCELERATION;
	obj.sx *= FRICTION;
	obj.sy *= FRICTION;
	obj.x += obj.sx;
	obj.y += obj.sy;
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.open = function () {
	monkeyAnchor = { x: -150, y:  10, sx: 0, sy: -2, ax: 16, ay: 20 };
	warpAnchor   = { x:  190, y: -20, sx: 0, sy:  2, ax: 36, ay: 40 };

	camera(0, 0);
	paper(2);
	updateText();

	var loopData = assets.music.title;
	audioManager.playLoopSound('sfx', 'title', 1, 0, 0, loopData.start, loopData.end);
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
// function getBtn(gamepads, key) {
// 	if (gamepads[0].btnp[key]
// 	 || gamepads[1].btnp[key]
// 	 || gamepads[2].btnp[key]
// 	 || gamepads[3].btnp[key]
// 	 || btnp[key]) return true;
// 	return false;
// }

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function action() {
	switch (option) {
		case 0: viewManager.open('game', { levelId: 0, speedrun: speedrunEnabled }); break;
		// case 1: viewManager.open('game', { levelId: 0, speedrun: true  }); break;
		// case 1: controlChoice++; updateText(); break;
		case 1: speedrunEnabled = !speedrunEnabled; updateText(); break;
		case 2: viewManager.open('credit'); break;
	}
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
exports.update = function () {
	cls();

	// background scroll
	if (++backY > SCREEN_HEIGHT) backY = 0;
	draw(BACKGROUND, 0, backY);
	draw(BACKGROUND, 0, backY - SCREEN_HEIGHT);

	// title
	bounce(monkeyAnchor);
	bounce(warpAnchor);

	draw(MONKEY, monkeyAnchor.x, monkeyAnchor.y);
	draw(WARP,   warpAnchor.x,   warpAnchor.y);

	// menu
	draw(textbox.texture, 40, 96);
	draw(CURSOR, 32, option * 8 + 96);

	// footer
	draw(footer.texture, 16, 136);

	// inputs
	var gamepads = gamepad.getAnyGamepad();
	if (gamepads.btnp.down ) { option += 1; if (option >= OPTIONS_COUNT) option = 0; }
	if (gamepads.btnp.up   ) { option -= 1; if (option < 0) option = OPTIONS_COUNT - 1; }

	// action
	if (gamepads.btnp.A    ) action();
	if (gamepads.btnp.B    ) action();
	if (gamepads.btnp.start) action();

	if (option === 1 && gamepads.btnp.right) { speedrunEnabled = !speedrunEnabled; updateText(); }
	if (option === 1 && gamepads.btnp.left ) { speedrunEnabled = !speedrunEnabled; updateText(); }
};
},{"../TextBox":42,"../gamepad":54,"../viewManager":59}],68:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],69:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],70:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],71:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":70,"_process":69,"inherits":68}]},{},[35]);
