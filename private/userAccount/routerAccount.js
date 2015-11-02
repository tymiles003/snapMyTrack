var express = require('express');
var router = express.Router();


// router
// - '/userAccountConfirm' -> '/public/userAccountConfirm/index.html'
router.get('/accountConfirm', function(req, res){
    res.status(200).sendFile(path.join(__dirname,'/private/userAccount/accountConfirmed.html'));
//    res.status(200).sendFile(__dirname + '/private/userAccount/accountConfirmed.html');
});
router.get('/passwordReset', function(req, res){
    res.status(200).sendFile(path.join(__dirname, '/private/userAccount/setNewPassword.html'));
//    res.status(200).sendFile(__dirname + '/private/userAccount/setNewPassword.html');
});

module.exports = router;