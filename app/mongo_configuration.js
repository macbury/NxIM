var mongoose = require('mongoose');
var logger   = require("nlogger").logger(module);
var crypto   = require('crypto');

var UserSchema = mongoose.Schema({ login: String, hash: String });

UserSchema.statics.authenticate = function (login, hash, session_token, cb) {
  this.findOne({ login: login }, function(err, user) {
    if(user) {
      var password_hash = crypto.createHash('sha512').update(user.hash+session_token).digest('hex');
      if (password_hash == hash) {
        cb(user);
      } else {
        cb(false);
      }
      
    } else {
      cb(false);
    }
  });
}

function DatabaseHelper(config) {
  logger.info("Connecting to db: "+config.url);
  this.db      = mongoose.createConnection(config.url, {});

  logger.info("Appending schema");
  this.User = this.db.model('User', UserSchema);
}

exports.DatabaseHelper = DatabaseHelper;
