---
title: JavaScript数据类型
date: 2021-04-01
tags:
 - JavaScript
 - 基础
categories: 
 - JavaScript
---

# 1. 数据类型概念

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210331155823.png)



## 1. 数据类型概念

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210331155823.png)



**原始类型**

- `Null`：只包含一个值：`null`
- `Undefined`：只包含一个值：`undefined`
- `Boolean`：包含两个值：`true`和`false`
- `Number`：整数或浮点数，还有一些特殊值（`-Infinity`、`+Infinity`、`NaN`）
- `String`：一串表示文本值的字符序列
- `Symbol`：一种实例是唯一且不可改变的数据类型

(在`es10`中加入了第七种原始类型`BigInt`，现已被最新`Chrome`支持)



### 1.1 原始类型

上面所提到的原始类型，在`ECMAScript`标准中，它们被定义为`primitive values`，即原始值，代表值本身是不可被改变的。

以字符串为例，在调用操作字符串的方法时，没有任何方法是可以直接改变字符串的：

```javascript
var str = 'ConardLi';
str.slice(1);
str.substr(1);
str.trim(1);
str.toLowerCase(1);
str[0] = 1;
console.log(str);  // ConardLi
```

在上面的代码中对`str`调用了几个方法，无一例外，这些方法都在原字符串的基础上产生了一个新字符串，而非直接去改变`str`，这就印证了字符串的不可变性。

那么继续调用下面的代码：

```javascript
str += '6'
console.log(str);  // ConardLi6
```

这种情况从内存上解释：



在`JavaScript`中，每一个变量在内存中都需要一个空间来存储。

内存空间又被分为两种，**栈内存**与**堆内存**。



栈内存：

- 存储的值大小固定
- 空间较小
- 可以直接操作其保存的变量，运行效率高
- 由系统自动分配存储空间

`JavaScript`中的原始类型的值被直接存储在栈中，在变量定义时，栈就为其分配好了内存空间。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401092102.png)

由于栈中的内存空间的大小是固定的，那么注定了存储在栈中的变量就是不可变的。

在上面的代码中，执行了`str += '6'`的操作，实际上是在栈中又开辟了一块内存空间用于存储`'ConardLi6'`，然后将变量`str`指向这块空间，所以这并不违背`不可变性的`特点。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401092850.png)



### 1.2 引用类型

相对于具有不可变性的原始类型，我习惯把对象称为引用类型，引用类型的值实际存储在堆内存中，它在栈中只存储了一个固定长度的地址，这个地址指向堆内存中的值。

堆内存：

- 存储的值大小不定，可动态调整
- 空间较大，运行效率低
- 无法直接操作其内部存储，使用引用地址读取
- 通过代码进行分配空间

```javascript
var obj1 = {name:"ConardLi"}
var obj2 = {age:18}
var obj3 = function(){...}
var obj4 = [1,2,3,4,5,6,7,8,9]
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401142617.png)

引用类型不再具有`不可变性`了，可以轻易的改变它们：

```javascript
obj1.name = "ConardLi6";
obj2.age = 19;
obj4.length = 0;
console.log(obj1); //{name:"ConardLi6"}
console.log(obj2); // {age:19}
console.log(obj4); // []
```



### 1.3 复制变量

当把一个变量的值复制到另一个变量上时，原始类型和引用类型的表现是不一样的

**原始类型：**

```javascript
var name = 'ConardLi';
var name2 = name;
name2 = 'code秘密花园';
console.log(name); // ConardLi;
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401142918.png)

内存中有一个变量`name`，值为`ConardLi`。从变量`name`复制出一个变量`name2`，此时在内存中创建了一个块新的空间用于存储`ConardLi`，虽然两者值是相同的，但是两者指向的内存空间完全不同，这两个变量参与任何操作都互不影响。



**引用类型：**

