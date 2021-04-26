---
title: Javascript Event Loop
date: 2021-03-12
tags:
 - 前端
 - 基础
categories: 
 - Front-End-Basics
---

## 1.线程与进程

### 概念

**JavaScript是单线程执行的，指一个进程里只有一个主线程**

*进程是 CPU资源分配的最小单位；线程是 CPU调度的最小单位*。

- 进程有单独的专属自己的资源
- 一个进程由一个或多个线程组成，线程是一个进程中代码的不同执行路线
- 一个进程的内存空间是共享的，每个线程都可用这些共享内存



### 多进程与多线程

- 多进程：在同一个时间里，同一个计算机系统中如果允许两个或两个以上的进程处于运行状态
- 多线程：程序中包含多个执行流，即在一个程序中可以同时运行多个不同的线程来执行不同的任务，也就是说允许单个程序创建多个并行执行的线程来完成各自的任务

例如Chrome浏览器，当打开一个tab页其实就是创建了一个进程，一个进程中可以有多个线程，比如渲染线程、JS引擎线程、HTTP请求线程等等。当发起一个请求时，其实就是创建了一个线程，请求结束后该线程可能就会被销毁。



## 2.浏览器内核

浏览器内核是通过取得页面内容、整理信息（应用CSS）、计算和组合最终输出可视化的图像结果，也被称为**渲染引擎**。

浏览器内核是多线程，在内核控制下各线程相互配合以保持同步，一个浏览器通常由以下常驻线程组成：

- GUI 渲染线程
- JavaScript 引擎线程
- 定时触发器线程
- 事件触发线程
- 异步http请求线程



### 3.GUI 渲染线程

- 主要负责页面的渲染，解析HTML、CSS，构建DOM树，进行布局和绘制等
- 当界面需要重绘或者由于某种操作引发回流时，将执行该线程
- 该线程与JavaScript引擎线程互斥，当执行JavaScript引擎线程时，GUI渲染会被挂起，当任务队列空闲时，主线程才会去执行GUI渲染



### JavaScript 引擎线程

- 主要负责处理JavaScript脚本，执行代码
- 也负责执行准备好待执行的事件，即定时器计数结束、异步请求成功并正确返回时，将依次进入任务队列等待线程的执行
- 该线程与GUI渲染线程互斥，当JavaScript引擎线程执行代码时间过长，将导致页面渲染的阻塞



### 定时器触发线程

- 负责执行异步定时器一类的函数的线程，如：setTimeout,setInterval等
- 主线程依次执行代码时，遇到定时器，会将定时器交给该线程处理，当计数完毕后，事件触发线程会将计数完毕后的事件加入到任务队列的尾部，等待JavaScript引擎线程执行



### 事件触发线程

- 主要负责将准备好的事件交给JavaScript引擎线程执行

  比如定时器计数结束、Ajax等异步请求成功并触发回调函数，或者用户触发点击事件时，该线程会将准备好的事件依次加入到任务队列的队尾等待JavaScript引擎线程的执行



### 异步http请求线程

- 负责执行异步请求一类的函数的线程，如：Promise、Ajax等
- 主线程依次执行代码时，遇到异步请求会将函数交给该线程处理，当监听到状态码变更，如果有回调函数，事件触发线程会将回调函数加入到任务队列的尾部，等待JavaScript引擎线程执行



## 3.浏览器中的Event loop 

 

### Macro-Task 和 Micro-Task

浏览器端事件循环中的异步队列有两种：**macro（宏任务）队列**和 **micro（微任务）队列** 。

**宏任务队列可以有多个，微任务队列只有一个**。

- 常见的 macro-task 比如：setTimeout、setInterval、script（整体代码）、 I/O 操作、UI 渲染等。

- 常见的 micro-task 比如: new Promise().then(回调)、MutationObserver(html5新特性) 等。



### Event Loop 过程解析

