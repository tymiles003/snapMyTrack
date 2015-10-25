var userSettings = {
    userId: "",
    mapTypeId: 'roadmap'
};
//      mapTypeId: google.maps.MapTypeId.ROADMAP,
//      mapTypeId: google.maps.MapTypeId.SATELLITE,
//      mapTypeId: google.maps.MapTypeId.HYBRID,
//      mapTypeId: google.maps.MapTypeId.TERRAIN,

$('#mapTypeSelect').change(mapTypeOnChange);

function mapTypeOnChange(evt){
    toggleSettings(evt);
}

function toggleSettings(evt){
    if($('#settingsPopin').hasClass('isInvisible')){
        // Update DIV from userSettings
        $('#mapTypeSelect').val(userSettings.mapTypeId);
        // Set current select value
        $('#settingsPopin').removeClass('isInvisible');
    }
    else{
        $('#settingsPopin').addClass('isInvisible');
        if( $('#mapTypeSelect').val() !== userSettings.mapTypeId ){
            userSettings.accountType = userAccountType;
            userSettings.userId = signedInUserId;
            userSettings.mapTypeId = $('#mapTypeSelect').val();
            changeMapType( userSettings.mapTypeId );
            sendUserSettingsToServer( userSettings.userId, userSettings.accountType, userSettings.mapTypeId ); 
        }
    }
}

function updateUserSettings(userSettingsNew){
    if( userSettingsNew.mapTypeId !== userSettings.mapTypeId ){
        userSettings.mapTypeId = userSettingsNew.mapTypeId;
        changeMapType( userSettings.mapTypeId );
    }
}

// user userSettings
function getUserSettingsFromServer(userId, accountType, doUpdateMap, accessToken) {
    $.getJSON('/usersettings?userId='+userId+'&accountType='+accountType, function( data ) {
        if(data.userSettings && data.userSettings.length>0){    // expected to be one or none^
            updateUserSettings(data.userSettings[0]);
        }
        if(doUpdateMap){
            getGeoDataFromServer(userId, accountType, accessToken);
        }
    });
}

function sendUserSettingsToServer(userId, accountType, mapTypeId) {
  $.post('/usersettings',{
                         accountType: accountType,
                         userId: userId,
                         mapTypeId: mapTypeId
                       }
      )
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
    var messageText = 'Send -> MapTypeId: '+mapTypeId;
    $("#messageArea").text(messageText);
    if(isDevelopment_mode){
        showMessageLog(true);
    }
}

