// postHandlerPublish.js
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
  registerHandlerPublishPost: function(app){
    handlePublishPost(app);
    console.log('handlePublishPost registered');
  }
};

function handlePublishPost(app){
    app.post('/publish', function(req, res) {
        // fill publish-data
        var publisherDisplayName;
        if(req.body.publisherDisplayName){
            publisherDisplayName = req.body.publisherDisplayName;
        }
        else{
            publisherDisplayName = req.body.publisherUserId;
        }
        var publishData = {
          'publisherAccountType' : req.body.publisherAccountType,
          'publisherUserId' : req.body.publisherUserId,
          'publisherDisplayName' : publisherDisplayName,
          'publishedForAccountType' : req.body.publishedForAccountType,
          'publishedForUserId' : req.body.publishedForUserId,
          'publishedForDisplayName' : req.body.publishedForDisplayName,
          'publishPeriod': req.body.publishPeriod,
          'publishStartTimestamp': new Date(),    // see below
          'accessTokenUnregisteredUser': "",   // see below
          'to' : req.body.sendToEmail,
          'from' : mailService.getSnapMyTrackEmail(),
          'subject' : "SnapMyTrack: Your friend '"+req.body.publisherDisplayName+"' has shared a track / location with you",    // req.body.subject,
          'html' : ""
        };

        // individual start date for publish (default is 'now')
        if( req.body.publishStartTimestamp ){
            publishStartTimestamp = req.body.publishStartTimestamp;
        }
        // add access token to publish geo-data w/o the need of a registered snapMyTrack user
        var accessTokenUnregisteredUser;
        if(!publishData.publishedForAccountType){
            publishData.accessTokenUnregisteredUser = serverUtil.createRandomId();
        }

        // link
        var linkUrl = mailService.getSnapMyTrackHostUrl();
        if(publishData.accessTokenUnregisteredUser && publishData.accessTokenUnregisteredUser.length>0){
            linkUrl += '?accessTokenUnregisteredUser='+publishData.accessTokenUnregisteredUser;
        }

        // html / mail body
        publishData.html = "<div>Your friend '"+req.body.publisherDisplayName+"' has shared a track / location with you.</div><div>Click the link to open <b>SnapMyTrack</b> and display a map</div>"
                            + '<a href='+linkUrl+'>Show ' + req.body.publisherDisplayName+"'s track</a>";
                    
        console.log('publishData: ');
        console.log(publishData);
        
        // publish data
        if ((publishData.publisherAccountType === undefined) || (publishData.publisherUserId === undefined) || (publishData.publisherDisplayName === undefined)
            || (publishData.from === undefined) || (publishData.subject === undefined)
            || (publishData.html === undefined) || (publishData.publishPeriod === undefined) ) {
          res.status(400).jsonp({
            error : 'Bad publish-request, parameter(s) undefined'
          });
          return;
        }

        updatePublishInfo(res, publishData, sendPublishMail);
    });
}

function updatePublishInfo(res, publishData, callback){
    // created with assistance of http://blog.modulus.io/mongodb-tutorial
    var mongoClient= mongodb.MongoClient;
    var mongodb_db_url;
    var publishCount;
    var publishEndTimestamp = new Date();
    
    if(publishData.publishPeriod==='snap'){
        publishEndTimestamp =new Date(publishEndTimestamp.setHours( publishEndTimestamp.getHours() + 200*365*24 ));
    }
    else if(publishData.publishPeriod==='oneMonth'){
        publishEndTimestamp = new Date(publishEndTimestamp.setHours( publishEndTimestamp.getHours() + 30*24 ));
    }
    else if(publishData.publishPeriod==='oneWeek'){
        publishEndTimestamp = new Date(publishEndTimestamp.setHours( publishEndTimestamp.getHours() + 7*24 ));
    }
    else if(publishData.publishPeriod==='oneDay'){
        publishEndTimestamp = new Date(publishEndTimestamp.setHours( publishEndTimestamp.getHours() + 1*24 ));
    }
    else if(publishData.publishPeriod==='oneHour'){
        publishEndTimestamp = new Date(publishEndTimestamp.setHours( publishEndTimestamp.getHours() + 1 ));
    }
    else{    // fallback -> display only once ('snap'-mode)
        publishCount = 1;
    }
    publishData.publishCount = publishCount;
    publishData.publishEndTimestamp = publishEndTimestamp;
    
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
        db.collection('publishForUser').insert([publishData], function (err, result) {
          if (err) {
            console.log('Adding publish info to Mongo DB has failed: '+err);
            db.close();
          }
          else {
            console.log('Publish info added to DB, collection "publishForUser": info->'
                      + 'publisherAccountType: ' + publishData.publisherAccountType + ', '
                      + 'publisherUserId: ' + publishData.publisherUserId + ', '
                      + 'publisherDisplayName: ' + publishData.publisherDisplayName + ', '
                      + 'publishedForAccountType: ' + publishData.publishedForAccountType + ', '
                      + 'publishedForUserId: ' + publishData.publishedForUserId + ', '
                      + 'publishedForDisplayName: ' + publishData.publishedForDisplayName + ', '
                      + 'accessTokenUnregisteredUser: ' + publishData.accessTokenUnregisteredUser + ', '
                      + 'publishCount: ' + publishData.publishCount + ', '
                      + 'publishEndTimestamp: ' + publishData.publishEndTimestamp );
            db.close();
            res.status(200).jsonp({
                success : 'Publish info added to data base collection "publishForUser"',
                data: publishData
            });
            callback(res, publishData);
          }        
        });
      }
    });
}

function sendPublishMail( res, publishData ){
    mailService.sendSnapMyTrackMail( res, publishData );
}

