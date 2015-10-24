// postHandlerSignIn.js
// ====================

var mongodb = require('mongodb');
var serverUtil = require('../serverUtil');
var mailService = require('../mailService');
var is = require('type-is');
var dev_config;
try{
    dev_config = require('../../.dev_config/config.json');
    console.log('dev_config loaded: ', dev_config);
}
catch(err){
    if(!process.env.OPENSHIFT_MONGODB_DB_URL){
      console.log('mongodbUrl: process.env.OPENSHIFT_MONGODB_DB_URL AND ../../.dev_config/config.json not available');  // deactivate later
    }
}

module.exports = {
    // sign in
    registerHandlerSignInPost: function(app){
        handleSignInPost(app);
        console.log('handleSignInPost registered');
    },
    // confirm new account
    registerHandlerConfirmAccountPost: function(app){
        handleConfirmAccountPost(app);      
        console.log('handleConfirmAccountPost registered');
    },
    // request new password
    registerHandlerRequestPasswordResetPost: function(app){
        handleRequestPasswordResetPost(app);
        console.log('handlePasswordResetPost registered');
    },
    // set new password
    registerHandlerUserUpdatePasswordPost: function(app){
        handleUserUpdatePasswordPost(app);      
        console.log('handleUserUpdatePasswordPost registered');
    },
    // update public data (user display name, picture url) ---
    registerHandlerUserUpdatePublicDataPost: function(app){
        handleUserUpdatePublicDataPost(app);
        console.log('handleUserUpdatePublicDataPost registered');
    }
};

function handleSignInPost(app){
    // account types:
    //   - FACEBOOK
    //   - GOOGLE
    //   - WINDOWSLIVE
    //   - PASSWORD
    app.post('/signIn', function(req, res) {
        console.log('Sign in for user: ' + req.body.userId);
        // validate sign-in data
        var signInData = {
            'accountType': req.body.accountType,
            'userId': req.body.userId,
            'password': req.body.password
        };
        console.log('Sign-In data: ');
        console.log(signInData);
        // validate user settings
        if ((req.body.accountType === undefined) || (req.body.userId === undefined) || (signInData.userId === '')
            || ( req.body.accountType === 'PASSWORD' && signInData.password === '' )
            || ( req.body.accountType === 'PASSWORD' && req.body.password === undefined ) ) {
          res.status(400).jsonp({
            error : 'Bad request, parameter(s) undefined'
          });
          return;
        }
        userValidate(res, signInData, userValidateCallback);
    });
}

function handleConfirmAccountPost(app){
    app.post('/accountConfirm', function(req, res) {
        console.log('Confirm new account');
        console.log(req.body);
        // validate password-reset data
        if ( req.body.userId === undefined || req.body.accessTokenAccountConfirm === undefined ) {
          res.status(400).jsonp({
            'error' : "Bad request, parameter 'userId' or 'accessTokenAccountConfirm' is undefined"
          });
          return;
        }
        userValidateForAccountConfirm(res, req.body.userId, req.body.accessTokenAccountConfirm, userValidateForAccountConfirmCallback);
    });
}

function handleUserUpdatePublicDataPost(app){
    app.post('/userUpdate', function(req, res) {
        console.log('User-Update (public data): ');
        console.log(req.body);
        // validate password-reset data
        if ( req.body.accountType === undefined || req.body.userId === undefined
             || req.body.password === undefined || req.body.displayName === undefined ) {
          res.status(400).jsonp({
            error : "Bad request, parameter(s) undefined"
          });
          return;
        }
        else if(req.body.accountType !== 'PASSWORD'){
          res.status(400).jsonp({
            error : "Bad request, display name can only be changed for account type 'PASSWORD' (oAuth accounts get the display name via social-API)"
          });
          return;
        }
        // url of user's picture
        var pictureUrl="";
        if(req.body.pictureUrl){
            pictureUrl=req.body.pictureUrl;
        }
        // url of user's picture
        var userPicture="";
        if(req.body.userPicture){
            userPicture=req.body.userPicture;
        }
        userValidateForUserUpdatePublicData(res, req.body.accountType, req.body.userId, req.body.password, req.body.displayName, pictureUrl, userPicture, userValidateForUserUpdatePublicDataCallback);
    });
}

