// initialization
// 1) assign click events

$('#userSettingsBtn').click(toggleSettings);
$('#userSettingsCloseBtn').click(toggleSettings);
$('#sendSnapLocLink').click(snapLoc);
$('#showMyGeoData').click(showGeoData);
$('#trackLocation').click(sendLocationPeriodically);
$('#userId').keyup(userIdUpdate);

var isDevelopment_mode=true;   // Add some dev. info ( success/error messages )
var trackingIsActive=false;

function userIdUpdate (event) {
    if (event.keyCode == 13) {   // ENTER
        initializeUi(event);
    }
}

function getUserIdFromUrl(){
	var params = window.location.href.split('=');
    return params[1] || 0;
}

function showGeoData(event,userId){     // get user settings and show map
    hideMessageLog();
    initializeUi(event,userId);
}

function initializeUi(event,userId){     // get user settings and show map
    spinnerOn();
    // get geo point data of user
    if(userId){
        userIdForShow = userId;
    }
    else{
        userIdForShow = $("#userId").val();
    }
    if(!userIdForShow){
        userIdForShow="allUsers";
    }
    // get user settings and afterwards update map
    getUserSettingsFromServer(userIdForShow, true);
}

function sendLocationPeriodically(event, doNotTogglePeriodicSend){
    var frequencySeconds = 5;   // send every 5 seconds
    var userId = $("#userId").val();
    if(!userId){
    $("#messageArea").text('Add "User Id" for tracking.\nThe user id can be any sequence of characters.');
    showMessageLog(true);
    return;
    }
    else{
    hideMessageLog();
    }
    
    if(trackingIsActive && !doNotTogglePeriodicSend){
    trackingIsActive=false;
    $("#trackLocationStatus").addClass("statusOff");
    $("#trackLocationStatus").removeClass("statusOn");
    }
    else{
    if(trackingIsActive || (!doNotTogglePeriodicSend&&!trackingIsActive) ){
      trackingIsActive=true;
      $("#trackLocationStatus").addClass("statusOn");
      $("#trackLocationStatus").removeClass("statusOff");
      sendLocation();
      setTimeout( function(){
        sendLocationPeriodically( null, true );
      },
      frequencySeconds*1000);
    }
    else{
      return;    // periodic tracking has been switched off
    }
    }
}

function sendLocation(){
  var self=this;

  if(trackingIsActive){
    var userId = $("#userId").val();
    if(userId){
      navigator.geolocation.getCurrentPosition(function(position) {
        // depricated --> https needed, see https://goo.gl/rStTGz
        sendGeoDataToServer(position.timestamp,
                            position.coords.accuracy,
                            position.coords.latitude,
                            position.coords.longitude,
                            position.coords.speed);
      });
      // use watchPosition and move params like speed
    }
    else{
        $("#messageArea").text('provide a unique user Id');
            showMessageLog(true);
        }
  }
}

function getGeoDataFromServer(userId) {
    $.getJSON('/geodata?userId='+userId, function( data ) {
        updateGoogleMap(data.geoPoints, userSettings.mapTypeId);
        setTimeout(function(){spinnerOff();},1750);
    });
}

function sendGeoDataToServer(timestamp, accuracy, latitude, longitude, speed) {
  $.post('/geodata',{
                         userId: $("#userId").val(),
                         timestamp: timestamp,
                         accuracy: accuracy,
                         latitude:latitude,
                         longitude: longitude,
                         speed: speed
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
    var messageText = 'Send -> Latitude:'+latitude+', Longitude: '+longitude+', Speed: '+speed+', Timestamp: '+timestamp+', Accuracy: '+accuracy;
    $("#messageArea").text(messageText);
}

// user userSettings
function getUserSettingsFromServer(userId, doUpdateMap) {
    $.getJSON('/usersettings?userId='+userId, function( data ) {
        if(data.userSettings && data.userSettings.length>0){    // expected to be one or none^
            updateUserSettings(data.userSettings[0]);
        }
        if(doUpdateMap){
            getGeoDataFromServer(userId);
        }
    });
}

function sendUserSettingsToServer(userId, mapTypeId) {
  $.post('/usersettings',{
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

function facebookLoginCallback(response){
    console.log('facebookLoginCallback: ',response);
    if (response.status === 'connected') {
        logInSuccessfull( response.authResponse.userID );
    }
}

function facebookLoginStatusCallback(response){
    console.log('facebookLoginStatusCallback: ',response);
    if (response.status === 'connected') {
        logInSuccessfull( response.authResponse.userID );
    }
    else {
        FB.login(facebookLoginCallback);
    }    
}

function logInSuccessfull(userId){
    // initial display of map
    showGeoData( null, userId );    
}

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
}

window.onload = function() {
    var userIdFromUrl = getUserIdFromUrl();
    if(userIdFromUrl!==0){
        $("#userId").val(userIdFromUrl);        
    }
};

$(document).ready(function() {
/*    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        FB.init({
//          appId: '1685804888318715',  // OpenShift
          appId: '1685807221651815',    // Koding
          version: 'v2.5' // or v2.0, v2.1, v2.2, v2.3, v2.4
        });
//        $('#loginbutton,#feedbutton').removeAttr('disabled');
        FB.getLoginStatus(facebookLoginStatusCallback);
    });   */
});
