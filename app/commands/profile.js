var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;
var Presence        = require("../db").UserPresence;

exports.commands = {

  "profile.get": function(transport, payload) {
    var payload = new Payload(payload, { login: String });
    var _this   = this;
    if (transport.isAuthorized()) {
      if (payload.valid()) {
        transport.user.vCard(payload.get('login'), function(vCard){
          transport.sendAction("profile.info", { info: vCard, "for": payload.get('login') });  
        });
        
      } else {
        payload.sendValidationError(transport, "profile.get");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in to view user info");
    }
  }

}