var socketIO        = require('socket.io');
var logger          = require('nlogger').logger(module);
function bootWebsocket(httpServer) {
  logger.info("Starting socket.io server now");
  io = socketIO.listen(httpServer);
  io.configure('development', function(){
    io.set('level', 2);
    io.set("logger", logger);
  });

  return io;
}

exports.bootWebsocket = bootWebsocket;
