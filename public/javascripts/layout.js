$(document).ready(function() {
    $('#library').tinyscrollbar();

    $('#search').keyup(function (event) {
        // Enter key
        if(event.keyCode == 13) {
            changeSongList('/search/' + $('#search').val());
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

