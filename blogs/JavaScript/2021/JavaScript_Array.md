---
title: JavaScript 数组
date: 2021-04-13
tags:
 - JavaScript
 - 基础
categories: 
 - JavaScript
---

## 一. Array基础



### 创建一个数组

```js
//字面量
let demo = [1, 2, 3]
// 构造器
let demo1 = Array(),
    demo2 = Array(3),
    demo3 = Array(1,2,3),
    demo4 = new Array(1,2,3);
```



### 构造函数上的方法



#### Array.of()

简单理解就是创建一个新数组的实例,可以看看与Array构造函数区别

语法:

```js
Array.of(element0[, element1[, ...[, elementN]]])
```

用法：

```javascript
Array.of(7);       // [7] 
Array.of(1, 2, 3); // [1, 2, 3]

Array(7);          // [ , , , , , , ]
Array(1, 2, 3);    // [1, 2, 3]
```

两者区别：

`Array.of(7)` 创建一个具有单个元素 **7** 的数组，

`Array(7)` 只传一个数字为创建一个长度为7的空数组，一个以上与`Array.of()`相同

（**注意：**这是指一个有7个空位(empty)的数组，而不是由7个`undefined`组成的数组）



#### Array.isArray()

**Array.isArray()** 用于确定传递的值是否是一个 [`Array`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Array)。

```javascript
Array.isArray([1, 2, 3]);  
// true
Array.isArray({foo: 123}); 
// false
Array.isArray("foobar");   
// false
Array.isArray(undefined);  
// false
```

**手动实现**

```javascript
// Array.isArray
if(!Array.isArray){
    Array.isArray = obj => Object.prototype.toString.call(obj) === '[object Array]'
}
```



#### Array.from()

`Array.from()` 方法从一个类似数组或可迭代对象创建一个新的，浅拷贝的数组实例。

```javascript
Array.from(arrayLike[, mapFn[, thisArg]])
```

**参数**

- arrayLike:  必选，可以传入 
  - 类数组(arguments) 
  - 可迭代对象(set/map)
- mapFn: 可选，相当于Array.from(arrayLike).map(mapFn, thisArg)。
- thisArg: 可选，执行回调函数mapFn时候的this对象。非常有用，利于解耦。可以把被处理的数据和对象分离，thisArg中定义处理函数handle，用来在mapFn中返回调用handle之后的结果。

**用法**

**String**

```javascript
// Array.from()
const demo = Array.from('123')
console.log(demo) //[ 'a', 'b', 'c' ]
```

**new Set()**

```javascript
const Array_demo = Array.from(new Set([1,2,3,4,1,2,3]))
console.log(Array_demo)  // [1,2,3,4]
```

**new Map()**

```javascript
const map = new Map([[1, 2], [2, 4], [4, 8]]);
Array.from(map);
// [[1, 2], [2, 4], [4, 8]]
```

**类数组**

```javascript
const fn = (function() {
    const demo = Array.from(arguments);
    console.log(demo);
})(1,2,3); // [ 1, 2, 3 ]
```

**充分利用第三个参数thisArg**

```javascript
const obj = {
	  handle: x => x * 4 
}
console.log(Array.from([11, 22, 33], function (x) {
    return this.handle(x)
}, obj))
// [44, 88, 132]
```



##### **实现思路**

- 判断arrayLike是否为空
- 根据mapFn判断是否为构造函数，为构造函数，每次遍历时，让`arr[i] = mapFn(iValue,i)`, 不是构造函数时，`arr[i] = iValue`
- 判断thisArg是否存在,存在的话 `arr[i] = mapFn.call(thisArg, iValue,i)`

**参考源码在V8中**  [array.js第1763行开启Array.from之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1763)

```javascript
/**
 * 实现Array.from
 * toInteger方法:返回一个整数
 * toLength方法: 保证len数字合法[0~Number.MAX_SAFE_INTEGER]
 * Number.MAX_SAFE_INTEGER = Math.pow(2,53) - 1
 * 判断arrayLike 为 空 抛出错误
 * mapFn非空并且不是构造函数抛出错误
 * 每次遍历arrayLike,如果mapFn存在, arr[i] = mapFn(iValue,i) 不存在的话 arr[i] = iValue
 * 判断thisArg是否存在,存在的话 arr[i] = mapFn.call(thisArg, iValue,i)
 * */
Array.myfrom = (function () {
  const toStr = Object.prototype.toString
  // 判断是否为函数
  const isCallable = fn => typeof fn === 'function' || toStr.call(fn) === '[object Function]'

  const toInteger = value => {
    const v = Number(value)
    if (isNaN(v)) return 0
    // 无穷大或者0 直接返回
    if (v === 0 || !isFinite(v)) return v
    return (v > 0 ? 1 : -1) * Math.floor(Math.abs(v))
  }
  
  // 最大的范围Number.MAX_SAFE_INTEGER
  const maxSafeInteger = Number.MAX_SAFE_INTEGER

  const toLength = value => {
    const len = toInteger(value)
    return Math.min(maxSafeInteger, Math.max(0, len))
  }
  
  
  return function myfrom (arrayLike/*, mapFn, thisArg*/) {
    const that = this
    if (arrayLike === null) throw new TypeError("Array.from requires an array-like object - not null or undefined")

    const items = Object(arrayLike)
    
    let thisArg = ''
    
    // 判断mapFn是否undefined, 这里最好不要直接使用undefined,因为undefined不是保留字,
    // 很有可能undefined是个值  最好用 void 0 或者 void undefined 
    const mapFn = arguments.length > 1 ? arguments[1] : void 0
    
    if (typeof mapFn !== 'undefined') {
      // 接下来判断第二个参数是不是构造函数
      if (!isCallable(mapFn)) throw new TypeError("Array.from when provided mapFn must be a function")
      if (arguments.length > 2) thisArg = arguments[2]
    }
    
    const len = toLength(items.length)
    const arr = isCallable(that) ? Object(new that(len)) : new Array(len)

    let i = 0,
      iValue;
    while (i < len) {
      iValue = items[i]
      if (mapFn) arr[i] = typeof thisArg === 'undefined' ? mapFn(iValue, i) : mapFn.call(thisArg, iValue, i)
      else
        arr[i] = iValue
      i++
    }
    arr.length = len
    return arr
  }
})()
```



## 二. 常见方法

为了简单记忆，方便查找，将主要方法分为三类 : 数组可遍历方法，会修改原数组方法，返回新数组方法。

### 遍历方法

js中遍历数组并不会改变原始数组的方法总共有12个:

**ES5：**    forEach、every 、some、 filter、map、reduce、reduceRight

**ES6：**    find、findIndex、keys、values、entries

