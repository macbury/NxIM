var SocketTransport = require("./socket_transport").klass;
var UserModule      = require("./user")
var logger          = require('nlogger').logger(module);
function ConnectionManager() {
  logger.info("Creating connection manager");
}

ConnectionManager.prototype = {
  socketIO:    null,
  users: [],

  bindSocketIO: function(io) {
    logger.info("Binding socket io");
    this.socketIO = io;
    context = this;
    this.socketIO.sockets.on('connection', function (socket) {
      connection = new SocketTransport(context, socket);
      connection._disconnectCallback = function(transportConnection) {
        context.onDisconnect(transportConnection);
      }

      context.onConnection(connection);
    });
  },

  onConnection: function(socketTransportConnection) {
    logger.info("Creating guest user for transport");
    user = new UserModule.User();
    user.pushTransport(socketTransportConnection);
    this.users.push(user);
  },

  onMessage: function(transport, data) {
    logger.debug(data);
    transport.sendJSON(data);
  }, 

  onDisconnect: function(transportConnection) {
    var index = this.users.indexOf(transportConnection.user);
    if (index >= 0) {
      this.users.slice(index,1);
      logger.debug("Removed user at index "+ index);
    }
  }
}

exports.klass = ConnectionManager;