function handleRequestPasswordResetPost(app){
    app.post('/passwordReset', function(req, res) {
        console.log('Password-Reset Email/userId: ');
        console.log(req.body);
        // validate password-reset data
        if ( req.body.userId === undefined ) {
          res.status(400).jsonp({
            error : "Bad request, parameter 'userId' is not undefined"
          });
          return;
        }
        userValidateForRequestPasswordReset(res, req.body.userId, userValidateForRequestPasswordResetCallback);
    });
}

function handleUserUpdatePasswordPost(app){
    app.post('/setNewPassword', function(req, res) {
        console.log('Set new password: ');
        console.log(req.body.userId);
        // validate password-reset data
        if ( req.body.userId === undefined || req.body.accessTokenPasswordReset === undefined
             || req.body.password === undefined ) {
          res.status(400).jsonp({
            error : "Bad request, parameter(s) undefined"
          });
          return;
        }
        userValidateForUserUpdatePassword( res, req.body.userId, req.body.accessTokenPasswordReset,
                                           req.body.password, userValidateForUserUpdatePasswordCallback );
    });
}

function userValidateForAccountConfirm(res, userId, accessTokenAccountConfirm, callback){
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
            var query = {'accountType': "PASSWORD",
                         'userId': userId,
                         'accessTokenAccountConfirm': accessTokenAccountConfirm
            };
            console.log('query (validate user): ', query);
            db.collection('appUser').find(query).toArray( function (err, result) {
                if (err) {
                    console.log('Reading application user from Mongo DB collection "appUser" has failed: '+err);
                    db.close();
                }
                else {
                    if(result && result.length>0){     // expected to be one or none
                        callback(res, db, result[0], userId, accessTokenAccountConfirm);
                    }
                    else{
                        console.log('There is no user with Email ' + userId
                                    + ' and pending access token ' + accessTokenAccountConfirm );
                        callback(res, db, null, userId, accessTokenAccountConfirm);
                    }
                }
            });
        }
    });
}

function userValidateForAccountConfirmCallback(res, db, appUser, userId, accessTokenAccountConfirm){
    // confirm new account
    if(appUser){
        appUser.isNewUnconfirmed = false;
        updateUserAdminData(appUser, db, res, true, accountConfirmCallback);    // 'true' -> close DB 
    }
    else{
        res.status(400).jsonp({
            success : 'There is no pending account confirmation for user ' + userId
                        + ' and token ' + accessTokenAccountConfirm + ' in the SnapMyTrack data base',
            data: { 'accountType': 'PASSWORD',
                    'userId': userId,
                    'isNewUnconfirmed' : appUser.isNewUnconfirmed,
                    'mainPageUrl': mailService.getSnapMyTrackHostUrl() }
        });
    }
}

function accountConfirmCallback(res, appUser){
    var displayName;
    
    if(appUser.displayName){
        displayName = appUser.displayName;
    }
    else{
        displayName = appUser.userId;
    }
    res.status(200).jsonp({
        success : 'Account has been confirmed (user ' + displayName + ')',
        data: { 'isNewUnconfirmed': appUser.isNewUnconfirmed,
                'accountType': appUser.accountType,
                'userId': appUser.userId,
                'mainPageUrl': mailService.getSnapMyTrackHostUrl() }
    });
}

function userValidateForUserUpdatePublicData(res, accountType, userId, password, displayName, pictureUrl, userPicture, callback){
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
            var query = {"accountType": accountType,
                         "userId": userId,
                         "password": password
            };
            console.log('query (validate user): ', query);
            db.collection('appUser').find(query).toArray( function (err, result) {
                if (err) {
                    console.log('Reading application user from Mongo DB collection "appUser" has failed: '+err);
                    db.close();
                }
                else {
                    if(result && result.length>0){     // expected to be one or none
                        callback(res, db, result[0], userId, displayName, pictureUrl, userPicture);
                    }
                    else{
                        console.log('There is no user with Email ' + userId + ' and password ' +password );
                        callback(res, db, null, userId, displayName, pictureUrl, userPicture);
                    }
                }
            });
        }
    });
}

function userValidateForUserUpdatePublicDataCallback(res, db, appUser, userId, displayName, pictureUrl, userPicture){
    // change password
    if(appUser){
        appUser.displayName = displayName;
        appUser.pictureUrl = pictureUrl;
        appUser.userPicture = userPicture;
        updateUserPublicData( appUser, db, res, true, userUpdatePublicDataCallback);
    }
    else{
        res.status(400).jsonp({
            'error': 'There is no user ' + appUser.userId + ' in the SnapMyTrack data base'
        });
    }
}

