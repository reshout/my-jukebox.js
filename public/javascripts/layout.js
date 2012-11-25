$(document).ready(function() {
    $('#library').tinyscrollbar();

    $('#search').keyup(function (event) {
        // Enter key
        if(event.keyCode == 13) {
            changeSongList('/search/' + $('#search').val());
        }
    });
    
    $('#audioctr').bind('ended', function () {
        var next = $('#aud_src').attr('data-next');
        var aud = $('#audioctr').get(0);

        $('#aud_src').attr('src', next);
        aud.load();
        aud.play();
    });

    preventScrolling();
});

var preventScrolling = function () {
    $('.title').click(function (e) {
        // prevent scrolling 
        e.preventDefault();
    });
};

var changeaudio = function (path, next) {
    $('#aud_src').attr('src', path);
    $('#aud_src').attr('data-next', next);
    var aud = $('#audioctr').get(0);
    aud.pause();
    aud.load();
    aud.play();  
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

