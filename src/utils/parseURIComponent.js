module.exports = parseURIComponent;


function parseURIComponent(value) {
    var num;
    value = decodeURIComponent(value);
    num = +value;
    return num !== num ? value : num;
}
