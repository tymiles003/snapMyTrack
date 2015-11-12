function getUserParameter(param){
    var paramValue;
    switch(param){
        case 'accountType': {
            paramValue = localStorage.getItem(param);
            if(!paramValue || paramValue  === "undefined" || paramValue  === undefined){
                paramValue="";
            }
        }
    }
    return paramValue;
}

function setUserParameter(param,value){
    var paramSupported=false;
    switch(param){
        case 'accountType': { localStorage.setItem(param,value);
                              paramSupported = true; }
    }
    return paramSupported;
}

function removeUserParameter(param){
    var paramSupported=false;
    switch(param){
        case 'accountType': { localStorage.removeItem(param);
                              paramSupported = true; }
    }
    return paramSupported;
}

function positionQualityOk(position){
    if(position.accuracy<=250){     // location inside a 250 meter circle (radius), 95% significance level
        return true;
    }
    else{
        return false;
    }
}

function getGeoInfo(geoPoints) {

  var latitudes=[];
  var longitudes=[];
  var geoInfo = { centerPoint: {},
                  medianPoint: {},
                  size: {}
                };

  for(var i=0, len=geoPoints.length; i<len;i++){
    latitudes.push(parseFloat(geoPoints[i].latitude));
    longitudes.push(parseFloat(geoPoints[i].longitude));
  }

  // sort
  latitudes.sort( function(l,m) {return l - m;} );
  longitudes.sort( function(l,m) {return l - m;} );

  // center point
  geoInfo.centerPoint = getCenterPoint(latitudes, longitudes);

  // median point
  geoInfo.centerPoint = getCenterPoint(latitudes, longitudes);

  // width/height
  geoInfo.size = getSize(latitudes, longitudes);

  return geoInfo;
}

function getSize(latitudes, longitudes) {
  var size = {};

  // latitude
  size.height = latitudes[latitudes.length-1] - latitudes[0];
  // longitude
  size.width = longitudes[longitudes.length-1] - longitudes[0];

  return size;
}

function getCenterPoint(latitudes, longitudes) {
  var centerPoint={};

  // latitude
  centerPoint.lat = ( latitudes[latitudes.length-1] + latitudes[0] ) / 2;
  // longitude
  centerPoint.lng = ( longitudes[longitudes.length-1] + longitudes[0] ) / 2;

  return centerPoint;
}

function getMedianPoint(latitudes, longitudes) {
  var medPoint={};

  // latitude
  var medLatIdx = Math.floor(latitudes.length/2);
  if(latitudes.length % 2){
    medPoint.lat=latitudes[medLatIdx];
  }
  else{
    medPoint.lat=(latitudes[medLatIdx-1] + latitudes[medLatIdx]) / 2.0;
  }
  // longitude
  var medLongIdx = Math.floor(longitudes.length/2);
  if(longitudes.length % 2){
    medPoint.lng=longitudes[medLongIdx];
  }
  else{
    medPoint.lng=(longitudes[medLongIdx-1] + longitudes[medLongIdx]) / 2.0;
  }

  return medPoint;
}

function spinnerOn(){
    $('#userSettingsBtn').addClass('spinner');
}

function spinnerOff(){
    $('#userSettingsBtn').removeClass('spinner');
}