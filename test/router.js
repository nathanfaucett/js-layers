var assert = require("assert"),
    layers = require("../src/index");


describe("#Router", function() {

    describe("#handler(req : Request, res : Response[, callback(err : Error, req, res) : Function])", function() {
        it("should call all routes/middleware based on req.pathname or url.parse(req.url).pathname", function() {
            var router = layers.Router.create(),

                calledMiddleware = false,
                calledRoute = false;

            router.use(
                function(req, res, next) {
                    next();
                },
                function(req, res, next) {
                    calledMiddleware = true;
                    next();
                }
            );

            router.route("/parent/:parent_id[0-9]/child/:id[0-9](.:format)").
            get(
                function(req, res, next) {
                    next();
                },
                function(req, res, next) {
                    calledRoute = true;
                    res.end();
                    next();
                }
            );

            router.use(
                function(req, res, next) {
                    if (req.route) {
                        next();
                    } else {
                        next(new Error("404 - Not Found"));
                    }
                }
            );

            router.handler({
                    method: "GET",
                    pathname: "/parent/1/child/1.json",
                    url: "http://localhost:8888/parent/1/child/1.json"
                }, {
                    end: function() {
                        this.headersSent = true;
                    }
                },
                function() {
                    assert.equal(calledMiddleware, true);
                    assert.equal(calledRoute, true);
                }
            );

            router.handler({
                    method: "GET",
                    pathname: "/not_found",
                    url: "http://localhost:8888/not_found"
                }, {
                    end: function() {
                        this.headersSent = true;
                    }
                },
                function(err) {
                    assert.equal(err.message, "404 - Not Found");
                }
            );
        });
    });
});
