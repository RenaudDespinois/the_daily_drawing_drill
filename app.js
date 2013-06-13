
/**
 * Module dependencies.
 */

var express = require('express')
  , model = require('./model')
  , default_route = require('./routes/default')
  , daily_route = require('./routes/daily')
  , weekly_route = require('./routes/weekly')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.use(express.favicon(__dirname +'/public/images/favicon.png', { maxAge: 2592000000 }));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
}

app.get('/',function (req, res) {
	default_route.defaultGet(req, res, 'home');
});

app.get('/daily',function (req, res) {
	daily_route.dailyGet(req, res);
});

app.get('/weekly',function (req, res) {
	weekly_route.weeklyGet(req, res, 'weekly');
});

app.get('/settings',function (req, res) {
	default_route.defaultGet(req, res, 'settings');
});

app.get('/about',function (req, res) {
	default_route.defaultGet(req, res, 'about');
});

app.get('/donate',function (req, res) {
	default_route.defaultGet(req, res, 'donate');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
