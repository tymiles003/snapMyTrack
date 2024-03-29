// initialization

var isDevelopment_mode=false;   // add some dev. info ( success/error messages )
var useGeoWatch=false;
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
var trackingWatchId;
var watchGeolocationNotSupported;

// 1) assign click events
$('#userSettingsBtn').click(toggleSettings);
$('#userSettingsCloseBtn').click(toggleSettings);
$('#passwordForgottenCloseBtn').click(togglePasswordForgotten);
$('#passwordForgottenSendBtn').click(sendPasswordForgottenEmail);
$('#publishBtn').click(togglePublish);
$('#publishSend').click(publish);
$('#publishCloseBtn').click(togglePublish);
$('#publishPopin').click(publishPopinClick);
$('#socialShareFacebookBtn').click(facebookSend);
$('#socialShareGoogleBtn').click(googleSend);
$('#socialShareWhatsAppBtn').click(whatsAppSend);
$('#socialShareEmailBtn').click(toggleEmailSend);
$('#messageAreaCloseBtn').click(toggleMessageLog);
$('#messageAreaGotoSingInScreenBtn').click(toggleMessageLogSignIn);
$('#messageAreaGotoSingInCloseScreenBtn').click(toggleMessageLogSignIn);
$('#trackLocation').click(sendLocationPeriodically);
$('#trackLocationStatus').click(sendLocationPeriodically);
$('#authorizeWithEmailBtn').click(passwordLoginButtonClick);
$('body').click(resetPasswordLogin);
$('#publishEmailInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#emailInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#passwordInput').click(function(){return false});    // stop propagation of click event to 'body'
$('#publishTrackSelect').click(function(){return false});    // stop propagation of click event to 'body'
$('#publishPeriodSelect').click(function(){return false});    // stop propagation of click event to 'body'
$('#userAccountLogout').click(logOut);
$('#userAccountDisplayName').click(toggleDisplayName);
$('#userAccountPicture').click(togglePictureUrl);
$('#userAccountPopin').click(disableUserChange);
$('#userAccountRemove').click(removeAccountClick);
$('#homePageLink').click(navigateToHomepagePage);

function removeAccountClick(){
    setMessageLogText('Your SnapMyTrack account will get removed. All tracks will get deleted and published links will show "Account deleted by owner".');
    hidePopInsButOne('messageLogPopin');
    showMessageLogToConfirm(true, false);
}

$('#userAccountChangeNameInput').click(function(){return false});   // stop event propagation
$('#userAccountChangePictureUrlInput').click(function(){return false});   // stop event propagation
document.getElementById('passwordInput').onkeydown=passwordEnter;
document.getElementById('passwordForgottenEmail').onkeydown=resetPasswordEnter;
document.getElementById('userAccountChangeNameInput').onkeydown=displayNameEnter;
document.getElementById('userAccountChangePictureUrlInput').onkeydown=pictureUrlEnter;

function resizePage(){
    if(!serverLoginRunning && !userIsSignedIn){
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
            adoptMapAfterResize();
        }
    }
    else if(mapIsReadyToUse){
        adoptMapAfterResize();        
    }
}

