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
    addGeoPoint(userGeoPoint, req, res);
  });
}

function addGeoPoint(userGeoPoint, req, res){

    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('geoTracker');
//    var db = new sqlite3.Database(':memory:');

    db.serialize(function() {
      if(1===2){
        // reset geo data
        db.run('DELETE FROM geoDataUser');
        console.log('All records of table "geoDataUser" deleted');
        // reset users
        db.run('DELETE FROM user');
        console.log('All records of table "user" deleted');
        db.close();
        res.status(200).jsonp({
          success : 'Geo data resetted (including users)',
          data: ''
        });
        return;
      }

      // create user db table (if needed)
      db.run('CREATE TABLE IF NOT EXISTS user (userId TEXT)');
      var stmt = db.prepare('INSERT INTO user VALUES (?)');
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
