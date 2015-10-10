var userSettings = {
    userId: "",
    mapTypeId: google.maps.MapTypeId.ROADMAP
}
//      mapTypeId: google.maps.MapTypeId.ROADMAP,
//      mapTypeId: google.maps.MapTypeId.SATELLITE,
//      mapTypeId: google.maps.MapTypeId.HYBRID,
//      mapTypeId: google.maps.MapTypeId.TERRAIN,

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
            userSettings.mapTypeId = $('#mapTypeSelect').val();
            changeMapType( userSettings.mapTypeId );
            var userId = $("#userId").val();
            if(!userId){
                userId = 'allUsers';
            }
            sendUserSettingsToServer( userId, userSettings.mapTypeId ); 
        }
    }
}

function updateUserSettings(userSettingsNew){
    if( userSettingsNew.mapTypeId !== userSettings.mapTypeId ){
        userSettings.mapTypeId = userSettingsNew.mapTypeId;
        changeMapType( userSettings.mapTypeId );
    }
}