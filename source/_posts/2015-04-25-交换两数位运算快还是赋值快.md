---
id: 73
title: 交换两数位运算快还是赋值快？
date: 2015-04-25T18:31:06+08:00
author: xm1994
layout: post
guid: http://www.summershrimp.com/?p=71
permalink: '/2015/04/%e4%ba%a4%e6%8d%a2%e4%b8%a4%e6%95%b0%e4%bd%8d%e8%bf%90%e7%ae%97%e5%bf%ab%e8%bf%98%e6%98%af%e8%b5%8b%e5%80%bc%e5%bf%ab%ef%bc%9f/'
duoshuo_thread_id:
  - "1182844713556770823"
categories:
  - Fun
---
从初高中的OI到大学中的ACM，队友中都流传着交换变量用位运算要比用赋值速度快。不少人对此深信不疑。但这真的是真的么？今天就来从理论上分析这个问题的真假。

先附上今天所要测试的程序段：

编译环境：

<pre class="lang:default decode:true">➜  test  clang --version
Apple LLVM version 6.0 (clang-600.0.57) (based on LLVM 3.5svn)
Target: x86_64-apple-darwin14.3.0
Thread model: posix</pre>

先是赋值交换

<pre class="lang:c decode:true" title="swap_equal.c">void swap(int *a, int *b)
{
	int t=*a;
	*a=*b;
	*b=t;
}</pre>

然后是位运算交换

<pre class="lang:default decode:true" title="swap_xor.c">void swap(int *a,int *b)
{
        if(*a == *b )
                 return ;
	*a = *a ^ *b;
        *b = *b ^ *a;
        *a = *a ^ *b;
}</pre>

由于这里只是程序片段，就不再生成可执行文件。使用clang编译获得汇编文件来进行对比。

首先，我们不开编译优化，看看编译后的结果。（clang %s.c -S -o %s-no.s -m32）

赋值交换：

<pre class="lang:asm decode:true" title="swap_equal-no.s">.section	__TEXT,__text,regular,pure_instructions
	.globl	_swap
	.align	4, 0x90
_swap:                                  ## @swap
## BB#0:
	pushl	%ebp
	movl	%esp, %ebp              ##准备阶段
	subl	$12, %esp               ##开栈帧
	movl	12(%ebp), %eax          ## b -&gt; %eax
	movl	8(%ebp), %ecx           ## a -&gt; %ecx
	movl	%ecx, -4(%ebp)          ## 开本地变量
	movl	%eax, -8(%ebp)
	movl	-4(%ebp), %eax      
	movl	(%eax), %eax            ##交换两元素
	movl	%eax, -12(%ebp)
	movl	-8(%ebp), %eax      
	movl	(%eax), %eax
	movl	-4(%ebp), %ecx          ##赋回原变量
	movl	%eax, (%ecx)
	movl	-12(%ebp), %eax
	movl	-8(%ebp), %ecx
	movl	%eax, (%ecx)
	addl	$12, %esp
	popl	%ebp
	retl


.subsections_via_symbols
</pre>

位运算交换：

<pre class="lang:asm decode:true" title="swap_xor-no.s">.section	__TEXT,__text,regular,pure_instructions
	.globl	_swap
	.align	4, 0x90
_swap:                                  ## @swap
## BB#0:
	pushl	%ebp
	movl	%esp, %ebp
	subl	$8, %esp
	movl	12(%ebp), %eax
	movl	8(%ebp), %ecx
	movl	%ecx, -4(%ebp)
	movl	%eax, -8(%ebp)
	movl	-4(%ebp), %eax
	movl	(%eax), %eax
	movl	-8(%ebp), %ecx         ## 准备阶段都一样
	cmpl	(%ecx), %eax           ## 进行一个相等判断，下文有介绍
	jne	LBB0_2
## BB#1:
	jmp	LBB0_3
LBB0_2:
	movl	-4(%ebp), %ex
	movl	(%eax), %eax
	movl	-8(%ebp), %ecx
	xorl	(%ecx), %eax
	movl	-4(%ebp), %ecx
	movl	%eax, (%ecx)
	movl	-8(%ebp), %eax
	movl	(%eax), %eax
	movl	-4(%ebp), %ecx
	xorl	(%ecx), %eax
	movl	-8(%ebp), %ecx
	movl	%eax, (%ecx)
	movl	-4(%ebp), %eax
	movl	(%eax), %eax
	movl	-8(%ebp), %ecx
	xorl	(%ecx), %eax
	movl	-4(%ebp), %ecx
	movl	%eax, (%ecx)          ## XOR
LBB0_3:
	addl	$8, %esp
	popl	%ebp                
	retl                          ## 返回阶段


.subsections_via_symbols
</pre>

很明显，赋值交换的指令数量已经比位运算交换少了不少。（待补充汇编代码分析）下面我们再打开第一级编译优化（clang %s.c -S -o %s-o1.s -O -m32）来试一下：

赋值交换：

<pre class="lang:asm decode:true" title="swap_equal-o1.s">.section	__TEXT,__text,regular,pure_instructions
	.globl	_swap
	.align	4, 0x90
_swap:                                  ## @swap
## BB#0:
	pushl	%ebp			##%ebp 入栈
	movl	%esp, %ebp		##准备%esp
	pushl	%esi			##暂存%esi
	movl	12(%ebp), %eax		## a -&gt; %eax
	movl	8(%ebp), %ecx		## b -&gt; %ecx
	movl	(%ecx), %edx		## (%ecx) 此时为*b的值 -&gt; %edx
	movl	(%eax), %esi		## (%eax) 此时为*a的值 -&gt; %esi
	movl	%esi, (%ecx)		## %esi -&gt; *b
	movl	%edx, (%eax)		## %edx -&gt; *a
	popl	%esi			## 恢复 %esi
	popl	%ebp			## 弹出反址
	retl				## 返回


.subsections_via_symbols
</pre>

&nbsp;

位运算交换：

<pre class="lang:asm decode:true" title="swap_xor-o1.s">.globl	_swap
	.align	4, 0x90
_swap:                                  ## @swap
## BB#0:
	pushl	%ebp                    ## %ebp入栈
	movl	%esp, %ebp              ## 准备 %esp
	pushl	%esi                    ## 暂存 %esi
	movl	12(%ebp), %ecx          ## b -&gt; %ecx
	movl	8(%ebp), %eax           ## a -&gt; %eax
	movl	(%eax), %esi            ## *a -&gt; %esi 
	movl	(%ecx), %edx            ## *b -&gt; %edx
	cmpl	%edx, %esi              ## 比较 *a *b
	je	LBB0_2                  ## 相等时跳转结束。
## BB#1:
	xorl	%esi, %edx              ## %esi(*a的值) xor %edx(*b的值) -&gt;%edx
	movl	%edx, (%eax)            ## %edx -&gt; %eax(*a)
	xorl	(%ecx), %edx            ##以下类似
	movl	%edx, (%ecx)
	xorl	%edx, (%eax)
LBB0_2:
	popl	%esi
	popl	%ebp
	retl


.subsections_via_symbols</pre>

赋值发在完成两个方法相同的寄存器变量准备步骤后，赋值法仅用了两个mov指令就完成了变量交换。而位运算法执行了三个xor两个mov指令才完成交换。

因此，位运算交换两数并不比赋值法快，特别在编译优化优秀的编译器上，中间变量完全可以使用寄存器优化掉。因此，放弃用位运算作交换的念头吧。