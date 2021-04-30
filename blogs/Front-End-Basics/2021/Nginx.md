---
title: Nginx 基础
date: 2021-04-30
tags:
 - 前端
 - 基础
categories: 
 - Front-End-Basics
---
## Nginx 应用场景

1. **http服务器**

   Nginx是一个http服务可以独立提供http服务。可以做网页静态服务器。

2. **虚拟主机。可以实现在一台服务器虚拟出多个网站。例如个人网站使用的虚拟主机。**

   - 基于端口的，不同的端口

   - 基于域名的，不同域名

3. **反向代理，负载均衡**。

   当网站的访问量达到一定程度后，单台服务器不能满足用户的请求时，需要用多台服务器集群可以使用nginx做反向代理。并且多台服务器可以平均分担负载，不会因为某台服务器负载高宕机而某台服务器闲置的情况。



## 反向代理

**反向代理:客户端 一>代理 <一> 服务端**



**定义**

Nginx根据接收到的请求的端口，域名，url，将请求转发给不同的机器，不同的端口（或直接返回结果），然后将返回的数据返回给客户端。



**例子**

A（客户端）想租一个房子，B（代理）将多栋房子中的其中一栋房子租给了A，

这时候实际上被租出去的这栋房子的房东是C（服务端）

这个过程中A（客户端）并不知道这个房子到底谁才是房东

他都有可能认为这个房子就是B（代理）的



**反向代理特点**

- Nginx没有自己的地址，它的地址就是服务器的地址，如www.baidu.com，对外部来讲，它就是数据的生产者。
- Ngxin明确的知道应该去哪个服务器获取数据（在未接收到请求之前，已经确定应该连接哪台服务器）





## 正向代理



**定义**

所谓正向代理就是顺着请求的方向进行的代理，即**代理服务器**他是由你配置为你服务，去请求目标**服务器**地址。正向代理最大的特点是**客户端**非常明确要访问的

务器地址；**服务器**只清楚请求来自哪个**代理服务器**，而不清楚来自哪个具体的**客户端**；正向代理模式屏蔽或者隐藏了**真实客户端**信息。



**例子**

A（客户端）想租C（服务端）的房子,但是A（客户端）并不认识C（服务端）所以租不到。

但B（代理）认识C（服务端）能租这个房子，于是A（客户端）找了B（代理）帮忙租到了这个房子。

这个过程中C（服务端）不认识A（客户端）只认识B（代理）

C（服务端）并不知道A（客户端）租了房子，只知道房子租给了B（代理）。



![正反向代理](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210106160420.png)







## Mac安装nginx



**先查看是否已经有nginx**

```shell
brew search nginx
```



**安装nginx**

```
brew install nginx
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210429175700.png)

主页的文件在 `/usr/local/var/www`  文件夹下
对应的配置文件地址在 `/usr/local/etc/nginx/nginx.conf`



## Nginx 命令

```shell
nginx -s reopen #重启Nginx
nginx -s reload #重新加载Nginx配置文件，然后以优雅的方式重启Nginx
nginx -s stop #强制停止Nginx服务
nginx -s quit #优雅地停止Nginx服务（即处理完所有请求后再停止服务）
nginx -?,-h #打开帮助信息
nginx -v #显示版本信息并退出
nginx -V #显示版本和配置选项信息，然后退出
nginx -t #检测配置文件是否有语法错误，然后退出
nginx -T #检测配置文件是否有语法错误，转储并退出
nginx -q #在检测配置文件期间屏蔽非错误信息
nginx -p prefix #设置前缀路径(默认是:/usr/share/nginx/)nginx -c filename #设置配置文件(默认是:/etc/nginx/nginx.conf)
nginx -g directives #设置配置文件外的全局指令
killall nginx #杀死所有nginx进程
```





## Nginx 配置语法

`nginx.conf` 结构图概括：

```
main        # 全局配置，对全局生效
├── events  # 配置影响 Nginx 服务器或与用户的网络连接
├── http    # 配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置
│   ├── upstream # 配置后端服务器具体地址，负载均衡配置不可或缺的部分
│   ├── server   # 配置虚拟主机的相关参数，一个 http 块中可以有多个 server 块
│   ├── server
│   │   ├── location  # server 块可以包含多个 location 块，location 指令用于匹配 uri
│   │   ├── location
│   │   └── ...
│   └── ...
└── ...
```

配置文件的语法规则：

1. 配置文件由指令与指令块构成；

2. 每条指令以 `;` 分号结尾，指令与参数间以空格符号分隔；
3. 指令块以 `{}` 大括号将多条指令组织在一起；
4. `include` 语句允许组合多个配置文件以提升可维护性；
5. 使用 `#` 符号添加注释，提高可读性；
6. 使用 `$` 符号使用变量；
7. 部分指令的参数支持正则表达式；



