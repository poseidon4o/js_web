
/**
 * Fast queue class
 * !! WARNING !! If poped after empty or push after full causes UNDEFINED BEHAVIOUR
 */
function fast_queue_cls (size) {
    if (!size) {
        throw "Size mandatory!";
    }

    this._size = size < 32 ? 32 : size;
    this.que = new Int8Array(this._size);
    this.head = this.tail = 0;
};

fast_queue_cls.prototype.push = function(num) {
    this.que[this.tail] = num;
    this.tail = parseInt((this.tail + 1) % this._size);
};

fast_queue_cls.prototype.pop = function() {
    var val = this.que[this.head];
    this.head = parseInt((this.head + 1) % this._size);
    return val;
};

fast_queue_cls.prototype.empty = function() {
    return this.head == this.tail;
};

fast_queue_cls.prototype.size = function() {
    return this.head <= this.tail ? this.tail - this.head : this._size - (this.tail - this.head);
};

fast_queue_cls.prototype.clear = function() {
    this.tail = this.head = 0;
};