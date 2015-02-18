var isObject = require("is_object"),
    isFunction = require("is_function"),
    forEach = require("for_each");


module.exports = mount;


function mount(stack, handlers) {
    forEach(handlers, function(handler) {
        var mw;

        if (isFunction(handler)) {
            stack[stack.length] = handler;
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                mw = handler.middleware;

                if (mw.length >= 4) {
                    stack[stack.length] = function(err, req, res, next) {
                        handler.middleware(err, req, res, next);
                    };
                } else if (mw.length <= 3) {
                    stack[stack.length] = function(req, res, next) {
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
