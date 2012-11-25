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
});

var changeaudio = function (path) {
    $('#aud_src').attr('src', path);
    var aud = $('#audioctr').get(0);
    aud.pause();
    aud.load();
    aud.play();  
};

var changeSongList = function (path) {
    $.get(path, function (data) {
        var overview = $('.overview');
        overview.html(data);
        $('#library').tinyscrollbar_update();
    });
};

