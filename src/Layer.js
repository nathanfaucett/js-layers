var Layer = require("@nathanfaucett/layer"),
    keys = require("@nathanfaucett/keys"),
    objectFilter = require("@nathanfaucett/object-filter"),
    arrayMap = require("@nathanfaucett/array-map");


module.exports = StackLayer;


function StackLayer(path, parent, end) {

    Layer.call(this, path, parent, end);

    this.__methods = {};
}
Layer.extend(StackLayer);

StackLayer.create = function(path, parent, end) {
    return (new StackLayer(path, parent, end));
};

StackLayer.prototype.toJSON = function(json) {
    var methods = this.__methods;

    json = json || {};

    json.path = this.__path;

    json.params = arrayMap(this.__params, function(param) {
        return param.toJSON();
    });

    json.methods = objectFilter(keys(methods), function(method) {
        return !!methods[method];
    });

    return json;
};
