var parseURIComponent = require("./parse_uri_component"),
    isNullOrUndefined = require("is_null_or_undefined");


module.exports = filterParams;


function filterParams(regexp, params, path) {
    var results = regexp.exec(path),
        filteredParams, result, i, il, length;

    if (!results) {
        return false;
    }

    filteredParams = {};

    il = params.length;
    if (il === 0) {
        return filteredParams;
    }

    i = -1;
    il = il - 1;
    length = results.length;

    while (i++ < il) {
        if (i < length) {
            result = results[i + 1];

            if (!isNullOrUndefined(result)) {
                filteredParams[params[i].name] = parseURIComponent(result);
            }
        }
    }

    return filteredParams;
}
