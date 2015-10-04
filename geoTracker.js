// Webserver for geo tracker
var getHandler = require('./lib/getHandler');
var postHandler = require('./lib/postHandler');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;   // 8081 -> Nitrous

app.set('port', port);
app.use('/', express.static(__dirname));
app.use('/public', express.static(__dirname));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
getHandler.registerHandlerGeodataGet(app);
app.get('/*', function(req, res) {
    res.status(404).sendFile(__dirname + '/error.html');
});
postHandler.registerHandlerGeodataPost(app);
// debugger;

// use host '0.0.0.0' to connect from any host
var server = http.createServer(app).listen(app.get('port'), ipaddress, function() {
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port)
        console.log('i.e. http://geotracker-js-131771.nitrousapp.com:'+server.address().port)
	});

/*var server = app.listen(port,'0.0.0.0', function(){
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port)
        console.log('i.e. http://geotracker-js-131771.nitrousapp.com:'+server.address().port)
   }); */
