// getHandler.js
// ==============
var geoDataUtil = require('./geodataUtil');
var is = require('type-is');
var dev_config;
try{
    dev_config = require('../.dev_config/config.json');
}
catch(err){
    console.log('dev config catch');
    if(!process.env.OPENSHIFT_MONGODB_DB_URL){
      console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL AND ../.dev_config/config.json not available');  // deactivate later
    }
}

module.exports = {
  registerHandlerGeodataGet: function(app){
        handleGeodataGet(app);
        console.log('handleGeodataGet registered');
      },
  registerHandlerUserSettingsGet: function(app){
        handleUserSettingsGet(app);
        console.log('handleUserSettingsGet registered');
      }
};

function handleGeodataGet(app){
    app.get('/geodata', function(req, res) {
        // created with assistance of http://blog.modulus.io/mongodb-tutorial
        var query;
        var accountType = req.query.accountType;
        var userId = req.query.userId;
        var accessToken = req.query.accessToken;
        var tracksToShow = req.query.tracksToShow;
        var userDisplayName;
        if( !userId || !accountType || accountType==="" ){
            if( !accessToken || accessToken!=="" || ( accessToken || accessToken.length === 0 )){
                res.status(400).jsonp({
                    error : 'AccountType or UserId missing'
                });
                return;
            }
        }
        else{
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
                    console.log('MongoDb "snaptrack" available: ', mongodb_db_url);
                    // improve quality of geo points
                    // geoDataUtil.improveGeopointQuality(db);
                    // select geo points
                    if(accessToken !== "undefined"){
                        query = {'accessTokenUnregisteredUser': accessToken};
                        console.log('Read publish data -> query: ',query);
                        db.collection('publishForUser').find(query).toArray( function (err, result) {
                            if (err) {
                                console.log("Reading publish data from collection 'publishForUser' has failed: "+err);
                                db.close();
                            }
                            else {
                                if(result && result.length>0){     // expected to be one or none
                                    // access token exists
                                    publishData = result[0];
                                    console.log(result);
                                    console.log('access token ' + accessToken + ' exists');
                                    // check if access token has expired
                                    if(publishData.publishEndTimestamp > new Date()){
                                        getGeoDataOfUserByDate(db, res, publishData.publisherAccountType, publishData.publisherUserId, publishData.publisherDisplayName, publishData.publishStartTimestamp, null, tracksToShow);
                                    }
                                    else{
                                        res.status(400).jsonp({
                                            error : 'Access token ' + accessToken + ' has expired',
                                            data: { 'accountType': accountType,
                                                    'accessToken': accessToken }
                                        });
                                        return;
                                    }
                                }
                                else{
                                    // access token does exist
                                    console.log('access token ' + accessToken + ' does not exist');
                                    res.status(400).jsonp({
                                        error : 'Access token ' + accessToken + ' does not exist',
                                        data: { 'accountType': accountType,
                                                'accessToken': accessToken }
                                    });
                                    return;
                                }
                            }
                        });
                    }
                    else{
                        query = {'accountType': accountType,
                                 'userId': userId};
                        console.log('Read user -> query: ',query);
                        db.collection('appUser').find(query).toArray( function (err, result) {
                            if (err) {
                                console.log("Reading app user from collection 'appUser' has failed: "+err);
                                db.close();
                            }
                            else {
                                getGeoDataOfUserByDate(db, res, accountType, userId, result[0].displayName, null, null, tracksToShow);
                            }
                        });
                    }
                }
            });
        }
    });
}

