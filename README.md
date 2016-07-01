# OData V4 Resource

OData v4 resource path handler

## Using low-level

_createODataPath(exampleUri, metadata)_: creates an Express route path from an example OData URI

```javascript
var createServiceOperationCall = require('../lib/index').createServiceOperationCall;
var createODataPath = require('../lib/index').createODataPath;

app.get(createODataPath('/Kittens(1)/Kittens(2)/Default.Rect(id=1)', metadata), function(req, res, next){
	var call = createServiceOperationCall(req.url, metadata);
	res.send(call);
});
```

## Using resource controller

Create a router module:

```javascript
var express = require('express');
var router = express.Router();

var ODataController = require('../../lib/index').ODataController;
var metadata = require('../metadata');

function MyController(req, res, next){
    this.MySingleton = {
        /* ... */
    };
    this.MyAction = function(){
        /* ... */
        return {
			/* ... */
		};
    };
    this.MyFunction = function(param1, param2){
        /* ... */
        return {
			/* ... */
		};
    };
    this.MyEntitySet = function(key){
        return new Promise(function(resolve, reject){
            var start = Date.now();
            setTimeout(function(){
                resolve({
                    /* ... */
                });
            }, Math.random() * 3000);
        });
    };
    this.$value = function(){
        return { /* ... */ };
    };
    this.$ref = function(){
        /* ... */
    };
}

router.use(ODataController(MyController, metadata));

module.exports = router;
```

Use your controller router in Express:

```javascript
app.use('/odata', require('./controllers/MyController'));
```