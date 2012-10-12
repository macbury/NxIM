var logger    = require("nlogger").logger(module);
var Sequelize = require("sequelize");
var crypto    = require('crypto');

function DatabaseHelper(config) {
  logger.info("Connecting to db: ",JSON.stringify(config));
  this.db = new Sequelize(config.name, config.user, config.password, {
    host: config.host,
    port: 3306,
    protocol: null,
    logging: logger.info,
    maxConcurrentQueries: 100,
    dialect: 'mysql',
    define: { timestamps: true },
    sync: { force: true },
    pool: { maxConnections: 5, maxIdleTime: 30}
  });

  logger.info("Appending schema");
  this.User = this.buildUserModel();
  this.User.sync();
}

DatabaseHelper.prototype.buildUserModel = function() {
  var User = this.db.define('User', {
    login: { type: Sequelize.STRING, allowNull: false, unique: true  },
    hash:  { type: Sequelize.STRING, allowNull: false }
  }, {
    timestamps: true,
    classMethods: {
      authenticate: function(login, hash, session_token, cb) {
        User.find({ where: {login: login} }).success(function(user){
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
      },

      register: function(payload, token, cb) {
        var password = payload.get('password');
        var hash     = crypto.createHash('sha512').update(password);
        User.create({ login: payload.get('login'), hash: hash }).success(function(user){
          cb(user);
        }).error(function(error){
          logger.error("Could not save user: ", error);
          cb(false);
        });
      },

      valid: function(payload, token, cb) {
        var errors = [];

        if (payload.get('login') == null || payload.get('login').length <= 3) {
          errors.push("Password is to short!");
        }
        if (payload.get('password') == null || payload.get('password').length <= 5) {
          errors.push("Password is to short!");
        }
        if (payload.get('password') != payload.get('password_confirmation')) {
          errors.push("Password confirmation don't match");
        }
        if (payload.get('token') != token) {
          errors.push("Token is invalid!");
        }

        User.count({ where: ["login = ?", payload.get('login')] }).success(function(count){
          if (count == 1) {
            errors.push("Login already taken");
          }
          cb(errors);
        });
      },
    }
  });

  return User;
}

exports.DatabaseHelper = DatabaseHelper;
