var isObject = require("@nathanfaucett/is_object"),
    isFunction = require("@nathanfaucett/is_function"),
    arrayForEach = require("@nathanfaucett/array-for_each");


module.exports = mount;


function mount(layers, handlers) {
    arrayForEach(handlers, function(handler) {
        var mw;

        if (isFunction(handler)) {
            layers[layers.length] = handler;
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 4) {
                    layers[layers.length] = function(err, req, res, next) {
                        handler.middleware(err, req, res, next);
                    };
                } else if (mw.length <= 3) {
                    layers[layers.length] = function(req, res, next) {
                        handler.middleware(req, res, next);
                    };
                } else {
                    throw new Error("handler middleware invalid arguments, handler([err ,]req, res, next");
                }
            } else {
                throw new Error("handler.middleware must be a function");
            }
        } else {
            throw new Error("handlers must be functions or objects with a middleware function");
        }
    });
}
