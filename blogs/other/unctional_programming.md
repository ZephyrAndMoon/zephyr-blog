---
title: 函数式编程
date: 2021-06-10
tags:
 - 其他
categories: 
 - Other
---

## 第一章：一等公民函数

### 快速概览

当说函数是“一等公民”的时候，实际上说的是它们和其他对象都一样——把它们存在数组里，当作参数传递，赋值给变量...等等。

这是 JavaScript 语言的基础概念，不过还是值得提一提的，因为在 Github 上随便一搜就能看到对这个概念的集体无视，或者也可能是无知。来看一个杜撰的例子：

```javascript
const hi = name => `Hi ${name}`;
const greeting = name => hi(name);
```

这里 `greeting` 指向的那个把 `hi` 包了一层的包裹函数完全是多余的。因为 JavaScript 的函数是*可调用*的，当 `hi` 后面紧跟 `()` 的时候就会运行并返回一个值；如果没有 `()`，`hi` 就简单地返回存到这个变量里的函数。

```javascript
hi; // name => `Hi ${name}`
hi("jonas"); // "Hi jonas"
```

`greeting` 只不过是转了个身然后以相同的参数调用了 `hi` 函数而已，因此我们可以这么写：

```js
const greeting = hi;
greeting("times"); // "Hi times"
```

用一个函数把另一个函数包起来，目的仅仅是延迟执行，是非常糟糕的编程习惯。

充分理解这个问题对读懂本书后面的内容至关重要，所以再来看几个例子。以下代码都来自 npm 上的模块包：

```js
// bad
const getServerStuff = callback => ajaxCall(json => callback(json));

// good
const getServerStuff = ajaxCall;
```

世界上到处都充斥着这样的垃圾 ajax 代码。以下是上述两种写法等价的原因：

```js
// 这行
ajaxCall(json => callback(json));

// 等价于这行
ajaxCall(callback);

// 那么，重构下 getServerStuff
const getServerStuff = callback => ajaxCall(callback);

// ...就等于
const getServerStuff = ajaxCall // <-- 看，没有括号哦
```

以上才是写函数的正确方式

```js
const BlogController = {
  index(posts) { return Views.index(posts); },
  show(post) { return Views.show(post); },
  create(attrs) { return Db.create(attrs); },
  update(post, attrs) { return Db.update(post, attrs); },
  destroy(post) { return Db.destroy(post); },
};
```

这个可笑的控制器（controller）99% 的代码都是垃圾。可以把它重写成这样：

```js
const BlogController = {
  index: Views.index,
  show: Views.show,
  create: Db.create,
  update: Db.update,
  destroy: Db.destroy,
};
```

...或者直接全部删掉，因为它的作用仅仅就是把视图（Views）和数据库（Db）打包在一起而已。



### 为何钟爱一等公民

现在来看看钟爱一等公民的原因是什么。前面 `getServerStuff` 和 `BlogController` 两个例子虽说添加一些没有实际用处的间接层实现起来很容易，但这样做除了徒增代码量，提高维护和检索代码的成本外，没有任何用处。

另外，如果一个函数被不必要地包裹起来了，而且发生了改动，那么包裹它的那个函数也要做相应的变更。

```js
httpGet('/post/2', json => renderPost(json));
```

如果 `httpGet` 要改成可以抛出一个可能出现的 `err` 异常，那我们还要回过头去把“胶水”函数也改了。

```js
// 把整个应用里的所有 httpGet 调用都改成这样，可以传递 err 参数。
httpGet('/post/2', (json, err) => renderPost(json, err));
```

写成一等公民函数的形式，要做的改动将会少得多：

```js
httpGet('/post/2', renderPost);  // renderPost 将会在 httpGet 中调用，想要多少参数都行
```

除了删除不必要的函数，正确地为参数命名也必不可少。当然命名不是什么大问题，但还是有可能存在一些不当的命名，尤其随着代码量的增长以及需求的变更，这种可能性也会增加。

项目中常见的一种造成混淆的原因是，针对同一个概念使用不同的命名。还有通用代码的问题。比如，下面这两个函数做的事情一模一样，但后一个就显得更加通用，可重用性也更高：

```js
// 只针对当前的博客
const validArticles = articles =>
  articles.filter(article => article !== null && article !== undefined),

// 对未来的项目更友好
const compact = xs => xs.filter(x => x !== null && x !== undefined);
```

在命名的时候，特别容易把自己限定在特定的数据上（本例中是 `articles`）。这种现象很常见，也是重复造轮子的一大原因。

有一点必须得指出，一定要非常小心 `this` 值，别让它反咬你一口，这一点与面向对象代码类似。

```js
var fs = require('fs');

// 太可怕了
fs.readFile('freaky_friday.txt', Db.save);

// 好一点点
fs.readFile('freaky_friday.txt', Db.save.bind(Db));
```

把 Db 绑定（bind）到它自己身上以后，就可以随心所欲地调用它的原型链式垃圾代码了。



## 第 2 章：纯函数的好处

### 再次强调"纯"

厘清纯函数的概念。

> 纯函数是这样一种函数，即相同的输入，永远会得到相同的输出，而且没有任何可观察的副作用。

