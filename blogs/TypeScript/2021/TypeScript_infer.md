---
title: TypeScript infer
date: 2021-05-13
tags:
 - 前端
 - 基础
 - TypeScirpt
categories: 
 - TypeScript
---

## 介绍

`infer`最早出现在该 [PR](https://github.com/Microsoft/TypeScript/pull/21496)中，表示在 `extends` 条件语句中待推断的类型变量。

**简单示例：**

```typescript
type ParamType<T> = T extends (...args: infer P) => any ? P : T;
```

在这个条件语句 `T extends (...args: infer P) => any ? P : T` 中，`infer P` 表示待推断的函数参数。

整句表示为：如果 `T` 能赋值给 `(...args: infer P) => any`，则结果是 `(...args: infer P) => any` 中的参数args类型 `P`，否则返回为 `T`。

```typescript
interface User {
  name: string;
  age: number;
}

type Func = (user: User) => void;

type Param = ParamType<Func>; // Param = User
type AA = ParamType<string>; // string
```



<br>



## 类型分发

**基本例子：**

```typescript
interface Fish {
    fish: string
}
interface Water {
    water: string
}
interface Bird {
    bird: string
}
interface Sky {
    sky: string
}
//naked type
type Condition<T> = T extends Fish ? Water : Sky;

let condition1: Condition<Fish | Bird> = { water: '水' };
let condition2: Condition<Fish | Bird> = { sky: '天空' };
```

- condition1和condition2里定义的类型里所传的泛型与后面赋值的类型并不一样
- 类型分发一般是用来先知道已知类型，赋的值的类型会基于这个分发进行判断推出相应类型

>  infer相当于占位，用infer的变量来表示一个不知道的类型

结合示例进行说明：

```typescript
type Parameters<T> = T extends (...args: infer R) => any ? R : any;
type T0 = Parameters<() => string>;  // []
type T1 = Parameters<(s: string) => void>;  // [string]
type T2 = Parameters<(<T>(arg: T) => T)>;  // [unknown]
```

如果把`infer R`换成已知类型，那么这个例子就和一开始的类型分发demo没太大区别：

```typescript
type Parameters<T> = T extends (...args:string[]) => any ? string[] : any;
type T0 = Parameters<() => string>; 
```

- 如果不换成已知类型，只写R不写infer的话相当于没有定义变量R直接使用，因此不知道R是什么东西

- 如果通过泛型多定义一个R来传递，因为args必须是个数组类型，所以用泛型传需要限定它的条件

  ```typescript
  type Parameters<T,R extends Array<any>> = T extends (...args:R) => any ? R : any;
  
  type T0 = Parameters<() => string,string[]>; 
  ```

  这样传和传递已知类型没有太大区别，因为在传递第二个泛型的时候，这个类型我们是知道的。

- 通过替换可以发现，infer可以在类型推导中占任何位置。

  ```typescript
    type T1 = { name: string };
    type T2 = { age: number };
    
    type UnionToIntersection<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void } ? U : never;
    type T3 = UnionToIntersection<{ a: (x: T1) => void; b: (x: T2) => void }>; // T1 & T2
  ```



<br>



## 内置类型

- 用于提取函数类型的返回类型：

  ```typescript
  type ReturnType<T> = T extends (...args: any[]) => infer P ? P : any;
  ```

  此时`P`即是表示待推断的返回值类型

  ```typescript
  type Func = () => User;
  type Test = ReturnType<Func>; // Test = User
  ```

- 用于提取构造函数中参数（实例）类型：

  一个构造函数可以使用new来实例化，因此它的类型通常表示如下：

  ```
  type Constructor = new (...args: any[]) => any;
  ```

  当 `infer` 用于构造函数类型中，可用于参数位置 `new (...args: infer P) => any;` 和返回值位置 `new (...args: any[]) => infer P;`

  因此就内置如下两个映射类型：

  ```typescript
  // 获取参数类型
  type ConstructorParameters<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any
    ? P
    : never;
  
  // 获取实例类型
  type InstanceType<T extends new (...args: any[]) => any> = T extends new (...args: any[]) => infer R ? R : any;
  
  class TestClass {
    constructor(public name: string, public age: number) {}
  }
  
  type Params = ConstructorParameters<typeof TestClass>; // [string, number]
  
  type Instance = InstanceType<typeof TestClass>; // TestClass
  ```



<br>



##  一些用例

至此，相信你已经对 `infer` 已有基本了解，我们来看看一些使用它的「骚操作」：

- **tuple** 转 **union** ，如：`[string, number]` →  `string | number`

  解答之前，我们需要了解 tuple 类型在一定条件下，是可以赋值给数组类型：

  ```ts
  type TTuple = [string, number];
  type TArray = Array<string | number>;
  
  type Res = TTuple extends TArray ? true : false; // true
  type ResO = TArray extends TTuple ? true : false; // false
  ```

  因此，在配合 `infer` 时，这很容做到：

  ```ts
  type ElementOf<T> = T extends Array<infer E> ? E : never;
  
  type TTuple = [string, number];
  
  type ToUnion = ElementOf<TTuple>; // string | number
  ```

  在 [stackoverflow](https://stackoverflow.com/questions/44480644/typescript-string-union-to-string-array/45486495#45486495) 上看到另一种解法，比较简（牛）单（逼）：

  ```ts
  type TTuple = [string, number];
  type Res = TTuple[number]; // string | number
  ```

  

- **union** 转 **intersection**，如：`T1 | T2` -> `T1 & T2`

  这个可能要稍微麻烦一点，需要 `infer` 配合「 [Distributive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types) 」使用。

  在[相关链接](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types)中，我们可以了解到「Distributive conditional types」是由「naked type parameter」构成的条件类型。而「naked type parameter」表示没有被 `Wrapped` 的类型（如：`Array<T>`、`[T]`、`Promise<T>` 等都是不是「naked type parameter」）。「Distributive conditional types」主要用于拆分 `extends` 左边部分的联合类型，举个例子：在条件类型 `T extends U ? X : Y` 中，当 `T` 是 `A | B` 时，会拆分成 `A extends U ? X : Y | B extends U ? X : Y`；

  有了这个前提，再利用在逆变位置上，[同一类型变量的多个候选类型将会被推断为交叉类型](https://github.com/Microsoft/TypeScript/pull/21496)的特性，即

  ```ts
  type T1 = { name: string };
  type T2 = { age: number };
  
  type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void } ? U : never;
  type T20 = Bar<{ a: (x: string) => void; b: (x: string) => void }>; // string
  type T21 = Bar<{ a: (x: T1) => void; b: (x: T2) => void }>; // T1 & T2
  ```

  因此，综合以上几点，我们可以得到在 [stackoverflow](https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type) 上的一个答案：

  ```ts
  type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
  
  type Result = UnionToIntersection<T1 | T2>; // T1 & T2
  ```

  当传入 `T1 | T2` 时：

  - 第一步：`(U extends any ? (k: U) => void : never)` 会把 union 拆分成 `(T1 extends any ? (k: T1) => void : never) | (T2 extends any ? (k: T2)=> void : never)`，即是得到 `(k: T1) => void | (k: T2) => void`；
  - 第二步：`(k: T1) => void | (k: T2) => void extends ((k: infer I) => void) ? I : never`，根据上文，可以推断出 `I` 为 `T1 & T2`。



<br>



## 题目

[leetcode招聘题目](https://github.com/LeetCode-OpenSource/hire/blob/master/typescript_zh.md)



### 题目描述

```typescript
interface Action<T> {
    payload?: T;
    type: string;
  }
  
  class EffectModule {
    count = 1;
    message = "hello!";
  
    delay(input: Promise<number>) {
      return input.then(i => ({
        payload: `hello ${i}!`,
        type: 'delay'
      }));
    }
  
    setMessage(action: Action<Date>) {
      return {
        payload: action.payload!.getMilliseconds(),
        type: "set-message"
      };
    }
  }
  
  // 修改 Connect 的类型，让 connected 的类型变成预期的类型
  type Connect = (module: EffectModule) => any;
  
  const connect: Connect = m => ({
    delay: (input: number) => ({
      type: 'delay',
      payload: `hello 2`
    }),
    setMessage: (input: Date) => ({
      type: "set-message",
      payload: input.getMilliseconds()
    })
  });
  
  type Connected = {
    delay(input: number): Action<string>;
    setMessage(action: Date): Action<number>;
  };
  
  export const connected: Connected = connect(new EffectModule());
```

**要求修改any，使其返回正确类型，这个类型要和conneted一样**

<br>

### 解法

1. 先提取出effectModule的方法。提取class方法没有现成的，不能直接keyof EffectModule，因为还有别的属性，利用类型分发和class可以取值来做，如果是函数，那就提取，否则就不提取：

   ```typescript
   type MethodName<T> = {[F in keyof T]:T[F] extends Function ? F:never}[keyof T]
   ```

   这里利用value如果是never则keyof就不会返回

2. 拿到了name然后要改装方法，需要：

   ```typescript
   asyncMethod<T, U>(input: Promise<T>): Promise<Action<U>>  变成了
   asyncMethod<T, U>(input: T): Action<U> 
   syncMethod<T, U>(action: Action<T>): Action<U>  变成了
   syncMethod<T, U>(action: T): Action<U>
   ```

   这个是题目给的，直接抄来：

   ```typescript
   type asyncMethod<T, U> = (input: Promise<T>) => Promise<Action<U>> 
   type asyncMethodConnect<T, U> = (input: T) => Action<U> 
   type syncMethod<T, U> = (action: Action<T>) => Action<U> 
   type syncMethodConnect<T, U> = (action: T) => Action<U> 
   ```

   做一个类型分发，用来判断是哪个方法，再分发给哪个方法（泛型是用infer占位）：

   ```typescript
   type EffectMethodAssign<T> = T extends asyncMethod<infer U, infer V>? 
                                               asyncMethodConnect<U, V>
                                           : T extends syncMethod<infer U, infer V>
                                           ? syncMethodConnect<U, V>
                                           : never
   ```

3. 最后，修改connect

   ```typescript
     type Connect = (module: EffectModule) => {
         [F in MethodName<typeof module>]:EffectMethodAssign<typeof module[F]>
     };
   ```

   



## 参考

- [TypeScript中infe的理解与使用](https://blog.csdn.net/yehuozhili/article/details/108253532)
- [TypeScript infer](https://jkchao.github.io/typescript-book-chinese/tips/infer.html#%E4%BB%8B%E7%BB%8D)

