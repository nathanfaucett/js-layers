var isArray = require("is_array"),
    fastSlice = require("fast_slice"),

    mount = require("./utils/mount"),
    unmount = require("./utils/unmount"),
    Layer = require("./layer");


var LayerPrototype = Layer.prototype;


function Middleware(path, parent) {
    Layer.call(this, path, parent, false);
}
Layer.extend(Middleware);

Middleware.create = function(path, parent) {
    return new Middleware(path, parent);
};

Middleware.prototype.construct = function(path, parent) {

    LayerPrototype.construct.call(this, path, parent, false);

    this.__methods["*"] = true;
    this.__stack = [];

    return this;
};

Middleware.prototype.destruct = function() {

    LayerPrototype.destruct.call(this);

    this.__stack = null;

    return this;
};

Middleware.prototype.__handle = function(err, req, res, next) {
    var stack = this.__stack,
        index = 0,
        stackLength = stack.length;

    if (!stack || !stackLength) {
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
                    next(err);
                }
            }
        } catch (e) {
            next(e);
        }
    }(err));
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
