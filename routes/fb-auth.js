/**
 * Created by brujitos on 16-02-05.
 */

var express = require('express');
var router = express.Router();
var strategies = require('../auth/strategies');
var passport = require('passport');

router.get(
    '/facebook',
    passport.authenticate('facebook', {session: false})
);

router.get('/facebook/callback',
    passport.authenticate('facebook', {session: false, failureRedirect: "/"}),
    function (req, res) {
        res.redirect("/home?access_token=" + req.user.access_token);
    }
);

module.exports = router;