#### 典型配置

```shell
user  nginx;                        # 运行用户，默认即是nginx，可以不进行设置
worker_processes  1;                # Nginx 进程数，一般设置为和 CPU 核数一样
error_log  /var/log/nginx/error.log warn;   # Nginx 的错误日志存放目录
pid        /var/run/nginx.pid;      # Nginx 服务启动时的 pid 存放位置

events {
    use epoll;     # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)
    worker_connections 1024;   # 每个进程允许最大并发数
}

http {   # 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
    # 设置日志模式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;   # Nginx访问日志存放位置

    sendfile            on;   # 开启高效传输模式
    tcp_nopush          on;   # 减少网络报文段的数量
    tcp_nodelay         on;
    keepalive_timeout   65;   # 保持连接的时间，也叫超时时间，单位秒
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;      # 文件扩展名与类型映射表
    default_type        application/octet-stream;   # 默认文件类型

    include /etc/nginx/conf.d/*.conf;   # 加载子配置项
    
    server {
    	listen       80;       # 配置监听的端口
    	server_name  localhost;    # 配置的域名
    	
    	location / {
    		root   /usr/share/nginx/html;  # 网站根目录
    		index  index.html index.htm;   # 默认首页文件
    		deny 172.168.22.11;   # 禁止访问的ip地址，可以为all
    		allow 172.168.33.44； # 允许访问的ip地址，可以为all
    	}
    	
    	error_page 500 502 503 504 /50x.html;  # 默认50x对应的访问页面
    	error_page 400 404 error.html;   # 同上
    }
}
```



#### 全局变量

|    全局变量名    |                             功能                             |
| :--------------: | :----------------------------------------------------------: |
|      $host       | 请求信息中的Host，如果请求中没有Host行，则等于设置的服务器名，不包含端口 |
| $request_method  |                客户端请求类型，例如GET、POST                 |
|   $remote_addr   |                        客户端的IP地址                        |
|      $args       |                         请求中的参数                         |
|  $arg_PARAMETER  | GET请求中变量名PARAMETER参数的值，例如：`$http_user_agent`(Uaer-Agent 值), `$http_referer`... |
| $content_length  |               请求头中的 `Content-length` 字段               |
| $http_user_agent |                       客户端agent信息                        |
|   $http_cookie   |                       客户端cookie信息                       |
|   $remote_addr   |                        客户端的IP地址                        |
|   $remote_port   |                         客户端的端口                         |
| $http_user_agent |                       客户端agent信息                        |
| $server_protocol |          请求使用的协议，如 `HTTP/1.0`、`HTTP/1.1`           |
|   $server_addr   |                          服务器地址                          |
|   $server_name   |                          服务器名称                          |
|   $server_port   |                        服务器的端口号                        |
|     $scheme      |                  HTTP 方法（如http，https）                  |





## 设置二级域名虚拟主机

假设自己有一个二级域名 `music.2ephyr.com` ，则在外网访问 `music.2ephyr.com` 可以访问到服务器

则在配置文件中位置以下内容：

```shell
# /etc/nginx/conf.d/fe.sherlocked93.club.conf

server {
  listen 80;
	server_name fe.sherlocked93.club;

	location / {
		root  /usr/share/nginx/html/fe;
		index index.html;
	}
}
```

随后在 `usr/share/nginx/html`文件夹下新建fe文件夹，新建文件index.html

在浏览器中输入 `music.2ephyr.com` 可以从二级域名访问到刚刚创建的文件





## 配置反向代理

反向代理是工作中最常用的服务器功能，经常被用来解决跨域问题

进入配置文件，配置默认网址重定向到Bilibili的`proxy_pass`：

```shell
server {
	listen 80;
	server_name *.2ephyr.com;
	
	location / {
		proxy_pass http://www.bilibili.com;
	}
}
```

保存退出后，`nginx -s reload` 重新加载配置文件，进入默认网址就可以直接跳转B站了，实现了一个简单的代理

