// initialization

var isDevelopment_mode=false;   // add some dev. info ( success/error messages )
var trackingIsActive=false;
var serverLoginRunning=false;
var serverLoginUserId;   // user for which latest login request has been sent to server (currently only needed to debugging)
var userIsSignedIn=false;
var userAccountType;
var signedInUserId;
var userDisplayName;
var userPictureUrl;
var accessTokenFromUrl;
var fbInitDone;
var wlInitDone;
var googleInitDone;

// 1) assign click events
$('#userSettingsBtn').click(toggleSettings);
$('#userSettingsCloseBtn').click(toggleSettings);
$('#passwordForgottenCloseBtn').click(togglePasswordForgotten);
$('#passwordForgottenSendBtn').click(sendPasswordForgottenEmail);
$('#publishBtn').click(togglePublish);
$('#publishSend').click(publish);
$('#publishCloseBtn').click(togglePublish);
$('#trackLocation').click(sendLocationPeriodically);
$('#trackLocationStatus').click(sendLocationPeriodically);
$('#authorizeWithMailPasswordBtn').click(passwordLoginButtonClick);
$('body').click(resetPasswordLogin);
$('#emailInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#passwordInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#userAccountLogout').click(logOut);
$('#homePageLink').click(navigateToHomepagePage);
$('#userAccountDisplayName').click(toggleDisplayName);
$('#userAccountPicture').click(togglePictureUrl);
$('#userAccountPopin').click(disableUserChange);
$('#userAccountChangeNameInput').click(function(){return false});   // stop event propagation
$('#userAccountChangePictureUrlInput').click(function(){return false});   // stop event propagation
document.getElementById('passwordInput').onkeydown=passwordEnter;
document.getElementById('passwordForgottenEmail').onkeydown=resetPasswordEnter;
document.getElementById('userAccountChangeNameInput').onkeydown=displayNameEnter;
document.getElementById('userAccountChangePictureUrlInput').onkeydown=pictureUrlEnter;


function resizePage(){
    if(document.getElementById("GoogleMapsCanvas").style.visibility === 'hidden'
      || $("#GoogleMapsCanvas").hasClass('isInvisible')){
        // sign-in resizing
        if( $(window).width() < 540){
            document.getElementById('introPageOverlayHideLeftBgrImg').style.visibility = 'hidden';
            $('#introPageOverlayHideLeftBgrImg').addClass('isInvisible');
            document.getElementById('introPageOverlay').style.visibility = 'hidden';
            $('#introPageOverlay').addClass('isInvisible');
            document.getElementById('introPageOverlaySmall').style.visibility = '';
            $('#introPageOverlaySmall').removeClass('isInvisible');
        }
        else if( $(window).width() < 1024){
            document.getElementById('introPageOverlay').style.visibility = 'hidden';
            $('#introPageOverlay').addClass('isInvisible');
            document.getElementById('introPageOverlaySmall').style.visibility = '';
            $('#introPageOverlaySmall').removeClass('isInvisible');
        }
        else{
            document.getElementById('introPageOverlay').style.visibility = '';
            $('#introPageOverlay').removeClass('isInvisible');
            // hide small background image
            document.getElementById('introPageOverlayHideLeftBgrImg').style.visibility = '';
            $('#introPageOverlayHideLeftBgrImg').removeClass('isInvisible');
            document.getElementById('introPageOverlaySmall').style.visibility = 'hidden';
            $('#introPageOverlaySmall').addClass('isInvisible');
        }
        document.getElementById('appTitle').style.visibility = '';
        $('#appTitle').removeClass('isInvisible');
    }
    else{
        document.getElementById('appTitle').style.visibility = 'hidden';
        $('#appTitle').addClass('isInvisible');
        // resize map / recenter map
        // ToDo
    }
}

function disableUserChange(){
    if(userAccountType==='PASSWORD'){
        // picture url
        if(document.getElementById('userAccountChangePictureUrlInput').style.visibility === '' && !$('#userAccountChangePictureUrlInput').hasClass('isInvisible')){
            togglePictureUrl();
        }

        // display name
        if(document.getElementById('userAccountChangeNameInput').style.visibility === '' && !$('#userAccountChangeNameInput').hasClass('isInvisible')){
            toggleDisplayName();
        }
    }    
}

