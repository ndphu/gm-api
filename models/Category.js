var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var CategorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  key: String,
  title: String
});

CategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', CategorySchema, 'categories');