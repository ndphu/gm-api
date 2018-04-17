var db = require('../db/DB');
var Episode = require('../models/Episode');
var fs = require('fs');


const list = JSON.parse(fs.readFileSync('list.json'));

Episode.find({serieId: '5ac9d925a88fb51edc1a69e6'}, function (err, episodes) {
  var promises = [];
  episodes.forEach(function (ep) {
    console.log(ep.id);
    for (var i = 0; i < list.length; ++i) {
      if (ep.id === list[i].id) {
        //console.log('Set videoSource to ' + list[i].src);
        ep.videoSource = list[i].src;
        promises.push(new Promise(function (r) {
          ep.save().then(function () {
            r(ep);
          });
        }));
        break;
      }
    }
  });
  Promise.all(promises).then(function (eps) {
    console.log(eps);
    console.log('OK');
    db.close();
  })
});





