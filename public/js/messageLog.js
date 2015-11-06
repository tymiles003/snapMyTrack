function toggleMessageLog(){
    if($('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').removeClass('isInvisible');
    }
    else{
        $('#messageLogPopin').addClass('isInvisible');
//        $('#messageAreaCloseBtn').addClass('isInvisible');
    }
}

function toggleMessageLogSignIn(){
    toggleMessageLog();
    launchSignInPage();
}

function showMessageLog( isToastMode, signInAtClose ){
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
            if(signInAtClose){
                $('#messageAreaGotoSingInScreenBtn').removeClass('isInvisible');
                $('#messageAreaCloseBtn').addClass('isInvisible');
            }
            else{
                $('#messageAreaCloseBtn').removeClass('isInvisible');
                $('#messageAreaGotoSingInScreenBtn').addClass('isInvisible');
            }
        }
        $('#messageLogPopin').removeClass('isInvisible');
    }
}

function hideMessageLog(){
    if(!$('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').addClass('isInvisible');
    }
}
