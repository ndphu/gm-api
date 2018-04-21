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
  .target(crawClientDescription, 'http://19november.freeddns.org:11371');
  //.target(crawClientDescription, 'http://localhost:8080');

module.exports = crawClient;