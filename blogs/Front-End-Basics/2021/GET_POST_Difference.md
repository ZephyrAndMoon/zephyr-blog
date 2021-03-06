---
title: GET 与 POST 的区别
date: 2021-11-23
tags:
 - HTTP
 - 基础
 - 前端
categories: 
 - Front-End-Basics
---

## 标准答案

| 分类             | GET                                                          | POST                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 后退按钮/刷新    | 无害                                                         | 数据会被重新提交（浏览器应该告知用户数据会被重新提交）。     |
| 书签             | 可收藏为书签                                                 | 不可收藏为书签                                               |
| 缓存             | 能被缓存                                                     | 不能缓存                                                     |
| 编码类型         | application/x-www-form-urlencoded                            | application/x-www-form-urlencoded 或 multipart/form-data。为二进制数据使用多重编码。 |
| 历史             | 参数保留在浏览器历史中。                                     | 参数不会保存在浏览器历史中。                                 |
| 对数据长度的限制 | 是的。当发送数据时，GET 方法向 URL 添加数据；URL 的长度是受限制的（URL 的最大长度是 2048 个字符）。 | 无限制。                                                     |
| 对数据类型的限制 | 只允许 ASCII 字符。                                          | 没有限制。也允许二进制数据。                                 |
| 安全性           | 与 POST 相比，GET 的安全性较差，因为所发送的数据是 URL 的一部分。在发送密码或其他敏感信息时绝不要使用 GET ！ | POST 比 GET 更安全，因为参数不会被保存在浏览器历史或 web 服务器日志中。 |
| 可见性           | 数据在 URL 中对所有人都是可见的。                            | 数据不会显示在 URL 中。                                      |

所以从标准上来看，**GET** 和 **POST** 的区别如下：

- **GET** 用于获取信息，是无副作用的，是幂等的，且可缓存
- **POST** 用于修改服务器上的数据，有副作用，非幂等，不可缓存

## **报文上的区别**

> **GET 和 POST 方法没有实质区别**，只是 **报文格式不同**。

**GET** 和 **POST** 只是 `HTTP` 协议中两种请求方式，而 HTTP 协议是基于 `TCP/IP` 的应用层协议，无论 **GET** 还是 **POST**，用的都是同一个传输层协议，**所以在传输上，没有区别**。



不带参数时，最大区别就是第一行方法名不同：

**POST** 方法请求报文第一行是这样的 `POST /uri HTTP/1.1`

**GET** 方法请求报文第一行是这样的 `GET /uri HTTP/1.1`



带参数时报文的区别：

在约定中，**GET** 方法的参数应该放在 url 中，**POST** 方法参数应该放在 body 中

举个例子，如果参数是 `name=qiming.c, age=22`

**GET** 方法简约版报文:

```
GET /index.php?name=qiming.c&age=22 HTTP/1.1
Host: localhost
```

**POST** 方法简约版报文是这样的:

```
POST /index.php HTTP/1.1
Host: localhost
Content-Type: application/x-www-form-urlencoded

name=qiming.c&age=22
```

两种方法本质上是 `TCP` 连接，没有差别，也就是说，如果不按规范来也是可以的。可以在 URL 上写参数，然后方法使用 **POST**；也可以在 Body 写参数，然后方法使用 **GET**。当然，这需要服务端支持。

## **常见问题**

### **GET 方法参数写法是固定的吗？**

在约定中参数是写在 `?` 后面，用 `&` 分割。

我们知道，解析报文的过程是通过获取 TCP 数据，用正则等工具从数据中获取 **Header** 和 **Body**，从而提取参数。

也就是说，可以自己约定参数的写法，只要服务端能够解释出来就行。

一种比较流行的写法是 `http://www.example.com/user/name/chengqm/age/22`。

### **POST 方法比 GET 方法安全？**

按照网上大部分文章的解释，**POST** 比 **GET** 安全，因为数据在地址栏上不可见。

然而，从传输的角度来说，他们都是不安全的，因为 `HTTP` 在网络上是明文传输的，只要在网络节点上捉包，就能完整地获取数据报文。

要想安全传输，就只有加密，也就是 `HTTPS`。

### **GET 方法的长度限制是怎么回事？**

在网上看到很多关于两者区别的文章都有这一条，提到浏览器地址栏输入的参数是有限的。

首先说明一点，`HTTP` 协议没有 Body 和 URL 的长度限制，对 URL 限制的大多是浏览器和服务器的原因。

浏览器原因就不说了，服务器是因为处理长 URL 要消耗比较多的资源，为了性能和安全（防止恶意构造长 URL 来攻击）考虑，会给 URL 长度加限制。

### **POST 方法会产生两个TCP数据包？**

有些文章中提到，**POST** 会将 header 和 body 分开发送，先发送 header，服务端返回 `100` 状态码再发送 body。

HTTP 协议中没有明确说明 **POST** 会产生两个 TCP 数据包，而且实际测试(Chrome)发现，header 和 body 不会分开发送。

所以，header 和 body 分开发送是部分浏览器或框架的请求方法，不属于 **POST** 必然行为。

## 参考

[都9102年了，还问GET和POST的区别](https://segmentfault.com/a/1190000018129846)
