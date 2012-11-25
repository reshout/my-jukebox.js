$(document).ready(function() {
    $('#library').tinyscrollbar();
    $('#search').keyup(function (event) {
        // Enter key
        if(event.keyCode == 13) {
            changeSongList('/search/' + $('#search').val());
        }
    });
    $('.title').click(function (e) {
        // prevent scrolling 
        e.preventDefault();
    });

    $('#audioctr').bind('ended', function () {
        /*
        var index = $('#aud_src').attr('data-index');
        var aud = $('#audioctr').get(0);

        if(!isNaN(index)) {
            index = index < songArr.length ? index + 1 : 0;
        }

        $('#aud_src').attr('src', songArr[index]);
        aud.load();
        aud.play();
        */
    });
});

var changeaudio = function (path, index) {
    $('#aud_src').attr('src', path);
    $('#aud_src').attr('data-index', index);
    var aud = $('#audioctr').get(0);
    aud.pause();
    aud.load();
    aud.play();  
};

var changeSongList = function (path) {
    $.get(path, function (data) {
        var overview = $('.overview');
        overview.replaceWith(data);
        $('#library').tinyscrollbar_update();
    });
};

