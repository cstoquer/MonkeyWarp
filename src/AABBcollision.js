
function AABBcollision(a, b) {
	return a.x < b.x + b.w  
		&& a.y < b.y + b.h
		&& b.x < a.x + a.w 
		&& b.y < a.y + a.h;
}

module.exports = AABBcollision;
