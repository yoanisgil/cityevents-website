var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function (req, res, next) {
    res.sendFile(path.resolve('views/index.html'))
});


router.get('/templates/:path', function (req, res, next) {
    // Force parameter to end with HTML extension so we don't server all files under the "views" directory.
    if (!req.params.path.endsWith('.html')) {
        res.status(403).send('Access forbidden');
    }

    res.sendFile(path.resolve('views/' + req.params.path))
});


module.exports = router;