实际使用中，可以将请求转发到本机另一个服务器上，也可以根据访问的路径跳转到不同端口的服务中。

比如我们监听9001端口，然后把访问不同路径的请求进行反向代理；

1. 把访问 `http://127.0.0.1:9001/edu` 的请求转发到 `http://127.0.0.1:8080`
2. 把访问 `http://127.0.0.1:9001/vod ` 的请求转发到 `http://127.0.0.1:8081`

```shell
server {
  listen 9001;
  server_name *.sherlocked93.club;

  location ~ /edu/ {
    proxy_pass http://127.0.0.1:8080;
  }
  
  location ~ /vod/ {
    proxy_pass http://127.0.0.1:8081;
  }
}
```

反向代理还有一些其他的指令：

1. `proxy_set_header`：在将客户端请求发送给后端服务器之前，更改来自客户端的请求头信息。
2. `proxy_connect_timeout`：配置Nginx与后端代理服务器尝试建立连接的超时时间。
3. `proxy_read_timeout`：配置Nginx向后端服务器组发出read请求后，等待相应的超时时间。
4. `proxy_send_timeout`：配置Nginx向后端服务器组发出write请求后，等待相应的超时时间。
5. `proxy_redirect`：用于修改后端服务器返回的响应头中的Location和Refresh。





## 跨域CORS配置



### 使用反向代理解决跨域

在前端服务地址为 `music.2ephyr.com` 的页面请求 `api.2ephyr.com` 的后端服务导致的跨域，可以这样配置：

```shell
server {
  listen 9001;
  server_name music.2ephyr.com;

  location / {
    proxy_pass api.2ephyr.com;
  }
}
```

这样就将对 `music.2ephyr.com` 的请求全都代理到了 `api.2ephyr.com`，前端的请求都被服务器代理到了后端地址下，绕过了跨域。

这里对静态文件的请求和后端服务的请求都以 `music.2ephyr.com` 开始，不易区分。所以为了实现对后端服务请求的统一转发，通常我们会约定对后端服务的请求加上 `/apis/` 前缀或者其他的 `path` 来和对静态资源的请求加以区分，此时可以这样配置：

```shell
# 请求跨域，约定代理后端服务请求path以/apis/开头
location ^~/apis/ {
    # 这里重写了请求，将正则匹配中的第一个分组的path拼接到真正的请求后面，并用break停止后续匹配
    rewrite ^/apis/(.*)$ /$1 break;
    proxy_pass be.sherlocked93.club;
  
    # 两个域名之间cookie的传递与回写
    proxy_cookie_domain be.sherlocked93.club fe.sherlocked93.club;
}
```



### 配置 header 解决跨域

当浏览器在访问跨源的服务器时，也可以在跨域的服务器上直接设置 Nginx

当 `music.2ephyr.com` 访问 `api.2ephyr.com` 产生跨域问题时

在 `/etc/nginx/conf.d/` 文件夹中新建一个配置文件，对应二级域名  `api.2ephyr.com` ：

```sh
# /etc/nginx/conf.d/api.2ephyr.com.conf

server {
  listen       80;
  server_name  api.2ephyr.com;
  
	add_header 'Access-Control-Allow-Origin' $http_origin;   # 全局变量获得当前请求origin，带cookie的请求不支持*
	add_header 'Access-Control-Allow-Credentials' 'true';    # 为 true 可带上 cookie
	add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';  # 允许请求方法
	add_header 'Access-Control-Allow-Headers' $http_access_control_request_headers;  # 允许请求的 header，可以为 *
	add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
	
  if ($request_method = 'OPTIONS') {
		add_header 'Access-Control-Max-Age' 1728000;   # OPTIONS 请求的有效期，在有效期内不用发出另一条预检请求
		add_header 'Content-Type' 'text/plain; charset=utf-8';
		add_header 'Content-Length' 0;
    
		return 204;                  # 200 也可以
	}
  
	location / {
		root  /usr/share/nginx/html/be;
		index index.html;
	}
}
```





## 开启gzip压缩

