var isObject = require("is_object"),
    isFunction = require("is_function"),
    indexOf = require("index_of"),
    forEach = require("for_each");


module.exports = unmount;


function unmount(stack, handlers) {
    forEach(handlers, function(handler) {
        var value = null,
            index;

        if (isFunction(handler)) {
            value = handler;
        } else if (isObject(handler)) {
            if (isFunction(handler.middleware)) {
                value = handler.middleware;
            } else {
                throw new Error("unmount(handlers[, ...]) handlers must be functions or objects with a middleware function");
            }
        }

        if ((index = indexOf(stack, value)) === -1) {
            throw new Error("unmount(handlers[, ...]) stack does not contain handler");
        }

        stack.splice(index, 1);
    });
}
