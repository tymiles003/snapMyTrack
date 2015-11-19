function facebookSend(){
    hideEmailSend();
    FB.ui({
        method: 'send',
        link: 'http://snapmytrack.com/',
    });
}

function googleSend(){
    hideEmailSend();
    alert('coming soon');
//    $("#socialSharePopin").removeClass('isInvisible');
//    gapi.post.render("socialSharePopin", {'href' : 'https://plus.google.com/109813896768294978296/posts/hdbPtrsqMXQ'} );
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
