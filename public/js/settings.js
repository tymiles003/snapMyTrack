var userSettings = {
    userId: "",
    mapTypeId: 'roadmap',
    tracksToShow: 'unlimited'
};
var settingsAtPopinLaunch;

//      mapTypeId: google.maps.MapTypeId.ROADMAP,
//      mapTypeId: google.maps.MapTypeId.SATELLITE,
//      mapTypeId: google.maps.MapTypeId.HYBRID,
//      mapTypeId: google.maps.MapTypeId.TERRAIN,

$('#mapTypeSelect').change(mapTypeOnChange);
$('#tracksToShowSelect').change(tracksToShowOnChange);
$('#settingsTrackRemoveBtn').click(removeSelectedTracksClick);


function mapTypeOnChange(evt){
    userSettings.mapTypeId = $('#mapTypeSelect').val();
    changeMapType( userSettings.mapTypeId );
}

function tracksToShowOnChange(evt){
    if($('#tracksToShowSelect').val() !== userSettings.tracksToShow){
        userSettings.tracksToShow = $('#tracksToShowSelect').val();
        showGeodataReloadSpinner();
        getGeoDataFromServer(signedInUserId, userAccountType, accessTokenFromUrl, userSettings.tracksToShow);
    }
}

function removeSelectedTracksClick(){
    setMessageLogText('All selected tracks will be removed from our servers.');
    hidePopInsButOne('messageLogPopin');
    showMessageLogToConfirm(false, true);
}

function toggleSettings(evt){
    hidePopInsButOne('settingsPopin');
    if($('#settingsPopin').hasClass('isInvisible')){
        // remember settings
        settingsAtPopinLaunch={
            userId: userSettings.userId,
            mapTypeId: userSettings.mapTypeId,
            tracksToShow: userSettings.tracksToShow
        };
        // Update DIV from userSettings
        $('#mapTypeSelect').val(userSettings.mapTypeId);
        $('#tracksToShowSelect').val(userSettings.tracksToShow);
        // Set current select value
        $('#settingsPopin').removeClass('isInvisible');
    }
    else{
        $('#settingsPopin').addClass('isInvisible');
        // update user settings (server)
        if( $('#mapTypeSelect').val() !== settingsAtPopinLaunch.mapTypeId
            || $('#tracksToShowSelect').val() !== settingsAtPopinLaunch.tracksToShow ){
            userSettings.accountType = userAccountType;
            userSettings.userId = signedInUserId;
            sendUserSettingsToServer( userSettings.userId, userSettings.accountType,
                                      userSettings.mapTypeId, userSettings.tracksToShow );
        }
        // update UI (popin closed while update was running)
/*        if(userSettings.tracksToShow !== $('#tracksToShowSelect').val()){
            userSettings.tracksToShow = $('#tracksToShowSelect').val();
            showGeodataReloadSpinner();
            getGeoDataFromServer(signedInUserId, userAccountType, accessTokenFromUrl, userSettings.tracksToShow);
        }
        if( userSettings.mapTypeId !== settingsAtPopinLaunch.mapTypeId ){
            if( userSettings.mapTypeId !== $('#mapTypeSelect').val() ){
                changeMapType( userSettings.mapTypeId );
            }
        }   */
    }
}

function updateUserSettings(userSettingsNew){
    if( userSettingsNew.mapTypeId !== userSettings.mapTypeId
        ||  userSettingsNew.tracksToShow !== userSettings.tracksToShow ){
        userSettings.mapTypeId = userSettingsNew.mapTypeId;
        userSettings.tracksToShow = userSettingsNew.tracksToShow;
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
            var tracksToShow;
            getGeoDataFromServer(userId, accountType, accessToken, userSettings.tracksToShow);
        }
    })
    .fail( function(xhr, statusText, err){
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error (/usersettings, GET): '+err;
        $("#messageArea").text(messageText);
    });
}

function sendUserSettingsToServer(userId, accountType, mapTypeId, tracksToShow) {
  $.post('/usersettings',{
                         accountType: accountType,
                         userId: userId,
                         mapTypeId: mapTypeId,
                         tracksToShow: tracksToShow
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
        var messageText = currentText + ' ------------> ' + 'Error (/usersettings, POST): '+err;
        $("#messageArea").text(messageText);
      });
    var messageText = 'Send ->'
                        + '\n' + 'mapTypeId:    ' + mapTypeId
                        + '\n' + 'tracksToShow: ' + tracksToShow;
    $("#messageArea").text(messageText);
    if(isDevelopment_mode){
        showMessageLog(true);
    }
}

