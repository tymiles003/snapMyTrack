// initialization
// 1) assign click events

$('#showMyGeoData').click(showGeoData);
$('#trackLocation').click(sendLocationPeriodically);

var trackingIsActive=false;

function showGeoData(evt,userId){
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
  getGeoDataFromServer(userIdForShow);
};

function sendLocationPeriodically(evt, doNotTogglePeriodicSend){
  var frequencySeconds = 15;   // send every 15 seconds
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
      frequencySeconds*1000)
    }
    else{
      return;    // periodic tracking has been switched off
    }
  }
};

function sendLocation(){
  var self=this;

  if(trackingIsActive = true){
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
};

function getGeoDataFromServer(userId) {
  $.getJSON('/geodata?userId='+userId, function( data ) {
      updateGoogleMap(data.geoPoints);
    }
  );
};

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
        var messageText = msg.success
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
};

// initial display of map
showGeoData();