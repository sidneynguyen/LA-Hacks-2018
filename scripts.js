var curr = 0;
setInterval(function() {
    $('body').css('background-image', "url('" + (curr++ % 5) + ".jpg'");
}, 5000);