function userUpdatePublicDataCallback(res, appUser){
    res.status(200).jsonp({
            status: 'user_updated',
            success: 'Public data of user '+ appUser.userId + ' has been updated',
            data: { 'accountType': appUser.accountType,
                    'userId': appUser.userId,
                    'displayName': appUser.displayName,
                    'userPicture': appUser.userPicture,
                    'pictureUrl': appUser.pictureUrl
                }
    });
}

function userValidateForUserUpdatePassword(res, userId, accessTokenPasswordReset, password, callback){
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
            var query = {"accountType": "PASSWORD",
                         "userId": userId,
                         "accessTokenPasswordReset": accessTokenPasswordReset
            };
            console.log('query (validate user): ', query);
            db.collection('appUser').find(query).toArray( function (err, result) {
                if (err) {
                    console.log('Reading application user from Mongo DB collection "appUser" has failed: '+err);
                    db.close();
                }
                else {
                    if(result && result.length>0){     // expected to be one or none
                        callback(res, db, result[0], userId, accessTokenPasswordReset, password);
                    }
                    else{
                        console.log('There is no user with Email ' + userId
                                    + ' and pending password reset token ' + accessTokenPasswordReset );
                        callback(res, db, null, userId, accessTokenPasswordReset, null);
                    }
                }
            });
        }
    });
}

function userValidateForUserUpdatePasswordCallback(res, db, appUser, accessTokenPasswordReset, password){
    // change password
    if(appUser){
        updateUserPassword( appUser, password, db, res, true, userUpdatePasswordCallback);    // 'true' -> close DB 
    }
    else{
        res.status(400).jsonp({
            error: 'There is no pending password reset for user ' + appUser.userId
                        + ' and token ' + accessTokenPasswordReset + ' in the SnapMyTrack data base'
        });
    }
}

function userUpdatePasswordCallback(res, appUser){
    var displayName;
    if(appUser.displayName){
        displayName = appUser.displayName;
    }
    else{
        displayName = appUser.userId;
    }
    var linkUrl = mailService.getSnapMyTrackHostUrl();
    var body = '<div>Hi,</div>'
                + '<br>'
                + '<div>Your password has been changed for user ' + displayName + '.</div>'
                + '<div>If you did not change the password yourself, follow the link and request password reset. Afterwards set a new password.</div>'
                + '<br>'
                + '&nbsp;&nbsp;&nbsp;<a href='+linkUrl+'>Launch SnapMyTrack</a>'
                + '<br><br>'
                + '<div>Regards,</div>'
                + '<div>SnapMyTrack team</div>';
    var passwordChangedMailData = {
        'to': appUser.userId,
        'from': mailService.getSnapMyTrackEmail(),
        'subject': 'SnapMyTrack: Password changed for user ' + displayName,
        'link': linkUrl,
        'html': body
    };
    // send password-change info mail
    mailService.sendSnapMyTrackMail(res, passwordChangedMailData);
    res.status(200).jsonp({
        status: 'connected',
        success : 'Password of user ' + displayName + ' has been successfully changed',
        data: { 'accountType': appUser.accountType,
                'userId': appUser.userId }
    });
}

function userValidateForPasswordReset(res, userId, callback){
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
            var query = {"accountType":"PASSWORD",
                         "userId":userId};
            console.log('query (validate user): ', query);
            db.collection('appUser').find(query).toArray( function (err, result) {
                if (err) {
                    console.log('Reading application user from Mongo DB collection "appUser" has failed: '+err);
                    db.close();
                }
                else {
                    if(result && result.length>0){     // expected to be one or none
                        callback(res, db, result[0], userId);
                    }
                    else{
                        console.log('There is no user with Email ' + userId);
                        callback(res, db, null, userId);
                    }
                }
            });
        }
    });
}

