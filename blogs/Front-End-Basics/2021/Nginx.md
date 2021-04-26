---
title: Nginx基础
date: 2021-03-12
tags:
 - 前端
 - 基础
categories: 
 - Front-End-Basics
---

## Nginx

### 1. 反向代理

**反向代理:客户端 一>代理 <一> 服务端**



#### 定义

Nginx根据接收到的请求的端口，域名，url，将请求转发给不同的机器，不同的端口（或直接返回结果），然后将返回的数据返回给客户端。



#### 例子

A（客户端）想租一个房子，B（代理）将多栋房子中的其中一栋房子租给了A，

这时候实际上被租出去的这栋房子的房东是C（服务端）

这个过程中A（客户端）并不知道这个房子到底谁才是房东

他都有可能认为这个房子就是B（代理）的



#### 反向代理特点

- Nginx没有自己的地址，它的地址就是服务器的地址，如www.baidu.com，对外部来讲，它就是数据的生产者。
- Ngxin明确的知道应该去哪个服务器获取数据（在未接收到请求之前，已经确定应该连接哪台服务器）



### 2. 正向代理



#### 定义

所谓正向代理就是顺着请求的方向进行的代理，即**代理服务器**他是由你配置为你服务，去请求目标**服务器**地址。正向代理最大的特点是**客户端**非常明确要访问的

务器地址；**服务器**只清楚请求来自哪个**代理服务器**，而不清楚来自哪个具体的**客户端**；正向代理模式屏蔽或者隐藏了**真实客户端**信息。



#### 例子

A（客户端）想租C（服务端）的房子,但是A（客户端）并不认识C（服务端）所以租不到。

但B（代理）认识C（服务端）能租这个房子，于是A（客户端）找了B（代理）帮忙租到了这个房子。

这个过程中C（服务端）不认识A（客户端）只认识B（代理）

C（服务端）并不知道A（客户端）租了房子，只知道房子租给了B（代理）。



![正反向代理](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210106160420.png)





### 3. Nginx 应用场景

1. **http服务器**

   Nginx是一个http服务可以独立提供http服务。可以做网页静态服务器。

   

2. **虚拟主机。可以实现在一台服务器虚拟出多个网站。例如个人网站使用的虚拟主机。**

   - 基于端口的，不同的端口

   - 基于域名的，不同域名

     

3. **反向代理，负载均衡**。

   当网站的访问量达到一定程度后，单台服务器不能满足用户的请求时，需要用多台服务器集群可以使用nginx做反向代理。并且多台服务器可以平均分担负载，不会因为某台服务器负载高宕机而某台服务器闲置的情况。



### 4. 命令

```
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



 ### 5. 虚拟主机管理

#### 基础配置

```Shell
复制代码
#user  nobody;

