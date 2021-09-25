---
title: 前端错误捕获
date: 2021-08-31
tags:
  - 前端
categories:
  - Front-End-Basics
---

# 错误类型

## JavaScript 错误

### SyntaxError

> 解析时发生语法错误 `SyntaxError` 在构建阶段，甚至本地开发阶段就会被发现

```javascript
// 控制台运行
const xx,
```



### TypeError

> 情况一：变量或参数不是预期类型

```javascript
var a= new abc;
//Uncaught TypeError: abc is not a function
```

> 情况二：调用对象不存在的方法

```javascript
var b;
b.c();
//Uncaught TypeError: Cannot read property c of undefined
```



### ReferenceError

> 引用未生命的变量

```javascript
// 控制台运行
nodefined
```



### RangeError

> 当一个值不在其所允许的范围或者集合中

```javascript
(function fn ( ) { fn() })()
```



### URLError（URL错误）

> 与url相关函数参数不正确，主要是 `encodeURI()` 、 `decodeURI()` 、 `encodeURIComponent()` 、 `decodeURIComponent()` 、`escape()` 和 `unescape()` 这六个函数

```javascript
decodeURI('%2')
//Uncaught URIError: URI malformed
```



### EvalError（eval错误）

> `eval` 函数没有被正确执行

```javascript
eval(2b)
//Uncaught SyntaxError: Invalid or unexpected token
```



### 自定义错误

> 自定义错误，`throw new Error(msg)`。例如让一个函数需要传入一个字符串，但是传入了空值，可以 `new` 不同的错误类型，并自定义错误提示语来让系统抛出信息

```javascript
function check(string){
    if(!string){
        throw new Error("内容不存在");
        //throw new TypeError("内容不存在")
    }
}
```



## 网络错误



### ResourceError

> 资源加载错误

```javascript
new Image().src = '/remote/image/notdeinfed.png'
```



### HttpError

> `Http` 请求错误

```javascript
// 控制台运行
fetch('/remote/notdefined', {})
```



# 错误搜集方式



### try/catch

> 能捕获常规运行时错误，异步错误不行

```javascript
// 常规运行时错误，可以捕获 ✅
try {
  console.log(notdefined);
} catch(e) {
  console.log('捕获到异常：', e);
}

// 异步错误，不能捕获 ❌
try {
  setTimeout(() => {
    console.log(notdefined);
  }, 0)
} catch(e) {
  console.log('捕获到异常：',e);
}
```



### **window.onerror**

> 当 `JavaScript` 运行时错误发生时，`window` 会触发一个 `ErrorEvent` 接口的 `error`事件

```javascript
/**
* @param {String}  message    错误信息
* @param {String}  source    出错文件
* @param {Number}  lineno    行号
* @param {Number}  colno    列号
* @param {Object}  error  Error对象
*/
window.onerror = function(message, source, lineno, colno, error) {
   console.log('捕获到异常：', {message, source, lineno, colno, error});
}
```

**错误捕获情况：**

```javascript
window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到异常：',{message, source, lineno, colno, error});
}

// 常规运行时错误，可以捕获 ✅
console.log(notdefined);

// 异步错误，可以捕获 ✅
setTimeout(() => {
  console.log(notdefined);
}, 0)
```

```html
// 资源错误，不能捕获 ❌
<script>
  window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到异常：',{message, source, lineno, colno, error});
  return true;
}
</script>
<img src="https://yun.tuia.cn/image/kkk.png">
```



### **window.addEventListener('error')**

> 当一项资源（如图片或脚本）加载失败，加载资源的元素会触发一个 `Event` 接口的 `error` 事件，这些 `error` 事件不会向上冒泡到 `window`，但能被捕获。而 `window.onerror` 不能监测捕获。

```html
// 图片、script、css加载错误，都能被捕获 ✅
<script>
 /**
	* @param {Object}  error  Error对象
	*/
  window.addEventListener('error', (error) => {
     console.log('捕获到异常：', error);
  }, true)
</script>

<img src="https://yun.tuia.cn/image/kkk.png">
<script src="https://yun.tuia.cn/foundnull.js"></script>
<link href="https://yun.tuia.cn/foundnull.css" rel="stylesheet"/>

  
// new Image错误，不能捕获 ❌
<script>
  window.addEventListener('error', (error) => {
    console.log('捕获到异常：', error);
  }, true)
</script>
<script>
  new Image().src = 'https://yun.tuia.cn/image/lll.png'
</script>
```



### window.addEventListener("unhandledrejection")

> 以下三种其实归结为关于Promise的错误，可以通过unhandledrejection捕获

1. 普通的 `Promise` 错误

   ```javascript
   // try/catch 不能处理 JSON.parse 的错误，因为它在 Promise 中
   try {
     new Promise((resolve,reject) => { 
       JSON.parse('')
       resolve();
     })
   } catch(err) {
     console.error('in try catch', err)
   }
   ```

