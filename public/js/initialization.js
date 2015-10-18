// initialization

var isDevelopment_mode=false;   // Add some dev. info ( success/error messages )
var trackingIsActive=false;
var userIsSignedIn=false;
var userAccountType;
var accessTokenFromUrl;
var signedInUserId;
var userDisplayName;
var userPictureUrl;

// 1) assign click events
$('#userSettingsBtn').click(toggleSettings);
$('#userSettingsCloseBtn').click(toggleSettings);
$('#passwordForgottenCloseBtn').click(togglePasswordForgotten);
$('#passwordForgottenSendBtn').click(sendPasswordForgottenEmail);
$('#publish').click(togglePublish);
$('#publishSend').click(publish);
$('#publishCloseBtn').click(togglePublish);
$('#showMyGeoData').click(showGeoData);
$('#trackLocation').click(sendLocationPeriodically);
$('#authorizeWithMailPassword').click(passwordLoginButtonClick);
$('body').click(resetPasswordLogin);
$('#emailInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#passwordInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#userAccountLogout').click(logOut);
$('#homePageLink').click(navigateToHomepagePage);
document.getElementById('passwordInput').onkeydown=passwordEnter;
document.getElementById('passwordForgottenEmail').onkeydown=resetPasswordEnter;

/* function userIdUpdate(event) {
    if (!event) event = window.event;
    var keyCode = event.keyCode || event.which;
    if (keyCode == '13'){    // ENTER
        initializeUi(event);
        return false;
    }
} */

function passwordEnter(event) {
    if (!event) event = window.event;
    var keyCode = event.keyCode || event.which;
    if (keyCode == '13'){    // ENTER
        if( document.getElementById('emailInput').value
            && document.getElementById('passwordInput').value ){
                passwordLoginSend();
                resetPasswordLogin();
                return false;
        }
    }
}

function resetPasswordEnter(event) {
    if (!event) event = window.event;
    var keyCode = event.keyCode || event.which;
    if (keyCode == '13'){    // ENTER
        if( document.getElementById('passwordForgottenEmail').value
            && document.getElementById('passwordForgottenEmail').value.length>2 ){
                sendPasswordForgottenEmail();
                return false;
        }
    }
}

/* function userAccountDisplayNameUpdate(event) {
    if (!event) event = window.event;
    var keyCode = event.keyCode || event.which;
    if (keyCode == '13'){    // ENTER

        return false;
    }
} */

function navigateToHomepagePage(){
    window.location = 'http://dsignmatters.com/snapmytrack';
}

function getAccessTokenFromUrl(){
	var params = window.location.href.split('=');
    return params[1] || 0;
}

function showGeoData(event,userId){     // get user settings and show map
    hideMessageLog();
    initializeUi(event,userId);
}

function initializeUi(event,userId){     // get user settings and show map
    spinnerOn();
    // get geo point data of user
    if(userId){
        userIdForShow = userId;    // ToDo -> use access token
    }
    else{
        userIdForShow = signedInUserId;
    }
    // get user settings and afterwards update map
    getUserSettingsFromServer(userIdForShow, userAccountType, true);
}

function sendLocationPeriodically(event, doNotTogglePeriodicSend){
    var frequencySeconds = 5;   // send every 5 seconds
    if(!signedInUserId){
    $("#messageArea").text('Add "User Id" for tracking.\nThe user id can be any sequence of characters.');
    showMessageLog(true);
    return;
    }
    else{
    hideMessageLog();
    }
    
    if(trackingIsActive && !doNotTogglePeriodicSend){
    trackingIsActive=false;
    $("#trackLocationStatus").addClass("statusOff");
    $("#trackLocationStatus").removeClass("statusOn");
    }
    else{
    if(trackingIsActive || (!doNotTogglePeriodicSend&&!trackingIsActive) ){
      trackingIsActive=true;
      $("#trackLocationStatus").addClass("statusOn");
      $("#trackLocationStatus").removeClass("statusOff");
      sendLocation();
      setTimeout( function(){
        sendLocationPeriodically( null, true );
      },
      frequencySeconds*1000);
    }
    else{
      return;    // periodic tracking has been switched off
    }
    }
}