比如 `slice` 和 `splice`，这两个函数的作用并无二致——但是注意，它们各自的方式却大不同，但不管怎么说作用还是一样的。`slice` 符合*纯*函数的定义是因为对相同的输入它保证能返回相同的输出。而` splice` 却会嚼烂调用它的那个数组，然后再吐出来；这就会产生可观察到的副作用，即这个数组永久地改变了。

```js
var xs = [1,2,3,4,5];

// 纯的
xs.slice(0,3);
//=> [1,2,3]

xs.slice(0,3);
//=> [1,2,3]


// 不纯的
xs.splice(0,3);
//=> [1,2,3]

xs.splice(0,3);
//=> [4,5]
```

在函数式编程中，相对于这种会*改变*数据具有副作用的函数，应该追求的是那种可靠的，每次都能返回同样结果的函数，而不是像 `splice` 这样每次调用后都把数据弄得一团糟的函数。

来看看另一个例子：

```js
// 不纯的
var minimum = 21;

var checkAge = function(age) {
  return age >= minimum;
};


// 纯的
var checkAge = function(age) {
  var minimum = 21;
  return age >= minimum;
};
```

在不纯的版本中，`checkAge` 的结果将取决于 `minimum` 这个可变变量的值。换句话说，它取决于系统状态（system state）；因为它引入了外部的环境，从而增加了认知负荷（cognitive load）。输入值之外的因素能够左右 `checkAge` 的返回值，不仅让它变得不纯，而且导致每次思考整个软件的时候都痛苦不堪

另一方面，使用纯函数的形式，函数就能做到自给自足。也可以让 `minimum` 成为一个不可变（immutable）对象，这样就能保留纯粹性，因为状态不会有变化。要实现这个效果，必须得创建一个对象，然后调用 `Object.freeze` 方法：

```javascript
var immutableState = Object.freeze({
  minimum: 21
});
```



### 副作用可能包括...

仔细研究一下"副作用"以便加深理解。"作用"可以理解为一切除结果计算之外发生的事情。

"作用"本身并没什么坏处。"副作用"的关键部分在于"副"。就像一潭死水中的"水"本身并不是幼虫的培养器，"死"才是生成虫群的原因。同理，副作用中的"副"是滋生 bug 的温床。

> *副作用*是在计算结果的过程中，系统状态的一种变化，或者与外部世界进行的*可观察的交互*。

副作用可能包含，但不限于：

- 更改文件系统
- 往数据库插入记录
- 发送一个 http 请求
- 可变数据
- 打印/log
- 获取用户输入
- DOM 查询
- 访问系统状态
- ....

只要是跟函数外部环境发生的交互就都是副作用 — 这一点可能会让你怀疑无副作用编程的可行性。函数式编程的哲学就是假定副作用是造成不正当行为的主要原因。

这并不是说，要禁止使用一切副作用，而是说，要让它们在可控的范围内发生。

副作用让一个函数变得不纯是有道理的：从定义上来说，纯函数必须要能够根据相同的输入返回相同的输出；如果函数需要跟外部事物打交道，那么就无法保证这一点了。

仔细了解下为何要坚持这种「相同输入得到相同输出」原则。



### 八年级数学

根据 mathisfun.com：

> 函数是不同数值之间的特殊关系：每一个输入值返回且只返回一个输出值。

换句话说，函数只是两种数值之间的关系：输入和输出。尽管每个输入都只会有一个输出，但不同的输入却可以有相同的输出。下图展示了一个合法的从 `x` 到 `y` 的函数关系；

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210706110327.png)



相反，下面这张图表展示的就*不是*一种函数关系，因为输入值 `5` 指向了多个输出：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210706110441.png)

函数可以描述为一个集合，这个集合里的内容是 (输入, 输出) 对：`[(1,2), (3,6), (5,10)]`（看起来这个函数是把输入值加倍）。

或者一张表：

| 输入 | 输出 |
| ---- | ---- |
| 1    | 2    |
| 2    | 4    |
| 3    | 6    |

甚至一个以 `x` 为输入 `y` 为输出的函数曲线图：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210706111148.png)	

如果输入直接指明了输出，那么就没有必要再实现具体的细节了。因为函数仅仅只是输入到输出的映射而已，所以简单地写一个对象就能“运行”它，使用 `[]` 代替 `()` 即可。

```js
var toLowerCase = {"A":"a", "B": "b", "C": "c", "D": "d", "E": "e", "D": "d"};

toLowerCase["C"];
//=> "c"

var isPrime = {1:false, 2: true, 3: true, 4: false, 5: true, 6:false};

isPrime[3];
//=> true
```

实际情况中可能需要进行一些计算而不是手动指定各项值；不过上例表明了另外一种思考函数的方式。（可能会想"要是函数有多个参数呢？"。这种情况表明了以数学方式思考问题的一点点不便。暂时可以把它们打包放到数组里，或者把 `arguments` 对象看成是输入。等学习 `curry` 的概念之后，就知道如何直接为函数在数学上的定义建模了。）

纯函数就是数学上的函数，而且是函数式编程的全部。使用这些纯函数编程能够带来大量的好处，来看一下为何要不遗余力地保留函数的纯粹性的原因。



### 追求"纯"的理由

#### 1.可缓存性（Cacheable）

