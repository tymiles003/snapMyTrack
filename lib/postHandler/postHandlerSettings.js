// postHandlerSettings.js
// ======================

var mongodb = require('mongodb');
var dev_config;
try{
    dev_config = require('../../.dev_config/config.json');
}
catch(err){
    if(!process.env.OPENSHIFT_MONGODB_DB_URL){
      console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL AND ../../.dev_config/config.json not available');  // deactivate later
    }
}

module.exports = {
  registerHandlerUserSettingsPost: function(app){
    handleUserSettingsPost(app);
    console.log('handleUserSettingsPost registered');
  }
};

function handleUserSettingsPost(app){
    app.post('/usersettings', function(req, res) {
    // fill geo point
    var userSettings = {
        'accountType': req.body.accountType,
        'userId' : req.body.userId,
        'mapTypeId' : req.body.mapTypeId
    };
    console.log('userSettings: ');
    console.log(userSettings);
    // validate user settings
    if ((userSettings.accountType === undefined) || (userSettings.userId === undefined) || (userSettings.mapTypeId === undefined) ) {
      res.status(400).jsonp({
        error : 'Bad request, parameter(s) undefined'
      });
      return;
    }
    // add/update user settings
    addUserSettingsDb(userSettings, req, res);
    });
}

function addUserSettingsDb(userSettings, req, res){
    // created with assistance of http://blog.modulus.io/mongodb-tutorial
    var mongoClient= mongodb.MongoClient;
    var mongodb_db_url;

    // OPENSHIFT_MONGODB_DB_URL set via SSH (Chrome app 'Secure Shell'), see path .env/user_vars
    if(process.env.OPENSHIFT_MONGODB_DB_URL){
      mongodb_db_url=process.env.OPENSHIFT_MONGODB_DB_URL;
      console.log('mongodb Url (process.env.OPENSHIFT_MONGODB_DB_URL): ', process.env.OPENSHIFT_MONGODB_DB_URL);   // ToDo: May be deactivate later
    }
    else if(dev_config && dev_config.MONGODB_DB_URL){
      mongodb_db_url=dev_config.MONGODB_DB_URL;
      console.log('Post-Handler: mongodb Url (dev_config.MONGODB_DB_URL): ', dev_config.MONGODB_DB_URL);   // ToDo: May be deactivate later
    }
    else{
      console.log('Post-Handler: mongodbUrl process.env.OPENSHIFT_MONGODB_DB_URL not available');  // deactivate later
      return;
    }

    mongoClient.connect(mongodb_db_url, function (err, db) {
      if (err) {
        console.log('Unable to connect to mongolab-mongo --> ', err);
      }
      else {
        console.log('MongoDb "userSettings" available: ', mongodb_db_url);
        // userSettings
        //   - mapTypeId
        var query = {"userId":userSettings.userId,
                     "accountType":userSettings.accountType
        };
        console.log('query to read user settings: ', query);
        db.collection('userSettings').find(query).toArray( function (err, result) {
            if (err) {
              console.log('Reading user settings from Mongo DB collection "userSettings" has failed: '+err);
              db.close();
            }
            else {
                console.log('User settingDb: ',result);
                if(result && result.length>0){     // expected to be one or none
                    // settings for this user already exists
                    console.log(result);
                    updateUserSettingsDb( userSettings, db, res);
                }
                else{
                    // settings for do NOT exists
                    insertUserSettingsDb( userSettings, db , res);
                }
            }
        });
      }
    });
}

function insertUserSettingsDb( userSettings, db, res){
    var collUserSettings = db.collection('userSettings');
    collUserSettings.insert(
        [userSettings],
        function (err, result) {
          if (err) {
            console.log('Creating user settings to Mongo DB has failed: '+err);
            db.close();
          }
          else {
              console.log('User settings created in DB, collection "userSettings": info->'
                          + 'accountType: ' + userSettings.accountType + ', '
                          + 'userId: ' + userSettings.userId + ', '
                          + 'mapTypeId: ' + userSettings.mapTypeId );
              db.close();
              res.status(200).jsonp({
                 success : 'User settings created for collection "userSettings" (user Id: '+userSettings.userId+")",
                 userSettings: userSettings
              });
          }        
        }
    );
}

function updateUserSettingsDb( userSettings, db, res){
    db.collection('userSettings').updateOne(
      { "accountType": userSettings.accountType,
        "userId": userSettings.userId },
      { $set: { "mapTypeId": userSettings.mapTypeId } },
      function(err, results) {
          if (err) {
            console.log('Updating user settings to Mongo DB has failed: '+err);
            db.close();
          }
          else {
              console.log('User settings updated to DB, collection "userSettings": info->'
                          + 'accountType: ' + userSettings.accountType + ', '
                          + 'userId: ' + userSettings.userId + ', '
                          + 'mapTypeId: ' + userSettings.mapTypeId );
              db.close();
              res.status(200).jsonp({
                 success : 'User settings updated for collection "userSettings" (user Id: '+userSettings.userId+")",
                 userSettings: userSettings
              });
          }        
        }
    );
}