使用 `gzip` 不仅需要 Nginx 配置，浏览器端也需要配合，需要在请求消息头中包含 `Accept-Encoding: gzip`，一般在请求 html 和 css 等静态资源的时候，支持的浏览器在 request 请求静态资源的时候，会加上 `Accept-Encoding: gzip` 这个 header，表示自己支持 gzip 的压缩方式，Nginx 在拿到这个请求的时候，如果有相应配置，就会返回经过 gzip 压缩过的文件给浏览器，并在 response 相应的时候加上 `content-encoding: gzip` 来告诉浏览器自己采用的压缩方式（因为浏览器在传给服务器的时候一般还告诉服务器自己支持好几种压缩方式），浏览器拿到压缩的文件后，根据自己的解压方式进行解析。

在 `/etc/nginx/conf.d/` 文件夹中新建配置文件 `gzip.conf` ：

```shell
# /etc/nginx/conf.d/gzip.conf

gzip on; # 默认off，是否开启gzip
gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;

# 上面两个开启基本就能跑起了，下面的愿意折腾就了解一下
gzip_static on;
gzip_proxied any;
gzip_vary on;
gzip_comp_level 6;
gzip_buffers 16 8k;
# gzip_min_length 1k;
gzip_http_version 1.1;
```



**参数意义：**

- **gzip_types**：要采用 gzip 压缩的 MIME 文件类型，其中 text/html 被系统强制启用；
- **gzip_static**：默认 off，该模块启用后，Nginx 首先检查是否存在请求静态文件的 gz 结尾的文件，如果有则直接返回该 `.gz` 文件内容；
- **gzip_proxied**：默认 off，nginx做为反向代理时启用，用于设置启用或禁用从代理服务器上收到相应内容 gzip 压缩；
- **gzip_vary**：用于在响应消息头中添加 `Vary：Accept-Encoding`，使代理服务器根据请求头中的 `Accept-Encoding` 识别是否启用 gzip 压缩；
- **gzip_comp_level**：gzip 压缩比，压缩级别是 1-9，1 压缩级别最低，9 最高，级别越高压缩率越大，压缩时间越长，建议 4-6；
- **gzip_buffers**：获取多少内存用于缓存压缩结果，16 8k 表示以 8k*16 为单位获得；
- **gzip_min_length**：允许压缩的页面最小字节数，页面字节数从header头中的 `Content-Length` 中进行获取。默认值是 0，不管页面多大都压缩。建议设置成大于 1k 的字节数，小于 1k 可能会越压越大；
- **gzip_http_version**：默认 1.1，启用 gzip 所需的 HTTP 最低版本；



> 注意了，一般 gzip 的配置建议加上 `gzip_min_length 1k`，不加的话：如果文件太小，gzip 压缩之后得到了 -48% 的体积优化，压缩之后体积还比压缩之前体积大了，所以最好设置低于 `1kb` 的文件就不要 gzip 压缩了





## 配置负载均衡

主要思想就是把负载均匀合理地分发到多个服务器上，实现压力分流的目的。

主要配置如下：

```shell
http {
  upstream myserver {
  	# ip_hash;  # ip_hash 方式
    # fair;   # fair 方式
    server 127.0.0.1:8081;  # 负载均衡目的服务地址
    server 127.0.0.1:8080;
    server 127.0.0.1:8082 weight=10;  # weight 方式，不写默认为 1
  }
 
  server {
    location / {
    	proxy_pass http://myserver;
      proxy_connect_timeout 10;
    }
  }
}
复制代码
```

Nginx 提供了好几种分配方式，默认为**轮询**，就是轮流来。有以下几种分配方式：

1. **轮询**，默认方式，每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务挂了，能自动剔除；
2. **weight**，权重分配，指定轮询几率，权重越高，在被访问的概率越大，用于后端服务器性能不均的情况；
3. **ip_hash**，每个请求按访问 IP 的 hash 结果分配，这样每个访客固定访问一个后端服务器，可以解决动态网页 session 共享问题。负载均衡每次请求都会重新定位到服务器集群中的某一个，那么已经登录某一个服务器的用户再重新定位到另一个服务器，其登录信息将会丢失，这样显然是不妥的；
4. **fair**（第三方），按后端服务器的响应时间分配，响应时间短的优先分配，依赖第三方插件 nginx-upstream-fair，需要先安装；





## 适配 PC 或移动设备

根据用户设备不同返回不同样式的站点，以前经常使用的是纯前端的自适应布局，但无论是复杂性和易用性上面还是不如分开编写的好，常见的淘宝、京东这些大型网站就都没有采用自适应，而是用分开制作的方式，根据用户请求的 `user-agent` 来判断是返回 PC 还是 H5 站点。

