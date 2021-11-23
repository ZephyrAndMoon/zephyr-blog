---
title: TypeScript 协变与逆变
date: 2021-11-22
tags:
 - 前端
 - 基础
 - TypeScirpt
categories: 
 - TypeScript
---

## **前言**

TypeScript 中有很多地方涉及到子类型 `subtype`、父类型 `supertype`、逆变和协变 `covariance and contravariance` 的概念，如果搞不清这些概念，那么很可能被报错搞的无从下手，或者在写一些复杂类型的时候看到别人可以这么写，但是不知道为什么他可以生效。

## **子类型**

比如考虑如下接口：

```tsx
interface Animal {
  age: number
}

interface Dog extends Animal {
  bark(): void
}
```

在这个例子中，`Animal` 是 `Dog` 的父类，`Dog` 是 `Animal` 的子类型，子类型的属性比父类型更多，更具体。

- 在类型系统中，属性更多的类型是子类型。
- 在集合论中，属性更少的集合是子集。

也就是说，子类型是父类型的超集，而父类型是子类型的子集，这是直觉上容易搞混的一点。

记住一个特征，子类型比父类型更加 **具体**，这点很关键。

## **可赋值性 `assignable`**

`assignable` 是类型系统中很重要的一个概念，当你把一个变量赋值给另一个变量时，就要检查这两个变量的类型之间是否可以相互赋值。

```tsx
let animal: Animal
let dog: Dog

animal = dog // ✅ ok
dog = animal // ❌ error! animal 实例上缺少属性 'bark'
```

从这个例子里可以看出，`animal` 是一个「更宽泛」的类型，它的属性比较少，所以更「具体」的子类型是可以赋值给它的，因为你是知道 `animal` 上只有 `age` 这个属性的，你只会去使用这个属性，`dog` 上拥有 `animal` 所拥有的一切类型，赋值给 `animal` 是不会出现类型安全问题的。

反之，如果 `dog = animal`，那么后续使用者会期望 `dog` 上拥有 `bark` 属性，当他调用了 `dog.bark()` 就会引发运行时的崩溃。

从可赋值性角度来说，子类型是可以赋值给父类型的，也就是 `父类型变量 = 子类型变量` 是安全的，因为子类型上涵盖了父类型所拥有的的一切属性。

## **在函数中的运用**

假设我们有这样的一个函数：

```tsx
function f(val: { a: number; b: number })
```

有这样两个变量：

```tsx
let val1 = { a: 1 }
let val2 = { a: 1, b: 2, c: 3 }
```

调用 `f(val1)` 是会报错的，比较显而易见的来看是因为缺少属性 `b`，而函数 `f` 中很可能去访问 `b` 属性并且做一些操作，比如 `b.substr()`，这就会导致崩溃。

换成上面的知识点来看，`val1` 对应的类型是`{ a: number }`，它是 `{ a: number, b: number }` 的父类型，调用 `f(val1)` 其实就相当于把函数定义中的形参 `val` 赋值成了 `val1`，把父类型的变量赋值给子类型的变量，这是危险的。

反之，调用 `f(val2)` 没有任何问题，因为 `val2` 的类型是 `val`类型的子类型，它拥有更多的属性，函数有可能使用的一切属性它都有。

假设我现在要开发一个 `redux`，在声明 `dispatch` 类型的时候，我就可以这样去做：

```tsx
interface Action {
  type: string
}

declare function dispatch<T extends Action>(action: T)
```

这样，就约束了传入的参数一定是 `Action` 的子类型。也就是说，必须有 `type`，其他的属性有没有，您随意。

## **在联合类型中的运用**

学习了以上知识点，再看联合类型的可赋值性，乍一看会比较反直觉， `'a' | 'b' | 'c'` 是 `'a' | 'b'` 的子类型吗？它看起来属性更多诶？其实正相反，`'a' | 'b' | 'c'` 是 `'a' | 'b'` 的父类型。因为前者比后者更「宽泛」，后者比前者更「具体」。

```tsx
type Parent = 'a' | 'b' | 'c'
type Son = 'a' | 'b'

let parent: Parent
let son: Son

parent = son // ✅ ok
son = parent // ❌ error! parent 有可能是 'c'
```

这里 `son` 是可以安全的赋值给 `parent` 的，因为 `son` 的所有可能性都被 `parent` 涵盖了。

而反之则不行，`parent` 太宽泛了，它有可能是 `'c'`，这是 `Son` 类型 hold 不住的。

## 内涵和外延

> 说协变和逆变前先引入两个概念 **内涵** 和 **外延**

**内涵：** 概念中所反映的事物的特有属性

**外延：** 具有概念所反映的特有属性的所有事物

水果是指多汁且有甜味的植物果实，不但含有丰富的营养且能够帮助消化。水果是对部分可以食用的植物果实和种子的统称，这个是 **内涵**。

