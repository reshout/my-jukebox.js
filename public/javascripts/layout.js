$(document).ready(function() {
    $('#library').tinyscrollbar();
    $('#search').keyup(function (event) {
        // Enter key
        if(event.keyCode == 13) {
            document.location.href = '/search/' + $('#search').val();
        }
    });
    $('.title').click(function (e) {
        // prevent scrolling 
        e.preventDefault();
    });
});

var changeaudio = function (path) {
    //var source = "<audio control='controls' id='audioctr'>";
    //source += "<source src='" + path + "' type='audio/mpeg'>";
    //source += "</audio>";
    $('#aud_src').attr('src', path);
    var aud = $('#audioctr').get(0);
    aud.pause();
    aud.load();
    aud.play();  
};

