const express = require('express');
const router = express.Router();
const http = require('http');
const cookieService = require('../services/CookieService');

router.get('/authorize', (req, res) => {
  let formData = 'is_vn=1&is_capital=3&is_hymn=3';
  const options = {
    host: 'vung.tv',
    port: 80,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': formData.length
    }
  };
  const authorizeRequest = http.request(options, function (_res) {
    let resp = '';
    _res.on('data', function (data) {
      resp += data;
    });
    
    _res.on('end', function (data) {
      resp += data;
      console.log(_res.headers);
      cookieService.setCookies(_res.headers['set-cookie']);
      res.send(_res.headers);
    });
  });
  authorizeRequest.on('error', function (e) {
    console.error(e);
    res.status(500);
    res.send({err: e});
  });
  authorizeRequest.write(formData);
  authorizeRequest.end();
});

router.post('/serverCookie', (req, res) => {
  cookieService.setCookieHeader(req.body.serverCookie);
  res.send({
    serverCookie: cookieService.getCookieHeader(),
  })
});

module.exports = router;