首先，纯函数总能够根据输入来做缓存。实现缓存的一种典型方式是 memoize 技术：

```js
var squareNumber  = memoize(function(x){ return x*x; });

squareNumber(4);
//=> 16

squareNumber(4); // 从缓存中读取输入值为 4 的结果
//=> 16

squareNumber(5);
//=> 25

squareNumber(5); // 从缓存中读取输入值为 5 的结果
//=> 25
```

下面的代码是一个简单的实现，尽管它不太健壮。

```js
var memoize = function(f) {
  var cache = {};

  return function() {
    var arg_str = JSON.stringify(arguments);
    cache[arg_str] = cache[arg_str] || f.apply(f, arguments);
    return cache[arg_str];
  };
};
```

值得注意的一点是，可以通过延迟执行的方式把不纯的函数转换为纯函数：

```js
var pureHttpCall = memoize(function(url, params){
  return function() { return $.getJSON(url, params); }
});
```

这里有趣的地方在于并没有真正发送 http 请求——只是返回了一个函数，当调用它的时候才会发请求。这个函数之所以有资格成为纯函数，是因为它总是会根据相同的输入返回相同的输出：给定了 `url` 和 `params` 之后，它就只会返回同一个发送 http 请求的函数。

`memoize` 函数工作起来没有任何问题，虽然它缓存的并不是 http 请求所返回的结果，而是生成的函数。

现在来看这种方式意义不大，不过很快就会学习一些技巧来发掘它的用处。重点是可以缓存任意一个函数，不管它们看起来多么具有破坏性。



#### 2.可移植性／自文档化（Portable / Self-Documenting）

纯函数是完全自给自足的，它需要的所有东西都能轻易获得。这种自给自足的好处是什么呢？首先，纯函数的依赖很明确，因此更易于观察和理解——没有偷偷摸摸的小动作。

```js
// 不纯的
var signUp = function(attrs) {
  var user = saveUser(attrs);
  welcomeUser(user);
};

var saveUser = function(attrs) {
    var user = Db.save(attrs);
    ...
};

var welcomeUser = function(user) {
    Email(user, ...);
    ...
};

// 纯的
var signUp = function(Db, Email, attrs) {
  return function() {
    var user = saveUser(Db, attrs);
    welcomeUser(Email, user);
  };
};

var saveUser = function(Db, attrs) {
    ...
};

var welcomeUser = function(Email, user) {
    ...
};
```

这个例子表明，纯函数对于其依赖必须要诚实，这样我就能知道它的目的。仅从纯函数版本的 `signUp` 的签名就可以看出，它将要用到 `Db`、`Email` 和 `attrs`，这在最小程度上给了足够多的信息。

这里的重点应该很清楚，那就是相比不纯的函数，纯函数能够提供多得多的信息；前者不知道在函数中做了什么。

其次，通过强迫"注入"依赖，或者把它们当作参数传递，我们的应用也更加灵活；因为数据库或者邮件客户端等等都参数化了。如果要使用另一个 `Db`，只需把它传给函数就行了。如果想在一个新应用中使用这个可靠的函数，尽管把新的 `Db` 和 `Email` 传递过去就好了，非常简单。

在 JavaScript 的设定中，可移植性可以意味着把函数序列化（serializing）并通过 socket 发送。也可以意味着代码能够在 web workers 中运行。总之，可移植性是一个非常强大的特性。

命令式编程中"典型"的方法和过程都深深地根植于它们所在的环境中，通过状态、依赖和有效作用（available effects）达成；纯函数与此相反，它与环境无关，只要我们愿意，可以在任何地方运行它。

> Joe Armstrong：面向对象语言的问题是，它们永远都要随身携带那些隐式的环境。你只需要一个香蕉，但却得到一个拿着香蕉的大猩猩...以及整个丛林

#### 3.可测试性（Testable）

第三点，纯函数让测试更加容易。不需要伪造一个"真实的"支付网关，或者每一次测试之前都要配置、之后都要断言状态（assert the state）。只需简单地给函数一个输入，然后断言输出就好了。

#### 4.合理性（Reasonable）

很多人相信使用纯函数最大的好处是*引用透明性*（referential transparency）。如果一段代码可以替换成它执行所得的结果，而且是在不改变整个程序行为的前提下替换的，那么我们就说这段代码是引用透明的。

由于纯函数总是能够根据相同的输入返回相同的输出，所以它们就能够保证总是返回同一个结果，这也就保证了引用透明性。我们来看一个例子。

```js
var Immutable = require('immutable');

var decrementHP = function(player) {
  return player.set("hp", player.hp-1);
};

var isSameTeam = function(player1, player2) {
  return player1.team === player2.team;
};

var punch = function(player, target) {
  if(isSameTeam(player, target)) {
    return target;
  } else {
    return decrementHP(target);
  }
};

var jobe = Immutable.Map({name:"Jobe", hp:20, team: "red"});
var michael = Immutable.Map({name:"Michael", hp:20, team: "green"});

punch(jobe, michael);
//=> Immutable.Map({name:"Michael", hp:19, team: "green"})
```