---

#### forEach

**语法：**

```javascript
array.forEach(callback(currentValue, index, arr), thisArg)
```

**参数:**

- `callback：` 为数组中每个元素执行的函数，该函数接收一至三个参数
  - `currentValue`    数组中正在处理的当前元素
  - `index (可选)`      数组中正在处理的当前元素的索引
  - `arr (可选)`           forEach() 方法正在操作的数组

- `thisArg： ` 可选参数,当执行回调函数callback,用作this值

**thisArg用法**

```javascript
function Counter() {
  this.sum = 0;
  this.count = 0;
}

Counter.prototype.add = function(array) {
  array.forEach(function(entry) {
    this.sum += entry;
    ++this.count;
  }, this);
  // ^---- Note
};

const obj = new Counter();
obj.add([2, 5, 9]);
obj.count;
// 3 === (1 + 1 + 1)
obj.sum;
// 16 === (2 + 5 + 9)
```

**实现**

**看看源码v8中array.js [第1258行开始forEach之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1258)**

```javascript
/**
* Array.prototype.forEach(callback, thisArg)
* 除了抛出异常外,无法终止或者跳出forEach()循环
     * 遍历数组
     **/
Array.prototype.myforEach = function (callback, thisArg) {
    if (this == null) throw new TypeError("this is null or not defined")
    let newArr = Object(this)
    let len = newArr.length >>> 0
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    let thatArg = arguments.length >= 2 ? arguments[1] : void 0
    let k = 0

    while (k < len) {
        if (k in newArr) {
            callback.call(thatArg, newArr[k], k, newArr);
        }
        k++
    }
    return void 0
}
```



**从代码角度需要注意的点：**

- 无法中途退出循环，每次你都是调用回调函数的，return只能退出本次回调
- 该方法返回的是undefined, 即使你return 一个值也没有用
- thisArg改变的是回调函数中的this，从源码中可以看出来，还有就是如果回调函数是箭头函数的话，我们知道箭头函数是无法改变this的，所以会忽略thisArg

---

#### every

**定义：**

测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。

**语法:**

```javascript
array.every(function(currentValue, index, arr), thisArg)
```

**参数:**

- ` callback：`为数组中每个元素执行的函数，该函数接收一至三个参数
  - `currentValue`  数组中正在处理的当前元素
  - `index (可选)`   数组中正在处理的当前元素的索引
  - `arr (可选) `    every() 方法正在操作的数组
- `thisArg：` 可选参数,当执行回调函数callback,用作this值Ï



**用法：**

```javascript
function isBigEnough(element, index, array) {
  return element >= 10;
}
[12, 5, 8, 130, 44].every(isBigEnough);
[12, 54, 18, 130, 44].every(isBigEnough);
```



**实现：**

**看看源码v8中array.js [第1322行开始every之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1322)**

```javascript
/**
 * Array.prototype.every(callback, thisArg)
 **/
Array.prototype.myevery = function (callback, thisArg) {
    if (this == null) throw new TypeError("this is null or not defined")
    let newArr = Object(this)
    let len = newArr.length >>> 0
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    let thatArg = arguments.length >= 2 ? arguments[1] : void 0
    let k = 0

    while (k < len) {

        if (k in newArr) {
            let testResult = callback.call(thatArg, newArr[k], k, newArr);
            if (!testResult) return false
        }
        k++
    }
    return true
}
```



**从代码角度来看需要注意的点：**

- 空数组的情况下，只要第一个参数是回调函数，一切情况返回为true
- 要每次返回值都为true,最后返回true,否则为false
- 如果thisArg参数的话，则`callback` 被调用时的 `this` 值，在非严格模式下为全局对象，在严格模式下传入 `undefined`，详见 `this` 条目。
- every不会改变原数组
- `every` 遍历的元素范围在第一次调用 `callback` 之前就已确定了。在调用 `every` 之后添加到数组中的元素不会被 `callback` 访问到。如果数组中存在的元素被更改，则他们传入 `callback` 的值是 `every` 访问到他们那一刻的值。那些被删除的元素或从来未被赋值的元素将不会被访问到。

---

#### some

**定义：**

测试数组中是不是至少有1个元素通过了被提供的函数测试。它返回的是一个Boolean类型的值



**语法:**

```javascript
array.some(function(currentValue, index, arr), thisArg)
```



**参数:**

- `callback：`  为数组中每个元素执行的函数，该函数接收一至三个参数
  - `currentValue`  数组中正在处理的当前元素
  - `index (可选)`   数组中正在处理的当前元素的索引
  - `arr (可选)`        some() 方法正在操作的数组
- `thisArg：`  可选参数,当执行回调函数callback,用作this值



**用法：**

```javascript
function isBiggerThan10(element, index, array) {
  return element > 10;
}
[2, 5, 8, 1, 4].some(isBiggerThan10);  // false
[12, 5, 8, 1, 4].some(isBiggerThan10); // true

//此例中为模仿 includes()  方法, 若元素在数组中存在, 则回调函数返回值为 true :
var fruits = ['apple', 'banana', 'mango', 'guava'];

function checkAvailability(arr, val) {
  return arr.some(function(arrVal) {
    return val === arrVal;
  });
}

checkAvailability(fruits, 'kela');   // false
checkAvailability(fruits, 'banana'); // true
```



**实现**

**看看源码v8中array.js** [第1298行开始some之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1298)

```
		/**
         * 测试数组中是不是至少有1个元素通过了被提供的函数测试
         * Array.prototype.some(callback, thisArg)
         **/
        Array.prototype.mysome = function (callback, thisArg) {
            if (this == null) throw new TypeError("this is null or not defined")
            let newArr = Object(this)
            let len = newArr.length >>> 0
            if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
            let thatArg = arguments.length >= 2 ? arguments[1] : void 0

            for (let i = 0; i < len; i++) {
                if (i in newArr && callback.call(thatArg, newArr[i], i, newArr))
                    return true
            }
            return false
        }
```

**从代码角度来看需要注意的点：**

- some不会改变原数组
- 如果用一个空数组进行测试，在任何情况下它返回的都是`false`
- 如果你回调函数没有返回值，每次都是undefined，最后调用some结果返回也是`false`
- 传入thisArg，回调函数中的this值，取决于this指向规则。



#### filter

**定义：**

创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。

**语法:**

```javascript
let newArray = array.filter(function(currentValue, index, arr), thisArg)
```

**参数:**

- `callback：`  为数组中每个元素执行的函数，该函数接收一至三个参数
  - `currentValue`   数组中正在处理的当前元素
  - ` index (可选)  `    数组中正在处理的当前元素的索引
  - ` arr (可选)  `        filter() 方法正在操作的数组
