// search.js

var service = $.url('?service');
var query = $.url('?query');
var nextUrl = $.url('?next');
if (nextUrl) {
    $('#next-url').text('安逸导航丨自由的探索互联网').append($('<a>').addClass('sub header').attr('href', nextUrl).text(service + '：' + query));
    window.location.replace(nextUrl);
};
