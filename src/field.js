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

    this.node_mem_name = fast_memory.allocate(memory_allocator.INT8, this.nodes.length);;
    this.link_mem_name = fast_memory.allocate(memory_allocator.INT8, this.nodes.length);;

    
    
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

var FIELD_SKIP = 1, FIELD_CHECKED = 2, FIELD_FREE = 0;

field_cls.prototype.tick = function(bounds, skip_list) {
    fast_memory.memset(this.node_mem_name, 0);
    fast_memory.memset(this.link_mem_name, 0);
    var node_map = fast_memory.get_memory(this.node_mem_name),
        link_map = fast_memory.get_memory(this.link_mem_name);

    
    for(var c = skip_list.length - 1; c >= 0; --c) {
        node_map[skip_list[c]] = FIELD_SKIP;
        this.nodes[skip_list[c]].accelerations = [];
        this.nodes[skip_list[c]].velocity.scale(0);
    }


    var que = new fast_queue_cls(this.nodes.length + 1);
    que.push(skip_list.length ? skip_list[0] : parseInt(this.nodes.length/2));

    while(!que.empty()) {
        var id = que.pop();

        if (node_map[id] == FIELD_CHECKED) {
            continue;
        }
        var node = this.nodes[id];

        if (node_map[id] == FIELD_FREE) {
            node.tick(bounds);
            for(var c = node.links.length - 1; c >= 0; --c) {
                node.links[c].tick(bounds);
                // push the other one
                que.push( id == node.links[c].left.id ? node.links[c].right.id : node.links[c].left.id );
            }
        } else {
            for(var c = node.links.length - 1; c >= 0; --c) {
                // push the other one
                que.push( id == node.links[c].left.id ? node.links[c].right.id : node.links[c].left.id );
            }
        }

        node_map[id] = FIELD_CHECKED;

    }
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

    fast_memory.free(this.node_mem_name);
    fast_memory.free(this.link_mem_name);
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

