var layers = global.layers = require("../../src/index");


module.exports = {

    defer: true,

    setup: function() {
        var router = new layers.Router();

        router
            .scope("/posts")
            .route("/:id[0-9]")
            .get(function(req, res, next) {
                res.end();
                next();
            });
    },

    fn: function(deferred) {
        router.handler({
                method: "GET",
                pathname: "/posts/1",
                url: "http://localhost:8888/posts/1"
            }, {
                end: function() {
                    this.headersSent = true;
                }
            },
            function() {
                deferred.resolve();
            }
        );
    }
};
