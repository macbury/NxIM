var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;

exports.commands = {

  "session.create": function(transport, payload) {
    var payload = new Payload(payload, { login: String, password: String });

    if (transport.isAuthorized()) {
      logger.info("User already authorized this transport!");
      transport.sendError(ERROR.ALREADY_AUTHORIZED, "You cannot twice login on this same connection!");
    } else {
      if (payload.valid()) {
        this.dbHelper.User.authenticate(payload.get('login'), payload.get('password'), transport.token, function(user){
          logger.info("Waiting for authentication");
          transport.sendAction("session.invalid", { error: "Invalid password or login", code: ERROR.INVALID_PASSWORD_OR_LOGIN });
        });
      } else {
        logger.info("Invalid payload for authentication!");
        payload.sendValidationError(transport, "session.create");
      }
    }
  }

}