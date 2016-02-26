/**
 * Created by Yoanis Gil on 16-02-25.
 */

var express = require('express');
var router = express.Router();
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({ws: true});

var WEBSOCKET_API_SERVER = process.env.WEBSOCKET_API_SERVER || 'http://localhost:3002';

router.get('/socket.io/*', function (req, res) {
    console.log("proxying GET request", req.url);
    proxy.web(req, res, {target: WEBSOCKET_API_SERVER});
});
router.post('/socket.io/*', function (req, res) {
    console.log("proxying POST request", req.url);
    proxy.web(req, res, {target: WEBSOCKET_API_SERVER});
});

module.exports = {
    router: router,
    proxy: proxy
};
