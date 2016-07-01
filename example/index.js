var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var serveStatic = require('serve-static');
var app = express();

var url = require('url');
var path = require('path');

app.post('/odata/\\$batch', jsonParser, function(req, res, next){
	res.status(400);
	next('Not implemented');
});

var metadata = require('./metadata');
app.get('/odata/\\$metadata', metadata.requestHandler());

// service document
app.get('/odata', function(req, res, next){
	res.json({
		'@odata.context': req.protocol + '://' + req.get('host') + '/odata/$metadata',
		value: [
			{
				name: 'Kittens',
				kind: 'EntitySet',
				url: 'Kittens'
			}
		]
	});
});

var createServiceOperationCall = require('../lib/index').createServiceOperationCall;
var createODataPath = require('../lib/index').createODataPath;

app.get(createODataPath('/Kittens(1)/Kittens(2)/Default.Rect(id=1)', metadata.edmx), function(req, res, next){
	var call = createServiceOperationCall(req.url, metadata.edmx);
	res.send(call);
});
app.use('/odata', require('./controllers/Kittens'));

app.use(serveStatic(path.join(__dirname, './public')));
app.listen(52999);
