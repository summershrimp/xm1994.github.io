---
id: 84
title: HttpLuaModule在Coding WebIDE中的应用
date: 2015-11-03T10:57:01+08:00
author: xm1994
layout: post
guid: https://www.summershrimp.com/?p=84
permalink: '/2015/11/httpluamodule%e5%9c%a8coding-webide%e4%b8%ad%e7%9a%84%e5%ba%94%e7%94%a8/'
categories:
  - Web Backend
---
## 0x00 前言

HttpLuaModule又名ngx\_lua，由国人大神agentzh(章奕春)开发。ngx\_lua将lua脚本语言嵌入nginx中，并用lua封装了部分nginx的API，使nginx开发不再需要繁琐的C语言进行。目前，ngx_lua在阿里cdn，又拍云cdn中均发挥了极大的作用。

Coding作为一个技术导向的创业公司，也在Coding WebIDE混合架构中使用了ngx_lua。

## 0x01 ngx_lua介绍

ngx_lua 通过在nginx的处理阶段中使用lua或luajit(推荐)插入lua脚本，对当前阶段的请求进行处理，使nginx具有更复杂的逻辑功能。由于lua的紧凑、快速以及内建协程，所以在保证高并发服务能力的同时极大地降低了业务逻辑实现成本。

推荐阅读<a href="http://io.upyun.com/2015/04/14/using-ngxlua-in-upyun/" target="_blank">浅谈 ngx_lua 在 UPYUN 的应用</a>

## 0x02 应用背景

Coding WebIDE是国内第一个基于Web的集成开发环境(IDE)，目前提供给用户一定的代码储存空间和一个完整的Ubuntu Terminal用于在线调试

由于IDE在使用的过程中存在状态，因此每个用户的每个Workspace必须存放在某台固定的机器上。这就要求Balancer将用户每次分配到相同的机器上。

<img class="alignnone" src="http://7sbxnl.com1.z0.glb.clouddn.com/luaide-1.png" alt="" width="611" height="284" /> 