function hidePopInsButOne(doNotHideThisPopinId){
    // hide settings pop-in
    if( doNotHideThisPopinId !== 'settingsPopin'){
        $('#settingsPopin').addClass('isInvisible');
    }
    // hide publish pop-in
    if( doNotHideThisPopinId !== 'publishPopin'){
        $('#publishPopin').addClass('isInvisible');
    }
    // hide user account pop-in
    if( doNotHideThisPopinId !== 'userAccountPopin'){//
        $('#userAccountPopin').addClass('isInvisible');
    }
    if( doNotHideThisPopinId !== 'messageLogPopin'){//
        $('#messageLogPopin').addClass('isInvisible');
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

function toggleShareInfo(){
    if( $('#socialShareInfoFrame').hasClass('isInvisible') ){
        $('#socialShareInfoFrame').removeClass('isInvisible');
    }
    else{
        $('#socialShareInfoFrame').addClass('isInvisible');
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
    var accessTokenUnregisteredUser;
	var params = window.location.href.split('=');
	if(params && params[1] && params[1].length>0){
        var params2 = params[0].split('?');
        if(params2 && params2[1] === "accessTokenUnregisteredUser"){
            accessTokenUnregisteredUser = params[1];
        }
	}
	return accessTokenUnregisteredUser;
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
    if(userIdForShow && accountTypeForShow !== ""){
        getUserSettingsFromServer(userIdForShow, accountTypeForShow, true);
    }
    else{
        getGeoDataFromServer(userId, accountType, accessTokenFromUrl);
    }
}

function sendLocationPeriodically(event, doNotTogglePeriodicSend){
    var frequencySeconds = 2;   // send every 'frequencySeconds' seconds

    // check if sign-in via access token (and w/o oAuth)
    if(!signedInUserId){
        $("#messageArea").text("Sign in to record or publish tracks (Facebook, Google, Microsoft or Email).");
        showMessageLog(false, false, true);
        return;
    }
    else{
        hideMessageLog();
    }

    if(trackingIsActive && !doNotTogglePeriodicSend){
        // turn off tracking
        trackingIsActive = false;
        // turn off watching geolocation
        if(trackingWatchId){
            navigator.geolocation.clearWatch(trackingWatchId);
            trackingWatchId = null;
        }
        // adjust theme        
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
            // turn on tracking
            trackingIsActive = true;
            startGeoDataUploadWorker(1000);   // uploaded data later, if internet connection is lost
            $("#trackLocationStatus").addClass("statusOn");
            $("#trackLocationStatus").removeClass("statusOff");
            $("#trackLocationStatus").removeClass("statusOffDark");
            $("#trackLocationStatus").addClass("pulser");
            if( useGeoWatch && 'watchPosition' in navigator.geolocation && !watchGeolocationNotSupported){    // i.e. Firefox on Android
                startWatchPosition();
            }
            else{
                sendLocation();
                setTimeout( function(){
                    sendLocationPeriodically( null, true );
                },
                frequencySeconds*1000 );
            }
        }
        else{
            return;    // periodic tracking has been switched off
        }
    }
}

function scheduleWatchPosition(rescheduleSeconds){
    setTimeout( function(){
        if(navigator.onLine){
            startWatchPosition();
        }
        else{
            scheduleWatchPosition();
        }
    }
    , rescheduleSeconds);
}

function getGeolocationOptions(){
    // see https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
    return { enableHighAccuracy: true,
           timeout: Number.POSITIVE_INFINITY,
           maximumAge: 0                        
        };  
}

function startWatchPosition(){
    if(!trackingWatchId){
        trackingWatchId = navigator.geolocation.watchPosition(function(position){
            // success
    //        alert("sendLoc via 'watchPosition' API");
            if( positionQualityOk(position) ){
                sendLocation(position);
            }
        }, function(err){
            // error    
            trackingWatchId=null;
            console.log("watchPosition has failed: ",err.message + ', code: '+err.code);
            switch(err.code) {
                case err.TIMEOUT:{
                    if(navigator.onLine){
                        startWatchPosition();    
                    }
                    else{
                        // try again in 15 seconds
                        scheduleWatchPosition(15000);
                    }
                }
            }
        }, getGeolocationOptions() );
    }
}

function sendLocation(position){
    var self=this;
    if(trackingIsActive){
        if(signedInUserId){
            if(position){
                // update current-location marker and center it
                setMapCenter(position);
                updateCurrentLocationOnMap(position);
                // add new position to current track
                updateCurrentTrackOnMap(position);
                // send location to server
                sendGeoDataToServer(position.timestamp,
                                    position.coords.accuracy,
                                    position.coords.latitude,
                                    position.coords.longitude,
                                    position.coords.speed);
            }
            else{
                // depricated --> https needed, see https://goo.gl/rStTGz
                navigator.geolocation.getCurrentPosition( function(position) {
                    if( positionQualityOk(position) ){
                        // update current-location marker and center it
                        setMapCenter(position);
                        updateCurrentLocationOnMap(position);
                        // add new position to current track
                        updateCurrentTrackOnMap(position);
                        // send location to server
                        sendGeoDataToServer(position.timestamp,
                                            position.coords.accuracy,
                                            position.coords.latitude,
                                            position.coords.longitude,
                                            position.coords.speed);
                    }
                },
                function(err){
                    console.log('Track recording -> getCurrentPosition has failed: ',err);
                },
                getGeolocationOptions() );
            }
        }
        else{
            $("#messageArea").text('provide a unique user Id');
            showMessageLog(true, false, false);
        }
    }
}

// Google Log-In
function initializeGoogle() {
    var apiKey = 'AIzaSyBi3qbsG6PCHqzgF9HtBS_ciAJMjufNbgY';
    gapi.client.setApiKey(apiKey);
    googleInitDone = true;        
}

function getGoogleLoginStatus(callback, immediate){
    // set immediate = false to show oAuth popup
    window.setTimeout( function(){
        var googleClientId = '444771318616-gfpg8jouu25l05frrtrj8l3len0ei8pr.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email';
        gapi.auth.authorize({ client_id: googleClientId,
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
    }
    else if(authResult && authResult.error==="immediate_failed" && authResult.error_subtype==="access_denied"){
        userAccountType = 'GOOGLE';
        if( !googleInitDone ){
            googleApiLoadAndSignIn();
        }
        else{
            getGoogleLoginStatus(handleGoogleAuthResult, false);
        }
    }
    else {
        if(!userIsSignedIn && !serverLoginRunning){
            authorizeWithGoogleButton.onclick = googelLoginButtonClick;
            authorizeWithGoogleButton.style.visibility = '';
        }
    }
}

function toggleUserAccountPopin(){
    hidePopInsButOne('userAccountPopin');
    if($('#userAccountPopin').hasClass('isInvisible')){
        $('#userAccountPopin').removeClass('isInvisible');
        $('#userAccountCloseBtn').click(toggleUserAccountPopin);
        document.getElementById('userAccountPicture').style.backgroundImage = "url('"+userPictureUrl+"')";
        $('#userAccountDisplayName').text(getFormattedUserDisplayName());
        $('#userAccountAccountType').text(userAccountType);
        setAccountTypeTheme('userAccountAccountType');
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

function setAccountTypeTheme(elementId){
    if( getUserParameter('accountType') === "FACEBOOK" ){
        // Facebook
        $('#'+elementId).addClass('accountTypeThemeFACEBOOK');
        $('#'+elementId).removeClass('accountTypeThemeWINDOWSLIVE');
        $('#'+elementId).removeClass('accountTypeThemeGOOGLE');
        $('#'+elementId).removeClass('accountTypeThemePASSWORD');
    }
    else if( getUserParameter('accountType') === "WINDOWSLIVE" ){
        // Windows Live
        $('#'+elementId).addClass('accountTypeThemeWINDOWSLIVE');
        $('#'+elementId).removeClass('accountTypeThemeFACEBOOK');
        $('#'+elementId).removeClass('accountTypeThemeGOOGLE');
        $('#'+elementId).removeClass('accountTypeThemePASSWORD');
    }
    else if( getUserParameter('accountType') === "GOOGLE" ){
        // Google
        $('#'+elementId).addClass('accountTypeThemeGOOGLE');
        $('#'+elementId).removeClass('accountTypeThemeFACEBOOK');
        $('#'+elementId).removeClass('accountTypeThemeWINDOWSLIVE');
        $('#'+elementId).removeClass('accountTypeThemePASSWORD');
    }
    else{
        $('#'+elementId).addClass('accountTypeThemePASSWORD');
        $('#'+elementId).removeClass('accountTypeThemeFACEBOOK');
        $('#'+elementId).removeClass('accountTypeThemeWINDOWSLIVE');
        $('#'+elementId).removeClass('accountTypeThemeGOOGLE');
    }
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
            document.getElementById('loginUser').appendChild(heading);
        }
        if(document.getElementById('userDisplayName')){
            document.getElementById('userDisplayName').style.visibility='hidden';
            $('#userDisplayName').addClass('isInvisible');
        }
    }
    else if(displayName){
        if(document.getElementById('userImage')){
            $('#userImage').addClass('isInvisible');
        }
        if(!document.getElementById('userDisplayName')){
            var displayNameDiv = document.createElement('div');
            displayNameDiv.id = 'userDisplayName';
            displayNameDiv.style.position = 'absolute';
            displayNameDiv.style.right = '8.0em';
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
            $('#userDisplayName').removeClass('isInvisible');
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
                var email = "";
                for(var i=0,len_i=resp.result.emails.length;i<len_i;i++){
                    if(resp.result.emails[i].type === "account"){
                        email = resp.result.emails[i].value;
                        break;
                    }
                }
                // log-in SnapMyTrack server
                serverLoginSend( 'GOOGLE', resp.result.id, resp.result.displayName, resp.result.image.url, email, accessTokenFromUrl);
            }
        }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
        });
    });
}

function googelLoginButtonClick(event){
    if( !googleInitDone ){
        googleApiLoadAndSignIn();
    }
    else{
        googleApiSignIn();
    }
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
        // derive display name from user id (email)
        if( !displayName || displayName.length === 0){
            displayName = getFormattedUserDisplayName(appUser.userId);
        }
        // update user admin data (display name, picture url)
        fillLogInUserFrame(appUser.userId, displayName, appUser.pictureUrl);
    }
    else{
        if(userPictureUrl && !appUser.pictureUrl){
            // save picture url on server (use it for Google maps markers)
            sendUserChangeDataToServer(appUser.accountType, appUser.userId, null, appUser.displayName, null, userPictureUrl, oAuthUserPictureUrlChangeCallback);
        }
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
            FB.login(facebookLoginCallback, {scope:'email,user_friends'});
        }
    }
}

