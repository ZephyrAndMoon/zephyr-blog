---
title: JavaScript 执行上下文
date: 2021-06-01
tags:
 - JavaScript
 - 基础
categories: 
 - JavaScript
---


## 什么是执行上下文？

简而言之，执行上下文是评估和执行 JavaScript 代码的环境的抽象概念。每当 Javascript 代码在运行的时候，它都是在执行上下文中运行。例如当执行到一个函数的时候就会进行准备工作，这里的"准备工作"指的就是"执行上下文"。



### 执行上下文类型

> JavaScript中有三种执行上下文类型

- **全局执行上下文** — 这是默认或者说基础的上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的 window 对象（浏览器的情况下），并且设置 `this` 的值等于这个全局对象。一个程序中只会有一个全局执行上下文
- **函数执行上下文** — 每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。每当一个新的执行上下文被创建，它会按定义的顺序（将在后文讨论）执行一系列步骤。
- **Eval函数执行上下文** — 执行`eval`函数内部的代码也会有它属于自己的执行上下文，但由于JavaScript开发者并不经常使用`eval`，所以在这里不讨论。



## 执行上下文栈

执行上下文栈，也就是在其它编程语言中所说的"调用栈"，是一种拥有 LIFO（后进先出）数据结构的栈，被用来存储代码运行时创建的所有执行上下文。

当 JavaScript 引擎第一次遇到你的脚本时，它会创建一个全局的执行上下文并且压入当前执行栈。每当引擎遇到一个函数调用，它会为该函数创建一个新的执行上下文并压入栈的顶部。

引擎会执行那些执行上下文位于栈顶的函数。当该函数执行结束时，执行上下文从栈中弹出，控制流程到达当前栈中的下一个上下文。

通过下面的代码示例来理解：

```javascript
let a = 'Hello World!';

function first() {
  console.log('Inside first function');
  second();
  console.log('Again inside first function');
}

function second() {
  console.log('Inside second function');
}

first();
console.log('Inside Global Execution Context');
```

上述代码的执行上下文栈：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210601232936.png)



当上述代码在浏览器加载时，JavaScript 引擎创建了一个全局执行上下文并把它压入当前执行栈。当遇到 `first()` 函数调用时，JavaScript 引擎为该函数创建一个新的执行上下文并把它压入当前执行栈的顶部。

当从 `first()` 函数内部调用 `second()` 函数时，JavaScript 引擎为 `second()` 函数创建了一个新的执行上下文并把它压入当前执行栈的顶部。当 `second()` 函数执行完毕，它的执行上下文会从当前栈弹出，并且控制流程到达下一个执行上下文，即 `first()` 函数的执行上下文。

当 `first()` 执行完毕，它的执行上下文从栈弹出，控制流程到达全局执行上下文。一旦所有代码执行完毕，JavaScript 引擎从当前栈中移除全局执行上下文。



## 模拟执行上下文的行为

为了模拟执行上下文栈的行为，让我们定义执行上下文栈是一个数组：

```
ECStack = [];
```

试想当 JavaScript 开始要解释执行代码的时候，最先遇到的就是全局代码，所以初始化的时候首先就会向执行上下文栈压入一个全局执行上下文，我们用 globalContext 表示它，并且只有当整个应用程序结束的时候，ECStack 才会被清空，所以程序结束之前， ECStack 最底部永远有个 globalContext：

```
ECStack = [
    globalContext
];
```

现在 JavaScript 遇到下面的这段代码了：

```javascript
function fun3() {
    console.log('fun3')
}

function fun2() {
    fun3();
}

function fun1() {
    fun2();
}

fun1();
```

当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。知道了这样的工作原理，让我们来看看如何处理上面这段代码：

```javascript
// 伪代码

// fun1()
ECStack.push(<fun1> functionContext);

// fun1中竟然调用了fun2，还要创建fun2的执行上下文
ECStack.push(<fun2> functionContext);

// 擦，fun2还调用了fun3！
ECStack.push(<fun3> functionContext);

// fun3执行完毕
ECStack.pop();

// fun2执行完毕
ECStack.pop();

// fun1执行完毕
ECStack.pop();

// javascript接着执行下面的代码，但是ECStack底层永远有个globalContext
```



## 怎么创建执行上下文

到现在，我们已经看过 JavaScript 怎样管理执行上下文了，现在让我们了解 JavaScript 引擎是怎样创建执行上下文的。

创建执行上下文有两个阶段：

1. 创建阶段
2. 执行阶段



### 创建阶段（The Creation Phase）

在 JavaScript 代码执行前，执行上下文将经历创建阶段。在创建阶段会发生三件事：

1. **this** 值的决定，即我们所熟知的 **This 绑定**。
2. 创建**词法环境**组件。
3. 创建**变量环境**组件。

所以执行上下文在概念上表示如下：

```
ExecutionContext = {
  ThisBinding = <this value>,
  LexicalEnvironment = { ... },
  VariableEnvironment = { ... },
}
```



#### **This 绑定**

在全局执行上下文中，`this` 的值指向全局对象。(在浏览器中，`this`引用 Window 对象)。

在函数执行上下文中，`this` 的值取决于该函数是如何被调用的。如果它被一个引用对象调用，那么 `this` 会被设置成那个对象，否则 `this` 的值被设置为全局对象或者 `undefined`（在严格模式下）。例如：

