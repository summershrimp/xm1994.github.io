---
id: 90
title: 博客全面迁移并启用https链接
date: 2015-11-03T12:29:17+08:00
author: xm1994
layout: revision
guid: https://www.summershrimp.com/2015/11/86-revision-v1/
permalink: /2015/11/86-revision-v1/
---
博客现在已经迁移到了阿里云青岛9.9学生服务器。

使用StartCom StartSSL证书用于https加密链接。

附上nginx通过ssllabs A+测试的配置文件

<pre class="lang:default decode:true ">server {
    listen       80;
    listen	 443 ssl;
    server_name  www.summershrimp.com summershrimp.com;

    ssl on;
    ssl_certificate      /home/ubuntu/.ssl_cert/www/cert.pem;
    ssl_certificate_key  /home/ubuntu/.ssl_cert/www/cert.key;
    ssl_trusted_certificate /home/ubuntu/.ssl_cert/www/cert.pem;
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    resolver 114.114.114.114;
    ssl_stapling on;
    ssl_ciphers "ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4";
    ssl_prefer_server_ciphers on;
    ssl_dhparam /home/ubuntu/.ssl_cert/dhparam.pem;

    error_page 497 =307 @https;
    location @https {
        rewrite ^(.*)$ https://$host$1 permanent;
    }
    add_header Strict-Transport-Security "max-age=63072000; preload";

    root /opt/blog/;
    index index.php index.htm index.html;
    #charset koi8-r;
    #access_log  /var/log/nginx/log/host.access.log  main;

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    if (!-e $request_filename){
        rewrite (.*) /index.php;
    }

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    location ~ \.php$ {
        fastcgi_pass   unix:/var/run/php5-fpm.sock;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    location ~ /\.ht {
        deny  all;
    }
}</pre>

&nbsp;

[<img class="alignleft wp-image-87 size-full" src="https://www.summershrimp.com/wp-content/uploads/2015/11/SSL-Server-Test-summershrimp.com-Powered-by-Qualys-SSL-Labs.jpg" alt="SSL Server Test- summershrimp.com (Powered by Qualys SSL Labs)" width="1236" height="5596" srcset="https://www.summershrimp.com/wp-content/uploads/2015/11/SSL-Server-Test-summershrimp.com-Powered-by-Qualys-SSL-Labs.jpg 1236w, https://www.summershrimp.com/wp-content/uploads/2015/11/SSL-Server-Test-summershrimp.com-Powered-by-Qualys-SSL-Labs-66x300.jpg 66w, https://www.summershrimp.com/wp-content/uploads/2015/11/SSL-Server-Test-summershrimp.com-Powered-by-Qualys-SSL-Labs-226x1024.jpg 226w" sizes="(max-width: 1236px) 100vw, 1236px" />](https://www.summershrimp.com/wp-content/uploads/2015/11/SSL-Server-Test-summershrimp.com-Powered-by-Qualys-SSL-Labs.jpg)