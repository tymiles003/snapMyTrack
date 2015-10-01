// 'Hallo Welt' Webserver
var getHandler = require('./lib/getHandler');
var postHandler = require('./lib/postHandler');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http');
var port = 3000;

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

var server = http.createServer(app).listen(port,'0.0.0.0');
console.log('Call the server via http://geotracker-js-131771.nitrousapp.com:' + port);