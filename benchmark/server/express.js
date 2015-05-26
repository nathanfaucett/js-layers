var express = require("express"),
    app = express();


app.use(function(req, res, next) {
    setTimeout(function() {
        next();
    });
});

app.get("/posts", function(req, res, next) {
    next();
});

app.get("/posts/:id", function(req, res, next) {
    next();
});


var server = app.listen(8080);
