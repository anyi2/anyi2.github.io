// hitokoto.js

$.getJSON('https://v1.hitokoto.cn', function (data) {
    $('#hitokoto').attr({
        'href': '//v1.hitokoto.cn?id=' + data.id,
        'target': '_blank'
    }).append(data.hitokoto).append(
        $('<div>').addClass('detail').text(data.from)
    );
});
