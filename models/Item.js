const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Item = new mongoose.Schema({
  id: String,
  title: String,
  normTitle: String,
  subTitle: String,
  normSubTitle: String,
  poster: String,
  bigPoster: String,
  source: String,
  hash: String,
  playUrl: String,
  type: String,
  content: String,
  releaseDate: Date,
  directors: Array,
  actors: Array,
  genres: Array,
  countries: Array,
  createdAt: { type: Date, default: Date.now }
});

Item.plugin(mongoosePaginate);

module.exports = mongoose.model('Item', Item, 'items');