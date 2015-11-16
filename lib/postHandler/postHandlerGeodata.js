// postHandlerGeodata.js
// =====================

var mongodb = require('mongodb');
var serverUtil = require('../serverUtil');
var mailService = require('../mailService');
var is = require('type-is');
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
  registerHandlerGeodataAddPost: function(app){
    handleGeodataAddPost(app);
    console.log('handleGeodataAddPost registered');
  },
  registerHandlerGeodataRemovePost: function(app){
    handleGeodataRemovePost(app);
    console.log('handleGeodataRemovePost registered');
  },
};


function handleGeodataAddPost(app){
  app.post('/geodataAdd', function(req, res) {
/*    console.log('post: Type of accuracy: '+typeof(req.body.geoDataMany[0].accuracy));
    console.log('post: Type of timestamp: '+typeof(req.body.geoDataMany[0].timestamp));
    console.log('post: Type of latitude: '+typeof(req.body.geoDataMany[0].latitude));  */
    if(!req.body.geoDataMany){
        res.status(400).jsonp({
        error : 'Bad request, parameter "geoDataMany" undefined'
        });
        return;
    }
    else{
        // convert data format
        for(var i=0, len=req.body.geoDataMany.length;i<len;i++){
            req.body.geoDataMany[i].timestamp=Number(req.body.geoDataMany[i].timestamp);
            req.body.geoDataMany[i].latitude=Number(req.body.geoDataMany[i].latitude);
            req.body.geoDataMany[i].longitude=Number(req.body.geoDataMany[i].longitude);
            req.body.geoDataMany[i].accuracy=Number(req.body.geoDataMany[i].accuracy);
        }
    }
    console.log('userGeoPoints(Insert): ');
    console.log(req.body.geoDataMany);
    // add geo point to user data
    addGeoPointsDb(req.body.geoDataMany, req, res);
  });
}

function handleGeodataRemovePost(app){
  app.post('/geodataRemove', function(req, res) {
    if(!req.body.geoDataTimestamp || !req.body.userId || !req.body.displayName){
        res.status(400).jsonp({
        error : 'Bad request, parameter "req.body.geoDataTimestamp, userId, displayName" undefined'
        });
        return;
    }
    console.log('geoDataTimestamp -> Number of geo points for delete:');
    console.log(req.body.geoDataTimestamp.length);
    // add geo point to user data
    for(var i=0, len=req.body.geoDataTimestamp.length;i<len;i++){
        req.body.geoDataTimestamp[i] = Number(req.body.geoDataTimestamp[i]);
    }
    removeGeoPointsDb(req.body.geoDataTimestamp, req.body.userId, req.body.displayName, req, res);
  });
}

function addGeoPointsDb(geoDataMany, req, res){
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
        console.log('MongoDb "snaptrack" available: ', mongodb_db_url);
        // geo point
        //   - latitude, longitude, userId, accurance, timestamp, speed
        db.collection('geoDataUser').insert(geoDataMany, function (err, result) {
            if (err) {
                console.log('Insert of '+geoDataMany.length+' geo-point(s) to Mongo DB has failed: '+err);
            }
            else {
                console.log(geoDataMany.length+' geo-point(s) added to data base collection "geoDataUser"');
                res.status(200).jsonp({
                    success : geoDataMany.length+' geo-point(s) added to data base collection "geoDataUser"',
                    geoPoints: geoDataMany
              });
            }        
            db.close();
        });
      }
    });
}

function removeGeoPointsDb(timestampList, userId, displayName, req, res){
    // created with assistance of http://blog.modulus.io/mongodb-tutorial
    var mongoClient= mongodb.MongoClient;
    var mongodb_db_url;

    if(timestampList && timestampList.length===0){
        res.status(200).jsonp({
            success : '"timestampList" is empty, no geo-point(s) of user ' + displayName + ' got removed from data base collection "geoDataUser"',
            userId: userId,
            displayName: displayName,
            geoPoints: timestampList
        });
        return;
    }

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
        console.log('MongoDb "snaptrack" available: ', mongodb_db_url);
        db.collection('geoDataUser').remove({'userId':userId, 'timestamp':{'$in':timestampList}}, function (err, result) {
            if (err) {
                console.log('Deletion of '+timestampList.length+' geo-point(s) from Mongo DB collection "geoDataUser" has failed: '+err);
            }
            else {
                console.log(timestampList.length+' geo-point(s) of user ' + displayName + ' removed from data base collection "geoDataUser"');
                res.status(200).jsonp({
                    success : timestampList.length+' geo-point(s) of user ' + displayName + ' removed from data base collection "geoDataUser"',
                    userId: userId,
                    displayName: displayName,
                    geoPoints: timestampList
                });
            }        
            db.close();
        });
      }
    });
}
