---
title: JavaScript 事件
date: 2021-04-01
tags:
 - JavaScript
 - 基础
categories: 
 - JavaScript
---

###  1. Dom事件流

三个阶段：

- 捕获阶段：事件一开始从文档的根节点流向目标对象
- 目标阶段：在目标对象上被触发
- 冒泡阶段：回溯文档的根节点

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210301154311.png)



#### 1.1 事件捕获阶段（Capture Phase）

事件的第一个阶段是捕获阶段。事件从文档的根节点出发，随着 DOM 树的结构向事件的目标节点流去。途中经过各个层次的 DOM 节点，并在各节点上触发捕获事件，直到到达事件的目标节点。捕获阶段的主要任务是建立传播路径，在冒泡阶段，事件会通过这个路径回溯到文档跟节点。



#### 1.2 目标阶段（Target Phase）

当事件到达目标节点的，事件就进入了目标阶段。事件在目标节点上被触发，然后会逆向回流，直到传播至最外层的文档节点。



#### 1.3 冒泡阶段（Bubble Phase）

事件在目标元素上触发后，并不在这个元素上终止。它会随着 DOM 树一层层向上冒泡，直到到达最外层的根节点。也就是说，同一个事件会依次在目标节点的父节点，父节点的父节点...直到最外层的节点上被触发。



**冒泡过程**非常有用。它将我们从对特定元素的事件监听中释放出来，相反，我们可以监听 DOM 树上更上层的元素，等待事件冒泡的到达。如果没有事件冒泡，在某些情况下，我们需要监听很多不同的元素来确保捕获到想要的事件。



> 所有的事件都要经过捕捉阶段和目标阶段，但是有些事件会跳过冒泡阶段。例如，让元素获得输入焦点的 focus 事件以及失去输入焦点的 blur 事件就都不会冒泡。





### 2. 事件处理程序



#### 2.1 HTML 事件处理程序

```html
<!-- 输出 click -->
<input type="button" value="Click Me" onclick="console.log(event.type)">

<!-- 输出 Click Me this 值等于事件的目标元素 -->
<input type="button" value="Click Me" onclick="console.log(this.value)">
```

当然在 HTML 中定义的事件处理程序也可以调用其它地方定义的脚本：

```html
<!-- Chrome 输出 click -->
<script>
    function showMessage(event) {
        console.log(event.type);
    }
</script>
<input type="button" value="Click Me" onclick="showMessage(event)">
```



#### 2.2 DOM0 级事件处理程序

```html
<input type="button" value="Click Me" id="btn">
<script>
    var btn=document.getElementById("btn");
    btn.onclick=function(){
        console.log(this.id); // 输出 btn
    }
</script>
```



#### 2.3 DOM2 级事件处理程序

DOM2 级事件定义了`addEventListener()` 和 `removeEventListener()`两个方法，用于处理和删除事件处理程序的操作。

所有 DOM 节点都包含这两个方法，它们接受3个参数：**要处理的事件名**、**作为事件处理程序的函数**和**一个布尔值**。最后的布尔值参数是 true 表示在捕获阶段调用事件处理程序，如果是 false(默认) 表示在冒泡阶段调用事件处理程序。

```html
<input type="button" value="Click Me" id="btn">
<script>
    var btn=document.getElementById("btn");
    btn.addEventListener("click",function(){
        console.log(this.id);
    },false);
    btn.addEventListener("click",function(){
        console.log('Hello word!');
    },false);
</script>
```

上面代码两个事件处理程序会按照它们的添加顺序触发，先输出 btn 再输出 Hello word!

通过 `addEventListener()`添加的事件处理程序只能使用 `removeEventListener()`来移除，移除时传入的参数与添加时使用的参数相同，即匿名函数无法被移除。

```html
<input type="button" value="Click Me" id="btn">
<script>
    var btn=document.getElementById("btn");
    var handler = function(){
        console.log(this.id);
    }
    btn.addEventListener("click", handler, false);
    btn.removeEventListener("click",handler, false);
</script>
```



#### 2.4 IE 事件处理程序

IE通常都是特立独行的，它添加和删除事件处理程序的方法分别是：`attachEvent()` 和 `detachEvent()`

同样接受事件处理程序名称与事件处理程序函数两个参数，但跟`addEventListener()`的区别是：

- 事件名称需要加“on”，比如“onclick”；
- 没了第三个布尔值，IE8及更早版本只支持事件冒泡；
- 仍可添加多个处理程序，但触发顺序是反着来的。

