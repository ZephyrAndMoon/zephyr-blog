---
title: Vue.nextTick 原理解析
date: 2022-02-16
tags:
 - 前端
 - Vue
categories: 
 - Vue
---

## 为什么使用 Vue.nextTick()

> > 在下次DOM更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的DOM。

由于Vue DOM更新是异步执行的，即修改数据时，视图不会立即更新，而是会监听数据变化，并缓存在同一事件循环中，等同一数据循环中的所有数据变化完成之后，再统一进行视图更新。为了确保得到更新后的DOM，所以设置了 `Vue.nextTick()`方法。



## 源码浅析

`nextTick` 的实现单独有一个JS文件来维护它，在`src/core/util/next-tick.js`中。

`nextTick` 源码主要分为两块：**能力检测** 和 **根据能力检测以不同方式执行回调队列**。





### 能力检测

> 由于宏任务耗费的时间是大于微任务的，所以在浏览器支持的情况下，优先使用微任务。如果浏览器不支持微任务，再使用宏任务。

```javascript
// 空函数，可用作函数占位符
import { noop } from 'shared/util' 

 // 错误处理函数
import { handleError } from './error'

 // 是否是IE、IOS、内置函数
import { isIE, isIOS, isNative } from './env'

// 使用 MicroTask 的标识符，这里是因为火狐在<=53时 无法触发微任务，在modules/events.js文件中引用进行安全排除
export let isUsingMicroTask = false 

 // 用来存储所有需要执行的回调函数
const callbacks = []

// 用来标志是否正在执行回调函数
let pending = false 

// 对callbacks进行遍历，然后执行相应的回调函数
function flushCallbacks () {
    pending = false
    // 这里拷贝的原因是：
    // 有的cb 执行过程中又会往callbacks中加入内容
    // 比如 $nextTick的回调函数里还有$nextTick
    // 后者的应该放到下一轮的nextTick 中执行
    // 所以拷贝一份当前的，遍历执行完当前的即可，避免无休止的执行下去
    const copies = callbcks.slice(0)
    callbacks.length = 0
    for(let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}

let timerFunc // 异步执行函数 用于异步延迟调用 flushCallbacks 函数

// 在2.5中，我们使用(宏)任务(与微任务结合使用)。
// 然而，当状态在重新绘制之前发生变化时，就会出现一些微妙的问题
// (例如#6813,out-in转换)。
// 同样，在事件处理程序中使用(宏)任务会导致一些奇怪的行为
// 因此，我们现在再次在任何地方使用微任务。
// 优先使用 Promise
if(typeof Promise !== 'undefined' && isNative(Promise)) {
    const p = Promise.resolve()
    timerFunc = () => {
        p.then(flushCallbacks)
        
        // IOS 的UIWebView, Promise.then 回调被推入 microTask 队列，但是队列可能不会如期执行
        // 因此，添加一个空计时器强制执行 microTask
        if(isIOS) setTimeout(noop)
    }
    isUsingMicroTask = true
} else if(!isIE && typeof MutationObserver !== 'undefined' && (isNative(MutationObserver) || MutationObserver.toString === '[object MutationObserverConstructor]')) {
    // 当 原生Promise 不可用时，使用 原生MutationObserver
    // e.g. PhantomJS, iOS7, Android 4.4
 
    let counter = 1
    // 创建MO实例，监听到DOM变动后会执行回调flushCallbacks
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
        characterData: true // 设置true 表示观察目标的改变
    })
    
    // 每次执行timerFunc 都会让文本节点的内容在 0/1之间切换
    // 切换之后将新值复制到 MO 观测的文本节点上
    // 节点内容变化会触发回调
    timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter) // 触发回调
    }
    isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks, 0)
    }
}
```

延迟调用优先级如下：
`Promise > MutationObserver > setImmediate > setTimeout`

```javascript
export function nextTick(cb? Function, ctx: Object) {
    let _resolve
    // cb 回调函数会统一处理压入callbacks数组
    callbacks.push(() => {
        if(cb) {
            try {
                cb.call(ctx)
            } catch(e) {
                handleError(e, ctx, 'nextTick')
            }
        } else if (_resolve) {
            _resolve(ctx)
        }
    })
    
    // pending 为false 说明本轮事件循环中没有执行过timerFunc()
    if(!pending) {
        pending = true
        timerFunc()
    }
    
    // 当不传入 cb 参数时，提供一个promise化的调用 
    // 如nextTick().then(() => {})
    // 当_resolve执行时，就会跳转到then逻辑中
    if(!cb && typeof Promise !== 'undefined') {
        return new Promise(resolve => {
            _resolve = resolve
        })
    }
}
```

`next-tick.js` 对外暴露了`nextTick`这一个参数，所以每次调用`Vue.nextTick`时会执行：

- 把传入的回调函数`cb`压入`callbacks`数组
- 执行`timerFunc`函数，延迟调用 `flushCallbacks` 函数
- 遍历执行 `callbacks` 数组中的所有函数

这里的 `callbacks` 没有直接在 `nextTick` 中执行回调函数的原因是保证在同一个 `tick` 内多次执行`nextTick`，不会开启多个异步任务，而是把这些异步任务都压成一个同步任务，在下一个 `tick` 执行完毕。



### 附加

`noop` 的定义如下

```typescript
/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop (a?: any, b?: any, c?: any) {}
```



## 使用

**语法**：`Vue.nextTick([callback, context])`

**参数**：

- `{Function} [callback]`：回调函数，不传时提供promise调用
- `{Object} [context]`：回调函数执行的上下文环境，不传默认是自动绑定到调用它的实例上。

```javascript
//改变数据
vm.message = 'changed'

//想要立即使用更新后的DOM。这样不行，因为设置message后DOM还没有更新
console.log(vm.$el.textContent) // 并不会得到'changed'

//这样可以，nextTick里面的代码会在DOM更新后执行
Vue.nextTick(function(){
    // DOM 更新了
    //可以得到'changed'
    console.log(vm.$el.textContent)
})

// 作为一个 Promise 使用 即不传回调
Vue.nextTick()
  .then(function () {
    // DOM 更新了
  })
```

Vue实例方法`vm.$nextTick`做了进一步封装，把 context 参数设置成当前 Vue 实例。



## 小结

使用`Vue.nextTick()`是为了可以获取更新后的 DOM。
触发时机：在同一事件循环中的数据变化后，DOM 完成更新，立即执行`Vue.nextTick()`的回调。

> 同一事件循环中的代码执行完毕 -> DOM 更新 -> nextTick callback 触发



![](https://markdowncun.oss-cn-beijing.aliyuncs.com/Set%20Diagram-Page-3.drawio%20(1).png)

应用场景：

- 在Vue生命周期的 `created()` 钩子函数进行的 DOM 操作一定要放在 `Vue.nextTick()` 的回调函数中。

  **原因**：是`created()`钩子函数执行时 DOM 其实并未进行渲染。

- 在数据变化后要执行的某个操作，而这个操作需要使用随数据改变而改变的DOM结构的时候，这个操作应该放在 `Vue.nextTick()`的回调函数中。

  **原因**：Vue 异步执行 DOM 更新，只要观察到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据改变，如果同一个 watcher 被多次触发，只会被推入到队列中一次。



## 参考

[浅析Vue.nextTick()原理](https://segmentfault.com/a/1190000020499713)


