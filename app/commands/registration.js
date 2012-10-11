var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Canvas          = require("canvas");

var CAPTCHA         = {
  Width: 200,
  Height: 50
}

exports.commands = {
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
  }
}