function makeFacebookApiCall() {
    // get name, picture and email
    FB.api('/me?fields=name,email,picture', function(response) {
        var displayName = response.name;
        var userId = response.id;
        if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
            // log-in SnapMyTrack server
            serverLoginSend( 'FACEBOOK', userId, displayName, response.picture.data.url, response.email, accessTokenFromUrl );
        }
    });
    // get Facebook friends (contact info) -> needed to publish tracks
/*    FB.api('me/invitable_friends', function(response) {
        var displayName = response;
    });
    FB.api('me/taggable_friends', function(response) {
        var displayName = response;
    });
    FB.api('me/friends', function(response) {
        var displayName = response;
    });   */
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
        else if(response.status === "not_authorized"){
            FB.getLoginStatus(facebookLoginStatusCallbackForManualLogon);
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
        var scope = {scope:["wl.signin", "wl.basic", "wl.emails"]};
        WL.login(scope, windowsLiveLoginCallback);
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
            var email = "";
            if(response.emails.preferred){
                email = response.emails.preferred;
            }
            else if(response.emails.account){
                email = response.emails.account;
            }
            WL.api({
                path: "me/picture",
                method: "GET"
            }).then(
                function(pictureResponse){
                    if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
                        // log-in SnapMyTrack server
                        serverLoginSend( 'WINDOWSLIVE', userId, displayName, pictureResponse.location, email, accessTokenFromUrl);
                    }
                },
                function(pictureResponseFailed){
                    if(!userIsSignedIn){    // make sure we not already looged in with GOOGLE, WINDOWSLIVE, ...
                        console.log('WL.api(me/picture) error: ', responseFailed);
                        // log-in SnapMyTrack server
                        serverLoginSend( 'WINDOWSLIVE', userId, displayName, null, email, accessTokenFromUrl);
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
        else if(response.status === "notConnected"){
            var scope = {scope:["wl.signin", "wl.basic", "wl.emails"]};
            WL.login(scope, windowsLiveLoginCallback);
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
        // show oAuth sign-in info/spinner
        showSignInOauthInfo();
        $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
            if(!fbInitDone){
                initializeFacebook();
            }
            FB.getLoginStatus(facebookLoginStatusCallback);
        });
    }
}

