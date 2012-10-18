var logger          = require("nlogger").logger(module);
var ERROR           = require("../error_code");
var Payload         = require("../payload").Payload;

exports.commands = {
  "stream.create": function(transport, payload) {
    var payload = new Payload(payload, {
      title: String,
      users: Array,
      body: String
    });

    if (transport.isAuthorized()) {
      if (payload.valid()) {
        transport.user.createStream(payload.get('users'), payload.get('title'), payload.get('body'), function(stream, users){
          if (stream) {
            stream.toJSON(function(json) {
              for (var i = 0; i < users.length; i++) {
                _this.sendActionTo("stream.init", {  }, users[i]);
              }
            });
          } else {

          }
          
        });
      } else {
        payload.sendValidationError(transport, "stream.create");
      }
    } else {
      transport.sendError(ERROR.UNAUTHORIZED_ERROR, "You must be logged in to create stream!");
    }
  }
}