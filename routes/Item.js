const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Episode = require('../models/Episode');
const crawService = require('../services/CrawService');

router.get('/:id', function (req, res, next) {
  Item.findById(req.params.id, function (err, item) {
    if (err) {
      console.log(err);
      res.status(500);
      res.json({err: err});
    } else if (item) {
      res.json(item);
    } else {
      res.status(404);
    }
  })
});

router.get('/:id/episodes', function (req, res, next) {
  Episode.paginate({
    itemId: req.params.id
  }, {
    limit: 1000,
    sort: {order: 1}
  }, function (err, episodes) {
    if (err) {
      console.log(err);
      res.status(500);
      res.json({'err': err});
    } else if (episodes) {
      res.json(episodes.docs);
    } else {
      res.status(404);
    }
  })
});

router.get('/:id/reload', (req, res) => {
  Item.findById(req.params.id, function (err, item) {
    if (err) {
      console.log(err);
      res.status(500);
      res.send({err: err});
    } else if (!item) {
      res.status(404);
    } else {
      reloadItem(item).then((updated) => {
        res.send(updated);
      });
    }
  });
});

router.get('/:id/reloadEpisodeList', (req, res) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) {
      res.status(500);
      res.send({err: err});
    } else {
      crawService.crawSerie(item).then((episodes) => {
        res.json(episodes);
      }).catch(err => {
        res.status(500);
        res.send({err: err});
      })
    }
  });
  
});

reloadItem = (item) => {
  return new Promise((resolve, reject) => {
    console.log('reload request for item ' + item._id);
    if (item.type === 'MOVIE') {
      console.log('remove all episodes linked to this movie');
      Episode.remove({itemId: item._id}, (err) => {
        if (err) {
          reject(err);
        } else {
          crawService.crawUrl(item.playUrl).then(crawResult => {
            new Episode({
              title: item.title,
              subTitle: item.subTitle,
              order: 0,
              videoSource: crawResult.result,
              crawUrl: item.playUrl,
              itemId: item._id,
            }).save().then(() => {
              resolve(item)
            }).catch((err) => reject(err));
          }).catch(() => reject());
        }
      })
    } else if (item.type === 'SERIE') {
      crawService.crawSerie(item).then(() => {
        resolve(item);
      }).catch((err) => reject(err));
    }
  });
};

module.exports = router;
