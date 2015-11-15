function toggleMessageLog(){
    if($('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').removeClass('isInvisible');
    }
    else{
        $('#messageLogPopin').addClass('isInvisible');
    }
}

function toggleMessageLogSignIn(){
    toggleMessageLog();
    launchSignInPage();
    return false;
}

function toggleMessageLogRemoveAccount(){
    hideMessageLog();
    removeAccount();
    return false;
}

function toggleMessageLogRemoveSelectedTracks(){
    hideMessageLog();
    removeSelectedTracks();
    return false;
}

function showMessageLog( isToastMode, signInAtClose, registerAtClose){
    if($('#messageLogPopin').hasClass('isInvisible')){
        if(isToastMode){
            $('#messageAreaCloseBtn').addClass('isInvisible');
            setTimeout(function(){
                    $('#messageLogPopin').animate({opacity:0.01}, 1250, function(){
                            $('#messageLogPopin').addClass('isInvisible');
                            $('#messageLogPopin').css({opacity:1.0});
                        }     
                    );
                },
                1000 );
        }
        else{
            hideAllMessageLogButtons();
            // show close button (with 'sign-in' at click)
            if(signInAtClose){
                $('#messageAreaGotoSingInCloseScreenBtn').removeClass('isInvisible');
            }
            else{
                $('#messageAreaCloseBtn').removeClass('isInvisible');
            }
            // show sign-in button
            if(registerAtClose){
                $('#messageAreaGotoSingInScreenBtn').removeClass('isInvisible');
            }
        }
        $('#messageLogPopin').removeClass('isInvisible');
    }
}

function showMessageLogToConfirm( isRemoveAccount, isRemoveSelectedTracks){
    if($('#messageLogPopin').hasClass('isInvisible')){
        hideAllMessageLogButtons();
        // adjust font size
        adjustMessageLogTextFontSize();
        // show close button (with 'sign-in' at click)
        if(isRemoveAccount){
            $('#messageAreaRemoveAccountBtn').removeClass('isInvisible');
            $('#messageAreaRemoveAccountBtn').click(toggleMessageLogRemoveAccount);
        }
        if(isRemoveSelectedTracks){
            $('#messageAreaRemoveSelectedTracksBtn').removeClass('isInvisible');
            $('#messageAreaRemoveSelectedTracksBtn').click(toggleMessageLogRemoveSelectedTracks);
        }
        $('#messageAreaCancelBtn').removeClass('isInvisible');
        $('#messageAreaCancelBtn').click(hideMessageLog);
        $('#messageLogPopin').removeClass('isInvisible');
    }
}

function hideAllMessageLogButtons(){
    $('#messageAreaCancelBtn').addClass('isInvisible');
    $('#messageAreaCloseBtn').addClass('isInvisible');
    $('#messageAreaGotoSingInScreenBtn').addClass('isInvisible');
    $('#messageAreaGotoSingInCloseScreenBtn').addClass('isInvisible');
    $('#messageAreaRemoveAccountBtn').addClass('isInvisible');
    $('#messageAreaRemoveSelectedTracksBtn').addClass('isInvisible');
}

function hideMessageLog(){
    if(!$('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').addClass('isInvisible');
    }
}

function setMessageLogText(displayText){
    $("#messageArea").text(displayText);
}

function appendMessageLogText(displayText){
    $("#messageArea").text( $("#messageArea").text() + displayText);
}

function adjustMessageLogTextFontSize(){
    var messageText=$("#messageArea").text();
    if(messageText.length > 80){
        // long text
        $("#messageArea").addClass('messageTextFontLarge');     
        $("#messageArea").removeClass('messageTextFontNormal');     
    }
    else{
        // short text
        $("#messageArea").addClass('messageTextFontNormal');     
        $("#messageArea").removeClass('messageTextFontLarge');
    }
}