```javascript
var obj = {name:'ConardLi'};
var obj2 = obj;
obj2.name = 'code秘密花园';
console.log(obj.name); // code秘密花园
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401144557.png)

当复制引用类型的变量时，实际上复制的是栈中存储的地址，所以复制出来的`obj2`实际上和`obj`指向的堆中同一个对象。因此改变其中任何一个变量的值，另一个变量都会受到影响。



### 1.4 比较

当在对两个变量进行比较时，不同类型的变量的表现是不同的：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401145232.png)

```javascript
var name = 'ConardLi';
var name2 = 'ConardLi';
console.log(name === name2); // true
var obj = {name:'ConardLi'};
var obj2 = {name:'ConardLi'};
console.log(obj === obj2); // false
```



对于**原始类型**，会直接比较它们的值，如果值相等返回`true`。

对于引用类型，会比较它们的引用地址，虽然两个变量在堆中存储的对象具有的属性值都是相等的，但是它们被存储在了不同的存储空间，因此比较值为`false`。





### 1.5 值传递和引用传递

**原始类型：**

```javascript
let name = 'ConardLi';
function changeValue(name){
  name = 'code秘密花园';
}
changeValue(name);
console.log(name);  // ConardLi
```

执行上面的代码，如果最终打印出来的`name`是`'ConardLi'`，没有改变，说明函数参数传递的是变量的值，即值传递。如果最终打印的是`'code秘密花园'`，函数内部的操作可以改变传入的变量，那么说明函数参数传递的是引用，即引用传递。

上面的执行结果是`'ConardLi'`，即函数参数仅仅是被传入变量复制给了的一个局部变量，改变这个局部变量不会对外部变量产生影响



**引用类型：**

```javascript
let obj = {name:'ConardLi'};
function changeValue(obj){
  obj.name = 'code秘密花园';
}
changeValue(obj);
console.log(obj.name); // code秘密花园
```

参数是引用类型就是引用传递吗？

首先明确一点，`ECMAScript`中所有的函数的参数都是按值传递的。

同样的，当函数参数是引用类型时，同样将参数复制了一个副本到局部变量，只不过复制的这个副本是指向堆内存中的地址而已，在函数内部对对象的属性进行操作，实际上和外部变量指向堆内存中的值相同，但是这并不代表着引用传递，下面再按一个例子：

```javascript
let obj = {};
function changeValue(obj){
  obj.name = 'ConardLi';
  obj = {name:'code秘密花园'};
}
changeValue(obj);
console.log(obj.name); // ConardLi
```

在`obj`重新赋值时为一个对象时，在堆内存中开辟了一个新的内存用来存储`{name:'code秘密花园'}`，并返回内存地址给函数中的`obj`

可见，函数参数传递的并不是变量的`引用`，而是变量拷贝的副本，当变量是原始类型时，这个副本就是值本身，当变量是引用类型时，这个副本是指向堆内存的地址。所以：

> `ECMAScript`中所有的函数的参数都是按值传递的。



## 2. Symbol类型

> 每个从Symbol()返回的symbol值都是唯一的。一个symbol值能作为对象属性的标识符；这是该数据类型仅有的目的。



### 2.1 Symbol的特性

**1.独一无二**

直接使用`Symbol()`创建新的`symbol`变量，可选用一个字符串用于描述。当参数为对象时，将调用对象的`toString()`方法。

```javascript
var sym1 = Symbol();  // Symbol() 
var sym2 = Symbol('ConardLi');  // Symbol(ConardLi)
var sym3 = Symbol('ConardLi');  // Symbol(ConardLi)
var sym4 = Symbol({name:'ConardLi'}); // Symbol([object Object])
console.log(sym2 === sym3);  // false
```



用两个相同的字符串创建两个`Symbol`变量，它们是不相等的，可见每个`Symbol`变量都是独一无二的。

如果想创造两个相等的`Symbol`变量，可以使用`Symbol.for(key)`。

> 使用给定的key搜索现有的symbol，如果找到则返回该symbol。否则将使用给定的key在全局symbol注册表中创建一个新的symbol。

```javascript
var sym1 = Symbol.for('ConardLi');
var sym2 = Symbol.for('ConardLi');
console.log(sym1 === sym2); // true
```



**2.原始类型**

注意是使用`Symbol()`函数创建`symbol`变量，并非使用构造函数，使用`new`操作符会直接报错。

```javascript
new Symbol(); // Uncaught TypeError: Symbol is not a constructor
```

可以使用`typeof`运算符判断一个`Symbol`类型：

```javascript
typeof Symbol() === 'symbol'
typeof Symbol('ConardLi') === 'symbol'
```



**3.不可枚举**

当使用`Symbol`作为对象属性时，可以保证对象不会出现重名属性，调用`for...in`不能将其枚举出来，另外调用`Object.getOwnPropertyNames、Object.keys()`也不能获取`Symbol`属性。

> 可以调用Object.getOwnPropertySymbols()用于专门获取Symbol属性。

```javascript
var obj = {
  name:'ConardLi',
  [Symbol('name2')]:'code秘密花园'
}
Object.getOwnPropertyNames(obj); // ["name"]
Object.keys(obj); // ["name"]
for (var i in obj) {
   console.log(i); // name
}
Object.getOwnPropertySymbols(obj) // [Symbol(name)]
```



### 2.2 Symbol的应用场景

下面是几个`Symbol`在程序中的应用场景。



**应用一：防止XSS**

`JSX` 实际上是一种语法糖，Babel 会把 JSX 编译成 `React.createElement()` 的函数调用，最终返回一个 `ReactElement`，以下为这几个步骤对应的代码：

```jsx
// JSX
const element = (
  <h1 className="greeting">
      Hello, world!
  </h1>
);
// 通过 babel 编译后的代码
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
// React.createElement() 方法返回的 ReactElement
const element = {
  $$typeof: Symbol('react.element'),
  type: 'h1',
  key: null,
  props: {
    children: 'Hello, world!',
        className: 'greeting'   
  }
  ...
}
```

可以看到，最终渲染的内容是在 Children 属性中，那了解了 JSX 的原理后，来试试能否通过构造特殊的 Children 进行 XSS 注入，来看下面一段代码：

```javascript
const storedData = `{
    "ref":null,
    "type":"body",
    "props":{
        "dangerouslySetInnerHTML":{
            "__html":"<img src=\"empty.png\" onerror =\"alert('xss')\"/>"
        }
    }
}`;
// 转成 JSON
const parsedData = JSON.parse(storedData);
// 将数据渲染到页面
render () {
    return <span> {parsedData} </span>; 
}
```

这段代码中， 运行后会报以下错误，提示不是有效的 ReactChild。

```
Uncaught (in promise) Error: Objects are not valid as a React child (found: object with keys {ref, type, props}). If you meant to render a collection of children, use an array instead.
```

那是哪里出问题了？看一下 ReactElement 的源码：

```javascript
const symbolFor = Symbol.for;
REACT_ELEMENT_TYPE = symbolFor('react.element');
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // 这个 tag 唯一标识了此为 ReactElement
    $$typeof: REACT_ELEMENT_TYPE,
    // 元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,
    // 记录创建此元素的组件
    _owner: owner,
  };
  ...
  return element;
}
```

注意到其中有个属性是 `$$typeof`，它是用来标记此对象是一个 `ReactElement`，React 在进行渲染前会通过此属性进行校验，校验不通过将会抛出上面的错误。React 利用这个属性来防止通过构造特殊的 Children 来进行的 XSS 攻击，原因是 `$$typeof` 是个 Symbol 类型，进行 JSON 转换后会 Symbol 值会丢失，无法在前后端进行传输。如果用户提交了特殊的 Children，也无法进行渲染，利用此特性，可以防止存储型的 XSS 攻击。



**应用二：私有属性**

借助`Symbol`类型的不可枚举，可以在类中模拟私有属性，控制变量读写：

```javascript
const privateField = Symbol();
class myClass {
  constructor(){
    this[privateField] = 'ConardLi';
  }
  getField(){
    return this[privateField];
  }
  setField(val){
    this[privateField] = val;
  }
}
```



**应用三：防止属性污染**

在某些情况下，可能要为对象添加一个属性，此时就有可能造成属性覆盖，用`Symbol`作为对象属性可以保证永远不会出现同名属性。

例如下面的场景，模拟实现一个`call`方法：

```javascript
    Function.prototype.myCall = function (context) {
      if (typeof this !== 'function') {
        return undefined; // 用于防止 Function.prototype.myCall() 直接调用
      }
      context = context || window;
      const fn = Symbol();
      context[fn] = this;
      const args = [...arguments].slice(1);
      const result = context[fn](...args);
      delete context[fn];
      return result;
    }
