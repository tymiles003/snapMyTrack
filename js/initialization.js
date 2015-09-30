// initialization
// 1) assign click events

$('#showLocation').click(showLocation);
$('#sendLocation').click(sendLocation);

function showLocation(){
  var self=this;
  navigator.geolocation.getCurrentPosition(function(position) {
    showGeoDataOnUi(position.coords.latitude, position.coords.longitude);
  });
};

function sendLocation(){
  var self=this;
  navigator.geolocation.getCurrentPosition(function(position) {
    sendGeoDataToServer(position.coords.latitude, position.coords.longitude);
  });
};

function showGeoDataOnUi(latitude, longitude) {
  alert('Show -> Lat:'+latitude+', Long: '+longitude);
};

function sendGeoDataToServer(latitude, longitude) {
  alert('Send -> Lat:'+latitude+', Long: '+longitude);
};
