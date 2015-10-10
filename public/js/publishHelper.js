function snapLoc(event){
    var userId = $("#userId").val();
    if(userId){
        sendPublishDataToServer(userId);
    }
    else{
        $("#messageArea").text('provide a unique user Id');
        showMessageLog(true);
    }
}

function sendPublishDataToServer( publishLocationOfuserId ){
    var publishTo = "michael.biermann@dsignmatters.com";
    var publishData = {  userId: publishLocationOfuserId,
                         to: publishTo };
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
    
    var messageText = 'Publish location data of user ' + publishLocationOfuserId + ' for ' + publishTo;
    $("#messageArea").text(messageText);
    if(isDevelopment_mode){
        showMessageLog(true);
    }
}