`decrementHP`、`isSameTeam` 和 `punch` 都是纯函数，所以是引用透明的。我们可以使用一种叫做“等式推导”（equational reasoning）的技术来分析代码。所谓“等式推导”就是“一对一”替换，有点像在不考虑程序性执行的怪异行为（quirks of programmatic evaluation）的情况下，手动执行相关代码。我们借助引用透明性来剖析一下这段代码。

首先内联 `isSameTeam` 函数：

```js
var punch = function(player, target) {
  if(player.team === target.team) {
    return target;
  } else {
    return decrementHP(target);
  }
};
```

因为是不可变数据，我们可以直接把 `team` 替换为实际值：

```js
var punch = function(player, target) {
  if("red" === "green") {
    return target;
  } else {
    return decrementHP(target);
  }
};
```

`if` 语句执行结果为 `false`，所以可以把整个 `if` 语句都删掉：

```js
var punch = function(player, target) {
  return decrementHP(target);
};
```

如果再内联 `decrementHP`，会发现这种情况下，`punch` 变成了一个让 `hp` 的值减 1 的调用：

```js
var punch = function(player, target) {
  return target.set("hp", target.hp-1);
};
```

总之，等式推导带来的分析代码的能力对重构和理解代码非常重要。

#### 5.并行代码

最后一点，也是决定性的一点：我们可以并行运行任意纯函数。因为纯函数根本不需要访问共享的内存，而且根据其定义，纯函数也不会因副作用而进入竞争态（race condition）。

并行代码在服务端 js 环境以及使用了 web worker 的浏览器那里是非常容易实现的，因为它们使用了线程（thread）。不过出于对非纯函数复杂度的考虑，当前主流观点还是避免使用这种并行。

### 总结

已经了解什么是纯函数了，也看到作为函数式程序员的我们，为何深信纯函数是不同凡响的。从这开始将尽力以纯函数式的方式书写所有的函数。为此我们将需要一些额外的工具来达成目标，同时也尽量把非纯函数从纯函数代码中分离。

如果手头没有一些工具，那么纯函数程序写起来就有点费力。不得不玩杂耍似的通过到处传递参数来操作数据，而且还被禁止使用状态，更别说“作用”了。所以来学习一个叫 curry 的新工具。



## 第 3 章：柯里化（curry）

### 不可或缺的 curry

curry 的概念很简单：只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。

你可以一次性地调用 curry 函数，也可以每次只传一个参数分多次调用。

```js
var add = function(x) {
  return function(y) {
    return x + y;
  };
};

var increment = add(1);
var addTen = add(10);

increment(2);
// 3

addTen(2);
// 12
```

这里定义了一个 `add` 函数，它接受一个参数并返回一个新的函数。调用 `add` 之后，返回的函数就通过闭包的方式记住了 `add` 的第一个参数。一次性地调用它实在是有点繁琐，好在我们可以使用一个特殊的 `curry` 帮助函数（helper function）使这类函数的定义和调用更加容易。

来创建一些 curry 函数享受下。

```js
var curry = require('lodash').curry;

var match = curry(function(what, str) {
  return str.match(what);
});

var replace = curry(function(what, replacement, str) {
  return str.replace(what, replacement);
});

var filter = curry(function(f, ary) {
  return ary.filter(f);
});

var map = curry(function(f, ary) {
  return ary.map(f);
});
```

在上面的代码中遵循的是一种简单，同时也非常重要的模式。即策略性地把要操作的数据（String， Array）放到最后一个参数里。到使用它们的时候你就明白这样做的原因是什么了。

```js
match(/\s+/g, "hello world");
// [ ' ' ]

match(/\s+/g)("hello world");
// [ ' ' ]

var hasSpaces = match(/\s+/g);
// function(x) { return x.match(/\s+/g) }

hasSpaces("hello world");
// [ ' ' ]

hasSpaces("spaceless");
// null

filter(hasSpaces, ["tori_spelling", "tori amos"]);
// ["tori amos"]

var findSpaces = filter(hasSpaces);
// function(xs) { return xs.filter(function(x) { return x.match(/\s+/g) }) }

findSpaces(["tori_spelling", "tori amos"]);
// ["tori amos"]

var noVowels = replace(/[aeiou]/ig);
// function(replacement, x) { return x.replace(/[aeiou]/ig, replacement) }

var censored = noVowels("*");
// function(x) { return x.replace(/[aeiou]/ig, "*") }

censored("Chocolate Rain");
// 'Ch*c*l*t* R**n'
```

这里表明的是一种“预加载”函数的能力，通过传递一到两个参数调用函数，就能得到一个记住了这些参数的新函数。

### 不仅仅是 curry

curry 的用处非常广泛，就像在 `hasSpaces`、`findSpaces` 和 `censored` 看到的那样，只需传给函数一些参数，就能得到一个新函数。

用 `map` 简单地把参数是单个元素的函数包裹一下，就能把它转换成参数为数组的函数。

```js
var getChildren = function(x) {
  return x.childNodes;
};

var allTheChildren = map(getChildren);
```

只传给函数一部分参数通常也叫做*局部调用*（partial application），能够大量减少样板文件代码（boilerplate code）。考虑上面的 `allTheChildren` 函数，如果用 lodash 的普通 `map` 来写会是什么样的（注意参数的顺序也变了）：

```js
var allTheChildren = function(elements) {
  return _.map(elements, getChildren);
};
```

