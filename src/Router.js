var isFunction = require("@nathanfaucett/is_function"),
    isObject = require("@nathanfaucett/is_object"),
    isString = require("@nathanfaucett/is_string"),
    indexOf = require("@nathanfaucett/index_of"),
    arrayForEach = require("@nathanfaucett/array-for_each"),
    fastSlice = require("@nathanfaucett/fast_slice"),
    urls = require("@nathanfaucett/urls"),
    HttpError = require("@nathanfaucett/http_error"),

    cleanPath = require("./utils/cleanPath"),
    Data = require("./Data"),
    Route = require("./Route"),
    Middleware = require("./Middleware"),
    Layer = require("./Layer");


var LayerPrototype = Layer.prototype;


module.exports = Router;


function Router(path, parent) {
    Layer.call(this, path, parent, false);
}
Layer.extend(Router);

Router.create = function(path, parent) {
    return new Router(path, parent);
};

Router.prototype.__isRouter__ = true;

Router.prototype.construct = function(path, parent) {

    this.__layers = [];

    this.Route = Route;
    this.Middleware = Middleware;
    this.Scope = Router;

    LayerPrototype.construct.call(this, path, parent, false);

    this.__methods["*"] = true;

    return this;
};

Router.prototype.destructor = function() {

    LayerPrototype.destructor.call(this);

    this.__layers = null;

    this.Route = null;
    this.Middleware = null;
    this.Scope = null;

    return this;
};

Router.prototype.enqueue = function(queue, parentData, pathname, method) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1,
        layer, methods, params, data;

    while (i++ < il) {
        layer = layers[i];
        methods = layer.__methods;

        if (
            (methods[method] || methods["*"] || (method === "HEAD" && methods.GET)) &&
            (params = layer.match(pathname))
        ) {
            data = new Data(layer, params);

            if (layer.__isRouter__) {
                data.router = layer;
                layer.enqueue(queue, data, pathname, method);
            } else {
                if (layer.__isMiddleware__) {
                    data.middleware = layer;
                } else {
                    data.route = layer;
                }
                layer.enqueue(queue, data, pathname, method);
            }
        }
    }
};

function Router_final(_this, req, res, error, callback) {
    var msg, code;

    if (res.headersSent && !error) {
        if (isFunction(callback)) {
            callback(error, req, res);
        }
        _this.emit("end", error, req, res);
    } else {
        error = error || new HttpError(404);

        msg = error.stack || (error.toString ? error.toString() : error + "");
        code = error.statusCode || error.status || error.code || 500;

        if (res.headersSent) {
            console.error(error);
        } else {
            res.statusCode = code;
            res.end(msg);
        }

        if (isFunction(callback)) {
            callback(error, req, res);
        }
        _this.emit("end", error, req, res);
    }
}

Router.prototype.handler = function(req, res, callback) {
    var _this = this,
        queue = [],
        pathname = req.pathname || (req.pathname = urls.parse(req.url).pathname),
        method = req.method,
        index = 0,
        queueLength;

    this.enqueue(queue, null, pathname, method);
    queueLength = queue.length;

    (function next(error) {
        var layer, fn, data, length;

        if (res.headersSent || index >= queueLength) {
            Router_final(_this, req, res, error, callback);
        } else {
            layer = queue[index++];
            fn = layer.fn;
            length = fn.length;
            data = layer.data;

            req.params = data.params;
            req.layer = data.layer;
            req.middleware = data.middleware;
            req.route = data.route;
            req.next = next;

            try {
                if (length >= 4) {
                    fn(error, req, res, next);
                } else {
                    if (!error) {
                        fn(req, res, next);
                    } else {
                        next(error);
                    }
                }
            } catch (e) {
                next(e);
            }
        }
    }());
};

Router.prototype.find = function(path, type) {
    var layers = this.__layers,
        i = layers.length,
        layer;

    type = type || "route";
    path = cleanPath(path);

    while (i--) {
        layer = layers[i];

        if (!layer || path.indexOf(layer.__path) === -1) {
            continue;
        } else if (type === "middleware" && layer.__isMiddleware__) {
            return layer;
        } else if (type === "route" && layer.__isRoute__) {
            return layer;
        } else if (layer.__isRouter__) {
            if (type === "scope" || type === "router") {
                return layer;
            } else {
                return layer.find(path, type);
            }
        }
    }

    return undefined;
};

Router.prototype.setPath = function(path) {
    var layers = this.__layers,
        i = -1,
        il = layers.length - 1;

    LayerPrototype.setPath.call(this, path);

    while (i++ < il) {
        layers[i].recompile();
    }

    return this;
};

Router.prototype.unmount = function(path, type) {
    var layer = this.find(path, type || (type = "route")),
        scope, layers, index;

    if (layer) {
        scope = layer.parent || this;
        layers = scope.layers;

        if ((index = indexOf(layers, layer))) {
            layers.splice(index, 1);
        }
    } else {
        throw new Error("Router.unmount(path[, type]) no layer found with type " + type + " at path " + path);
    }

    return this;
};

Router.prototype.use = function(path) {
    var _this = this,
        layers = this.__layers,
        middleware, middlewareStack, stack;

    if (isString(path)) {
        stack = fastSlice(arguments, 1);
    } else {
        stack = fastSlice(arguments);
        path = "/";
    }

    middlewareStack = [];

    arrayForEach(stack, function(handler) {
        var mw;

        if (isFunction(handler)) {
            middlewareStack[middlewareStack.length] = handler;
        } else if (handler.__isRouter__) {
            _this.scope(handler);
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 4) {
                    middlewareStack[middlewareStack.length] = function(err, req, res, next) {
                        handler.middleware(err, req, res, next);
                    };
                } else {
                    middlewareStack[middlewareStack.length] = function(req, res, next) {
                        handler.middleware(req, res, next);
                    };
                }
            } else {
                throw new Error("use(handlers...) handler middleware must be a function");
            }
        } else {
            throw new Error("use(handlers...) handlers must be functions or objects with a middleware function");
        }
    });

    if (middlewareStack.length !== 0) {
        middleware = new this.Middleware(path, this);
        layers[layers.length] = middleware;

        middleware.mount(middlewareStack);
    }

    return this;
};

Router.prototype.route = function(path) {
    var layers = this.__layers,
        route = new this.Route(path, this);

    layers[layers.length] = route;
    return route;
};

Router.prototype.scope = function(path) {
    var layers = this.__layers,
        router;

    if (path.__isRouter__) {
        router = path;
        path = router.__relativePath;

        router.__parent = this;
        router.setPath(path);

        if (indexOf(this.__layers, router) !== -1) {
            return router;
        }
    } else {
        path = cleanPath(path);
    }

    if (!router) {
        router = new this.Scope(path, this);
        router.Route = this.Route;
        router.Middleware = this.Middleware;
        router.Scope = this.Scope;
    }

    layers[layers.length] = router;

    return router;
};
