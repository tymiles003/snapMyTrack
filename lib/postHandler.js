// postHandler.js
// ==============
var is = require('type-is');

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
    })
};

function addGeoPointSqlite3(userGeoPoint, req, res){

    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('geoTracker');
//    var db = new sqlite3.Database(':memory:');

    db.serialize(function() {
      if(1===2){
        // reset geo data
        db.run('DELETE FROM geoDataUser');
        console.log('All records of table "geoDataUser" deleted');
        // reset users
        db.run('DELETE FROM appUser');
        console.log('All records of table "appUser" deleted');
        db.close();
        res.status(200).jsonp({
          success : 'Geo data resetted (including application users)',
          data: ''
        });
        return;
      }

      // create user db table (if needed)
      db.run('CREATE TABLE IF NOT EXISTS appUser (userId TEXT)');
      var stmt = db.prepare('INSERT INTO appUser VALUES (?)');
      stmt.run(userGeoPoint.userId);
      stmt.finalize();

      // create geo data db table (if needed)
      db.run('CREATE TABLE IF NOT EXISTS geoDataUser (latitude TEXT, longitude TEXT, userId TEXT, accurancy TEXT, timestamp TEXT, speed TEXT)');
      var stmt = db.prepare('INSERT INTO geoDataUser VALUES (?,?,?,?,?,?)');
      stmt.run(userGeoPoint.latitude, userGeoPoint.longitude, userGeoPoint.userId,
               userGeoPoint.accurance, userGeoPoint.timestamp, userGeoPoint.speed);
      stmt.finalize();

      db.each('SELECT latitude, longitude, userId, accurancy, timestamp, speed FROM geoDataUser ORDER BY timestamp', function(err, row) {
            console.log('Geo-Point from DB geoDataUser: info->'
                        + 'userId: ' + row.userId + ', '
                        + 'timestamp: ' + row.timestamp + ', '
                        + 'latitude: ' + row.latitude + ', '
                        + 'longitude: ' + row.longitude + ', '
                        + 'accurancy: ' + row.accurancy + ', '
                        + 'speed: ' + row.speed );
      });

      db.close();

      res.status(200).jsonp({
        success : 'Geo-point added to data base "geoDataUser"',
        geoPoints: userGeoPoint
      });
    });
};