function sendLocation(){
  var self=this;

  if(trackingIsActive){
    if(signedInUserId){
      navigator.geolocation.getCurrentPosition(function(position) {
        // depricated --> https needed, see https://goo.gl/rStTGz
        sendGeoDataToServer(position.timestamp,
                            position.coords.accuracy,
                            position.coords.latitude,
                            position.coords.longitude,
                            position.coords.speed);
      });
      // use watchPosition and move params like speed
    }
    else{
        $("#messageArea").text('provide a unique user Id');
            showMessageLog(true);
        }
  }
}

function getGeoDataFromServer(userId, accountType) {
    if(userIsSignedIn){   // user signed out while loading geo data
        $.getJSON('/geodata?userId='+signedInUserId+'&accountType='+accountType, function( data ) {
            if (userIsSignedIn){   // user signed out while loading geo data
                updateGoogleMap(data.geoPoints, userSettings.mapTypeId);
                setTimeout(function(){
                    spinnerOff();
                    hideFooter(true);
                },2000);
            }
        });
    }
}

function sendGeoDataToServer(timestamp, accuracy, latitude, longitude, speed) {
  $.post('/geodata',{
                         userId: signedInUserId,
                         timestamp: timestamp,
                         accuracy: accuracy,
                         latitude:latitude,
                         longitude: longitude,
                         speed: speed
                       }
      )
      .done(function(msg){
        var messageText = msg.success;
        if(msg.data && msg.data.length>0){
          messageText += '\n' + JSON.stringify(msg.data);
        }
        $("#messageArea").text(messageText);
      })
      .fail(function(xhr, statusText, err){
        var currentText = $("#messageArea").text();
        var messageText = currentText + ' ------------> ' + 'Error: '+err;
        $("#messageArea").text(messageText);
      });
    var messageText = 'Send -> Latitude:'+latitude+', Longitude: '+longitude+', Speed: '+speed+', Timestamp: '+timestamp+', Accuracy: '+accuracy;
    $("#messageArea").text(messageText);
}

// Google Log-In
function handleGoogleClientLoad() {
    var apiKey = 'AIzaSyBi3qbsG6PCHqzgF9HtBS_ciAJMjufNbgY';
// old    var apiKey = 'AIzaSyDb10AGVetF8WSsN8F-uAKSTxgw2s_GbQA';
    var clientId = '444771318616-gfpg8jouu25l05frrtrj8l3len0ei8pr.apps.googleusercontent.com';
// old    var clientId = '753771437879-6le68sg3qlahmm0i42963scvc675o9re.apps.googleusercontent.com';
    var scopes = 'https://www.googleapis.com/auth/plus.me';
    gapi.client.setApiKey(apiKey);
    window.setTimeout( function(){
        gapi.auth.authorize({   client_id: clientId,
                                scope: scopes,
                                immediate: true
                            },
                            handleGoogleAuthResult );
    }
    ,1);
}

function handleGoogleAuthResult(authResult) {
    console.log('handleGoogleAuthResult: ',authResult);
    var authorizeWithGoogleButton = document.getElementById('authorizeWithGoogleBtn');
    if (authResult && !authResult.error) {
        userAccountType = 'GOOGLE';
        makeGoogleApiCall();
    } else {
        if(!userIsSignedIn){
            authorizeWithGoogleButton.onclick = googelLoginButtonClick;
        }
    }
}

function toggleUserAccountPopin(){
    if($('#userAccountPopin').hasClass('isInvisible')){
        $('#userAccountPopin').removeClass('isInvisible');
        $('#userAccountCloseBtn').click(toggleUserAccountPopin);
        document.getElementById('userAccountPicture').style.backgroundImage = "url('"+userPictureUrl+"')";
        $('#userAccountDisplayName').text(userDisplayName);
        $('#userAccountAccountType').text(userAccountType);
    }
    else{
        $('#userAccountPopin').addClass('isInvisible');
    }
}

function userAccountClick(){
    toggleUserAccountPopin();
}

