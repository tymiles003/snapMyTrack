function toggleMessageLog(){
    if($('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').removeClass('isInvisible');
    }
    else{
        $('#messageLogPopin').addClass('isInvisible');
    }
}

function showMessageLog( isToastMode ){
    if($('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').removeClass('isInvisible');
        if(isToastMode){
            setTimeout(function(){
                    $('#messageLogPopin').animate({opacity:0.01}, 1250, function(){
                            $('#messageLogPopin').addClass('isInvisible');
                            $('#messageLogPopin').css({opacity:1.0});
                        }     
                    );
                },
                1000 );
        }
    }
}

function hideMessageLog(){
    if(!$('#messageLogPopin').hasClass('isInvisible')){
        $('#messageLogPopin').addClass('isInvisible');
    }
}
