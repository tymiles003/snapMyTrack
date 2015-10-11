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
var sendgrid = require("sendgrid")(sendmail_api_key);
var email = new sendgrid.Email();

module.exports = {
  sendSnapLocMail: function(publishData){
    sendTestMail(publishData);
  }
};

function sendTestMail(publishData){
    // OPENSHIFT_SENDMAIL_API_KEY set via SSH (Chrome app 'Secure Shell'), see path .env/user_vars
    if(process.env.OPENSHIFT_SENDMAIL_API_KEY){
      sendmail_api_key=process.env.OPENSHIFT_SENDMAIL_API_KEY;
      console.log('mongodb Url (process.env.OPENSHIFT_SENDMAIL_API_KEY): ', process.env.OPENSHIFT_SENDMAIL_API_KEY);   // ToDo: May be deactivate later
    }
    else if(dev_config && dev_config.SENDGRID_API_KEY){
      sendmail_api_key=dev_config.SENDGRID_API_KEY;
      console.log('Get-Handler: mongodb Url (dev_config.SENDMAIL_API_KEY): ', dev_config.SENDGRID_API_KEY);   // ToDo: May be deactivate later
    }
    else{
      console.log('Get-Handler: mongodbUrl process.env.OPENSHIFT_SENDMAIL_API_KEY not available');  // deactivate later
      return;
    }

    email.addTo(publishData.to);
    email.setFrom(publishData.from);
    email.setSubject(publishData.subject);
    email.setHtml(publishData.html);
    sendgrid.send(email, function(err, json) {
        if (err) { 
            console.log(json);
//            return console.error(err);
        }
        else{
            console.log("SnapTrack e-mail '"+ publishData.subject + "' sent to " + publishData.to + "!");
        }
    });
}