还有一点需要注意，DOM0 和 DOM2 级的方法，其作用域都是在其所依附的元素当中，`attachEvent()`则是全局，即如果像之前一样使用`this.id`，访问到的就不是 button 元素，而是 window，就得不到正确的结果。



#### 2.5 跨浏览器事件处理程序

```js
var EventUtil={
    addHandler:function(element,type,handler){
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        } else if(element.attachEvent){
            element.attachEvent(“on”+ type,handler);
        } else {
            element[“on” + type]=handler;
        }
    },
    removeHandler:function(element,type,handler){
        if(element.removeEventListener){
            element.removeEventListener(type,handler,false);
        } else if(element.detachEvent){
            element.detachEvent(“on”+ type,handler);
        } else {
            element[“on” + type]=null;
        }
    }
}
```





### 3. 事件对象

在触发 DOM 上的某个事件时，会产生一个事件对象 event，这个对象中包含着所有与事件有关的信息。所有的浏览器都支持 event 对象，但支持方式不同。



#### 3.1 DOM 中的事件对象

兼容 DOM 的浏览器会将一个 event 对象传入到事件处理程序中。event 对象包含与创建它的特定事件有关的属性和方法。触发的事件类型不一样，可用的属性和方法也不一样。

不过，所有事件都会有下面列出的成员。

- bubbles（boolean）— 表明事件是否冒泡

- cancelable（boolean）— 指明这个事件的默认行为是否可以通过调用

  - `event.preventDefault` 来阻止。只有cancelable 为 true 的时候，调用`event.preventDefault`才能生效

- currentTarget（element）— 当事件遍历DOM时，标识事件的当前目标。它总是引用事件处理程序附加到的元素，而不是 `event.target` 标识事件发生的元素

- defaultPrevented（boolean）— 表明当前事件对象的 preventDefault 方法是否被调用过

- eventPhase（number）— 表明当前这个事件所处的阶段

  （phase）：none（0），capture（1），target（2），bubbing（3）

- preventDefault（function）— 这个方法将阻止浏览器中用户代理对当前事件的相关默认行为被触发。比如阻止 a 元素的 `click` 事件加载一个新的页面

- stopImmediatePropagation（function）— 多个事件监听器被附加到相同元素的相同事件类型上，当此事件触发时，它们会按其被添加的顺序被调用。如果在其中一个事件监听器中执行 `stopImmediatePropagation()` ，那么剩下的事件监听器都不会被调用。

- stopPropagation（function）— 阻止捕获和冒泡阶段中当前事件的进一步传播

- target（element）— 事件起源的DOM节点（获取标签名：ev.target.nodeName）

- type（String）— 事件的名称

- isTrusted（boolean）— 如果一个事件是由设备本身（如浏览器）触发的，而不是通过JavaScript模拟合成的，那这个事件被称为可信任的（trusted）

- timestamp（number）— 事件发生的时间



在事件处理程序内部，对象 this 始终等于 currentTarget 的值，而 target 则只包含事件的实际目标。如果直接将事件处理程序指定给了目标元素， 则 this、currentTarget、target 包含相同的值。

```html
<input type="button" value="Click Me" id="btn">
<script>
    var btn=document.getElementById("btn");
    btn.onclick = function (event) {
        console.log(event.currentTarget === this); // true
        console.log(event.target === this); // true
    }
</script>
```

如果事件处理程序存在于按钮的父节点，那么这些值是不同的。

```html
<input type="button" value="Click Me" id="btn">
<script>
    var btn=document.getElementById("btn");
    document.body.onclick = function (event) {
        console.log(event.currentTarget === document.body); // true
        console.log(this === document.body); // true
        console.log(event.target === btn); // true
    }
</script>
```

在需要通过一个函数处理多个事件时，可以使用 type 属性。

```html
<input type="button" value="Click Me" id="btn">
<script>
    var btn=document.getElementById("btn");
    var handler = function(event) {
        switch (event.type) {
            case "click":
                console.log("clicked");
                break;
            case "mouseover":
                event.target.style.backgroundColor = "red";
                break;
            case "mouseout":
                event.target.style.backgroundColor = "";
                break;
        }
    }
    btn.onclick = handler;
    btn.onmouseover = handler;
    btn.onmouseout = handler;
</script>
```



#### 3.2 跨浏览器的事件对象

