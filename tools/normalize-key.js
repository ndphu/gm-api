var db = require('../db/DB');
var Category = require('../models/Category');


Category.find({}, function (err,categories) {
  if (err) {
    console.log(err);
    return;
  }
  categories.forEach(function (category) {
    category.key = category.key.toLowerCase().replace(/ /g,'-');
    category.save();
  });

  //db.close(true);
});


