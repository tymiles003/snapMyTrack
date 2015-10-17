// mailService.js
// ==============

var snapMyTrackEmail='snapMyTrack@dsignmatters.com';
var snapMyTrackHostUrl;
var dev_config;
try{
    dev_config = require('../.dev_config/config.json');
}
catch(err){
    console.log('dev config catch');
    if(!process.env.OPENSHIFT_SENDMAIL_API_KEY){
      console.log('mongodbUrl: process.env.OPENSHIFT_SENDMAIL_API_KEY AND ../.dev_config/config.json not available');  // deactivate later
    }
}

var sendmail_api_key;

module.exports = {
  sendSnapMyTrackMail: function(res, mailData){
    sendMail(res, mailData);
  },
  getSnapMyTrackHostUrl: function(){
    if(process.env.OPENSHIFT_APP_HOST_URL){
        snapMyTrackHostUrl = process.env.OPENSHIFT_APP_HOST_URL;    // host of productive domain
    }
    else if(dev_config && dev_config.APP_HOST_URL){
        snapMyTrackHostUrl = dev_config.APP_HOST_URL;
        console.log('Mail-Service (dev_config.APP_HOST_URL): ', dev_config.APP_HOST_URL);   // ToDo: May be deactivate later
    }
    else{
        console.log('Mail-Service: Host url process.env.OPENSHIFT_APP_HOST_URL not available');  // deactivate later
    }
    return snapMyTrackHostUrl;
  },
  getSnapMyTrackEmail: function(){
      return snapMyTrackEmail;
  }
};

function sendMail(res, mailData){
    // OPENSHIFT_SENDMAIL_API_KEY set via SSH (Chrome app 'Secure Shell'), see path .env/user_vars
    if(process.env.OPENSHIFT_SENDMAIL_API_KEY){
      sendmail_api_key=process.env.OPENSHIFT_SENDMAIL_API_KEY;
      console.log('mongodb Url (process.env.OPENSHIFT_SENDMAIL_API_KEY): ', process.env.OPENSHIFT_SENDMAIL_API_KEY);   // ToDo: May be deactivate later
    }
    else if(dev_config && dev_config.SENDGRID_API_KEY){
      sendmail_api_key=dev_config.SENDGRID_API_KEY;
      console.log('sendMail: Sendgrid API key (dev_config.SENDMAIL_API_KEY): ', dev_config.SENDGRID_API_KEY);   // ToDo: May be deactivate later
    }
    else{
      console.log('sendMail: Sendgrid API key process.env.OPENSHIFT_SENDMAIL_API_KEY not available');  // deactivate later
      return;
    }

    console.log('Mail data: ',mailData);

    var sendgrid = require("sendgrid")(sendmail_api_key);   // do not move to top, API key is needed
    var email = new sendgrid.Email();

    email.addTo(mailData.to);
    email.setFrom(mailData.from);
    email.setSubject(mailData.subject);
    email.setHtml(mailData.html);
    sendgrid.send(email, function(err, json) {
        if (err) { 
            console.log(err);
            console.log(json);
        }
        else{
            console.log("SnapMyTrack account conf. mail sent: '"+ mailData.subject + "' sent to " + mailData.to + "!");
        }
    });
}