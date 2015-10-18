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
  registerHandlerSignInPost: function(app){
    handleSignInPost(app);
    console.log('handleSignInPost registered');
  },
  registerHandlerPasswordResetPost: function(app){
    handlePasswordResetPost(app);
    console.log('handlePasswordResetPost registered');
  },
  registerHandlerConfirmAccountPost: function(app){
    handleConfirmAccountPost(app);      
    console.log('handleConfirmAccountPost registered');
  },
  registerHandlerSetNewPasswordPost: function(app){
    handleSetNewPasswordPost(app);      
    console.log('handleSetNewPasswordPost registered');
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
            'displayName': req.body.displayName,
            'password': req.body.password
        };
        console.log('Sign-In data: ');
        console.log(signInData);
        // validate user settings
        if ((signInData.accountType === undefined) || (signInData.userId === undefined)
            || ( signInData.accountType === 'PASSWORD' && signInData.password === undefined ) ) {
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

function handlePasswordResetPost(app){
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
        userValidateForPasswordReset(res, req.body.userId, userValidateForPasswordResetCallback);
    });
}

function handleSetNewPasswordPost(app){
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
        userValidateForPasswordChange( res, req.body.userId, req.body.accessTokenPasswordReset,
                                       req.body.password, userValidateForPasswordChangeCallback );
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
            var query = {"accountType":"PASSWORD",
                         "userId":userId,
                         "accessTokenAccountConfirm":accessTokenAccountConfirm
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
        updateUser(appUser, db, res, true, accountConfirmCallback);    // 'true' -> close DB 
    }
    else{
        res.status(400).jsonp({
            success : 'There is no pending account confirmation for user ' + userId
                        + ' and token ' + accessTokenAccountConfirm + ' in the SnapMyTrack data base',
            data: { "isNewUnconfirmed" : appUser.isNewUnconfirmed,
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

function userValidateForPasswordChange(res, userId, accessTokenPasswordReset, password, callback){
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

function userValidateForPasswordChangeCallback(res, db, appUser, accessTokenPasswordReset, password){
    // change password
    if(appUser){
        updateUser( appUser, db, res, true, passwordChangeCallback);    // 'true' -> close DB 

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
            success : 'Password-change mail sent to user ' + displayName
        });
    }
    else{
        res.status(400).jsonp({
            success : 'There is no pending password reset for user ' + appUser.userId
                        + ' and token ' + accessTokenPasswordReset + ' in the SnapMyTrack data base'
        });
    }
}

function passwordChangeCallback(res, appUser){
    res.status(200).jsonp({
            status: 'connected',
            success: 'User '+ appUser.userId + ' has been signed in',
            data: { 'accountType': appUser.accountType,
                    'userId': appUser.userId,
                    'mainPageUrl': mailService.getSnapMyTrackHostUrl()
                }
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

function userValidateForPasswordResetCallback(res, db, appUser, userId){
    if(appUser){
        // create reset token/code and update collection 'appUser'
        appUser.accessTokenPasswordReset = serverUtil.createRandomId();
        updateUser( appUser, db, res, true, passwordResetCallback);    // 'true' -> close DB 

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
            success : 'There is no user ' + userId + ' in the SnapMyTrack data base)'
        });
    }
}

function passwordResetCallback(res, appUser){
    res.status(200).jsonp({
        success : 'Account has been confirmed (user ' + displayName + ')',
        data: { 'isNewUnconfirmed': appUser.isNewUnconfirmed }
    });
}

function userValidate(res, signInData, callback){
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
                            console.log('Password of user ' + signInData.userId + ' is NOT valid');
                        }
                    }
                }
                else{
                    // user does NOT yet exist
                    userExists=false;
                    console.log('user ' + signInData.userId + ' does not yet exist');
                }
                callback(db, res, userExists, passwordOk, signInData);
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
        updateUser(appUser, db, res, true, userSignInCallback);     // 'true' -> close DB
    }
    else{
        db.close();
        res.status(200).jsonp({
                'status': signInStatus,
                'success': responseText,
                'data': { 'accountType': appUser.accountType,
                          'userId': appUser.userId }
        });
    }
}

function userSignInCallback(res, appUser){
    res.status(200).jsonp({
            status: 'connected',
            success: 'User '+ appUser.userId + ' has been signed in',
            data: { 'accountType': appUser.accountType,
                    'userId': appUser.userId }
    });
}

function userCreateCallback(db, res, userCreated, appUser){
    if(userCreated){
        signInStatus = 'connected';
        responseText='User '+ appUser.userId + ' has been created and signed in';
    }
    else{
        signInStatus = 'user_creation_failed';
        responseText='User '+ appUser.userId + ' could not be created';
    }
    res.status(200).jsonp({
            'status': signInStatus,
            'success': responseText,
            'accountType': appUser.accountType,
            'userId': appUser.userId
    });
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

function updateUser( appUser, db, res, doCloseDb, callback){
    var collAppUser = db.collection('appUser');
    collAppUser.updateOne(
        { "accountType" : appUser.accountType,
          "userId": appUser.userId },
        { $set: { "sessionTimeout": appUser.sessionTimeout,
                  "displayName": appUser.displayName,
                  "accessTokenPasswordReset": appUser.accessTokenPasswordReset,
                  "changedOn": new Date()
        } },
        function(err, results) {
            if (err) {
                console.log('Updating user in DB has failed (session timeout, display name): '+err);
                res.status(200).jsonp({
                        status: 'auth_failed',
                        error: 'Setting session timeout / display name for user '+ appUser.userId +' has failed',
                        data: appUser
                });
            }
            else {
                console.log('User updated in DB (session timeout / display name), collection "appUser": info->'
                              + 'userId: ' + appUser.userId + ', '
                              + 'sessionTimeout: ' + appUser.sessionTimeout + ', '
                              + 'accessTokenPasswordReset: ' + appUser.accessTokenPasswordReset );
                callback(res, appUser);
            }
            if(doCloseDb){
                db.close();
            }
        }
    );
}