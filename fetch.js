var fs = require('fs');
var library = require('./library.js');

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

exports.handleFetchCover = function(req, res) {
    res.writeHead(404);
    res.end();
};

exports.handleFetchInfo = function (req, res) {
    var song = library.getSongById(req.params.id);
    var info = {
        title : song.title,
        artist : song.artist
    };
    res.send(info);
};

exports.handleFetchSong = function(req, res) {
    var ip;
    var stream;
    var stat;
    var info = {};
    var song = library.getSongById(req.params.id);
    var range = typeof req.headers.range === "string" ? req.headers.range : undefined;

    try {
        info.path = song.path;
        info.file = info.path.match(/(.*[\/|\\])?(.+?)$/)[2];
        stat = fs.statSync(info.path);
    } catch (e) {
        console.log(e);
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

    downloadHeader(res, info);

    ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    console.log('ip=' + ip + ',id=' + req.params.id + ',start=' + info.start + ',end=' + info.end + ',song=' + JSON.stringify(song));

    stream = fs.createReadStream(info.path, { flags: "r", start: info.start, end: info.end });
    stream.pipe(res);
};

var downloadHeader = function (res, info) {
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
