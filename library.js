var mediainfo = require("mediainfo");
var fs = require('fs');
var path = require('path');
var settings = require('konphyg')(__dirname + '/config/')('library');
var musicDirs = settings.music_dirs;
var songArr = [];
var songReadyIndex = 0;
var songIndex = 0;
var songArtistMap = {};
var songAlbumMap = {};

exports.init = function() {
    var i;
    var musicDir;

    songIndex = 0;
    for (i= 0; i < musicDirs.length; i++) {
        musicDir = musicDirs[i];
        console.log('scanning ' + musicDir);
        scanMedia(musicDir);
    }
    console.log(songArr.length + ' songs indexed');

    // start to get media information
    getMediaInfo(0);
}

var scanMedia = function(mediaPath) {
    var i;
    var files;
    var stat;
    var basename;

    try {
        stat = fs.statSync(mediaPath);
        if (stat.isFile()) {
            basename = path.basename(mediaPath);
            if (path.extname(basename) === '.mp3') {
                song = { 'id' : songIndex++
                    , 'path' : mediaPath
                    , 'filename' : basename
                    , 'title' : ''
                    , 'album' : ''
                    , 'artist' : '' };
                songArr.push(song);
            }
        }
        else if (stat.isDirectory()) {
            files = fs.readdirSync(mediaPath);
            for (i = 0; i < files.length; i++) {
                scanMedia(path.join(mediaPath, files[i]));
            }
        }
    } catch (e) {
        ;
    }
}

var getMediaInfo = function(index) {
    if (index < songArr.length) {
        mediainfo(songArr[index].path, function(err, res) {
            if (res && res[0]) {
                songArr[index].artist = res[0].performer || '';
                songArr[index].title = res[0].track_name || '';
                songArr[index].album = res[0].album || '';
                putSongIntoArtistMap(songArr[index]);
                putSongIntoAlbumMap(songArr[index]);
            }
            songReadyIndex = index;
            getMediaInfo(index + 1);
        });
    } else {
        console.log('finish to get media information for ' + songArr.length + ' songs');
    }
};

var putSongIntoArtistMap = function(song) {
    if (song.artist) {
        var list = songArtistMap[song.artist];
        if (!list) {
            list = [];
            songArtistMap[song.artist] = list;
        }
        list.push(song);
    }
}

var putSongIntoAlbumMap = function(song) {
    if (song.artist) {
        var list = songAlbumMap[song.album];
        if (!list) {
            list = [];
            songAlbumMap[song.album] = list;
        }
        list.push(song);
    }
}

exports.search = function (phrase) {
    var list = [];
    var regex = new RegExp(phrase, "gi");
    songArr.forEach(function (element, index, array) {
        if(element.artist.match(regex) || element.title.match(regex) || element.album.match(regex)) {
            list.push(element);
        }
    });
    return list;
};

exports.getSongArr = function() {
    return songArr.slice(0, songReadyIndex + 1);
}

exports.getSongById = function(id) {
    return songArr[id];
}

exports.getSongArrByArtist = function(artist) {
    var list = songArtistMap[artist];
    if (!list) {
        list = [];
    }
    return list;
}

exports.getSongArrByAlbum = function(album) {
    var list = songAlbumMap[album];
    if (!list) {
        list = [];
    }
    return songAlbumMap[album];
}
