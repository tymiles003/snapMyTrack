// 'Hallo Welt' Webserver
var express = require('express');
var app = express();
var http = require('http');
var port = 3000;

app.use('/', express.static(__dirname));
app.use('/js', express.static(__dirname));
app.use('/css', express.static(__dirname));
app.get('/*', function(req, res) {
    res.status(404).sendFile(__dirname + '/error.html');
});

var server = http.createServer(app).listen(port,'0.0.0.0');
console.log('Call the server via http://0.0.0.0:' + port + '/');