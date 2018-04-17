const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const crawService = require('../services/CrawService');

router.get('/:id', (req, res, next) => {
  Episode.findById(req.params.id, function (err, track) {
    if (err) return next(err);
    res.json(track);
  })
});


router.get('/:id/reload', (req, res, next) => {
  Episode.findById(req.params.id, (err, episode) => {
    if (err) {
      console.log(err);
      next(err);
    } else if (episode) {
      crawService.crawUrl(episode.crawUrl).then(crawResult => {
        episode.videoSource = crawResult.result;
        episode.save().then(() => {
          res.send(episode);
        }).catch((err) => {
          console.log(err);
          next(err)
        });
      }).catch((err) => {
        console.log(err);
        next(err);
      });
    } else {
      res.send(404);
    }
  })
});

module.exports = router;