#==工作进程数，一般设置为cpu核心数
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {

    #==最大连接数，一般设置为cpu*2048
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    
    #==客户端链接超时时间
    keepalive_timeout  65;

    #gzip  on;

    #当配置多个server节点时，默认server names的缓存区大小就不够了，需要手动设置大一点
    server_names_hash_bucket_size 512;

    #server表示虚拟主机可以理解为一个站点，可以配置多个server节点搭建多个站点
    #每一个请求进来确定使用哪个server由server_name确定
    server {
        #站点监听端口
        listen       8800;
        #站点访问域名
        server_name  localhost;
        
        #编码格式，避免url参数乱码
        charset utf-8;

        #access_log  logs/host.access.log  main;

        #location用来匹配同一域名下多个URI的访问规则
        #比如动态资源如何跳转，静态资源如何跳转等
        #location后面跟着的/代表匹配规则
        location / {
            #站点根目录，可以是相对路径，也可以使绝对路径
            root   html;
            #默认主页
            index  index.html index.htm;
            
            #转发后端站点地址，一般用于做软负载，轮询后端服务器
            #proxy_pass http://10.11.12.237:8080;

            #拒绝请求，返回403，一般用于某些目录禁止访问
            #deny all;
            
            #允许请求
            #allow all;
            
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
            #重新定义或者添加发往后端服务器的请求头
            #给请求头中添加客户请求主机名
            proxy_set_header Host $host;
            #给请求头中添加客户端IP
            proxy_set_header X-Real-IP $remote_addr;
            #将$remote_addr变量值添加在客户端“X-Forwarded-For”请求头的后面，并以逗号分隔。 如果客户端请求未携带“X-Forwarded-For”请求头，$proxy_add_x_forwarded_for变量值将与$remote_addr变量相同  
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            #给请求头中添加客户端的Cookie
            proxy_set_header Cookie $http_cookie;
            #将使用代理服务器的主域名和端口号来替换。如果端口是80，可以不加。
            proxy_redirect off;
            
            #浏览器对 Cookie 有很多限制，如果 Cookie 的 Domain 部分与当前页面的 Domain 不匹配就无法写入。
            #所以如果请求 A 域名，服务器 proxy_pass 到 B 域名，然后 B 服务器输出 Domian=B 的 Cookie，
            #前端的页面依然停留在 A 域名上，于是浏览器就无法将 Cookie 写入。
            
　　         #不仅是域名，浏览器对 Path 也有限制。我们经常会 proxy_pass 到目标服务器的某个 Path 下，
            #不把这个 Path 暴露给浏览器。这时候如果目标服务器的 Cookie 写死了 Path 也会出现 Cookie 无法写入的问题。
            
            #设置“Set-Cookie”响应头中的domain属性的替换文本，其值可以为一个字符串、正则表达式的模式或一个引用的变量
            #转发后端服务器如果需要Cookie则需要将cookie domain也进行转换，否则前端域名与后端域名不一致cookie就会无法存取
　　　　　　  #配置规则：proxy_cookie_domain serverDomain(后端服务器域) nginxDomain(nginx服务器域)
            proxy_cookie_domain localhost .testcaigou800.com;
            
            #取消当前配置级别的所有proxy_cookie_domain指令
            #proxy_cookie_domain off;
            #与后端服务器建立连接的超时时间。一般不可能大于75秒；
            proxy_connect_timeout 30;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

    }
    
　　#当需要对同一端口监听多个域名时，使用如下配置，端口相同域名不同，server_name也可以使用正则进行配置
　　#但要注意server过多需要手动扩大server_names_hash_bucket_size缓存区大小
　　server {
　　　　listen 80;
　　　　server_name www.abc.com;
　　　　charset utf-8;
　　　　location / {
　　　　　　proxy_pass http://localhost:10001;
　　　　}
　　}
　　server {
　　　　listen 80;
　　　　server_name aaa.abc.com;
　　　　charset utf-8;
　　　　location / {
　　　　　　proxy_pass http://localhost:20002;
　　　　}
　　}
}
```



#### 基于域名与端口的虚拟主机



##### 基于域名

```bash
# 基于域名的虚拟主机配置
# 域名为 domain.cm
server {
    server_name domain.cm *.domain.cm www.domain.*;
    root html;
    index index.html index.htm /index.php;
}

# 域名为 domain.cn
server {
    server_name domain.cn;
    root /var/web/;
    index index.html;
}
```

- `server_name` 指定虚拟主机的名字。可以指定多个名称，第一个为虚拟主机的名字。可以使用  `*` 替代服务器名称的开始或者最后部分。

- `root` 设置请求的根目录，可以用绝对路径或相对路径，如 `root html;` 会等于 `root /usr/local/nginx/html;` 。而这样设置，当收到一个 domain.cm/index.html 请求时，`/usr/local/nginx/html/index.html `文件将会被发送在响应中响应该请求。

- `index` 定义将用做索引的文件。文件名称可以包含变量，按照指定的顺序进行文件检查的，最后一个参数可以是绝对路径。实际上 domain.cm 请求会被处理成 domain.cm/index.html

  

基于域名的虚拟主机配置，指定了虚拟主机名称、请求根目录和索引。在 nginx 配置文件中添加如上配置（添加 `http {}` 中）保存、重新加载配置文件 （ `systemctl reload nginx` ），这里使用虚拟机测试，需要在物理机的 hosts 文件中修改配置，**例子如下** ：



```bash
server {  
    #监听端口 8800  
    listen 8800;   
                                
    #监听域名abc.com;  
    server_name abc.com;
          
    location / {              
        # 相对路径，相对nginx根目录。  
        root    abc;  
            
        # 默认跳转到index.html页面  
        index index.html;                 
    }  
} 
```

新建 `index.html `文件：`vi .../nginx/abc/index.html` ，文件内容：

```html
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body>
     <h2>基于域名的虚拟主机-index</h2>
  </body>
</html>
```

重启nginx（nginx -s reload）服务，配置windows本机host：

![image-20210106174414277](C:\Users\Admin\AppData\Roaming\Typora\typora-user-images\image-20210106174414277.png)

在浏览器访问 http://abc.com:8800 即可：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210106175710.png)