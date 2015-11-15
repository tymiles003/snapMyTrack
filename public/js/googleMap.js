var map;
var mapIsReadyToUse;
var userPaths=[];
var currentTrack;
var currentBounds;
var geopointMarkers=[];
var tooltipMarkers=[];
var markerCurrentPosition;
var infoWindow;
var userColor=[];
var colorPalette=[
      {name:"Aquamarine", code:"#7FFFD4"},
      {name:"DarkViolet", code:"#9400D3"},
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
var colorCurrentTrackBright = {name:"Tomato", code:"#FF6347"};
var colorCurrentTrackDark = {name:"Tomato", code:"#FF6347"};
var colorSelectedTrackBright = {name:"DeepPink", code:"#FF1493"};
var colorSelectedTrackDark = {name:"DeepPink", code:"#FF1493"};
var currentCenter;
var currentTrackInfo;
// var initialLoadCenter;
// var initialLoadZoom;

function getPictureUrlForUser(userId){
    var pictureUrl;
    if(currentTrackInfo){
        for(var i=0, len_i=currentTrackInfo.appUser.length; i<len_i; i++){
            if(currentTrackInfo.appUser[i].userId === userId){
               pictureUrl = currentTrackInfo.appUser[i].pictureUrl; 
            }
        }        
    }
    return pictureUrl;
}

function displayGeopointsOnMap(geoPoints, trackInfo, currentPosition, mapTypeId, tracksToShow){
    var geoInfo = getGeoInfo(geoPoints);
    var latlng = new google.maps.LatLng(geoInfo.centerPoint.lat, geoInfo.centerPoint.lng);
    renderMap(latlng, currentPosition, geoPoints, trackInfo, mapTypeId, tracksToShow);
}

function updateGoogleMap( geoPoints, trackInfo, mapTypeId, tracksToShow ){
    if(geoPoints.length>0){
        displayGeopointsOnMap(geoPoints, trackInfo, null, mapTypeId, tracksToShow);
        setTimeout(function() { setCurrentLocationOnMap(); }, 10);
    }
    else{
        navigator.geolocation.getCurrentPosition(
            function(position) {
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                renderMap(latlng, position, geoPoints, trackInfo, mapTypeId, tracksToShow);
            },
            function(err){
                if (err.code == 1) {
                    // user did not allow
                    if(isDevelopment_mode){
                        $("#messageArea").text(err.message);
                        showMessageLog(true);
                    }
                    return;
                }
            },
            getGeolocationOptions()
        );
    }
}

function hideMap(){
    document.getElementById("GoogleMapsCanvas").style.visibility = 'hidden';
}

function resetMap(){
    if(map){
//        var initialLoadCenter = null;
//        var initialLoadZoom = null;
        // markers
        for(var i=0,len_i=tooltipMarkers.length;i<len_i;i++){
            tooltipMarkers[i].marker.setMap(null);
        }
        // geoPoint Markers
        for(var j=0,len_j=geopointMarkers.length;j<len_j;j++){
            geopointMarkers[j].marker.setMap(null);
        }
        // paths
        for(var k=0,len_k=userPaths.length;k<len_k;k++){
            userPaths[k].polyline.setMap(null);
        }
    }
    else{
        // ToDo
        // initial load ...
    }
}

function getTrackColorCurrent(){
    if(!map) return;
    if( isThemeDark( map.getMapTypeId() ) ){    
        col = colorCurrentTrackDark.code;
    }
    else{
        col = colorCurrentTrackBright.code;
    }
    return col;
}

function getTrackColorSelected(){
    if(!map) return;
    if( isThemeDark( map.getMapTypeId() ) ){    
        col = colorSelectedTrackDark.code;
    }
    else{
        col = colorSelectedTrackBright.code;
    }
    return col;
}

function getNewColor(){
    var nextColor = colorPalette[userColor.length % colorPalette.length].code;    // Take care, there might be insufficient colors -> reuse them
    userColor.push({ userId: 'random'+userColor.length,
                     color: nextColor });
    return nextColor;
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
        // change map type
        map.setMapTypeId(mapTypeId);
        // adjust adjustColorTheme of overlay (title, buttons, ...)
        adjustColorTheme(mapTypeId);
    }
}

function isThemeDark(mapTypeId){
    return mapTypeId === google.maps.MapTypeId.ROADMAP || mapTypeId === google.maps.MapTypeId.TERRAIN;
}

