---
title: TypeScript 泛型
date: 2021-11-17
tags:
 - 前端
 - 基础
 - TypeScirpt
categories: 
 - TypeScript
---

# TypeScript 泛型

## 定义

> 使用泛型来创建可重用的组件，一个组件可以支持多种类型的数据，这样用户就可以以自己的数据类型来使用组件。设计泛型的关键目的是在成员之间提供有意义的约束，这些成员可以是：类的实例成员、类的方法、函数参数和函数返回值。
> 

![https://markdowncun.oss-cn-beijing.aliyuncs.com/carbon%20(2).png](https://markdowncun.oss-cn-beijing.aliyuncs.com/carbon%20(2).png)

当使用者调用 `identity<Number>(1)` ，`Number` 类型就像参数 `1` 一样，它将在出现 `T` 的任何位置填充该类型。图中 `<T>` 内部的 `T` 被称为类型变量，它是我们希望传递给 identity 函数的类型占位符，同时它被分配给 `value` 参数用来代替它的类型：此时 `T` 充当的是类型，而不是特定的 Number 类型。

其中 `T` 代表 **Type**，在定义泛型时通常用作第一个类型变量名称。但实际上 `T` 可以用任何有效名称代替。除了 `T` 之外，以下是常见泛型变量代表的意思：

- K（Key）：表示对象中的键类型；
- V（Value）：表示对象中的值类型；
- E（Element）：表示元素类型。

并不是只能定义一个类型变量，可以引入希望定义的任何数量的类型变量。比如引入一个新的类型变量U，用于扩展定义的identity函数：

```tsx
function identity <T, U>(value: T, message: U) : T {
  console.log(message);
  return value;
}

console.log(identity<Number, string>(68, "zephyr"));
```

## 泛型接口

创建一个用于 `identity` 函数通用 `Identities` 接口：

```tsx
interface Identities<V,M>{
	value:V,
	message:M
}
```

将 `Identities` 接口作为 `identity` 函数的返回类型：

```tsx
function identity<T, U> (value: T, message: U): Identities<T, U> {
  console.log(value + ": " + typeof (value));
  console.log(message + ": " + typeof (message));
  let identities: Identities<T, U> = {
    value,
    message
  };
  return identities;
}

console.log(identity(68, "zephyr"));
```

## 泛型类

在类中使用泛型也很简单，只需要在类名后面，使用 `<T, ...>` 的语法定义任意多个类型变量，具体示例如下：

```tsx
interface GenericInterface<U> {
  value: U
  getIdentity: () => U
}

class IdentityClass<T> implements GenericInterface<T> {
  value: T

  constructor(value: T) {
    this.value = value
  }

  getIdentity(): T {
    return this.value
  }

}

const myNumberClass = new IdentityClass<Number>(68);
console.log(myNumberClass.getIdentity()); // 68

const myStringClass = new IdentityClass<string>("zephyr!");
console.log(myStringClass.getIdentity()); // zephyr!
```

其调用过程：

- 在实例化 `IdentityClass` 对象时，传入 `Number` 类型和构造函数参数值 `68`；
- 之后在 `IdentityClass` 类中，类型变量 `T` 的值变成 `Number` 类型；
- `IdentityClass` 类实现了 `GenericInterface<T>`，而此时 `T` 表示 `Number` 类型，因此等价于该类实现了 `GenericInterface<Number>` 接口；
- 而对于 `GenericInterface<U>` 接口来说，类型变量 `U` 也变成了 `Number`。

***泛型类可确保在整个类中一致地使用指定的数据类型。***

**是否使用泛型的两个参考标准：**

- 当你的函数、接口或类将处理多种数据类型时；
- 当函数、接口或类在多个地方使用该数据类型时。

#　泛型约束

> 有时可能希望限制每个类型变量接受的类型数量，这就是泛型约束的作用。
> 

### 确保属性存在

有时候希望类型变量对应的类型上存在某些属性。这时，除非显式地将特定属性定义为类型变量，否则编译器不会知道它们的存在。

一个很好的例子是在处理字符串或数组时，会假设 `length` 属性是可用的。再次使用 `identity` 函数并尝试输出参数的长度：

```tsx
function identity<T>(arg: T): T {
  console.log(arg.length); // Property 'length' does not exist on type 'T'.
  return arg;
}
```

在这种情况下，编译器将不会知道 `T` 确实含有 `length` 属性，尤其是在可以将任何类型赋给类型变量 `T` 的情况下。需要做的就是让类型变量 `extends` 一个含有我们所需属性的接口，比如这样：

```tsx
interface Length {
  length: number;
}

function identity<T extends Length>(arg: T): T {
  console.log(arg.length); // 可以获取length属性
  return arg;
}

```

`T extends Length` 用于告诉编译器，支持已经实现 `Length` 接口的任何类型。之后，当使用不含有 `length` 属性的对象作为参数调用 `identity` 函数时，TypeScript 会提示相关的错误信息：

```tsx
identity(68); // Error
// Argument of type '68' is not assignable to parameter of type 'Length'.(2345)
```

此外还可以使用 `,` 号来分隔多种约束类型，比如：`<T extends Length, Type2, Type3>`。

而对于上述的 `length` 属性问题来说，如果显式地将变量设置为数组类型，也可以解决该问题，因为数组类型的数据包含 `length` 这个属性，具体方式如下：

```tsx
function identity<T>(arg: T[]): T[] {
   console.log(arg.length);
   return arg;
}

// or
function identity<T>(arg: Array<T>): Array<T> {
  console.log(arg.length);
  return arg;
}
```

### 检查对象上的键是否存在

泛型约束的另一个常见的使用场景就是检查对象上的键是否存在。不过在看具体示例之前得来了解一下 `keyof` 操作符。

**`keyof` 操作符是在 TypeScript 2.1 版本引入的，该操作符可以用于获取某种类型的所有键，其返回类型是联合类型。**

使用示例：

```tsx
interface Person {
  name: string;
  age: number;
  location: string;
}

type K1 = keyof Person; // "name" | "age" | "location"
type K2 = keyof Person[];  // number | "length" | "push" | "concat" | ...
type K3 = keyof { [x: string]: Person };  // string | number
```

通过 `keyof` 操作符就可以获取指定类型的所有键，之后就可以结合前面介绍的 `extends` 约束，即限制输入的属性名包含在 `keyof` 返回的联合类型中。具体的使用方式如下：

```tsx
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

在以上的 `getProperty` 函数中通过 `K extends keyof T` 确保参数 key 一定是对象中含有的键，这样就不会发生运行时错误。这是一个类型安全的解决方案，与简单调用 `let value = obj[key];` 不同。

使用 `getProperty` 函数：

```tsx
enum Difficulty {
  Easy,
  Intermediate,
  Hard
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let tsInfo = {
   name: "Typescript",
   supersetOf: "Javascript",
   difficulty: Difficulty.Intermediate
}

let difficulty: Difficulty =
  getProperty(tsInfo, 'difficulty'); // OK

let supersetOf: string =
  getProperty(tsInfo, 'superset_of'); // Error
```

在以上示例中，对于 `getProperty(tsInfo, 'superset_of')` 这个表达式，TypeScript 编译器会提示以下错误信息：

```
Argument of type '"superset_of"' is not assignable to parameter of type
'"difficulty" | "name" | "supersetOf"'.(2345)
```

通过使用泛型约束，在编译阶段就可以提前发现错误，大大提高了程序的健壮性和稳定性。

## 泛型参数默认类型

在 **TypeScript 2.3** 以后，可以为泛型中的类型参数指定默认类型。当使用泛型时没有在代码中直接指定类型参数，从实际值参数中也无法推断出类型时，这个默认类型就会起作用。

泛型参数默认类型与普通函数默认值类似，对应的语法很简单，即 `<T=Default Type>`

```tsx
interface A<T=string> {
  name: T;
}

const strA: A = { name: "Semlinker" };
const numB: A<number> = { name: 101 };
```

泛型参数的默认类型遵循以下规则：

- 有默认类型的类型参数被认为是可选的。
- 必选的类型参数不能在可选的类型参数后。
- 如果类型参数有约束，类型参数的默认类型必须满足这个约束。
- 当指定类型实参时，你只需要指定必选类型参数的类型实参。 未指定的类型参数会被解析为它们的默认类型。
- 如果指定了默认类型，且类型推断无法选择一个候选类型，那么将使用默认类型作为推断结果。
- 一个被现有类或接口合并的类或者接口的声明可以为现有类型参数引入默认类型。
- 一个被现有类或接口合并的类或者接口的声明可以引入新的类型参数，只要它指定了默认类型。

## 泛型条件类型

在 **TypeScript 2.8** 中引入了条件类型，可以根据某些条件得到不同的类型，这里所说的条件是类型兼容性约束。

尽管以上代码中使用了 `extends` 关键字，也不一定要强制满足继承关系，而是检查是否满足结构兼容性。

条件类型会以一个条件表达式进行类型关系检测，从而在两种类型中选择其一：

```
T extends U ? X : Y
```

> extends 可以暂时简单理解为 U 中的属性在 T 中都有。
> 

表达式的意思是：若 `T` 能够赋值给 `U`，那么类型是 `X`，否则为 `Y`。

条件类型理解起来更直观，唯一需要有一定理解成本的就是 **何时条件类型系统会收集到足够的信息来确定类型**，也就是说，条件类型有可能不会被立刻完成判断。

在了解这一点前先来看看条件类型常用的一个场景：**泛型约束**，实际上就是上面的例子：

```tsx
function pickSingleValue<T extends object, U extends keyof T>(obj: T, key: U): T[U] {
  return obj[key];
}
```

这里的 `T extends object` 与 `U extends keyof T` 都是泛型约束，分别**将 T 约束为对象类型**和 **将 U 约束为 T 键名** 的字面量联合类型。我们通常使用泛型约束来 **"使得泛型收窄"**。

以一个使用条件类型作为函数返回值类型的例子：

```tsx
declare function strOrnum<T extends boolean>(
  x: T
): T extends true ? string : number;
```

在这种情况下，条件类型的推导就会被 **延迟（deferred）**，因为此时 **T** 还不能确定是 `true` 还是 `false` ，所以类型系统没有足够的信息来完成判断。

只有给出了所需信息（在这里是 x 值），才可以完成推导。

```tsx
const strReturnType = strOrNum(true);
const numReturnType = strOrNum(false);
```

同样的，就像三元表达式可以嵌套，条件类型也可以嵌套，条件类型的嵌套可以将类型约束收拢到非常精确的范围内。

```tsx
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";
```

### **分布式条件类型 Distributive Conditional Types**

> 对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上
> 
> 
> 原文：
> 
> *Conditional types in which the checked type is a **naked type parameter** are called distributive conditional types. Distributive conditional types are automatically **distributed over union types** during instantiation*
> 

先提取几个关键词，然后再通过例子理清这个概念：

- 裸类型参数
- 实例化
- 分发到联合类型

```tsx
// "string" | "function"
type T1 = TypeName<string | (() => void)>

// "string" | "object"
type T2 = TypeName<string | string[]>

// "object"
type T3 = TypeName<string[] | number[]>
```

可以发现在上面的例子里，条件类型的推导结果都是联合类型（ **T3** 实际上也是，只不过相同所以被合并了），并且就是类型参数被依次进行条件判断后再通过 **`|`** 组合得来的结果。

再看另一个例子：

```tsx
type Naked<T> = T extends boolean ? "Y" : "N";
type Wrapped<T> = [T] extends [boolean] ? "Y" : "N";

/*
 * 先分发到 Naked<number> | Naked<boolean>
 * 然后到 "N" | "Y"
 */
type Distributed = Naked<number | boolean>;

/*
 * 不会分发 直接是 [number | boolean] extends [boolean]
 * 然后是"N"
 */
type NotDistributed = Wrapped<number | boolean>;
```

现在可以来讲讲这几个概念了：

- 裸类型参数，没有额外被接口 / 类型别名包裹过的，就像被 `Wrapped` 包裹后就不能再被称为裸类型参数。
- 实例化，其实就是条件类型的判断过程，在这里两个例子的实例化过程实际上是不同的，具体会在下一点中介绍。
- 分发至联合类型的过程：
- 对于 `TypeName`，它内部的类型参数 **T** 是没有被包裹过的
    - `TypeName<string | (() => void)>` 会被分发为 `TypeName<string> | TypeName<(() => void)>`
    - 再根据分发的情况进行判断，最后分发为 `"string" | "function"`
    
    `相当于 (A extends T ? X : Y) | (B extends T ? X : Y) | (B extends T ? X : Y)`
    

<aside>
💡 **没有被额外包装的联合类型参数，在条件类型进行判定时会将联合类型分发，分别进行判断。**

</aside>

## infer 关键字

`infer` 是 `inference`的缩写，通常的使用方式是 `infer R` ，`R`表示 **待推断的类型**。通常 `infer`不会被直接使用，而是被放置在底层工具类型中，需要在条件类型中使用：

```tsx
interface Dictionary<T = any> {
  [key: string]: T;
}
	
type StrDict = Dictionary<string>

type DictMember<T> = T extends Dictionary<infer V> ? V : never
type StrDictMember = DictMember<StrDict> // string
```

在上面示例中，当类型 T 满足 `T extends Dictionary` 约束时会使用 `infer` 关键字声明了一个类型变量 V，并返回该类型，否则返回 `never` 类型。

> 在 TypeScript 中，never 类型表示的是那些永不存在的值的类型。 例如， never 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型。
> 
> 
> 另外，需要注意的是，没有类型是 `never` 的子类型或可以赋值给 `never` 类型（除了 `never` 本身之外）。 即使 `any` 也不可以赋值给 `never`。
> 

除了上述的应用外，利用条件类型和 `infer` 关键字，还可以方便地实现获取 Promise 对象的返回值类型，比如：

```tsx
async function stringPromise() {
  return "Hello, Semlinker!";
}

interface Person {
  name: string;
  age: number;
}

async function personPromise() {
  return { name: "Semlinker", age: 30 } as Person;
}

type PromiseType<T> = (args: any[]) => Promise<T>;
type UnPromisify<T> = T extends PromiseType<infer U> ? U : never;

type extractStringPromise = UnPromisify<typeof stringPromise>; // string
type extractPersonPromise = UnPromisify<typeof personPromise>; // Person
```

`infer` 的使用思路可能不是那么好理解，可以用前端开发中常见的一个例子类比：

*页面初始化时先显示占位交互，像 Loading /骨架屏，在请求返回后再去渲染真实数据。*

`infer` 也是这个思路，**类型系统在获得足够的信息后，就能将 infer 后跟随的类型参数推导出来**，最后返回这个推导结果。

```tsx
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

`infer` 其实没有特别难消化的知识点，它需要的只是思路的转变，即理解 **延迟推断** 的概念。

## 泛型工具类型

为了方便开发者 TypeScript 内置了一些常用的工具类型，比如 Partial、Required、Readonly、Record 和 ReturnType 等

### Partial

> `Partial<T>` 的作用就是将某个类型里的属性全部变为可选项 ?
> 

**定义**

```tsx
/**
 * Make all properties in T optional
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

以上代码中，首先通过 `keyof T` 拿到 `T` 的所有属性名，然后使用 `in` 进行遍历，将值赋给 `P`，最后通过 `T[P]` 取得相应的属性值。中间的 `?` 号，用于将所有属性变为可选。

**示例**

```tsx
interface Todo {
  title: string;
  description: string;
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}

const todo1 = {
  title: "organize desk",
  description: "clear clutter"
};

const todo2 = updateTodo(todo1, {
  description: "throw out trash"
});
```

在上面的 `updateTodo` 方法中利用 `Partial<T>` 工具类型，定义 `fieldsToUpdate` 的类型为 `Partial<Todo>`，即：

```
{
   title?: string | undefined;
   description?: string | undefined;
}

```

### Record

> `Record<K extends keyof any, T>` 的作用是将 K 中所有的属性的值转化为 T 类型。
> 

**定义**

```tsx
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};

```

**示例**

```tsx
interface PageInfo {
  title: string;
}

type Page = "home" | "about" | "contact";

const x: Record<Page, PageInfo> = {
  about: { title: "about" },
  contact: { title: "contact" },
  home: { title: "home" }
};

```

### Pick

> `Pick<T, K extends keyof T>` 的作用是将某个类型中的子属性挑出来，变成包含这个类型部分属性的子类型。
> 

**定义**

```tsx
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

**示例**

```tsx
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false
};
```

### Exclude

> `Exclude<T, U>` 的作用是将某个类型中属于另一个的类型移除掉。
> 

**定义**

```tsx
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;
```

如果 `T` 能赋值给 `U` 类型的话，那么就会返回 `never` 类型，否则返回 `T` 类型。最终实现的效果就是将 `T` 中某些属于 `U` 的类型移除掉。

对于联合类型来说会自动分发条件，例如 `T extends U ? X : Y`, T 可能是 `A | B` 的联合类型, 那实际情况就变成`(A extends U ? X : Y) | (B extends U ? X : Y)`

**示例**

```tsx
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">; // "c"
type T2 = Exclude<string | number | (() => void), Function>; // string | number
```

### ReturnType

> `ReturnType<T>` 的作用是用于获取函数 T 的返回类型。
> 

**定义**

```tsx
/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

**示例**

```tsx
type T0 = ReturnType<() => string>; // string
type T1 = ReturnType<(s: string) => void>; // void
type T2 = ReturnType<<T>() => T>; // {}
type T3 = ReturnType<<T extends U, U extends number[]>() => T>; // number[]
type T4 = ReturnType<any>; // any
type T5 = ReturnType<never>; // any
type T6 = ReturnType<string>; // Error
type T7 = ReturnType<Function>; // Error
```

### Omit

> 用之前的 Pick 和 Exclude 进行组合, `Omit<T>` 的作用是实现忽略对象某些属性功能
> 

**定义**

```tsx
/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

```

**示例**

```tsx
type Foo = Omit<{name: string, age: number}, 'name'> // -> { age: number }
```

### Readonly

> `Readonly<T>` 的作用是将传入的属性变为只读选项
> 

```tsx
/**
 * Make all properties in T readonly
 */
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```

### Required

> `Required<T>` 的作用是将传入的属性变为必选项
> 

```tsx
/**
 * Make all properties in T required
 */
type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

- `?`, 就是将可选项代表的 `?` 去掉, 从而让这个类型变成必选项。

与之对应的还有个`+?` , 这个含义自然与`-?`之前相反, 它是用来把属性变成可选项的。

### Mutable (未包含)

其实还有对 `+` 和 `-`, 这里要说的不是变量的之间的进行加减而是对 `readonly` 进行加减。
以下代码的作用就是将 T 的所有属性的 readonly 移除,也可以写一个相反的出来。

```tsx
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
```

## 参考

- [TypeScript的另一面：类型编程](https://zhuanlan.zhihu.com/p/267131210)
- [一文读懂 TypeScript 泛型及应用](https://juejin.cn/post/6844904184894980104#heading-17)
- [TypeScript一些泛型工具的使用及其实现](https://zhuanlan.zhihu.com/p/40311981)