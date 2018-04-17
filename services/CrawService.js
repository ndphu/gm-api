const crawClient = require('../client/CrawClient');
const VungTV = require('../client/VungTv');
const cheerio = require('cheerio');
const Episode = require('../models/Episode');

class CrawService {
  crawEpisode(episode) {
    const postData = JSON.stringify([{
      id: episode._id ? episode._id : '',
      input: episode.crawUrl,
    }]);
    return crawClient.craw(postData);
  }

  crawUrl(url) {
    console.log('craw url ' + url);
    const postData = JSON.stringify([{
      id: new Date().getTime() + '',
      input: url,
    }]);
    return new Promise((resolve, reject) => {
      crawClient.craw(postData).then(result => {
        resolve(JSON.parse(result)[0]);
      }).catch(reject)
    });
  }
  
  crawSerie(item) {
    return new Promise(((resolve, reject) => {
      VungTV.getItem(item.playUrl.split('vung.tv')[1]).then((html) => {
        const $ = cheerio.load(html);
        const promises = [];
        $('.episode-main a').each((i, a) => {
          promises.push(new Promise((resolve, reject) => {
            let episodeLink = $(a).attr('href');
            console.log(`found episode order ${i} with link ${episodeLink}`);
            Episode.find({order: i, itemId: item._id}, (err, episodes) => {
              if (err) {
                reject(err);
              } else {
                if (episodes.length === 0) {
                  new Episode({
                    title: 'Tập ' + (i + 1),
                    subTitle: 'Episode ' + (i + 1),
                    order: i,
                    crawUrl: episodeLink,
                    itemId: item._id + '',
                  }).save().then(episode => resolve(episode)).catch(reject);
                } else {
                  resolve(episodes[0]);
                }
              }
            });
          }));
        });
        Promise.all(promises).then(resolve).catch(reject);
      })
    }));
  }
}


const crawService = new CrawService();
module.exports = crawService;