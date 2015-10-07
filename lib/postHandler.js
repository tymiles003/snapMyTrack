// postHandler.js
// ==============
var is = require('type-is');
var dev_config;
try{
    dev_config = require('../.dev_config/config.json');
}
catch(err){
    if(!process.env.OPENSHIFT_MONGODB_DB_URL){
      console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL AND ./.dev_config/config.json not available');  // deactivate later
    }
}

module.exports = {
  registerHandlerGeodataPost: function(app){
    handleGeodataPost(app);
  }
};

function handleGeodataPost(app){
  app.post('/geodata', function(req, res) {
    // fill geo point
    var userGeoPoint = {
      'userId' : req.body.userId,
      'latitude' : req.body.latitude,
      'longitude' : req.body.longitude,
      'timestamp' : req.body.timestamp,
      'accuracy' : req.body.accuracy,
      'speed' : req.body.speed
    };
    console.log('userGeoPoint: ');
    console.log(userGeoPoint);
    // validate geo point
    if ((userGeoPoint.userId === undefined) || (userGeoPoint.latitude === undefined)
        || (userGeoPoint.longitude === undefined) || (userGeoPoint.timestamp === undefined)
        || (userGeoPoint.accuracy === undefined ) || (userGeoPoint.speed === undefined ) ) {
      res.status(400).jsonp({
        error : 'Bad request, parameter(s) undefined'
      });
      return;
    }
    // add geo point to user data
    addGeoPointMongoDb(userGeoPoint, req, res);
//    addGeoPointSqlite3(userGeoPoint, req, res);
  });
}

function addGeoPointMongoDb(userGeoPoint, req, res){
    // created with assistance of http://blog.modulus.io/mongodb-tutorial
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
        console.log('MongoDb "geotracker" available: ', mongoUrl);
        // userGeoPoint
        //   latitude, longitude, userId, accurance, timestamp, speed
//        var collAppUser = db.collection('appUser');
//        not yet in use
        var collGeoDataUser = db.collection('geoDataUser');
        collGeoDataUser.insert([userGeoPoint], function (err, result) {
          if (err) {
            console.log('Adding geo-point to Mongo DB has failed: '+err);
            db.close();
          }
          else {
              console.log('Geo-Point added to DB geoDataUser: info->'
                          + 'userId: ' + userGeoPoint.userId + ', '
                          + 'timestamp: ' + userGeoPoint.timestamp + ', '
                          + 'latitude: ' + userGeoPoint.latitude + ', '
                          + 'longitude: ' + userGeoPoint.longitude + ', '
                          + 'accurancy: ' + userGeoPoint.accurancy + ', '
                          + 'speed: ' + userGeoPoint.speed );
              db.close();
              res.status(200).jsonp({
                 success : 'Geo-point added to data base "geoDataUser"',
                 geoPoints: userGeoPoint
              });
          }        
        });
      }
    });
}