hexo.extend.filter.register('after_post_render', function(data) {
    var gitalkConfig = hexo.config.gitalk;
    if (gitalkConfig) {
        data.content = data.content + '\n<div id="gitalk-container"></div>\n<script src="//cdn.jsdelivr.net/npm/blueimp-md5@2.18.0/js/md5.min.js"></script><link rel="stylesheet" href="//cdn.jsdelivr.net/npm/gitalk/dist/gitalk.css"><script src="//cdn.jsdelivr.net/npm/gitalk/dist/gitalk.min.js"></script>';
        var str = `
        <script>
        var post_title = ${JSON.stringify(data.title)};
        var gitalkConfig = ${JSON.stringify(gitalkConfig)};
        gitalkConfig.id = md5(post_title);
        var gitalk = new Gitalk(gitalkConfig);
        gitalk.render("gitalk-container");
        </script>`;

        data.content = data.content + '\n' + str;
    }

    return data;
});
