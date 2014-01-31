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
    var black = true;
    if (distance_sq(this.left.position, this.right.position) > this.length_sq * 1.025) {
        ctx.strokeStyle = "#ff0000";
        black = false;
        ctx.lineWidth = 1;
    } else {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.3;
    }

    if( black == false ) {
        ctx.beginPath();
        ctx.moveTo(this.left.position.x, this.left.position.y);
        ctx.lineTo(this.right.position.x, this.right.position.y);
        ctx.stroke();
    }
};