function fillLogInUserFrame( displayName, imageUrl ){
    userPictureUrl = imageUrl;
    userDisplayName = displayName;
    var heading = document.createElement('div');
    if(imageUrl){
        if(document.getElementById('userAccountImage')){
            document.getElementById('userAccountImage').src=imageUrl;
        }
        else{
            var image = document.createElement('img');
            image.id = 'userAccountImage';
            image.src = imageUrl;
            image.height = '30';
            image.classList.add('userImage');
            heading.appendChild(image);
            heading.onclick=userAccountClick;
        }
    }
    else if(displayName){
//        heading.style.marginRight = '8.0em';
        var displayNameDiv=document.createElement('div');
        displayNameDiv.style.position='absolute';
        displayNameDiv.style.right='8.0em';
        displayNameDiv.style.zIndex='3000';
        displayNameDiv.classList.add('userDisplayName');
        var textNode = document.createTextNode(displayName);
        displayNameDiv.appendChild(textNode);
        heading.appendChild(displayNameDiv);
        heading.onclick=userAccountClick;
    }
    document.getElementById('loginUser').appendChild(heading);
}

/* function resetLogInUserFrame( displayName, imageUrl ){
    document.getElementById('userAccountImage').src='';
} */

function makeGoogleApiCall() {
    gapi.client.load('plus', 'v1').then(function() {
        var request = gapi.client.plus.people.get({
        'userId': 'me'
        });
        request.then(function(resp) {
            signedInUserId = resp.result.id;
            userDisplayName = resp.result.displayName;
            userPictureUrl = resp.result.image.url;
            fillLogInUserFrame(userDisplayName, userPictureUrl);
            // log-in SnapTrack server
            oAuthLoginSend( 'GOOGLE', signedInUserId, userDisplayName);
        }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
        });
    });
}

function googelLoginButtonClick(event){
    var clientId = '444771318616-gfpg8jouu25l05frrtrj8l3len0ei8pr.apps.googleusercontent.com';
// old     var clientId = '753771437879-6le68sg3qlahmm0i42963scvc675o9re.apps.googleusercontent.com';
    var scopes = 'https://www.googleapis.com/auth/plus.me';
    gapi.auth.authorize({ client_id: clientId,
                          scope: scopes,
                          immediate: false
                        },
                        handleGoogleAuthResult);
}

// oAuth Log-In (Facebook, Google, Windows Live)
function logInSuccessfull(userId){
    userIsSignedIn=true;
    signedInUserId=userId;
    document.getElementById('authorizeWithWindowsBtn').style.visibility = 'hidden';
    document.getElementById('authorizeWithFacebookBtn').style.visibility = 'hidden';
    document.getElementById('authorizeWithGoogleBtn').style.visibility = 'hidden';
    document.getElementById('authorizeWithMailPassword').style.visibility = 'hidden';
    $('#userSettingsBtn').removeClass('isInvisible');
    $('#loginUser').removeClass('isInvisible');
    // initial display of map
    showGeoData( null, userId );    
}

// Facebook Log-In
function facebookLoginButtonClick(){
    FB.login(facebookLoginCallback);
}

function makeFacebookApiCall() {
    FB.api('/me', function(response) {
        var displayName = response.name;
        var userId = response.id;
        FB.api('/me/picture', function(response) {
            fillLogInUserFrame( displayName, response.data.url);
        });
        // log-in SnapTrack server
        oAuthLoginSend( 'FACEBOOK', userId, displayName);
    });
}

function facebookLoginCallback(response){
    console.log('facebookLoginCallback: ',response);
    if(!userIsSignedIn){
        if (response.status === 'connected') {
            userAccountType = 'FACEBOOK';
            makeFacebookApiCall();
        }
    }
}

function facebookLoginStatusCallback(response){
    console.log('facebookLoginStatusCallback: ',response);
    if(!userIsSignedIn){
        if (response.status === 'connected') {
            userAccountType = 'FACEBOOK';
            makeFacebookApiCall();
        }
        else {
            var authorizeWithFacebookButton = document.getElementById('authorizeWithFacebookBtn');
            if(!userIsSignedIn){
                authorizeWithFacebookButton.style.visibility = '';
                authorizeWithFacebookButton.onclick = facebookLoginButtonClick;
            }
        }
    }
}

// Windows Live Log-In
function windowsLiveLoginButtonClick(){
    WL.login(windowsLiveLoginCallback);
}

