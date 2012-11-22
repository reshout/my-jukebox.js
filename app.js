
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , util = require('util')
  , url = require('url')
  , library = require('./library');

var mimeTypes = {
    ".swf": "application/x-shockwave-flash",
    ".flv": "video/x-flv",
    ".f4v": "video/mp4",
    ".f4p": "video/mp4",
    ".mp4": "video/mp4",
    ".asf": "video/x-ms-asf",
    ".asr": "video/x-ms-asf",
    ".asx": "video/x-ms-asf",
    ".avi": "video/x-msvideo",
    ".mpa": "video/mpeg",
    ".mpe": "video/mpeg",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
    ".mpv2": "video/mpeg",
    ".mov": "video/quicktime",
    ".movie": "video/x-sgi-movie",
    ".mp2": "video/mpeg",
    ".qt": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/x-wav",
    ".aif": "audio/x-aiff",
    ".aifc": "audio/x-aiff",
    ".aiff": "audio/x-aiff",
    ".jpe": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png" : "image/png",
    ".svg": "image/svg+xml",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".gif": "image/gif",
    ".txt": "text/plain",
    ".xml": "text/xml",
    ".css": "text/css",
    ".htm": "text/html",
    ".html": "text/html",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".vcf": "text/x-vcard",
    ".vrml": "x-world/x-vrml",
    ".zip": "application/zip",
    ".webm": "video/webm",
    ".m3u8": "application/x-mpegurl",
    ".ts": "video/mp2t"
};

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 57753);
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

app.get('/', function(req, res) {
    res.render('library', { 'songArr' : library.getSongArr() });
});

app.get('/robots.txt', function(req, res) {
    res.writeHead(200, { 'Content-Type' : 'text/plain' });
    res.end('User-agent : *\ndisallow : /');
});

app.get('/song/:id', function(req, res) {
    var stream;
    var stat;
    var info = {};
    var range = typeof req.headers.range === "string" ? req.headers.range : undefined;

    info.path = library.getSong(req.params.id).path;
    info.file = info.path.match(/(.*[\/|\\])?(.+?)$/)[2];

    try {
        stat = fs.statSync(info.path);
    } catch (e) {
        res.writeHead(404);
        res.end();
        return;
    }

    info.start = 0;
    info.end = stat.size - 1;
    info.size = stat.size;
    info.modified = stat.mtime;
    info.rangeRequest = false;
    info.mime = mimeTypes[info.path.match(/\..+?$/)];
    if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
        info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] - 0 : info.start;
        info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] - 0 : info.end;
        info.rangeRequest = true;
    }
    info.length = info.end - info.start + 1;

    downloadHeader(res, info, 'audio/mp3');

    stream = fs.createReadStream(info.path, { flags: "r", start: info.start, end: info.end });
    stream.pipe(res);
});

library.init();

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

var downloadHeader = function (res, info, type) {
    var code = 200;
    var header;

    header = {
        "Cache-Control": "public",
        Connection: "keep-alive",
        "Content-Type": info.mime,
        "Content-Disposition": "inline; filename=" + encodeURIComponent(info.file) + ";"
    };

    if (info.rangeRequest) {
        // Partial http response
        code = 206;
        header.Status = "206 Partial Content";
        header["Accept-Ranges"] = "bytes";
        header["Content-Range"] = "bytes " + info.start + "-" + info.end + "/" + info.size;
    }

    header.Pragma = "public";
    header["Last-Modified"] = info.modified.toUTCString();
    header["Content-Transfer-Encoding"] = "binary";
    header["Content-Length"] = info.length;
    
    res.writeHead(code, header);
};

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
