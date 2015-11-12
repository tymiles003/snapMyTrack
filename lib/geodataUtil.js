// geodataUtil.js
// ==============

module.exports = {
    isTrackEnd: function(previousGeoPoint, currentGeoPoint){
        return isTrackEnd(previousGeoPoint, currentGeoPoint);
    },
    getDistanceFromLatLonInKm: function(currentGeoPoint, previousGeoPoint){
        return getDistanceFromLatLonInKm(currentGeoPoint, previousGeoPoint);
    },
    pointTimestampDiffInSeconds: function(currentGeoPoint, previousGeoPoint){
        return pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint);
    },
    improveGeopointQuality: function(db){
        improveGeopointQuality(db);
    }
};



function getDistanceFromLatLonInKm(currentGeoPoint, previousGeoPoint) {
    // Haversine formula -> see http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula 
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(currentGeoPoint.latitude-previousGeoPoint.latitude);  // deg2rad below
    var dLon = deg2rad(currentGeoPoint.longitude-previousGeoPoint.longitude);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(previousGeoPoint.latitude)) * Math.cos(deg2rad(currentGeoPoint.latitude)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint){
    return Math.abs( Math.floor( (currentGeoPoint.timestamp - previousGeoPoint.timestamp) / 1000 ) );    // seconds
}

function isTrackEnd(previousGeoPoint, currentGeoPoint){
    var trackEnd;
    if( !previousGeoPoint ){
        return trackEnd;   // first point
    }

    if( previousGeoPoint.userId !== currentGeoPoint.userId ){
        trackEnd=true;   // different user
    }
    else if ( getDistanceFromLatLonInKm(currentGeoPoint, previousGeoPoint) > 3 
        && pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint) < 60){
            trackEnd=true;   // timestamp difference more than one hour (and location different)
    }
    else if ( pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint) > 60 ){
        trackEnd=true;   // timestamp difference more than one hours
    }
    else if ( pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint) > 60*60 ){
        trackEnd=true;   // timestamp difference more than one hours
    }
    return trackEnd;
}

/* function improveGeopointQuality(db){
    console.log('remove geo point of accuracy > 250m');
    db.collection('geoDataUser').count( function(err, count) {
        if(err){
            console.log(err);
        }
        else{
            console.log('lines before: ',count);
        }
    }); */

    // migrate data types of collection 'geoDataUser'
/*    db.collection('geoDataUser').find().toArray( function (err, result) {
        if (err) {
            console.log("Reading all records of collection 'geoDataUser' has failed: "+err);
        }
        else {
            // convert data format
            for(var i=0, len=result.length;i<len;i++){
                result[i].timestamp=Number(result[i].timestamp);
                result[i].latitude=Number(result[i].latitude);
                result[i].longitude=Number(result[i].longitude);
                result[i].accuracy=Number(result[i].accuracy);
            }
            // delete DB (all records)
            db.collection('geoDataUser').drop();
            // update DB
            db.collection('geoDataUser').insert(result, function (err, result2) {
                if (err) {
                    console.log('Migration of '+result2.length+' geo-point(s) on Mongo DB has failed: '+err);
                }
                else {
                    console.log(result2.length+' geo-point(s) migrated (data base collection "geoDataUser")');
                }        
            });
        }
    });  */

    // remove geopoints which lie outside a 250m circle (at a 95% confidence level)
//    db.collection('geoDataUser').remove( { $query: {accuracy: { $gt: 250 } } } );
    db.collection('geoDataUser').remove({ accuracy: { $gt: 250 } });
    db.collection('geoDataUser').count( function(err, count) {
        if(err){
            console.log(err);
        }
        else{
            console.log('lines afterwards: ',count);
        }
    });
}