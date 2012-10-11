var logger          = require('nlogger').logger(module);
var PendingConnectionTimeout = 60000;

// This class will be proxy to connection object(for later support other types of connection like tcp or other)

// context is connection_manager
// io - socket connection object to user
function SocketTransport(context, io) {
  this.socket  = io;
  this.context = context;
  this.user    = null;
  this.token   = null;

  var _this = this;
  this.socket.on('message', function (data) {
    _this.onMessage(data);
  });

  this.socket.on('disconnect', function () {
    _this.onDisconnect();
  });

  logger.info("New connection, timeout in: "+ PendingConnectionTimeout / 1000);
  /*setTimeout(function(){
    io.disconnect();
  }, PendingConnectionTimeout);*/
}

SocketTransport.prototype = {
  _disconnectCallback: null,

  onMessage: function(data) {
    this.context.onMessage(this, data);
  },

  sendJSON: function(data) {
    this.socket.emit("message", data);
  },

  sendAction: function(action_name,payload_content) {
    this.socket.emit("message", { action: action_name, payload: payload_content });
  },

  sendError: function(code, description) {
    this.sendJSON({ error: description, code: code }); 
  },

  onDisconnect: function() {
    logger.debug("Disconnecting transport");
    this.context.onDisconnect(this);
  },

  isAuthorized: function() {
    return (this.user != null);
  }
}

exports.klass = SocketTransport;