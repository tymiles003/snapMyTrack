// Webserver for app 'snapMyTrack'
var dev_config;
try{
    dev_config = require('./.dev_config/config.json');
}
catch(err){
    if(!process.env.OPENSHIFT_MONGODB_DB_URL){
        console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL AND ./.dev_config/config.json not available');  // deactivate later
    }
}
var getHandler = require('./lib/getHandler');
var postHandlerSignIn = require('./lib/postHandler/postHandlerSignIn');
var postHandlerSettings = require('./lib/postHandler/postHandlerSettings');
var postHandlerGeodata = require('./lib/postHandler/postHandlerGeodata');
var postHandlerPublish = require('./lib/postHandler/postHandlerPublish');
// var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var router = express.Router([]);
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0';
// var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8081;   // def: 8081->Codenvy, 3000->Nitrous
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;   // def: 8081->Codenvy, 3000->Nitrous
var mongodb_db_url;

// router
// - '/userAccountConfirm' -> '/public/userAccountConfirm/index.html'
router.get('/accountConfirm', function(req, res){
    res.status(200).sendFile(__dirname + '/private/userAccount/accountConfirmed.html');
});
router.get('/passwordReset', function(req, res){
    res.status(200).sendFile(__dirname + '/private/userAccount/setNewPassword.html');
});

app.set('ip', ipaddress);
app.set('port', port);
app.use('/', express.static(__dirname));
app.use('/public', express.static(__dirname));
app.use('/account', router);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//console.log('register GET handlers');
getHandler.registerHandlerUserSettingsGet(app);
getHandler.registerHandlerGeodataGet(app);
app.get('/*', function(req, res) {
    res.status(404).sendFile(__dirname + '/error.html');
});
//console.log('register POST handlers');
// sign in
postHandlerSignIn.registerHandlerSignInPost(app);
// confirm new account
postHandlerSignIn.registerHandlerConfirmAccountPost(app);
// request new password
postHandlerSignIn.registerHandlerRequestPasswordResetPost(app);
// set new password
postHandlerSignIn.registerHandlerUserUpdatePasswordPost(app);
// update public data (user display name, picture url)
postHandlerSignIn.registerHandlerUserUpdatePublicDataPost(app);
// update user settings
postHandlerSettings.registerHandlerUserSettingsPost(app);
// add new geo data to DB (recording of track)
postHandlerGeodata.registerHandlerGeodataPost(app);
// publish/snap tracks
postHandlerPublish.registerHandlerPublishPost(app);

console.log('ip:'+ipaddress);
console.log('port:'+port);

// OPENSHIFT_MONGODB_DB_URL set via SSH (Chrome app 'Secure Shell'), see path .env/user_vars
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_db_url=process.env.OPENSHIFT_MONGODB_DB_URL;
  console.log('mongodb Url (process.env.OPENSHIFT_MONGODB_DB_URL): ', process.env.OPENSHIFT_MONGODB_DB_URL);   // ToDo: May be deactivate later
}
else if(dev_config && dev_config.MONGODB_DB_URL){
  mongodb_db_url=dev_config.MONGODB_DB_URL;
  console.log('mongodb Url (dev_config.MONGODB_DB_URL): ', dev_config.MONGODB_DB_URL);   // ToDo: May be deactivate later
}
else{
  console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL not available');  // deactivate later
  return;
}

// use host '0.0.0.0' to connect from any host
/*var server = http.createServer(app).listen(app.get('port'), app.get('ip'), function() {
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port)
        console.log('i.e. http://geotracker-js-131771.nitrousapp.com:'+server.address().port)
	});*/

var server = app.listen(port,ipaddress, function(){
        console.log('Latest official deployment: Openshift: http://geotracker-dsignmatters.rhcloud.com/');
        console.log('-----');
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. Koding:    http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port);
        console.log('i.e. Nitrous:   http://geotracker-js-131771.nitrousapp.com:'+server.address().port);
        console.log('i.e. Codenvy:   -> for Codenvy see test URL shown in IDE');
   });
