// search.js

var service = $.url('?service');
var query = $.url('?query');
var nextUrl = $.url('?next');
if (nextUrl) {
    $('#next-url').text('即将搭载本站IP，探索世界未知！').append($('<a>').addClass('sub header').attr('href', nextUrl).text(service + '：' + query));
    window.location.replace(nextUrl);
};
