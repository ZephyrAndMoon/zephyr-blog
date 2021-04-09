---
title: 跨域通信（Cross-domain Communication）
date: 2021-03-12
tags:
 - 前端
 - 基础
categories: 
 - Front-End-Basics
---

## 1. 同源策略的概念和具体限制

> 限制从一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的关键的安全机制。（来自MDN官方的解释）

具体解释：

1. 源包括三个部分：协议，域名，端口（HTTP协议的默认端口是80）。如果有一个部分不同则源不同，那就是跨域
2. 限制：这个源的文档没有权利去操作另一个源的文档。这个限制体现在
   - Cookie、LocalStorage和IndexDB无法获取
   - 无法获取和操作DOM
   - 不能发送Ajax请求，Ajax只适合同源通信



## 2. 前后端如何进行通信

主要有以下几种方式：

- `Ajax`：不支持跨域。
- `WebSocket`：不受同源策略的限制，支持跨域
- `CORS`：不受同源策略的限制，支持跨域。一种新的通信协议标准。可以理解成是：**同时支持同源和跨域的Ajax**。



## 3. 如何创建Ajax



### 3.1 发送Ajax请求的五个步骤（XMLHttpRequest的工作原理）

1. 创建XMLHttpRequest对象
2. 使用open方法设置请求的参数，`open(method,url,是否异步)`
3. 发送请求
4. 注册事件。注册onreadystatechange事件，状态改变时就会调用
5. 获取返回的数据，更新UI



### 3.2 发送请求

```javascript
		 // （1）创建异步对象
        var ajaxObj = new XMLHttpRequest();

        // （2）设置请求的参数。包括：请求的方法、请求的url。
        ajaxObj.open('get', '02-ajax.php');

        // （3）发送请求
        ajaxObj.send();

        //（4）注册事件。 onreadystatechange事件，状态改变时就会调用。
        //如果要在数据完整请求回来的时候才调用，我们需要手动写一些判断的逻辑。
        ajaxObj.onreadystatechange = function () {
            // 为了保证 数据 完整返回，我们一般会判断 两个值
            if (ajaxObj.readyState == 4 && ajaxObj.status == 200) {
                // 如果能够进到这个判断 说明 数据 完美的回来了,并且请求的页面是存在的
                // 5.在注册的事件中 获取 返回的 内容 并修改页面的显示
                console.log('数据返回成功');

                // 数据是保存在 异步对象的 属性中
                console.log(ajaxObj.responseText);

                // 修改页面的显示
                document.querySelector('h1').innerHTML = ajaxObj.responseText;
            }
        }
```



### 3.3 onreadystatechange 事件

注册 `onreadystatechange` 事件后，每当 `readyState` 属性改变时，就会调用 `onreadystatechange` 函数。

`readyState`：（存有 `XMLHttpRequest` 的状态。从 `0` 到 `4` 发生变化）：

- `0`: 请求未初始化
- `1`: 服务器连接已建立
- `2`: 请求已接收
- `3`: 请求处理中
- `4`: 请求已完成，且响应已就绪



### 3.4 各类事件触发条件

| 事件               | 触发条件                                                     |
| ------------------ | ------------------------------------------------------------ |
| onreadystatechange | 每当`xhr.readyState`改变时触发；但`xhr.readyState`由非`0`值变为`0`时不触发 |
| onloadstart        | 调用`xhr.send()`方法后立即触发，若`xhr.send()`未被调用则不会触发此事件 |
| onprogress         | `xhr.upload.onprogress`在上传阶段（即`xhr.send()`之后，`xhr.readystate=2`之前）触发，每50ms触发一次；`xhr.onprogress`在下载阶段（即`xhr.readystate=3`时）触发，每50ms触发一次 |
| onload             | 当请求成功完成时触发，此时`xhr.readystate=4`                 |
| onloadend          | 当请求结束（包括请求成功和请求失败）时触发                   |
| onabort            | 当调用`xhr.abort()`后触发                                    |
| ontimeout          | `xhr.timeout`不等于`0`,由请求开始即`onloadstart`开始算起，当到达`xhr.timeout`所设置时间请求还未结束即`onloadend`，则触发此事件 |
| onerror            | 在请求过程中，若发生`Network error`则会触发此事件（若发生`Netword error`时，上传还没有结束，则会先触发`xhr.upload.onerror`，再触发`xhr.onerror`；若发生`Network error`时，上传已经结束，则只会触发`xhr.onerror`）。注意，只有发生了网络层级别的异常才会触发此事件，对于应用层级别的异常，如响应返回的`xhr.statusCode`是`4xx`时，并不属于`Network error`，所以不会触发`onerror`事件，而是会触发`onload`事件 |





