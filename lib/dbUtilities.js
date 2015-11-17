// dbUtilities.js
// ==============

module.exports = {
    removeUserFromPublishForUser: function(appUser, db, res){
        return removeUserFromPublishForUser(appUser, db, res);
    },
    removeUserFromFollowUser: function(appUser, db, res){
        return removeUserFromFollowUser(appUser, db, res);
    },
    removeUserFromGeoDataUser: function(appUser, db, res){
        return removeUserFromGeoDataUser(appUser, db, res);
    },
    removeUserFromUserSettings: function(appUser, db, res){
        return removeUserFromUserSettings(appUser, db, res);
    },
    removeUserFromAppUser: function(appUser, db, res){
        return removeUserFromAppUser(appUser, db, res);
    },
    createSuccessMessage: function(appUser, db, res){
        return createSuccessMessage(appUser, db, res);
    }
};

function removeUserFromPublishForUser(appUser, db, res){
    console.log('remove user from collection "publishForUser"');
    db.collection('publishForUser').remove( {
            "accountType" : appUser.accountType,
            "userId": appUser.userId
        },
        function(err) {
 /*           if (err) {
                db.close();
                console.log('Deletion of account for user ' + appUser.userId + ' has failed:',err);
                res.status(200).jsonp({
                        error: 'Deletion of account for user ' + appUser.userId + ' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }
            else {
                console.log('User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"' );
                res.status(400).jsonp({
                        success: 'User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }   */
            return err;
        }
    );
}

function removeUserFromFollowUser(appUser, db, res){
    console.log('remove user from collection "followUser"');
    db.collection('followUser').remove( {
            "userId": appUser.userId
        },
        function(err) {
/*            if (err) {
                db.close();
                console.log('Deletion of account for user ' + appUser.userId + ' has failed:',err);
                res.status(200).jsonp({
                        error: 'Deletion of account for user ' + appUser.userId + ' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }
            else {
                console.log('User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"' );
                res.status(400).jsonp({
                        success: 'User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }   */
            return err;
        }
    );
}

function removeUserFromGeoDataUser(appUser, db, res){
    console.log('remove user from collection "geoDataUser"');
    db.collection('geoDataUser').remove( {
            "userId": appUser.userId
        },
        function(err) {
/*            if (err) {
                db.close();
                console.log('Deletion of account for user ' + appUser.userId + ' has failed:',err);
                res.status(200).jsonp({
                        error: 'Deletion of account for user ' + appUser.userId + ' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }
            else {
                console.log('User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"' );
                res.status(400).jsonp({
                        success: 'User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            } */
            return err;
        }
    );
}

function removeUserFromUserSettings(appUser, db, res){
    console.log('remove user from collection "userSettings"');
    db.collection('userSettings').remove( {
            "userId": appUser.userId
        },
        function(err) {
/*            if (err) {
                db.close();
                console.log('Deletion of account for user ' + appUser.userId + ' has failed:',err);
                res.status(200).jsonp({
                        error: 'Deletion of account for user ' + appUser.userId + ' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }
            else {
                console.log('User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"' );
                res.status(400).jsonp({
                        success: 'User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }   */
            return err;
        }
    );
}

function removeUserFromAppUser(appUser, db, res){
    console.log('remove user from collection "AppUser"');
    db.collection('appUser').remove( {
            "accountType" : appUser.accountType,
            "userId": appUser.userId
        },
        function(err) {
/*            if (err) {
                db.close();
                console.log('Deletion of account for user ' + appUser.userId + ' has failed:',err);
                res.status(200).jsonp({
                        error: 'Deletion of account for user ' + appUser.userId + ' has failed',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }
            else {
                console.log('User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"' );
                res.status(400).jsonp({
                        success: 'User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"',
                        data: { 'accountType': appUser.accountType,
                                'userId': appUser.userId }
                });
            }   */
            return err;
        }
    );
}

function createSuccessMessage(appUser, db, res){
    console.log('User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"' );
    res.status(400).jsonp({
            success: 'User account of user ' + appUser.userId + '('+appUser.displayName+') removed from collection "appUser"',
            data: { 'accountType': appUser.accountType,
                    'userId': appUser.userId }
    });
    db.close();
}