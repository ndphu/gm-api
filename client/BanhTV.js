const feignjs = require('feignjs');
const RequestClient = require('./feing-node-custom');

const desc = {
  search: {
    method: 'GET',
    uri: '/tim-kiem.html?q={query}',
    headers: {
    }
  },
  getItem: {
    method: 'GET',
    uri: '{path}',
    headers: {
    }
  },
  authorize: {
    method: 'POST',
    uri: '/',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  }
};

const banhTVClient = feignjs.builder()
  .client(new RequestClient({
    defaults: {
      headers: {
        Origin: 'http://banhtv.com/',
        Referer: 'http://banhtv.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
      }
    }
  }))
  .target(desc, 'http://banhtv.com');

module.exports = banhTVClient;