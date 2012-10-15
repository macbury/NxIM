var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;
var Presence        = require("../db").UserPresence;

exports.commands = {

  "roster.all": function(transport, payload) {
    var payload = new Payload(payload, {});
    var _this   = this;
    if (transport.isAuthorized()) {
      if (payload.valid()) {
        transport.sendAction("roster.all", { user: transport.user.toCard(), contacts: {} });  
        
      } else {
        payload.sendValidationError(transport, "roster.all");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in fetch user roster");
    }
  }

}