function toggleDisplayName(){
    if(userAccountType==='PASSWORD'){
        if(document.getElementById('userAccountChangeNameInput').style.visibility === 'hidden' || $('#userAccountChangeNameInput').hasClass('isInvisible')){
            // show input box
            $('#userAccountChangeNameInput').val($('#userAccountDisplayName').text());
            document.getElementById('userAccountChangeNameInput').setSelectionRange(0, document.getElementById('userAccountChangeNameInput').value.length);
            $('#userAccountDisplayName').addClass('isInvisible');
            document.getElementById('userAccountDisplayName').style.visibility = 'hidden';
            $('#userAccountChangeNameInput').removeClass('isInvisible');
            document.getElementById('userAccountChangeNameInput').style.visibility = '';
        }
        else{
            // hide input box
            $('#userAccountDisplayName').text($('#userAccountChangeNameInput').val());
            $('#userAccountDisplayName').removeClass('isInvisible');
            document.getElementById('userAccountDisplayName').style.visibility = '';
            $('#userAccountChangeNameInput').addClass('isInvisible');
            document.getElementById('userAccountChangeNameInput').style.visibility = 'hidden';
        }
    }
    return false;
}

function togglePictureUrl(){
    if(userAccountType==='PASSWORD'){
        if(document.getElementById('userAccountChangePictureUrlInput').style.visibility === 'hidden' || $('#userAccountChangePictureUrlInput').hasClass('isInvisible')){
            // show input box
            $('#userAccountChangePictureUrlInput').val($('#userAccountPicture').css('background-image').slice(4, -1));
            document.getElementById('userAccountChangePictureUrlInput').setSelectionRange(0, document.getElementById('userAccountChangePictureUrlInput').value.length);
//            $('#userAccountDisplayName').addClass('isInvisible');
//            document.getElementById('userAccountDisplayName').style.visibility = 'hidden';
            $('#userAccountChangePictureUrlInput').removeClass('isInvisible');
            document.getElementById('userAccountChangePictureUrlInput').style.visibility = '';
        }
        else{
            // hide input box
//            $('#userAccountDisplayName').text($('#userAccountChangePictureInput').val());
//            $('#userAccountDisplayName').removeClass('isInvisible');
//            document.getElementById('userAccountDisplayName').style.visibility = '';
            $('#userAccountChangePictureUrlInput').addClass('isInvisible');
            document.getElementById('userAccountChangePictureUrlInput').style.visibility = 'hidden';
        }
    }
    return false;
}

function pictureUrlEnter(event) {
    if (!event) event = window.event;
    var keyCode = event.keyCode || event.which;
    if (keyCode == '13'){    // ENTER
        passwordUserChange();
        return false;
    }
}

function displayNameEnter(event) {
    if (!event) event = window.event;
    var keyCode = event.keyCode || event.which;
    if (keyCode == '13'){    // ENTER
        passwordUserChange();
        return false;
    }
}

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

function navigateToHomepagePage(){
    window.open('http://dsignmatters.com/snapmytrack');
}

function getAccessTokenFromUrl(){
	var params = window.location.href.split('=');
    return params[1] || 0;
}

function showGeoData(event, accountType, userId){     // get user settings and show map
    hideMessageLog();
    initializeUi(event, accountType, userId);
}

function initializeUi(event, accountType, userId){     // get user settings and show map
    // account type
    var accountTypeForShow;
    if(accountType){
        accountTypeForShow = accountType;
    }
    else{
        accountTypeForShow = userAccountType;
    }
    // user id
    var userIdForShow;
    if(userId){
        userIdForShow = userId;
    }
    else{
        userIdForShow = signedInUserId;
    }
    // get user settings and afterwards update map
    getUserSettingsFromServer(userIdForShow, accountTypeForShow, true);
}