```

需要在某个对象上临时调用一个方法，又不能造成属性污染，`Symbol`是一个很好的选择。





## 3. Number类型



### 3.1 精度丢失

计算机中所有的数据都是以`二进制`存储的，所以在计算时计算机要把数据先转换成`二进制`进行计算，然后在把计算结果转换成`十进制`。

在计算`0.1+0.2`时，`二进制`计算发生了精度丢失，导致再转换成`十进制`后和预计的结果不符。



`0.1`和`0.2`的二进制都是以1100无限循环的小数，下面逐个来看JS帮计算所得的结果：

**0.1的二进制**：

```javascript
0.0001100110011001100110011001100110011001100110011001101
```

**0.2的二进制**：

```javascript
0.001100110011001100110011001100110011001100110011001101
```

**理论上讲，由上面的结果相加应该：**：

```javascript
0.0100110011001100110011001100110011001100110011001100111
```

**实际JS计算得到的0.1+0.2的二进制**

```javascript
0.0100110011001100110011001100110011001100110011001101
```



### 3.2 JavaScript对二进制小数的存储方式

小数的`二进制`大多数都是无限循环的

在[ECMAScript®语言规范](http://www.ecma-international.org/ecma-262/5.1/#sec-4.3.19)中可以看到，`ECMAScript`中的`Number`类型遵循`IEEE 754`标准。使用64位固定长度来表示。

事实上有很多语言的数字类型都遵循这个标准，例如`JAVA`,所以很多语言同样有着上面同样的问题。



**IEEE 754**

`IEEE754`标准包含一组实数的二进制表示法。它有三部分组成：

- 符号位
- 指数位
- 尾数位

三种精度的浮点数各个部分位数如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401163701.png)

`JavaScript`使用的是64位双精度浮点数编码，所以它的`符号位`占`1`位，指数位占`11`位，尾数位占`52`位。

下面再理解下什么是`符号位`、`指数位`、`尾数位`，以`0.1`为例：

它的二进制为：`0.0001100110011001100...`

为了节省存储空间，在计算机中它是以科学计数法表示的，也就是

`1.100110011001100...` X 2∧-4

如果这里不好理解可以想一下十进制的数：

`1100`的科学计数法为`11` X 10∧2

所以：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401164227.png)

`符号位`就是标识正负的，`1`表示`负`，`0`表示`正`；

`指数位`存储科学计数法的指数；

`尾数位`存储科学计数法后的有效数字；

所以通常看到的二进制，其实是计算机实际存储的尾数位。



如果计算机没有存储空间的限制，那么`0.1`的`二进制`应该是：

```javascript
0.00011001100110011001100110011001100110011001100110011001...
```

科学计数法尾数位

```javascript
1.1001100110011001100110011001100110011001100110011001...
```

但是由于限制，有效数字第`53`位及以后的数字是不能存储的，它遵循，如果是`1`就向前一位进`1`，如果是`0`就舍弃的原则。

0.1的二进制科学计数法第53位是1，所以就有了下面的结果：

```javascript
0.0001100110011001100110011001100110011001100110011001101
```

`0.2`有着同样的问题，其实正是由于这样的存储，在这里有了精度丢失，导致了`0.1+0.2!=0.3`。



### 3.3 JavaScript能表示的最大数字

由与`IEEE 754`双精度64位规范的限制：

`指数位`能表示的最大数字：`1023`(十进制)

`尾数位`能表达的最大数字即尾数位都为`1`的情况

所以JavaScript能表示的最大数字即位

`1.111...`X 21023 这个结果转换成十进制是`1.7976931348623157e+308`,这个结果即为`Number.MAX_VALUE`。



### 3.4 JavaScript最大安全数字

JavaScript中`Number.MAX_SAFE_INTEGER`表示最大安全数字,计算结果是`9007199254740991`，即在这个数范围内不会出现精度丢失（小数除外）,这个数实际上是`1.111...`X 252。

同样可以用一些开源库来处理大整数：

- [node-bignum](https://github.com/justmoon/node-bignum)
- [node-bigint](https://github.com/substack/node-bigint)

其实官方也考虑到了这个问题，`bigInt`类型在`es10`中被提出，现在`Chrome`中已经可以使用，使用`bigInt`可以操作超过最大安全数字的数字。



## 4. 还有哪些引用类型



### 4.1 包装类型

为了便于操作基本类型值，`ECMAScript`还提供了几个特殊的引用类型，他们是基本类型的包装类型：

- `Boolean`
- `Number`
- `String`

注意包装类型和原始类型的区别：

```javascript
true === new Boolean(true); // false
123 === new Number(123); // false
'ConardLi' === new String('ConardLi'); // false
console.log(typeof new String('ConardLi')); // object
console.log(typeof 'ConardLi'); // string
```

> 引用类型和包装类型的主要区别就是对象的生存期，使用new操作符创建的引用类型的实例，在执行流离开当前作用域之前都一直保存在内存中，而自基本类型则只存在于一行代码的执行瞬间，然后立即被销毁，这意味着我们不能在运行时为基本类型添加属性和方法。

```javascript
var name = 'ConardLi'
name.color = 'red';
console.log(name.color); // undefined
```



### 4.2 装箱和拆箱

- 装箱转换：把基本类型转换为对应的包装类型
- 拆箱操作：把引用类型转换为基本类型

既然原始类型不能扩展属性和方法，那么我们是如何使用原始类型调用方法的呢？

每当我们操作一个基础类型时，后台就会自动创建一个包装类型的对象，从而让我们能够调用一些方法和属性，例如下面的代码：

```javascript
var name = "ConardLi";
var name2 = name.substring(2);
```

实际上发生了以下几个过程：

- 创建一个`String`的包装类型实例
- 在实例上调用`substring`方法
- 销毁实例

也就是说，我们使用基本类型调用方法，就会自动进行装箱和拆箱操作，相同的，我们使用`Number`和`Boolean`类型时，也会发生这个过程。



从引用类型到基本类型的转换，也就是拆箱的过程中，会遵循`ECMAScript规范`规定的`toPrimitive`原则，一般会调用引用类型的`valueOf`和`toString`方法，你也可以直接重写`toPeimitive`方法。一般转换成不同类型的值遵循的原则不同，例如：

- 引用类型转换为`Number`类型，先调用`valueOf`，再调用`toString`
- 引用类型转换为`String`类型，先调用`toString`，再调用`valueOf`

若`valueOf`和`toString`都不存在，或者没有返回基本类型，则抛出`TypeError`异常。

```javascript
const obj = {
  valueOf: () => { console.log('valueOf'); return 123; },
  toString: () => { console.log('toString'); return 'ConardLi'; },
};
console.log(obj - 1);   // valueOf   122
console.log(`${obj}ConardLi`); // toString  ConardLiConardLi