function getGeoDataOfUserByDate(db, res, accountType, userId, displayName, timestampFrom, timestampTo, tracksToShow){
    // userGeoPoint
    //  - latitude, longitude, userId, accurance, timestamp, speed
    var fromTimestampQuery;
    var toTimestampQuery;
    if(tracksToShow === 'unlimited'){
        // no from/to time stamp
    }
    else if (tracksToShow === 'oneMonth'){
        fromTimestampQuery = new Date();
        fromTimestampQuery.setDate(fromTimestampQuery.getDate() - 30);
    }
    else if (tracksToShow === 'oneWeek'){
        fromTimestampQuery = new Date();
        fromTimestampQuery.setDate(fromTimestampQuery.getDate() - 7);
    }
    else if (tracksToShow === 'oneDay'){
        fromTimestampQuery = new Date();
        fromTimestampQuery.setDate(fromTimestampQuery.getDate() - 1);
    }
    else if (tracksToShow === 'oneHour'){
        fromTimestampQuery = new Date();
        fromTimestampQuery.setDate(fromTimestampQuery.getTime() - 60*60);
    }
    else if (tracksToShow === 'latestTrack'){
        // read all tracks and throw away all but the latest afterwards (ToDo, try to improve architecture) 
    }
    else if (tracksToShow === 'currentLocation'){
        // read all tracks and throw away all but the latest geo point (ToDo, try to improve architecture) 
    }
    
    // make sure the provices from/to toimestamps are taken into accout    
    if(timestampFrom && fromTimestampQuery){
        if(timestampFrom < fromTimestampQuery){
            fromTimestampQuery = timestampFrom;
        }
    }
    
    if(timestampTo && toTimestampQuery){
        if(timestampTo > toTimestampQuery){
            toTimestampQuery = timestampTo;
        }
    }
    
    var query = {userId: userId
    };
    if(fromTimestampQuery && toTimestampQuery){
        query.$and = [ { timestamp: { $gte: fromTimestampQuery.getTime() } },
                        { timestamp: { $lte: toTimestampQuery.getTime() } } ];   
    }
    else if(fromTimestampQuery){
        query.timestamp = { $gt: fromTimestampQuery.getTime() };   
    }
    else if(toTimestampQuery){
        query.timestamp = { $lt: toTimestampQuery.getTime() };   
    }
    var findRequest = { $query: query,
                        $orderby: { timestamp : -1 } };  // descending
    console.log('Reading geo-data of user '+displayName+' ('+userId+' / '+accountType+')');
    console.log('query (geo-data of user): ', findRequest);
    db.collection('geoDataUser').find(findRequest).toArray( function (err, result) {
        if (err) {
          res.status(400).jsonp({
            error : 'Reading geo-point data from Mongo DB collection "geoDataUser" has failed',
            data: err
          });
          console.log('Reading geo-point data from Mongo DB collection "geoDataUser" has failed: ' + err);
          db.close();
          return;
        }
        else {
            var geoPoints=[];
            var previousGeoPoint;
            var trackNumber=0;
            for(var i=0,len_i=result.length;i<len_i;i++){
                if(displayName){
                    result[i].displayName=displayName;
                }
                else{
                    result[i].displayName=result[i].userId;
                }
                // provide latest geo-point only
                if(tracksToShow === 'latestLocation'){
                    geoPoints.push(result[i]);   // i=0
                    break;
                }
                // provide latest track only
                if( geoDataUtil.isTrackEnd(previousGeoPoint, result[i]) ){
                    if(tracksToShow === 'latestTrack'){
                        break;
                    }
                    else{
                        trackNumber+=1;
                    }
                }
                result[i].trackNumber=trackNumber;
                geoPoints.push(result[i]);
                previousGeoPoint=result[i];
            }

            // add track info 
            addTrackInfo(geoPoints, res, db, userId, displayName);            
        }
    });
 }

function handleUserSettingsGet(app){
    app.get('/usersettings', function(req, res) {
        // created with assistance of http://blog.modulus.io/mongodb-tutorial
        console.log('processing "/userSettings" on server');
        var accountType = req.query.accountType;
        var userId = req.query.userId;
        if(!userId || !accountType){
            res.status(400).jsonp({
                error : 'UserId missing'
            });
            return;
        }
        else{
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
                res.status(400).jsonp({
                    error : 'Unable to connect to mongolab-mongo'
                });
                db.close();
                return;
            }
            else {
                console.log('MongoDb "snaptrack" available: ', mongodb_db_url);
                // userSettings
                //   - mapTypeId
                var collUserSettings = db.collection('userSettings');
                var query = {"accountType": accountType,
                             "userId": userId};
                console.log('query (read user settings): ',query);
                collUserSettings.find(query).toArray( function (err, result) {
                    if (err) {
                        res.status(400).jsonp({
                            error : 'Reading user settings from Mongo DB collection "userSettings" has failed'
                        });
                        console.log('Reading user settings from Mongo DB collection "userSettings" has failed: '+err);
                        db.close();
                        return;
                    }
                    else {
                        console.log(result);
                        res.status(200).jsonp({
                          success : "User settings of user '" + userId + "'",
                          userSettings: result
                        });
                        db.close();
                    }
                });
            }
        });
      }
    });
}

function addTrackInfo(geoPoints, res, db, userId, displayName){
    var responseText;
    var appUser=[];
    var trackInfo={ appUser: [] };
    if(displayName){
        responseText = geoPoints.length + " geo points for user '" + displayName + "' retrieved (total #:" + geoPoints.length + ")";
    }
    else{
        responseText = geoPoints.length + " geo points for user '" + userId  + "' retrieved (total #:" + geoPoints.length + ")";
    }
    console.log(responseText);

    // get user Id grom geo points
    for(var i=0, len_i=geoPoints.length; i<len_i; i++){
        var userIsNew=true;
        for(var j=0, len_j=appUser.length; j<len_j; j++){
            if(appUser[j] === geoPoints[i].userId){
                userIsNew=false;
                break;
            }
        }
        if(userIsNew){
            appUser.push(geoPoints[i].userId);
        }
    }

    // get user details
    var query = {'userId': { $in:appUser }};
    console.log('Read user -> query: ',query);
    db.collection('appUser').find(query).toArray( function (err, result) {
        if (err) {
            console.log("Reading app user from collection 'appUser' has failed: "+err);
            db.close();
        }
        else {
//            console.log('App user data retrieved: ',result);
            for(var i=0, len_i=result.length; i<len_i; i++){
                trackInfo.appUser.push({ 
                    accountType: result[i].accountType,
                    userId: result[i].userId,
                    displayName: result[i].displayName,
                    pictureUrl: result[i].pictureUrl,
                    userPicture: result[i].userPicture
                });
            }
            res.status(200).jsonp({
                success: responseText,
                geoPoints: geoPoints,
                trackInfo: trackInfo
            });
/*            if(geoPoints && geoPoints.length>0){
                console.log('get: Type of accuracy: '+typeof(geoPoints[0].accuracy));
                console.log('get: Type of timestamp: '+typeof(geoPoints[0].timestamp));
                console.log('get: Type of latitude: '+typeof(geoPoints[0].latitude));
            }  */
            db.close();
        }
    });
}