function adjustColorTheme(mapTypeId){
    if( isThemeDark(mapTypeId) ){
        $('#publishBtn').removeClass('publishIconBright');
        $('#publishBtn').addClass('publishIconDark');
        $('#trackLocation').removeClass('button');
        $('#trackLocation').addClass('buttonDark');
        $('#userSettingsBtn').removeClass('settingsIconBright');
        $('#userSettingsBtn').addClass('settingsIconDark');
        $('#userDisplayName').removeClass('fontColorBright');
        $('#userDisplayName').addClass('fontColorDark');
        $('#userImage').removeClass('userPictureSmall');
        $('#userImage').addClass('userPictureSmallDark');
        if( $('#trackLocationStatus').hasClass('statusOff') ){
            $('#trackLocationStatus').removeClass('statusOff');
            $('#trackLocationStatus').addClass('statusOffDark');
        }
    }
    else{
        $('#publishBtn').removeClass('publishIconDark');
        $('#publishBtn').addClass('publishIconBright');
        $('#trackLocation').removeClass('buttonDark');
        $('#trackLocation').addClass('button');
        $('#userSettingsBtn').removeClass('settingsIconDark');
        $('#userSettingsBtn').addClass('settingsIconBright');
        $('#userDisplayName').removeClass('fontColorDark');
        $('#userDisplayName').addClass('fontColorBright');
        $('#userImage').removeClass('userPictureSmallDark');
        $('#userImage').addClass('userPictureSmall');
        if( $('#trackLocationStatus').hasClass('statusOffDark') ){
            $('#trackLocationStatus').removeClass('statusOffDark');
            $('#trackLocationStatus').addClass('statusOff');
        }
    }
}

function setCurrentLocationOnMap(){
    navigator.geolocation.getCurrentPosition(function(position) {
            updateCurrentLocationOnMap(position);
        }, function(err){
            if (err.code == 1) {
                // user did not allow
                if(isDevelopment_mode){
                    $("#messageArea").text(err.message);
                    showMessageLog(true);
                }
            }
        },
        { enableHighAccuracy: true}
    );
}

function updateCurrentLocationOnMap(currentPosition){
    if(!map) return;
    
    var currentlatlng = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
    if (!markerCurrentPosition){
        var pictureUrl = getPictureUrlForUser(signedInUserId);
        if(!pictureUrl){
            pictureUrl = userPictureUrl;
        }
        if(pictureUrl){
            var myIcon = {
                url: pictureUrl,
//                size: new google.maps.Size(20, 20),
//                origin: new google.maps.Point(0, 0),
//                anchor: new google.maps.Point(0, 20)
                scaledSize: new google.maps.Size(32, 32)
            };
//            var myShape = 
            markerCurrentPosition = new google.maps.Marker({
                position: currentlatlng,
                map: map,
                title: "You are here!",
                icon: myIcon,
//                shape: myShape
            });
        }
        else{
            markerCurrentPosition = new google.maps.Marker({
                position: currentlatlng,
                map: map,
                title: "You are here!"
            });
        }
    }
    else{
        markerCurrentPosition.setPosition(currentlatlng);
        markerCurrentPosition.setTitle( "You are here!" );
    }
}

function adoptMapAfterResize(){
//    if( !initialLoadZoom || initialLoadZoom === map.getZoom() ){
//        && ( !initialLoadCenter || getDistanceFromLatLonInKmGapi(initialLoadCenter, map.getCenter()) < 0.25 )){
        map.fitBounds(currentBounds);
//    }
}

function setMapCenter(position, latLng){
    if(position){
        var currentlatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.panTo(currentlatlng);
//        map.setCenter(currentlatlng);
        currentCenter = currentlatlng;
    }
    else if (latLng){
        map.panTo(latLng);
//        map.setCenter(latLng);
        currentCenter = latLng;
    }
    else{
        // do not change center of map
    }
}

function updateCurrentTrackOnMap(currentPosition){
    if(!map) return;
    
    if (!currentTrack){
        // create new track
        var coordinates = [];
        coordinates.push( {
            lat: parseFloat(currentPosition.coords.latitude),
            lng: parseFloat(currentPosition.coords.longitude)
          });
        addUserPath(coordinates, null, null, true, signedInUserId, userDisplayName);
    }
    else{
        // add point to track
        var currentlatlng = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
        addPointToTrack(currentTrack, currentlatlng);
    }
}

function addPointToTrack(currentTrack, currentlatlng){
    var path = currentTrack.polyline.getPath();
    path.push(currentlatlng);
}

function getDistanceFromLatLonInKmGapi(currentGeoPoint, previousGeoPoint) {
    return getDistanceFromLatLonInKm( { latitude: currentGeoPoint.lat(), 
                                        longitude: currentGeoPoint.lng() },
                                      { latitude: previousGeoPoint.lat(),
                                        longitude: previousGeoPoint.lng() } );
}

