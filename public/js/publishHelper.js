function togglePublish(){
    // check if sign-in via access token (and w/o oAuth)
    if(!signedInUserId){
        $("#messageArea").text("Sign in to record or publish tracks (Facebook, Google, Microsoft or Email).");
        showMessageLog(false, false, true);
        return;
    }

    if($('#publishPopin').hasClass('isInvisible')){
        $('#publishPopin').removeClass('isInvisible');
    }
    else{
        $('#publishPopin').addClass('isInvisible');
    }
    hidePopInsButOne("publishPopin");
}

function publish(event){
    if(signedInUserId){
        var sendToEmail = document.getElementById('publishEmailInput').value;
        var publishPeriod = $('#publishPeriodSelect').val();
        sendPublishDataToServer(userAccountType, signedInUserId, userDisplayName, null, null, null, publishPeriod, sendToEmail);
    }
    else{
        $("#messageArea").text('provide a unique user Id');
        showMessageLog(true);
    }
    togglePublish();
}

function sendPublishDataToServer( publisherAccountType, publisherUserId, publisherDisplayName,
                                  publishedForAccountType, publishedForUserId, publishedForDisplayName,
                                  publishPeriod,
                                  sendToEmail){
    var publishTo = sendToEmail;
    var publishData = { publisherAccountType: publisherAccountType,
                        publisherUserId: publisherUserId,
                        publisherDisplayName: publisherDisplayName,
                        publishedForAccountType: publishedForAccountType,
                        publishedForUserId: publishedForUserId,
                        publishedForDisplayName: publishedForDisplayName,
                        publishPeriod: publishPeriod,
                        sendToEmail: sendToEmail};
    $.post('/publish',publishData)
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
    
    var messageText = 'Publish location data of user ' + publisherDisplayName + ' to ' + sendToEmail;
    $("#messageArea").text(messageText);
    if(isDevelopment_mode){
        showMessageLog(true);
    }
}