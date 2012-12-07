$(document).ready(function() {
    var keyboardTimer;
    var audioCtr = $('#audioctr').get(0);

    $('#library').height($(document).height() - 140);
    // added to remove stupid scrolls
    $(document).on('keydown', function (event) {
        if(!$('#search').is(':focus') && event.keyCode == 32) {
            event.preventDefault();
        }
    });

    $(document).on('keyup', function (event) {
        // Space should pause or resume music
        if(!$('#search').is(':focus')) {
            if(event.keyCode === 32) {
                event.preventDefault();
                if(audioCtr.paused) {
                    playAudio();
                }
                else {
                    pauseAudio();
                }
            }
            // 'n' key play next song
            else if(event.keyCode === 78) {
                event.preventDefault();
                playNextSong();
            }
        }
    });

    $('#search').on('keyup', function (event) {
        var audioCtr;
        // Enter key
        if(event.keyCode == 13) {
            searchWithKeyword();
        }
        // back space and delete key
        else if(event.keyCode === 8 || event.keyCode === 46) {
            if(keyboardTimer) clearTimeout(keyboardTimer);
            keyboardTimer = setTimeout(function () { searchWithKeyword(); }, 300);
        }
        else if(/[a-z0-1]/gi.test(String.fromCharCode(event.keyCode))) {
            console.log(String.fromCharCode(event.keyCode));
            if(keyboardTimer) clearTimeout(keyboardTimer);
            keyboardTimer = setTimeout(function () { searchWithKeyword(); }, 300);
        }
        
    });
    
    $('#audioctr').bind('ended', function () {
        playNextSong();
    });

    $('#play').on('click', function () {
        if(audioCtr.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    });

    $('#next').on('click', function () {
        playNextSong();
    });

    $(window).resize(function () {
        $('#library').height($(document).height() - 140);
    });

    audioCtr.addEventListener('timeupdate', function () {
        var d = new Date(audioCtr.currentTime * 1000);
        var sec = d.getSeconds();
        if(sec < 10) {
            sec = '0' + sec;
        }
        $('#timediv').html(d.getMinutes() + ':' + sec);
    
    });

    preventScrolling();
});

var playNextSong = function () {
    var id = +$('#aud_src').attr('data-id');
    var nextSong = $('#song' + id) && $('#song' + id).attr('data-next');
    var nextId = id + 1;
    
    // this is when search result returns nothing
    if(listLength == 0) nextId = -1;
    // we've reached the end of the list
    if(nextId == listLength) nextId = 0;
    changeaudio(nextSong, nextId); 
};

var searchWithKeyword = function () {
    var value = $('#search').val();
    if(value) {
        value = '/search/' + value;
    } else {
        value = '/home';   
    }

    changeSongList(value);
};

var preventScrolling = function () {
    $('.title').click(function (e) {
        // prevent scrolling 
        e.preventDefault();
    });
};

var changeaudio = function (path, id) {
    // in case search result returns nothing we don't play anything
    if(id == -1) return;
    var audioSrc = $('#aud_src');
    var audioCtl = $('#audioctr').get(0);
    
    audioSrc.attr('src', path);
    audioSrc.attr('data-id', id);
    
    pauseAudio();
    audioCtl.load();
    playAudio();
     
    displaySongInfo(path.replace('song/', 'song/info/'));
};

var displaySongInfo = function (path) {
    $('#playing').hide();
    
    $.get(path, function (data) {
        
        $('#playingTitle').html(data.title);
        $('#playingArtist').html(data.artist);
        $('#playing').fadeIn('slow');
    });
};

var changeSongList = function (path) {
    // save the current height
    $.get(path, function (data) {
        var overview = $('.viewport');
        overview.replaceWith(data);
        preventScrolling();
    });
};

var playAudio = function () {
    var audioCtl = $('#audioctr').get(0);
    audioCtl.play();
    $('#play').html('Pause');
};

var pauseAudio = function () {
    var audioCtl = $('#audioctr').get(0);
    audioCtl.pause();
    $('#play').html('Play');
};
