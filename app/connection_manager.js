var SocketTransport = require("./socket_transport").klass;

function ConnectionManager() {

}

ConnectionManager.prototype = {
  socketIO:    null,
  connections: [],

  bindSocketIO: function(io) {
    console.log("Binding socket io");
    this.socketIO = io;
    context = this;
    this.socketIO.sockets.on('connection', function (socket) {
      connection = new SocketTransport(context, socket);
      connection._disconnectCallback = function(transportConnection) {
        var index = context.connections.indexOf(transportConnection);
        if (index > 0)
          delete context.connections[index];
      }
      context.connections.push(connection);
    });
  },
}

exports.klass = ConnectionManager;
