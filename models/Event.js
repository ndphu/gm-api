const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const EventSchema = new mongoose.Schema({
  id: String,
  type: String,
  data: Object,
  createdAt: { type: Date, default: Date.now }
});

EventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Event', EventSchema, 'events');