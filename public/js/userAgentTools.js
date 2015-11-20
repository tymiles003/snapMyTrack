var userAgentParser = new UAParser();

function isRunningOnIosDevice(){
    var version;
    var isIOS = false;
    var OS = userAgentParser.getOS();
    
//    alert(JSON.stringify(OS, null, '    '));   // ToDo: Deactivate before shipment

    if(OS.name=='iOS'){
      isIOS=true;
    }
    return isIOS; 
}

function isRunningOnIpad(){
    var isIpad=false;
    if(isRunningOnIosDevice()){
        if($(window).width() === 1024 || $(window).width() === 768)
        isIpad=true;
//        alert("w:"+$(window).width() + ", h:"+$(window).height());
    }
    return isIpad; 
}

function isRunningOnAndroidDevice(){
    var isAndroid = false;
    var OS = userAgentParser.getOS();

//    alert(JSON.stringify(OS, null, '    '));   // ToDo: Deactivate before shipment
    
    if(OS.name=='Android'){
      isAndroid=true;
    }
    return isAndroid;
}

function isRunningOnFirefoxOsDevice(){
    var isFirefoxOs = false;
    var OS = userAgentParser.getOS();
    
//    alert(JSON.stringify(OS, null, '    '));   // ToDo: Deactivate before shipment

    if(OS.name=='Firefox OS'){
      isFirefoxOs=true;
    }
    return isFirefoxOs;
}

function isRunningOnTizenDevice(){
    var isTizen = false;
    var OS = userAgentParser.getOS();
    
    if(OS.name=='Tizen'){
      isTizen=true;
    }
    return isTizen;
}

function isRunningOnUbuntuDevice(){
    var version;
    var isUbuntuTouch = false;

    var OS = userAgentParser.getOS();
    
    if(OS.name=='Ubuntu'){
      isUbuntuTouch=true;
    }
    return isUbuntuTouch;
}

function isRunningOnUbuntuTouchDevice(){
    var version;
    var isUbuntuTouch = false;

    var OS = userAgentParser.getOS();
    
    if(OS.name=='Ubuntu'){
      isUbuntuTouch=true;
    }
    return isUbuntuTouch;
}

function isRunningOnWindows8Device(){
    var isWindows8 = false;
    var OS = userAgentParser.getOS();
//    alert(JSON.stringify(OS, null, '    '));   // ToDo: Deactivate before shipment

    if(OS.name=='Windows'){
      if(OS.version == '8.0' || OS.version == '8.1'){
        isWindows8=true;        
      }
    }
    return isWindows8;
}

function isRunningOnWindows10Device(){
    var isWindows10 = false;
    var OS = userAgentParser.getOS();
//    alert(JSON.stringify(OS, null, '    '));   // ToDo: Deactivate before shipment

    if(OS.name=='Windows'){
      if(OS.version == '10.0'){
        isWindows10=true;        
      }
    }
    return isWindows10;
}

function isRunningOnWindowsPhone8Device(){
    var isWindowsPhone8 = false;
    var OS = userAgentParser.getOS();

    if(OS.name=='Windows Phone'){
      isWindowsPhone8=true;
    }
    return isWindowsPhone8;
}

function isRunningOnBlackberryDevice(){
    var isBlackberry = false;
    var OS = userAgentParser.getOS();  

    if(OS.name=='BlackBerry'){
      isBlackberry=true;
    }
    return isBlackberry;
}

function isRunningOnKindleFireDevice(){
    var isKindleFire = false;
    var currenBrowser = userAgentParser.getBrowser();

    if(currenBrowser.name == 'Silk'){
      isKindleFire = true;
    }
    return isKindleFire;
}

function isRunningOnMobileDevice(){
    var isMobileDevice = false;
    if(isRunningOnIosDevice()
        || isRunningOnAndroidDevice()
        || isRunningOnUbuntuTouchDevice()
        || isRunningOnBlackberryDevice()
        || isRunningOnWindowsPhone8Device() ){
      isMobileDevice=true;  
    }
    return isMobileDevice;
}

function isRunningOnChromeBrowser(){
    var isChrome = false;
    var currenBrowser = userAgentParser.getBrowser();

    if(currenBrowser.name == 'Chrome' || currenBrowser.name == 'Chromium'){
      isChrome=true;
    }
    return isChrome;
}

function isRunningOnFirefoxBrowser(){
    var isFirefox = false;
    var currenBrowser = userAgentParser.getBrowser();

    if(currenBrowser.name == 'Firefox'){
      isFirefox=true;
    }
    return isFirefox;
}