function userValidateForRequestPasswordResetCallback(res, db, appUser, userId){
    if(appUser){
        // create reset token/code and update collection 'appUser'
        appUser.accessTokenPasswordReset = serverUtil.createRandomId();
        updateUserAdminData( appUser, db, res, true, requestPasswordResetCallback);    // 'true' -> close DB 

        var displayName;
        if(appUser.displayName){
            displayName = appUser.displayName;
        }
        else{
            displayName = appUser.userId;
        }
        var linkUrl = mailService.getSnapMyTrackHostUrl() + '/account/passwordReset?'+'userId='+appUser.userId+'&accessTokenPasswordReset='+appUser.accessTokenPasswordReset;
        var body = '<div>Hi,</div>'
                    + '<br>'
                    + '<div>You have requested to reset password for user ' + displayName + '.</div>'
                    + '<div>Follow the link to set a new password.</div>'
                    + '<br>'
                    + '&nbsp;&nbsp;&nbsp;<a href='+linkUrl+'>Confirm password reset</a>'
                    + '<br><br>'
                    + '<div>Regards,</div>'
                    + '<div>SnapMyTrack team</div>';
        var passwordResetMailData = {
            'to': appUser.userId,
            'from': mailService.getSnapMyTrackEmail(),
            'subject': 'SnapMyTrack: Password reset for user ' + displayName,
            'link': linkUrl,
            'html': body
        };
        // send password-reset mail
        mailService.sendSnapMyTrackMail(res, passwordResetMailData);
    }
    else{
        res.status(400).jsonp({
            error : 'There is no user ' + userId + ' in the SnapMyTrack data base)',
            data: { 'accountType': 'PASSWORD',
                    'userId': userId }
        });
    }
}

function requestPasswordResetCallback(res, appUser){
    res.status(200).jsonp({
        success : 'Request for password reset has been processed and mail has been sent (user ' + displayName + ')',
        data: { 'accountType': appUser.accountType,
                'userId': appUser.userId }
    });
}

function userValidate(res, signInData, callback){
    // created with assistance of http://blog.modulus.io/mongodb-tutorial
    var mongoClient= mongodb.MongoClient;
    var mongodb_db_url;
    var appUser = signInData;

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
        // delete one user
//        db.collection('appUser').deleteOne({userId:'michbier@gmail.com'});
//        return;
        // delete all users
        // db.collection('appUser').deleteMany({});
        // return;
        // delete all userSettings
        // db.collection('userSettings').deleteMany({});
        // return;
        // delete all publishForUser
        // db.collection('publishForUser').deleteMany({});
        // return;
        // delete all followUser
        // db.collection('followUser').deleteMany({});
        // return;
        // delete all geo data
        // db.collection('geoDataUser').deleteMany({});
        // return;

        // appUser
        //   - userId
        //   - accountType
        //   - displayName
        var query = {'accountType' :signInData.accountType,
                     'userId': signInData.userId};
        console.log('query (validate user): ', query);
        var collAppUser = db.collection('appUser');
        collAppUser.find(query).toArray( function (err, result) {
            if (err) {
              console.log('Reading application user from Mongo DB collection "appUser" has failed: '+err);
              db.close();
            }
            else {
                console.log('Application user: ',result);
                var userExists;
                var passwordOk;    // will stay initial for all account types but 'PASSWORD'
                if(result && result.length>0){     // expected to be one or none
                    // user already exists
                    userExists=true;
                    appUser = result[0];
                    console.log('user ' + signInData.userId + ' exists');
                    console.log(result);
                    // validate password (if needed)
                    if(signInData.accountType === 'PASSWORD'){
                        if(result[0].password === signInData.password){
                            passwordOk=true;
                            console.log('Password of user ' + signInData.userId + ' is valid');
                        }
                        else{
                            passwordOk=false;
                            appUser = signInData;
                            console.log('Password of user ' + signInData.userId + ' is NOT valid');
                        }
                    }
                }
                else{
                    // user does NOT yet exist
                    userExists=false;
                    console.log('user ' + signInData.userId + ' does not yet exist');
                }
                callback(db, res, userExists, passwordOk, appUser);
            }
        });
      }
    });
}

function userValidateCallback(db, res, userExists, passwordOk, appUser){
    var signInStatus;
    var responseText;
    
    if(!userExists){
        createUser(db, res, appUser, userCreateCallback);
        return;
    }
    else if(appUser.accountType === 'PASSWORD'){
        if(passwordOk){
            signInStatus = 'connected';
            responseText='Password for user ' + appUser.userId + ' has been successfully validated -> user has been signed in';
        }
        else{
            signInStatus = 'auth_failed';
            responseText='Password for user ' + appUser.userId + ' is not valid -> user has not been signed in';
        }
    }
    else{
        signInStatus = 'connected';
        responseText='User '+ appUser.userId + ' has been signed in';
    }

    // update session timeout
    if(signInStatus === 'connected'){      // connected, but not a new user
        appUser.sessionTimeout = new Date();
        // each signIn shall create a session timeout timestamp (if expired, new sign in is triggered from UI)
        console.log('updateUser');
        updateUserAdminData(appUser, db, res, true, userSignInCallback);     // 'true' -> close DB
    }
    else{
        db.close();
        res.status(400).jsonp({
                'status': signInStatus,
                'error': responseText,
                'data': { 'accountType': appUser.accountType,
                          'userId': appUser.userId,
                          'displayName': appUser.displayName,
                          'pictureUrl': appUser.pictureUrl }
        });
    }
}

