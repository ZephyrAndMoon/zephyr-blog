---
title: Nginx 基础
date: 2021-10.13
tags:
 - 前端
 - 工具
categories: 
 - Front-End-Basics
---

# 简介

## 特点

- 开发时效率极高
- 开箱即用，功能完备
- 社区丰富，兼容rollup
- 超高速热重载
- 预设应用和类库打包模式
- 前端类库无关



## 目标

- 使用简单
- 快
- 便于扩展



## 区别

- High Level API
- 不包含自己的编译能力，使用rollup、esbuild
- 完全基于ESM加载方式的开发时

## 优势

- 上手非常简单
- 开发效率极高
- 社区成本低（兼容rollup插件）

**类比 create-react-app 和 vue-cli**

- cra需要eject
- vue-cli的configureWebpack和chainWebpack



# 基础应用

## Vite 中静态文件处理



### 写在前面

> Vite 提供了几个 import 参数，帮助我们引入资源 

- url：返回当前导入资源的路径

- raw：返回当前导入资源的内容

- worker / worker inline：见下方引入 web worker

  



### 引入图片

> Vite 中已经处理好了图片的加载

```jsx
import { defineComponent } from "vue";

import logo from "./assets/logo.png";

export default defineComponent({
  setup() {
    return () => {
      return (
        <>
          <div>hello Vue3 JSX</div>
          <img src={logo}></img>
        </>
      );
    };
  },
});
```



### 引入 web worker

> 新开一个线程帮助处理耗时阻塞的任务

创建 web worker 文件

```javascript
// worker.js

var i = 0
function timedCount(){
  i = i+1
  postMessage(i);
  setTimeout(timedCount, 500)
}

timedCount()
```

在 main.js 中引入并接收信息

```javascript
import Worker from 'workder?worker'

const worker = new Worker()
worker.onmessage = function(e){
  console.log(e.data)
}
```



### m引入 JSON

> Vite 中已经处理好了 JSON 的加载

创建 pkg.json 文件

```json
{
	"version":"1.0.0",
	"author":"zephyr"
}
```

```javascript
import pkg from 'pkg.json'
console.log(pkg)
/*
	{
		version:"1.0.0",
		author:"zephyr"
	}
*/

import { author } from 'pkg.json'
console.log(author)

// zephyr
```



## Vite 中集成 eslint 和 prettier



### 集成 eslint

创建 .eslintrc.js 文件

例如：

```bash
yarn add eslint-config-standard eslint-plugin-import eslint-plugin-promise eslint-plugin-node -D
```

```js
module.exports = {
	extends: "standard",
}
```

在 package.json 中配置

```json
{
	"script":{
		"lint": "eslint --ext js 目录"
	}
}
```

通过 `npm run lint` 进行项目中 Javascirpt 文件的 eslint 校验



### 集成 prettier

安装 prettier 插件

创建 .prettierrc 文件

```
{
	"semi": false,
	"singleQuote": true
}
```

打开 setting 搜索  format on save 勾上选项

打开 setting 搜索  formatter 选择 Prettier 进行格式化

配置完成以后，在文件保存之后会自动根据 eslint 的配置规则进行文件的格式化



## Vite 中的环境变量

> import.mate.env (Production 环境不存在该对象 )

在目录下创建一个 .env 文件

```
VITE_TITLE = Hello
```

```javascript
console.log(import.mate.env.VITE_TITLE)
// Hello
```

`.env.production` 会在生产环境被用到

`.env.development` 会在开发环境被用到

`.env.development.local` 会在本地开发环境被用到

通过 `vite --mode test` 可以指定用到的 `env` 文件后缀为 `test`，例如：`.env.test` 



# 高级应用



## 热更新

简单编写，没有特定类型只有一个主函数的热更新

```javascript
import "./style.css";

export function render() {
  document.querySelector("#app").innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
}

render();

// 在 production (build) 中没有这个变量
if (import.meta.hot) {
  // 代表我接收了模块的更新
  import.meta.hot.accept((newModule) => {
    newModule.render();
  });
}
```



## glob import

> 引入某一个路径（可使用正则）下的所有文件

```javascript
const globModules = import.meta.glob('./test/*')
// import.meta.globEager 一开始就把代码编译进来
console.log(globModules) 
// 打印出以该目录下所有文件名为键, import 函数为值 的对象
  
Object.entries(globModules).forEach([k,v]=>{
  v().then(m => console.log(m.default))
  // m.default 为导入模块的内容
})
```



## 预编译

> 第一次启动把依赖的模块包进行编译，放进 cache，之后用到就从 cache 里面取

把非 ESmodule 的文件转换成 ESM



## nodeJs 服务中集成 vite



### Dev WebServer

```javascript
const express = require("express")

const app = express()

const {createServer:createViteServer} = require('vite')

// 是一个异步的过程  调用该方法就等于启动了服务
createViteServer({
  server: {
    /*
    	html: 将启用 Vite 自身的 HTML 服务逻辑
    	ssr: 将禁用 Vite 自身的 HTML 服务逻辑，因此你应该手动为 index.html 提供服务
    */
    middlewareMode:"html"
  }
}).then((vite)=>{
  // 获取实例
  app.use(vite.middlewares)
  
  app.use('*',()=>{
    // ssr 处理逻辑
  })
  
  app.listen(4000)
});
```



### 开发环境中 ssr

```javascript
app.use('*', async (req, res) => {
  const url = req.originalUrl

  try {
    // 1. 读取 index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8'
    )

    // 2. 应用 vite HTML 转换。这将会注入 vite HMR 客户端，and
    //    同时也会从 Vite 插件应用 HTML 转换。
    //    例如：@vitejs/plugin-react-refresh 中的 global preambles
    template = await vite.transformIndexHtml(url, template)

    // 3. 加载服务器入口。vite.ssrLoadModule 将自动转换
    //    你的 ESM 源码将在 Node.js 也可用了！无需打包
    //    并提供类似 HMR 的根据情况随时失效。
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. 渲染应用的 HTML。这假设 entry-server.js 导出的 `render`
    //    函数调用了相应框架的 SSR API。
    //    例如 ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. 注入应用渲染的 HTML 到模板中。
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. 将渲染完成的 HTML 返回
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // 如果捕获到了一个错误，让 vite 来修复该堆栈，这样它就可以映射回
    // 你的实际源码中。
    vite.ssrFixStacktrace(e)
    console.error(e)
    res.status(500).end(e.message)
  }
})
```



### 正式环境中 ssr

1. 正常生成一个客户端构建；
2. 再生成一个 SSR 构建，可以通过 `require()` 直接加载因此我们无需再经过 Vite 的 `ssrLoadModule`；

修改 `package.json` 中的脚本：

```JSON
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js "
  }
}
```



# rollup 



## 介绍

- 开源类库优先选择
- 以ESM标准为目标的构建工具
- Tree Shaking 

