var isArray = require("is_array"),
    indexOf = require("index_of"),
    forEach = require("for_each"),
    methods = require("methods"),
    fastSlice = require("fast_slice"),
    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    Layer = require("./layer");


var LayerPrototype = Layer.prototype;


module.exports = Route;


function Route(path, parent) {
    Layer.call(this, path, parent, true);
}
Layer.extend(Route);

Route.create = function(path, parent) {
    return new Route(path, parent);
};

Route.prototype.construct = function(path, parent) {

    LayerPrototype.construct.call(this, path, parent, true);

    this.__stack = {};

    return this;
};

Route.prototype.destruct = function() {

    LayerPrototype.destruct.call(this);

    this.__stack = null;

    return this;
};

Route.prototype.__handle = function(err, req, res, next) {
    var method = req.method,
        stack = method === "HEAD" && !this.__methods[method] ? this.__stack.GET : this.__stack[method],
        index = 0,
        stackLength;

    if (!stack || !(stackLength = stack.length)) {
        next(err);
        return;
    }

    (function done(err) {
        var handler, length;

        if (index >= stackLength) {
            next(err);
            return;
        }

        handler = stack[index++];
        length = handler.length;

        req.next = done;

        try {
            if (length >= 4) {
                handler(err, req, res, done);
            } else {
                if (!err) {
                    handler(req, res, done);
                } else {
                    done(err);
                }
            }
        } catch (e) {
            done(e);
        }
    }(err));
};

Route.prototype.mount = function(method, handlers) {
    var stack;

    if (indexOf(methods, method.toLowerCase()) === -1) {
        throw new Error(
            "Route.mount(method, handlers) method " + method.toUpperCase() + " is not allowed, methods are\n\t" + methods.join("\n\t")
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
    if (stack.length === 0) this.__methods[method] = false;

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
