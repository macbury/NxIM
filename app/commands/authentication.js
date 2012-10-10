var logger = require("nlogger").logger(module);

exports.commands = {

  authenticate: function(transport, payload) {
    logger.info("Hello from authenticate function");
  }

}