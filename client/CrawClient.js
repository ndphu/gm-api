const feignjs = require('feignjs');
const RequestClient = require('./feing-node-custom');

const crawClientDescription = {
  craw: {
    method: 'POST',
    uri: '/api/craw',
    headers: {
      'Content-Type': 'application/json',
    }
  }
};

const crawClient = feignjs.builder()
  .client(new RequestClient({
    defaults: {
    }
  }))
  .target(crawClientDescription, 'http://27.74.147.126:1723');

module.exports = crawClient;