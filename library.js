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
    var index = 0;
    var musicDir;
    var files;
    var song;
    var filename;

    for (i= 0; i < musicDirs.length; i++) {
        musicDir = musicDirs[i];
        files = fs.readdirSync(musicDir);
        console.log('scanning ' + musicDir);
        for (j = 0; j < files.length; j++) {
            if (path.extname(files[j]) === '.mp3') {
                song = { 'id' : index++
                    , 'path' : path.join(musicDir, files[j])
                    , 'filename' : files[j]
                    , 'title' : ''
                    , 'album' : ''
                    , 'artist' : '' };
                songArr.push(song);
            }
        }
    }
    console.log(songArr.length + ' songs indexed');

    // start to get media information
    getMediaInfo(0);
}

var getMediaInfo = function(index) {
    if (index < songArr.length) {
        mediainfo(songArr[index].path, function(err, res) {
            if (res && res[0]) {
                songArr[index].artist = res[0].performer || '';
                songArr[index].title = res[0].track_name || '';
                songArr[index].album = res[0].album || '';
            }
            songReadyIndex = index;
            getMediaInfo(index + 1);
        });
    } else {
        console.log('finish to get media info for ' + songArr.length);
    }
}

exports.getSongArr = function() {
    return songArr.slice(0, songReadyIndex + 1);
}

exports.getSong = function(id) {
    return songArr[id];
}
