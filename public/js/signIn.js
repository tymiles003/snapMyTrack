function togglePasswordForgotten(){
    if($('#passwordForgottenPopin').hasClass('isInvisible')){
        $('#passwordForgottenPopin').removeClass('isInvisible');
    }
    else{
        $('#passwordForgottenPopin').addClass('isInvisible');
    }
}

function sendLogonDataToServer(accountType, userId, displayName, password, callback) {
    // account types:
    //   - FACEBOOK
    //   - GOOGLE
    //   - WINDOWSLIVE
    //   - PASSWORD
    $.post('/signIn',{
                         accountType: accountType,
                         userId: userId,
                         displayName: displayName,
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
    var messageText = 'Send -> Account Type: ' + accountType + ' , UserId: ' + userId + ' , Password: xxxxxx';
/*    $("#messageArea").text(messageText);
      if(isDevelopment_mode){
        showMessageLog(true);
    }    */
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
