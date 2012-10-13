
/**
 * Module dependencies.
 */

var express  = require('express')
  , routes   = require('./routes')
  , user     = require('./routes/user')
  , http     = require('http')
  , path     = require('path')
  , socket   = require("./app/socketio_boot")
  , ConnectionManager = require("./app/connection_manager").klass;
var logger   = require('nlogger').logger(module);
var CONFIG   = require('config').development;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.enable('trust proxy');
  app.use(require('connect-assets')({
    src: "./assets/"
  }));
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//app.get('/users', user.list);
app.get('/', routes.index);

httpServer = http.createServer(app).listen(app.get('port'), function(){
  logger.info("Express server listening on port " + app.get('port'));
});

connectionManager = new ConnectionManager(CONFIG);
io                = socket.boot(httpServer)
connectionManager.bindSocketIO(io);

