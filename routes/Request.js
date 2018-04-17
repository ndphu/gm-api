const express = require('express');
const cheerio = require('cheerio');
const VungTV = require('../client/VungTv');
const router = express.Router();
const Item = require('../models/Item');
const crypto = require('crypto');
const crawService = require('../services/CrawService');
const moment = require('moment');

router.post('', function (req, res, next) {
  const url = Buffer.from(req.body.url, 'base64').toString('utf-8');
  const poster = Buffer.from(req.body.poster, 'base64').toString('utf-8');
  const hash = crypto.createHash('md5').update(url).digest("hex");

  Item.findOne({hash: hash}, function(err, item){
    if (err) {
      console.log(err);
      res.status(500);
      res.send({err: err});
    } else if (item) {
      console.log('item already in db');
      res.status(200);
      res.send(item);
    } else {
      let itemPath = url.split('vung.tv')[1];
      VungTV.getItem(itemPath).then(function (result) {
        const $ = cheerio.load(result);
        const title = $('.title-film-detail-1').text().trim();
        const subTitle = $('.title-film-detail-2').text().trim();
        const anchor = $('.group-detail a.big-img-film-detail');
        const link = anchor.attr('href');
        const bigPoster = anchor.attr('style').split(/[()]/)[1].replaceAll("'", '');
        let releaseDate;
        let duration;
        let type = 'MOVIE';
        const directors = [];
        const actors = [];
        const genres = [];
        const countries = [];

        $('ul.infomation-film li').each(function (i, element) {
          const text = $(this).text().split(':')[0].trim();
          switch (text) {
            case 'Ngày phát hành':
              const chunks = $(this).find('span').text().split('/');
              releaseDate = moment(chunks[2] + '-' + chunks[1] + '-' + chunks[0]);
              break;
            case 'Thời lượng':
              duration = $(this).find('span').text().split(' ')[0] * 60;
              break;
            case 'Đạo diễn':
              $(this).find('span').text().split(',').forEach(function (value) {
                directors.push(value.trim());
              });
              break;
            case 'Diễn viên':
              $(this).find('a').each(function (i, anchor) {
                actors.push($(anchor).text());
              });
              break;
            case 'Thể loại':
              $(this).find('a').each(function (i, anchor) {
                genres.push($(anchor).text());
              });
              break;
            case 'Quốc gia':
              $(this).find('a').each(function (i, anchor) {
                countries.push($(anchor).text());
              });
              break;
            case 'Số tập':
              type = 'SERIE';
              break;
          }
        });
        new Item({
          title: title ? title : subTitle,
          normTitle: title ? title.latinise() : subTitle.latinise(),
          subTitle: subTitle ? subTitle : title,
          normSubTitle: subTitle ? subTitle.latinise() : title.latinise(),
          poster: poster,
          bigPoster: bigPoster,
          source: url,
          hash: hash,
          playUrl: link,
          type: type,
          releaseDate: releaseDate,
          duration: duration,
          directors: directors,
          genres: genres,
          actors: actors,
          countries: countries,
          content: $('.content-film').text()
        }).save().then(function (item) {
          if (type === 'SERIE') {
            Promise.all([new Promise((resolve, reject) => {
              crawService.crawSerie(item).then(resolve).catch(reject);
            })]).then(()=>{res.send(item)}).catch((err) => {
              res.status(500);
              res.send({err:err});
            });
          } else {
            res.send(item);
          }
        }).catch(function (reason) {
          console.log(reason);
          res.status(500);
          res.send({err: reason});
        });


      }).catch((reason) => {
        console.log(reason);
        res.status(500);
        res.send({err: reason})
      });
    }
  });
});




module.exports = router;