var socketIO = require('socket.io');

function boot(httpServer) {
  console.log("Starting socket.io server now");
  io = socketIO.listen(httpServer);
  io.configure('development', function(){
    io.set('log level', 1);
  });

  return io;
}

exports.boot = boot;