var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;

exports.commands = {
  "thread.create": function(transport, payload) {
    var payload = new Payload(payload, {
      title: String,
      users: Array,
      body: String
    });

    if (transport.isAuthorized()) {
      if (payload.valid()) {
        
      } else {
        payload.sendValidationError(transport, "thread.create");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in to create thread!");
    }
  }
}