function sendLocationPeriodically(event, doNotTogglePeriodicSend){
    var frequencySeconds = 4;   // send every 4 seconds
    if(!signedInUserId){
        $("#messageArea").text('Add "User Id" for tracking.\nThe user id can be any sequence of characters.');
        showMessageLog(true);
        return;
    }
    else{
        hideMessageLog();
    }

    if(trackingIsActive && !doNotTogglePeriodicSend){
        trackingIsActive = false;
        if(isThemeDark(userSettings.mapTypeId)){
            $("#trackLocationStatus").addClass("statusOffDark");
        }
        else{
            $("#trackLocationStatus").addClass("statusOff");
        }
        $("#trackLocationStatus").removeClass("statusOn");
        $("#trackLocationStatus").removeClass("pulser");
    }
    else{
        if(trackingIsActive || (!doNotTogglePeriodicSend&&!trackingIsActive) ){
            trackingIsActive = true;
            $("#trackLocationStatus").addClass("statusOn");
            $("#trackLocationStatus").removeClass("statusOff");
            $("#trackLocationStatus").removeClass("statusOffDark");
            $("#trackLocationStatus").addClass("pulser");
//            navigator.geolocation.watchPosition(updateCurrentLocationOnMap);
            sendLocation();
            setTimeout( function(){
                sendLocationPeriodically( null, true );
            },
            frequencySeconds*1000 );
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
                    hideSignInSpinner();
                    hideFooter(true);
                },100);
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
function initializeGoogle() {
    var apiKey = 'AIzaSyBi3qbsG6PCHqzgF9HtBS_ciAJMjufNbgY';
    gapi.client.setApiKey(apiKey);
    googleInitDone = true;
}

function getGoogleLoginStatus(callback, immediate){
    window.setTimeout( function(){
        var clientId = '444771318616-gfpg8jouu25l05frrtrj8l3len0ei8pr.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/plus.me';
        gapi.auth.authorize({   client_id: clientId,
                                scope: scopes,
                                immediate: immediate
                            },
                            callback);
    }
    , 1);
}

function handleGoogleAuthResult(authResult) {
    console.log('handleGoogleAuthResult: ',authResult);
    var authorizeWithGoogleButton = document.getElementById('authorizeWithGoogleBtn');
    if (authResult && !authResult.error) {
        userAccountType = 'GOOGLE';
        makeGoogleApiCall();
    } else {
        if(!userIsSignedIn && !serverLoginRunning){
            authorizeWithGoogleButton.onclick = googelLoginButtonClick;
            authorizeWithGoogleButton.style.visibility = '';
        }
    }
}

function toggleUserAccountPopin(){
    if($('#userAccountPopin').hasClass('isInvisible')){
        $('#userAccountPopin').removeClass('isInvisible');
        $('#userAccountCloseBtn').click(toggleUserAccountPopin);
        document.getElementById('userAccountPicture').style.backgroundImage = "url('"+userPictureUrl+"')";
        $('#userAccountDisplayName').text(getFormattedUserDisplayName());
        $('#userAccountAccountType').text(userAccountType);
    }
    else{
        $('#userAccountPopin').addClass('isInvisible');
    }
    return false;
}

function getFormattedUserDisplayName(userId){
    var displayNameLocal, displayNameParts;
    var displayName;
    if(userId){
        displayNameLocal = userId;
    }
    else{
        displayNameLocal = userDisplayName;
    }
    if( userAccountType === 'PASSWORD' ){
        displayNameParts = displayNameLocal.split('@');
        if( !displayNameParts.length || displayNameParts.length === 0){
            displayName = displayNameLocal;
        }
        else{
            displayName = displayNameParts[0];
        }
    }
    else{
        displayName = displayNameLocal;
    }
    return displayName;
}

function userAccountClick(){
    toggleUserAccountPopin();
}

function fillLogInUserFrame( userId, displayName, imageUrl ){
    userPictureUrl = imageUrl;
    userDisplayName = displayName;
    var heading;
    var headingIsNew = false;
    if(document.getElementById('userAccountFrame')){
        heading = document.getElementById('userAccountFrame');
    }
    else{
        heading = document.createElement('div');
        headingIsNew = true;
        heading.id = 'userAccountFrame';
    }
    if(imageUrl){
        if(document.getElementById('userImage')){
            document.getElementById('userImage').src=imageUrl;
            $('#userImage').removeClass('isInvisible');
            document.getElementById('userImage').style.visibility = '';
        }
        else{
            var image = document.createElement('img');
            image.id = 'userImage';
            image.src = imageUrl;
            image.height = '30';
            image.classList.add('userPictureSmall');
            heading.appendChild(image);
            heading.onclick = userAccountClick;
            if(document.getElementById('userDisplayName')){
                document.getElementById('userDisplayName').style.visibility='hidden';
            }
            document.getElementById('loginUser').appendChild(heading);
        }
    }
    else if(displayName){
        if(document.getElementById('userImage')){
//            document.getElementById('userImage').style.visibility='gone';
            $('#userImage').addClass('isInvisible');
        }
        if(!document.getElementById('userDisplayName')){
            var displayNameDiv = document.createElement('div');
            displayNameDiv.id = 'userDisplayName';
            displayNameDiv.style.position = 'absolute';
            displayNameDiv.style.right = '5.0em';
            displayNameDiv.style.zIndex = '3000';
            displayNameDiv.classList.add('userDisplayName');
            displayNameDiv.innerHTML = displayName;
            heading.appendChild(displayNameDiv);
            if(headingIsNew){
                heading.onclick = userAccountClick;
                document.getElementById('loginUser').appendChild(heading);
            }
        }
        else{
            document.getElementById('userDisplayName').style.visibility='';
            $('#userDisplayName').text(displayName);
        }
    }
}

/* function resetLogInUserFrame( displayName, imageUrl ){
    document.getElementById('userImage').src='';
} */

function makeGoogleApiCall() {
    gapi.client.load('plus', 'v1').then(function() {
        var request = gapi.client.plus.people.get({
        'userId': 'me'
        });
        request.then(function(resp) {
            if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
                // log-in SnapMyTrack server
                serverLoginSend( 'GOOGLE', resp.result.id, resp.result.displayName, resp.result.image.url);
            }
        }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
        });
    });
}

