var logger                    = require('nlogger').logger(module);
var PendingConnectionTimeout  = 60000;
var util                      = require("util");
var SocketTransportBase       = require("./socket_transport_base").klass;
// This class will be proxy to connection object(for later support other types of connection like tcp or other)

// context is connection_manager
// io - socket connection object to user
function TCPSocketTransport() {
}

util.inherits(TCPSocketTransport, SocketTransportBase);

TCPSocketTransport.prototype.initialize = function(context, io) {
  var _this = this;
  this.socket.on('data', function (data) {
    console.log(data);
    //_this.onMessage(data);
  });

  this.socket.on('disconnect', function () {
    _this.onDisconnect();
  });
}

TCPSocketTransport.prototype.onMessage = function(data) {
  this.context.onMessage(this, data);
}

TCPSocketTransport.prototype.sendJSON = function(data) {
  this.socket.write(JSON.stringify(data));
}

TCPSocketTransport.prototype.sendAction = function(action_name,payload_content) {
  this.sendJSON({ action: action_name, payload: payload_content });
}

TCPSocketTransport.prototype.sendError = function(code, description) {
  this.sendJSON({ error: description, code: code }); 
}

exports.klass = TCPSocketTransport;