```javascript
EventUtil = {
    addHandler: function(element,type,handler){
        if(element.addEventListener){
            element.addEventListener(type,handler,false);
        }else if(element.attachEvent){
            element.attachEvent("on"+type,handler);
        }else{
            element["on"+type] = handler;
        }
    },
    removeHandler: function(element,type,handler){
        if(element.removeEventListener){
            element.removeEventListener(type,handler,false);
        }else if(element.detachEvent){
            element.detachEvent("on" + type,handler);
        }else{
            element["on" + type] = null;
        }
    },
    getEvent: function(event){
        return event?event:window.event;
    },
    getTarget: function(event){
        return event.target || event.srcElement;
    },
    preventDefault: function(event){
        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false;
        }
    },
    stopProgagation: function(event){
        if(event.stopProgagation){
            event.stopProgagation();
        }else{
            event.cancelBubble = true;
        }
    },
    getRelatedTarget: function(event){
        if(event.relatedTarget){
            return event.relatedTarget;
        }else if(event.toElement){
            return event.toElement;
        }else if(event.fromElement){
            return event.fromElement;
        }else{
            return null;
        }
    },
    getButton:function(event){
        if(document.implementation.hasFeature("MouseEvents","2.0")){
            return event.button;    
        }else{
            switch (event.button){
                case 0:
                case 1:
                case 3:
                case 5:
                case 7:
                    return 0;
                case 2:
                case 6:
                    return 2;
                case 4:
                    return 1;
            }
        }
    },
    getCharCode: function(event){
        if(typeof event.charCode == "number"){
            return event.charCode;
        }else{
            return event.keyCode;
        }
    }
};
```

**详细：**

##### 事件处理程序

**DOM2级事件处理程序：**

DOM2级事件处理程序定义了两个方法，用于处理指定和删除事件处理程序的操作：**addEventListener()**和**removeEventLisener()**。

它们都接受三个参数：要处理的事件名、作为事件处理程序的函数和一个布尔值。

布尔值参数如果是true，表示在捕获阶段调用事件处理程序；如果是false，表示在冒泡阶段调用事件处理程序。

**IE事件处理程序：**

IE实现了DOM中类似的两个方法：**attachEvent()**和**detachEvent()**。

这两个方法接受相同的两个参数：事件处理程序名称与事件处理程序函数。

由于IE8及更早版本只支持事件冒泡，所以通过attachEvent()添加的事件处理程序都会被添加到冒泡阶段



##### getEvent

*event || window.event*

**DOM：**
兼容DOM的浏览器会将一个event对象传入到事件处理程序中。

**IE：**

在使用DOM0级方法添加事件处理程序时，event对象最为window对象的一个属性存在，用window.event取得evnet对象。

如果事件处理程序是用attachEvent()添加的，那么就会有一个event对象作为参数被传入程序函数中。

如果是通过HTML特性指定的事件处理程序，那么还可以通过一个名叫event的变量来访问event对象。



##### getTarget

*event.target || event.srcElement*

**DOM**
target包含事件的实际目标。

**IE**
因为事件处理程序的作用域是根据指定它的方式来确定的，所以this不一定会始终等于事件目标。因而，最好还是使用event.srcElemen

比较保险。



##### preventDefault

**DOM：**
preventDefault()取消事件的默认行为

**IE：**

returnValue属性相当于DOM中的preventDefault()方法，他们的作用都是取消给定事件的默认行为。只要将returnValue设置为false

就可以阻止默认行为。



##### stopProgagation：

**DOM：**

stopProgagation()取消事件的进一步捕获或冒泡

**IE：**

cancelBubble属性与DOM中的stopPropagation()方法作用相同，都是用来停止事件冒泡的。



#####  getRelatedTarget

- mouseover：事件的主目标是获得光标的元素，而相关元素是失去光标的元素。
- mouserout：事件的主目标是失去光标的元素，而相关元素是获得光标的元素。

**DOM：**

DOM通过event对象的relateTarget属性提供了相关元素的信息

**IE：**

IE8及之前的版本不支持getRelatedTarget属性。

但在mouseover事件触发时，IE的fromElement属性中保存了相关元素

在mouseout事件触发时，IE的toElement属性中保存了相关元素。



##### getButton

对于mousedown和mouseup事件来说，在其event对象存在一个button属性，表示按下或释放的按钮。

**DOM：**
DOM的button属性有3个，
0：表示主鼠标键
1：表示总监的鼠标按钮（鼠标滚轮按钮）
2：表示次鼠标按钮

**IE：**
IE8之前变笨也提供了button属性，但这个属性的值和DOM有很大的差异
0：表示没有按下按钮
1：表示按下了主鼠标按钮
2：表示按下了次鼠标按钮
3：表示同时按下了主、次鼠标按钮
4：表示按下了中间的鼠标按钮
5：表示同时按下了主鼠标按钮和中间的鼠标按钮
6：表示同时按下了次鼠标按钮和中间的鼠标按钮
7：表示同时按下了三个鼠标按钮