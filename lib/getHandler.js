// postHandler.js
// ==============
var is = require('type-is');

module.exports = {
  registerHandlerGeodataGet: function(app){
    handleGeodataGet(app);
  }
};

function handleGeodataGet(app){
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