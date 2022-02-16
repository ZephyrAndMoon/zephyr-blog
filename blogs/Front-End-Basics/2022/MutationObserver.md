---
title: Vue.nextTick 中用到的 Mutation Observer 是什么？
date: 2022-02-16
tags:
 - 前端
categories: 
 - Front-End-Basics
---

## 概述

`MutationObserver` 是用于代替 `Mutation events` 作为观察DOM树结构发生变化时，做出相应处理的 API。

## 什么是 Mutation Events

Mutation events 是在 [DOM3中定义](https://link.jianshu.com/?t=https://www.w3.org/TR/DOM-Level-3-Events/#events-mutationevents)，用于监听DOM树结构变化的事件。

它简单的用法如下：

```javascript
document.getElementById('list').addEventListener("DOMSubtreeModified"， function(){
  console.log('列表中子元素被修改');
}， false);
```

**Mutation 事件列表**

- DOMAttrModified
- DOMAttributeNameChanged
- DOMCharacterDataModified
- DOMElementNameChanged
- DOMNodeInserted
- DOMNodeRemoved
- DOMNodeInsertedIntoDocument
- DOMSubtreeModified

其中 `DOMNodeRemoved`，`DOMNodeInserted` 和 `DOMSubtreeModified` 分别用于 监听元素子项的删除，新增，修改(包括删除和新增），DOMAttrModified 是监听元素属性的修改，并且能够提供具体的修改动作。

## 使用 Mutation Events 遇到的问题

- 浏览器兼容性问题
  - IE9 不支持 `Mutation Events`
  - Webkit 内核不支持 `DOMAttrModified` 特性，
  - `DOMElementNameChanged` 和 `DOMAttributeNameChanged` 在 Firefox 上不被支持。

- 性能问题
  - `Mutation Events` 是同步执行的，它的每次调用，都需要从事件队列中取出事件，执行，然后事件队列中移除，期间需要移动队列元素。如果事件触发的较为频繁的话，每一次都需要执行上面的这些步骤，那么浏览器会被拖慢。
  - `Mutation Events` 本身是事件，所以捕获是采用的是事件冒泡的形式，如果冒泡捕获期间又触发了其他的 `Mutation Events` 的话，很有可能就会导致阻塞 Javascript 线程，甚至导致浏览器崩溃。



## 什么是 Mutation Observer

Mutation Observer 是在 DOM4 中定义的，用于替代 mutation events 的新API，它的不同于 events 的是，所有监听操作以及相应处理都是在其他脚本执行完成之后异步执行的，并且是所以变动触发之后，将变得记录在数组中，统一进行回调的，也就是说，当你使用 observer 监听多个DOM变化时，并且这若干个DOM发生了变化，那么 observer 会将变化记录到变化数组中，等待一起都结束了，然后一次性的从变化数组中执行其对应的回调函数。

### 兼容性

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20220216062627.png)





### 方法

#### 构造函数

用来实例化一个 `Mutation` 观察者对象，其中的参数是一个回调函数，它是会在指定的 DOM 节点发送变化后，执行的函数，并且会被传入两个参数，一个是变化记录数组(MutationRecord)，另一个是观察者对象本身



```javascript
new MutationObserver(function(records， itself){});
```

#### observe

在观察者对象上，注册需要观察的DOM节点，以及相应的参数

```typescript
function observe(target:Node，  MutationObserverInit?:options):void
```

其中的可选参数 MutationObserverInit 的属性如下：

> 如果想要使用哪个参数的话，就将其值设定为true

- **childList**  观察目标节点的子节点的新增和删除。
- **attributes** 观察目标节点的属性节点(新增或删除了某个属性，以及某个属性的属性值发生了变化)。
- **characterData** 如果目标节点为 characterData 节点(一种抽象接口，具体可以为文本节点，注释节点，以及处理指令节点)时，也要观察该节点的文本内容是否发生变化
- **subtree** 观察目标节点的所有后代节点(观察目标节点所包含的整棵DOM树上的上述三种节点变化)
- **attributeOldValue** 在 attributes 属性已经设为 `true` 的前提下，将发生变化的属性节点之前的属性值记录下来(记录到下面 MutationRecord 对象的 oldValue 属性中)
- **characterDataOldValue** 在 characterData 属性已经设为 `true` 的前提下，将发生变化 characterData 节点之前的文本内容记录下来(记录到下面 MutationRecord 对象的 oldValue 属性中)
- **attributeFilter** 要监视的特定属性的名称数组。如果没有该属性，则所有属性的改变都会触发通知。

#### disconnect

> 用来停止观察。发生相应变动时，不再调用回调函数。

```javascript
observer.disconnect();
```

#### takeRecords

> 方法返回已检测到但尚未由观察者的回调函数处理的所有匹配DOM更改的列表，使变更队列保持为空。 
>
> 此方法最常见的使用场景是在断开观察者之前立即获取所有未处理的更改记录，以便在停止观察者时可以处理任何未处理的更改。

```javascript
observer.takeRecord()
```



### 使用实例

```javascript
// Firefox和Chrome早期版本中带有前缀
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
// 选择目标节点
var target = document.querySelector('#some-id'); 
// 创建观察者对象
var observer = new MutationObserver(function(mutations) {  
  mutations.forEach(function(mutation) { 
    console.log(mutation.type); 
  }); 
}); 
// 配置观察选项:
var config = { attributes: true, childList: true, characterData: true } 
// 传入目标节点和观察选项
observer.observe(target, config); 
// 随后,你还可以停止观察
observer.disconnect();
```



## 参考

1. [MutationObserver 监听DOM树变化](https://www.jianshu.com/p/b5c9e4c7b1e1)

2. [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

3. [HTML5新特性之Mutation Observer ](https://www.cnblogs.com/jscode/p/3600060.html)