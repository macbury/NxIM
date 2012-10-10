var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var User            = require("../user").User;
var User            = require("../mongo_configuration").User;

exports.commands = {

  "session.auth": function(transport, payload) {
    logger.info("Hello from authenticate function");

    if (transport.isAuthorized()) {
      logger.info("User already authorized this transport!");
      transport.sendError(ERROR.ALREADY_AUTHORIZED, "You cannot twice login on this same connection!");
    } else {
      if (payload["login"] && payload["password"]) {
        User.authenticate(payload['login'], payload['password'], function(user){
          logger.info("Waiting for authentication");
        });
      } else {
        logger.info("Invalid payload for authentication!");
        transport.sendError(ERROR.INVALID_PAYLOAD, "You must pass login and password!");
      }
    }
  }

}