在引入ngx_lua前，Service会在用户创建Workspace时将用户所在的机器名返回给Web UI，Web UI在每次Ajax请求的时候会带上\`X-Space-Key\` 和 \`X-Sharding-Group\`两个HTTP Header，nginx在请求中根据X-Sharding-Group的值来选择对应的Service。这里将后端的机器名暴露给了用户，带来了安全隐患。

Coding WebIDE还有一个生成访问URL的功能，可将用户在Terminal中启动的Http Application暴露在公网中，供用户调试使用。

在引入ngx_lua前，每次对访问URL的请求都会进入Service，由Service找到对应Container的IP，并通过\`X-Accel-Redirect\`的方式通知每个Service中的nginx，去返回目标Container中的服务。而在这个过程中，用户的请求会两次经过Service层的nginx，造成较大的延时。

## 0x03 ngx_lua的应用

### Balancing

我们使用ngx\_lua将原本需要在X-Sharding-Group头中的backend地址去掉，通过ngx\_lua在数据库和缓存中检索X-Space-Key来找到对应的Service，并将upstream设为对应机器，杜绝了请求中带有Service机器名带来的隐患。同时，Redis作为缓存的加入并不会导致性能有太大的降低。

<pre class="lang:lua decode:true ">if ngx.var.backend_upstream ~= "" then
	ngx.log(ngx.ALERT, ngx.var.backend_upstream, " From Header")
	return
end

local spaceKey = ngx.req.get_headers()['X-Space-Key']
targetGroup = config.defaultGroup
redisCli = init_redis()
mysqlConn = init_mysql()
if spaceKey ~= nil then
	local shardingGroup, err = 在缓存中查询
	if shardingGroup ~= nil and shardingGroup ~= ngx.null then
		targetGroup = shardingGroup
		ngx.log(ngx.ALERT, shardingGroup, " From Redis")
	else
		res, err, errno, sqlstate = 在数据库中查询
		if not res then
			ngx.log(ngx.ERR, err)
			ngx.exit(500)
		else
			shardingGroup = res;
			if shardingGroup ~= nil then
				缓存数据
				targetGroup = shardingGroup
			end
		end
	end
end

ngx.var.backend_upstream = targetGroup
ngx.log(ngx.ALERT, "Workspace ", spaceKey, " final upstream: ",targetGroup)

close_cosock(mysqlConn)
close_cosock(redisCli)</pre>

&nbsp;

&nbsp;

### Access URL

Access URL在引入ngx_lua后，性能得到了极大的提升。在用户生成了Access URL后，Service会将相关数据缓存入redis，在用户访问URL时，将由Frontend Balancer直接寻找对应container的信息，并直接要求Backend Service返回对应的请求。

<pre class="lang:lua decode:true">redisCli = init_redis()

local upstream = ""

local host = ngx.req.get_headers()['host']
local spaceKey, port, token = string.match(host, "^([^-]+)-([^-]+)-([^.]+)[.]") --匹配spaceKey, port, token sdciqw-58647-eidsae.box.io -&gt;  sdciqw, 58647, eidsae

local redisKey = spaceKey..":"..port
local jsonStr, err = redisCli:get(redisKey)
if jsonStr == nil or jsonStr == ngx.null then
	ngx.log(ngx.ERR, "access a non-exist http forwarding upstream")
else
    local luahf = cjson.decode(jsonStr)
    if luahf.token == token and luahf.ip ~= cjson.null  then
        upstream = luahf.host.."/"..luahf.ip.."/"..port..ngx.var.request_uri
    end
end
close_cosock(redisCli)
ngx.log(ngx.ALERT, "Http forwarding upstream: ", upstream)
if upstream == "" then
	ngx.exit(502)
else
	ngx.var.upstream = upstream
end</pre>

原本需要nginx转发两次的请求现在只需要一次就可以到达。大大提升了用户的体验。

### WebSocket

由于WebSocket不能自定义Header，所以使用了类似于Access URL的方法进行Balancing。Web UI在建立WebSocket时所需的握手时间也有一定的降低。

## 0x04 ngx_lua的踩坑经历

### cosocket在不同阶段的可用性

resty.mysql和resty.redis均采用了nginx中提供的cosocket进行socket链接。但cosocket并不是在每个nginx的访问阶段都可用。在我们第一版测试的时候使用了set\_by\_lua直接对nginx变量进行赋值。但是在这个阶段只能使用redis\_lua和luasql.mysql进行访问。但这两个模块使用了lua原生的socket库，并不能复用nginx的socket链接。而且由于ngx\_lua的特殊性，无法在外部模块中使用连接池，导致链接开销过大，速度降低等问题。

因此，我们将原在set\_by\_lua中执行的任务使用access\_by\_lua的方式重写，使用了复用cosocket的openresty系列库。

### sql和redis的连接池

由于ngx_lua的特殊性，无法使用传统意义上的连接池。但是openresty提供了基于cosocket的连接池，可以减少每次重连造成的开销。

<pre class="lang:lua decode:true">function close_cosock(cosock)
	if not cosock then
		return
	end
	local ok, err = cosock:set_keepalive(config.pool.idle_time, config.pool.size)
	if not ok then
		ngx.say("set keepalive error : ", err)
	end
end</pre>

使用如上代码关闭\`resty.redis\`和\`resty.mysql\`的链接便可将cosocket链接放入连接池，等待下次connect。

### 生产和开发环境不一致

根据官方文档，生产环境需要打开lua\_code\_cache。但是开发环境可以不打开lua\_code\_cache。当不打开code cache时，每次请求都会重新加载lua文件，这使得lua文件可以获得及时的更新。

在我们的测试中，当生产环境打开code cache后，部分

### 0x05 总结

综上，集成lua的nginx可以完成很多之前需要在Backend Service中完成的功能，可以减少不同模块之间的耦合度，还能一定程度上提升应用性能。

lua的开发周期和成本也比用C开发nginx模块要低得多，便于快速上线和迭代开发。因此，不妨尝试将部分业务放入ngx_lua中完成。