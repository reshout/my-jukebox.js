var mediainfo = require("mediainfo");
var fs = require('fs');
var path = require('path');
var settings = require('konphyg')(__dirname + '/config/')('library');
var async = require('async');

var musicFolders = settings.music_folders;
var songArray = [];
var songArrayIndex = 0;
var songPathArray = [];
var songArtistMap = {};
var songAlbumMap = {};

exports.init = function() {
    var i;
    var musicFolder;

    async.forEachSeries(musicFolders, function(musicFolder, callback) {
        console.log('scanning ' + musicFolder);
        scanMediaPath(musicFolder);
        callback();
    },
    function(err) {
        console.log(songPathArray.length + ' mp3 files indexed');
    });

    async.forEachSeries(songPathArray, function(songPath, callback) {
        mediainfo(songPath, function(err, res) {
            var song = {};
            if (res && res[0] && res[0].performer && res[0].album && res[0].track_name && res[0].track_name_position) {
                song.id = songArrayIndex++;
                song.artist = res[0].performer;
                song.title = res[0].track_name;
                song.album = res[0].album;
                song.track = parseInt(res[0].track_name_position, 10);
                song.path = songPath;
                songArray.push(song);
                putSongIntoArtistMap(song);
                putSongIntoAlbumMap(song);
            }
            callback();
        });
    },
    function(err) {
        console.log(songArray.length + ' songs ready!');
    });
}

var scanMediaPath = function(mediaPath) {
    var i;
    var files;
    var stat;
    var basename;

    try {
        stat = fs.statSync(mediaPath);
        if (stat.isFile()) {
            basename = path.basename(mediaPath);
            if (path.extname(basename) === '.mp3') {
                songPathArray.push(mediaPath);
            }
        }
        else if (stat.isDirectory()) {
            files = fs.readdirSync(mediaPath);
            for (i = 0; i < files.length; i++) {
                scanMediaPath(path.join(mediaPath, files[i]));
            }
        }
    } catch (e) {
        ;
    }
}

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

exports.getSongByPhrase = function (phrase) {
    var list = [];
    var regex = new RegExp(phrase, "gi");

    songArray.forEach(function (element, index, array) {
        if(element.artist.match(regex) || element.title.match(regex) || element.album.match(regex)) {
            list.push(element);
        }
    });
    return getSortedSongArray(list);
};

exports.getSongArray = function() {
    return getSortedSongArray(songArray);
}

exports.getSongById = function(id) {
    return songArray[id];
}

exports.getSongArrayByArtist = function(artist) {
    var list = songArtistMap[artist];
    if (!list) {
        list = [];
    }
    return getSortedSongArray(list);
}

exports.getSongArrayByAlbum = function(album) {
    var list = songAlbumMap[album];
    if (!list) {
        list = [];
    }
    return getSortedSongArray(songAlbumMap[album]);
}

var getSortedSongArray = function(originalSongArray) {
    sortedSongArray = originalSongArray.slice();
    sortedSongArray.sort(function(a, b) {
        if (a.artist > b.artist) return 1;
        else if (a.artist < b.artist) return -1;

        if (a.album > b.album) return 1;
        else if (a.album < b.album) return -1;

        if (a.track > b.track) return 1;
        else if (a.track < b.track) return -1;

        return 0;
    });
    return sortedSongArray;
};
