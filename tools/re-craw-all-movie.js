var db = require('../db/DB');
var Movie = require('../models/Movie');
var http = require('http');
var count = 0;
Movie.paginate({}, {
  limit: 9999,
  page: 1
}, function (err, movies) {
  var arr = [];
  movies.docs.forEach(function (movie) {
    arr.push({
      id: movie._id,
      input: movie.playUrl
    });
  });

  function extracted(_m) {
    console.log(++count);
    const requestBody = JSON.stringify([_m]);
    console.log(requestBody);
    const options = {
      host: '19november.freeddns.org',
      port: 1433,
      path: '/api/craw',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestBody.length
      }
    };
    const crawRequest = http.request(options, function (_res) {
      var responseAll = '';
      _res.on('data', function (data) {
        responseAll += data;
      });
      _res.on('end', function () {
        JSON.parse(responseAll).forEach(function (result) {
          Movie.findById(result.id, function (err, m) {
            m.videoSource = result.result;
            m.save().then(function () {
              if (arr.length > 0) {
                extracted(arr.pop());
              }
            })
          })
        });
      })
    });
    crawRequest.on('error', function (e) {
      console.error(e);
    });
    crawRequest.write(requestBody);
    crawRequest.end();
  }

  extracted(arr.pop());
});




