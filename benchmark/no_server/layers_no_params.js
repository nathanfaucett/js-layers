var layers = global.layers = require("../../src/index");


module.exports = {

    defer: true,

    setup: function() {
        var router = new layers.Router();

        router.route("/posts")
            .get(function(req, res, next) {
                res.end();
                next();
            });
    },

    fn: function(deferred) {
        router.handler({
                method: "GET",
                pathname: "/posts",
                url: "http://localhost:8888/posts"
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