function userSignInCallback(res, appUser){
    res.status(200).jsonp({
            'status': 'connected',
            'success': 'User '+ appUser.userId + ' has been signed in',
            'data': { 'accountType': appUser.accountType,
                      'userId': appUser.userId,
                      'displayName': appUser.displayName,
                      'pictureUrl': appUser.pictureUrl }
    });
}

function userCreateCallback(db, res, userCreated, appUser){
    if(userCreated){
        signInStatus = 'connected';
        responseText='User '+ appUser.userId + ' has been created and signed in';
        res.status(200).jsonp({
                'status': signInStatus,
                'success': responseText,
                'data': { 'accountType': appUser.accountType,
                          'userId': appUser.userId,
                          'displayName': appUser.displayName,
                          'pictureUrl': appUser.pictureUrl }
        });
    }
    else{
        signInStatus = 'user_creation_failed';
        responseText='User '+ appUser.userId + ' could not be created';
        res.status(400).jsonp({
                'status': signInStatus,
                'error': responseText,
                'data': { 'accountType': appUser.accountType,
                          'userId': appUser.userId,
                          'displayName': appUser.displayName,
                          'pictureUrl': appUser.pictureUrl }
        });
    }
    db.close();
}

function createUser(db, res, appUser, callback){
    var accountConfirmMailData;
    
    appUser.sessionTimeout = new Date();
    appUser.createdOn = new Date();
    appUser.changedOn = new Date();
    appUser.isNewUnconfirmed = true;
    appUser.accessTokenAccountConfirm = serverUtil.createRandomId();
    db.collection('appUser').insert(
        [appUser],
        function (err, result) {
          if (err) {
            console.log('Creating user in Mongo DB has failed: '+err);
            callback( db, res, false, appUser );
          }
          else {
            if(appUser.accountType === 'PASSWORD'){
                //  send validaton mail
                var displayName;
                if(appUser.displayName){
                    displayName = appUser.displayName;
                }
                else{
                    displayName = appUser.userId;
                }
                var linkUrl = mailService.getSnapMyTrackHostUrl() + '/account/accountConfirm?'+'userId='+appUser.userId+'&accessTokenAccountConfirm='+appUser.accessTokenAccountConfirm;
                var body = '<div>Hi,</div>'
                            + '<br>'
                            + '<div>You have created new user ' + displayName + ' for SnapMyTrack.</div>'
                            + '<div>Follow the link to confirm your new <b>SnapMyTrack</b> account.</div>'
                            + '<br>'
                            + '&nbsp;&nbsp;&nbsp;<a href='+linkUrl+'>Confirm account</a>'
                            + '<br><br>'
                            + '<div>Regards,</div>'
                            + '<div>SnapMyTrack team</div>';
                accountConfirmMailData = {
                    'to': appUser.userId,
                    'from': mailService.getSnapMyTrackEmail(),
                    'subject': 'Welcome To SnapMyTrack! Confirm Your Email',
                    'link': linkUrl,
                    'html': body
                };
            }
            
            console.log( 'User created in DB, collection "appUser":' );
            console.log( 'info ->' );
            console.log( 'accountType: ' + appUser.accountType + ', '
                      + 'userId: ' + appUser.userId + ', '
                      + 'displayName: ' + appUser.displayName + ', '
                      + 'password: ' + appUser.password + ', '
                      + 'createdOn: ' + appUser.createdOn + ', '
                      + 'changedOn: ' + appUser.changedOn + ', '
                      + 'accessTokenAccountConfirm: ' + appUser.accessTokenAccountConfirm + ', '
                      + 'isNewUnconfirmed: ' + appUser.isNewUnconfirmed + ', '
                      + 'sessionTimeout: ' + appUser.sessionTimeout );

            if(appUser.accountType === 'PASSWORD'){
                // send account confirmation mail
                console.log('send confirmation mail: ', accountConfirmMailData);
                mailService.sendSnapMyTrackMail(res, accountConfirmMailData);
            }

            callback( db, res, true, appUser );
          }        
        }
    );
}

