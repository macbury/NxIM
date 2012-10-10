var mongoose = require('mongoose');
var logger   = require("nlogger").logger(module);
var UserSchema = mongoose.Schema({ login: String, password: String });

UserSchema.statics.authenticate = function (login, hash, cb) {
  this.findOne({ login: login }, function(err, user) {
    if(user && user.password == hash) {
      cb(user);
    } else {
      cb(false);
    }
  });
}

function DatabaseHelper(config) {
  logger.info("Connecting to db: "+config.url);
  this.db      = mongoose.createConnection(config.url, {});

  logger.info("Appending schema");
  exports.User = this.db.model('User', UserSchema);
}

exports.DatabaseHelper = DatabaseHelper;
