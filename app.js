
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , util = require('util')
  , url = require('url')
  , settings = require('konphyg')(__dirname + '/config/')('server')
  , library = require('./library')
  , fetch = require('./fetch');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || settings.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/search/:q', function (req, res) {
    res.render('songlist', { 'songArr' : library.search(decodeURIComponent(req.params.q)) });
});

app.get('/home', function (req, res) {
    res.render('songlist', { 'songArr' : library.getSongArr() });
});

app.get('/login', function(req, res) {
    res.render('index', { 'title' : 'myjukebox.js'});
});

app.get('/', function(req, res) {
    res.render('library', { 'title' : 'myjukebox.js', 'songArr' : library.getSongArr() });
});

app.get('/artist/:artist', function(req, res) {
    res.render('songlist', { 'songArr' : library.getSongArrByArtist(decodeURIComponent(req.params.artist)) });
});

app.get('/album/:album', function(req, res) {
    res.render('songlist', { 'songArr' : library.getSongArrByAlbum(decodeURIComponent(req.params.album)) });
});

app.get('/robots.txt', function(req, res) {
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end('User-agent : *\ndisallow : /');
});

app.get('/fetch/:id', fetch.handleFetchSong);

library.init();

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