function getDistanceFromLatLonInKm(currentGeoPoint, previousGeoPoint) {
    // Haversine formula -> see http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula 
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(currentGeoPoint.latitude-previousGeoPoint.latitude);  // deg2rad below
    var dLon = deg2rad(currentGeoPoint.longitude-previousGeoPoint.longitude);
    var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(previousGeoPoint.latitude)) * Math.cos(deg2rad(currentGeoPoint.latitude)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

function pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint){
    return Math.floor( (currentGeoPoint.timestamp - previousGeoPoint.timestamp) / 1000 );    // seconds
}

function isTrackEnd(previousGeoPoint, currentGeoPoint){
    var trackEnd;
    if( !previousGeoPoint ){
        return trackEnd;   // first point
    }

    if( previousGeoPoint.userId !== currentGeoPoint.userId ){
        trackEnd=true;   // different user
    }
    else if ( getDistanceFromLatLonInKm(currentGeoPoint, previousGeoPoint) > 3 
        && pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint) < 60){
            trackEnd=true;   // timestamp difference more than one hour (and location different)
    }
    else if ( pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint) > 60 ){
        trackEnd=true;   // timestamp difference more than one hours
    }
    else if ( pointTimestampDiffInSeconds(currentGeoPoint, previousGeoPoint) > 60*60 ){
        trackEnd=true;   // timestamp difference more than one hours
    }
    return trackEnd;
}

function addUserPath( userCoordinates, trackInfo, trackNumber, isCurrentTrack, userId, displayName){
    var trackColor;
    var displayText = displayName;
    if(!displayText){
        displayText = "Track "+trackNumber ();
    }
    if(isCurrentTrack){
        trackColor = getTrackColorCurrent();
    }
    else{
        trackColor = getNewColor();
    }
    
    var polylineOptions = {
        path: userCoordinates,
        geodesic: false,
        strokeColor: trackColor,
        strokeOpacity: 1.00,
        strokeWeight: 2.50
    };
    
    // make all paths but the current 'dotted'
    if(!isCurrentTrack){
        polylineOptions.strokeOpacity = 0.60;
        polylineOptions.strokeWeight = 1.75;
        polylineOptions.icons = getTrackIcons( trackColor, isCurrentTrack, false);
    }

    var userPolyline = new google.maps.Polyline(polylineOptions);
    userPolyline.setMap(map);
    ( function(){
        addCustomListener(userPolyline, 'click', trackNumber, userId, displayText); 
    })();
    if(isCurrentTrack){
        currentTrack = { trackNumber: trackNumber,
                         polyline: userPolyline,
                         selected: false,
                         trackColor: trackColor,
                         userId: userId,
                         displayName: displayName
        };
    }
    else{
        userPaths.push({ trackNumber: trackNumber,
                         polyline: userPolyline,
                         selected: false,
                         trackColor: trackColor,
                         userId: userId,
                         displayName: displayName
        });
    }
}

function getTrackIcons(trackColor, isCurrentTrack, isSelected){
    var opt;
    if(isCurrentTrack){
        opt = []; 
    }
    else{
        opt = [{ icon: pathIcon(trackColor),
                 offset: '100%',
                 strokeColor: "#000000",
                 strokeOpacity :1,
                 repeat: "10px"
            }];
        if(isSelected){
            opt=[];
//            opt.strokeColor=getTrackColorSelected();
        }
    }
    return opt;
}

