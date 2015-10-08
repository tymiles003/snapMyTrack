var map;
var tooltipMarkers=[];
var infoWindow;
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

function updateGoogleMap( geoPoints, mapTypeId ){
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
      renderMap(latlng, position, geoPoints, mapZoom, mapTypeId);
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
      renderMap(latlng, position, geoPoints, mapZoomDefault, mapTypeId);
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

function changeMapType(mapTypeId){
    if(map){
        map.setMapTypeId(mapTypeId);
    }
}

function renderMap(center, currentPosition, geoPoints, mapZoom, mapTypeId){
  var myOptions = {
      zoom: mapZoom,
      center: center,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: mapTypeId,
  };
  map = new google.maps.Map(document.getElementById("GoogleMapsCanvas"), myOptions);
  // listener for click event of map (not called, for clicks on shapes)
  // map.addListener('click', mapClick);
  
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
          strokeWeight: 4,
        });
        userPath.setMap(map);
        ( function(){
            addListener( userPath, 'click', i, geoPoints[i].userId ); 
        })();
        ( function(){
            addListener( userPath, 'mouseover', i, geoPoints[i].userId ); 
        })();
        ( function(){
            addListener( userPath, 'mouseout', i, geoPoints[i].userId ); 
        })();
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

  infoWindow = new google.maps.InfoWindow();
}

function addListener( userPath, eventName, idx, userId){
    if(eventName==='click'){
        userPath.addListener('click', function(event){ 
            pathClick( event, idx, userId ); 
        });
    }
    else if(eventName==='mouseover'){
        userPath.addListener('mouseover', function(event){ 
            pathMouseOver( event, idx, userId ); 
        });
    }
    else if(eventName==='mouseout'){
        userPath.addListener('mouseout', function(event){ 
            pathMouseOut( event, idx, userId ); 
        });
    }
}

function mapClick(event){
    var contentString = 'M: ' + event.latLng.J +  ', L: ' + event.latLng.M;
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    
    infoWindow.open(map);
}

function createUserLabelClass(className, color){
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.' + className + ' { '
                      + 'color: ' + color + ';'
                      + 'font-size: 200%;'
                      + 'border: 1px solid #ffffff;'
                      + 'border-radius: 4.5px;'
                      + 'background-color: 484848;'
                      + 'padding-left: 0.5em;'
                      + 'padding-right: 0.5em;'
                      + 'padding-top: 0.2em;'
                      + 'padding-bottom: 0.2em;'
                      + ' }';
    document.getElementsByTagName('head')[0].appendChild(style);
}

function pathMouseOver(event, pathId, userId){
    var color = getColorOfUser(userId);
    var userLabelClassName = "label_" + userId;
    createUserLabelClass( userLabelClassName, color);
    var myIcon = pinSymbolUserId( color );
    var tooltipMarker = new MarkerWithLabel({
        position: event.latLng,
        map: map,
//        draggable: true,
//        raiseOnDrag: true,
        labelContent: userId,
        labelAnchor: event.latLng,
        labelClass: userLabelClassName,
        labelInBackground: false,
        icon: myIcon
    });
    tooltipMarkers.push({ pathId: pathId,
                          userId: userId,
                          marker: tooltipMarker });
}

function pathMouseOut(event, pathId, userId){
    for(var i=0, len=tooltipMarkers.length; i<len; i++){
        if(tooltipMarkers[i].pathId === pathId){
            tooltipMarkers[i].marker.setMap(null);
        }
    }
}

function pathClick(event, pathId, userId){
    contentString = '<div class="pathTooltip">'+userId+'</div>';
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}

function pinSymbolUserId(color) {
    return {
        path: 'M -2,0 0,-2 2,0 0,2 z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: color,
        strokeWeight: 2,
        scale: 2
    };
}

function pinSymbol(color) {
    return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: color,
        strokeWeight: 2,
        scale: 2
    };
}