- `thisArg：`  可选参数,当执行回调函数callback,用作this值



**用法：**

```javascript
function isBigEnough(element) {
  return element >= 10;
}
var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
// filtered is [12, 130, 44] 

var fruits = ['apple', 'banana', 'grapes', 'mango', 'orange'];

/**
 * Array filters items based on search criteria (query)
 */
function filterItems(query) {
  return fruits.filter(function(el) {
      return el.toLowerCase().indexOf(query.toLowerCase()) > -1;
  })
}

console.log(filterItems('ap')); // ['apple', 'grapes']
console.log(filterItems('an')); // ['banana', 'mango', 'orange']
复制代码
```



**看看源码v8中array.js[第1245行开始filter之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1245)**

```javascript
/**
         * 创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。 
         * Array.prototype.filter(callback, thisArg)
         *
         */
Array.prototype.myfilter = function (callback, thisArg) {
    if (this == null) throw new TypeError("this is null or not defined")
    let newArr = Object(this)
    let len = newArr.length >>> 0
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    let thatArg = arguments.length >= 2 ? arguments[1] : void 0,
        resultArr = new Array(len),
        count = 0

    for (let i = 0; i < len; i++) {
        if (i in newArr) {
            if (typeof thatArg === 'undefined' && callback(newArr[i], i, newArr))
                resultArr[count++] = newArr[i]
            if (typeof thatArg !== 'undefined' && callback.call(thatArg, newArr[i], i, newArr))
                resultArr[count++] = newArr[i]
        }
    }
    resultArr.length = count
    return resultArr
}
```



**从代码角度来看需要注意的点：**

- 自定义回调函数要有Boolean返回值，不写默认返回undefined，则转Boolean为false
- 不会修改原始数组，但是会返回一个新数组，包含通过所提供函数实现的测试所以元素
- 没有任何元素通过的话，返回空数组
- `filter` 不会改变原数组，它返回过滤后的新数组
- `filter` 遍历的元素范围在第一次调用 `callback` 之前就已经确定了。在调用 `filter` 之后被添加到数组中的元素不会被 `filter` 遍历到。如果已经存在的元素被改变了，则他们传入 `callback` 的值是 `filter` 遍历到它们那一刻的值。被删除或从来未被赋值的元素不会被遍历到。
- 如果为 `filter` 提供一个 `thisArg` 参数，则它会被作为 `callback` 被调用时的 `this` 值。否则，`callback` 的 `this` 值在非严格模式下将是全局对象，严格模式下为 `undefined`。`callback` 函数最终观察到的 `this` 值是根据通常**函数所看到的 "this"的规则**确定的。
- 特别注意箭头函数中this指向



#### map

**定义：**

创建一个新数组，其结果是该数组中的每个元素是调用一次提供的回调函数后的返回值。

**语法:**

```
let newArray = array.map(function(currentValue, index, arr), thisArg)
复制代码
```

**参数:**

```
 callback:为数组中每个元素执行的函数，该函数接收一至三个参数
 		  currentValue 数组中正在处理的当前元素
 		  index (可选)  数组中正在处理的当前元素的索引
 		  arr (可选)    map() 方法正在操作的数组
 thisArg      可选参数,当执行回调函数callback,用作this值
复制代码
```

**用法：**

```
//数组中每个元素的平方根
var numbers = [1, 4, 9];
var roots = numbers.map(Math.sqrt);
// roots的值为[1, 2, 3], numbers的值仍为[1, 4, 9]

var numbers = [1, 4, 9];
var doubles = numbers.map(function(num) {
  return num * 2;
});

// doubles数组的值为： [2, 8, 18]
// numbers数组未被修改： [1, 4, 9]

//演示如何在一个 String  上使用 map 方法获取字符串中每个字符所对应的 ASCII 码组成的数组：
var map = Array.prototype.map
var a = map.call("Hello World", function(x) { 
  return x.charCodeAt(0); 
})
// a的值为[72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
复制代码
```

**看看源码v8中array.js**[第1333行开始map之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1333)

```javascript
/**
         	* 一个由原数组每个元素执行回调函数的结果组成的新数组 
         * Array.prototype.map(callback, thisArg)
         *
         */
Array.prototype.mymap = function (callback, thisArg) {
    if (this == null) throw new TypeError("this is null or not defined")
    let newArr = Object(this)
    let len = newArr.length >>> 0
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    let thatArg = arguments.length >= 2 ? arguments[1] : void 0,
        resultArr = new Array(len),
        mappedValue

    for (let i = 0; i < len; i++) {
        if (i in newArr) {
            // 可能会有疑惑的地方
            mappedValue = callback.call(thatArg, newArr[i], i, newArr)
            resultArr[i] = mappedValue
        }
    }
    return resultArr
}
```



**从代码角度来看，你需要注意的点：**

- `map`不修改调用它的原数组本身（当然可以在 `callback` 执行时改变原数组）
- 回调函数不返回值时，最后新数组的每个值都为undefined
- `this`的值最终相对于`callback`函数的可观察性是依据`this`规则，也就是this指向问题
- 因为`map`生成一个新数组，当你不打算使用返回的新数组却使用`map`是违背设计初衷的，请用`forEach`或者`for-of`替代。
- `map` 方法处理数组元素的范围是在 `callback` 方法第一次调用之前就已经确定了。调用`map`方法之后追加的数组元素不会被`callback`访问。如果存在的数组元素改变了，那么传给`callback`的值是`map`访问该元素时的值。

---



#### reduce

**定义：**

对数组中的每个元素执行一个由您提供的**reducer**函数(升序执行)，将其结果汇总为单个返回值。

**语法:**

```javascript
let result = array.reduce(callback(accumulator, currentValue, currentIndex, array), initialValue)
```

**参数:**

- `callback：`为数组中每个元素执行的函数，该函数接收一至4个参数
  - `accumulator`   累计器
  - `currentValue` 当前值		
  - `currentIndex` 当前索引
  - `array` 数组
- `initialValue： `  初始值     
  作为第一次调用 callback函数时的第一个参数的值。 如果没有提供初始值，则将使用数组中的第一个元素。 在没有初始值的空数组上调用 reduce 将报错。

**用法：**

用例的只是简单用法，更多的reduce高级用法，最后有参考链接👇

```javascript
const arr = [3, 5, 1, 4, 2];
const a = arr.reduce((t, v) => t + v);
// 等同于
const b = arr.reduce((t, v) => t + v, 0);
```



这可能是最简单的用法了，下面发散一下思维😼

