var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;
var Presence        = require("../db").UserPresence;

exports.commands = {

  "presence.set": function(transport, payload) {
    var payload = new Payload(payload, { presence: String });
    var _this   = this;
    if (transport.isAuthorized()) {
      if (payload.valid()) {
        transport.user.setPresence(payload.get('presence'));
        this.broadcastPresence(transport.user);
      } else {
        payload.sendValidationError(transport, "presence.set");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in to change presence!");
    }
  }

}