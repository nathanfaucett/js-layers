var isArray = require("is_array"),
    indexOf = require("index_of"),
    forEach = require("for_each"),
    methods = require("methods"),
    fastSlice = require("fast_slice"),
    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    LayerData = require("./LayerData"),
    Layer = require("./Layer");


var LayerPrototype = Layer.prototype;


module.exports = Route;


function Route(path, parent) {
    Layer.call(this, path, parent, true);
}
Layer.extend(Route);

Route.create = function(path, parent) {
    return new Route(path, parent);
};

Route.prototype.__isRoute__ = true;

Route.prototype.construct = function(path, parent) {

    LayerPrototype.construct.call(this, path, parent, true);

    this.__stack = {};

    return this;
};

Route.prototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__stack = null;

    return this;
};

Route.prototype.enqueue = function(queue, parentData, pathname, method) {
    var stack = this.__stack[method],
        i = -1,
        il = stack.length - 1;

    while (i++ < il) {
        queue[queue.length] = new LayerData(stack[i], parentData);
    }
};

Route.prototype.mount = function(method, handlers) {
    var stack;

    if (indexOf(methods, method.toLowerCase()) === -1) {
        throw new Error(
            "Route.mount(method, handlers) method " + method.toUpperCase() +
            " is not allowed, methods are\n\t" + methods.join("\n\t")
        );
    }

    method = method.toUpperCase();
    stack = this.__stack[method] || (this.__stack[method] = []);

    mount(stack, isArray(handlers) ? handlers : fastSlice(arguments, 1));

    if (stack.length > 0) {
        this.__methods[method] = true;
    }

    return this;
};

Route.prototype.unmount = function(method, handlers) {
    var stack;

    method = method.toUpperCase();
    stack = this.__stack[method];

    if (!stack) {
        throw new Error("Route.unmount(method, handler[, ...]) method not allowed " + method);
    }

    unmount(stack, isArray(handlers) ? handlers : fastSlice(arguments, 1));
    if (stack.length === 0) {
        this.__methods[method] = false;
    }

    return this;
};

forEach(methods, function(method) {
    var upper = method.toUpperCase();

    Route.prototype[method.toLowerCase()] = function(handlers) {
        return this.mount(upper, isArray(handlers) ? handlers : fastSlice(arguments));
    };
});

Route.prototype.mSearch = Route.prototype["m-search"];

Route.prototype.all = function(handlers) {
    var _this = this;

    forEach(methods, function(method) {
        _this[method](handlers);
    });
    return this;
};
