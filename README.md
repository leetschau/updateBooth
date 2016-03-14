# Introduction

从Excel文件(.xlsx)中读取需要更新的展位数据，
更新到MongoDB中。

# Usage

```lang=bash
npm install
node main.js
```

# Discussion

Q: 程序使用3个counter作为计数器，如何保证counter不会发生race condition?

A: 关于race condition，参考
[What is a race condition?](http://stackoverflow.com/questions/34510/what-is-a-race-condition)
因为nodejs的event loop是单线程的（nodejs本身不是单线程的，
否则无法运行event loop的同时管理IO），IO操作本身由node的线程池中的线程交给libuv执行，
完成后，event loop将这个IO操作的callback放入主进程中运行，所以
多个IO操作的callback会在event loop主线程中被顺序执行，而不是在各自的线程中同步执行，
所以代码中的计数器（counter对象中的3个计数器）不会出现race condition.

Q: [nodejs](https://nodejs.org/)自我介绍说是一个"event-driven, non-blocking I/O"
框架，如何理解event driven和non-blocking I/O?

A: blocking/non-blocking用于描述IO的行为，当执行系统IO时，blocking IO进入阻塞状态，
直到获得返回结果；non-blocking IO则不论成功失败，直接返回当前的状态，
一般情况下non-blocking IO与轮询(poll)结合使用，也就是需要调用者自己不断查询IO状态，
直到获得结果为止。

由于non-blocking本身不能解决何时能得到调用结果的问题，[libevent](http://libevent.org/)
和nodejs使用的[libuv](https://github.com/libuv/libuv)对各种操作系统提供的
非阻塞IO操作(例如Linux的epoll, Windows的"I/O Completion Ports")进行了封装，
方便实现基于事件的编程(event-based programming).

同步和异步则是两种不同的编程方式，如果函数调用本身的返回值就是要拿到的结果数据，
（不论需要等待多长时间才能拿到结果），就是同步的；如果函数调用并不期望拿到结果，
通过其他方法获取数据，例如注册一个回调函数，就是异步的。

参考：

[What's the difference between: Asynchronous, Non-Blocking, Event-Base architectures?中Rohit Karlupia的回答](http://stackoverflow.com/a/9489547/701420)

[Node.js Event loop中Willem D'Haeseleer的回答](http://stackoverflow.com/a/25569760/701420)

http://stackoverflow.com/questions/10680601/nodejs-event-loop

https://nodesource.com/blog/understanding-the-nodejs-event-loop/
