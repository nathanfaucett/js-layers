var assert = require("assert"),
    layers = require("../src/index");


describe("#Layer", function() {

    describe("#setPath(path : String)", function() {
        it("should set the path of the layer", function() {
            var layer = layers.Layer.create();

            layer.setPath("/parent/:parent_id[0-9]/child/:id[0-9](.:format)");

            assert.equal(layer.__path, "/parent/:parent_id[0-9]/child/:id[0-9](.:format)");
            assert.equal(layer.__regexp.source, "^\\/+parent\\/+([0-9]+)\\/+child\\/+([0-9]+)(?:\\.([a-zA-Z0-9-_]+?))?(?=\\/|$)");
            assert.deepEqual(layer.__params, [{
                name: "parent_id",
                regexp: "[0-9]",
                required: true
            }, {
                name: "id",
                regexp: "[0-9]",
                required: true
            }, {
                name: "format",
                regexp: "[a-zA-Z0-9-_]",
                required: false
            }]);
        });
    });

    describe("#match(path : String)", function() {
        it("should return matched params if string matches layer's path", function() {
            var layer = layers.Layer.create("/parent/:parent_id[0-9]/child/:id[0-9](.:format)");

            assert.deepEqual(layer.match("/parent/1/child/1.json"), {
                parent_id: 1,
                id: 1,
                format: "json"
            });

            assert.deepEqual(layer.match("/parent/1/child/1"), {
                parent_id: 1,
                id: 1
            });
        });
    });
});