```javascript
// 功能型函数通道
const double = x => x + x;
const triple = x => 3 * x;
const quadruple = x => 4 * x;

// Function composition enabling pipe functionality
const pipe = (...functions) => input => functions.reduce(
    (acc, fn) => fn(acc),
    input
);

// Composed functions for multiplication of specific values
const multiply6 = pipe(double, triple);
const multiply9 = pipe(triple, triple);
const multiply16 = pipe(quadruple, quadruple);
const multiply24 = pipe(double, triple, quadruple);

// Usage
multiply6(6); // 36
multiply9(9); // 81
multiply16(16); // 256
multiply24(10); // 240
```



源码v8中array.js **[第1505行开始reduce之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1505)**

```javascript
/**
         * 对数组中的每个元素执行一个由您提供的reducer函数(升序执行)，将其结果汇总为单个返回值
         * Array.prototype.reduce(callback, initialValue)
         *
         */
Array.prototype.myreduce = function (callback /*, initialValue*/) {
    if (this == null) throw new TypeError("this is null or not defined")
    let newArr = Object(this)
    let len = newArr.length >>> 0
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    let initialValue,
        k = 0

    if (arguments.length >= 2) {
        initialValue = arguments[1]
    } else {
        while (k < len && !(k in newArr))
            k++
        if (k >= len)
            throw new TypeError('Reduce of empty array with no initial value')
        initialValue = newArr[k++]
    }

    for (let i = k; i < len; i++) {
        if (i in newArr) {
            initialValue = callback(initialValue, newArr[i], i, newArr)
        }
    }
    return initialValue
}
```

**从代码角度来看，你需要注意的点：**

- 回调函数第一次执行时，`accumulator` 和`currentValue`的取值有两种情况：如果调用`reduce()`时提供了`initialValue`，`accumulator`取值为`initialValue`，`currentValue`取数组中的第一个值；如果没有提供 `initialValue`，那么`accumulator`取数组中的第一个值，`currentValue`取数组中的第二个值。
- 如果没有提供`initialValue`，reduce 会从索引1的地方开始执行 callback 方法，跳过第一个索引。如果提供`initialValue`，从索引0开始。
- 如果数组为空且没有提供`initialValue`，会抛出[`TypeError`]() 。
- 如果数组仅有一个元素（无论位置如何）并且没有提供`initialValue`， 或者有提供`initialValue`但是数组为空，那么此唯一值将被返回并且`callback`不会被执行。

---



#### reduceRight

从右向左累加，跟reduce相似，源码的实现自然就会了

**定义：**

接受一个函数作为累加器（accumulator）和数组的每个值（从右到左）为单个值。，将其结果汇总为单个返回值。

**语法:**

```javascript
let result = array.reduceRight(callback(accumulator, currentValue, currentIndex, array), initialValue)
```

**参数:**

- `callback：`为数组中每个元素执行的函数，该函数接收一至4个参数
  - `accumulator`   累计器
  - `currentValue` 当前值		
  - `currentIndex` 当前索引
  - `array` 数组
- `initialValue： `  初始值     
  作为第一次调用 callback函数时的第一个参数的值。 如果没有提供初始值，则将使用数组中的第一个元素。 在没有初始值的空数组上调用 reduce 将报错。

**用法：**

这里就举个跟reduce的区别吧👏

```javascript
var a = ['1', '2', '3', '4', '5']; 
var left  = a.reduce(function(prev, cur)      { return prev + cur; }); 
var right = a.reduceRight(function(prev, cur) { return prev + cur; }); 

console.log(left);  // "12345"
console.log(right); // "54321"
```

看看源码v8中array.js  **[第1505行开始reduceRight之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1545)**

---



#### find findIndex

本方法在ECMAScript 6规范中被加入，可能不存在于某些实现中。



**定义：**

**find：返回数组中满足提供的测试函数的第一个元素的值。**否则返回 `undefined`。

**findIndex：数组中通过提供测试函数的第一个元素的索引**。否则，返回-1。



**语法:**

```javascript
let ele = array.find(function(elemnet, index, arr), thisArg)
let eleIndex = array.findIndex(function(elemnet, index, arr), thisArg)
```



**参数:**

两者语法相似

- `callback：`  为数组中每个元素执行的函数，该函数接收一至三个参数
  - `elemnet` 数组中正在处理的当前元素
  - `index (可选)`  数组中正在处理的当前元素的索引
  - `arr (可选)`     find方法正在操作的数组
- `thisArg：`  可选参数,当执行回调函数callback,用作this值



**find用法：**

```javascript
//寻找数组中的质数
function isPrime(element, index, array) {
  var start = 2;
  while (start <= Math.sqrt(element)) {
    if (element % start++ < 1) {
      return false;
    }
  }
  return element > 1;
}

console.log([4, 6, 8, 12].find(isPrime)); // undefined, not found
console.log([4, 5, 8, 12].find(isPrime)); // 5
```



**findIndex用法：**

```javascript
//找数组中首个质数元素的索引 不存在素数返回-1
function isPrime(element, index, array) {
  var start = 2;
  while (start <= Math.sqrt(element)) {
    if (element % start++ < 1) {
      return false;
    }
  }
  return element > 1;
}

console.log([4, 6, 8, 12].findIndex(isPrime)); // -1, not found
console.log([4, 6, 7, 12].findIndex(isPrime)); // 2
```



看看源码v8中array.js **[第1633行开始find之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1633)**

```javascript
/**
     * 返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined
     * Array.prototype.find(callback, thisArg)
     *
     */
Array.prototype.myfind = function (callback /*, thisArg */) {
    if (this == null) throw new TypeError("this is null or not defined")
    let newArr = Object(this)
    let len = newArr.length >>> 0
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');

    let thatArg = arguments.length >= 2 ? arguments[1] : void 0

    for (let i = 0; i < len; i++) {
        if (i in newArr && callback.call(thatArg, newArr[i], i, newArr))
            return newArr[i]
    }
    return void 0
}
```

findIndex函数实现的原理一样，但返回是下标



**从代码角度看需要注意的点：**

- find方法不会改变原始数组
- 在第一次调用 `callback`函数时会确定元素的索引范围，因此在 `find`方法开始执行之后添加到数组的新元素将不会被 `callback`函数访问到。
- 如果数组中一个尚未被`callback`函数访问到的元素的值被`callback`函数所改变，那么当`callback`函数访问到它时，它的值是将是根据它在数组中的索引所访问到的当前值。被删除的元素仍旧会被访问到，但是其返回值已经是undefined了。
- 我看了很多关于find函数说法，我个人认为不指定`thisArg`参数的话，回调函数this指向并不是一直都是undefined，更合理的说话，**this符合this指向规则**。



## 三.改变原始数组方法



#### splice

**定义：**