2. `async` 错误

   ```javascript
   const getJSON = async () => {
     throw new Error('inner error')
   }
   
   try {
       // try/catch不到　❌
       getJSON()
   } catch(err) {
       console.error('in try catch', err)
   }
   
   try {
       // 需要await，才能捕获到　✅
       await getJSON()
   } catch(err) {
       console.error('in try catch', err)
   }
   ```

3. `import chunk` 错误

   ```javascript
   // Promise catch方法
   import(/* webpackChunkName: "incentive" */'./index').then(module => {
       module.default()
   }).catch((err) => {
       console.error('in catch fn', err)
   })
   
   // await 方法，try catch
   try {
       const module = await import(/* webpackChunkName: "incentive" */'./index');
       module.default()
   } catch(err) {
       console.error('in try catch', err)
   }
   ```

**通过 `unhandledrejection` 捕获错误**

```javascript

/**
* 全局统一处理Promise
* @param {Object}  error  Error对象
*/
window.addEventListener("unhandledrejection", function(e){
  console.log('捕获到异常：', e);
});
```



### Vue.config.errorHandler

> 由于Vue会捕获所有Vue单文件组件或者Vue.extend继承的代码，所以在Vue里面出现的错误，并不会直接被window.onerror捕获，而是会抛给Vue.config.errorHandler。

```javascript
/**
* @param {Object}  error		Error对象
* @param {Object}  vm		错误对象Vue实例
* @param {String}  info		错误信息
*/
Vue.config.errorHandler = function (error, vm, info) {
  //自行处理
  ...
  // 全局捕获Vue错误，直接扔出给onerror处理
  setTimeout(() => {
    throw err
  })
}
```



# 错误信息搜集



## 错误信息格式

**本地运行错误堆栈信息**

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210825170053.png)



**打包文件错误堆栈信息**

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210825165907.png)





## 跨域问题

> 一般情况，如果出现 `Script error` 这样的错误，基本上可以确定是出现了跨域问题。
>
> ![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210825170807.png)



### 出现 Script error 的场景

- 调用远端的 `JavaScript` 的方法出错
- 远端 `JavaScript` 内部的事件出错



### 解决方法

1. 服务器配置 `Access-Control-Allow-Origin` 

2. 前端 `script` 加 `crossorigin` 

   ```javascript
   <script src="http://yun.tuia.cn/test.js" crossorigin></script>
   ```

3. 使用 ` try/catch` 包裹，将错误抛出

   ```html
   <!doctype html>
   <html>
   <head>
     <title>Test page in http://test.com</title>
   </head>
   <body>
     <script src="https://yun.dui88.com/tuia/cdn/remote/testerror.js"></script>
     <script>
     window.onerror = function (message, url, line, column, error) {
       console.log(message, url, line, column, error);
     }
   
     try {
       foo(); // 调用testerror.js中定义的foo方法
     } catch (e) {
       throw e;
     }
     </script>
   </body>
   </html>
   ```



###　两种场景下 try/catch 的封装



**第一种场景：调用远端的 `JavaScript` 的方法出错**

```javascript
// 远端 JavaScript 文件
function foo() {
	console.log(notundefined)
}

// 本地处理
function wrapErrors(fn) {
	// 不重复多次包裹执行函数
	if (!fn.__wrapped__) {
		fn.__wrapped__ = function () {
			try {
				return fn.apply(this, arguments)
			} catch (e) {
				throw e // 重新抛出异常
			}
		}
	}
	return fn.__wrapped__
}

wrapErrors(foo)() // foo是远端 JavaScript 的方法
```



**第二种场景：远端 `JavaScript` 内部的事件出错**

```javascript
// 远端 JavaScript 文件
window.addEventListener('scroll', function(e) {
  console.log(notdefined)
})

// 本地处理
const originAddEventListener = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = function (type, listener, options) {
	const wrappedListener = function (...args) {
		try {
			return listener.apply(this, args)
		} catch (err) {
			throw err
		}
	}
	return originAddEventListener.call(this, type, wrappedListener, options)
}
```



# 错误信息上报

## 通过 XHR 上报错误数据

```javascript
/**
 * 通过XHR上报数据
 * @private
 * @param {object} data 上报的数据
 */
_sendInfoByXHR(data) {
	try {
		var xhr = new XMLHttpRequest()
		xhr.open('POST', this.url, true)
		//xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.setRequestHeader('Content-Type', 'application/json')
		xhr.send(dataStr)
	} catch (error) {
		console.log('XHR请求异常', error)
	}
}
```



## 通过 Fetch 上报错误数据

```javascript
/**
 * 通过Fetch上报数据
 * @private
 * @param {object} data 上报的数据
 */
_sendInfoByFetch(data) {
	try {
		if (fetch && isFetch) {
			fetch(this.url, {
				headers: {
					'Content-Type': 'application/json',
				},
				method: 'POST',
				body: dataStr,
				mode: 'same-origin', // 告诉浏览器是同源，同源后浏览器不会进行预检请求
				keepalive: true,
			})
			return
		} else {
			console.warn('当前浏览器不支持fetch，采用默认方式XHR上报数据')
			this._sendInfoByXHR(data)
		}
	} catch (error) {
		console.log('fetch请求异常', error)
	}
}

```