function googelLoginButtonClick(event){
    googleApiSignIn();
/*    var clientId = '444771318616-gfpg8jouu25l05frrtrj8l3len0ei8pr.apps.googleusercontent.com';
    var scopes = 'https://www.googleapis.com/auth/plus.me';
    getGoogleLoginStatus(handleGoogleAuthResult, false); */
}

// server Log-In
function serverLogInSuccessfull(appUser){
    setUserParameter('accountType',appUser.accountType);   // local storage
    userIsSignedIn = true;
    signedInUserId = appUser.userId;
    $('#userSettingsBtn').removeClass('isInvisible');
    document.getElementById('userSettingsBtn').style.visibility = '';
    $('#loginUser').removeClass('isInvisible');
    document.getElementById('loginUser').style.visibility = '';
    
    if(appUser.accountType === "PASSWORD"){
        var displayName = appUser.displayName;
        if( !displayName || displayName.length === 0){
            displayName = getFormattedUserDisplayName(appUser.userId);
        }
        // update user admin data (display name, picture url)
        fillLogInUserFrame(appUser.userId, displayName, appUser.pictureUrl);
    }
    // initial display of map
    showGeoData( null, appUser.accountType, appUser.userId );
}

// Facebook Log-In
function initializeFacebook(){        
    var appId;
    appId = '1685804888318715';
    FB.init({
        appId: appId,
        status: true,
        version: 'v2.5' // or v2.0, v2.1, v2.2, v2.3, v2.4
    });
    fbInitDone=true;
}

function facebookLoginButtonClick(){
    if( !fbInitDone ){
        facebookApiLoadAndSignIn();
    }
    else{
        FB.getLoginStatus(facebookLoginStatusCallbackForManualLogon);
    }
}

function facebookLoginStatusCallbackForManualLogon(response) {
    console.log('facebookLoginStatusCallbackForManualLogon: ',response);
    if(!userIsSignedIn){
        if (response.status === 'connected') {
            facebookLoginCallback(response);
        }
        else{
            FB.login(facebookLoginCallback);
        }
    }
}

function makeFacebookApiCall() {
    FB.api('/me', function(response) {
        var displayName = response.name;
        var userId = response.id;
        FB.api('/me/picture', function(response) {
            if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
                // log-in SnapMyTrack server
                serverLoginSend( 'FACEBOOK', userId, displayName, response.data.url);
            }
        });
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
            setTimeout( function(){
                if(!userIsSignedIn && !serverLoginRunning){
                    authorizeWithFacebookButton.style.visibility = '';
                    authorizeWithFacebookButton.onclick = facebookLoginButtonClick;
                }
            }, 250);        // ToDo, make more robust, other oAuth callbacks might be slow
        }
    }
}

