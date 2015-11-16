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
var routerPublic = require('./public/routerPublic');
var routerAccount = require('./private/userAccount/routerAccount');
var getHandler = require('./lib/getHandler');
var postHandlerSignIn = require('./lib/postHandler/postHandlerSignIn');
var postHandlerSettings = require('./lib/postHandler/postHandlerSettings');
var postHandlerGeodata = require('./lib/postHandler/postHandlerGeodata');
var postHandlerPublish = require('./lib/postHandler/postHandlerPublish');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '0.0.0.0';
// var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8081;   // def: 8081->Codenvy, 3000->Nitrous
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;   // def: 8081->Codenvy, 3000->Nitrous
var mongodb_db_url;

app.set('ip', ipaddress);
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// routing
app.get('/', express.static(__dirname));   // the home page
app.use('/public', routerPublic);
app.use('/account', routerAccount);

// GET handler --> ToDo, delegate via express.router
getHandler.registerHandlerUserSettingsGet(app);
getHandler.registerHandlerGeodataGet(app);
app.get('/', function(req, res) {
    res.status(404).sendFile(__dirname + '/error.html');
});

// POST handler --> ToDo, delegate via express.router
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
// remove account
postHandlerSignIn.registerHandlerRemoveAccountPost(app);
// update user settings
postHandlerSettings.registerHandlerUserSettingsPost(app);
// add new geo data to DB (recording of track)
postHandlerGeodata.registerHandlerGeodataAddPost(app);
// remove geo data to DB (recording of track)
postHandlerGeodata.registerHandlerGeodataRemovePost(app);
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

var server = app.listen(port,ipaddress, function(){
        console.log('Latest official deployment: Openshift: http://geotracker-dsignmatters.rhcloud.com/');
        console.log('-----');
        console.log('Listening on port %d', server.address().port);
        console.log('i.e. Koding:    http://umkk1a021936.michaelbiermann.koding.io:'+server.address().port);
        console.log('i.e. Nitrous:   http://geotracker-js-131771.nitrousapp.com:'+server.address().port);
        console.log('i.e. Codenvy:   -> for Codenvy see test URL shown in IDE');
   });