## 通过 Beacon 上报错误数据

> data格式：[`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`ArrayBufferView`](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob), [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString), [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData), or [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

```javascript
/**
 * sendBeacon上报数据
 * @private
 * @param {object} data 上报的数据
 */
_sendInfoByNavigator(data) {
  const formData = new FormData()
	Object.keys(data).forEach(key => {
		formData.append(key, data[key])
	})
	navigator.sendBeacon && navigator.sendBeacon(this.url, formData)
}
```



## 通过 IMG 上报错误数据

```javascript
/**
 * 通过img上报数据
 * @private
 * @param {object} data 上报的数据
 */
_sendInfoByImg(data) {
	if (!this._checkUrl(this.url)) {
		console.log('上报信息url地址格式不正确,url=', this.url)
		return
	}
	try {
		var img = new Image()
		img.src =
			this.url +
			'?v=' +
			new Date().getTime() +
			'&' +
			this._formatParams(data)
	} catch (error) {
		console.log('img请求异常', error)
	}
}
```

**使用 IMG 上报数据原因：**

1. 能够完成 `HTTP` 请求
2. 触发` GET` 请求之后不需要获取和处理数据、服务器也不需要发送数据
3. 跨域友好
4. 执行过程无阻塞
5. 相比 `XMLHttpRequest` 对象发送 GET 请求，性能上更好
6. `Script` 标签有内存泄漏的风险 



#　解析项目报错位置



## 上传 SourceMap文件

> source-map 文件是在打包阶段生产出来的，可以设计一个webpack插件来完成这个工作
>
> [sourcemap-upload-webpack-plugin](https://www.npmjs.com/package/sourcemap-upload-webpack-plugin)

```javascript
const fs = require('fs')
const path = './sourcemap.zip'
const archiver = require('archiver')
const { readDir, uploadFile, deleteFile, typeOf } = require('./utils')

class SourcemapUploadWebpackPlugin {
	constructor(options) {
		this.options = options
	}
	apply(compiler) {
		const { url, uploadPath, patterns, requestOption } = this.options

		if (!url || !uploadPath) {
			throw Error('Missing necessary parameters')
		}

		if (!typeOf(url) === 'string') {
			throw Error('The "url" parameter type is incorrect')
		}

		if (!typeOf(uploadPath) === 'string') {
			throw Error('The "uploadPath" parameter type is incorrect')
		}

		if (patterns && !typeOf(patterns) === 'array') {
			throw Error('The "patterns" parameter type is incorrect')
		}
    
    // 编译构建完成的回调
		compiler.hooks.done.tap('upload-sourcemap-plugin', status => {
			const archive = archiver('zip', {
				gzip: true,
				zlib: { level: 9 },
			})

			// 打包错误时zhi'xing
			archive.on('error', err => {
				throw Error(err)
			})

			// 打包完成时执行
			archive.on('end', async () => {
				console.info('Packed successfully, uploading files now...')
				await uploadFile({ url, path, requestOption })
				deleteFile(path)
			})

			archive.pipe(fs.createWriteStream(path))

			const sourceMapPaths = readDir(uploadPath, patterns)
			sourceMapPaths.forEach(p => {
				archive.append(fs.createReadStream(p), {
					name: `source/${p.replace(uploadPath, '')}`,
				})
			})
			archive.finalize()
		})
	}
}

module.exports = SourcemapUploadWebpackPlugin
```

**插件使用：**

```javascript
const SourcemapUploadWebpackPlugin = require('sourcemap-upload-webpack-plugin')
const path = require('path')

module.exports = {
	publicPath: './',
	configureWebpack: {
		plugins: [
			new SourcemapUploadWebpackPlugin({
				url: 'http://localhost:3000/sourcemapUpload',
				uploadPath: path.resolve(__dirname, 'dist/js'),
				patterns: [/app(.*).map$/],
			}),
		],
	},
}
```





## 通过报错信息解析报错位置



### 安装解析库

```shell
npm install source-map
```



### 解析

```javascript
const sourceMapTool = require('source-map')

const analysisErrorPosition = (sourcemapFile, line, col) => {
	return new Promise(resolve => {
		fs.readFile(sourcemapFile, 'utf8', function readContent(
			err,
			sourcemapContent
		) {
			// sourcemapContent 文件内容
			if (err) {
				throw err
			}
			// SourceMapConsumer.with 是该模块提供的消费 source-map 的一种方式
			sourceMapTool.SourceMapConsumer.with(
				sourcemapContent,
				null,
				consumer =>
					resolve(
						consumer.originalPositionFor({
							line: parseInt(line),
							column: parseInt(col),
						})
					)
			)
		})
	})
}

// 结果
{
  source: 'webpack:///src/components/Type.vue',
  line: 43,
  column: 0,
  name: null
}
```
































