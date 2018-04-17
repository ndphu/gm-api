const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ActorSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  key: String,
  title: String
});

ActorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Movie', ActorSchema, 'actors');