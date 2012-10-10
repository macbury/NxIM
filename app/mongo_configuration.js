var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({ login: '', password_salt: '' });
var UserModel  = db.model('User', UserSchema);

function DatabaseHelper(config) {
  this.db = mongoose.createConnection(config.uri, {});
}

exports.User = UserModel;
exports.DatabseHelper = DatabseHelper;
