
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
  app.enable('trust proxy')
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

connectionManager = new ConnectionManager();
io = socket.boot(httpServer)

connectionManager.bindSocketIO(io);