## 4. 跨域通信的几种方式



### 4.1 方式

1. `JSONP`
2. `WebSocket`
3. `CORS`
4. `Hash`
5. `postMessage`



### 4.2 JSONP



**JSONP的原理**：

1. 利用script标签的src属性来实现跨域。
2. 通过将前端方法作为参数传递到服务器端，然后由服务器端注入参数之后再返回，实现服务器端向客户端通信。
3. 由于使用script标签的src属性，因此只支持get方法

**JSONP的安全问题：**

**1. CSRF攻击**

- 前端构造一个恶意页面，请求JSONP接口，收集服务端的敏感信息。如果JSONP接口还涉及一些敏感操作或信息（比如登录、删除等操作），那就更不安全了。
- 解决方法：验证JSONP的调用来源（Referer），服务端判断Referer是否是白名单，或者部署随机Token来防御。

**2.XSS漏洞**

> 不严谨的 content-type导致的 XSS 漏洞，想象一下 JSONP 就是你请求 http://youdomain.com?callback=douniwan, 然后返回 `douniwan({ data })，那假如请求 http://youdomain.com?callback=<script>alert(1)</script>` 不就返回 `<script>alert(1)</script>`(`{ data }`)了吗，如果没有严格定义好 `Content-Type（ Content-Type: application/json ）`，再加上没有过滤 callback 参数，直接当 html 解析了，就是一个赤裸裸的 XSS 了。

- 解决方法：严格定义 `Content-Type: application/json`，然后严格过滤 callback 后的参数并且限制长度（进行字符转义，例如<换成&lt，>换成&gt）等，这样返回的脚本内容会变成文本格式，脚本将不会执行。

**3.服务器被黑，返回一串恶意执行的代码**

可以将执行的代码转发到服务端进行校验JSONP内容校验，再返回校验结果

#### 

**JSONP的实现：**

```html
 <script src="http://www.smyhvae.com/?data=name&callback=myjsonp"></script>
```

上面的`src`中，`data=name`是get请求的参数，`myjsonp`是和后台约定好的函数名。 

```javascript
(function (global) {
    var id = 0,
        container = document.getElementsByTagName("head")[0];

    function jsonp(options) {
        if(!options || !options.url) return;

        var scriptNode = document.createElement("script"),
            data = options.data || {},
            url = options.url,
            callback = options.callback,
            fnName = "jsonp" + id++;

        // 添加回调函数
        data["callback"] = fnName;

        // 拼接url
        var params = [];
        for (var key in data) {
            params.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
        url = url.indexOf("?") > 0 ? (url + "&") : (url + "?");
        url += params.join("&");
        scriptNode.src = url;

        // 传递的是一个匿名的回调函数，要执行的话，暴露为一个全局方法
        global[fnName] = function (ret) {
            callback && callback(ret);
            container.removeChild(scriptNode);
            delete global[fnName];
        }

        // 出错处理
        scriptNode.onerror = function () {
            callback && callback({error:"error"});
            container.removeChild(scriptNode);
            global[fnName] && delete global[fnName];
        }

        scriptNode.type = "text/javascript";
        container.appendChild(scriptNode)
    }

    global.jsonp = jsonp;

})(this);
```



