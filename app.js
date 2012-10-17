var app      = require('./app/http').app
  , http     = require('http')
  , socket   = require("./app/socketio_boot")
  , repl     = require("repl")
  , ConnectionManager = require("./app/connection_manager").klass;
var logger   = require('nlogger').logger(module);
var CONFIG   = require('config').development;
var os       = require('os');

var numCPUs = os.cpus().length;
logger.info("Detected "+numCPUs + " cpus on device.");

httpServer = http.createServer(app).listen(app.get('port'), function(){
  logger.info("Express server listening on port " + app.get('port'));
  connectionManager = new ConnectionManager(CONFIG);
  io                = socket.boot(httpServer)
  connectionManager.bindSocketIO(io);
});

process.argv.forEach(function (val, index, array) {
  if (val == "console") {
    repl.start("nxim> ", null);
  }
});

