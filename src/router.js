var isFunction = require("is_function"),
    isObject = require("is_object"),
    isString = require("is_string"),
    indexOf = require("index_of"),
    extend = require("extend"),
    forEach = require("for_each"),
    fastSlice = require("fast_slice"),
    urls = require("urls"),
    HttpError = require("http_error"),

    cleanPath = require("./utils/clean_path"),
    Route = require("./route"),
    Middleware = require("./middleware"),
    Layer = require("./layer");


var LayerPrototype = Layer.prototype;


module.exports = Router;


function Router(path, parent) {
    Layer.call(this, path, parent, false);
}
Layer.extend(Router);

Router.create = function(path, parent) {
    return new Router(path, parent);
};

Router.prototype.construct = function(path, parent) {
    var _this = this;

    LayerPrototype.construct.call(this, path, parent, false);

    this.__layers = [];
    this.__methods["*"] = true;

    this.Route = Route;
    this.Middleware = Middleware;
    this.Scope = Router;

    this.__handle = function(err, req, res, next) {
        _this.middleware(err, req, res, next);
    };

    return this;
};

Router.prototype.destruct = function() {

    LayerPrototype.destruct.call(this);

    this.__handle = null;
    this.__layers = null;

    this.Route = null;
    this.Middleware = null;
    this.Scope = null;

    return this;
};

Router.prototype.middleware = function(err, req, res, next) {
    var pathname = req.pathname || (req.pathname = urls.parse(req.url).pathname),
        method = req.method,
        layers = this.__layers,
        index = 0,
        layersLength = layers.length;

    (function done(err) {
        var layer, methods, params;

        if (index >= layersLength) {
            next(err);
            return;
        }

        layer = layers[index++];
        methods = layer.__methods["*"] || layer.__methods[method] || (method === "HEAD" && layer.__methods.GET);

        req.next = done;

        if (!layer || !methods || !(params = layer.match(pathname))) {
            done(err);
            return;
        }

        if (layer instanceof Route) {
            req.route = layer;
        }

        if (layer instanceof Router) {
            req.params = req.scopeParams = params;
        } else {
            req.params = extend(params, req.scopeParams);
        }

        req.layer = layer;

        try {
            layer.__handle(err, req, res, done);
        } catch (e) {
            done(e);
        }
    }(err));
};

Router.prototype.handler = function(req, res, callback) {
    var _this = this,
        pathname = req.pathname || (req.pathname = urls.parse(req.url).pathname),
        method = req.method,
        layers = this.__layers,
        index = 0,
        layersLength = layers.length;

    req.scopeParams = {};

    this.emit("start", req, res);

    (function next(err) {
        var msg, code,
            layer, methods, params;

        if (res.headersSent || index >= layersLength) {
            if (res.headersSent && !err) {
                isFunction(callback) && callback(err, req, res);
                _this.emit("end", err, req, res);
                return;
            }
            if (!err) {
                err = new HttpError(404);
            }

            msg = err.stack || (err.toString ? err.toString() : err + "");
            code = err.statusCode || err.status || err.code || 500;

            if (res.headersSent) {
                console.error(err);
            } else {
                res.statusCode = code;
                res.end(msg);
            }

            isFunction(callback) && callback(err, req, res);
            _this.emit("end", err, req, res);
            return;
        }

        layer = layers[index++];
        methods = layer.__methods["*"] || layer.__methods[method] || (method === "HEAD" && layer.__methods.GET);

        req.next = next;

        if (!layer || !methods || !(params = layer.match(pathname))) {
            next(err);
            return;
        }

        if (layer instanceof Route) {
            req.route = layer;
        }

        if (layer instanceof Router) {
            req.params = req.scopeParams = params;
        } else {
            req.params = extend(params, req.scopeParams);
        }

        req.layer = layer;

        try {
            layer.__handle(err, req, res, next);
        } catch (e) {
            next(e);
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
        } else if (type === "route" && layer instanceof Route) {
            return layer;
        } else if (type === "middleware" && layer instanceof Middleware) {
            return layer;
        } else if (layer instanceof Router) {
            if (type === "scope" || type === "router") return layer;
            return layer.find(path, type);
        }
    }

    return null;
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

    forEach(stack, function(handler) {
        var mw;

        if (isFunction(handler)) {
            middlewareStack[middlewareStack.length] = handler;
        } else if (handler instanceof Router) {
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

    if (path instanceof Router) {
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
