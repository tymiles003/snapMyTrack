// postHandler.js
// ==============
var is = require('type-is');

module.exports = {
  registerHandlerGeodataGet: function(app){
    handleGeodataGetMongoDb(app);
  }
};

function handleGeodataGetMongoDb(app){
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
      var mongoUrl = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://<user>:<password>@ds029804.mongolab.com:29804/geotracker';
      mongoClient.connect(mongoUrl, function (err, db) {
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
          var query;
      	 if(userId==='allUsers'){
          	query = {};
      	 }
      	 else{
         	query = {"userId":userId};
      	 }
		    console.log('query:'+query);

          collGeoDataUser.find(query).toArray( function (err, result) {
            if (err) {
              console.log('Adding geo-point to Mongo DB has failed: '+err);
              db.close();
            }
            else {
                console.log(result);
                res.status(200).jsonp({
                  success : "Geo points of user '" + userId + "'",
                  geoPoints: result
                });
                db.close();
            }
          });
        }
      })
    }
  })
};

function handleGeodataGetSqlite3(app){
  app.get('/geodata', function(req, res) {
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('geoTracker');
    var userId = req.query.userId;
    var userGeoPoints=[];

    if(!userId){
      res.status(400).jsonp({
        error : 'UserId missing'
      });
      return;
    }
    else{
      console.log(userId);
      var statement='';
      if(userId==='allUsers'){
        statement = "SELECT latitude, longitude, userId, accurancy, timestamp, speed FROM geoDataUser";
      }
      else{
        statement = "SELECT latitude, longitude, userId, accurancy, timestamp, speed FROM geoDataUser WHERE userId='"+userId+"'";
      }
      db.serialize(function() {
          console.log('SQL statement: '+statement);
          db.each(statement, function(err, row) {
             userGeoPoints.push({ userId: row.userId,
                                  timestamp: row.timestamp,
                                  latitude: row.latitude,
                                  longitude: row.longitude,
                                  accurancy: row.accurancy,
                                  speed: row.speed
                            });
          }, function( ){
//            console.log('db finalize');
            console.log(userGeoPoints);
            res.status(200).jsonp({
              success : "Geo points of user '" + userId + "'",
              geoPoints: userGeoPoints
            });
            db.close();
          });
        }
     );
   }
  });
}