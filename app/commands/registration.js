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
      ctx.fillStyle = "rgb(255,200,150)";
      ctx.fillRect(0, 0, CAPTCHA.Width, 150);
      ctx.fillStyle = "rgb(0,100,100)";
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgb(0,100,100)";
      ctx.font = '10px sans';
      for (var i = 0; i < 2; i++) {
        ctx.moveTo(20, Math.random() * CAPTCHA.Width);
        ctx.bezierCurveTo(80, Math.random() * CAPTCHA.Height, 160, Math.random() * CAPTCHA.Height, CAPTCHA.Width, Math.random() * CAPTCHA.Height);
        ctx.stroke();
      }

      var text = ('' + Math.random()).substr(3, 6);
      transport.session["token"] = text;
      logger.info("Token is:", text);

      for (i = 0; i < text.length; i++) {
        ctx.setTransform(Math.random() * 0.5 + 1, Math.random() * 0.4, Math.random() * 0.4, Math.random() * 0.5 + 1, 30 * i + 20, 100);
        ctx.fillText(text.charAt(i), 0, 0);
      }

      canvas.toDataURL('image/png', function(err, str){
        transport.sendAction("account.token", { image: str });
      });
    }
  }
}