var logger          = require('nlogger').logger(module);
var PendingConnectionTimeout = 60000;

// This class will be proxy to connection object(for later support other types of connection like tcp or other)

// context is connection_manager
// io - socket connection object to user
function SocketTransportBase() {
  
}

SocketTransportBase.prototype = {
  _disconnectCallback: null,

  setup: function(context, io) {
    this.socket  = io;
    this.context = context;
    this.user    = null;
    this.token   = null;
    this.session = {};
    this.initialize();
  },

  initialize: function() {
    throw("Implement initialize function!");
  },

  onMessage: function(data) {
    throw("Implement message function!");
  },

  sendJSON: function(data) {
    throw("Implement sendJson function!");
  },

  sendAction: function(action_name,payload_content) {
    throw("Implement sendAction function!");
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

exports.klass = SocketTransportBase;