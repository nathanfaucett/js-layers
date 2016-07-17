var isArray = require("@nathanfaucett/is_array"),
    indexOf = require("@nathanfaucett/index_of"),
    arrayForEach = require("@nathanfaucett/array-for_each"),
    methods = require("@nathanfaucett/methods"),
    fastSlice = require("@nathanfaucett/fast_slice"),

    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),

    LayerData = require("./LayerData"),
    Layer = require("./Layer");


var RoutePrototype;


module.exports = Route;


function Route(path, parent) {

    Layer.call(this, path, parent, true);

    this.__layers = {};
}
Layer.extend(Route);
RoutePrototype = Route.prototype;

Route.create = function(path, parent) {
    return new Route(path, parent);
};

RoutePrototype.__isRoute__ = true;

RoutePrototype.enqueue = function(queue, parentData, pathname, method) {
    var layers = this.__layers[method],
        i = -1,
        il = layers.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(layers[i], parentData);
    }
};

RoutePrototype.mount = function(method, handlers) {
    var layers;

    if (indexOf(methods, method.toLowerCase()) === -1) {
        throw new Error(
            "Route.mount(method, handlers) method " + method.toUpperCase() +
            " is not allowed, methods are\n\t" + methods.join("\n\t")
        );
    }

    method = method.toUpperCase();
    layers = this.__layers[method] || (this.__layers[method] = []);

    mount(layers, isArray(handlers) ? handlers : fastSlice(arguments, 1));

    if (layers.length > 0) {
        this.__methods[method] = true;
    }

    return this;
};

RoutePrototype.unmount = function(method, handlers) {
    var layers;

    method = method.toUpperCase();
    layers = this.__layers[method];

    if (!layers) {
        throw new Error("Route.unmount(method, handler[, ...]) method not allowed " + method);
    }

    unmount(layers, isArray(handlers) ? handlers : fastSlice(arguments, 1));
    if (layers.length === 0) {
        this.__methods[method] = false;
    }

    return this;
};

arrayForEach(methods, function(method) {
    var upper = method.toUpperCase();

    Route.prototype[method.toLowerCase()] = function(handlers) {
        return this.mount(upper, isArray(handlers) ? handlers : fastSlice(arguments));
    };
});

Route.prototype.mSearch = Route.prototype["m-search"];

Route.prototype.all = function(handlers) {
    var _this = this;

    arrayForEach(methods, function(method) {
        _this[method](handlers);
    });
    return this;
};
