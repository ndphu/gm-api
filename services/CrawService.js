const crawClient = require('../client/CrawClient');
const VungTV = require('../client/VungTv');
const cheerio = require('cheerio');
const Episode = require('../models/Episode');
const url = require('url');
const BanhTV = require('../client/BanhTV');
const mqttService = require('../services/MQTTService');


class CrawService {
  crawEpisode(episode) {
    const postData = JSON.stringify([{
      id: episode._id ? episode._id : '',
      input: episode.crawUrl,
    }]);
    return crawClient.craw(postData);
  }

  crawUrl(crawUrl) {
    console.log('craw url ' + crawUrl);
    const postData = JSON.stringify([{
      id: new Date().getTime() + '',
      input: crawUrl,
    }]);
    return new Promise((resolve, reject) => {
      crawClient.craw(postData).then(result => {
        resolve(JSON.parse(result)[0]);
      }).catch(reject)
    });
  }

  crawUrlMQTT(crawUrl) {
    console.log(`craw url {} using mqtt`, crawUrl);
    const requestId = new Date().getTime();
    const respTopic = `/topic/crawler/response/${requestId}`;
    console.log(`using response topic ${respTopic}`);
    const requestMessage = {
      responseTo: `${requestId}`,
      items: [{
        id: `${requestId}`,
        input: crawUrl,
      }]
    };
    return new Promise((resolve, reject) => {
      mqttService.getClient().subscribe(respTopic);
      console.log(`subscribed to response topic ${respTopic}`);
      mqttService.getClient().on('message', (topic, message) => {
        if (respTopic === topic) {
          console.log(`got response from ${respTopic}`);
          resolve(JSON.parse(message.toString())[0]);
        }
      });
      mqttService.getClient().publish('/topic/crawler/request', JSON.stringify(requestMessage));
    });
  }
  
  crawSerie(item) {
    return new Promise(((resolve, reject) => {
      const parsedUrl = url.parse(item.playUrl);
      if (parsedUrl.hostname === 'vung.tv') {
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
      } else if (parsedUrl.hostname === 'banhtv.com') {
        BanhTV.getItem(item.playUrl.split('banhtv.com')[1]).then(html => {
          const $ = cheerio.load(html);
          const promises = [];
          $('#list_episodes').find('a').each((i, e) => {
            const a = $(e);
            promises.push(new Promise((resolve, reject) => {
              let episodeLink = 'http://banhtv.com' + $(a).attr('href');
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
        }).catch(err => {
          reject(err)
        });
      } else {
        reject({err: 'unsupported ' + parsedUrl.hostname});
      }

    }));
  }
}


const crawService = new CrawService();
module.exports = crawService;