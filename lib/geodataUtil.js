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
    return Math.floor( (currentGeoPoint.timestamp - previousGeoPoint.timestamp) / 1000 );    // seconds
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