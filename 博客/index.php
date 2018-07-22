<?php

/**

* 通过PHP实现二级目录跳转到二级域名_带参数(URI)跳转

* 文章地址：i.cuixt.com/2277.html

*/

$the_host = $_SERVER['HTTP_HOST'];

//取得当前访问域名

$url = $_SERVER['PHP_SELF'];

//获取域名后的字串，如：/bbs/index.php

$filename = substr($url, strrpos($url, '/') + 1);

//提取当前文件名

$querystring = $_SERVER["QUERY_STRING"];

//获取问号后面的参数

if ($the_host !== 'blog.youdomain') {

    //验证当前访问域名（就是你的新域名）：若非引号内的域名，则进行如下跳转——

    if ($querystring !== '') {

        //验证文件名后是否有参数，如果有参数则跳转到——

        header('HTTP/1.1 301 Moved Permanently');

        //发出301头部，表明永久重定向

        header('Location: http://blog.youdomain/' . $filename . '?' . $querystring);

        //跳转到我的新域名地址【带参数】

    } elseif ($filename == 'index.php') {

        //如果是主页则直接跳转到新域名

        header('HTTP/1.1 301 Moved Permanently');

        //发出301头部，表明永久重定向

        header('Location: http://blog.youdomain/');

        //跳转到我的新域名

    } else {

        //如果无参数则跳转到——

        header('HTTP/1.1 301 Moved Permanently');

        //发出301头部，表明永久重定向

        header('Location: http://blog.youdomain/' . $filename);

        //跳转到我的新域名地址【不带参数】

    }

}