通常不定义直接操作数组的函数，因为只需内联调用 `map(getChildren)` 就能达到目的。这一点同样适用于 `sort`、`filter` 以及其他的高阶函数（higher order function）（高阶函数：参数或返回值为函数的函数）。

当谈论*纯函数*的时候，说它们接受一个输入返回一个输出。curry 函数所做的正是这样：每传递一个参数调用函数，就返回一个新函数处理剩余的参数。这就是一个输入对应一个输出。

哪怕输出是另一个函数，它也是纯函数。当然 curry 函数也允许一次传递多个参数，但这只是出于减少 `()` 的方便。

### 总结

curry 函数用起来非常得心应手，每天使用它对我来说简直就是一种享受。它堪称手头必备工具，能够让函数式编程不那么繁琐和沉闷。

通过简单地传递几个参数，就能动态创建实用的新函数；而且还能带来一个额外好处，那就是保留了数学的函数定义，尽管参数不止一个。



## 第 4 章: 代码组合（compose）

### 函数饲养

这就是 `组合`（compose，以下将称之为组合）：

```js
var compose = function(f,g) {
  return function(x) {
    return f(g(x));
  };
};
```

`f` 和 `g` 都是函数，`x` 是在它们之间通过“管道”传输的值。

`组合`看起来像是在饲养函数。你就是饲养员，选择两个有特点又遭你喜欢的函数，让它们结合，产下一个崭新的函数。组合的用法如下：

```js
var toUpperCase = function(x) { return x.toUpperCase(); };
var exclaim = function(x) { return x + '!'; };
var shout = compose(exclaim, toUpperCase);

shout("send in the clowns");
//=> "SEND IN THE CLOWNS!"
```

两个函数组合之后返回了一个新函数是完全讲得通的：组合某种类型（本例中是函数）的两个元素本就该生成一个该类型的新元素。把两个乐高积木组合起来绝不可能得到一个林肯积木。所以这是有道理的，我们将在适当的时候探讨这方面的一些底层理论。

在 `compose` 的定义中，`g` 将先于 `f` 执行，因此就创建了一个从右到左的数据流。这样做的可读性远远高于嵌套一大堆的函数调用，如果不用组合，`shout` 函数将会是这样的：

```js
var shout = function(x){
  return exclaim(toUpperCase(x));
};
```

让代码从右向左运行，而不是由内而外运行。来看一个顺序很重要的例子：

```js
var head = function(x) { return x[0]; };
var reverse = reduce(function(acc, x){ return [x].concat(acc); }, []);
var last = compose(head, reverse);

last(['jumpkick', 'roundhouse', 'uppercut']);
//=> 'uppercut'
```

`reverse` 反转列表，`head` 取列表中的第一个元素；所以结果就是得到了一个 `last` 函数（译者注：即取列表的最后一个元素），虽然它性能不高。这个组合中函数的执行顺序应该是显而易见的。尽管我们可以定义一个从左向右的版本，但是从右向左执行更加能够反映数学上的含义——是的，组合的概念直接来自于数学课本。实际上，现在是时候去看看所有的组合都有的一个特性了。

```js
// 结合律（associativity）
var associative = compose(f, compose(g, h)) == compose(compose(f, g), h);
// true
```

这个特性就是结合律，符合结合律意味着不管你是把 `g` 和 `h` 分到一组，还是把 `f` 和 `g` 分到一组都不重要。所以，如果我们想把字符串变为大写，可以这么写：

```js
compose(toUpperCase, compose(head, reverse));

// 或者
compose(compose(toUpperCase, head), reverse);
```

因为如何为 `compose` 的调用分组不重要，所以结果都是一样的。这也让我们有能力写一个可变的组合（variadic compose），用法如下：

```js
// 前面的例子中我们必须要写两个组合才行，但既然组合是符合结合律的，我们就可以只写一个，
// 而且想传给它多少个函数就传给它多少个，然后让它自己决定如何分组。

var lastUpper = compose(toUpperCase, head, reverse);

lastUpper(['jumpkick', 'roundhouse', 'uppercut']);
//=> 'UPPERCUT'


var loudLastUpper = compose(exclaim, toUpperCase, head, reverse)

loudLastUpper(['jumpkick', 'roundhouse', 'uppercut']);
//=> 'UPPERCUT!'
```