function renderMap(center, currentPosition, geoPoints, trackInfo, mapTypeId, tracksToShow){
    currentCenter = center;
    currentTrackInfo = trackInfo;
    if(map){
        // remove all tracks but the currently recording track
        resetMap();
//        map.setZoom(mapZoomDefault);
    }
    else{
        var myOptions = {
                center: center,
//                zoom: mapZoomDefault,
                mapTypeControl: false,
                zoomControl: true,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: true,                
                navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
                mapTypeId: mapTypeId,
            };
        map = new google.maps.Map(document.getElementById("GoogleMapsCanvas"), myOptions);
    }

    // after rendering the map for the first time
    google.maps.event.addListenerOnce(map, 'idle', function(){ mapIsReadyToUse = true; });

    // listener for click event of map (not called, for clicks on shapes)
    map.addListener('click', mapClick);

    // listener for click event of map (not called, for clicks on shapes)
    // google.maps.event.addListener(map, 'dblclick', function(){ mapZoomed(); });

    userPaths=[];
    var previousGeoPoint;
    var userCoordinates=[];
    if(geoPoints && geoPoints.length>0){
        for(var i=0,len=geoPoints.length;i<len;i++){
            if( previousGeoPoint && previousGeoPoint.trackNumber !== geoPoints[i].trackNumber ){
//            if( isTrackEnd(previousGeoPoint, geoPoints[i]) ){
                if(userCoordinates.length > 1){
                    addUserPath(userCoordinates, geoPoints[i].trackInfo, geoPoints[i].trackNumber, false, geoPoints[i].userId, geoPoints[i].displayName);
                }
                else if (userCoordinates.length === 1){
                    // only one point, display a marker instead of a path
                    addGeopointMarker(geoPoints[i].latitude,geoPoints[i].longitude,geoPoints[i].timestamp, geoPoints[i].displayName);
                }
                previousGeoPoint=null;
                userCoordinates=[];
            }
            
            userCoordinates.push( {
                lat: parseFloat(geoPoints[i].latitude),
                lng: parseFloat(geoPoints[i].longitude)
            });

            // always make sure to display last track
            if( i+1 === geoPoints.length ){
                if(userCoordinates.length > 1){
                    addUserPath(userCoordinates, geoPoints[i].trackInfo, geoPoints[i].trackNumber, false, geoPoints[i].userId, geoPoints[i].displayName);
                }
                else if (userCoordinates.length === 1){
                    // only one point, display a marker instead of a path
                    addGeopointMarker(geoPoints[i].latitude,geoPoints[i].longitude,geoPoints[i].timestamp, geoPoints[i].displayName);
                }
                previousGeoPoint=null;
                userCoordinates=[];
            }

            previousGeoPoint=geoPoints[i];
        }
    }

    if(currentPosition){
        updateCurrentLocationOnMap(currentPosition);
    }

    if(geoPoints.length>0){
        currentBounds = new google.maps.LatLngBounds();
        for(var j=0, len_j=geoPoints.length; j<len_j; j++){
            currentBounds.extend(new google.maps.LatLng(geoPoints[j].latitude, geoPoints[j].longitude));
        }
//        if( (!initialLoadZoom || initialLoadZoom === map.getZoom() )
//            && ( !initialLoadCenter )){   // || getDistanceFromLatLonInKmGapi(initialLoadCenter, map.getCenter()) < 0.25 )){
            map.fitBounds(currentBounds);
//        }
/*        if(!initialLoadCenter || !initialLoadZoom){
            setTimeout( function(){
                if(!initialLoadCenter){
                    initialLoadCenter = map.getCenter();
                }
                if(!initialLoadZoom){
                    initialLoadZoom = map.getZoom();
                }
            }, 0);
        }   */
    }
    else if (currentPosition){
        map.setCenter(new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude));
        map.setZoom(mapZoomDefault);
    }

    infoWindow = new google.maps.InfoWindow();
    if( document.getElementById("GoogleMapsCanvas").style.visibility === 'hidden' ){
        document.getElementById("GoogleMapsCanvas").style.visibility = '';
    }
    
    // adjust adjustColorTheme of overlay (title, buttons, ...)
    adjustColorTheme(mapTypeId);

    // show map
    $("#GoogleMapsCanvas").removeClass('isInvisible');
}

function addCustomListener( userPath, eventName, trackNumber, userId, displayText){
    if(eventName==='click'){
        userPath.addListener('click', function(event){ 
            pathClick( event, trackNumber, userId, displayText ); 
        });
    }
    else if(eventName==='mouseover'){
        userPath.addListener('mouseover', function(event){ 
            pathMouseOver( event, trackNumber, userId, displayText ); 
        });
    }
    else if(eventName==='mouseout'){
        userPath.addListener('mouseout', function(event){ 
            pathMouseOut( event, trackNumber, userId, displayText ); 
        });
    }
}

function mapClick(event){
/*    var contentString = 'M: ' + event.latLng.J +  ', L: ' + event.latLng.M;
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);  */
    if( document.getElementById('authorizeWithFacebookBtn').style.visibility === ''){
        resetPasswordLogin();
    }
    return false;    // stop event propagation
}

function createMarkerClass(className, color){
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '.' + className + ' { '
                      + 'color: ' + color + ';'
                      + 'font-size: 80%;'
                      + 'border: 1px solid #C3C3C3;'
                      + 'border-radius: 4.5px;'
                      + 'background-color:#484848;'
                      + 'padding-left: 0.5em;'
                      + 'padding-right: 0.5em;'
                      + 'padding-top: 0.2em;'
                      + 'padding-bottom: 0.2em;'
                      + ' }';
    document.getElementsByTagName('head')[0].appendChild(style);
}

