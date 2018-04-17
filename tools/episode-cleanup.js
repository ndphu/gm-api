var db = require('../db/DB');
//var Category = require('../models/Category');
var Episode = require('../models/Episode');
var fs = require('fs');


Episode.find({serieId: '5ac9d925a88fb51edc1a69e6'}, function (err, episodes) {
  if (err) {
    console.log(err);
    return;
  }
  // episodes.forEach(function (category) {
  //   category.key = category.key.toLowerCase().replace(/ /g, '-');
  //   category.save();
  // });
  
  const list = JSON.parse(fs.readFileSync('list.json'));
  
  
  //const list = [];
  //const obj = {}
  
  Promise.all([new Promise(function (resolve, reject) {
    var promises = [];
    episodes.forEach(function (episode) {
      console.log(episode.title);
      // episode.videoSource = '';
      // promises.push(new Promise(function (_rs, _rj) {
      //   episode.save().then(_rs)
      // }));
      list.push({id: episode.id, src: episode._doc.videoSource})
    });
    Promise.all(promises).then(resolve);
  })]).then(function () {
      console.log('Done');
      //console.log(list);
    //fs.writeFileSync('list.json', JSON.stringify(list));
      db.close(true);
    }
  );
  
  //db.close(true);
});


