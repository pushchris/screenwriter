var express = require('express'),
	app = express(),
	stylus = require('stylus');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.methodOverride());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.cookieParser('keyboard cat'));
app.use(stylus.middleware(__dirname + '/public'));
app.use('/', express.static(__dirname + '/public'));
app.use('/build', express.static(__dirname + '/build'));

if ('development' == app.get('env')) {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
}


app.get('/', require('./views/editor/index').view);
app.post('/download', require('./views/editor/index').download);

server = app.listen(process.env.PORT || 5004);