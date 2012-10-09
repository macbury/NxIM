// This class will be proxy to connection object(for later support other types of connection like tcp or other)

// context is connection_manager
// io - socket connection object to user
function SocketTransport(context, io) {
  this.socket  = io;
  this.context = context;
  _this = this;
  this.socket.on('message', function (data) {
    _this.onMessage(data);
  });

  this.socket.on('disconnect', function () {
    _this.onDisconnect();
  });

  console.log("New connection.");
}

SocketTransport.prototype = {
  _disconnectCallback: null,

  onMessage: function(data) {
    console.log(data);
    this.sendJSON(data);
  },

  sendJSON: function(data) {
    this.socket.emit("message", data);
  },

  onDisconnect: function() {
    console.log("Disconnectiong.");
    this._disconnectCallback(this);
  }
}

exports.klass = SocketTransport;