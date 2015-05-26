var isArray = require("is_array"),
    fastSlice = require("fast_slice"),

    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    LayerData = require("./LayerData"),
    Layer = require("./Layer");


var LayerPrototype = Layer.prototype;


function Middleware(path, parent) {
    Layer.call(this, path, parent, false);
}
Layer.extend(Middleware);

Middleware.create = function(path, parent) {
    return new Middleware(path, parent);
};

Middleware.prototype.__isMiddleware__ = true;

Middleware.prototype.construct = function(path, parent) {

    LayerPrototype.construct.call(this, path, parent, false);

    this.__methods["*"] = true;
    this.__stack = [];

    return this;
};

Middleware.prototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__stack = null;

    return this;
};

Middleware.prototype.enqueue = function(queue, parentData /*, pathname, method */ ) {
    var stack = this.__stack,
        i = -1,
        il = stack.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(stack[i], parentData);
    }
};

Middleware.prototype.mount = function(handlers) {
    mount(this.__stack, isArray(handlers) ? handlers : fastSlice(arguments));
    return this;
};

Middleware.prototype.unmount = function(handlers) {
    unmount(this.__stack, isArray(handlers) ? handlers : fastSlice(arguments));
    return this;
};


module.exports = Middleware;
