var EPS = Math.pow(10, -6);
var DEBUG = false;
var BOUNCE_WALLS = true;

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


function distance_sq(from, to) {
    return from && to ? ( (from.x - to.x)*(from.x - to.x) + (from.y - to.y)*(from.y - to.y) ) : 0;
}

function distance(from, to) {
    return Math.sqrt(distance_sq(from, to));
}

function dot(left, right) {
    return left.x * right.x + left.y * right.y;
}



function node_cls(position, velocity, size) {
    this.position = position || new vector_cls();
    this.velocity = velocity || new vector_cls();
    this.accelerations = [];
    this.links = [];
    this.size = size || 8;

};

node_cls.prototype.tick = function(bounds) {

    for(var c = this.accelerations.length - 1; c >= 0; --c) {
        this.velocity.add(this.accelerations[c]);
    }
    this.accelerations = [];
    if(BOUNCE_WALLS && bounds) {
	if(this.position.x + this.velocity.x >= bounds.right || this.position.x + this.velocity.x <= bounds.left) {
	    this.velocity.x *= -1;
	}
	if(this.position.y + this.velocity.y >= bounds.bottom || this.position.y + this.velocity.y <= bounds.top) {
	    this.velocity.y *= -1;
	}
    }
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
};

node_cls.prototype.poke = function(acc_vector) {
    this.accelerations.push(acc_vector);
};

node_cls.prototype.draw = function(ctx) {
    ctx.fillRect(
        this.position.x - this.size/2,
        this.position.y - this.size/2,
        this.size, 
        this.size
    );
};



function link_cls(left, right) {
    this.left = left || null;
    this.right = right || null;
    this.length = distance(left.position, right.position);
};

link_cls.prototype.tick = function() {
    var dir = this.right.position.dir_to(this.left.position);
    var magn = dir.length() - this.length;
    if( magn < 1.0 ) {
	return;
    }
    dir.normalize();
    dir.scale(Math.sqrt(magn));

    this.right.poke(dir);
    this.left.poke(dir.negative());
};

link_cls.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.left.position.x, this.left.position.y);
    ctx.lineTo(this.right.position.x, this.right.position.y);
    ctx.stroke();
};


function bounds_cls(_tl, _br) {
    this.top     = _tl ? _tl.y : 0;
    this.right   = _br ? _br.x : 0;
    this.bottom  = _br ? _br.y : 0;
    this.left    = _tl ? _tl.x : 0;
};



function field_cls(total) {
    this.nodes = [];
    this.links = [];
    this.total = total || 10;
    this.spacing = 100;

    for(var c = 0; c < this.total; ++c) {
        for(var r = 0; r < this.total; ++r) {
            this.nodes.push(new node_cls(new vector_cls(c * this.spacing + 100, r * this.spacing + 100)));
        }
    }
    this.relink();
}

field_cls.prototype.relink = function() {
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        for(var r = this.nodes.length - 1; r >= 0; --r) {
            if (r == c) {
                continue;
            }

            if (distance_sq(this.nodes[c].position, this.nodes[r].position) < this.spacing * this.spacing + EPS) {
                this.links.push(new link_cls(this.nodes[c], this.nodes[r]));
                this.nodes[c].links.push(this.links[this.links.length-1]);
                this.nodes[r].links.push(this.links[this.links.length-1]);
            }
        }
    }
};

field_cls.prototype.tick = function(bounds) {
    for(var c = this.links.length - 1; c >= 0; --c) {
        this.links[c].tick(bounds);
    }
    for(var c = this.nodes.length - 1; c >= 0; --c) {
	this.nodes[c].tick(bounds);
    }
}

field_cls.prototype.draw = function(ctx) {
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        this.nodes[c].draw(ctx);
    }
    for(var c = this.links.length - 1; c >= 0; --c) {
        this.links[c].draw(ctx);
    }
};



function system_cls(canvas_id, width, height) {
    this.field = null;
    this.bounds = null;
    this.canvas = null;
    this.ctx = null;

    if (canvas_id !== undefined) {
        this.field = new field_cls(Math.round(Math.sqrt(PARTICLES || 4)));
        this.canvas = document.getElementById(canvas_id);
        this.canvas.width = width || this.canvas.clientWidth;
        this.canvas.height = height || this.canvas.clientHeight;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";

        this.bounds = new bounds_cls();
        this.bounds.top = this.canvas.clientTop;
        this.bounds.right = width || this.canvas.clientWidth;
        this.bounds.bottom = height || this.canvas.clientHeight;
        this.bounds.left = this.canvas.clientLeft;    
    };
}

system_cls.prototype.frame = function() {
    this.ctx.clearRect(
        this.bounds.left,
        this.bounds.top,
        this.bounds.right,
        this.bounds.bottom);

    this.field.tick(this.bounds);
    this.field.draw(this.ctx);
    this.ctx.stroke();
};


