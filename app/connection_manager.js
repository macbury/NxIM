var SocketTransport = require("./socket_transport").klass;
var TCPSocketTransport = require("./tcp_socket_transport").klass;

var logger          = require('nlogger').logger(module);
var errors          = require("./error_code");
var crypto          = require('crypto');
var DatabseHelper   = require("./db").DatabaseHelper;
var UserPresence    = require("./db").UserPresence;
var Net             = require("net");
function ConnectionManager(config) {
  logger.info("Creating connection manager");
  this.commands = {}
  this.dbHelper = new DatabseHelper(config.db);
  
  var commandsTemp = [
    require("./commands/authentication").commands,
    require("./commands/registration").commands,
    require("./commands/presence").commands,
    require("./commands/profile").commands,
    require("./commands/roster").commands,
    require("./commands/thread").commands,
  ];

  for (var i = 0; i < commandsTemp.length; i++) {;
    commandHash = commandsTemp[i];

    for (var command in commandHash) { 
      if (this.commands[command]) {
        throw("There is alredy action named: "+command);
      } else {
        this.commands[command] = commandHash[command];
        logger.info("Registering command: "+command);
      }
    }
  }

}

ConnectionManager.prototype = {
  socketIO: null,
  commands: {},
  users: {}, // users with binded connections
  pending_connections: [], // connections waiting to be assign to user(unauthorized)

  broadcastPresence: function(user) {
    var _this = this;
    user.getContacts().success(function(contacts){
      logger.info("Sending presence update to user friends: "+user.login + " contacts count: "+contacts.length);
      for (var i = 0; i < contacts.length; i++) {
        _this.sendActionTo("presence.change", { presence: user.presence, from: user.login }, contacts[i]);
      };
    });
  },

  sendActionTo: function(action_name, payload, reciver_user) {
    var connections = this.users[reciver_user.id];
    if (connections == null) {
      logger.info(reciver_user.login + " have no connections to send or is offline: ", connections);
      return;
    }

    for (var i = 0; i < connections.length; i++) {
      var transport = connections[i];
      transport.sendAction(action_name, payload);
    }
  },

  bindUserToConnection: function(transport, user) {
    this.removePendingConnection(transport);
    var connections = this.users[user.id];

    if (connections == null) {
      logger.info("First connection for user "+user.id);
      connections = [];
    }
    transport.user = user;
    connections.push(transport);
    logger.info("User "+user.id + "have connection count "+connections.length);
    this.users[user.id] = connections;
  },

  bindSocketIO: function(io) {
    logger.info("Binding socket io");
    this.socketIO = io;
    var context = this;
    this.socketIO.sockets.on('connection', function (socket) {
      var connection = new SocketTransport();
      connection.setup(context, socket)
      context.onConnection(connection);
    });
  },
  
  bindSocketTCP: function() {
    logger.info("Binding tcp socket");
    var context = this;
    this.socketTCP = Net.createServer(function (socket) {
      var connection = new TCPSocketTransport();
      connection.setup(context, socket);
      context.onConnection(connection);
    });
    
    this.socketTCP.listen(7000, "0.0.0.0");
  },

  onConnection: function(socketTransportConnection) {
    logger.info("New connection appered adding it to the pending connections list");

    var _this = this;
    this.pending_connections.push(socketTransportConnection);
    crypto.randomBytes(128, function(ex, buf) {
      socketTransportConnection.token = buf.toString('hex');
      socketTransportConnection.sendAction("session.start", { token: socketTransportConnection.token });
    });
  },

  onMessage: function(transport, data) {
    logger.debug("Message recived: ",data);

    if (data["action"] && data["payload"]) {
      command = this.commands[data["action"]];

      if (command) {
        logger.debug("Running command: "+data["action"]);
        command.call(this, transport, data["payload"]);
      } else {  
        transport.sendError(errors.INVALID_ACTION, "Undefined action");  
        logger.error("action is undefined!"); 
      }
    } else {
      transport.sendError(errors.INVALID_MESSAGE, "Invalid message!");  
      logger.error("message is invalid!");    
    }

    transport.sendJSON(data);
  }, 

  onDisconnect: function(transportConnection) {
    logger.debug("Pending connections: "+this.pending_connections.length + " logged in users " + this.users.length);
    if (transportConnection.isAuthorized()) {
      var user        = transportConnection.user;
      var connections = this.users[user.id];
      if (connections && connections.length > 0) {
        var index = connections.indexOf(transportConnection);
        if (index >= 0) {
          connections.splice(index,1);
          logger.debug("Removed connection at index "+ index + " there is still connections for users: " + connections.length);
        }

        this.users[user.id] = connections;
      }

      if (connections == null || connections.length == 0) {
        logger.debug("Removed user with id "+ user.id);
        transportConnection.user.setPresence(UserPresence.Offline);
        this.broadcastPresence(user);
        delete this.users[user.id];
      }
    } else {
      this.removePendingConnection(transportConnection);
    }
  }, 

  removePendingConnection: function(transport) {
    var index = this.pending_connections.indexOf(transport);
    if (index >= 0) {
      this.pending_connections.splice(index,1);
      logger.debug("Removed pending connection at index "+ index + " there is still " + this.pending_connections.length);
    }
  },
}

exports.klass = ConnectionManager;
