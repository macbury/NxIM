var logger                    = require('nlogger').logger(module);
var PendingConnectionTimeout  = 60000;
var util                      = require("util");
var SocketTransportBase       = require("./socket_transport_base").klass;
// This class will be proxy to connection object(for later support other types of connection like tcp or other)

// context is connection_manager
// io - socket connection object to user
function TCPSocketTransport() {
  this.buffer = null;
}

util.inherits(TCPSocketTransport, SocketTransportBase);

TCPSocketTransport.prototype.initialize = function(context, io) {
  var _this = this;
  this.socket.on('data', function (data) {
    if (_this.buffer == null) {
      _this.buffer = '';
    }
    data = data.toString();
    logger.info("Recived:", data);
    if (data == '\r\n') {
      try {
        var object = JSON.parse(_this.buffer);
        _this.onMessage(object);
      } catch (e) {
        logger.error(e);
      }
      _this.buffer = null;
    } else {
      _this.buffer += data;
    }
  });

  this.socket.on('close', function () {
    _this.onDisconnect();
  });
}

TCPSocketTransport.prototype.onMessage = function(data) {
  this.context.onMessage(this, data);
}

TCPSocketTransport.prototype.sendJSON = function(data) {
  this.socket.write(JSON.stringify(data));
  this.socket.write("\r\n");
}

TCPSocketTransport.prototype.sendAction = function(action_name,payload_content) {
  this.sendJSON({ action: action_name, payload: payload_content });
}

TCPSocketTransport.prototype.sendError = function(code, description) {
  this.sendJSON({ error: description, code: code }); 
}

exports.klass = TCPSocketTransport;