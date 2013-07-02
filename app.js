
/**
 * Module dependencies.
 */

var express = require('express')
  , model = require('./model')
  , default_route = require('./routes/default')
  , daily_route = require('./routes/daily')
  , weekly_route = require('./routes/weekly')
  , settings_route = require('./routes/settings')
  , http = require('http')
  , path = require('path');



var app = express();

//app.settings.env = 'production';

// all environments
app.use(express.favicon(__dirname +'/public/images/favicon.png', { maxAge: 2592000000 }));
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.use(express.logger('dev'));

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
}

app.get('/',function (req, res) {
	console.log("Req"+req.cookies.tddd_lang);
	var language = req.cookies.tddd_lang?req.cookies.tddd_lang:"us";
	default_route.defaultGet(req, res, 'home', language);
});

app.get('/daily',function (req, res) {
	var language = req.cookies.tddd_lang?req.cookies.tddd_lang:"us";
	daily_route.dailyGet(req, res, language);
});

app.get('/weekly',function (req, res) {
	var language = req.cookies.tddd_lang?req.cookies.tddd_lang:"us";
	weekly_route.weeklyGet(req, res, language);
});

app.get('/settings',function (req, res) {
	var language = req.cookies.tddd_lang?req.cookies.tddd_lang:"us";
	settings_route.settingsGet(req, res, language);
});

app.get('/about',function (req, res) {
	var language = req.cookies.tddd_lang?req.cookies.tddd_lang:"us";
	default_route.defaultGet(req, res, 'about', language);
});

app.get('/donate',function (req, res) {
	var language = req.cookies.tddd_lang?req.cookies.tddd_lang:"us";
	default_route.defaultGet(req, res, 'donate', language);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