![img](https://user-gold-cdn.xitu.io/2019/1/10/1683863633586974?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

1. 一开始执行栈空,可以把**执行栈认为是一个存储函数调用的栈结构，遵循先进后出的原则**。micro 队列初始为空，macro 队列里有且只有一个 script 脚本（整体代码）。

2. 全局上下文（script 标签）被推入执行栈，同步代码执行。在执行的过程中，会判断是同步任务还是异步任务，通过对一些接口的调用，可以产生新的 macro-task 与 micro-task，它们会分别被推入各自的任务队列里。同步代码执行完了，script 脚本会被移出 macro 队列，这个过程本质上是队列的 macro-task 的执行和出队的过程。

3. 上一步我们出队的是一个 macro-task，这一步我们处理的是 micro-task。但需要注意的是：当 macro-task 出队时，任务是**一个一个**执行的；而 micro-task 出队时，任务是**一队一队**执行的。因此，我们处理 micro 队列这一步，会逐个执行队列中的任务并把它出队，直到队列被清空。

4. **执行渲染操作，更新界面**

5. 检查是否存在 Web worker 任务，如果有，则对其进行处理

   

每一次循环都是一个这样的过程：

![img](https://user-gold-cdn.xitu.io/2019/1/10/1683877ba9aab056?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)



**当某个宏任务执行完后,会查看是否有微任务队列。如果有，先执行微任务队列中的所有任务，如果没有，会读取宏任务队列中排在最前的任务，执行宏任务的过程中，遇到微任务，依次加入微任务队列。栈空后，再次读取微任务队列里的任务，依次类推。**



## 4.Node中的Event Loop

### Node简介

Node 中的 Event Loop 和浏览器中的是完全不相同的东西。Node.js采用V8作为js的解析引擎，而I/O处理方面使用了自己设计的libuv，libuv是一个基于事件驱动的跨平台抽象层，封装了不同操作系统一些底层特性，对外提供统一的API，事件循环机制也是它里面的实现（下文会详细介绍）。

![img](https://user-gold-cdn.xitu.io/2019/1/11/1683d81674f076eb?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

Node.js的运行机制如下:



- V8引擎解析JavaScript脚本。
- 解析后的代码，调用Node API。
- libuv库负责Node API的执行。它将不同的任务分配给不同的线程，形成一个Event Loop（事件循环），以**异步**的方式将任务的执行结果返回给V8引擎。
- V8引擎再将结果返回给用户。

### 六个阶段

其中libuv引擎中的事件循环分为 6 个阶段，它们会按照顺序反复运行。每当进入某一个阶段的时候，都会从对应的回调队列中取出函数去执行。当队列为空或者执行的回调函数数量到达系统设定的阈值，就会进入下一阶段。

![img](https://user-gold-cdn.xitu.io/2019/1/12/16841bd9860c1ee9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

从上图中，大致看出node中的事件循环的顺序：

外部输入数据-->轮询阶段(poll)-->检查阶段(check)-->关闭事件回调阶段(close callback)-->定时器检测阶段(timer)-->I/O事件回调阶段(I/O callbacks)-->闲置阶段(idle, prepare)-->轮询阶段（按照该顺序反复运行）

- timers 阶段：这个阶段执行timer（setTimeout、setInterval）的回调

- I/O callbacks 阶段：处理一些上一轮循环中的少数未执行的 I/O 回调

- idle, prepare 阶段：仅node内部使用

- poll 阶段：获取新的I/O事件, 适当的条件下node将阻塞在这里

- check 阶段：执行 setImmediate() 的回调

- close callbacks 阶段：执行 socket 的 close 事件回调

**注意：上面六个阶段都不包括 process.nextTick()**

日常开发中的绝大部分异步任务都是在` timers `、`poll`、`check`这3个阶段处理的。

1. **timer**

   timers 阶段会执行 setTimeout 和 setInterval 回调，并且是由 poll 阶段控制的。 同样，**在 Node 中定时器指定的时间也不是准确时间，只能是尽快执行**。

2. **poll**

   poll 是一个至关重要的阶段，这一阶段中，系统会做两件事情

   1. 回到 timer 阶段执行回调

   2. 执行 I/O 回调

      并且在进入该阶段时如果没有设定了 timer 的话，会发生以下两件事情

      - 如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者达到系统限制
      - 如果 poll 队列为空时，会有两件事发生
        - 如果有 setImmediate 回调需要执行，poll 阶段会停止并且进入到 check 阶段执行回调
        - 如果没有 setImmediate 回调需要执行，会等待回调被加入到队列中并立即执行回调，这里同样会有个超时时间设置防止一直等待下去

      当然设定了 timer 的话且 poll 队列为空，则会判断是否有 timer 超时，如果有的话会回到 timer 阶段执行回调。

3. **check**

   `setImmediate()`的回调会被加入check队列中，从event loop的阶段图可以知道，check阶段的执行顺序在poll阶段之后

   ```javascript
   console.log('start')
   setTimeout(() => {
     console.log('timer1')
     Promise.resolve().then(function() {
       console.log('promise1')
     })
   }, 0)
   setTimeout(() => {
     console.log('timer2')
     Promise.resolve().then(function() {
       console.log('promise2')
     })
   }, 0)
   Promise.resolve().then(function() {
     console.log('promise3')
   })
   console.log('end')
   //start=>end=>promise3=>timer1=>timer2=>promise1=>promise2
   ```

   - 一开始执行栈的同步任务（这属于宏任务）执行完毕后（依次打印出start 和 end，并将2个timer依次放入timer队列）,会先去执行微任务（**这点跟浏览器端的一样**），所以打印出promise3

   - 然后进入timers阶段，执行timer1的回调函数，打印timer1，并将promise.then回调放入microtask队列，同样的步骤执行timer2，打印timer2；这点跟浏览器端相差比较大，**timers阶段有几个setTimeout/setInterval都会依次执行**，并不像浏览器端，每执行一个宏任务后就去执行一个微任务（关于Node与浏览器的 Event Loop 差异，下文还会详细介绍）。



### Micro-Task  与 Macro-Task

Node端事件循环中的异步队列也是这两种：macro（宏任务）队列和 micro（微任务）队列。

- 常见的 macro-task 比如：setTimeout、setInterval、 setImmediate、script（整体代码）、 I/O 操作等。
- 常见的 micro-task 比如: process.nextTick、new Promise().then(回调)等。



### 注意点

**setTimeout** 和 **setImmediate **二者非常相似，区别主要在于调用时机不同

- setImmediate 设计在poll阶段完成时执行，即check阶段；
- setTimeout 设计在poll阶段为空闲时，且设定时间到达后执行，但它在timer阶段执行

```javascript
setTimeout(function timeout () {
  console.log('timeout');
},0);
setImmediate(function immediate () {
  console.log('immediate');
});
```

- 对于以上代码来说，setTimeout 可能执行在前，也可能执行在后。

- 首先 setTimeout(fn, 0) === setTimeout(fn, 1)，这是由源码决定的 进入事件循环也是需要成本的，如果在准备时候花费了大于 1ms 的时间，那么在 timer 阶段就会直接执行 setTimeout 回调

- 如果准备时间花费小于 1ms，那么就是 setImmediate 回调先执行了

但当二者在异步i/o callback内部调用时，总是先执行setImmediate，再执行setTimeout

```javascript
const fs = require('fs')
fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0)
    setImmediate(() => {
        console.log('immediate')
    })
})
// immediate
// timeout
```

在上述代码中，setImmediate 永远先执行。因为两个代码写在 IO 回调中，IO 回调是在 poll 阶段执行，当回调执行完毕后队列为空，发现存在 setImmediate 回调，所以就直接跳转到 check 阶段去执行回调了。



### process.nextTick

这个函数其实是独立于 Event Loop 之外的，它有一个自己的队列，当每个阶段完成后，如果存在 nextTick 队列，就会清空队列中的所有回调函数，并且优先于其他 microtask 执行。

```javascript
setTimeout(() => {
 console.log('timer1')
 Promise.resolve().then(function() {
   console.log('promise1')
 })
}, 0)
process.nextTick(() => {
 console.log('nextTick')
 process.nextTick(() => {
   console.log('nextTick')
   process.nextTick(() => {
     console.log('nextTick')
     process.nextTick(() => {
       console.log('nextTick')
     })
   })
 })
})
// nextTick=>nextTick=>nextTick=>nextTick=>timer1=>promise1
```



## 5.Node与浏览器Event Loop差异

**浏览器环境下，microtask的任务队列是每个macrotask执行完之后执行。而在Node.js中，microtask会在事件循环的各个阶段之间执行，也就是一个阶段执行完毕，就会去执行microtask队列的任务**。

![Event Loop](C:\Users\Admin\Downloads\Event Loop.png)

通过一个例子来说明两者区别：

```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```

浏览器端运行结果：`timer1=>promise1=>timer2=>promise2`

浏览器端的处理过程如下：

![img](https://user-gold-cdn.xitu.io/2019/1/12/16841d6392e8f537?imageslim)

Node端运行结果分两种情况：

- 如果是node11版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行微任务队列，这就跟浏览器端运行一致，最后的结果为`timer1=>promise1=>timer2=>promise2`
- 如果是node10及其之前版本：要看第一个定时器执行完，第二个定时器是否在完成队列中。
  - 如果是第二个定时器还未在完成队列中，最后的结果为`timer1=>promise1=>timer2=>promise2`
  - 如果是第二个定时器已经在完成队列中，则最后的结果为`timer1=>timer2=>promise1=>promise2`(下文过程解释基于这种情况下)

1. 全局脚本（main()）执行，将2个timer依次放入timer队列，main()执行完毕，调用栈空闲，任务队列开始执行；

2. 首先进入timers阶段，执行timer1的回调函数，打印timer1，并将promise1.then回调放入microtask队列，同样的步骤执行timer2，打印timer2；

3. 至此，timer阶段执行结束，event loop进入下一个阶段之前，执行microtask队列的所有任务，依次打印promise1、promise2

Node端的处理过程如下：

![img](https://user-gold-cdn.xitu.io/2019/1/12/16841d5f85468047?imageslim)

## 6.总结

浏览器和Node 环境下，microtask 任务队列的执行时机不同

- Node端，microtask 在事件循环的各个阶段之间执行
- 浏览器端，microtask 在事件循环的 macrotask 执行完之后执行