var Benchmark = require("benchmark");


var suite = new Benchmark.Suite();


suite.add("layers", require("./layers"));
suite.add("layers_no_params", require("./layers_no_params"));

suite.add("express", require("./express"));
suite.add("express_no_params", require("./express_no_params"));

suite.on("complete", function onComplete() {
    this.forEach(function(bench) {
        console.log(bench.toString());
    });
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
});


console.log("Starting test, could take a while");
suite.run();