function facebookApiLoad(callback){
    if(!fbInitDone){
        // show oAuth sign-in info/spinner
        showSignInOauthInfo();
        $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
            if(!fbInitDone){
                initializeFacebook();
                callback();
            }
        });
    }
}

function googleApiLoadAndSignIn(){
    if(!googleInitDone){
        // show oAuth sign-in info/spinner
        showSignInOauthInfo();
        $.ajaxSetup({ cache: true });
        $.getScript('https://apis.google.com/js/client:plusone.js?onload=googleApiSignIn', function(){
            googleApiSignIn();
        });
        $.ajaxSetup({ cache: true });
    }
}

function googleApiLoad(callback){
    if(!googleInitDone){
        // show oAuth sign-in info/spinner
        showSignInOauthInfo();
        $.ajaxSetup({ cache: true });
        $.getScript('https://apis.google.com/js/client:plusone.js?onload=googleApiSignIn', function(){
            initializeGoogleMultitry(callback);
            callback();
        });
        $.ajaxSetup({ cache: true });
    }
}

function googleApiSignIn( tryCounter ){
    if(gapi.client){
        if(!googleInitDone){
            initializeGoogle();
        }
        getGoogleLoginStatus(handleGoogleAuthResult, true);
    }
    else{
        if(!googleInitDone){
            if(!tryCounter){
                tryCounter=1;
            }
            if( tryCounter<3 ){
                setTimeout( function(){
                    googleApiSignIn( tryCounter );
                },
                1000);
            }
        }
    }
}

