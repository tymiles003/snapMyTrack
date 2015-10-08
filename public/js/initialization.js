// initialization
// 1) assign click events

$('#userSettingsBtn').click(toggleSettings);
$('#userSettingsCloseBtn').click(toggleSettings);
$('#showMyGeoData').click(showGeoData);
$('#trackLocation').click(sendLocationPeriodically);
$('#userId').keyup(userIdUpdate);

var trackingIsActive=false;

function userIdUpdate (event) {
    if (event.keyCode == 13) {   // ENTER
        initializeUi(event);
    }
}

function showGeoData(event,userId){     // get user settings and show map
    initializeUi(event,userId);
}

function initializeUi(event,userId){     // get user settings and show map
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
    $("#messageArea").text('Add "User Id" for tracking. The user id can be any sequence of characters.');
    return;
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
    }
  }
}

function getGeoDataFromServer(userId) {
  $.getJSON('/geodata?userId='+userId, function( data ) {
      updateGoogleMap(data.geoPoints, userSettings.mapTypeId);
    }
  );
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
    }
  );
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
    var messageText = 'Send -> MapTypeId:'+mapTypeId;
    $("#messageArea").text(messageText);
}

// initial display of map
showGeoData();