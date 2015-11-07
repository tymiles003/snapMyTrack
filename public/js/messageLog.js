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
            $('#messageAreaCloseBtn').addClass('isInvisible');
            $('#messageAreaGotoSingInScreenBtn').addClass('isInvisible');
            $('#messageAreaGotoSingInCloseScreenBtn').addClass('isInvisible');
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

function hideMessageLog(){
    if(!$('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').addClass('isInvisible');
    }
}
