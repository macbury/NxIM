var express  = require('express')
  , routes   = require('./routes')
  , path     = require('path')
var logger   = require('nlogger').logger(module);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname +'/views');
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
  app.use(require('less-middleware')({ src: './public' }));
  app.use(express.static('./public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
exports.app = app;
