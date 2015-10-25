// getHandler.js
// ==============
var is = require('type-is');
var dev_config;
try{
    dev_config = require('../.dev_config/config.json');
}
catch(err){
    console.log('dev config catch');
    if(!process.env.OPENSHIFT_MONGODB_DB_URL){
      console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL AND ../.dev_config/config.json not available');  // deactivate later
    }
}

module.exports = {
  registerHandlerGeodataGet: function(app){
        handleGeodataGet(app);
        console.log('handleGeodataGet registered');
      },
  registerHandlerUserSettingsGet: function(app){
        handleUserSettingsGet(app);
        console.log('handleUserSettingsGet registered');
      }
};

function handleGeodataGet(app){
    app.get('/geodata', function(req, res) {
        // created with assistance of http://blog.modulus.io/mongodb-tutorial
        var query;
        var accountType = req.query.accountType;
        var userId = req.query.userId;
        var accessToken = req.query.accessToken;
        var userDisplayName;
        if( !userId || !accountType || accountType==="" ){
            if( !accessToken || accessToken!=="" || ( accessToken || accessToken.length === 0 )){
                res.status(400).jsonp({
                    error : 'AccountType or UserId missing'
                });
                return;
            }
        }
        else{
            var mongodb = require('mongodb');
            var mongoClient= mongodb.MongoClient;
            var mongodb_db_url;
    
            // OPENSHIFT_MONGODB_DB_URL set via SSH (Chrome app 'Secure Shell'), see path .env/user_vars
            if(process.env.OPENSHIFT_MONGODB_DB_URL){
                mongodb_db_url=process.env.OPENSHIFT_MONGODB_DB_URL;
                console.log('mongodb Url (process.env.OPENSHIFT_MONGODB_DB_URL): ', process.env.OPENSHIFT_MONGODB_DB_URL);   // ToDo: May be deactivate later
            }
            else if(dev_config && dev_config.MONGODB_DB_URL){
                mongodb_db_url=dev_config.MONGODB_DB_URL;
                console.log('Get-Handler: mongodb Url (dev_config.MONGODB_DB_URL): ', dev_config.MONGODB_DB_URL);   // ToDo: May be deactivate later
            }
            else{
                console.log('Get-Handler: mongodbUrl process.env.OPENSHIFT_MONGODB_DB_URL not available');  // deactivate later
                return;
            }
        
            mongoClient.connect(mongodb_db_url, function (err, db) {
                if (err) {
                    console.log('Unable to connect to mongolab-mongo --> ', err);
                }
                else {
                    console.log('MongoDb "snaptrack" available: ', mongodb_db_url);
                    if(accessToken !== "undefined"){
                        query = {'accessTokenUnregisteredUser': accessToken};
                        console.log('Read publish data -> query: ',query);
                        db.collection('publishForUser').find(query).toArray( function (err, result) {
                            if (err) {
                                console.log("Reading publish data from collection 'publishForUser' has failed: "+err);
                                db.close();
                            }
                            else {
                                if(result && result.length>0){     // expected to be one or none
                                    // access token exists
                                    publishData = result[0];
                                    console.log(result);
                                    console.log('access token ' + accessToken + ' exists');
                                    // check if access token has expired
                                    if(publishData.publishEndTimestamp > new Date()){
                                        getGeoDataOfUserByDate(db, res, publishData.publisherUserId, publishData.publisherDisplayName, publishData.publishStartTimestamp, null);
                                    }
                                    else{
                                        res.status(400).jsonp({
                                            error : 'Access token ' + accessToken + ' has expired',
                                            data: { 'accountType': accountType,
                                                    'accessToken': accessToken }
                                        });
                                        return;
                                    }
                                }
                                else{
                                    // access token does exist
                                    console.log('access token ' + accessToken + ' does not exist');
                                    res.status(400).jsonp({
                                        error : 'Access token ' + accessToken + ' does not exist',
                                        data: { 'accountType': accountType,
                                                'accessToken': accessToken }
                                    });
                                    return;
                                }
                            }
                        });
                    }
                    else{
                        query = {'accountType': accountType,
                                 'userId': userId};
                        console.log('Read user -> query: ',query);
                        db.collection('appUser').find(query).toArray( function (err, result) {
                            if (err) {
                                console.log("Reading app user from collection 'appUser' has failed: "+err);
                                db.close();
                            }
                            else {
                                getGeoDataOfUserByDate(db, res, userId, result[0].displayName, null, null)
                            }
                        });
                    }
                }
            });
        }
    });
}

