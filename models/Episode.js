const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const EpisodeSchema = new mongoose.Schema({
  id: String,
  title: String,
  subTitle: String,
  order: Number,
  videoSource: String,
  crawUrl: String,
  itemId: String,
});

EpisodeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Episode', EpisodeSchema, 'episodes');