通过删除或替换现有元素或者原地添加新的元素来修改数组,并以数组形式返回被修改的内容，**注意此方法会改变原数组**

**语法:**

```
array.splice(start,deleteCount,item1,.....,itemX)
复制代码
```

**参数:**

- start: 指定修改的开始位置（从0计数）
  1. 如果超出了数组的长度，则从数组末尾开始添加内容
  2. 如果是负值，则表示从数组末位开始的第几位（从-1计数，这意味着 `-n` 是倒数第 `n` 个元素，并且等价于 `array.length-n` ）
  3. 如果负数的绝对值大于数组的长度，则表示开始位置为第0位
- deleteCount(可选) : 整数,表示要移除的数组元素个数	
  1. 如果 `deleteCount` 大于 `start` 之后的元素的总数，则从 `start` 后面的元素都将被删除(含第 start 位)
  2. 如果 `deleteCount` 被省略了，或者它的值大于等于 `array.length - start` (也就是说，如果它大于或者等于start之后的所有元素的数量)，那么 `start` 之后数组的所有元素都会被删除。
  3. 如果 `deleteCount` 是 0 或者负数，则不移除元素。这种情况下，至少应添加一个新元素。
     item1, item2, ...(可选) 

**要添加进数组的元素,从start 位置开始。如果不指定，则 splice() 将只删除数组元素。**



**用法：**

```javascript
//从第 2 位开始删除 0 个元素，插入“drum”
var myFish = ["angel", "clown", "mandarin", "sturgeon"];
var removed = myFish.splice(2, 0, "drum");

// 运算后的 myFish: ["angel", "clown", "drum", "mandarin", "sturgeon"]
// 被删除的元素: [], 没有元素被删除
// 从第 2 位开始删除 0 个元素，插入“drum” 和 "guitar"
var removed2 = myFish.splice(2, 0, 'drum', 'guitar');
// 运算后的 myFish: ["angel", "clown", "drum", "guitar", "mandarin", "sturgeon"]
// 被删除的元素: [], 没有元素被删除
```

从第 2 位开始删除 1 个元素，插入“trumpet”

```javascript
var myFish = ['angel', 'clown', 'drum', 'sturgeon'];
var removed = myFish.splice(2, 1, "trumpet");

// 运算后的 myFish: ["angel", "clown", "trumpet", "sturgeon"]
// 被删除的元素: ["drum"]
```

从第 0 位开始删除 2 个元素，插入"parrot"、"anemone"和"blue"

```javascript
var myFish = ['angel', 'clown', 'trumpet', 'sturgeon'];
var removed = myFish.splice(0, 2, 'parrot', 'anemone', 'blue');

// 运算后的 myFish: ["parrot", "anemone", "blue", "trumpet", "sturgeon"]
// 被删除的元素: ["angel", "clown"]
```

从倒数第 2 位开始删除 1 个元素

```javascript
var myFish = ['angel', 'clown', 'mandarin', 'sturgeon'];
var removed = myFish.splice(-2, 1);

// 运算后的 myFish: ["angel", "clown", "sturgeon"]
// 被删除的元素: ["mandarin"]
```

从第 2 位开始删除所有元素

```javascript
var myFish = ['angel', 'clown', 'mandarin', 'sturgeon'];
var removed = myFish.splice(2);

// 运算后的 myFish: ["angel", "clown"]
// 被删除的元素: ["mandarin", "sturgeon"]
```



看看源码v8中array.js **[第876行开始splice之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L876)**

---



#### sort

**定义：**

对数组的元素进行排序，并返回数组，**注意此方法会改变原数组**

**语法:**

```javascript
arr.sort([compareFunction])
```

**参数:**

 `compareFunction` 可选

1. 用来指定按某种顺序进行排列的函数。如果省略，元素按照转换为的字符串的各个字符的Unicode位点进行排序。
2. 指明了compareFunction，
3. 如果 `compareFunction(a, b)` 小于 0 ，那么 a 会被排列到 b 之前；
4. 如果 `compareFunction(a, b)` 等于 0 ， a 和 b 的相对位置不变。
5. 如果 `compareFunction(a, b)` 大于 0 ， b 会被排列到 a 之前.

**用法：**

```javascript
var numbers = [4, 2, 5, 1, 3];
numbers.sort(function(a, b) {
  return a - b;
});
console.log(numbers);

//也可以写成：
var numbers = [4, 2, 5, 1, 3]; 
numbers.sort((a, b) => a - b); 
console.log(numbers);

// [1, 2, 3, 4, 5]
```

对非 ASCII 字符排序

```javascript
//当排序非 ASCII 字符的字符串（如包含类似 e, é, è, a, ä 等字符的字符串）。
//一些非英语语言的字符串需要使用 String.localeCompare。这个函数可以将函数排序到正确的顺序。
var items = ['réservé', 'premier', 'cliché', 'communiqué', 'café', 'adieu'];
items.sort(function (a, b) {
  return a.localeCompare(b);
});

// items is ['adieu', 'café', 'cliché', 'communiqué', 'premier', 'réservé']
```

---



#### pop

**定义：**

从数组中删除最后一个元素，并返回该元素的值。此方法更改数组的长度。

**语法:**

```javascript
arr.pop()
//从数组中删除的元素(当数组为空时返回undefined)。
```

**描述:**

1. pop 方法从一个数组中删除并返回最后一个元素。
2. pop方法根据 length属性来确定最后一个元素的位置。
3. 如果不包含length属性或length属性不能被转成一个数值，会将length置为0，并返回undefined。
4. 如果你在一个空数组上调用 pop()，它返回  undefined。

**用法：**

```javascript
let myFish = ["angel", "clown", "mandarin", "surgeon"];

let popped = myFish.pop();

console.log(myFish); 
// ["angel", "clown", "mandarin"]

console.log(popped); 
// surgeon
```

---



#### shift

**定义：**

从数组中删除**第一个**元素，并返回该元素的值。此方法更改数组的长度。

**语法:**

```javascript
arr.shift()
//从数组中删除的元素; 如果数组为空则返回undefined 。 
```

**描述:**

1. shift 方法移除索引为 0 的元素(即第一个元素)，并返回被移除的元素，其他元素的索引值随之减 1
2. 如果 length 属性的值为 0 (长度为 0)，则返回 undefined。
3. shift 方法并不局限于数组：这个方法能够通过 call 或 apply 方法作用于类似数组的对象上
4. 对于没有 length 属性（从0开始的一系列连续的数字属性的最后一个）的对象，调用该方法可能没有任何意义。

**用法：**

