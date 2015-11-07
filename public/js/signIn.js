function togglePasswordForgotten(){
    if($('#passwordForgottenPopin').hasClass('isInvisible')){
        $('#passwordForgottenPopin').removeClass('isInvisible');
    }
    else{
        $('#passwordForgottenPopin').addClass('isInvisible');
    }
}

function launchSignInPage(){
	var params = window.location.href.split('?');
	if(params && params[0] && params[0].length>0){
        var location = params[0];
//        location += '?accessTokenUnregisteredUser='+accessTokenFromUrl;
        window.location = location;
	}
}

function sendLogonDataToServer(accountType, userId, password, accessToken, callback) {
    // account types:
    //   - FACEBOOK
    //   - GOOGLE
    //   - WINDOWSLIVE
    //   - PASSWORD
    $.post('/signIn',{
                         accountType: accountType,
                         userId: userId,
                         password: password,
                         accessToken: accessToken
                       }
    )
    .done(function(response){
        callback(response);
    })
    .fail(function(xhr, statusText, err){
        var errorProcessed;
        if(xhr.responseJSON){
            if(xhr.responseJSON.status==='auth_failed'){
                if(xhr.responseJSON.data.access_token_expired){
                    callback({ status: 'requestFailed',
                               data: xhr.responseJSON.data 
                    });
                    return;
                }
            }
        }
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: ' + err;
        $("#messageArea").text(messageText);
        callback({ status: 'requestFailed',
                   data: messageText 
        });            
    });
    var messageText = 'Send -> Account Type: ' + accountType + ' , UserId: ' + userId + ' , Password: xxxxxx';
}

function sendUserChangeDataToServer(accountType, userId, password, displayName, userPicture, pictureUrl, serverUserChangeCallback ){
    var userData = { 'accountType': accountType,
                     'userId': userId,
                     'password': password,
                     'displayName': displayName,
                     'userPicture': userPicture,
                     'pictureUrl': pictureUrl
    };
    
    $.post('/userUpdate', userData)
    .done(function(response){
        var messageText = response.success;
        if(response.data && response.data.length>0){
          messageText += '\n' + JSON.stringify(response.data);
        }
        $("#messageArea").text(messageText);
        serverUserChangeCallback(accountType, userId, response.data);    // response.data = 'appUser'
    })
    .fail(function(xhr, statusText, err){
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: '+err;
        $("#messageArea").text(messageText);
        serverUserChangeCallback(accountType, userId, null);    // response.data = 'appUser'
    });
    
    var messageText = 'Change admin data of user ' + userData.userId;
    $("#messageArea").text(messageText);
    if(isDevelopment_mode){
        showMessageLog(true);
    }
}

function sendPasswordForgottenEmail(){
    var passwordResetData = { userId : document.getElementById('passwordForgottenEmail').value };
    
    $.post('/passwordReset', passwordResetData)
    .done(function(msg){
        var messageText = msg.success;
        if(msg.data && msg.data.length>0){
          messageText += '\n' + JSON.stringify(msg.data);
        }
        $("#messageArea").text(messageText);
    })
    .fail(function(xhr, statusText, err){
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: '+err;
        $("#messageArea").text(messageText);
    });
    
    var messageText = 'Reset password of user ' + passwordResetData.userId;
    $("#messageArea").text(messageText);
    if(isDevelopment_mode){
        showMessageLog(true);
    }
    
    // close popin
    togglePasswordForgotten();
}
