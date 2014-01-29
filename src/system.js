
function system_cls(canvas_id) {
    this.field = null;
    this.bounds = null;
    this.canvas = null;
    this.ctx = null;
    this.mouse = null;

    if (canvas_id !== undefined) {
    this.canvas = document.getElementById(canvas_id);

    // 30 - black magic number
    var width = document.body.clientWidth - 30;
    var height = document.body.clientHeight - this.canvas.clientTop - 30;


        this.field = new field_cls(Math.round(Math.sqrt(PARTICLES || 4)));
        this.canvas.width = width || this.canvas.clientWidth;
        this.canvas.height = height || this.canvas.clientHeight;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = "#000000";
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 0.3;

        this.bounds = new bounds_cls();
    var bbox = this.canvas.getBoundingClientRect();

        this.bounds.top = this.canvas.clientTop;
        this.bounds.right = width || this.canvas.clientWidth;
        this.bounds.bottom = height || this.canvas.clientHeight;
        this.bounds.left = this.canvas.clientLeft;

    this.mouse = new vector_cls();
    var self = this;
    this.canvas.addEventListener('mousemove', function(event) {
        self.mouse.x = event.clientX - bbox.left;
        self.mouse.y = event.clientY - bbox.top;
    });
    };
}

system_cls.prototype.reset = function() {
    this.field.clear();
    this.field = new field_cls(Math.round(Math.sqrt(PARTICLES || 4)));
};

system_cls.prototype.frame = function(only_draw, skip_list) {
    this.ctx.clearRect(
        this.bounds.left,
        this.bounds.top,
        this.bounds.right,
        this.bounds.bottom);

    if( !only_draw || only_draw == false ) {
        this.field.tick(this.bounds, skip_list || []);
    }
    this.field.draw(this.ctx);
    this.ctx.stroke();
};



system_cls.prototype.get_node_at = function(pos) {
    return this.field.get_nearest(pos, SPACING);
};

system_cls.prototype.get_mouse = function() {
    return new vector_cls(this.mouse.x, this.mouse.y);
};


