layers
=======

layers for the browser and node.js

```javascript
var layers = require("@nathanfaucett/layers");


var router = new layers.Router(), // layers.Router.create()

    // create new router layer under the "/sessions" path
    sessions = router.scope("sessions");


// can be a object with a middleware function
router.use(
    function cors(req, res, next) {
        // cors middleware
    },
    function bodyParser(req, res, next) {
        // body parser middleware
    }
);

router.route() // same as "/"
    .get(
        function getHome(req, res, next) {
            // send home info
            next();
        }
    );

sessions.use(
    function middleware(req, res, next) {
        // do some work on "/sessions/**"
    }
);

sessions.route("sign_in")
    .get(
        function signIn(req, res, next) {
            // return user if signed in
            next();
        }
    );

sessions.route("sign_up")
    .post(
        function signIn(req, res, next) {
            // sign user in
            next();
        }
    );


```
