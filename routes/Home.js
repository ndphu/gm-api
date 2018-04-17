const express = require('express');
const Item = require('../models/Item');
const Category = require('../models/Category');
const router = express.Router();
const DEFAULT_FIELDS = 'id title poster genres actors';
const DEFAULT_SECTION_ITEM_COUNT = 7;
const DEFAULT_ORDER = {createdAt: -1};

router.get('/', (req, res) => {
  Category.paginate({}, {
    sort: {key: 1},
    limit: 100
}, function (err, result) {
    const promises = [];

    promises.push(
      getCustomSection({type: 'MOVIE'}, {
        title: 'Phim Lẻ Mới Cập Nhật',
        key: 'latest-movies'
      }));

    promises.push(
      getCustomSection({type: 'SERIE'}, {
        title: 'Phim Bộ Mới Cập Nhật',
        key: 'latest-series'
      })
    );

    result.docs.forEach((section) => {
      promises.push(
        getCustomSection({genres: section.title}, section)
      );
    });

    Promise.all(promises).then((sections) => {
      res.json(sections.filter(s => s.items.length > 0));
    }).catch(errors => {
      console.log(errors);
      res.status(500);
      res.send(errors);
    });
  });
});

function getCustomSection(query, category) {
  return new Promise((resolve, reject) => {
    Item.paginate(query, {
      select: DEFAULT_FIELDS,
      limit: DEFAULT_SECTION_ITEM_COUNT,
      sort: DEFAULT_ORDER,
    }, (err, items) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          category: category,
          items: items.docs,
        });
      }
    });
  });
}

module.exports = router;