function makeWindowsLiveApiCall() {
    WL.api({
        path: "me",
        method: "GET"
    }).then(
        function (response){
            signedInUserId = response.id;
            userDisplayName = response.name;    //  response.first_name, response.last_name
            WL.api({
                path: "me/picture",
                method: "GET"
            }).then(
                function(pictureResponse){
                    fillLogInUserFrame(userDisplayName, pictureResponse.location);
                    // log-in SnapTrack server
                    oAuthLoginSend( 'WINDOWSLIVE', signedInUserId, userDisplayName);
                },
                function(pictureResponseFailed){
                    console.log('WL.api(me/picture) error: ', responseFailed);
                    fillLogInUserFrame(userDisplayName, null);
                    // log-in SnapTrack server
                    oAuthLoginSend( 'WINDOWSLIVE', signedInUserId, userDisplayName);
                }
            );
        },
        function (responseFailed){
            console.log('WL.api(me) error: ', responseFailed);
        }
    );
}

function windowsLiveLoginCallback(response){
    if(!userIsSignedIn){
        if (response.status === 'connected') {
            userAccountType = 'WINDOWSLIVE';
            makeWindowsLiveApiCall();
        }
    }
}

function windowsLiveLoginStatusCallback(response){
    console.log('windowsLiveLoginStatusCallback: ',response);
    if(!userIsSignedIn){
        if (response.status === 'connected') {
            userAccountType = 'WINDOWSLIVE';
            makeWindowsLiveApiCall();
        }
        else {
            var authorizeWithWindowsButton = document.getElementById('authorizeWithWindowsBtn');
            if(!userIsSignedIn){
                authorizeWithWindowsButton.style.visibility = '';
                authorizeWithWindowsButton.onclick = windowsLiveLoginButtonClick;
            }
        }
    }
}

function logOut(){
    // we do not provide a log out
    // -> show 'sign in' buttons instead 
    userIsSignedIn=false;
    prepareForSignIn();
    toggleUserAccountPopin();

/*    if(userAccountType === 'FACEBOOK'){
        FB.logout(function(response) {
            // ToDo -> error handling
            console.log(userAccountType + '-logout:'+response);
        });
    }    
    else if (userAccountType === 'GOOGLE'){
        gapi.auth.signOut(function(response) {
            // ToDo -> error handling
            console.log(userAccountType + '-logout:'+response);
            toggleUserAccountPopin();
        });
        gapi.auth.setToken(null);
        gapi.auth.signOut();
        prepareForSignIn();
        toggleUserAccountPopin();
    }
    else if (userAccountType === 'WINDOWSLIVE'){
        WL.logout(function(response) {
            // ToDo -> error handling
            console.log(userAccountType + '-logout:'+response);
            toggleUserAccountPopin();
        });
//        WL.logout();
        prepareForSignIn();
        toggleUserAccountPopin();
    }
    else if (userAccountType === 'PASSWORD'){
        // ToDo
            // ToDo -> error handling
            // console.log(userAccountType + '-logout:'+response);
        prepareForSignIn();
        toggleUserAccountPopin();
    } */
}

function prepareForSignIn(){
    // show sign-in buttons
    document.getElementById('authorizeWithFacebookBtn').style.visibility = '';
    document.getElementById('authorizeWithGoogleBtn').style.visibility = '';
    document.getElementById('authorizeWithWindowsBtn').style.visibility = '';
    document.getElementById('authorizeWithMailPassword').style.visibility = '';
    // remove all tracks from map
    resetMap();
    // reset overlay/footer
    showFooter(true);
    // hide spinner/userSettingsBtn
    document.getElementById('userSettingsBtn').style.visibility = 'hidden';
    // hide user account
    document.getElementById('loginUser').style.visibility = 'hidden';
}

function hideFooter( showTopFrame ){
    $('#homeFooter').animate({opacity:0.01}, 1250, function(){
            $('#homeFooter').addClass('isInvisible');
            $('#homeFooter').css({opacity:1.0});
            if(showTopFrame){
                $('#topFrame').removeClass('isInvisible');
                $('#publish').removeClass('isInvisible');
            }
        }     
    );
}

function showFooter( hideTopFrame ){
    $('#homeFooter').animate({opacity:1.00}, 1250, function(){
            $('#homeFooter').removeClass('isInvisible');
            $('#homeFooter').css({opacity:1.0});
            if(hideTopFrame){
                $('#topFrame').addClass('isInvisible');
                $('#publish').addClass('isInvisible');
            }
        }     
    );
}