function initializeGoogleMultitry( callback, tryCounter ){
    if(gapi.client){
        if(!googleInitDone){
            initializeGoogle();
            callback();
        }
    }
    else{
        if(!googleInitDone){
            if(!tryCounter){
                tryCounter=1;
            }
            if( tryCounter<3 ){
                setTimeout( function(){
                    initializeGoogleMultitry( tryCounter );
                },
                1000);
            }
        }
    }
}

function windowsLiveApiLoadAndSignIn(){
    if(!wlInitDone){
        // show oAuth sign-in info/spinner
        showSignInOauthInfo();
        $.getScript('//js.live.net/v5.0/wl.js', function(){
            if(!wlInitDone){
                initializeWindowsLive();
            }
            WL.getLoginStatus(windowsLiveLoginStatusCallback);
        });
    }
}

function logOut(){
    // we do not provide sign-out
    // -> show 'sign in' buttons instead
    userIsSignedIn=false;
    toggleUserAccountPopin();
    prepareForSignIn();
    return true;   // stop event propagation
}

function showSignInOauthInfo(){
    $('#signInOauthInfo').removeClass('isInvisible');
    $('#signInSpinnerOauth').addClass('spinner');
}

function hideSignInOauthInfo(){
    $('#signInOauthInfo').addClass('isInvisible');
    $('#signInSpinnerOauth').removeClass('spinner');
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

function showGeodataReloadSpinner(){
    $('#userSettingsBtn').addClass('spinner');
}

function hideGeodataReloadSpinner(){
    $('#userSettingsBtn').removeClass('spinner');
}

function showSignInButtons(){
    // Authorization frame
    document.getElementById('authorizeFrame').style.visibility = '';
    $('#authorizeFrame').removeClass('isInvisible');
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
    document.getElementById('authorizeWithEmailBtn').style.visibility = '';
}

function prepareForSignIn(){
    if(serverLoginRunning){
        // ToDo -> stop running callbacks
        // - scipt load for oauth sign in
        // - oAuth sign in
        // - server sign in
    }
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
    document.getElementById('authorizeWithEmailBtn').style.visibility = 'hidden';
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
            document.getElementById('authorizeWithEmailBtn').style.visibility = '';
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
        else if ( response.data.access_token_expired ){
            hideSignInSpinner();
            setMessageLogText("Published track has expired. Contact your friend to publish more tracks for you.");
//            $("#messageArea").text("Published track has expired. Contact your friend to publish more tracks for you.");
            showMessageLog(false, true, false);
        }
        else{
            hideSignInSpinner();
            $("#messageArea").text('Sign-In has failed, check user Id and password');
            showMessageLog(true, false, false);
        }
    }
}

function serverLoginSend(accountType, userId, displayName, pictureUrl, email, accessToken){
    if(!serverLoginRunning){
        // show user data
        userAccountType = accountType;
        serverLoginUserId = userId;    //  user for which latest login request has been sent to server (currently only needed to debugging)
        fillLogInUserFrame(userId, displayName, pictureUrl);

        // hide sign-in elements
        prepareSignInCallback();
        
        // log on to server
        serverLoginRunning = true;
        sendLogonDataToServer(accountType, userId, null, accessToken, serverLoginCallback);
    }
}