### 4.3 WebSocket

```javascript
    var ws = new WebSocket('wss://echo.websocket.org'); //创建WebSocket的对象。参数可以是 ws 或 wss，后者表示加密。

    //把请求发出去
    ws.onopen = function (evt) {
        console.log('Connection open ...');
        ws.send('Hello WebSockets!');
    };


    //对方发消息过来时，我接收
    ws.onmessage = function (evt) {
        console.log('Received Message: ', evt.data);
        ws.close();
    };

    //关闭连接
    ws.onclose = function (evt) {
        console.log('Connection closed.');
    };
```



### 4.4 CORS

> `CORS` 可以理解成是**既可以同步、也可以异步**的Ajax。

- fetch`是一个比较新的`API`，用来实现`CORS`通信。用法如下：

  ```javascript
   			// url（必选），options（可选）
        fetch('/some/url/', {
            method: 'get',
        }).then(function (response) {  //类似于 ES6中的promise
  
        }).catch(function (err) {
          // 出错了，等价于 then 的第二个参数，但这样更好用更直观
        });
  ```

  > 另外，如果面试官问：“CORS为什么支持跨域的通信？”

  > 答案：跨域时，浏览器会拦截`Ajax`请求，并在`http`头中加`Origin`。



### 4.5 HASH

- `url`的`#`后面的内容就叫`Hash`。**Hash的改变，页面不会刷新**。这就是用 `Hash` 做跨域通信的基本原理。

> 补充：`url`的`?`后面的内容叫`Search`。`Search`的改变，会导致页面刷新，因此不能做跨域通信。

**使用举例：**

**场景**：我的页面 `A` 通过`iframe`或`frame`嵌入了跨域的页面 `B`。

> 现在，我这个`A`页面想给`B`页面发消息，怎么操作呢？

1. 首先，在我的`A`页面中：

```javascript
    //伪代码
    var B = document.getElementsByTagName('iframe');
    B.src = B.src + '#' + 'jsonString';  //我们可以把JS 对象，通过 JSON.stringify()方法转成 json字符串，发给 B
```

1. 然后，在`B`页面中：

```js
// B中的伪代码
window.onhashchange = function () {  //通过onhashchange方法监听，url中的 hash 是否发生变化
  var data = window.location.hash;
};
```



### 4.6 postMessage()方法

> `H5`中新增的`postMessage()`方法，可以用来做跨域通信。既然是H5中新增的，那就一定要提到。

**场景**：窗口 A (`http:A.com`)向跨域的窗口 B (`http:B.com`)发送信息。步骤如下

1. 在`A`窗口中操作如下：向`B`窗口发送数据：

```javascript
	// 窗口A(http:A.com)向跨域的窗口B(http:B.com)发送信息
 	Bwindow.postMessage('data', 'http://B.com'); //这里强调的是B窗口里的window对象
```

1. 在`B`窗口中操作如下：

```javascript
    // 在窗口B中监听 message 事件
    Awindow.addEventListener('message', function (event) {   //这里强调的是A窗口里的window对象
        console.log(event.origin);  //获取 ：url。这里指：http://A.com
        console.log(event.source);  //获取：A window对象
        console.log(event.data);    //获取传过来的数据
    }, false);
```





## 5. CORS详解

CORS是一个W3C标准，全称是"跨域资源共享"（Cross-origin resource sharing）。

它允许浏览器向跨源服务器，发出[`XMLHttpRequest`](http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html)请求，从而克服了AJAX只能[同源](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)使用的限制。



### 5.1 简介

CORS需要浏览器和服务器同时支持。目前，所有浏览器都支持该功能，IE浏览器不能低于IE10。

整个CORS通信过程，都是浏览器自动完成，不需要用户参与。对于开发者来说，CORS通信与同源的AJAX通信没有差别，代码完全一样。浏览器一旦发现AJAX请求跨源，就会自动添加一些附加的头信息，有时还会多出一次附加的请求，但用户不会有感觉。