首先在 `/usr/share/nginx/html` 文件夹下 `mkdir` 分别新建两个文件夹 `PC` 和 `mobile`，`vim` 编辑两个 `index.html` 随便写点内容。

```
cd /usr/share/nginx/html
mkdir pc mobile
cd pc
vim index.html   # 随便写点比如 hello pc!
cd ../mobile
vim index.html   # 随便写点比如 hello mobile!
```

然后和设置二级域名虚拟主机时候一样，去 `/etc/nginx/conf.d` 文件夹下新建一个配置文件 `music.2ephyr.com.conf` ：

```
# /etc/nginx/conf.d/fe.sherlocked93.club.conf

server {
  listen 80;
	server_name fe.sherlocked93.club;

	location / {
		root  /usr/share/nginx/html/pc;
    if ($http_user_agent ~* '(Android|webOS|iPhone|iPod|BlackBerry)') {
      root /usr/share/nginx/html/mobile;
    }
		index index.html;
	}
}
```

配置基本没什么不一样的，主要多了一个 `if` 语句，然后使用 `$http_user_agent` 全局变量来判断用户请求的 `user-agent`，指向不同的 root 路径，返回对应站点。





## 配置HTTPS

在云上申请HTTPS证书，获取`xxx.crt` 和 `xxx.key` 文件，配置：

```shell
server {
  listen 443 ssl http2 default_server;   # SSL 访问端口号为 443
  server_name 2ephyr.com;         # 填写绑定证书的域名

  ssl_certificate /etc/nginx/https/1_sherlocked93.club_bundle.crt;   # 证书文件地址
  ssl_certificate_key /etc/nginx/https/2_sherlocked93.club.key;      # 私钥文件地址
  ssl_session_timeout 10m;

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;      #请按照以下协议配置
  ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE; 
  ssl_prefer_server_ciphers on;
  
  location / {
    root         /usr/share/nginx/html;
    index        index.html index.htm;
  }
}
```

写完 `nginx -t -q` 校验一下，没问题就 `nginx -s reload`，现在去访问`https://2ephyr.com`

一般还可以加上几个增强安全性的命令：

```
add_header X-Frame-Options DENY;           # 减少点击劫持
add_header X-Content-Type-Options nosniff; # 禁止服务器自动解析资源类型
add_header X-Xss-Protection 1;             # 防XSS攻击
```





## 常用技巧
### 静态服务

```shell
server {
  listen       80;
  server_name  static.2ephyr.com;
  charset utf-8;    # 防止中文文件名乱码

  location /download {
    alias	          /usr/share/nginx/html/static;  # 静态资源目录
    
    autoindex               on;    # 开启静态资源列目录
    autoindex_exact_size    off;   # on(默认)显示文件的确切大小，单位是byte；off显示文件大概大小，单位KB、MB、GB
    autoindex_localtime     off;   # off(默认)时显示的文件时间为GMT时间；on显示的文件时间为服务器时间
  }
}
```



### 图片防盗链

```shell
server {
  listen       80;        
  server_name  *.2ephyr.com;
  
  # 图片防盗链
  location ~* \.(gif|jpg|jpeg|png|bmp|swf)$ {
    valid_referers none blocked server_names ~\.google\. ~\.baidu\. *.qq.com;  # 只允许本机 IP 外链引用，感谢 @木法传 的提醒，将百度和谷歌也加入白名单
    if ($invalid_referer){
      return 403;
    }
  }
}
```



### 请求过滤

```shell
# 非指定请求全返回 403
if ( $request_method !~ ^(GET|POST|HEAD)$ ) {
  return 403;
}

location / {
  # IP访问限制（只允许IP是 192.168.0.2 机器访问）
  allow 192.168.0.2;
  deny all;
  
  root   html;
  index  index.html index.htm;
}
```



### 配置图片、字体等静态文件缓存

由于图片、字体、音频、视频等静态文件在打包的时候通常会增加了 hash，所以缓存可以设置的长一点，先设置强制缓存，再设置协商缓存；如果存在没有 hash 值的静态文件，建议不设置强制缓存，仅通过协商缓存判断是否需要使用缓存。

```shell
# 图片缓存时间设置
location ~ .*\.(css|js|jpg|png|gif|swf|woff|woff2|eot|svg|ttf|otf|mp3|m4a|aac|txt)$ {
	expires 10d;
}

# 如果不希望缓存
expires -1;
```



