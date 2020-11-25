---
id: 114
title: Drozer渗透测试实验
date: 2017-04-05T14:10:43+08:00
author: xm1994
layout: post
guid: https://www.summershrimp.com/?p=114
permalink: /?p=114
categories:
  - 未分类
---
本实验所有步骤均在Kali Linux最新版下完成。其他系统请自行调整步骤。

## 安装Drozer

  1. 安装python和adb： apt-get install python adb
  2. 安装Drozer egg包： easy_install drozer-2.4.2-py2.7.egg
  3. 测试drozer运行:  drozer
  4. 安装Drozer Agent：手机上安装 drozer-agent-2.3.4.apk
  5. 安装Sieve(被攻击程序)：手机上安装sieve.apk

## 环境准备 + 启动Drozer

  1. 手机上运行Sieve，并添加相关数据。
  2. 运行adb端口转发

<pre class="lang:default decode:true">adb forward tcp:31415 tcp:31415</pre>

<ol start="3">
  <li>
    打开Drozer Agent
  </li>
</ol>

手机上运行Drozer Agent，点击底部的Embedded Server后，打开Server开关

<ol start="4">
  <li>
    连接Drozer Agent
  </li>
</ol>

<pre class="lang:default decode:true ">drozer console connect</pre>

&nbsp;

## 什么是sieve

sieve是一个小的密码管理软件，但是在开发时刻意留下了一些常见的安卓应用漏洞。

在sieve首次启动时，需要用户输入一个16位长的主密码和一个4位长的数字pin，用于保护用户之后保存的密码信息。用户可以用sieve储存其他应用的各种账户信息。

在继续实验前，请运行sieve并添加一些账户信息。

收集包信息

评估sieve的第一步是收集该应用包的相关信息。在Android中安装的应用通过唯一的“包名”来区分彼此。我们可以用\`app.package.list\`命令找到sieve的包名。

在得到完整的包名后，可以使用drozer继续搜集软件包的相关信息，命令是\`app.package.info\`

这里显示的一些详情包括版本，应用储存数据的位置，应用的安装位置，应用拥有的权限等。

识别攻击面

本次实验中，我们将关注由于Android 进程间调用（IPC）导致的漏洞。这类漏洞通常可以让安装在同一设备上的其他应用获取到敏感信息。

可以让drozer自动检测sieve的受攻击面

这说明在sieve中有多个可能的受攻击点。这个应用“导出”了多个acitivity，content provider和services。 我们也发现这个应用是可被调试的，这说明我们可以将adb调试器附着在这个app上，获取app执行流中的数据（如变量的值）。

启动某个Activity

我们可以通过使用一些更具体的命令来深入攻击某个攻击面。我们可以通过如下命令查询导出的activity有哪些。

其中，MainLoginActivity是我们预料到的，因为这是应用启动时的登陆页。另外两个则是意料之外的，尤其是PWList这个activity，不需要任何前线就可以启动。我们可以通过drozer启动它

这个命令会在后台启动一个Intent并且通过\`startActivity\`调用将其传递给系统。

执行后，我们会发现这个activity没有任何权限，并且提供了用户的账号列表。

\`app.activity.start\`这个命令可以构造更负载的intent。当然，drozer的所有模块，都可以通过help命令查看具体的使用方法。

获取ContentProvider中的数据

接下来，我们可以尝试从sieve暴露的content provider中获取数据。首先我们用一个简单的指令获取这个app的更多信息

这显示sieve中有两个可被攻击的provider，正如之前攻击面检测中所说。除了DBProviders中的/keys路径，这两个provider都不需要任何权限即可获取。

  1. 数据库Content Provider（数据泄露）

一个叫\`DBContentProvider\`的content provider很容易让人联想到其后会有一个数据库用于储存数据。

然而，如果不知道内容在数据库中是如何被组织的，那么我们也会很难从中获取信息。

我们可以重建部分URI来访问DBContentProvider，我们知道他肯定是以\`content://\`开头的。但是，我们没办法知道这个provider接收的所有路径。

但是，Android程序都倾向于告诉外界他们所拥有的content URI。例如，在前文指令\`app.provider.info\`中，我们可以看到/keys应该是其中一个路径，但我们不能在没有权限的情况下读取它。

drozer提供了一个通过各种手段收集content路径的指令，可以通过这个来轻松的获取content路径。

现在我们可以用其他的drozer指令来收集关于这些content URI的更多信息，甚至直接修改其中的数据。

我们又一次击败了应用程序的安全性，并从其中找到了一个用户名列表。在这个例子中，drozer对密码这一列进行了base64编码。因为其原文是二进制序列，无法直接在命令行窗口中阅读。

<ol start="2">
  <li>
    数据库Content Provider（SQL注入）
  </li>
</ol>

一般情况，Android的应用程序使用SQLite数据库储存用户信息。既然这些数据库均使用SQL查询，我们应该能猜到可能会存在SQL注入漏洞。

检测SQL注入非常简单，只需要伪造“投影”和“选择”（投影和选择均为数据库概念）列的数据，构造错误即可检测。

Android将会返回非常明确地错误信息，其中会包含整个查询指令。我们可以完全利用这个漏洞获取数据库中的所有表信息

甚至可以查询其他的受保护表

<ol start="3">
  <li>
    文件系统Content Provider
  </li>
</ol>

Content provider可以提供对文件系统的访问，通过文件系统在app之间共享文件。但所有的文件都是存在于Android沙箱之中的。

假设FileBackupProvider是一个基于文件系统的content provider, 其中的路径表示我们想要打开的文件。因此我们可以很容易的猜测这个URI，并且使用drozer的模块去读取任意文件。

读取/etc/hosts不成问题。因为/etc/hosts本来就是全局可读的。但如果想获取应用数据目录里的数据，我们就要做更多的尝试。

这个操作将sieve的数据库文件拷贝到了本地计算机上，而且可以直接用sqlite3查看这个数据库。这个数据库中不仅储存了用户在sieve里保存的账号密码，还有sieve的主密码。

<ol start="4">
  <li>
    Content Provider中的漏洞
  </li>
</ol>

我们已经看到content provider既可以被sql注入攻击，又可以被目录遍历。drozer提供了一个可以简易检测这类攻击的模块。

与Services交互

到这里我们几乎攻破了sieve，我们已经提取到了用户的主密码，还有一些保存的加密后的密码。但是我们还可以通过调用sieve中导出的某些服务队加密后的密码进行解密。

之前我们已经发现sieve导出了两个服务，这里，我们尝试获取这两个服务的更多信息。

这两个服务也像其他一些内容一样，直接暴露给了其他的app，而且访问他们不需要任何权限。因为我们要解密密码，CryptoService看起来就十分有趣。

完全解密密码将作为一个练习留给大家。可尝试完全利用CryptoService。为了确定service使用的协议，可能需要反编译应用，然后使用\`app.service.send\`或者自行编写drozer模块与service进行调用。

其他模块

drozer还提供了其他在安全评估时非常有用的木块，例如：

  * shell.start

在设备上启动一个交互式Linux Shell

  * tools.file.upload / tools.file.download

与android设备传输文件

  * tools.setup.busybox / tools.setup.minimalsu

安装一些强大的二进制文件

完整的模块列表，请在drozer控制台中输入list 查看。可以使用help查看每个模块的说明。