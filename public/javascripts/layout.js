$(document).ready(function() {
    $('#library').tinyscrollbar();
    $('#search').keyup(function (event) {
        // Enter key
        if(event.keyCode == 13) {
            document.location.href = '/search/' + $('#search').val();
        }
    });
});

