var http = require("http"),
    layers = require("../../src/index");


var router = layers.Router.create(),

    posts = router.scope("posts"),

    server = new http.Server(function handler(req, res) {
        router.handler(req, res);
    });

router.use(function(req, res, next) {
    setTimeout(function() {
        next();
    });
});

posts.route()
    .get(function(req, res, next) {
        next();
    });

posts.route("/:id")
    .get(function(req, res, next) {
        next();
    });


server.listen(8080);