function passwordLoginSend(){
    if(!serverLoginRunning){
        var userId = document.getElementById('emailInput').value;
        // show user data
        userAccountType = 'PASSWORD';
        serverLoginUserId = userId;    //  user for which latest login request has been sent to server (currently only needed to debugging)
        fillLogInUserFrame(userId, getFormattedUserDisplayName(userId), null);

        // hide sign-in elements
        prepareSignInCallback();

        // adopt icons scheme
        $('#publishBtn').addClass('publishIconBright');
        $('#buttonUserSettings').addClass('settingsIconBright');
/*        $('#publishBtn').addClass('publishIconDark');
        $('#buttonUserSettings').addClass('settingsIconDark');  */

        // log on to server
        var accountType = 'PASSWORD';
        var password = document.getElementById('passwordInput').value;
        serverLoginRunning = true;
        sendLogonDataToServer(accountType, userId, password, accessTokenFromUrl, serverLoginCallback);
    }
    return false;    // stop event propagation
}

function prepareSignInCallback(){
    // hide authorization buttons
    document.getElementById('authorizeWithWindowsBtn').style.visibility = 'hidden';
    document.getElementById('authorizeWithFacebookBtn').style.visibility = 'hidden';
    document.getElementById('authorizeWithGoogleBtn').style.visibility = 'hidden';
    document.getElementById('authorizeWithEmailBtn').style.visibility = 'hidden';
    // hide authorization frame
    document.getElementById('authorizeFrame').style.visibility = 'hidden';
    $('#authorizeFrame').addClass('isInvisible');
    // hide into overlay
    document.getElementById('introPageOverlay').style.visibility = 'hidden';
    // hide oAuth sign-in spinner
    hideSignInOauthInfo();
    // show sign-in spinner
    showSignInSpinner();
    // scroll page to the top
    if(isRunningOnIpad()){
        window.scrollTo(500, 0);
    }
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

function oAuthUserPictureUrlChangeCallback(accountType, userId, appUser){
    if(appUser){
        // nothing to do here
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
    sendUserChangeDataToServer(accountType, userId, password, displayName, userPicture, pictureUrl, serverUserChangeCallback);
    return false;    // stop event propagation
}

window.onload = function() {
    accessTokenFromUrl = getAccessTokenFromUrl();
    if(accessTokenFromUrl){
        if( getUserParameter('accountType') === ""){
            // one-time access, no sign in needed
            //  - show register button to become a snapMyTrack user
            //  - show info messages, when clicking "Record" or "Publish"
            serverLoginSend("", "", "", "", "", accessTokenFromUrl);            
        }    
        else if( getUserParameter('accountType') === "PASSWORD" ){
            // sign-in via email/password
        }    
        else{
            // automatic oAuth sign in (FACEBOOK, GOOGLE, WINDOWSLIVE)
        }
    }
    // register resize event handler
    window.addEventListener("resize", resizePage);
};

$(document).ready(function() {
    resizePage();

    $.ajaxSetup({ cache: true });

    // check if browser supports geo-location
    if(!navigator.geolocation) {
        $("#messageArea").text('Browser has no geo-location services. You can look at tracks but cannot record new tracks.');
        showMessageLog(false, false, false);
    }
    else{
        if( isRunningOnAndroidDevice() && isRunningOnFirefoxBrowser() ){
            watchGeolocationNotSupported = true;
        }
    }

    // oAuth Log-In
    if( getUserParameter('accountType') === "FACEBOOK" ){
        // Facebook
        showSignInOauthInfo();
        facebookApiLoadAndSignIn();
    }
    else if( getUserParameter('accountType') === "WINDOWSLIVE" ){
        // Windows Live
        showSignInOauthInfo();
        windowsLiveApiLoadAndSignIn();
    }
    else if( getUserParameter('accountType') === "GOOGLE" ){
        // Google
        showSignInOauthInfo();
        googleApiLoadAndSignIn();
    }

    else{
        // Show all Sign-In buttons
        showSignInButtons();
    }

});
