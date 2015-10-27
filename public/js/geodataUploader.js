var geodataUpoadQueue=[];

function sendGeoDataToServer(timestamp, accuracy, latitude, longitude, speed) {
    var geodataUpload = {    userId: signedInUserId,
                             timestamp: timestamp,
                             accuracy: accuracy,
                             latitude:latitude,
                             longitude: longitude,
                             speed: speed
                           };
    if(navigator.onLine){
        var messageText = 'Send -> Latitude:'+latitude+', Longitude: '+longitude+', Speed: '+speed+', Timestamp: '+timestamp+', Accuracy: '+accuracy;
        $("#messageArea").text(messageText);
        $.post('/geodata', geodataUpload
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
                geodataUpoadQueue.push( geodataUpload );
            }
        });
    }
    else{
        // remember geo-point for later upload              
        geodataUpoadQueue.push( geodataUpload );
    }
}

function sendGeodataUpoadQueue(){
    var geodataUploadMulti = { geodataList: geodataUpoadQueue };
    if(navigator.onLine){
        $.post('/geodata', geodataUploadMulti
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
                for(var i=0, len_i=geodataUploadMulti.geodataList.length;i<len_i;i++){
                    geodataUpoadQueue.push( geodataUploadMulti.geodataList[i] );
                }
            }
        });
        geodataUpoadQueue = [];
    }    
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