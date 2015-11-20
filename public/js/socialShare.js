function getLinkToShare(callback){
    callback(null,'http://snapmytrack.com/');    
}

function facebookSend(evt,linkToShare){
    if(!fbInitDone){
        facebookApiLoad(facebookSend);
        return;
    }

    if(!linkToShare){
        getLinkToShare(facebookSend);
    }
    else{
        hideEmailSend();
        FB.ui({
            method: 'send',
            link: linkToShare,
        });
    }
}

function googleSend(evt,linkToShare){
    if(!googleInitDone){
        googleApiLoad(googleSend);
        return;
    }

    if(!linkToShare){
        getLinkToShare(googleSend);
    }
    else{
        var googleClientId = '444771318616-gfpg8jouu25l05frrtrj8l3len0ei8pr.apps.googleusercontent.com';
        hideEmailSend();
        setTimeout(function() {
            var shareOptions = {
                clientid:           googleClientId,
                contenturl:         "http://snapmytrack.com",
                cookiepolicy:       "single_host_origin",
        //        calltoactionlabel:  "Launch SnapMyTrack",
                calltoactionurl:    "http://snapmytrack.com",
                prefilltext: "Hi, I have published some of my tracks for you.",
                onshare: function(response){
        //            alert("share callback (G+), status: "+response.status);
                }
            };
            gapi.interactivepost.render("socialSharePopin", shareOptions);
            setTimeout(function() {
                $("#socialSharePopin").trigger('click');
            }, 200);
        }, 10);
    }
 }

function whatsAppSend(evt, linkToShare){
    if(!linkToShare){
        getLinkToShare(whatsAppSend);
    }
    else{
        var sendText = "Hi,\n"
                        + "I have published some of my tracks for you:"
                        + "\n" + linkToShare;
        window.open("whatsapp://send?text="+sendText);
    }
}

function hideEmailSend(){
    if( !$("#publishEmailInput").hasClass('isInvisible') ){
        toggleEmailSend();
    }
    return false;
}

function toggleEmailSend(){
    if( $("#publishEmailInput").hasClass('isInvisible') ){
        $("#publishEmailInput").removeClass('isInvisible');
        $("#publishSend").removeClass('isInvisible');
        $("#socialShareInfoFrame").addClass('isInvisible');
        $("#socialPublish").addClass('isInvisible');
    }
    else{
        $("#publishEmailInput").addClass('isInvisible');
        $("#publishSend").addClass('isInvisible');
        $("#socialPublish").removeClass('isInvisible');
    }    
    return false;
}