它的 **外延** 包括了一切符合定义的事物，如：苹果、梨子、香蕉
**内涵越小的概念, 覆盖的范围越多, 外延越多。**

## **逆变和协变**

先来段[维基百科的定义](https://zh.wikipedia.org/wiki/%E5%8D%8F%E5%8F%98%E4%B8%8E%E9%80%86%E5%8F%98)：

> 协变与逆变(covariance and contravariance)是在计算机科学中，描述具有父/子型别关系的多个型别通过型别构造器、构造出的多个复杂型别之间是否有父/子型别关系的用语。
> 

描述的比较晦涩难懂，但是用我们上面的动物类型的例子来解释一波，现在我们还是有 `Animal` 和 `Dog` 两个父子类型。

### **协变（Covariance）**

那么想象一下，现在我们分别有这两个子类型的数组，他们之间的父子关系应该是怎么样的呢？

没错，`Animal[]` 依然是 `Dog[]` 的父类型，对于这样的一段代码，把子类型赋值给父类型依然是安全的：

```tsx
let animals: Animal[]
let dogs: Dog[]

animals = dogs

animals[0].age // ✅ok
```

转变成数组之后，对于父类型的变量，我们依然只会去 `Dog` 类型中一定有的那些属性。

那么，对于 `type MakeArray<T> = T[]` 这个类型构造器来说，它就是 **`协变（Covariance）`** 的。

### **逆变（Contravariance）**

有这样两个函数：

```tsx
let visitAnimal = (animal: Animal) => void;
let visitDog = (dog: Dog) => void;
```

`animal = dog` 是类型安全的，那么 `visitAnimal = visitDog` 好像也是可行的？其实不然，想象一下这两个函数的实现：

```tsx
let visitAnimal = (animal: Animal) => {
  animal.age
}

let visitDog = (dog: Dog) => {
  dog.age
  dog.bark()
}
```

由于 `visitDog` 的参数期望的是一个更具体的带有 `bark` 属性的子类型，所以如果 `visitAnimal = visitDog` 后，我们可能会用一个不带 `bark` 属性的普通的 `animal` 类型来传给 `visitDog`。

```tsx
visitAnimal = visitDog

let animal = { age: 5 }

visitAnimal(animal) // ❌
```

这会造成运行时错误，`animal.bark` 根本不存在，去调用这个方法会引发崩溃。

但是反过来，`visitDog = visitAnimal` 却是完全可行的。因为后续调用方会传入一个比 `animal` 属性更具体的 `dog`，函数体内部的一切访问都是安全的。

在对 `Animal` 和 `Dog` 类型分别调用如下的类型构造器之后：

`type MakeFunction<T> = (arg: T) => void`

父子类型关系逆转了，这就是 **`逆变（Contravariance）`**。

## 总结

> 会发生 协变与逆变 场景 是 **赋值** / **参数** / **返回值**
> 
- **赋值** 是允许发生 **协变**
- **函数参数** 是允许发生 **逆变**
- **函数返回值** 是允许发生 **协变**

```tsx
class Animal { base = '' }

class Dog extends Animal {
  type = 'Dog'
}

// 会发生 协变与逆变 场景是 赋值 参数 返回值 

// 协变: 类型收敛 内涵缩小 外延扩大
// 逆变: 类型外散 内涵扩大 外延缩小

// 赋值 丶
let a: Animal  
let b: Dog

a = new Dog // 发生了协变 类型收敛 Dog => Animal 内涵缩小了  外延扩大了
b = new Animal // error 不安全的 Property 'type' is missing in type 'Animal' but required in type 'Dog'.

// 参数
let fn1 = (animal: Animal) => {}
let fn2 = (dog: Dog) => {}

fn1 = fn2 // error 不安全的 Type '(dog: Dog) => void' is not assignable to type '(animal: Animal) => void'.
fn2 = fn1 // 发生了逆变 类型外散 Animal => Dog 内涵扩大了 外延缩小了  

// 返回值 
let fx1:() => Animal = () => new Animal 
let fx2:() => Dog = () => new Dog

fx1 = fx2 // 发生了协变 类型收敛 Dog => Animal 内涵缩小了  外延扩大了
fx2 = fx1 // error 不安全的 Type '() => Animal' is not assignable to type '() => Dog'.
```

## **在 TypeScript 中**

当然，在 TypeScript 中，由于灵活性等权衡，对于函数参数默认的处理是 `双向协变` 的。也就是既可以 `visitAnimal = visitDog`，也可以 `visitDog = visitAnimal`。在开启了 `tsconfig` 中的 `strictFunctionType` 后才会严格按照 `逆变` 来约束赋值关系。

## 参考

1. [TypeScript 中的子类型、逆变、协变是什么](https://github.com/sl1673495/blogs/issues/54)
2. [TypeScript 协变和逆变](https://blog.csdn.net/NoBey_/article/details/121075622)