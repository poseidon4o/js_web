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
    },

    alloc_get: function(name, allocator, size) {
        if ( !(name in this.memory) ) {
            return this.allocate(name, allocator, size);
        }
        return this.get_memory(name);
    }
}