var EPS = Math.pow(10, -6);
var DEBUG = false;
var BOUNCE_WALLS = true;
var NODE_MASS = 500;
var ELASTICITY_K = 4;
var FIELD_FRICTION_K = 0.9;
var PULSE_RED = true;
var SPACING = 20;

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


function node_cls(position, velocity, size) {
    this.position = position || new vector_cls();
    this.velocity = velocity || new vector_cls();
    this.accelerations = [];
    this.links = [];
    this.size = size || 5;
    this.color = "#000000";
    this.id = 0;
};

node_cls.prototype.tick = function(bounds, node_map, link_map) {
    if (node_map[this.id] == 1) {
        return;
    }

    for(var c = this.accelerations.length - 1; c >= 0; --c) {
        this.velocity.add(this.accelerations[c]);
    }
    this.accelerations = [];
    this.velocity.scale(FIELD_FRICTION_K);

    if(BOUNCE_WALLS) {
        if(this.position.x + this.velocity.x >= bounds.right || this.position.x + this.velocity.x <= bounds.left) {
            this.velocity.x *= -1;
        }
        if(this.position.y + this.velocity.y >= bounds.bottom || this.position.y + this.velocity.y <= bounds.top) {
            this.velocity.y *= -1;
        }
    }
    this.position.add(this.velocity);
    node_map[this.id] = 1;
    for(var c = this.links.length - 1; c >= 0; --c) {
        this.links[c].tick(bounds, node_map, link_map);
    }
};

node_cls.prototype.poke = function(acc_vector) {
    this.accelerations.push(acc_vector);
};

node_cls.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.setFillStyle = this.color;
    ctx.fillRect(
        this.position.x - this.size/2,
        this.position.y - this.size/2,
        this.size, 
        this.size
    );
    ctx.stroke();
};



function link_cls(left, right) {
    this.left = left || null;
    this.right = right || null;
    this.length = distance(left.position, right.position);
    this.length_sq = this.length * this.length;
    this.color = "#000000";
    this.id = 0;
};

link_cls.prototype.tick = function(bounds, node_map, link_map) {
    if (link_map[this.id] == 1) {
        return;
    }

    link_map[this.id] = 1;
    var dir = this.right.position.dir_to(this.left.position);
    var magn = dir.length_sq() - this.length_sq;
    
    if (magn >= EPS) {
        dir.normalize();
        var acc = (Math.sqrt(magn) * ELASTICITY_K) / NODE_MASS;
        dir.scale(acc);
        var dir_l = dir.negative();

        this.right.poke(dir.scale(this.right.links.length));
        this.left.poke(dir_l.scale(this.left.links.length));        
    }


    this.left.tick(bounds, node_map, link_map);
    this.right.tick(bounds, node_map, link_map);
};


link_cls.prototype.draw = function(ctx) {
    ctx.beginPath();

    if (PULSE_RED) {
        if (distance_sq(this.left.position, this.right.position) > this.length_sq * 1.025) {
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 1;
        } else {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 0.3;
        }
    } else {
        var red = (distance_sq(this.left.position, this.right.position) - this.length_sq) / this.length_sq;
        red = red < 0 ? 0 : red;
        red = red * (255/5);
        red = Math.round(red > 255 ? 255 : red);
        ctx.lineWidth = (red * 2) / 255 + 0.3;

        red = red.toString(16);
        if( red.length < 2 ) {
            red = "0" + red;
        }
        ctx.strokeStyle = "#" + red + "0000";
        
    }

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

    for(var c = 0; c < this.total; ++c) {
        for(var r = 0; r < this.total; ++r) {
            this.nodes.push(new node_cls(new vector_cls(c * SPACING + 100, r * SPACING + 100)));
            this.nodes[this.nodes.length - 1].id = this.nodes.length - 1;
        }
    }
    this.relink();
}

field_cls.prototype.relink = function() {
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        this.nodes[c].links = [];
    }
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        for(var r = this.nodes.length - 1; r >= 0; --r) {
            if (r == c) {
                continue;
            }

            if (distance_sq(this.nodes[c].position, this.nodes[r].position) < SPACING * SPACING + EPS) {
                this.links.push(new link_cls(this.nodes[c], this.nodes[r]));
                this.links[this.links.length - 1].id = this.links.length - 1;
                this.nodes[c].links.push(this.links[this.links.length-1]);
                this.nodes[r].links.push(this.links[this.links.length-1]);
            }
        }
    }
};

field_cls.prototype.tick = function(bounds) {
    var node_map = new Int8Array(this.nodes.length),
        link_map = new Int8Array(this.links.length);

    this.nodes[0].tick(bounds, node_map, link_map);
};

field_cls.prototype.draw = function(ctx) {
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        this.nodes[c].draw(ctx);
    }
    for(var c = this.links.length - 1; c >= 0; --c) {
        this.links[c].draw(ctx);
    }
};

field_cls.prototype.clear = function() {
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        this.nodes[c].links = [];
    }
    this.nodes = [];
    this.links = [];
};

field_cls.prototype.get_nearest = function(pos, range) {
	var best_range = range * range;
	var index = -1;
	for(var c = this.nodes.length - 1; c >= 0; --c) {
		var l = distance_sq(pos, this.nodes[c].position);
		if( l < best_range ) {
			best_range = l;
			index = c;
		}
	}
	if( index != -1 ) {
		return this.nodes[index];
	}
	return null;
};


function system_cls(canvas_id) {
    this.field = null;
    this.bounds = null;
    this.canvas = null;
    this.ctx = null;
    this.mouse = null;

    if (canvas_id !== undefined) {
	this.canvas = document.getElementById(canvas_id);

	// 30 - black magic number
	var width = document.body.clientWidth - 30;
	var height = document.body.clientHeight - this.canvas.clientTop - 30;


        this.field = new field_cls(Math.round(Math.sqrt(PARTICLES || 4)));
        this.canvas.width = width || this.canvas.clientWidth;
        this.canvas.height = height || this.canvas.clientHeight;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 0.3;

        this.bounds = new bounds_cls();
	var bbox = this.canvas.getBoundingClientRect();

        this.bounds.top = this.canvas.clientTop;
        this.bounds.right = width || this.canvas.clientWidth;
        this.bounds.bottom = height || this.canvas.clientHeight;
        this.bounds.left = this.canvas.clientLeft;

	this.mouse = new vector_cls();
	var self = this;
	this.canvas.addEventListener('mousemove', function(event) {
		self.mouse.x = event.clientX - bbox.left;
		self.mouse.y = event.clientY - bbox.top;
	});
    };
}

system_cls.prototype.reset = function() {
    this.field.clear();
    this.field = new field_cls(Math.round(Math.sqrt(PARTICLES || 4)));
};

system_cls.prototype.frame = function(only_draw) {
    this.ctx.clearRect(
        this.bounds.left,
        this.bounds.top,
        this.bounds.right,
        this.bounds.bottom);

    if( !only_draw || only_draw == false ) {
        this.field.tick(this.bounds);
    }
    this.field.draw(this.ctx);
    this.ctx.stroke();
};



system_cls.prototype.get_node_at = function(pos) {
	return this.field.get_nearest(pos, SPACING);
};

system_cls.prototype.get_mouse = function() {
	return new vector_cls(this.mouse.x, this.mouse.y);
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
