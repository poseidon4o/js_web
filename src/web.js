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
};

vector_cls.prototype.translate = function(x, y) {
    this.x += x;
    this.y += y;
};

vector_cls.prototype.add = function(vector) {
    this.translate(vector.x, vector.y);
};

vector_cls.prototype.dir_to = function(to) {
    var dir = new vector_cls();
    dir.x = this.x - to.x;
    dir.y = this.y - to.y;
    return dir;
};

vector_cls.prototype.negative = function() {
    var neg = new vector_cls();
    neg.x = -this.x;
    neg.y = -this.y;
    return neg;
};

function distance(from, to) {
    return from && to ? ( (from.x - to.x)*(from.x - to.x) + (from.y - to.y)*(from.y - to.y) ) : 0;
}



function node_cls(position, velocity, size) {
    this.position = position || new vector_cls();
    this.velocity = velocity || new vector_cls();
    this.accelerations = [];
    this.links = [];
    this.size = size || 4;
};

node_cls.prototype.tick = function() {
    for(var c = this.accelerations.length - 1; c >= 0; --c) {
        this.velocity.add(this.accelerations[c]);
    }
    this.accelerations = [];
};

node_cls.prototype.poke = function(acc_vector) {
    for(var c = this.links.length - 1; c >= 0; --c) {
        this.links[c].poke(this, acc_vector);
    }
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
    this.length = distance(left, right);
};

link_cls.prototype.poke = function() {
    throw "--";
};

link_cls.prototype.draw = function() {
    ctx.moveTo(this.left.x, this.left.y);
    ctx.lineTo(this.right.x, this.right.y);
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
            this.nodes.push(new node_cls(new vector_cls(c * 20 + 100, r * 20 + 100)));
        }
    }
}

field_cls.prototype.draw = function(ctx) {
    for(var c = this.nodes.length - 1; c >= 0; --c) {
        this.nodes[c].draw(ctx);
    }
};



function system_cls(canvas_id, width, height) {
    this.field = null;
    this.bounds = null;
    this.canvas = null;
    this.ctx = null;

    if (canvas_id !== undefined) {
        this.field = new field_cls(20);
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

    this.field.draw(this.ctx);
    this.ctx.stroke();
};


