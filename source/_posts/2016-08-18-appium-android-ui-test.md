---
id: 99
title: Appium在Android UI测试中的应用
date: 2016-08-18T23:29:08+08:00
author: xm1994
layout: post
guid:     /?p=99
permalink: /2016/08/appium-android-ui-test/
categories:
  - Fun
  - 开发向
---
## Android测试工具与Appium简介

Appium是一个C/S架构的，支持Android/iOS Native, Hybrid 和 Mobile Web Apps的测试框架，与测试程序通过Selenum Webdriver协议通讯。Webdriver的好处是通过HTTP RPC的方式调用Server上的过程，编写测试脚本不受语言的限制，无论是Python, Java, NodeJS均可以方便的编写测试。本文中将使用Python进行编程。

起因是因为市场部的同事抛来如下需求：批量添加一些微信好友。直接抓取请求进行重放的方法是不靠谱的，微信与服务端的通讯均加密，Pass。考虑使用xposed等框架hook相关函数进行操作。但是xposed需要越狱，且开发复杂，Pass。后来想到了使用UI测试工具进行模拟操作，开发较为简单。

Android UI测试工具有很多种，如Monkey, UIAutomator, Selendroid, Robotium等。其中UIAutomator, Monkey, Selendroid均为非侵入式的UI测试，也就是不需要修改源代码，只要安装了目标程序就可以进行测试。Robotium需要与源码一同编译测试。Appium实际上就是一个测试工具的统一调度软件，将不同的非侵入式测试工具整合在一起，对外提供统一的API。在Android 2.3以前的版本，Appium会调用Selendroid，之后的版本会直接使用UIAutomator，iOS下使用UIAutomation。Appium还支持FirefoxOS的UI测试。

