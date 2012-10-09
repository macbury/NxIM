var mongoose = require('mongoose');

function DatabaseHelper(config) {
  this.db = mongoose.createConnection(config.uri, {});
}

exports.DatabseHelper = DatabseHelper
