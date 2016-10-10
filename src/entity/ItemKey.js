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
