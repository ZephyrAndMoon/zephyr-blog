---
title: HTTPS 为什么让数据传输更安全
date: 2021-11-30
tags:
  - 基础
  - 前端
  - HTTP
categories:
  - Other
---





## 前言

HTTP 的特性是明文传输，因此在传输的每一个环节，数据都有可能被第三方窃取或者篡改，具体来说，HTTP 数据经过 TCP 层，然后经过 WIFI 路由器、运营商、目标服务器，这些环节中都可能被中间人拿到数据并进行篡改，也就是常说的 **中间人攻击**。



为了防范这样一类攻击，我们不得已要引入新的加密方案，即 HTTPS。



HTTP 并不是一个新的协议, 而是一个加强版的 HTTP。其原理是在 HTTP 和 TCP 之间建立了一个中间层，当 HTTP 和 TCP 通信时并不是像以前那样直接通信，直接经过了一个中间层进行加密，将加密后的数据包传给 TCP, 响应的，TCP 必须将数据包解密，才能传给上面的 HTTP。这个中间层也叫安全层。安全层的核心就是对数据加解密。



## 对称加密和非对称加密

### 概念

首先需要理解 **对称加密** 和 **非对称加密** 的概念，然后讨论两者应用后的效果如何。

对称加密是最简单的方式，指的是加密和解密用的是 **同样的密钥**。

而对于非对称加密，如果有 A、 B 两把密钥，如果用 A 加密过的数据包只能用 B 解密，反之，如果用 B 加密过的数据包只能用 A 解密。

### 加解密过程

接着来谈谈浏览器和服务器进行协商加解密的过程。

首先，浏览器会给服务器发送一个随机数 `client_random` 和一个加密的方法列表。

服务器接收后给浏览器返回另一个随机数 `server_random` 和加密方法。

现在，两者拥有三样相同的凭证: `client_random`、`server_random` 和加密方法。

接着用这个加密方法将两个随机数混合起来生成密钥，这个密钥就是浏览器和服务端通信的 **暗号**。

### 各自应用的效果

如果用`对称加密`的方式，那么第三方可以在中间获取到`client_random`、`server_random`和加密方法，由于这个加密方法同时可以解密，所以中间人可以成功对暗号进行解密，拿到数据，很容易就将这种加密方式破解了。

而在非对称加密这种加密方式中，服务器手里有两把钥匙，一把是`公钥`，也就是说每个人都能拿到，是公开的，另一把是`私钥`，这把私钥只有服务器自己知道。

好，现在开始传输。

浏览器把`client_random`和加密方法列表传过来，服务器接收到，把`server_random`、`加密方法`和`公钥`传给浏览器。

现在两者拥有相同的`client_random`、`server_random`和加密方法。然后浏览器用公钥将`client_random`和`server_random`加密，生成与服务器通信的`暗号`。

这时候由于是**非对称加密**，公钥加密过的数据只能用`私钥`解密，因此中间人就算拿到浏览器传来的数据，由于他没有私钥，照样无法解密，保证了数据的安全性。

这难道一定就安全吗？聪明的小伙伴早就发现了端倪。回到`非对称加密`的定义，公钥加密的数据可以用私钥解密，那私钥加密的数据也可以用公钥解密呀！

服务器的数据只能用私钥进行加密(因为如果它用公钥那么浏览器也没法解密啦)，中间人一旦拿到公钥，那么就可以对服务端传来的数据进行解密了，就这样又被破解了。而且，只是采用非对称加密，对于服务器性能的消耗也是相当巨大的，因此我们暂且不采用这种方案。

## 对称加密和非对称加密的结合

可以发现，对称加密和非对称加密，单独应用任何一个，都会存在安全隐患。那我们能不能把两者结合，进一步保证安全呢？

其实是可以的，演示一下整个流程：

1. 浏览器向服务器发送`client_random`和加密方法列表。

2. 服务器接收到，返回`server_random`、加密方法以及公钥。

3. 浏览器接收，接着生成另一个随机数`pre_random`, 并且用公钥加密，传给服务器。(敲黑板！重点操作！)

4. 服务器用私钥解密这个被加密后的`pre_random`。

<br>

现在浏览器和服务器有三样相同的凭证:`client_random`、`server_random`和`pre_random`。然后两者用相同的加密方法混合这三个随机数，生成最终的`密钥`。

然后浏览器和服务器尽管用一样的密钥进行通信，即使用`对称加密`。



这个最终的密钥是很难被中间人拿到的，为什么呢? 因为中间人没有私钥，从而拿不到pre_random，也就无法生成最终的密钥了。

回头比较一下和单纯的使用非对称加密, 这种方式做了什么改进呢？本质上是防止了私钥加密的数据外传。单独使用**非对称加密**，最大的漏洞在于服务器传数据给浏览器只能用私钥加密，这是危险产生的根源。利用对称和非对称加密结合的方式，就防止了这一点，从而保证了安全。

## 添加数字证书

尽管通过两者加密方式的结合，能够很好地实现加密传输，但实际上还是存在一些问题。黑客如果采用 DNS 劫持，将目标地址替换成黑客服务器的地址，然后黑客自己造一份公钥和私钥，照样能进行数据传输。而对于浏览器用户而言，他是不知道自己正在访问一个危险的服务器的。

事实上 `HTTPS` 在上述结合对称和非对称加密的基础上，又添加了数字证书认证的步骤。其目的就是让服务器证明自己的身份。

### 传输过程

为了获取这个证书，服务器运营者需要向第三方认证机构获取授权，这个第三方机构也叫 `CA(Certificate Authority)`, 认证通过后 CA 会给服务器颁发**数字证书**。

这个数字证书有两个作用:

1. 服务器向浏览器证明自己的身份。
2. 把公钥传给浏览器。

这个验证的过程发生在当服务器传送`server_random`、加密方法的时候，顺便会带上数字证书(包含了公钥), 接着浏览器接收之后就会开始验证数字证书。如果验证通过，那么后面的过程照常进行，否则拒绝执行。

梳理一下`HTTPS`最终的加解密过程:




![](https://markdowncun.oss-cn-beijing.aliyuncs.com/HTTPS%20Diagram.drawio%20(1).png)



### 认证过程

浏览器拿到数字证书后，如何来对证书进行认证呢？

首先，会读取证书中的明文内容。CA 进行数字证书的签名时会保存一个 Hash 函数，来这个函数来计算明文内容得到 `信息A`，然后用公钥解密明文内容得到 `信息B`，两份信息做比对，一致则表示认证合法。

当然有时候对于浏览器而言，它不知道哪些 CA 是值得信任的，因此会继续查找 CA 的上级 CA，以同样的信息比对方式验证上级 CA 的合法性。一般根级的 CA 会内置在操作系统当中，当然如果向上找没有找到根级的 CA，那么将被视为不合法。

## 总结

HTTPS 并不是一个新的协议, 它在`HTTP`和`TCP`的传输中建立了一个安全层，利用`对称加密`和`非对称加密`结合数字证书认证的方式，让传输过程的安全性大大提高。



## 参考

1.[浏览器灵魂之问，请问你能接得住几个？](https://juejin.cn/post/6844904021308735502#heading-84)