function getGeoDataOfUserByDate(db, res, userId, displayName,timestampFrom,timestampTo){
    // userGeoPoint
    //  - latitude, longitude, userId, accurance, timestamp, speed
//    var query = {"userId":userId};
    var query = {};
    console.log('Reading geo-data of user '+displayName+' ('+userId+')');
    console.log('query (geo-data of user): ',query);
    db.collection('geoDataUser').find(query).toArray( function (err, result) {
        if (err) {
          console.log('Reading geo-point data from Mongo DB collection "geoDataUser" has failed: '+err);
          db.close();
        }
        else {
            for(var i=0,len=result.length;i<len;i++){
                if(displayName){
                    result[i].displayName=displayName;
                }
                else{
                    result[i].displayName=result[i].userId;
                }
            }
            if(displayName){
                responseText = "Geo points of user '" + displayName + "'";
            }
            else{
                responseText = "Geo points of user '" + userId + "'";
            }
            res.status(200).jsonp({
              success : responseText,
              geoPoints: result
            });
            db.close();
        }
    });
}

function handleUserSettingsGet(app){
    app.get('/usersettings', function(req, res) {
        // created with assistance of http://blog.modulus.io/mongodb-tutorial
        console.log('processing "/userSettings" on server');
        var accountType = req.query.accountType;
        var userId = req.query.userId;
        if(!userId || !accountType){
          res.status(400).jsonp({
            error : 'UserId missing'
          });
          return;
        }
        else{
          var mongodb = require('mongodb');
          var mongoClient= mongodb.MongoClient;
          var mongodb_db_url;
    
        // OPENSHIFT_MONGODB_DB_URL set via SSH (Chrome app 'Secure Shell'), see path .env/user_vars
        if(process.env.OPENSHIFT_MONGODB_DB_URL){
          mongodb_db_url=process.env.OPENSHIFT_MONGODB_DB_URL;
          console.log('mongodb Url (process.env.OPENSHIFT_MONGODB_DB_URL): ', process.env.OPENSHIFT_MONGODB_DB_URL);   // ToDo: May be deactivate later
        }
        else if(dev_config && dev_config.MONGODB_DB_URL){
          mongodb_db_url=dev_config.MONGODB_DB_URL;
          console.log('Get-Handler: mongodb Url (dev_config.MONGODB_DB_URL): ', dev_config.MONGODB_DB_URL);   // ToDo: May be deactivate later
        }
        else{
          console.log('Get-Handler: mongodbUrl process.env.OPENSHIFT_MONGODB_DB_URL not available');  // deactivate later
          return;
        }
    
        mongoClient.connect(mongodb_db_url, function (err, db) {
            if (err) {
                  console.log('Unable to connect to mongolab-mongo --> ', err);
            }
            else {
                console.log('MongoDb "snaptrack" available: ', mongodb_db_url);
                // userSettings
                //   - mapTypeId
                var collUserSettings = db.collection('userSettings');
                var query = {"accountType":accountType,
                             "userId":userId};
                console.log('query (read user settings): ',query);
                collUserSettings.find(query).toArray( function (err, result) {
                    if (err) {
                      console.log('Reading user settings from Mongo DB collection "userSettings" has failed: '+err);
                      db.close();
                    }
                    else {
                        console.log(result);
                        res.status(200).jsonp({
                          success : "User settings of user '" + userId + "'",
                          userSettings: result
                        });
                        db.close();
                    }
                });
            }
        });
      }
    });
}
