var memory_allocator = {
    INT8: function(size) {
        return new Int8Array(size);
    }, 
    UINT8: function(size) {
        return new Uint8Array(size);
    }, 
    INT16: function(size) {
        return new Int16Array(size);
    }, 
    UINT16: function(size) {
        return new Uint16Array(size);
    }, 
    INT32: function(size) {
        return new Int32Array(size);
    }, 
    UINT32: function(size) {
        return new Uint32Array(size);
    }
};

var static_memory = {
    memory: {},

    allocate: function(name, allocator, size) {
        if ( typeof(allocator) != 'function' || size < 0) {
            return null;
        }
        name = name.toString();
        if (name in this.memory) {
            throw "Chunk allocated!";
        }

        this.memory[name] = {
            value: allocator(size), 
            size: size
        };
        return this.memory[name].value;
    },

    free: function(name) {
        if ( !(name in this.memory) ) {
            throw "This was not allocated!";
        }
        this.memory[name].value = null;
        delete this.memory[name];
    },

    get_memory: function(name) {
        if ( !(name in this.memory) ) {
            throw "This was not allocated!";
        }
        return this.memory[name].value;
    },

    memset: function(name, value) {
        if ( !(name in this.memory) ) {
            throw "This was not allocated!";
        }
        var mem = this.memory[name];
        for(var c = mem.size - 1; c >= 0; --c) {
            mem.value[c] = value;
        }
    }
}


var fast_memory = {
    memory: new Array(100),
    sizes: new Array(100),
    idx: 0,

    allocate: function(allocator, size) {
        if ( typeof(allocator) != 'function' || size < 0) {
            return null;
        }

        this.memory[this.idx] = allocator(size);
        this.sizes[this.idx] = size;
        ++this.idx;
        return this.idx - 1;
    },

    free: function(id) {
        this.memory[id] = this.memory[this.idx];
        this.sizes[id] = this.sizes[this.idx];
        --this.idx;
    },

    get_memory: function(id) {
        return this.memory[id];
    },

    memset: function(id, value) {
        var mem = this.memory[id];
        for(var c = this.sizes[id] - 1; c >= 0; --c) {
            mem[c] = value;
        }
    }
}