```javascript
let myFish = ['angel', 'clown', 'mandarin', 'surgeon'];

console.log('调用 shift 之前: ' + myFish);
// "调用 shift 之前: angel,clown,mandarin,surgeon"

var shifted = myFish.shift(); 

console.log('调用 shift 之后: ' + myFish); 
// "调用 shift 之后: clown,mandarin,surgeon" 

console.log('被删除的元素: ' + shifted); 
// "被删除的元素: angel"
```

---



#### unshift

**定义：**

将一个或多个元素添加到数组的**开头**，并返回该数组的**新长度(该**方法修改原有数组

**语法:**

```javascript
arr.unshift(element1, ..., elementN)
// element要添加到数组开头的元素或多个元素。
```

**描述:**

1. unshift 方法会在调用它的类数组对象的开始位置插入给定的参数。
2. unshift 特意被设计成具有通用性；这个方法能够通过 call 或 apply 方法作用于类数组对象上
3. 不过对于没有 length 属性（代表从0开始的一系列连续的数字属性的最后一个）的对象，调用该方法可能没有任何意义。
4. 注意, 如果传入多个参数，它们会被以块的形式插入到对象的开始位置，它们的顺序和被作为参数传入时的顺序一致
5. 传入多个参数调用一次 unshift ，和传入一个参数调用多次 unshift (例如，循环调用)，它们将得到不同的结果。例如:


**用法：**

```javascript
let arr = [4,5,6];
arr.unshift(1,2,3);
console.log(arr); // [1, 2, 3, 4, 5, 6]

arr = [4,5,6]; // 重置数组
arr.unshift(1);
arr.unshift(2);
arr.unshift(3);
console.log(arr); // [3, 2, 1, 4, 5, 6]
```

再看一个例子

```javascript
arr.unshift(0); // result of the call is 3, which is the new array length
// arr is [0, 1, 2]

arr.unshift(-2, -1); // the new array length is 5
// arr is [-2, -1, 0, 1, 2]

arr.unshift([-4, -3]); // the new array length is 6
// arr is [[-4, -3], -2, -1, 0, 1, 2]

arr.unshift([-7, -6], [-5]); // the new array length is 8
// arr is [ [-7, -6], [-5], [-4, -3], -2, -1, 0, 1, 2 ]
```

---



#### push

**定义：**

将一个或多个元素添加到数组的末尾，并返回该数组的新长度

**语法:**

```javascript
arr.push(element1, ..., elementN)
// element要添加到数组末尾的元素或多个元素。
// 放回值:当调用该方法时，新的 length 属性值将被返回。
```

**描述:**

```javascript
1. push 方法具有通用性。该方法和 call() 或 apply() 一起使用时，可应用在类似数组的对象上。
2. push 方法根据 length 属性来决定从哪里开始插入给定的值。
3. 如果 length 不能被转成一个数值，则插入的元素索引为 0，包括 length 不存在时。当 length 不存在时，将会创建它。
```

**用法：**

添加元素到数组

```javascript
var sports = ["soccer", "baseball"];
var total = sports.push("football", "swimming");

console.log(sports); 
// ["soccer", "baseball", "football", "swimming"]

console.log(total);  
// 4
```

像数组一样使用对象

```javascript
var obj = {
    length: 0,

    addElem: function addElem (elem) {
        // obj.length is automatically incremented 
        // every time an element is added.
        [].push.call(this, elem);
    }
};

// Let's add some empty objects just to illustrate.
obj.addElem({});
obj.addElem({});
console.log(obj.length);
// → 2
//注意，尽管 obj 不是数组，但是 push 方法成功地使 obj 的 length 属性增长了，就像我们处理一个实际的数组一样。
```

---



#### reverse

**定义：**

将数组中元素的位置颠倒，并返回该数组。数组的第一个元素会变成最后一个，数组的最后一个元素变成第一个。该方法会改变原数组。

**语法:**

```javascript
arr.reverse()
// 放回值:颠倒后的数组
```

**描述:**

```javascript
1. reverse 方法颠倒数组中元素的位置，改变了数组，并返回该数组的引用。
2. reverse方法是特意类化的；此方法可被 called 或 applied于类似数组对象。
3. 对象如果不包含反映一系列连续的、基于零的数值属性中的最后一个长度的属性，则该对象可能不会以任何有意义的方式运行。
```

**用法：**

颠倒数组中的元素

```javascript
const a = [1, 2, 3];

console.log(a); // [1, 2, 3]

a.reverse(); 

console.log(a); // [3, 2, 1]
```

颠倒类数组中的元素

```javascript
onst a = {0: 1, 1: 2, 2: 3, length: 3};

console.log(a); // {0: 1, 1: 2, 2: 3, length: 3}

Array.prototype.reverse.call(a); //same syntax for using apply()

console.log(a); // {0: 3, 1: 2, 2: 1, length: 3}
```



#### copyWithin

**定义：**

浅复制数组的一部分到**同一数组**中的另一个位置，并返回它，不会改变原数组的长度。

**语法:**

```javascript
array.copyWithin(target, start = 0, end = this.length)
// 返回值:改变后的数组。
```

**参数:**

1. target

  0 为基底的索引，复制序列到该位置。如果是负数，`target` 将从末尾开始计算。

  如果 `target` 大于等于 `arr.length`，将会不发生拷贝。如果 `target` 在 `start` 之后，复制的序列将被修改以符合 `arr.length`。

2. start

   0 为基底的索引，开始复制元素的起始位置。如果是负数，`start` 将从末尾开始计算。

   如果 `start` 被忽略，`copyWithin` 将会从0开始复制。

3. end

   0 为基底的索引，开始复制元素的结束位置。`copyWithin` 将会拷贝到该位置，但不包括 `end` 这个位置的元素。如果是负数， `end` 将从末尾开始计算。

**注意：**

1. 参数 target、start 和 end 必须为整数。
2. 如果 start 为负，则其指定的索引位置等同于 length+start，length 为数组的长度。end 也是如此。
3. copyWithin 是一个可变方法，它不会改变 this 的长度 length，但是会改变 this 本身的内容，且需要时会创建新的属性。

**用法：**

```javascript
const a = [1, 2, 3];
[1, 2, 3, 4, 5].copyWithin(-2)
// [1, 2, 3, 1, 2]

[1, 2, 3, 4, 5].copyWithin(0, 3)
// [4, 5, 3, 4, 5]

[1, 2, 3, 4, 5].copyWithin(0, 3, 4)
// [4, 2, 3, 4, 5]

[1, 2, 3, 4, 5].copyWithin(-2, -3, -1)
// [1, 2, 3, 3, 4]

[].copyWithin.call({length: 5, 3: 1}, 0, 3);
// {0: 1, 3: 1, length: 5}
console.log(a); // [1, 2, 3]

a.reverse(); 

console.log(a); // [3, 2, 1]
```

---



#### fill

**定义：**

用一个固定值填充一个数组中从起始索引到终止索引内的全部元素。不包括终止索引。

**语法:**

```javascript
arr.fill(value, start, end )
// 放回值:修改后的数组。
```

**参数:**

value

1. 用来填充数组元素的值。

start (可选)

1. 起始索引，默认值为0。

end  (可选)

1. 终止索引，默认值为 this.length。

**描述：**

1. 如果 start 是个负数, 则开始索引会被自动计算成为 length+start，其中 length 是 this 对象的 length 属性值
2. fill 方法故意被设计成通用方法, 该方法不要求 this 是数组对象。
3. fill 方法是个可变方法, 它会改变调用它的 this 对象本身, 然后返回它, 而并不是返回一个副本。
4. 当一个对象被传递给 fill方法的时候, 填充数组的是这个对象的引用。 

**用法：**

```javascript
[1, 2, 3].fill(4);               // [4, 4, 4]
[1, 2, 3].fill(4, 1);            // [1, 4, 4]
[1, 2, 3].fill(4, 1, 2);         // [1, 4, 3]
[1, 2, 3].fill(4, 1, 1);         // [1, 2, 3]
[1, 2, 3].fill(4, 3, 3);         // [1, 2, 3]
[1, 2, 3].fill(4, -3, -2);       // [4, 2, 3]
[1, 2, 3].fill(4, NaN, NaN);     // [1, 2, 3]
[1, 2, 3].fill(4, 3, 5);         // [1, 2, 3]
Array(3).fill(4);                // [4, 4, 4]
[].fill.call({ length: 3 }, 4);  // {0: 4, 1: 4, 2: 4, length: 3}
// Objects by reference.
var arr = Array(3).fill({}) // [{}, {}, {}];
// 需要注意如果fill的参数为引用类型，会导致都执行都一个引用类型
// 如 arr[0] === arr[1] 为true
arr[0].hi = "hi"; // [{ hi: "hi" }, { hi: "hi" }, { hi: "hi" }]
```

**看看源码v8中array.js** **[第1700行开始fill之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1700) **



## 四.不改变原始数组方法



#### slice

**定义：**

返回一个新的数组对象，这一对象是一个由 `begin` 和 `end` 决定的原数组的**浅拷贝**（包括 `begin`，不包括`end`）。原始数组不会被改变。

关于深浅拷贝，可以看看我这篇[**面试如何写出一个满意的深拷贝(适合初级前端)**](https://juejin.im/post/5efc5944f265da22eb2a5ba4)

**语法:**

```
arr.slice([begin[, end]])
复制代码
```

**参数:**

 `begin (可选)`

  1. 提取起始处的索引（从 0 开始），从该索引开始提取原数组元素。
  2. 如果该参数为负数，则表示从原数组中的倒数第几个元素开始提取
  3. slice(-2) 表示提取原数组中的倒数第二个元素到最后一个元素（包含最后一个元素）
  4. 如果省略 begin，则 slice 从索引 0 开始。
  5. 如果 begin 大于原数组的长度，则会返回空数组。	

 `end   (可选)`

  1.	 slice(1,4) 会提取原数组中从第二个元素开始一直到第四个元素的所有元素 （索引为 1, 2, 3的元素）
  2.	 如果该参数为负数， 则它表示在原数组中的倒数第几个元素结束抽取。
  3.	 如果 end 被省略，则 slice 会一直提取到原数组末尾。
  4.	 如果 end 大于数组的长度，slice 也会一直提取到原数组末尾。

**用法：**

返回现有数组的一部分

```javascript
var fruits = ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango'];
var citrus = fruits.slice(1, 3);

// fruits contains ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango']
// citrus contains ['Orange','Lemon']
```

当数组中存在引用类型的值时，浅拷贝的是引用类型地址

```javascript
// 使用 slice 方法从 myCar 中创建一个 newCar。
var myHonda = { color: 'red', wheels: 4, engine: { cylinders: 4, size: 2.2 } };
var myCar = [myHonda, 2, "cherry condition", "purchased 1997"];
var newCar = myCar.slice(0, 2);
newCar[0].color = 'blue';
console.log(myHonda.color)  // bule
```

类数组对象转换为数组

```javascript
function list() {
  return Array.prototype.slice.call(arguments);
}

var list1 = list(1, 2, 3); // [1, 2, 3]
//你也可以简单的使用 [].slice.call(arguments) 来代替
```

看看源码v8中array.js[第762行开始slice之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L762)

```javascript
(function () {
  'use strict';
  var _slice = Array.prototype.slice;

  try {
    // Can't be used with DOM elements in IE < 9
    _slice.call(document.documentElement);
  } catch (e) { // Fails in IE < 9
    // This will work for genuine arrays, array-like objects, 
    // NamedNodeMap (attributes, entities, notations),
    // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
    // and will not fail on other DOM objects (as do DOM elements in IE < 9)
    Array.prototype.slice = function(begin, end) {
      // IE < 9 gets unhappy with an undefined end argument
      end = (typeof end !== 'undefined') ? end : this.length;

      // For native Array objects, we use the native slice function
      if (Object.prototype.toString.call(this) === '[object Array]'){
        return _slice.call(this, begin, end); 
      }
      // For array like object we handle it ourselves.
      var i, cloned = [],
        size, len = this.length;
      // Handle negative value for "begin"
      var start = begin || 0;
      start = (start >= 0) ? start : Math.max(0, len + start);
      // Handle negative value for "end"
      var upTo = (typeof end == 'number') ? Math.min(end, len) : len;
      if (end < 0) {
        upTo = len + end;
      }
      // Actual expected size of the slice
      size = upTo - start;
      if (size > 0) {
        cloned = new Array(size);
        if (this.charAt) {
          for (i = 0; i < size; i++) {
            cloned[i] = this.charAt(start + i);
          }
        } else {
          for (i = 0; i < size; i++) {
            cloned[i] = this[start + i];
          }
        }
      }

      return cloned;
    };
  }
}());
```

我更多的觉得这个是一个模拟的过程，唯一有点难把握的就是边界值的确定，所以找来了一份规范下的代码,你们可以参考一下。

**从代码角度来看，你需要注意的点：**

- 用法的话，看看参数一章节就行啦🈯
- 关于深浅拷贝的问题，如果该元素是个对象引用 （不是实际的对象），`slice` 会拷贝这个对象引用到新的数组里。两个对象引用都引用了同一个对象。如果被引用的对象发生改变，则新的和原来的数组中的这个元素也会发生改变。
- 如果向两个数组任一中添加了新元素，则另一个不会受到影响。
- 深浅拷贝，可以看看这篇文章[**面试如何写出一个满意的深拷贝(适合初级前端)**](https://juejin.im/post/5efc5944f265da22eb2a5ba4)

---



#### join

**定义：**

将一个数组（或一个**类数组对象**）的所有元素连接成一个字符串并返回这个字符串。如果数组只有一个项目，那么将返回该项目而不使用分隔符。

**语法:**

```javascript
arr.join(separator)
```



**参数:**

separator (可选)
指定一个字符串来分隔数组的每个元素。
如果需要，将分隔符转换为字符串。
如果缺省该值，数组元素用逗号（,）分隔。
如果separator是空字符串("")，则所有元素之间都没有任何字符。



**用法：**

使用四种不同的分隔符连接数组元素

```javascript
var a = ['Wind', 'Rain', 'Fire'];
var myVar1 = a.join();      // myVar1的值变为"Wind,Rain,Fire"
var myVar2 = a.join(', ');  // myVar2的值变为"Wind, Rain, Fire"
var myVar3 = a.join(' + '); // myVar3的值变为"Wind + Rain + Fire"
var myVar4 = a.join('');    // myVar4的值变为"WindRainFire"
```

连接类数组对象

```javascript
function f(a, b, c) {
  var s = Array.prototype.join.call(arguments);
  console.log(s); // '1,a,true'
}
f(1, 'a', true);
```

看看源码v8中array.js **[第468行开始join之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L468)**

---



#### toString

**定义：**

返回一个字符串，表示指定的数组及其元素。

**语法:**

```javascript
arr.toString()
```

当一个数组被作为文本值或者进行字符串连接操作时，将会自动调用其 `toString` 方法。

**用法：**

```javascript
const array1 = [1, 2, 'a', '1a'];
console.log(array1.toString());
// expected output: "1,2,a,1a"
```

---



#### concat

**定义：**

用于合并两个或多个数组。此方法不会更改现有数组，而是返回一个新数组。

**语法:**

```javascript
 var newArr =oldArray.concat(arrayX,arrayX,......,arrayX)
```

**参数:**

`arrayx(可选)`
将数组和/或值连接成新数组。
如果省略了参数，则concat会返回一个它所调用的已存在的数组的浅拷贝。



**用法：**

以下代码将两个数组合并为一个新数组：

```javascript
var alpha = ['a', 'b', 'c'];
var numeric = [1, 2, 3];

alpha.concat(numeric);
// result in ['a', 'b', 'c', 1, 2, 3]
```

连接三个数组

```javascript
var num1 = [1, 2, 3],
    num2 = [4, 5, 6],
    num3 = [7, 8, 9];
var nums = num1.concat(num2, num3);
console.log(nums); 
// results in [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

将值连接到数组

```javascript
var alpha = ['a', 'b', 'c'];

var alphaNumeric = alpha.concat(1, [2, 3]);

console.log(alphaNumeric); 
// results in ['a', 'b', 'c', 1, 2, 3]
```

**注意：**

- `concat`方法不会改变`this`或任何作为参数提供的数组，而是返回一个浅拷贝
- `concat`将对象引用复制到新数组中。 原始数组和新数组都引用相同的对象。 也就是说，如果引用的对象被修改，则更改对于新数组和原始数组都是可见的。 这包括也是数组的数组参数的元素。
- 数组/值在连接时保持不变。此外，对于新数组的任何操作（仅当元素不是对象引用时）都不会对原始数组产生影响，反之亦然。



#### indexOf

**定义：**

返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回-1。

**语法:**

```javascript
array.indexOf(searchElement,fromIndex)
```

**参数:**

searchElement  (必选)  要查找的元素
fromIndex 

1. 开始查找的位置。如果该索引值大于或等于数组长度，意味着不会在数组里查找，返回-1。

2. 如果参数中提供的索引值是一个负值，则将其作为数组末尾的一个抵消，即-1表示从最后一个元素开始查找

3. 注意：如果参数中提供的索引值是一个负值，并不改变其查找顺序，查找顺序仍然是从前向后查询数组。如果抵消后的索引值仍小于0，则整个数组都将会被查询。其默认值为0.

4. 采用的是严格等于 `===`

    

**用法：**

`indexOf`方法确定多个值在数组中的位置

```javascript
var array = [2, 5, 9];
array.indexOf(2);     // 0
array.indexOf(7);     // -1
array.indexOf(9, 2);  // 2
array.indexOf(2, -1); // -1
array.indexOf(2, -3); // 0
```

找出指定元素出现的所有位置

```javascript
var indices = [];
var array = ['a', 'b', 'a', 'c', 'a', 'd'];
var element = 'a';
var idx = array.indexOf(element);
while (idx != -1) {
  indices.push(idx);
  idx = array.indexOf(element, idx + 1);
}
console.log(indices);
// [0, 2, 4]
```

`indexOf()`不能识别`NaN`

```javascript
let a = ['啦啦', 2, 4, 24, NaN]
console.log(a.indexOf('啦')); // -1 
console.log(a.indexOf(NaN)); // -1 
console.log(a.indexOf('啦啦')); // 0
```

看看源码v8中array.js[第1411行开始indexOf之旅](https://github.com/v8/v8/blob/4.9-lkgr/src/js/array.js#L1411)

```javascript
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;
    // 1. Let O be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }
    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }
    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }
    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    // 9. Repeat, while k < len
    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
```



#### lastIndexOf

**定义：**

返回指定元素（也即有效的 JavaScript 值或变量）在数组中的最后一个的索引，如果不存在则返回 -1。从数组的后面向前查找，从 `fromIndex` 处开始。

**语法:**

```javascript
arr.lastIndexOf(searchElement,fromIndex)
```



**参数:**

searchElement  (必选)  要查找的元素
fromIndex 

1. 从此位置开始逆向查找
2. 默认为数组的长度减 1 `(arr.length - 1)` ，即整个数组都被查找
3. 如果该值大于或等于数组的长度，则整个数组会被查找。如果为负值，将其视为从数组末尾向前的偏移
4. 即使该值为负，数组仍然会被从后向前查找。如果该值为负时，其绝对值大于数组长度，则方法返回 -1，即数组不会被查找。



**用法：**

数组中该元素最后一次出现的索引，如未找到返回-1。

```javascript
var array = [2, 5, 9, 2];
var index = array.lastIndexOf(2);
// index is 3
index = array.lastIndexOf(7);
// index is -1
index = array.lastIndexOf(2, 3);
// index is 3
index = array.lastIndexOf(2, 2);
// index is 0
index = array.lastIndexOf(2, -2);
// index is 0
index = array.lastIndexOf(2, -1);
// index is 3
```