// Password Log-In
function passwordLoginButtonClick(){
    document.getElementById('emailInput').style.visibility = '';
    $('#emailInput').removeClass('isInvisible');
    document.getElementById('passwordInput').style.visibility = '';
    $('#passwordInput').removeClass('isInvisible');
    document.getElementById('passwordSend').style.visibility = '';
    $('#passwordSend').removeClass('isInvisible');
    document.getElementById('passwordFrame').style.visibility = '';
    $('#passwordFrame').removeClass('isInvisible');
    document.getElementById('authorizeWithMailPassword').style.visibility = 'hidden';
    document.getElementById('passwordForgotten').onclick = passwordForgotten;
    document.getElementById('passwordSend').onclick = passwordLoginSend;
    hideFooter();
    return false;    // stop event propagation
}

function passwordForgotten(){
    // launch pop-in to reset password and send link to create new password via e-mail  
    $('#passwordForgottenPopin').removeClass('isInvisible');
    return false;    // stop event propagation
}

function resetPasswordLogin(){
    if(userIsSignedIn){
        return;
    }
    if(document.getElementById('passwordFrame').style.visibility === ''){
        document.getElementById('authorizeWithMailPassword').style.visibility = '';
        document.getElementById('emailInput').style.visibility = 'hidden';
        document.getElementById('passwordInput').style.visibility = 'hidden';
        document.getElementById('passwordSend').style.visibility = 'hidden';
        document.getElementById('passwordFrame').style.visibility = 'hidden';
        $('#emailInput').addClass('isInvisible');
        $('#passwordInput').addClass('isInvisible');
        $('#passwordSend').addClass('isInvisible');
        $('#passwordFrame').addClass('isInvisible');
    }
}

function loginCallback(response){
    // status
    //  - connected
    //  - auth_failed
    //  - user_creation_failed
    if(!userIsSignedIn){
        if(response.status === 'connected'){
            if(response.data.displayName){
                userDisplayName = response.data.displayName;
            }
            else{
                userDisplayName = response.data.userId;
            }
            userAccountType = response.data.accountType;
            fillLogInUserFrame( userDisplayName, null);
            logInSuccessfull( response.data.userId );
        }
        else{
            var messageText = 'Sign-In has failed, check user Id and password';
            $("#messageArea").text(messageText);
            showMessageLog(true);
        }
    }
}

function oAuthLoginSend(accountType, userId, displayName){
    sendLogonDataToServer(accountType, userId, displayName, null, loginCallback );
}

function passwordLoginSend(){
    var accountType = 'PASSWORD';
    var userId = document.getElementById('emailInput').value;
    var displayName = "";   // can be added later on (account pop-in)
    var password = document.getElementById('passwordInput').value;
    sendLogonDataToServer(accountType, userId, displayName, password, loginCallback );
    return false;    // stop event propagation
}

window.onload = function() {
    accessTokenFromUrl = getAccessTokenFromUrl();
};

$(document).ready(function() {
    $.ajaxSetup({ cache: true });
    
//  oAuth Log-In

//  Facebook
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
        var appId;
        if(isDevelopment_mode){
            appId = '1685804888318715';     // redirect to OpenShift
//            appId = '1685807221651815';     // test app, redirect to KODING
        }
        else{
            appId = '1685804888318715';     // redirect to OpenShift
        }
        FB.init({
          appId: appId,
          version: 'v2.5' // or v2.0, v2.1, v2.2, v2.3, v2.4
        });
        FB.getLoginStatus(facebookLoginStatusCallback);
    });
    
//  Windows Live
    $.getScript('//js.live.net/v5.0/wl.js', function(){
        var client_id;
        if(isDevelopment_mode){
            client_id = '000000004817115C';     // test app, redirect to KODING
        }
        else{
            client_id = '000000004C16A334';     // redirect to OpenShift
        }
        WL.init({
            client_id: client_id,
            scope: "wl.signin", 
            response_type: "token",
        });
        WL.getLoginStatus(windowsLiveLoginStatusCallback, function(response){
            console.log('WL.getLoginStatus error: ', response);
        });
    });
});    
