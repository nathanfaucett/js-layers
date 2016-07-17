var http = require("http"),
    request = require("@nathanfaucett/request"),
    Benchmark = require("benchmark"),
    express = require("express"),
    layers = require("..");


var suite = new Benchmark.Suite(),
    layersServer, expressServer;


function createLayersServer() {
    var server, router;

    if (!layersServer) {
        server = layersServer = new http.Server(),
        router = layers.Router.create();

        router.use(function(req, res, next) {
            next();
        });
        router.use(
            "/grand_parent/:parent_id/grand_child",
            function(req, res, next) {
                next();
            }
        );

        var scope = router.scope("/grand_parent/:parent_id/grand_child");

        scope.route("/parent/:id/child")
            .get(
                function(req, res, next) {
                    next();
                }
            );

        scope.route("/parent/:id/child")
            .get(
                function(req, res, next) {
                    next();
                }
            );

        server.on("request", function(req, res) {
            router.handler(req, res);
        });

        server.listen(9997);
    }
}

function createExpressServer() {
    var server, app;

    if (!expressServer) {
        server = expressServer = new http.Server(),
        app = express();

        server.on("request", app);


        app.use(function(req, res, next) {
            next();
        });
        app.use(
            "/grand_parent/:parent_id/grand_child",
            function(req, res, next) {
                next();
            }
        );

        app.get(
            "/grand_parent/:parent_id/grand_child",
            function(req, res, next) {
                next();
            }
        );

        app.get(
            "/grand_parent/:parent_id/grand_child/parent/:id/child",
            function(req, res, next) {
                next();
            }
        );

        server.listen(9999);
    }
}


suite.add({
    name: "express",
    defer: true,
    fn: function(deferred) {

        createExpressServer();

        function done() {
            deferred.resolve();
            expressServer.close();
        }

        request.get("http://localhost:9999/grand_parent", {
            success: done,
            error: done
        });
    }
});
suite.add({
    name: "express_fullpath",
    defer: true,
    fn: function(deferred) {

        createExpressServer();

        function done() {
            deferred.resolve();
            expressServer.close();
        }

        request.get("http://localhost:9999/grand_parent/1/grand_child/parent/1/child", {
            success: done,
            error: done
        });
    }
});

suite.add({
    name: "layers",
    defer: true,
    fn: function(deferred) {

        createLayersServer();

        function done() {
            deferred.resolve();
            layersServer.close();
        }

        request.get("http://localhost:9997/grand_parent", {
            success: done,
            error: done
        });
    }
});
suite.add({
    name: "layers_fullpath",
    defer: true,
    fn: function(deferred) {

        createLayersServer();

        function done() {
            deferred.resolve();
            layersServer.close();
        }

        request.get("http://localhost:9997/grand_parent/1/grand_child/parent/1/child", {
            success: done,
            error: done
        });
    }
});

suite.on("cycle", function(event) {
    console.log(String(event.target));
});

suite.on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
    console.log("==========================================\n");
});

console.log("\n= middleware =================================");
suite.run();