运用结合律能为我们带来强大的灵活性，还有对执行结果不会出现意外的那种平和心态。至于稍微复杂些的可变组合，也都包含在本书的 `support` 库里了，而且你也可以在类似 [lodash](https://lodash.com/)、[underscore](http://underscorejs.org/) 以及 [ramda](http://ramdajs.com/) 这样的类库中找到它们的常规定义。

结合律的一大好处是任何一个函数分组都可以被拆开来，然后再以它们自己的组合方式打包在一起。让我们来重构重构前面的例子：

```js
var loudLastUpper = compose(exclaim, toUpperCase, head, reverse);

// 或
var last = compose(head, reverse);
var loudLastUpper = compose(exclaim, toUpperCase, last);

// 或
var last = compose(head, reverse);
var angry = compose(exclaim, toUpperCase);
var loudLastUpper = compose(angry, last);

// 更多变种...
```

关于如何组合，并没有标准的答案——只是以自己喜欢的方式搭乐高积木罢了。通常来说，最佳实践是让组合可重用，就像 `last` 和 `angry` 那样。

### pointfree

pointfree 模式指的是，永远不必说出你的数据。

> Pointfree style means never having to say your data

```js
// 非 pointfree，因为提到了数据：word
var snakeCase = function (word) {
  return word.toLowerCase().replace(/\s+/ig, '_');
};

// pointfree
var snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);
```

这里所做的事情就是通过管道把数据在接受单个参数的函数间传递。利用 curry能够做到让每个函数都先接收数据，然后操作数据，最后再把数据传递到下一个函数那里去。另外注意在 pointfree 版本中，不需要 `word` 参数就能构造函数；而在非 pointfree 的版本中，必须要有 `word` 才能进行一切操作。

再来看一个例子。

```js
// 非 pointfree，因为提到了数据：name
var initials = function (name) {
  return name.split(' ').map(compose(toUpperCase, head)).join('. ');
};

// pointfree
var initials = compose(join('. '), map(compose(toUpperCase, head)), split(' '));

initials("hunter stockton thompson");
// 'H. S. T'
```

另外，pointfree 模式能够帮助减少不必要的命名，让代码保持简洁和通用。对函数式代码来说，pointfree 是非常好的石蕊试验，因为它能告诉我们一个函数是否是接受输入返回输出的小函数。比如，while 循环是不能组合的。不过你也要警惕，pointfree 就像是一把双刃剑，有时候也能混淆视听。并非所有的函数式代码都是 pointfree 的，不过这没关系。可以使用它的时候就使用，不能使用的时候就用普通函数。

### debug

组合的一个常见错误是，在没有局部调用之前，就组合类似 `map` 这样接受两个参数的函数。

```js
// 错误做法：我们传给了 `angry` 一个数组，根本不知道最后传给 `map` 的是什么东西。
var latin = compose(map, angry, reverse);

latin(["frog", "eyes"]);
// error


// 正确做法：每个函数都接受一个实际参数。
var latin = compose(map(angry), reverse);

latin(["frog", "eyes"]);
// ["EYES!", "FROG!"])
```

如果在 debug 组合的时候遇到了困难，那么可以使用下面这个实用的，但是不纯的 `trace` 函数来追踪代码的执行情况。

```js
var trace = curry(function(tag, x){
  console.log(tag, x);
  return x;
});

var dasherize = compose(join('-'), toLower, split(' '), replace(/\s{2,}/ig, ' '));

dasherize('The world is a vampire');
// TypeError: Cannot read property 'apply' of undefined
```

这里报错了，来 `trace` 下：

```js
var dasherize = compose(join('-'), toLower, trace("after split"), split(' '), replace(/\s{2,}/ig, ' '));
// after split [ 'The', 'world', 'is', 'a', 'vampire' ]
```

`toLower` 的参数是一个数组，所以需要先用 `map` 调用一下它。

```js
var dasherize = compose(join('-'), map(toLower), split(' '), replace(/\s{2,}/ig, ' '));

dasherize('The world is a vampire');

// 'the-world-is-a-vampire'
```

`trace` 函数允许在某个特定的点观察数据以便 debug。像 haskell 和 purescript 之类的语言出于开发的方便，也都提供了类似的函数。

组合将成为我们构造程序的工具，而且幸运的是，它背后是有一个强大的理论做支撑的。让我们来研究研究这个理论。



### 范畴学

函数式编程的起源，是一门叫做范畴论（Category Theory）的数学分支。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210610220544.png)

理解函数式编程的关键，就是理解范畴论。它是一门很复杂的数学，认为世界上所有的概念体系，都可以抽象成一个个的"范畴"（category）。

**什么是范畴呢？**

*维基百科的定义：*

> "范畴就是使用箭头连接的物体。"（In mathematics, a category is an algebraic structure that comprises "objects" that are linked by "arrows". ）

也就是说，彼此之间存在某种关系的概念、事物、对象等等随便什么东西，只要能找出它们之间的关系，就能定义一个"范畴"。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210610222000.png)

上图中各个点与它们之间的箭头，就构成一个范畴。

箭头表示范畴成员之间的关系，正式的名称叫做"态射"（morphism）。范畴论认为，同一个范畴的所有成员，就是不同状态的"变形"（transformation）。通过"态射"，一个成员可以变形成另一个成员。

有着以下这些组件（component）的搜集（collection）就构成了一个范畴：

- 对象的搜集
- 态射的搜集
- 态射的组合
- identity 这个独特的态射

范畴学抽象到足以模拟任何事物，不过目前我们最关心的还是类型和函数，所以让我们把范畴学运用到它们身上看看。



**对象的搜集**

对象就是数据类型，例如 `String`、`Boolean`、`Number` 和 `Object` 等等。通常我们把数据类型视作所有可能的值的一个集合（set）。像 `Boolean` 就可以看作是 `[true, false]` 的集合，`Number` 可以是所有实数的一个集合。把类型当作集合对待是有好处的，因为我们可以利用集合论（set theory）处理类型。

**态射的搜集**

态射是标准的、普通的纯函数。

**态射的组合**

你可能猜到了，这就是本章介绍的新玩意儿——`组合`。我们已经讨论过 `compose` 函数是符合结合律的，这并非巧合，结合律是在范畴学中对任何组合都适用的一个特性。

