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

field_cls.prototype.tick = function(bounds, skip_list) {
    var node_map = new Int8Array(this.nodes.length),
        link_map = new Int8Array(this.links.length);

    
    for(var c = skip_list.length - 1; c >= 0; --c) {
        node_map[skip_list[c]] = 1;
    }

    var wave_start = 0;
    for(var c = node_map.length - 1; c >= 0; --c) {
        if (node_map[c] == 0) {
            wave_start = c;
            break;
        }
    }
    this.nodes[wave_start].tick(bounds, node_map, link_map);
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

