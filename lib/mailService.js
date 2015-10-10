// var sendmail_api_user = "MichaelBiermann:S68.31zellengaz";
var sendmail_api_key = "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";
//var sendgrid = require("sendgrid")(sendmail_api_user, sendmail_api_key);
var sendgrid = require("sendgrid")(sendmail_api_key);
var email = new sendgrid.Email();

module.exports = {
  sendSnapLocMail: function(publishData){
    sendTestMail(publishData);
  }
};

function sendTestMail(publishData){
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
            console.log("SnapLoc e-mail '"+ publishData.subject + "' sent to " + publishData.to + "!");
        }
    });
}