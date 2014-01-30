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
        --this.idx;
        this.memory[id] = this.memory[this.idx];
        this.sizes[id] = this.sizes[this.idx];
        this.memory[this.idx] = this.sizes[this.idx] = null;
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