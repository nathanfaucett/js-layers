var isArray = require("@nathanfaucett/is_array"),
    fastSlice = require("@nathanfaucett/fast_slice"),

    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),

    LayerData = require("./LayerData"),
    Layer = require("./Layer");


var MiddlewarePrototype;


module.exports = Middleware;


function Middleware(path, parent) {

    Layer.call(this, path, parent, false);

    this.__methods["*"] = true;
    this.__layers = [];
}
Layer.extend(Middleware);
MiddlewarePrototype = Middleware.prototype;

Middleware.create = function(path, parent) {
    return new Middleware(path, parent);
};

MiddlewarePrototype.__isMiddleware__ = true;

MiddlewarePrototype.enqueue = function(queue, parentData /*, pathname, method */ ) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(layers[i], parentData);
    }
};

MiddlewarePrototype.mount = function(handlers) {
    mount(this.__layers, isArray(handlers) ? handlers : fastSlice(arguments));
    return this;
};

MiddlewarePrototype.unmount = function(handlers) {
    unmount(this.__layers, isArray(handlers) ? handlers : fastSlice(arguments));
    return this;
};
