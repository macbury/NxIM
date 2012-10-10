var SocketTransport = require("./socket_transport").klass;
var UserModule      = require("./user")
var logger          = require('nlogger').logger(module);
function ConnectionManager() {
  logger.info("Creating connection manager");
}

ConnectionManager.prototype = {
  socketIO:    null,
  users: [], // users with binded connections
  pending_connections: [], // connections waiting to be assign to user(unauthorized)

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
    logger.info("New connection appered adding it to the pending connections list");
    //user = new UserModule.User();
    //user.pushTransport(socketTransportConnection);
    //this.users.push(user);
    this.pending_connections.push(socketTransportConnection);
  },

  onMessage: function(transport, data) {
    logger.debug(data);
    transport.sendJSON(data);
  }, 

  onDisconnect: function(transportConnection) {
    if (transportConnection.haveUser()) {
      var index = this.users.indexOf(transportConnection.user);
      if (index >= 0) {
        this.users.slice(index,1);
        logger.debug("Removed user at index "+ index + " there is still users: " + this.users.length);
      }
    } else {
      var index = this.pending_connections.indexOf(transportConnection);
      if (index >= 0) {
        this.pending_connections.slice(index,1);
        logger.debug("Removed pending connection at index "+ index + " there is still " + this.pending_connections.length);
      }
    }
    
  }
}

exports.klass = ConnectionManager;
