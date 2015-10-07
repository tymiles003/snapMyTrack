var userColor=[];
var colorPalette=[
      {name:"Aquamarine", code:"#7FFFD4"},
      {name:"Coral", code:"#FF7F50"},
      {name:"CornflowerBlue", code:"#6495ED"},
      {name:"Gold", code:"#FFD700"},
      {name:"GoldenRod", code:"#DAA520"},
      {name:"HotPink", code:"#FF69B4"},
      {name:"LightBlue", code:"#ADD8E6"},
      {name:"LightSteelBlue", code:"#B0C4DE"},
      {name:"MediumPurple", code:"#9370DB"},
      {name:"MediumOrchid", code:"#BA55D3"}
  ];
var mapZoomDefault = 15;

function updateGoogleMap( geoPoints ){
  if(geoPoints.length>0){
    navigator.geolocation.getCurrentPosition(function(position) {
      var geoInfo = getGeoInfo(geoPoints);
      var latlng = new google.maps.LatLng(geoInfo.centerPoint.lat, geoInfo.centerPoint.lng);
      var zoomRaw = Math.floor(1000*geoInfo.size.width+geoInfo.size.height);
      var mapZoom = mapZoomDefault;
      if(zoomRaw < 4){
        mapZoom = 20;
      }
      else if(zoomRaw < 6){
        mapZoom = 18;
      }
      else if(zoomRaw < 8){
        mapZoom = 16;
      }
      else if(zoomRaw < 10){
        mapZoom = 15;
      }
      else if(zoomRaw < 15){
        mapZoom = 15;
      }
      else if(zoomRaw < 25){
        mapZoom = 13;
      }
      else if(zoomRaw < 50){
        mapZoom = 12;
      }
      else if(zoomRaw < 200){
        mapZoom = 10;
      }
      else{
        mapZoom = 9;
      }
      renderMap(latlng, position, geoPoints, mapZoom);
      }, function(err){
          if (err.code == 1) {
              // user did not allow
              return;
          }
      },
      { enableHighAccuracy: true}
    );
  }
  else{
    navigator.geolocation.getCurrentPosition(function(position) {
      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      renderMap(latlng, position, geoPoints, mapZoomDefault);
      }, function(err){
          if (err.code == 1) {
              // user did not allow
              return;
          }
      },
      { enableHighAccuracy: true}
    );
  }
}

function getColorOfUser(userId){
  var colorOfUser;
  for(var i=0,len=userColor.length;i<len;i++){
    if(userColor[i].userId===userId){
      colorOfUser=userColor[i].color;
      break;
    }
  }
  if(!colorOfUser){
      colorOfUser = colorPalette[userColor.length % colorPalette.length].code;    // Take care, there might be more users than colors
      userColor.push({ userId: userId,
                       color: colorOfUser });
  }
  return colorOfUser;
}

function renderMap(center, currentPosition, geoPoints, mapZoom){
  var myOptions = {
      zoom: mapZoom,
      center: center,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
//      mapTypeId: google.maps.MapTypeId.ROADMAP,
//      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeId: google.maps.MapTypeId.HYBRID,
//      mapTypeId: google.maps.MapTypeId.TERRAIN,
  };
  var map = new google.maps.Map(document.getElementById("GoogleMapsCanvas"), myOptions);

  var markers = [];
  var geoData = [];
  var previousGeoPoint;
  var userCoordinates=[];
  if(geoPoints && geoPoints.length>0){
    for(var i=0,len=geoPoints.length;i<len;i++){
      var latlng = new google.maps.LatLng(geoPoints[i].latitude, geoPoints[i].longitude);
      if( (previousGeoPoint && (previousGeoPoint.userId !== geoPoints[i].userId)) || geoPoints[i].isFirstPointOfTrack || i+1 === geoPoints.length ){
        if( i+1 === geoPoints.length ){
          userCoordinates.push( {
            lat: parseFloat(geoPoints[i].latitude),
            lng: parseFloat(geoPoints[i].longitude)
          });
        }
        var userPath = new google.maps.Polyline({
          path: userCoordinates,
          geodesic: true,
          strokeColor: getColorOfUser(geoPoints[i].userId),
          strokeOpacity: 1.0,
          strokeWeight: 4
        });
        userPath.setMap(map);
        userCoordinates=[];
      }
      else{
        userCoordinates.push( {
          lat: parseFloat(geoPoints[i].latitude),
          lng: parseFloat(geoPoints[i].longitude)
        });
      }
      previousGeoPoint=geoPoints[i];
    }
  }

  var currentlatlng = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
  var markerCurrentPosition = new google.maps.Marker({
    position: currentlatlng,
    map: map,
    title:"You are here! (at least within a "+currentPosition.coords.accuracy+" meter radius)"
  });

//  map.data.addGeoJson(geoData);
}