// Windows Live Log-In
function initializeWindowsLive(){
    var client_id;
    if(isDevelopment_mode){
        client_id = '000000004817115C';     // test app, redirect to KODING
//          client_id = '000000004017020D';     // test app, redirect to CODENVY
    }
    else{
        client_id = '000000004C16A334';     // redirect to OpenShift
    }
    WL.init({
        client_id: client_id,
        scope: "wl.signin",
        response_type: "token",
//          redirect_uri: 'https://login.live.com/oauth20_desktop.srf'      // Safari workaround: redirect_uri is required but has default value 'current page' -> see WL.init docu
    });
    wlInitDone=true;
}

function windowsLiveLoginButtonClick(){
    if(!wlInitDone){
        windowsLiveApiLoadAndSignIn();
    }
    else{
        WL.login(windowsLiveLoginCallback);
    }
}

function makeWindowsLiveApiCall() {
    WL.api({
        path: "me",
        method: "GET"
    }).then(
        function (response){
            var userId = response.id;
            var displayName = response.name;    //  response.first_name, response.last_name
            WL.api({
                path: "me/picture",
                method: "GET"
            }).then(
                function(pictureResponse){
                    if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
                        // log-in SnapMyTrack server
                        serverLoginSend( 'WINDOWSLIVE', userId, displayName, pictureResponse.location);
                    }
                },
                function(pictureResponseFailed){
                    if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
                        console.log('WL.api(me/picture) error: ', responseFailed);
                        // log-in SnapMyTrack server
                        serverLoginSend( 'WINDOWSLIVE', userId, displayName, null);
                    }
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
            if(!userIsSignedIn && !serverLoginRunning){
                document.getElementById('authorizeWithWindowsBtn').style.visibility = '';
                $('#authorizeWithWindowsBtn').click(windowsLiveLoginButtonClick);
                $('#authorizeWithWindowsBtnLabel').click(windowsLiveLoginButtonClick);
            }
        }
    }
}

function facebookApiLoadAndSignIn(){
    if(!fbInitDone){
        $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
            if(!fbInitDone){
                initializeFacebook();
            }
            FB.getLoginStatus(facebookLoginStatusCallback);
        });
    }
}

function googleLoaded(){
    if( getUserParameter('accountType') === "GOOGLE" ){
        googleApiSignIn();
    }
}

function googleApiSignIn(){
    if(!googleInitDone){
        initializeGoogle();
    }
    getGoogleLoginStatus(handleGoogleAuthResult, true);
}

