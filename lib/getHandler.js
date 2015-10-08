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
        var userId = req.query.userId;
        if(!userId){
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
                  // delete all user userSettings
                db.collection('geoDataUser').deleteMany({userId:'Papi'});

                console.log('MongoDb "geotracker" available: ', mongodb_db_url);
                // userGeoPoint
                //   - latitude, longitude, userId, accurance, timestamp, speed
                var collGeoDataUser = db.collection('geoDataUser');
                /*                  if(!collGeoDataUser){
                // robustness -> read-call for user data before collection has been created  
                console.log('Collection "geoDataUser" does not yet exist, return initial object');
                res.status(200).jsonp({
                  success : "Collection 'geoDataUser' does not yet exist, thus returning initial object",
                  userSettings: {}
                });
                db.close();
                return;
                } */
                var query;
                if(userId==='allUsers'){
                query = {};
                }
                else{
                query = {"userId":userId};
                }
                console.log('query: ',query);
                
                collGeoDataUser.find(query).toArray( function (err, result) {
                    if (err) {
                      console.log('Reading geo-point data from Mongo DB collection "geoDataUser" has failed: '+err);
                      db.close();
                    }
                    else {
                //                            console.log(result);
                        res.status(200).jsonp({
                          success : "Geo points of user '" + userId + "'",
                          geoPoints: result
                        });
                        db.close();
                    }
                });
            }
        });
      }
    });
}

function handleUserSettingsGet(app){
    app.get('/usersettings', function(req, res) {
        // created with assistance of http://blog.modulus.io/mongodb-tutorial
        console.log('processing "/userSettings" on server');
        var userId = req.query.userId;
        if(!userId){
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
                console.log('MongoDb "geotracker" available: ', mongodb_db_url);
                // userSettings
                //   - mapTypeId
                var collUserSettings = db.collection('userSettings');
                /*                  if(!collUserSettings){
                // robustness -> read-call for user data before collection has been created  
                console.log('Collection "userSettings" does not yet exist, return initial object');
                res.status(200).jsonp({
                  success : "Collection 'userSettings' does not yet exist, thus returning initial object",
                  userSettings: {}
                });
                db.close();
                return;
                }   */
                var query;
                if(userId==='allUsers'){
                query = {};
                }
                else{
                query = {"userId":userId};
                }
                console.log('query: ',query);
                
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
