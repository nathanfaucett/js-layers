var expressRouter = global.expressRouter = require("express/lib/router");


module.exports = {

    defer: true,

    setup: function() {
        var router = expressRouter();

        router.route("/posts")
            .get(function(req, res, next) {
                res.end();
                next();
            });
    },

    fn: function(deferred) {
        router.handle({
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