const obj2 = {
  [Symbol.toPrimitive]: () => { console.log('toPrimitive'); return 123; },
};
console.log(obj2 - 1);   // valueOf   122

const obj3 = {
  valueOf: () => { console.log('valueOf'); return {}; },
  toString: () => { console.log('toString'); return {}; },
};
console.log(obj3 - 1);  
// valueOf  
// toString
// TypeError
```

除了程序中的自动拆箱和自动装箱，我们还可以手动进行拆箱和装箱操作。我们可以直接调用包装类型的`valueOf`或`toString`，实现拆箱操作：

```javascript
var num =new Number("123");  
console.log( typeof num.valueOf() ); //number
console.log( typeof num.toString() ); //string
```





## 5. 类型转换



### 5.1 类型转换规则

如果发生了隐式转换，那么各种类型互转符合下面的规则：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/markdown/20210401170804.png)





### 5.2 if语句和逻辑语句

在`if`语句和逻辑语句中，如果只有单个变量，会先将变量转换为`Boolean`值，只有下面几种情况会转换成`false`，其余被转换成`true`：

```
null
undefined
''
NaN
0(包括+0和-0)
false
```



### 5.3 各种数学运算符

我们在对各种非`Number`类型运用数学运算符(`- * /`)时，会先将非`Number`类型转换为`Number`类型;

**Number()方法的强制转换规则：**

- 布尔值：`true`和`false`分别被转换为1和0
- 数字：返回自身
- null：返回0
- undefined：返回NaN
- 字符串
  - 如果字符串中只包含数字，则将其转换为十进制
  - 如果字符串中包含有效的浮点格式，将其转换为浮点数值
  - 如果是空字符串，将其转换为0
  - 如果不是以上格式的字符串，均返回NaN
- symbol：抛出错误
- 对象
  - 如果部署了[Symbol.toPrimitive]，则调用此方法，否则调用对象的valueOf()方法
  - 根据前面的规则转换返回值，则调用对象的toString方法



#### 5.3.1 加号运算符（+）：

注意`+`是个例外，执行`+`操作符时：

- 1.当一侧为`String`类型，被识别为字符串拼接，并会优先将另一侧转换为字符串类型。
- 2.当一侧为`Number`类型，另一侧为原始类型，则将原始类型转换为`Number`类型。
- 3.当一侧为`Number`类型，另一侧为引用类型，将引用类型和`Number`类型转换成字符串后拼接。

```
123 + '123' // 123123   （规则1）
123 + null  // 123    （规则2）
123 + true // 124    （规则2）
123 + {}  // 123[object Object]    （规则3）
```



#### 5.3.2 相等运算符（=）：

- 如果类型相同无须进行类型转换
- 如果其中一个操作值是null或者undefined，那么另一个操作符必须为null或者undefined才会返回true，否则都返回false
- 如果其中一个是symbol类型，那么返回false
- 两个操作值如果都为string和number类型，那么就会将字符串转换为number
- 如果一个操作值是boolean，那么转换成number
- 如果一个操作值为objec，且另一方为string、number，就会把object转为原始类型再进行判断

- if/while 条件判断



**1.NaN**

`NaN`和其他任何类型比较永远返回`false`(包括和他自己)。

```javascript
NaN == NaN // false
```



**2.Boolean**

`Boolean`和其他任何类型比较，`Boolean`首先被转换为`Number`类型。

```javascript
true == 1  // true 
true == '2'  // false
true == ['1']  // true
true == ['2']  // false
```

> 这里注意一个可能会弄混的点：`undefined、null`和`Boolean`比较，虽然`undefined、null`和`false`都很容易被想象成假值，但是他们比较结果是`false`，原因是`false`首先被转换成`0`：

```javascript
undefined == false // false
null == false // false
```



**3.String和Number**

`String`和`Number`比较，先将`String`转换为`Number`类型。

```javascript
123 == '123' // true
'' == 0 // true
```



**4.null和undefined**

`null == undefined`比较结果是`true`，除此之外，`null、undefined`和其他任何结果的比较值都为`false`。

```javascript
null == undefined // true
null == '' // false
null == 0 // false
null == false // false
undefined == '' // false
undefined == 0 // false
undefined == false // false	
```



**5.原始类型和引用类型**

当原始类型和引用类型做比较时，对象类型会依照`ToPrimitive`规则转换为原始类型:

```javascript
  '[object Object]' == {} // true
  '1,2,3' == [1, 2, 3] // true
