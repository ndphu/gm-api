const express = require('express');
const router = express.Router();
const Actor = require('../models/Actor');
const Item = require('../models/Item');
const vungTvClient = require('../client/VungTv');
const cheerio = require('cheerio');
const cookieService = require('../services/CookieService');
const crypto = require('crypto');

router.get('/q/:query', function (req, res, next) {
  const query = req.params.query;
  console.log(`perform search for query '${query}'`);
  let queryRegex = new RegExp('.*' + query + '.*', 'i');
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.size ? parseInt(req.query.size) : 32;
  
  const promises = [];
  
  promises.push(new Promise(function (resolve, reject) {
    Actor.paginate({
      title: new RegExp('.*' + query + '.*', 'i')
    }, {
      sort: {title: 1},
      page: page,
      limit: limit
    }, function (err, resp) {
      if (err) {
        reject(err)
      } else {
        resolve({actor: resp});
      }
    });
  }));
  
  promises.push(new Promise(function (resolve, reject) {
    Item.paginate({
      $or: [
        {title: queryRegex},
        {normTitle: queryRegex},
        {subTitle: queryRegex},
        {normSubTitle: queryRegex}
      ],
      type: 'MOVIE',
    }, {
      select: 'id title subTitle poster genres actors',
      sort: {createdAt: -1},
      page: page,
      limit: limit
    }, function (err, resp) {
      if (err) {
        reject(err);
      } else {
        resolve({movie: resp});
      }
    });
  }));
  
  promises.push(new Promise(function (resolve, reject) {
    Item.paginate({
      $or: [
        {title: queryRegex},
        {normTitle: queryRegex},
        {subTitle: queryRegex},
        {normSubTitle: queryRegex}],
      type: 'SERIE',
    }, {
      select: 'id title subTitle poster genres actors',
      sort: {createdAt: -1},
      page: page,
      limit: limit
    }, function (err, resp) {
      if (err) {
        reject(err)
      } else {
        resolve({serie: resp});
      }
    });
  }));
  
  Promise.all(promises).then(result => {
    res.json(Object.assign(...result));
  }).catch(err => {
    res.status(500);
    res.send({err: err});
  });
});


router.get('/remote/q/:query', function (req, res, next) {
  const query = req.params.query;
  const postData = 'status=search_page&q=' + query;
  console.log(cookieService.getCookieHeader());
  console.log(postData);
  
  vungTvClient.search(postData).then((result) => {
    const items = [];
    const $ = cheerio.load(JSON.parse(result).data_html);
    $('.film-small').each(function () {
      const a = $(this);
      items.push({
        title: a.find('.title-film-small .title-film').text(),
        subTitle: a.find('.title-film-small p').text(),
        poster: a.find('.poster-film-small').attr('style').split(/[()]/)[1],
        link: a.attr('href')
      })
    });
    
    const promises = items.map(item => new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5').update(item.link).digest('hex');
      Item.find({hash: hash}, function (err, items) {
        if (err) {
          reject(err);
        } else {
          resolve({
            title: item.title,
            subTitle: item.subTitle,
            poster: item.poster,
            link: item.link,
            itemId: items.length > 0 ? items[0]._id : null,
          })
        }
      })
    }));
    Promise.all(promises).then(items => res.send(items));
  }).catch((reason) => {
    console.log(reason);
    res.status(500);
    res.send({
      query: query,
      err: reason
    })
  })
});

module.exports = router;
