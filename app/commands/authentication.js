var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var User            = require("../user").User;
var User            = require("../mongo_configuration").User;

exports.commands = {

  "session.create": function(transport, payload) {
    if (transport.isAuthorized()) {
      logger.info("User already authorized this transport!");
      transport.sendError(ERROR.ALREADY_AUTHORIZED, "You cannot twice login on this same connection!");
    } else {
      if (payload["login"] != null && payload["password"] != null) {
        this.dbHelper.User.authenticate(payload['login'], payload['password'], transport.token, function(user){
          logger.info("Waiting for authentication");
          transport.sendAction("session.invalid", { error: "Invalid password or login", code: ERROR.INVALID_PASSWORD_OR_LOGIN });
        });
      } else {
        logger.info("Invalid payload for authentication!");
        transport.sendError(ERROR.INVALID_PAYLOAD, "You must pass login and password!");
      }
    }
  }

}