```

来看看下面这个比较：

```javascript
[] == ![] // true
```

`!`的优先级高于`==`，`![]`首先会被转换为`false`，然后根据上面第二点，`false`转换成`Number`类型`0`，左侧`[]`转换为`0`，两侧比较相等。

```javascript
[null] == false // true
[undefined] == false // true
```

根据数组的`ToPrimitive`规则，数组元素为`null`或`undefined`时，该元素被当做空字符串处理，所以`[null]、[undefined]`都会被转换为`0`。



### 5.4 Object 转换为基本类型规则

1. 如果部署了`[Symbol.toPrimitive]()`方法，优先调用再返回
2. 调用`valueOf()`，如果转换为基础类型则返回
3. 调用`toString()`，如果转换为基础类型则返回
4. 如果都没有返回基础类型会报错

```javascript
var obj = {
	value:1,
	valueOf(){
		return 2
	},
	toString(){
		return 3
	},
	[Symbol.toPrimitive](){
		return 4
	}
}

console.log(obj+1)  // '5'
// 因为有Symbol.toPrimitive，就优先执行这个；如果Symbol.toPrimitive这段代码删掉，则执行valueOf打印结果为3；如果valueOf也去掉，则调用toString返回'31'(字符串拼接)

console.log(10 + {}) // '10[object Object]'
// {}会默认调用valueOf是{}，不是基础类型继续转换；调用toString,返回结果'[object Object]',于是和10进行'+'运算，按照字符串拼接规则来，参考'+'的规则

