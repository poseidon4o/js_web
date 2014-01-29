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
        var new_pos = new vector_cls(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
        if (!bounds.is_inside_x(new_pos)) {
            this.velocity.x = -this.velocity.x;
        }
        if (!bounds.is_inside_y(new_pos)) {
            this.velocity.y = - this.velocity.y;
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