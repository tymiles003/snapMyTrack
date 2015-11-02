var express = require('express');
var router = express.Router();


// router
router.get('/icon/svg/*', function(req, res){
    console.log('1: /public/icon/svg');
    console.log('2: ' + __dirname);
    console.log('3: ' + __dirname + '/icon/svg');
    console.log('4: path: ' + req.path);
    console.log('5: fileloc: ' + __dirname + req.path);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).sendFile( __dirname + req.path );
});

// all other public files
router.get('/*', express.static(__dirname));

module.exports = router;