// Webserver for app 'geo tracker'
var getHandler = require('./lib/getHandler');
var postHandler = require('./lib/postHandler');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0';
// var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8081;   // def: 8081->Codenvy, 3000->Nitrous
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;   // def: 8081->Codenvy, 3000->Nitrous

app.set('ip', ipaddress);
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

console.log('ip:'+ipaddress);
console.log('port:'+port);
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  console.log('mongodbUrl:'+process.env.OPENSHIFT_MONGODB_DB_URL);  // deactivate later  
}
else{
  console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL not available');  // deactivate later
}

// use host '0.0.0.0' to connect from any host
/*var server = http.createServer(app).listen(app.get('port'), app.get('ip'), function() {
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port)
        console.log('i.e. http://geotracker-js-131771.nitrousapp.com:'+server.address().port)
	});*/

var server = app.listen(port,ipaddress, function(){
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port)
        console.log('i.e. http://geotracker-js-131771.nitrousapp.com:'+server.address().port)
        console.log('i.e. -> for Codenvy see test URL shown in IDE');
   });