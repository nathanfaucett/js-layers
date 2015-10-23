var EventEmitter = require("event_emitter"),
    pathToRegexp = require("path_to_regexp"),
    isString = require("is_string"),
    keys = require("keys"),
    filter = require("filter"),
    arrayMap = require("array-map"),

    filterParams = require("./utils/filterParams"),
    cleanPath = require("./utils/cleanPath"),
    buildPath = require("./utils/buildPath");


module.exports = Layer;


function Layer(path, parent, end) {

    EventEmitter.call(this, -1);

    this.construct(path, parent, end);
}
EventEmitter.extend(Layer);

Layer.create = function(path, parent, end) {
    return (new Layer(path, parent, end));
};

Layer.prototype.construct = function(path, parent, end) {

    this.__parent = parent;
    this.__regexp = null;
    this.__params = [];
    this.__methods = {};

    this.__end = !!end;
    this.__relativePath = null;
    this.__path = null;

    this.setPath(isString(path) ? path : "/");

    return this;
};

Layer.prototype.destructor = function() {

    this.__parent = null;
    this.__regexp = null;
    this.__params = null;
    this.__methods = null;

    this.__end = null;
    this.__relativePath = null;
    this.__path = null;

    return this;
};

Layer.prototype.setPath = function(path) {

    this.__relativePath = cleanPath(path);
    this.__path = buildPath(this.__parent, this.__relativePath);
    this.compile();

    return this;
};

Layer.prototype.match = function(path) {
    return filterParams(this.__regexp, this.__params, path);
};

Layer.prototype.format = function() {
    return pathToRegexp.format(this.__path);
};

Layer.prototype.recompile = function() {
    return this.setPath(this.__relativePath);
};

Layer.prototype.compile = function() {
    this.__regexp = pathToRegexp(this.__path, this.__params, this.__end);
    return this;
};

Layer.prototype.toJSON = function(json) {
    var methods = this.__methods;

    json = json || {};

    json.path = this.__path;

    json.params = arrayMap(this.__params, function(param) {
        return param.toJSON();
    });

    json.methods = filter(keys(methods), function(method) {
        return !!methods[method];
    });

    return json;
};