function addGeopointMarker(latitude, longitude, timestamp, displayName){
    var latLng = new google.maps.LatLng(latitude,longitude);
    var titleDate = new Date( parseFloat(timestamp) );
    var titleDateString;
    if(userSettings.tracksToShow === 'latestLocation'){
        titleDateString = titleDate.toLocaleString();
    }
    else{
        titleDateString = titleDate.toLocaleDateString();
    }
    addGeopointMarkerGeneric("singlePoint", latLng, null, displayName, titleDateString);        
}

function addGeopointMarkerGeneric(type, latLng, userId, displayName, labelText){
    var className;
    var color;
    var labelContent;
    // userId
    if(userId){
        color = getColorOfUser(userId);
        className = "geoPointLabel_" + userId;
    }
    // label content
    if(labelText){
        labelContent = labelText;
    }
    // type
    if(type){
        if(type === "singlePoint"){
            color = "5656AA";
            className = type;
        }
    }
    // marker class
    createMarkerClass(className, color);
    // icon
    var myIcon = pinSymbolUserId(color);
    // create marker 
    var geopointMarker = new MarkerWithLabel({
        position: latLng,
        map: map,
        labelContent: labelContent,
        labelAnchor: latLng,
        labelClass: className,
        labelInBackground: false,
        icon: myIcon
    });
    geopointMarkers.push({  type: type,
                            userId: userId,
                            displayName: displayName,
                            labelText: labelText,
                            marker: geopointMarker });
}

function pathMouseOver(event, pathId, userId, displayName){
    var color = getColorOfUser(userId);
    var userLabelClassName = "label_" + userId;
    createMarkerClass( userLabelClassName, color);
    var myIcon = pinSymbolUserId( color );
    var tooltipMarker = new MarkerWithLabel({
        position: event.latLng,
        map: map,
//        draggable: true,
//        raiseOnDrag: true,
        labelContent: displayName,
        labelAnchor: event.latLng,
        labelClass: userLabelClassName,
        labelInBackground: false,
        icon: myIcon
    });
    tooltipMarkers.push({ pathId: pathId,
                          userId: userId,
                          displayName: displayName,
                          marker: tooltipMarker });
}

function pathMouseOut(event, pathId, userId, displayName){
    for(var i=0, len=tooltipMarkers.length; i<len; i++){
        if(tooltipMarkers[i].pathId === pathId){
            tooltipMarkers[i].marker.setMap(null);
        }
    }
}

function pathClick(event, trackNumber, userId, displayText){
    // set selected path
    for(var i=0, len_i=userPaths.length; i<len_i;i++){
        if(userPaths[i].trackNumber===trackNumber){
            if(userPaths[i].selected){
                userPaths[i].selected=false;
                // change stroke/color
                userPaths[i].polyline.setOptions({"strokeWeight": 2.5});
                userPaths[i].polyline.setOptions({"strokeOpacity": 1.00});
                userPaths[i].polyline.setOptions({"strokeColor": userPaths[i].trackColor});
                userPaths[i].polyline.setOptions({"icons": getTrackIcons( userPaths[i].trackColor, false, false)});
            }
            else{
                userPaths[i].selected=true;
                // change stroke/color
                userPaths[i].polyline.setOptions({"strokeWeight": 4.0});
                userPaths[i].polyline.setOptions({"strokeOpacity": 1.00});
                userPaths[i].polyline.setOptions({"strokeColor": getTrackColorSelected()});
                userPaths[i].polyline.setOptions({"icons": getTrackIcons( getTrackColorSelected(), false, true)});
            }
        }
    }
    // info window
    if( tracksOfMultipleUsers() ){
        contentString = '<div class="pathTooltip">'+displayText+'</div>';
        var pictureUrl = getPictureUrlForUser(userId);
        if(pictureUrl){
            contentString += '<img src="'+pictureUrl+'">';
        }
        infoWindow.setContent(contentString);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
    }
}

function tracksOfMultipleUsers(){
    var uniqueUserId;
    for(var j=0, len_j=userPaths.length; j<len_j;j++){
        if(!uniqueUserId){
            uniqueUserId=userPaths[j].userId;
        }
        else if(uniqueUserId !== userPaths[j].userId){
            return true;
        }
    }
    return false;    
}

function circlePath(cx, cy, r){
    return 'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0';
}

function pathIcon(color) {
    return {
        path: circlePath(0,0,0.5),
        fillColor: color,
        fillOpacity: 1,
        strokeColor: color,
        strokeWeight: 4,
        scale: 2
    };
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

