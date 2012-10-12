var logger    = require("nlogger").logger(module);
var Sequelize = require("sequelize");
var crypto    = require('crypto');

function DatabaseHelper(config) {
  logger.info("Connecting to db: ",JSON.stringify(config));
  this.db = new Sequelize(config.name, config.user, config.password, {
    host: config.host,
    port: 3306,
    protocol: null,
    logging: true,
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
    login: { type: Sequelize.STRING, allowNull: false },
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
      }
    }
  });

  return User;
}

exports.DatabaseHelper = DatabaseHelper;