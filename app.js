/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , auth = require('connect-auth')
  , path = require('path')
  , fs = require('fs')
  , util = require('util')
  , url = require('url')
  , settings = require('konphyg')(__dirname + '/config/')('server')
  , library = require('./library')
  , fetch = require('./fetch');

var app = express();

var loginWithGoogle2 = function () {
    return (settings.google2Id && settings.google2Secret && settings.google2CallbackAddress);
};

app.configure(function() {
  app.set('port', process.env.PORT || settings.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  if (loginWithGoogle2()) {
      app.use(express.cookieParser());
      app.use(express.session({secret: 'secrets'}));
      app.use(auth(auth.Google2({appId : settings.google2Id, appSecret: settings.google2Secret, callback: settings.google2CallbackAddress, requestEmailPermission: true})));
      app.use(function(req, res, next) {
        req.authenticate(['google2'], function(err, authenticated) {
            if (err || !authenticated) {
                ;
            } else {
                next();
            }
        });
      });
  }
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    console.log(req.getAuthDetails().user);
    var songArray = library.getSongArray();
    res.render('library', { 'user' : req.getAuthDetails().user, 'title' : 'myjukebox.js (' + songArray.length + ' songs ready!)', 'songArray' : songArray });
});

app.get('/robots.txt', function(req, res) {
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end('User-agent : *\ndisallow : /');
});

app.get('/search/:qhrase', function (req, res) {
    res.render('songlist', { 'songArray' : library.getSongByPhrase(decodeURIComponent(req.params.qhrase)) });
});

app.get('/home', function (req, res) {
    res.render('songlist', { 'songArray' : library.getSongArray() });
});

app.get('/artist/:artist', function(req, res) {
    res.render('songlist', { 'songArray' : library.getSongArrayByArtist(decodeURIComponent(req.params.artist)) });
});

app.get('/album/:album', function(req, res) {
    res.render('songlist', { 'songArray' : library.getSongArrayByAlbum(decodeURIComponent(req.params.album)) });
});

app.get('/fetch/song/:id', fetch.handleFetchSong);
app.get('/fetch/cover/:id', fetch.handleFetchCover);
app.get('/fetch/song/info/:id', fetch.handleFetchInfo);

library.init();

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

