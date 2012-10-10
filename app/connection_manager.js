var SocketTransport = require("./socket_transport").klass;
var UserModule      = require("./user")
var logger          = require('nlogger').logger(module);
var errors          = require("./error_code");
var authentication  = require("./commands/authentication");
var crypto          = require('crypto');
var DatabseHelper   = require("./mongo_configuration").DatabaseHelper;

function ConnectionManager(config) {
  logger.info("Creating connection manager");
  this.commands = {}
  this.dbHelper = new DatabseHelper(config.db);
  
  var commandsTemp = [
    require("./commands/authentication").commands
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
  users: [], // users with binded connections
  pending_connections: [], // connections waiting to be assign to user(unauthorized)

  bindSocketIO: function(io) {
    logger.info("Binding socket io");
    this.socketIO = io;
    context = this;
    this.socketIO.sockets.on('connection', function (socket) {
      connection = new SocketTransport(context, socket);
      context.onConnection(connection);
    });
  },

  onConnection: function(socketTransportConnection) {
    logger.info("New connection appered adding it to the pending connections list");
    //user = new UserModule.User();
    //user.pushTransport(socketTransportConnection);
    //this.users.push(user);
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
      var index = this.users.indexOf(transportConnection.user);
      if (index >= 0) {
        this.users.splice(index,1);
        logger.debug("Removed user at index "+ index + " there is still users: " + this.users.length);
      }
    } else {
      var index = this.pending_connections.indexOf(transportConnection);
      if (index >= 0) {
        this.pending_connections.splice(index,1);
        logger.debug("Removed pending connection at index "+ index + " there is still " + this.pending_connections.length);
      }
    }
    
  }
}

exports.klass = ConnectionManager;
