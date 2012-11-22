var mediainfo = require("mediainfo");
var fs = require('fs');
var path = require('path');
var musicDirs = [ "/data/media/음악_네이버뮤직"
    , "/data/media/음악_다음뮤직"
    , "/data/media/음악_벅스"
    , "/data/media/음악_CD"
    , "/data/media/라디오" ];
var songArr = [];
var songReadyIndex = 0;

exports.init = function() {
    var i = 0;
    var j = 0;
    var musicDir;
    var files;
    var song;
    var filename;

    for ( ; i < musicDirs.length; i++) {
        musicDir = musicDirs[i];
        files = fs.readdirSync(musicDir);
        for ( ; j < files.length; j++) {
            if (path.extname(files[j]) === '.mp3') {
                song = { 'id' : j
                    , 'path' : path.join(musicDir, files[j])
                    , 'filename' : files[j]
                    , 'title' : ''
                    , 'album' : ''
                    , 'artist' : '' };
                songArr.push(song);
            }
        }
    }

    resolve(0);
}

var resolve = function(index) {
    if (index < songArr.length) {
        mediainfo(songArr[index].path, function(err, res) {
            if (res && res[0]) {
                songArr[index].artist = res[0].performer || '';
                songArr[index].title = res[0].track_name || '';
                songArr[index].album = res[0].album || '';
            }
            songReadyIndex = index;
            resolve(index + 1);
        });
    }
}

exports.getSongArr = function() {
    return songArr.slice(0, songReadyIndex + 1);
}

exports.getSong = function(id) {
    return songArr[id];
}
