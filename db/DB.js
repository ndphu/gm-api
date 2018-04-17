const mongoose = require('mongoose');
const cfenv = require('cfenv');


mongoose.Promise = global.Promise;

const appEnv = cfenv.getAppEnv();
if (appEnv.isLocal) {
  mongoose.connect('mongodb://27.74.147.126:5050/gm');
} else {
  mongoose.connect(appEnv.services.mlab[0].credentials.uri);
}

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('connected!');
});

module.exports = db;