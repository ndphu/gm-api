const db = require('../db/DB');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Event = require('../models/Event');
const feignjs = require('feignjs');
const RequestClient = require('../client/feing-node-custom');

const requestClientDesc = {
  sendRequest: {
    method: 'POST',
    uri: '/api/request',
    headers: {
      'Content-Type': 'application/json',
    }
  }
};

const requestClient = feignjs.builder()
  .client(new RequestClient({
    defaults: {}
  }))
  .target(requestClientDesc, 'https://gmv2-api.cfapps.io');

const MovieSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  source: String,
  poster: String,
  title: String
});

MovieSchema.plugin(mongoosePaginate);

Movie = mongoose.model('Movie', MovieSchema, 'movies');

db.once('open', () => {
  Movie.paginate({}, {
    select: 'title poster source',
    limit: 4000,
  }, (err, movies) => {
    const list = movies.docs.slice();
    
    function postRequest(items) {
      console.log(items.length);
      const item = items.pop();
      console.log(item.source);
      console.log(item.poster);
      console.log(item.title);
      const postObject = {
        url: Buffer.from(item.source).toString('base64'),
        poster: Buffer.from(item.poster).toString('base64'),
      };
      console.log(JSON.stringify(postObject));
      requestClient.sendRequest(JSON.stringify(postObject)).then(() => {
          if (items.length > 0) {
            postRequest(items);
          }
        }
      ).catch(err => {
        new Event({
          type: 'MIGRATE_ERROR',
          data: {
            itemId: item._id,
            err: err
          }
        }).save().then((event) => {
          console.log(`saved event ${JSON.stringify(event)}`);
          if (items.length > 0) {
            postRequest(items);
          }
        });
      });
      
    }
    
    postRequest(list)
  });
});



