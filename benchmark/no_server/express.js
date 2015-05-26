var expressRouter = global.expressRouter = require("express/lib/router");


module.exports = {

    defer: true,

    setup: function() {
        var router = expressRouter();

        router.route("/posts/:id[0-9]")
            .get(function(req, res, next) {
                res.end();
                next();
            });
    },

    fn: function(deferred) {
        router.handle({
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
