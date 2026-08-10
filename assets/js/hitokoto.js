// hitokoto.js

$.getJSON('https://v1.hitokoto.cn', function (data) {
    $('#hitokoto').attr({
        'href': `//hitokoto.cn?id=${data.id}`,
        'target': '_blank'
    }).append(data.hitokoto).append(
        $('<div>').addClass('detail').text(data.from)
    );
}).fail(function () {
    $('#hitokoto').attr({
        'href': 'https://www.anyi2.com/',
        'target': '_blank'
    }).html('<i class="lightbulb icon"></i>全新升级的新版学术导航<div class="detail">安逸导航</div>');
});