console.log([1,2,undefined,4,5]+10)  // '1,2,,4,510'
// [1,2,undefined,4,5]会默认先调用valueOf结果还是这个数组，不是基础数据类型继续转换，调用toString，返回'1,2,,4,5',然后再和10进行运算，还是按照字符串拼接规则，参考'+'的第3条规则
```







## 6. 数据类型的检测



### 6.1 typeof

``` javascript
typeof 1 // 'number'
typeof '1' // 'string'
typeof undefined // 'undefined'
typeof true // 'boolean'
typeof Symbol() // 'symbol'
typeof null // 'object'
typeof [] // 'object'
typeof {} // 'object'
typeof console // 'object'
typeof console.log // 'function'
```



### 6.2 instanceof

```javascript
let Car = function(){}
let benz = new Car()
benz instanceof Car // true

let car = new String('Mercedes Benz')
car instanceof String // true

let str = 'Covid-19'
str instanceof Sring //false
```



### 6.3 typeof  和 instanceof的差异

1. `instanceof`可以准确地判断复杂引用数据类型，但是不能正确判断基础数据类型
2. `typeof`可以判断基础数据类型（`null`除外），但是引用数据类型中，除了`function`类型以外，其他的也无法判断



### 6.4 Object.prototype.toString.call

```javascript
Object.prototype.toString.call({}) // "[object Object]"
Object.prototype.toString.call(1) // "[object Number]"
Object.prototype.toString.call('1') // "[object String]"
Object.prototype.toString.call(true) // "[object Boolean]"
Object.prototype.toString.call(function(){}) // "[object Function]"
Object.prototype.toString.call(null) // "[object Null]"
Object.prototype.toString.call(undefined) // "[object Undefined]"
Object.prototype.toString.call(/123/g) // "[object RegExp]"
Object.prototype.toString.call(new Date()) // "[object Date]"
Object.prototype.toString.call([]) // "[object Array]"
Object.prototype.toString.call(document) // "[object HTMLDocument]"
Object.prototype.toString.call(window) // "[object Window]"
```



### 6.5 通用检测方法

```javascript
function getType(obj){
	let type = typeof obj;
	if(type !== 'object'){
		return type
	}
	
	return Object.prototype.toString.call(obj).replace(/^\[object(\S+)\]$/,'$1')
}
```

