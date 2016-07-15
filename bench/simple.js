var http = require("http"),
    request = require("@nathanfaucett/request"),
    Benchmark = require("@nathanfaucett/benchmark"),
    express = require("@nathanfaucett/express"),
    layers = require("..");


var suite = new Benchmark.Suite();


(function createLayersServer() {
    var server = new http.Server(),
        router = layers.Router.create();

    router.use(
        "/parent/child",
        function(req, res, next) {
            next();
        }
    );

    router.route("/parent/child").
        get(
            function(req, res, next) {
                next();
            }
        );

    server.on("request", function(req, res) {
        router.handler(req, res);
    });

    server.listen(9998);
}());

(function createExpressServer() {
    var app = express();

    app.use(
        "/parent/child",
        function(req, res, next) {
            next();
        }
    );

    app.get(
        "/parent/child",
        function(req, res, next) {
            next();
        }
    );

    app.listen(9999);
}());


suite.add("layers", {
    defer: true,
    fn: function(deferred) {

        function done() {
            deferred.resolve();
        }

        request.get("http://localhost:9998/parent/child", {
            success: done,
            error: done
        });
    }
});

suite.add("express", {
    defer: true,
    fn: function(deferred) {

        function done() {
            deferred.resolve();
        }

        request.get("http://localhost:9999/parent/child", {
            success: done,
            error: done
        });
    }
});

suite.on("cycle", function(event) {
    console.log(String(event.target));
});

suite.on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
    console.log("==========================================\n");
});

console.log("\n= middleware =================================");
suite.run();
