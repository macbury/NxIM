var logger    = require("nlogger").logger(module);
var Sequelize = require("sequelize");
var crypto    = require('crypto');

var Presence  = {
  Offline: "offline",
  Online: "online",
  DnD: "dnd",
  Away: "away"
};

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
  this.Invitation     = this.buildInvitation();
  this.Stream         = this.buildStream();
  this.MessageObject  = this.buildMessageObject();
  this.User           = this.buildUserModel(this.Invitation, this.Stream, this.MessageObject);


  this.Invitation.belongsTo(this.User, { as: 'User', foreignKey: "UserId" });
  this.Invitation.belongsTo(this.User, { as: 'Friend', foreignKey: "FriendId" });
  this.User.hasMany(this.Invitation, { foreignKey: "UserId" });

  this.User.hasMany(this.Stream, { as: "OwnedStreams" });
  this.Stream.belongsTo(this.User, { as: "Owner" });
  this.Stream.hasMany(this.User);
  this.Stream.hasMany(this.MessageObject);

  this.MessageObject.belongsTo(this.User, { as: "Author" });
  this.MessageObject.belongsTo(this.Stream);

  this.User.sync();
  this.Invitation.sync();
  this.Stream.sync();
  this.MessageObject.sync();
  logger.info("Appended data!");
}

DatabaseHelper.prototype.buildMessageObject = function() {
  var MessageObject = this.db.define("MessageObject", {
    content: { type: Sequelize.TEXT },
    url: { type: Sequelize.STRING }
  }, { 
    timestamps: true
    instanceMethods: {

    }
  });

  return MessageObject;
}

DatabaseHelper.prototype.buildStream = function() {
  var Stream = this.db.define("Stream", {
    name: { type: Sequelize.STRING, allowNull: false }
  }, { 
    timestamps: true,
    instanceMethods: function() {

    }
  });

  return Stream;
}

DatabaseHelper.prototype.buildInvitation = function() {
  var Invitation = this.db.define('Invitation', {
    message: { type: Sequelize.STRING, allowNull: false },
  }, { timestamps: true });

  return Invitation;
}

DatabaseHelper.prototype.buildUserModel = function(Invitation, Stream, MessageObject) {
  var db = this.db;
  var User = this.db.define('User', {
    login: { type: Sequelize.STRING, allowNull: false, unique: true  },
    hash:  { type: Sequelize.STRING, allowNull: false },
    presence: { type: Sequelize.STRING, allowNull: false, defaultValue: Presence.Offline },
  }, {
    timestamps: true,

    instanceMethods: {

      createStream: function(users, title, body, cb) {
        var _this = this;
        User.findAll({where: ["Users.login IN (?) and Users.id != ?", users, _this.id]}).success(function(users){
          if (users.length == 0) {
            cb(false, false);
          }

          Stream.create({
            name: title
          }).success(function(stream) {
            users.push(_this);
            stream.setUsers(users);

            MessageObject.create({
              UserId: _this.id,
              StreamId: stream.id,
              content: body
            }).success(function() {
              cb(stream, users);  
            });
            
          });
        });
      },

      getPendingInvitations: function(cb) {
        var sql = "SELECT Users.login, Users.presence, Invitations.message FROM `Users` INNER JOIN `Invitations` on `Invitations`.`FriendId` = `Users`.`id`  WHERE `Invitations`.`UserId`="+this.id+";";
        db.query(sql, null, {raw: true}).on('success', cb);
      },

      accept: function(login, cb) {
        var _this = this;

        User.find({ where: { login: login } }).success(function(user_to_accept) {
          if (user_to_accept) {
            Invitation.find({ where: { UserId: _this.id, FriendId: user_to_accept.id } }).success(function( invitation ){

              if (invitation) {
                invitation.destroy().success(function() {
                  _this.addContact(user_to_accept).success(function() {
                    user_to_accept.addContact(_this).success(function(){
                      cb(user_to_accept);  
                    });  
                  });                  
                });
              } else {
                cb(false);
              }

            });
          } else {
            cb(false);
          }
        });
      },

      invite: function(login, message, cb) {
        var _this = this;
        User.find({ where: {login: login} }).success(function(user_to_invite){

          if (user_to_invite == null || _this.id == user_to_invite.id) {
            cb(false);
            return;
          };

          _this.hasContact(user_to_invite).success(function(result) {
            if (result) {
              cb(false, false);
            } else {
              Invitation.find({ where: { UserId: user_to_invite.id, FriendId: _this.id } }).success(function( invitation ){
                if (invitation == undefined) {
                  invitation = Invitation.build({ 
                    message: message,
                    UserId: user_to_invite.id,
                    FriendId: _this.id
                  });
                } else {
                  invitation.message = message;
                }

                invitation.save().success(function() {
                  cb(user_to_invite, invitation); 
                });
              });
            }
          }).error;
        });
      },

      setPresence: function(new_presence) {
        if (new_presence == Presence.Online || new_presence == Presence.Offline || new_presence == Presence.Away || new_presence == Presence.DnD) {
          this.presence = new_presence;
          this.save();
          logger.info("Setting presence for user "+this.id + " to "+this.presence);
        }
      },

      toCard: function() {
        return {
          login: this.login,
          presence: this.presence
        };
      },

      vCard: function(login, cb) {
        var _this = this;
        User.find({ where: {login: login} }).success(function(user){
          if (user && user.id == _this.id) {
            cb(user.toCard());
          } else {
            cb(false);
          }
        });
      }
    },

    classMethods: {
      authenticate: function(login, hash, session_token, cb) {
        User.find({ where: {login: login} }).success(function(user){
          if(user) {
            var password_hash = crypto.createHash('sha512').update(user.hash+session_token).digest('hex').toString();
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
        var hash     = crypto.createHash('sha512').update(password).digest('hex').toString();
        User.create({ login: payload.get('login'), hash: hash }).success(function(user){
          cb(user);
        }).error(function(error){
          logger.error("Could not save user: ", error);
          cb(false);
        });
      },

      valid: function(payload, token, cb) {
        var errors = [];
        var login = payload.get('login');
        if (payload.get('login') == null || payload.get('login').length <= 3) {
          errors.push("Login is to short!");
          login = ' ';
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
        
        var regexp       = /([^a-z0-9])/i;
        var regexp_match = login.match(regexp);
        if (regexp_match != null) {
          errors.push("Invalid format, you cannot use non letter and number characters");
        }

        User.count({ where: ["login = ?", login] }).success(function(count){
          if (count == 1) {
            errors.push("Login already taken");
          }
          cb(errors);
        });
      },
    }
  });
  
  User.hasMany(User, { as: "Contacts" });
  return User;
}

exports.UserPresence   = Presence;
exports.DatabaseHelper = DatabaseHelper;
