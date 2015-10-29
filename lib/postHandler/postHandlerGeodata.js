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
  registerHandlerGeodataPost: function(app){
    handleGeodataPost(app);
    console.log('handleGeodataPost registered');
  },
};


function handleGeodataPost(app){
  app.post('/geodata', function(req, res) {
    if(!req.body.geoDataMany){
        res.status(400).jsonp({
        error : 'Bad request, parameter "geoDataMany" undefined'
        });
        return;
    }
    console.log('userGeoPoints(Insert): ');
    console.log(req.body.geoDataMany);
    // add geo point to user data
    addGeoPointsDb(req.body.geoDataMany, req, res);
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
