/**
 * Created by Yoanis Gil on 16-02-25.
 */

var express = require('express');
var router = express.Router();
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

var API_SERVER = process.env.WEBSOCKET_API_SERVER || 'http://localhost:3001';

router.get('/*', function (req, res) {
    console.log("proxying GET request", req.url);
    proxy.web(req, res, {target: API_SERVER});
});

router.post('/*', function (req, res) {
    console.log("proxying POST request", req.url);
    proxy.web(req, res, {target: API_SERVER});
});

module.exports = router;