因此，实现CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。



### 5.2 两种请求

浏览器将CORS请求分成两类：简单请求（simple request）和非简单请求（not-simple request）

只要同时满足以下两大条件，就属于简单请求

1. 请求方法是以下三种方法之一：
   - HEAD
   - GET
   - POST
2. HTTP的头信息不超过以下几种字段
   - Accept
   - Accept-Language
   - Content-Language
   - Last-Event-ID
   - Content-Type：只限于三个值application/x-www-form-urlencoded、multipart/form-data、text/plain



这是为了兼容表单（form），因为历史上表单一直可以发出跨域请求。AJAX 的跨域设计就是，只要表单可以发，AJAX 就可以直接发。

凡是不同时满足上面两个条件，就属于非简单请求。

浏览器对这两种请求的处理，是不一样的。



#### 简单请求

##### 基本流程

浏览器直接发出CORS请求。在头信息之中，增加一个`Origin`字段。

例子：

```http
GET /cors HTTP/1.1
Origin: http://api.bob.com
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```



上面的头信息中，`Origin`字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）。服务器根据这个值，决定是否同意这次请求。

如果`Origin`指定的源，不在许可范围内，服务器会返回一个正常的HTTP回应。浏览器发现，这个回应的头信息没有包含`Access-Control-Allow-Origin`字段（详见下文），就知道出错了，从而抛出一个错误，被`XMLHttpRequest`的`onerror`回调函数捕获。注意，这种错误无法通过状态码识别，因为HTTP回应的状态码有可能是200。

如果`Origin`指定的域名在许可范围内，服务器返回的响应，会多出几个头信息字段。

```http
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: FooBar
Content-Type: text/html; charset=utf-8
```



**1. Access-Control-Allow-Origin**

该字段是必须的。它的值要么是请求时`Origin`字段的值，要么是一个`*`，表示接受任意域名的请求。

**2.Access-Control-Allow-Credentials**

该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为`true`，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为`true`，如果服务器不要浏览器发送Cookie，删除该字段即可。

**3.Access-Control-Expose-Headers**

该字段可选。CORS请求时，`XMLHttpRequest`对象的`getResponseHeader()`方法只能拿到6个基本字段：`Cache-Control`、`Content-Language`、`Content-Type`、`Expires`、`Last-Modified`、`Pragma`。如果想拿到其他字段，就必须在`Access-Control-Expose-Headers`里面指定。上面的例子指定，`getResponseHeader('FooBar')`可以返回`FooBar`字段的值。



##### WithCredentials属性

上面说到，CORS请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定`Access-Control-Allow-Credentials`字段。

```http
Access-Control-Allow-Credentials: true
```

另一方面，开发者必须在AJAX请求中打开`withCredentials`属性。

```js
var xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```

否则，即使服务器同意发送Cookie，浏览器也不会发送。或者，服务器要求设置Cookie，浏览器也不会处理。

但是，如果省略`withCredentials`设置，有的浏览器还是会一起发送Cookie。这时，可以显式关闭`withCredentials`

```http
xhr.withCredentials = false;
```

需要注意的是，如果要发送Cookie，`Access-Control-Allow-Origin`就不能设为星号，必须指定明确的、与请求网页一致的域名。同时，Cookie依然遵循同源政策，只有用服务器域名设置的Cookie才会上传，其他域名的Cookie并不会上传，且（跨源）原网页代码中的`document.cookie`也无法读取服务器域名下的Cookie。



#### 非简单请求

##### 预检请求

非简单请求是那种对服务器有特殊要求的请求，比如请求方法是`PUT`或`DELETE`，或者`Content-Type`字段的类型是`application/json`。

非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为"预检"请求（preflight）。

浏览器先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些HTTP动词和头信息字段。只有得到肯定答复，浏览器才会发出正式的`XMLHttpRequest`请求，否则就报错。

下面是一段浏览器的JavaScript脚本。

