const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Item = require('../models/Item');

router.get('/:id', function (req, res, next) {
  Category.findById(req.params.id, function (err, genre) {
    if (err) return next(err);
    res.json(genre);
  })
});

router.get('/:id/items', function (req, res, next) {
  Category.findById(req.params.id, (err, genre) => {
    if (err) return next(err);
    Item.paginate({
      genres: genre.title,
    }, {
      select: 'id title subTitle genres actors poster',
      sort: {createdAt: -1},
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.size ? parseInt(req.query.size) : 32
    }, function (err, items) {
      if (err) return next(err);
      res.json({
        genre: genre,
        items: items
      });
    })
  });
});

router.get('/', function (req, res, next) {
  Category.paginate({}, {
      sort: {title: 1},
      page: 1,
      limit: 1000
  }, (err, genres) => {
    if (err) return next(err);
    res.json(genres);
  })
});

module.exports = router;
