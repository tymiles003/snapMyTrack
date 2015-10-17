// account tools
var userId;
var accessTokenAccountConfirm;
var accessTokenPasswordReset;
var mainPageUrl;

function sendAccountConfirmToServer(userId, accessTokenAccountConfirm, callback) {
    $.post('/accountConfirm',{
                         userId: userId,
                         accessTokenAccountConfirm: accessTokenAccountConfirm
                       }
    )
    .done(function(response){
/*        var messageText = response.success;
        if(response.data && response.data.length>0){
          messageText += '\n' + JSON.stringify(response.data);
        }
        $("#messageArea").text(messageText);   */
        callback(response);
    })
    .fail(function(xhr, statusText, err){
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: ' + err;
        $("#messageArea").text(messageText);
        callback({ status: 'requestFailed',
                   data: messageText 
        });
    });
    var messageText = 'Send (accountConfirm) -> Access Token: ' + accessTokenAccountConfirm + ' , UserId: ' + userId;
/*    $("#messageArea").text(messageText);
      if(isDevelopment_mode){
        showMessageLog(true);
    }    */
}

function sendPasswordChangeDataToServer(userId, accessTokenPasswordReset, password, callback) {
    $.post('/setNewPassword',{
                         userId: userId,
                         accessTokenPasswordReset: accessTokenPasswordReset,
                         password: password
                       }
    )
    .done(function(response){
/*        var messageText = response.success;
        if(response.data && response.data.length>0){
          messageText += '\n' + JSON.stringify(response.data);
        }
        $("#messageArea").text(messageText);   */
        callback(response);
    })
    .fail(function(xhr, statusText, err){
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: ' + err;
        $("#messageArea").text(messageText);
        callback({ status: 'requestFailed',
                   data: messageText 
        });
    });
    var messageText = 'Send (setNewPassword) -> Access Token: ' + accessTokenPasswordReset + ' , UserId: ' + userId + ' , Password: xxxxxx';
/*    $("#messageArea").text(messageText);
      if(isDevelopment_mode){
        showMessageLog(true);
    }    */
}

function getUserIdFromUrl(){      // ToDo -> generalize / make more robust
	var params = window.location.href.split('userId=');
	if( params && params[1] ){
        if( params[1].split('&')[0] ){
            return params[1].split('&')[0];
        }
	}
    return null;
}

function getAccessTokenAccountConfirmFromUrl(){      // ToDo -> generalize / make more robust
	var params = window.location.href.split('accessTokenAccountConfirm=');
    return params[1] || null;
}

function getAccessTokenPasswordResetFromUrl(){      // ToDo -> generalize / make more robust
	var params = window.location.href.split('accessTokenPasswordReset=');
    return params[1] || null;
}

window.onload = function() {
    userId=getUserIdFromUrl();
    accessTokenAccountConfirm = getAccessTokenAccountConfirmFromUrl();
    if(accessTokenAccountConfirm){
       sendAccountConfirmToServer( userId, accessTokenAccountConfirm, accountConfirmCallback );
       return; 
    }
    else{
        accessTokenPasswordReset = getAccessTokenPasswordResetFromUrl();
        if(accessTokenPasswordReset){
           sendPasswordChangeDataToServer( userId, accessTokenPasswordReset, passwordChangeCallback );
           return; 
        }
    }
};

function accountConfirmCallback( response ){
    if(response && !response.error && !response.data.isNewUnconfirmed){
        $('#accountConfirmLongtext').text('Your account has been confirmed');
        $('#goToMainPageBtn').removeClass('isInvisible');
        document.getElementById('goToMainPageBtn').onclick=navigateToMainPage;
        mainPageUrl = response.data.mainPageUrl;
    }
    else{
        console.log('Account confirmation has failed');        
        console.log(response.error);        
        console.log(response.data);        
    }
}

function passwordChangeCallback( response ){
    if(response && !response.error){
        $('#passwordChangeLongtext').text('Your password has been changed');
        document.getElementById('passwordChangeFrame').style.visibility = 'hidden';
        $('#goToMainPageBtn').removeClass('isInvisible');
        document.getElementById('goToMainPageBtn').onclick=navigateToMainPage;
        mainPageUrl = response.data.mainPageUrl;
    }
    else{
        console.log('Password change has failed');        
        console.log(response.error);        
        console.log(response.data);        
    }
}

function navigateToMainPage(){
    window.location = mainPageUrl;
}