```javascript
var url = 'http://api.alice.com/cors';
var xhr = new XMLHttpRequest();
xhr.open('PUT', url, true);
xhr.setRequestHeader('X-Custom-Header', 'value');
xhr.send();

```

上面代码中，HTTP请求的方法是`PUT`，并且发送一个自定义头信息`X-Custom-Header`。

浏览器发现，这是一个非简单请求，就自动发出一个"预检"请求，要求服务器确认可以这样请求。下面是这个"预检"请求的HTTP头信息。

```http
OPTIONS /cors HTTP/1.1
Origin: http://api.bob.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header
Host: api.alice.com
Accept-Language: en-US
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

"预检"请求用的请求方法是`OPTIONS`，表示这个请求是用来询问的。头信息里面，关键字段是`Origin`，表示请求来自哪个源。

除了`Origin`字段，"预检"请求的头信息包括两个特殊字段。

1. **Access-Control-Request-Method**

   该字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法，上例是`PUT`。

2. **Access-Control-Request-Headers**

   该字段是一个逗号分隔的字符串，指定浏览器CORS请求会额外发送的头信息字段，上例是`X-Custom-Header`。



##### 预检请求的回应

服务器收到"预检"请求以后，检查了`Origin`、`Access-Control-Request-Method`和`Access-Control-Request-Headers`字段以后，确认允许跨源请求，就可以做出回应。

```http
HTTP/1.1 200 OK
Date: Mon, 01 Dec 2008 01:15:39 GMT
Server: Apache/2.0.61 (Unix)
Access-Control-Allow-Origin: http://api.bob.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Content-Type: text/html; charset=utf-8
Content-Encoding: gzip
Content-Length: 0
Keep-Alive: timeout=2, max=100
Connection: Keep-Alive
Content-Type: text/plain
```

上面的HTTP回应中，关键的是`Access-Control-Allow-Origin`字段，表示`http://api.bob.com`可以请求数据。该字段也可以设为星号，表示同意任意跨源请求。

```http
Access-Control-Allow-Origin: *
```

如果服务器否定了"预检"请求，会返回一个正常的HTTP回应，但是没有任何CORS相关的头信息字段。这时，浏览器就会认定，服务器不同意预检请求，因此触发一个错误，被`XMLHttpRequest`对象的`onerror`回调函数捕获。控制台会打印出如下的报错信息。

```http
XMLHttpRequest cannot load http://api.alice.com.
Origin http://api.bob.com is not allowed by Access-Control-Allow-Origin.
```

服务器回应的其他CORS相关字段如下。

```http
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 1728000
```

1. Access-Control-Allow-Methods

   该字段必须，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不是单是浏览器请求的那个方法。这是为了避免多次"预检"请求

2. Access-Control-Allow-Headers

   如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段

3. Access-Control-Allow-Credentials

   该字段与简单请求时的含义相同

4. Access-Control-Max-Age

   该字段可选，用来指定本次预检请求的有效期，单位为秒。上面结果中，有效期是20天（1728000秒），即允许缓存该条回应1728000秒（即20天），在此期间，不用发出另一条预检请求



##### 浏览器的正常请求和回应

一旦服务器通过了"预检"请求，以后每次浏览器正常的CORS请求，就都跟简单请求一样，会有一个`Origin`头信息字段。服务器的回应，也都会有一个`Access-Control-Allow-Origin`头信息字段。

下面是"预检"请求之后，浏览器的正常CORS请求。

> ```http
> PUT /cors HTTP/1.1
> Origin: http://api.bob.com
> Host: api.alice.com
> X-Custom-Header: value
> Accept-Language: en-US
> Connection: keep-alive
> User-Agent: Mozilla/5.0...
> ```

上面头信息的`Origin`字段是浏览器自动添加的。

下面是服务器正常的回应。

> ```http
> Access-Control-Allow-Origin: http://api.bob.com
> Content-Type: text/html; charset=utf-8
> ```

上面头信息中，`Access-Control-Allow-Origin`字段是每次回应都必定包含的。

