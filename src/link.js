function link_cls(left, right) {
    this.left = left || null;
    this.right = right || null;
    this.length = distance(left.position, right.position);
    this.length_sq = this.length * this.length;
    this.color = "#000000";
    this.id = 0;
};

link_cls.prototype.tick = function(bounds) {
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