var isString = require("@nathanfaucett/is_string"),
    urlPath = require("@nathanfaucett/url_path");


module.exports = buildPath;


function buildPath(parent, path) {
    if (!isString(path) || !path || (!parent && path === "/")) {
        return "/";
    }

    if (path[0] === "/") {
        path = path.slice(1);
    }
    if (path[path.length - 1] === "/") {
        path = path.slice(0, -1);
    }

    if (parent) {
        path = urlPath.resolve(parent.__path, path);
    } else {
        if (path[0] !== "/") {
            path = "/" + path;
        }
    }

    return urlPath.normalize(path);
}
