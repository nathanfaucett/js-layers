var isString = require("is_string"),
    urlPath = require("url_path");


module.exports = cleanPath;


function cleanPath(path) {
    if (!isString(path) || !path || path === "/") {
        return "/";
    }

    if (path[0] !== "/") {
        path = "/" + path;
    }
    if (path[path.length - 1] === "/") {
        path = path.slice(0, -1);
    }

    return urlPath.normalize(path);
}