```javascript
let foo = {
  baz: function() {
  console.log(this);
  }
}

foo.baz();   // 'this' 引用 'foo', 因为 'baz' 被对象 'foo' 调用

let bar = foo.baz;

bar();       // 'this' 指向全局 window 对象，因为没有指定引用对象
```



#### 词法环境

[官方的 ES6](http://ecma-international.org/ecma-262/6.0/) 文档把词法环境定义为

> **词法环境**是一种规范类型，基于 ECMAScript 代码的词法嵌套结构来定义**标识符**和具体变量和函数的关联。一个词法环境由环境记录器和一个可能的引用**外部**词法环境的空值组成。

简单来说**词法环境**是一种持有**标识符—变量映射**的结构。（这里的**标识符**指的是变量/函数的名字，而**变量**是对实际对象[包含函数类型对象]或原始数据的引用）。

现在，在词法环境的**内部**有两个组件：(1) **环境记录器**和 (2) 一个**外部环境的引用**。

1. **环境记录器**是存储变量和函数声明的实际位置。
2. **外部环境的引用**意味着它可以访问其父级词法环境（作用域）。

**词法环境**有两种类型：

- **全局环境**（在全局执行上下文中）是没有外部环境引用的词法环境。全局环境的外部环境引用是 **null**。它拥有内建的 Object/Array/等、在环境记录器内的原型函数（关联全局对象，比如 window 对象）还有任何用户定义的全局变量，并且 `this`的值指向全局对象。
- 在**函数环境**中，函数内部用户定义的变量存储在**环境记录器**中。并且引用的外部环境可能是全局环境，或者任何包含此内部函数的外部函数。

**环境记录器**也有两种类型（如上！）：

1. **声明式环境记录器**存储变量、函数和参数。
2. **对象环境记录器**用来定义出现在**全局上下文**中的变量和函数的关系。

简而言之，

- 在**全局环境**中，环境记录器是对象环境记录器。
- 在**函数环境**中，环境记录器是声明式环境记录器。

**注意 —** 对于**函数环境**，**声明式环境记录器**还包含了一个传递给函数的 `arguments` 对象（此对象存储索引和参数的映射）和传递给函数的参数的 **length**。

抽象地讲，词法环境在伪代码中看起来像这样：

```javascript
GlobalExectionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // 在这里绑定标识符
    }
    outer: <null>
  }
}

FunctionExectionContext = {
  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 在这里绑定标识符
    }
    outer: <Global or outer function environment reference>
  }
}
```



#### 变量环境

它同样是一个词法环境，其环境记录器持有**变量声明语句**在执行上下文中创建的绑定关系。

如上所述，变量环境也是一个词法环境，所以它有着上面定义的词法环境的所有属性。

在 ES6 中，**词法环境**组件和**变量环境**的一个不同就是前者被用来存储函数声明和变量（`let` 和 `const`）绑定，而后者只用来存储 `var` 变量绑定。

我们看点样例代码来理解上面的概念：

```javascript
let a = 20;
const b = 30;
var c;

function multiply(e, f) {
 var g = 20;
 return e * f * g;
}

c = multiply(20, 30);
```

执行上下文看起来像这样：

```
GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // 在这里绑定标识符
      a: < uninitialized >,
      b: < uninitialized >,
      multiply: < func >
    }
    outer: <null>
  },

  VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Object",
      // 在这里绑定标识符
      c: undefined,
    }
    outer: <null>
  }
}

FunctionExectionContext = {
  ThisBinding: <Global Object>,

  LexicalEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 在这里绑定标识符
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <GlobalLexicalEnvironment>
  },

VariableEnvironment: {
    EnvironmentRecord: {
      Type: "Declarative",
      // 在这里绑定标识符
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>
  }
}
```

**注意** — 只有遇到调用函数 `multiply` 时，函数执行上下文才会被创建。

可能你已经注意到 `let` 和 `const` 定义的变量并没有关联任何值，但 `var` 定义的变量被设成了 `undefined`。

这是因为在创建阶段时，引擎检查代码找出变量和函数声明，虽然函数声明完全存储在环境中，但是变量最初设置为 `undefined`（`var` 情况下），或者未初始化（`let` 和 `const` 情况下）。

这就是为什么你可以在声明之前访问 `var` 定义的变量（虽然是 `undefined`），但是在声明之前访问 `let` 和 `const` 的变量会得到一个引用错误。

这就是变量声明提升。



### 执行阶段（The  Execution Phase）

在此阶段，完成对所有这些变量的分配，最后执行代码。

**注意** — 在执行阶段，如果 JavaScript 引擎不能在源码中声明的实际位置找到 `let` 变量的值，它会被赋值为 `undefined`。



## 解答思考题

```javascript
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
```

```javascript
var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()();
```

两段代码执行的结果一样，但是两段代码究竟有哪些不同呢？

答案就是执行上下文栈的变化不一样。

模拟第一段代码：

```
ECStack.push(<checkscope> functionContext);
ECStack.push(<f> functionContext);
ECStack.pop();
ECStack.pop();
```

模拟第二段代码：

```
ECStack.push(<checkscope> functionContext);
ECStack.pop();
ECStack.push(<f> functionContext);
ECStack.pop();
```



## 参考

1. [[译] 理解 JavaScript 中的执行上下文和执行栈](https://juejin.cn/post/6844903682283143181)

2. [JavaScript深入之执行上下文栈](https://github.com/mqyqingfeng/Blog/issues/4)
