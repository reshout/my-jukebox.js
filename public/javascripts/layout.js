$(document).ready(function() {
    var keyboardTimer;
    $('#library').tinyscrollbar();

    $(document).on('keyup', function (event) {
        // Space should pause or resume music
        if(event.keyCode == 32 && !$('#search').is(':focus')) {
            event.preventDefault();
            audioCtr = $('#audioctr').get(0);
            if(audioCtr.paused) {
                audioCtr.play();
            }
            else {
                audioCtr.pause();
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
        var id = +$('#aud_src').attr('data-id');
        var nextSong = $('#song' + id) && $('#song' + id).attr('data-next');
        var nextId = id + 1;
        
        // this is when search result returns nothing
        if(listLength == 0) nextId = -1;
        // we've reached the end of the list
        if(nextId == listLength) nextId = 0;
        changeaudio(nextSong, nextId); 
    });

    preventScrolling();
});

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
    
    audioCtl.pause();
    audioCtl.load();
    audioCtl.play();  
    
    displaySongInfo(path.replace('song/', 'song/info/'));
};

var displaySongInfo = function (path) {
    $.get(path, function (data) {
        $('#playingTitle').html(data.title);
        $('#playingArtist').html(data.artist);
    });
};

var changeSongList = function (path) {
    $.get(path, function (data) {
        var overview = $('.overview');
        overview.replaceWith(data);
        // we need to reload the scroll and prevent a tag scrolling again
        $('#library').tinyscrollbar();
        preventScrolling();
    });
};

