var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;
var Canvas          = require("canvas");

var CAPTCHA = {
  Width: 200,
  Height: 50
}

exports.commands = {

  //generating token and image for creating account
  "account.init": function(transport, payload) {
    if (transport.isAuthorized()) {
      logger.info("User already authorized this transport!");
      transport.sendError(ERROR.ALREADY_AUTHORIZED, "You cannot register while logged in!");
    } else {
      var canvas = new Canvas(CAPTCHA.Width, CAPTCHA.Height);
      var ctx    = canvas.getContext("2d");

      ctx.antialias = 'gray';
      ctx.fillStyle = "#efe";
      ctx.fillRect(0, 0, CAPTCHA.Width, CAPTCHA.Height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#080";
      ctx.textAlign = "center";
      ctx.font = "bold 22px purisa";

      var text = ('' + Math.random()).substr(3, 6);
      transport.session["token"] = text;
      logger.info("Token is:", text);

      ctx.strokeText(text, CAPTCHA.Width / 2 - 2, CAPTCHA.Height / 2 - 2 + 10);

      canvas.toDataURL('image/png', function(err, str){
        transport.sendAction("account.token", { image: str });
      });
    }
  }, 

  // creating account, required payload: { login: String, password: String, token: String }
  "account.create": function(transport, payload) {
    var payload = new Payload(payload, { login: String, password: String, password_confirmation: String, token: String });

    if (transport.isAuthorized()) {
      logger.info("User already authorized this transport!");
      transport.sendError(ERROR.ALREADY_AUTHORIZED, "You cannot register while logged in!");
    } else {
      if (payload.valid()) {
        var _this = this;
        this.dbHelper.User.valid(payload, transport.session["token"], function(errors){
          if (errors.length == 0) {
            _this.dbHelper.User.register(payload, transport.session["token"], function(user) {
              if (user) {
                transport.sendAction("account.ready", {});
              } else {
                transport.sendError(ERROR.INTERNAL_SEVER_ERROR, "Could not save new user");
              }
            });
          } else {
            transport.sendAction("account.validation", { code: ERROR.VALIDATION_ERROR, problems: errors });
          }
        });
      } else {
        logger.info("Invalid payload for registration!");
        payload.sendValidationError(transport, "account.create");
      }
    }
  }
}