const express = require('express');
const router = express.Router();
const Actor = require('../models/Actor');
const Item = require('../models/Item');

router.get('/:id', function (req, res, next) {
  Movie.findById(req.params.id, function (err, track) {
    if (err) return next(err);
    res.json(track);
  })
});

router.get('/byKey/:actorKey', function (req, res, next) {
  Movie.find({
    key: req.params.actorKey
  }, function (err, resp) {
    if (err) return next(err);
    res.json(resp[0]);
  });
});

router.get('/:id/items', function (req, res, next) {
  Movie.findById(req.params.id, function (err, actor) {
    if (err) return next(err);
    Item.paginate({
      actors: actor.title
    }, {
      select: 'id title subTitle genres actors poster',
      sort: {createdAt: -1},
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.size ? parseInt(req.query.size) : 32
    }, function (err, movies) {
      res.json({
        actor: actor,
        items: movies
      });
    });
  })
});

module.exports = router;
