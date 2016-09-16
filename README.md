layers
=======

layers is rack like Router

```javascript
var layers = require("@nathanfaucett/layers");


var router = new layers.Router(), // layers.Router.create()

    // create new router layer under the "/sessions" path
    sessions = router.scope("sessions");


router.use(
    function cors(req, res, next) {
        // cors middleware
    },
    // can be an object with a middleware function
    {
      middleware: function bodyParser(req, res, next) {
          // body parser middleware
      }
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


var server = new http.Server();

server.on("request", function onRequest(request, response) {
    router.handler(request, response, function onHandle(error) {
        // handle error if one passed all the way through the layers
    });
})
```