function windowsLiveApiLoadAndSignIn(){
    if(!wlInitDone){
        $.getScript('//js.live.net/v5.0/wl.js', function(){
            if(!wlInitDone){
                initializeWindowsLive();
            }
            WL.getLoginStatus(windowsLiveLoginStatusCallback);
        });
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
    return true;   // stop event propagation
}

function showSignInSpinner(){
    document.getElementById('signInInfo').style.visibility = '';
    $('#signInInfo').removeClass('isInvisible');
    $('#signInSpinner').addClass('spinner');
    
}

function hideSignInSpinner(){
    document.getElementById('signInInfo').style.visibility = 'hidden';
    $('#signInInfo').addClass('isInvisible');
    $('#signInSpinner').removeClass('spinner');
}

function showSignInButtons(){
    // FACEBOOK
    document.getElementById('authorizeWithFacebookBtn').style.visibility = '';
    document.getElementById('authorizeWithFacebookBtn').onclick = facebookLoginButtonClick;
    // GOOGLE
    document.getElementById('authorizeWithGoogleBtn').style.visibility = '';
    document.getElementById('authorizeWithGoogleBtn').onclick = googelLoginButtonClick;
    // WINDOWSLIVE
    document.getElementById('authorizeWithWindowsBtn').style.visibility = '';
    document.getElementById('authorizeWithWindowsBtn').onclick = windowsLiveLoginButtonClick;
    document.getElementById('authorizeWithWindowsBtnLabel').onclick = windowsLiveLoginButtonClick;
    // PASSWORD
    document.getElementById('authorizeWithMailPasswordBtn').style.visibility = '';
}

function prepareForSignIn(){
    removeUserParameter('accountType');   // local storage
    // show sign-in buttons
    showSignInButtons();
    // remove all tracks from map
    resetMap();
    hideMap();
    // reset overlay/footer
    showFooter(true);
    // hide spinner/userSettingsBtn
    document.getElementById('userSettingsBtn').style.visibility = 'hidden';
    // hide user account
    document.getElementById('loginUser').style.visibility = 'hidden';
    // show intro overlay
    resizePage();
}

function hideFooter( showHeaderButtons ){
    $('#homeFooter').animate({opacity:0.01}, 1250, function(){
            $('#homeFooter').addClass('isInvisible');
            $('#homeFooter').css({opacity:1.0});
            if(showHeaderButtons){
                $('#trackLocationBar').removeClass('isInvisible');
                document.getElementById('trackLocationBar').style.visibility = '';
                $('#publishBtn').removeClass('isInvisible');
                document.getElementById('publishBtn').style.visibility = '';
                // hide intro screen elements
                document.getElementById('appTitle').style.visibility = 'hidden';
                $('#appTitle').addClass('isInvisible');
                document.getElementById('introPageOverlay').style.visibility = 'hidden';
                $('#introPageOverlay').addClass('isInvisible');
                document.getElementById('introPageOverlaySmall').style.visibility = 'hidden';
                $('#introPageOverlaySmall').addClass('isInvisible');
            }
        }
    );
}

function showFooter( hideHeaderButtons ){
    if(hideHeaderButtons){
        $('#trackLocationBar').addClass('isInvisible');
        $('#publishBtn').addClass('isInvisible');
        // show intro screen elements
        resizePage();
    }
    $('#homeFooter').animate({opacity:1.00}, 1250, function(){
            $('#homeFooter').removeClass('isInvisible');
            document.getElementById('homeFooter').style.visibility = '';
            $('#homeFooter').css({opacity:1.0});
/*            if(hideHeaderButtons){
                $('#trackLocationBar').addClass('isInvisible');
                $('#publishBtn').addClass('isInvisible');
                // show intro screen elements
                document.getElementById('appTitle').style.visibility = '';
                $('#appTitle').removeClass('isInvisible');
                document.getElementById('introPageOverlay').style.visibility = '';
                $('#introPageOverlay').removeClass('isInvisible');
                document.getElementById('introPageOverlaySmall').style.visibility = '';
                $('#introPageOverlaySmall').removeClass('isInvisible');
            }   */
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
    document.getElementById('authorizeWithMailPasswordBtn').style.visibility = 'hidden';
    document.getElementById('passwordForgotten').onclick = passwordForgotten;
    document.getElementById('passwordSend').onclick = passwordLoginSend;
    hideFooter();
    return false;    // stop event propagation
}

function passwordForgotten(){
    // launch pop-in to reset password and send link to create new password via e-mail
    $('#passwordForgottenPopin').removeClass('isInvisible');
    document.getElementById('passwordForgottenPopin').style.visibility = '';
    return false;    // stop event propagation
}

function resetPasswordLogin(){
    if(userIsSignedIn){
        return;
    }
    if(document.getElementById('passwordFrame').style.visibility === ''){
        if(!serverLoginRunning){
            document.getElementById('authorizeWithMailPasswordBtn').style.visibility = '';
        }
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

function serverLoginCallback(response){
    // status
    //  - connected
    //  - auth_failed
    //  - user_creation_failed

    if(serverLoginRunning){
        serverLoginRunning = false;
        // hide sign-in spinner
        if(response.status === 'connected'){
            serverLogInSuccessfull( response.data );     // response.date = 'appUser'
        }
        else{
            hideSignInSpinner();
            var messageText = 'Sign-In has failed, check user Id and password';
            $("#messageArea").text(messageText);
            showMessageLog(true);
        }
    }
}

function serverLoginSend(accountType, userId, displayName, pictureUrl){
    if(!serverLoginRunning){
        // show user data
        userAccountType = accountType;
        serverLoginUserId = userId;    //  user for which latest login request has been sent to server (currently only needed to debugging)
        fillLogInUserFrame(userId, displayName, pictureUrl);

        // hide authorization buttons
        document.getElementById('authorizeWithWindowsBtn').style.visibility = 'hidden';
        document.getElementById('authorizeWithFacebookBtn').style.visibility = 'hidden';
        document.getElementById('authorizeWithGoogleBtn').style.visibility = 'hidden';
        document.getElementById('authorizeWithMailPasswordBtn').style.visibility = 'hidden';

        // hide into overlay
        document.getElementById('introPageOverlay').style.visibility = 'hidden';

        // show sign-in spinner
        showSignInSpinner();
        
        // log on to server
        serverLoginRunning = true;
        sendLogonDataToServer(accountType, userId, null, serverLoginCallback );
    }
}

function passwordLoginSend(){
    if(!serverLoginRunning){
        var userId = document.getElementById('emailInput').value;
        // show user data
        userAccountType = 'PASSWORD';
        serverLoginUserId = userId;    //  user for which latest login request has been sent to server (currently only needed to debugging)
        fillLogInUserFrame(userId, getFormattedUserDisplayName(userId), null);

        // hide authorization buttons
        document.getElementById('authorizeWithWindowsBtn').style.visibility = 'hidden';
        document.getElementById('authorizeWithFacebookBtn').style.visibility = 'hidden';
        document.getElementById('authorizeWithGoogleBtn').style.visibility = 'hidden';
        document.getElementById('authorizeWithMailPasswordBtn').style.visibility = 'hidden';

        // hide into overlay
        document.getElementById('introPageOverlay').style.visibility = 'hidden';

        // adopt icons scheme
        $('#publishBtn').addClass('publishIconBright');
        $('#buttonUserSettings').addClass('settingsIconBright');
        $('#publishBtn').addClass('publishIconDark');
        $('#buttonUserSettings').addClass('settingsIconDark');

        // show sign-in spinner
        showSignInSpinner();
        
        // log on to server
        serverLoginRunning = true;
        var accountType = 'PASSWORD';
        var password = document.getElementById('passwordInput').value;
        sendLogonDataToServer(accountType, userId, password, serverLoginCallback );
    }
    return false;    // stop event propagation
}

function serverUserChangeCallback(accountType, userId, appUser){
    if(appUser){
        // user successfully updated
        if(appUser.accountType === "PASSWORD"){
            // update user picture of account pop-over
            $('#userAccountPicture').css('background-image','url('+appUser.pictureUrl+')');
            // update user admin data (display name, picture url)
            fillLogInUserFrame(appUser.userId, appUser.displayName, appUser.pictureUrl);
        }
        disableUserChange();
    }
    else{
        // update issues
        // -> see message po-over
    }
}

function passwordUserChange(){
    var accountType = 'PASSWORD';
    var userId = document.getElementById('emailInput').value;
    var password = document.getElementById('passwordInput').value;
    var displayName = document.getElementById('userAccountChangeNameInput').value;
    var pictureUrl = document.getElementById('userAccountChangePictureUrlInput').value;
    var userPicture = '';
    if( !displayName || displayName.length===0 ){
        displayName = userDisplayName;
    }
    if( !pictureUrl || pictureUrl.length===0 ){
        pictureUrl = userPictureUrl;
    }
    fillLogInUserFrame(userId, displayName, userPicture);
    serverLoginRunning = true;
    sendUserChangeDataToServer(accountType, userId, password, displayName, userPicture, pictureUrl, serverUserChangeCallback );
    return false;    // stop event propagation
}

window.onload = function() {
    accessTokenFromUrl = getAccessTokenFromUrl();

    // register resize event handler
    window.addEventListener("resize", resizePage);
};

$(document).ready(function() {
    resizePage();

    $.ajaxSetup({ cache: true });

    // check if browser supports geo-location
    if(!navigator.geolocation) {
        alert('Your browser does not support geo-location dervices. You will not be able to records tracks.');
    }

    // oAuth Log-In
    if( getUserParameter('accountType') === "FACEBOOK" ){
        // Facebook
        facebookApiLoadAndSignIn();
    }
/*    else if( getUserParameter('accountType') === "GOOGLE" ){
        // Google
        googleApiLoadAndSignIn();
    }  */
    else if( getUserParameter('accountType') === "WINDOWSLIVE" ){
        // Windows Live
        windowsLiveApiLoadAndSignIn();
    }
    else{
        // Show all Sign-In buttons
        showSignInButtons();
    }

});