这张图展示了什么是组合：

![img](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/images/cat_comp1.png) ![img](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/images/cat_comp2.png)

这里有一个具体的例子：

```js
var g = function(x){ return x.length; };
var f = function(x){ return x === 4; };
var isFourLetterWord = compose(f, g);
```

**identity 这个独特的态射**

让我们介绍一个名为 `id` 的实用函数。这个函数接受随便什么输入然后原封不动地返回它：

```js
var id = function(x){ return x; };
```

可能会觉得"这到底哪里有用了？"。在随后的内容中拓展这个函数的，暂时先把它当作一个可以替代给定值的函数。

`id` 函数跟组合一起使用简直完美。下面这个特性对所有的一元函数（unary function）（一元函数：只接受一个参数的函数） `f` 都成立：

```js
// identity
compose(id, f) == compose(f, id) == f;
// true
```

这就是实数的单位元（identity property）。如果这还不够清楚直白，慢慢理解它的无用性。很快就会到处使用 `id` 了，不过暂时还是把它当作一个替代给定值的函数。这对写 pointfree 的代码非常有用。



### 总结

组合像一系列管道那样把不同的函数联系在一起，数据就可以也必须在其中流动——毕竟纯函数就是输入对输出，所以打破这个链条就是不尊重输出，就会让我们的应用一无是处。

通常认为组合是高于其他所有原则的设计原则，这是因为组合让我们的代码简单而富有可读性。另外范畴学将在应用架构、模拟副作用和保证正确性方面扮演重要角色。



## 第 5 章：示例应用

### 声明式代码

将不再指示计算机如何工作，而是指出明确希望得到的结果。这种做法与那种需要时刻关心所有细节的命令式编程相比轻松许多。

与命令式不同，声明式意味着要写表达式，而不是一步一步的指示。

以 SQL 为例，它就没有"先做这个，再做那个"的命令，有的只是一个指明想要从数据库取什么数据的表达式。至于如何取数据则是由它自己决定的。以后数据库升级也好，SQL 引擎优化也好，根本不需要更改查询语句。这是因为，有多种方式解析一个表达式并得到相同的结果。

写几个例子找找感觉。

```js
// 命令式
var makes = [];
for (i = 0; i < cars.length; i++) {
  makes.push(cars[i].make);
}


// 声明式
var makes = cars.map(function(car){ return car.make; });
```

命令式的循环要求必须先实例化一个数组，而且执行完这个实例化语句之后，解释器才继续执行后面的代码。然后再直接迭代 `cars` 列表，手动增加计数器，把各种零零散散的东西都展示出来。

使用 `map` 的版本是一个表达式，它对执行顺序没有要求。而且，`map` 函数如何进行迭代，返回的数组如何收集，都有很大的自由度。它指明的是`做什么`，不是`怎么做`。因此，它是正儿八经的声明式代码。

再看一个例子。

```js
// 命令式
var authenticate = function(form) {
  var user = toUser(form);
  return logIn(user);
};

// 声明式
var authenticate = compose(logIn, toUser);
```

虽然命令式的版本并不一定就是错的，但还是硬编码了那种一步接一步的执行方式。而 `compose` 表达式只是简单地指出了这样一个事实：用户验证是 `toUser` 和 `logIn` 两个行为的组合。这再次说明，声明式为潜在的代码更新提供了支持，使得应用代码成为了一种高级规范（high level specification）。

因为声明式代码不指定执行顺序，所以它天然地适合进行并行运算。它与纯函数一起解释了为何函数式编程是未来并行计算的一个不错选择。

### 一个函数式的 flickr

现在以一种声明式的、可组合的方式创建一个示例应用。暂时还是会作点小弊，使用副作用；但会把副作用的程度降到最低，让它们与纯函数代码分离开来。这个示例应用是一个浏览器 widget，功能是从 flickr 获取图片并在页面上展示。从写 html 开始：

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.11/require.min.js"></script>
    <script src="flickr.js"></script>
  </head>
  <body></body>
</html>
```

flickr.js 如下：

```js
requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
    'ramda',
    'jquery'
  ],
  function (_, $) {
    var trace = _.curry(function(tag, x) {
      console.log(tag, x);
      return x;
    });
    // app goes here
  });
```

这里使用了 [ramda](http://ramdajs.com/) ，没有用 lodash 或者其他类库。ramda 提供了 `compose`、`curry` 等很多函数。模块加载选择的是 requirejs，也把 `trace` 函数写好了，便于 debug。

应用将做 4 件事：

1. 根据特定搜索关键字构造 url
2. 向 flickr 发送 api 请求
3. 把返回的 json 转为 html 图片
4. 把图片放到屏幕上

注意到没？上面提到了两个不纯的动作，即从 flickr 的 api 获取数据和在屏幕上放置图片这两件事。我们先来定义这两个动作，这样就能隔离它们了。

```js
var Impure = {
  getJSON: _.curry(function(callback, url) {
    $.getJSON(url, callback);
  }),

  setHtml: _.curry(function(sel, html) {
    $(sel).html(html);
  })
};
```

这里只是简单地包装了一下 jQuery 的 `getJSON` 方法，把它变为一个 curry 函数，还有就是把参数位置也调换了下。这些方法都在 `Impure` 命名空间下，这样就知道它们都是危险函数。在后面的例子中会把这两个函数变纯。

下一步是构造 url 传给 `Impure.getJSON` 函数。

```js
var url = function (term) {
  return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + term + '&format=json&jsoncallback=?';
};
```

借助 monoid 或 combinator 可以使用一些奇技淫巧来让 `url` 函数变为 pointfree 函数。但是为了可读性还是选择以普通的非 pointfree 的方式拼接字符串。

让我们写一个 `app` 函数发送请求并把内容放置到屏幕上。

```js
var app = _.compose(Impure.getJSON(trace("response")), url);