![Appium Gif](http://cdn-qn.summershrimp.com/appium.gif)

## 安装Appium

官网给出了命令行下的安装方法。但实际上Appium有GUI版本，更适合在Windows/MacOS下使用。Windows下需要安装.NET Framework。

```shell
brew install node      # get node.js
npm install -g appium  # get appium
npm install wd         # get appium client
appium &               # start appium
node your-appium-test.js
```

Appium需要依赖Android SDK编译在手机端运行的两个插件，因此需要首先安装相应的Android SDK版本。这里直接使用了Android Studio中自带的SDK Manager。在SDKManager中选择和测试机相对应的SDK Platform和较新的Build-tools，如果需要使用模拟器测试还要装对应的ARM/x86 System Image，以及Intel HAXM Installer，用于加速x86虚拟机。Appium使用adb来与目标机器通讯，因此对于真机和模拟器操作几乎都是相同的，如何建立模拟器在此不再赘述。

安装完成后需要在Appium GUI中配置Android SDK目录，随后选择Android，点击Launch就可以启动Appium Server。

![](/wp-content/uploads/2016/08/Appium-android-sdk.png)
![](/wp-content/uploads/2016/08/Appium-launch.png)

Appium Server默认会监听http://localhost:4723 ，用于RPC通讯。下面我们就可以打开熟悉的编程环境，编写UI测试用例了。这里使用Python进行编写，需要先安装Appium的Python Client  ，然后再python中使用appium.webclient就可以连接Appium server了。

```shell
pip install Appium-Python-Client
```


## 使用Appium进行UI控制

根据注释修改相应属性后即可运行测试。手机需要打开ADB调试，执行完以下代码后，Appium会在手机上安装Appium Settings和Unlock两个程序，随后微信会被启动。

```python
from appium import webdriver

desired_caps = {}
desired_caps['platformName'] = 'Android'  #测试平台
desired_caps['platformVersion'] = '5.1'   #平台版本
desired_caps['deviceName'] = 'm3_note'    #设备名称，多设备时需区分
desired_caps['appPackage'] = 'com.tencent.mm'  #app package名
desired_caps['appActivity'] = '.ui.LauncherUI' #app默认Activity
dr = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps) #启动Remote RPC
```

Selenum Webdriver使用了一种类似于JS中的DOM模型的方法来选择页面中的元素。dr为当前正在活动的activity对象，可以使用findElementByXXX的方法来获取Activity中的元素。所有Element后带s的函数，均获得所有匹配的元素，不带s的函数获得第一个匹配的元素。

### 查询函数

#### 1. findElement(s)ByName

在Android中基本没用。Android UI没有Name这个属性。有说可以使用text值获取。但我并没有成功

#### 2. findElement(s)ByClassName

通过类名来获取元素，用法如下：

```python
item_list = dr.find_elements_by_class_name("android.widget.LinearLayout")
item_list[2].click()
```

#### 3. findElementById

通过resource_id来获取元素，每个Activity中都是唯一的，用法如下

```python
t = dr.find_element_by_id("com.tencent.mm:id/f7")
t.send_keys(wechatId)
```

#### 4. findElement(s)ByAccessbiltiyId

在Android上AccessbilityID实际就是contentDescription。这个属性是为了方便视力受损人士使用手机所设置。开启TTS后系统会朗读相关控件的contentDescription。

#### 5. findElement(s)ByXPath

通过XML Path描述来寻找元素。我没有成功的获取到，可能是XPath写的有问题。

```python
s = dr.find_element_by_xpath("//android.widget.TextView[contains(@text,'搜索')]")
s.click()
```

#### 6. findElementByAndroidUIAutomator

通过UIAutomator的选择器来获取元素。因为Appium在Android上实际是调用的UIAutomator，所以可以通过UIAutomator的选择器来选择元素。

```python
el = dr.find_element_by_android_ui_automator("new UiSelector().text(\"搜索\")")
el.click()
```

### 操作函数

操作函数用于操作选定的元素，有很多，以下仅列举几个，更多的请查阅手册。

  1. click
  2. send_keys
  3. clear

查询函数返回的元素对象可以像JS中的dom元素一样，继续使用查询函数来选定其子元素。用例如下。

```python
search = dr.find_element_by_id("com.tencent.mm:id/aqw").find_element_by_class_name("android.widget.RelativeLayout")
search.click()
```

## 如何确定查询规则

了解了相关的函数后，下面就应对UI进行定位了。如果是自己团队开发的程序，推荐让开发同学在所有的空间上都添加resource_id进行绝对定位。如果碰到没有谈价resource_id的元素，那就要使用别的办法进行定位了。

### 1. UI Automator Viewer

UI Automator Viewer是Android官方的UI定位工具，位于sdk/tools下。运行后会打开viewer界面。点击获取按钮即可获取当前正在运行的Activity的UI结构。

![](/wp-content/uploads/2016/08/uiviewer.png)

### 2. AppiumDriver getPageSource

AppiumDriver(Client) 可以很方便的获得当前正在运行的Activity的UI描述，随后可根据返回的XML文档来寻找元素。

```python
print dr.page_source
```

![](/wp-content/uploads/2016/08/2014100408573062.jpg)

(图片与他人，侵删)

确定元素位置后，即可根据前述的Find方法来查找/选择元素

## 编写完整的测试代码

正确的获取元素之后便可以获取元素相关的信息，随后使用各语言常用的测试框架编写测试即可，如Java的JUnit，Nodejs的Mocha等。

这里我使用Appium主要是为了模拟用户点击添加微信好友，所以完整的程序并没有使用到测试框架。相关的UI元素获取/操作方法供大家参考。

```python
# coding:utf-8
from appium import webdriver
from time import sleep


def addFriend(dr, id, dryRun=False):
    succ = False
    wechatId = str(id)
    dr.find_element_by_accessibility_id(r"更多功能按钮").click()
    item_list = dr.find_elements_by_class_name("android.widget.LinearLayout")
    try:
        item_list[2].click()
    except:
        print "Error! in item list len"
        return succ
    el = dr.find_element_by_class_name("android.widget.ListView")
    item_list = el.find_elements_by_class_name("android.widget.LinearLayout")
    try:
        item_list[1].click()
    except:
        print "Error! in item list len"
        return succ
    t = dr.find_element_by_id("com.tencent.mm:id/f7")
    t.send_keys(wechatId)
    search = dr.find_element_by_id("com.tencent.mm:id/aqw").find_element_by_class_name("android.widget.RelativeLayout")
    search.click()
    try:
        freq = dr.find_element_by_id('com.tencent.mm:id/aqq')
        assert freq.text == u"操作过于频繁，请稍后再试。"
        print "Frequency too high! Sleep 300s"
        sleep(60)
        return succ
    except:
        pass

    try:
        dr.find_element_by_id('com.tencent.mm:id/a8x').click()
        addBtn = dr.find_element_by_id('com.tencent.mm:id/eu')
        if not dryRun:
            addBtn.click()
            succ = True
        print "Success Send Requests:" + wechatId
    except:
        print "No Such User Or Already a Friend:" + wechatId

    while True:
        try:
            dr.find_element_by_id('com.tencent.mm:id/fb').click()
        except:
            try:
                dr.find_element_by_id('com.tencent.mm:id/f4').click()
            except:
                break
    return True

def resetActivity(dr, desired_caps):
    dr.start_activity(desired_caps['appPackage'], desired_caps['appActivity'])

desired_caps = {}
desired_caps['platformName'] = 'Android'
desired_caps['platformVersion'] = '5.1'
desired_caps['deviceName'] = 'm3_note'
desired_caps['appPackage'] = 'com.tencent.mm'
desired_caps['appActivity'] = '.ui.LauncherUI'
print "Trying connect to phone..."
dr = {}
try:
    dr = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps)
except Exception, e:
    print "Cannot Connect to phone :", e
    exit()
print "Successfully connect to phone."
print "Reading friend list..."
friendList = []
fp = open("friends.txt")
line = fp.readline().strip()
while line:
    friendList.append(line)
    line = fp.readline().strip()
print "Finish reading friends. Total: " + str(len(friendList))
print "Wait for Wechat's splash screen...."
for i in range(0, 10):
    print 10 - i
    sleep(1)
succ_list = []
fail_list = []
for i in friendList:
    try:
        succ = addFriend(dr, i, dryRun=False)
        if succ:
            succ_list.append(i)
        else:
            fail_list.append(i)
    except:
        fail_list.append(i)
        resetActivity(dr, desired_caps)

print "Succeed List:"
print "\n".join(succ_list)
print "Failed List:"
print "\n".join(fail_list)

dr.close()
```
