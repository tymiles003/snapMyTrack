function updateGoogleMap( geoPoints ){

  var latlngForInit;
  if(geoPoints.length>0){
    latlngForInit = new google.maps.LatLng(geoPoints[0].latitude, geoPoints[0].longitude);
    navigator.geolocation.getCurrentPosition(function(position) {
      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      renderMap(latlngForInit, position, geoPoints);
    });
  }
  else{
    navigator.geolocation.getCurrentPosition(function(position) {
      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      renderMap(latlng, position, geoPoints);
    });
  }

};

function renderMap(center, currentPosition, geoPoints){
  var myOptions = {
      zoom: 13,
      center: center,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
//      mapTypeId: google.maps.MapTypeId.ROADMAP,
//      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeId: google.maps.MapTypeId.HYBRID,
//      mapTypeId: google.maps.MapTypeId.TERRAIN,
    };
  var map = new google.maps.Map(document.getElementById("GoogleMapsCanvas"), myOptions);

  var currentlatlng = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
  var markerCurrentPosition = new google.maps.Marker({
    position: currentlatlng,
    map: map,
    title:"You are here! (at least within a "+currentPosition.coords.accuracy+" meter radius)"
  });

  var markers = [];
  var geoData = [];
  if(geoPoints && geoPoints.length>0){
    for(i=0,len=geoPoints.length;i<len;i++){
      var latlng = new google.maps.LatLng(geoPoints[i].latitude, geoPoints[i].longitude);
      markers.push(new google.maps.Marker({
          position: latlng,
          map: map,
          title: geoPoints[i].userId
        })
      );
    }
  }
//  map.data.addGeoJson(geoData);
}