app("cats");
```

这会调用 `url` 函数，然后把字符串传给 `getJSON` 函数。`getJSON` 已经局部应用了 `trace`，加载这个应用将会把请求的响应显示在 console 里。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210706182608.png)

想要从这个 json 里构造图片，看起来 src 都在 `items` 数组中的每个 `media` 对象的 `m` 属性上。

不管怎样，可以使用 ramda 的一个通用 getter 函数 `_.prop()` 来获取这些嵌套的属性。以下prop方法的代码实现可以明白这个函数的作用：

```js
var prop = _.curry(function(property, object){
  return object[property];
});
```

利用这个函数获取图片的 src。

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var srcs = _.compose(_.map(mediaUrl), _.prop('items'));
```

一旦得到了 `items`，就必须使用 `map` 来分解每一个 url；这样就得到了一个包含所有 src 的数组。把它和 `app` 联结起来，打印结果看看。

```js
var renderImages = _.compose(Impure.setHtml("body"), srcs);
var app = _.compose(Impure.getJSON(renderImages), url);
```

这里所做的只不过是新建了一个组合，这个组合会调用 `srcs` 函数，并把返回结果设置为 body 的 html。我们也把 `trace` 替换为了 `renderImages`，因为已经有了除原始 json 以外的数据。这将会粗暴地把所有的 src 直接显示在屏幕上。

最后一步是把这些 src 变为真正的图片。对大型点的应用来说，是应该使用类似 Handlebars 或者 React 这样的 template/dom 库来做这件事的。但我们这个应用太小了，只需要一个 img 标签，所以用 jQuery 就好了。

```js
var img = function (url) {
  return $('<img />', { src: url });
};
```

jQuery 的 `html()` 方法接受标签数组为参数，所以我们只须把 src 转换为 img 标签然后传给 `setHtml` 即可。

```js
var images = _.compose(_.map(img), srcs);
var renderImages = _.compose(Impure.setHtml("body"), images);
var app = _.compose(Impure.getJSON(renderImages), url);
```

任务完成！

![img](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/images/cats_ss.png)

下面是完整代码：

```js
requirejs.config({
  paths: {
    ramda: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.13.0/ramda.min',
    jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min'
  }
});

require([
    'ramda',
    'jquery'
  ],
  function (_, $) {
    ////////////////////////////////////////////
    // Utils

    var Impure = {
      getJSON: _.curry(function(callback, url) {
        $.getJSON(url, callback);
      }),

      setHtml: _.curry(function(sel, html) {
        $(sel).html(html);
      })
    };

    var img = function (url) {
      return $('<img />', { src: url });
    };

    var trace = _.curry(function(tag, x) {
      console.log(tag, x);
      return x;
    });

    ////////////////////////////////////////////

    var url = function (t) {
      return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + t + '&format=json&jsoncallback=?';
    };

    var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

    var srcs = _.compose(_.map(mediaUrl), _.prop('items'));

    var images = _.compose(_.map(img), srcs);

    var renderImages = _.compose(Impure.setHtml("body"), images);

    var app = _.compose(Impure.getJSON(renderImages), url);

    app("cats");
  });
```

只说做什么，不说怎么做。现在可以把每一行代码都视作一个等式，变量名所代表的属性就是等式的含义。可以利用这些属性去推导分析和重构这个应用。

### 有原则的重构

上面的代码是有优化空间的——获取 url map 了一次，把这些 url 变为 img 标签又 map 了一次。关于 map 和组合是有定律的：

```js
// map 的组合律
var law = compose(map(f), map(g)) == map(compose(f, g));
```

可以利用这个定律优化代码，进行一次有原则的重构。

```js
// 原有代码
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var srcs = _.compose(_.map(mediaUrl), _.prop('items'));

var images = _.compose(_.map(img), srcs);
```

通过认识等式推导（equational reasoning）及纯函数的特性，可以内联调用 `srcs` 和 `images`，也就是把 map 调用排列起来。

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var images = _.compose(_.map(img), _.map(mediaUrl), _.prop('items'));
```

把 `map` 排成一列之后就可以应用组合律了。

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var images = _.compose(_.map(_.compose(img, mediaUrl)), _.prop('items'));
```

现在只需要循环一次就可以把每一个对象都转为 img 标签了。我们把 map 调用的 compose 取出来放到外面，提高一下可读性。

```js
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));

var mediaToImg = _.compose(img, mediaUrl);

var images = _.compose(_.map(mediaToImg), _.prop('items'));
```

## 参考

[函数式编程指北](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)