### 单页面项目 history 路由配置

```shell
server {
  listen       80;
  server_name  music.2ephyr.com;
  
  location / {
    root       /usr/share/nginx/html/dist;  # vue 打包后的文件夹
    index      index.html index.htm;
    try_files  $uri $uri/ /index.html @rewrites;  
    
    expires -1;                          # 首页一般没有强制缓存
    add_header Cache-Control no-cache;
  }
  
  # 接口转发，如果需要的话
  #location ~ ^/api {
  #  proxy_pass http://api.2ephyr.com;
  #}
  
  location @rewrites {
    rewrite ^(.+)$ /index.html break;
  }
}
```



### HTTP 请求转发到 HTTPS

配置完 HTTPS 后，浏览器还是可以访问 HTTP 的地址 `http://2ephyr.com/` 的，可以做一个 301 跳转，把对应域名的 HTTP 请求重定向到 HTTPS 上

```shell
server {
    listen      80;
    server_name www.2ephyr.com;

    # 单域名重定向
    if ($host = 'www.2ephyr.com'){
        return 301 https://www.2ephyr.com$request_uri;
    }
    # 全局非 https 协议时重定向
    if ($scheme != 'https') {
        return 301 https://$server_name$request_uri;
    }

    # 或者全部重定向
    return 301 https://$server_name$request_uri;

    # 以上配置选择自己需要的即可，不用全部加
}
```



### 泛域名路径分离

这是一个非常实用的技能，经常有时候我们可能需要配置一些二级或者三级域名，希望通过 Nginx 自动指向对应目录，比如：

1. `test1.doc.2ephyr.com` 自动指向 `/usr/share/nginx/html/doc/test1` 服务器地址；
2. `test2.doc.2ephyr.com` 自动指向 `/usr/share/nginx/html/doc/test2` 服务器地址；

```
server {
    listen       80;
    server_name  ~^([\w-]+)\.doc\.2ephyr\.com$;

    root /usr/share/nginx/html/doc/$1;
}
复制代码
```



### 泛域名转发

和之前的功能类似，有时候我们希望把二级或者三级域名链接重写到我们希望的路径，让后端就可以根据路由解析不同的规则：

1. `test1.serv.2ephyr.com/api?name=a` 自动转发到 `127.0.0.1:8080/test1/api?name=a`；
2. `test2.serv.2ephyr.com/api?name=a` 自动转发到 `127.0.0.1:8080/test2/api?name=a` ；

```
server {
    listen       80;
    server_name ~^([\w-]+)\.serv\.2ephyr\.com$;

    location / {
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        Host $http_host;
        proxy_set_header        X-NginX-Proxy true;
        proxy_pass              http://127.0.0.1:8080/$1$request_uri;
    }
}
```





## 最佳实践

1. 为了使 Nginx 配置更易于维护，建议为每个服务创建一个单独的配置文件，存储在 `/etc/nginx/conf.d` 目录，根据需求可以创建任意多个独立的配置文件。
2. 独立的配置文件，建议遵循以下命名约定 `<服务>.conf`，比如域名是 `sherlocked93.club`，那么你的配置文件的应该是这样的 `/etc/nginx/conf.d/sherlocked93.club.conf`，如果部署多个服务，也可以在文件名中加上 Nginx 转发的端口号，比如 `sherlocked93.club.8080.conf`，如果是二级域名，建议也都加上 `fe.sherlocked93.club.conf`。
3. 常用的、复用频率比较高的配置可以放到 `/etc/nginx/snippets` 文件夹，在 Nginx 的配置文件中需要用到的位置 include 进去，以功能来命名，并在每个 snippet 配置文件的开头注释标明主要功能和引入位置，方便管理。比如之前的 `gzip`、`cors` 等常用配置，我都设置了 snippet。
4. Nginx 日志相关目录，内以 `域名.type.log` 命名（比如 `be.sherlocked93.club.access.log` 和 `be.sherlocked93.club.error.log` ）位于 `/var/log/nginx/` 目录中，为每个独立的服务配置不同的访问权限和错误日志文件，这样查找错误时，会更加方便快捷。


## 参考
[Nginx 从入门到实践，万字详解！](https://juejin.cn/post/6844904144235413512#heading-38)