function updateUserPublicData( appUser, db, res, doCloseDb, callback){
    // update fields:
    //  - display name
    //  - pictureUrl
    var collAppUser = db.collection('appUser');
    var userPictureInfo='no user picture';
    if(appUser.userPicture){
        userPictureInfo='user picture maintained';
    }
    
    collAppUser.updateOne(
        { "accountType" : appUser.accountType,
          "userId": appUser.userId },
        { $set: { "displayName": appUser.displayName,
                  "userPicture": appUser.userPicture,
                  "pictureUrl": appUser.pictureUrl,
                  "changedOn": new Date()
        } },
        function(err, results) {
            if (err) {
                console.log('Updating user in DB has failed (display name): '+err);
                res.status(200).jsonp({
                        status: 'update_failed',
                        error: 'Setting display name for user '+ appUser.userId +' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId,
                                'displayName': appUser.displayName,
                                'userPicture': appUser.userPicture,
                                'pictureUrl': appUser.pictureUrl }
                });
            }
            else {
                console.log('User updated in DB (display name), collection "appUser": info->'
                              + 'accountType'+ appUser.accountType + ', '
                              + 'userId: ' + appUser.userId + ', '
                              + 'displayName: ' + appUser.displayName + ', '
                              + 'userPictureInfo: ' + appUser.userPictureInfo + ', '
                              + 'pictureUrl: ' + appUser.pictureUrl );
                callback(res, appUser);
            }
            if(doCloseDb){
                db.close();
            }
        }
    );
}

function updateUserPassword( appUser, password, db, res, doCloseDb, callback){
    // update fields:
    //  - password
    //  - access token for password reset (reset)
    var collAppUser = db.collection('appUser');
    collAppUser.updateOne(
        { "accountType" : appUser.accountType,
          "userId": appUser.userId },
        { $set: { "password": password,
                  "accessTokenPasswordReset": '',
                  "changedOn": new Date()
        } },
        function(err, results) {
            if (err) {
                console.log('Updating user in DB has failed (password): '+err);
                res.status(200).jsonp({
                        status: 'auth_failed',
                        error: 'Setting new password for user '+ appUser.userId +' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId,
                                'displayName': appUser.displayName,
                                'pictureUrl': appUser.pictureUrl }
                });
            }
            else {
                console.log('User updated in DB (session timeout), collection "appUser": info->'
                              + 'userId: ' + appUser.userId + ', '
                              + 'password: xxxxxx' + ', '
                              + 'accessTokenPasswordReset: resetted' );
                callback(res, appUser);
            }
            if(doCloseDb){
                db.close();
            }
        }
    );
}

function updateUserAdminData( appUser, db, res, doCloseDb, callback){
    // update fields:
    //  - session timeout
    //  - access token for password reset
    var collAppUser = db.collection('appUser');
    collAppUser.updateOne(
        { "accountType" : appUser.accountType,
          "userId": appUser.userId },
        { $set: { "sessionTimeout": appUser.sessionTimeout,
                  "accessTokenPasswordReset": appUser.accessTokenPasswordReset,
                  "displayName": appUser.displayName,
                  "pictureUrl": appUser.pictureUrl,
                  "changedOn": new Date()
        } },
        function(err, results) {
            if (err) {
                console.log('Updating user in DB has failed (session timeout): '+err);
                res.status(200).jsonp({
                        status: 'auth_failed',
                        error: 'Setting session timeout for user '+ appUser.userId +' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId,
                                'sessionTimeout': appUser.sessionTimeout,
                                'displayName': appUser.displayName,
                                'pictureUrl': appUser.pictureUrl }
                });
            }
            else {
                console.log('User updated in DB (session timeout), collection "appUser": info->'
                              + 'accountType: ' + appUser.accountType + ', '
                              + 'userId: ' + appUser.userId + ', '
                              + 'sessionTimeout: ' + appUser.sessionTimeout + ', '
                              + 'displayName: ' + appUser.displayName + ', '
                              + 'pictureUrl: ' + appUser.pictureUrl + ', '
                              + 'accessTokenPasswordReset: ' + appUser.accessTokenPasswordReset );
                callback(res, appUser);
            }
            if(doCloseDb){
                db.close();
            }
        }
    );
}