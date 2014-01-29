var EPS = Math.pow(10, -6);
var BOUNCE_WALLS = true;
var NODE_MASS = 500;
var ELASTICITY_K = 4;
var FIELD_FRICTION_K = 0.9;
var PULSE_RED = true;
var SPACING = 20;
var NODE_SIZE = 5;

function vector_cls(x, y) {
    this.x = x || 0.0;
    this.y = y || 0.0;
};

vector_cls.prototype.length_sq = function() {
    return this.x * this.x + this.y * this.y;
};

vector_cls.prototype.length = function() {
    return Math.sqrt(this.length_sq());
};

vector_cls.prototype.scale = function(magn) {
    this.x *= magn;
    this.y *= magn;
    return this;
};

vector_cls.prototype.translate = function(x, y) {
    this.x += x;
    this.y += y;
    return this;
};

vector_cls.prototype.add = function(vector) {
    return this.translate(vector.x, vector.y);
};

vector_cls.prototype.dir_to = function(to) {
    var dir = new vector_cls();
    dir.x = to.x - this.x;
    dir.y = to.y - this.y;
    return dir;
};

vector_cls.prototype.negative = function() {
    var neg = new vector_cls();
    neg.x = -this.x;
    neg.y = -this.y;
    return neg;
};

vector_cls.prototype.normalize = function() {
    var l = this.length();
    this.x /= l;
    this.y /= l;
    return this;
};


function bounds_cls(_tl, _br) {
    this.top     = _tl ? _tl.y : 0;
    this.right   = _br ? _br.x : 0;
    this.bottom  = _br ? _br.y : 0;
    this.left    = _tl ? _tl.x : 0;
};

bounds_cls.prototype.is_inside = function(pt) {
    return this.is_inside_x(pt) && this.is_inside_y(pt);
};

bounds_cls.prototype.is_inside_x = function(pt) {
    return pt.x >= this.left && pt.x <= this.right;
};

bounds_cls.prototype.is_inside_y = function(pt) {
    return pt.y >= this.top && pt.y <= this.bottom;
};

function distance_sq(from, to) {
    return from && to ? ( (from.x - to.x)*(from.x - to.x) + (from.y - to.y)*(from.y - to.y) ) : 0;
}

function distance(from, to) {
    return Math.sqrt(distance_sq(from, to));
}

function dot(left, right) {
    return left.x * right.x + left.y * right.y;
}

function random(from, to) {
    return Math.random() * (to - from) + from;
}
