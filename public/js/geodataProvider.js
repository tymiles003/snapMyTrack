var geodataUpoadQueue=[];

function sendGeoDataToServer(timestamp, accuracy, latitude, longitude, speed) {
    sendGeodataListToServer([
                                {   userId: signedInUserId,
                                    timestamp: timestamp,
                                    accuracy: accuracy,
                                    latitude:latitude,
                                    longitude: longitude,
                                    speed: speed }
                            ]);
}

function sendGeodataUpoadQueue(){
    var geodataList=[];
    if(geodataUpoadQueue && geodataUpoadQueue.length>0){
        for(var i=0, len_i=geodataUpoadQueue.length; i<len_i; i++){
            geodataList.push( { userId: geodataUpoadQueue[i].signedInUserId,
                                timestamp: geodataUpoadQueue[i].timestamp,
                                accuracy: geodataUpoadQueue[i].accuracy,
                                latitude: geodataUpoadQueue[i].latitude,
                                longitude: geodataUpoadQueue[i].longitude,
                                speed: geodataUpoadQueue[i].speed }                
                );
        }
        geodataUpoadQueue=[];
        sendGeodataListToServer(geodataList);
    }
}

function sendGeodataListToServer( geodataList ){
    if(navigator.onLine){
        $.post('/geodataAdd', { geoDataMany: geodataList }
        )
        .done(function(msg){
            var messageText = msg.success;
            if(msg.data && msg.data.length>0){
                messageText += '\n' + JSON.stringify(msg.data);
            }
            $("#messageArea").text(messageText);
        })
        .fail(function(xhr, statusText, err){
            if(navigator.onLine){
                var currentText = $("#messageArea").text();
                var messageText = currentText + ' ------------> ' + 'Error: '+err;
                $("#messageArea").text(messageText);
            }
            else{
                // remember geo-point for later upload
                for(var i=0, len_i=geodataList.length;i<len_i;i++){
                    geodataUpoadQueue.push( geodataList[i] );
                }
            }
        });
    }    
}

function removeGeodataFromServer(geodata, userId, displayName, polyline){
    var geoDataTimestamp=[];
    if(!geodata || geodata.length===0){
        return;
    }
    // get the list of timestamps
    for(var i=0, len_i=geodata.length; i<len_i;i++){
        geoDataTimestamp.push(geodata[i].timestamp);
    }
    // show busy indicator
    showGeodataReloadSpinner();
    $.post('/geodataRemove', { userId: userId,
                               displayName: displayName,
                               geoDataTimestamp: geoDataTimestamp }
    )
    .done(function(msg){
        // hide busy indicator
        hideGeodataReloadSpinner();
        // remove deleted tracks from map
        polyline.setMap(null);
    })
    .fail(function(xhr, statusText, err){
        // hide busy indicator
        hideGeodataReloadSpinner();
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: '+err;
        $("#messageArea").text(messageText);
    });
}

function geoDataUploader(){
    if(geodataUpoadQueue.length>0){
        sendGeodataUpoadQueue();
    }
}

function startGeoDataUploadWorker(frequencyMs){
    geoDataUploader();
    if(trackingIsActive){    // reschedule only if track recording is running
        setTimeout( function(){
                        startGeoDataUploadWorker(frequencyMs);
                    },
                    frequencyMs
            );
    }
}

function getGeoDataFromServer(userId, accountType, accessToken, tracksToShow) {
    if(userIsSignedIn){   // user signed out while loading geo data
        $.getJSON('/geodata?userId='+signedInUserId
                    +'&accountType='+accountType
                    +'&accessToken='+accessToken
                    +'&tracksToShow='+tracksToShow, function( data ) {
            if (userIsSignedIn){   // user signed out while loading geo data
                updateGoogleMap(data.geoPoints, data.trackInfo, userSettings.mapTypeId, tracksToShow);
                setTimeout(function(){
                    hideSignInSpinner();
                    hideGeodataReloadSpinner();
                    hideFooter(true);
                },100);
            }
        });
    }
}

function removeSelectedTracks(){
    if(!signedInUserId) return;

    for(var i=0, len_i=userPaths.length;i<len_i;i++){
        if(userPaths[i].selected){
            removeGeodataFromServer(userPaths[i].geoPoints, userPaths[i].userId, userPaths[i].displayName, userPaths[i].polyline);
        }
    }
}
