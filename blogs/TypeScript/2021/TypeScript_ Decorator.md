---
title: TypeScript 装饰器
date: 2021-04-26
tags:
 - 前端
 - 基础
 - TypeScirpt
categories: 
 - TypeScript
---


| 装饰器/属性 | 类装饰器                             | 方法装饰器                      | 访问器装饰器                    | 属性装饰器             | 参数装饰器                          |
| ----------- | ------------------------------------ | ------------------------------- | ------------------------------- | ---------------------- | ----------------------------------- |
| 位置        | **@foo class Bar {}**                | **@foo public bar() {}**        | **@foo get bar()**              | **@foo() bar: number** | **bar(@foo para: string) {}**       |
| 传入参数    | constructor                          | target, propertyKey, descriptor | target, propertyKey, descriptor | target, propertyKey    | target, propertyKey, parameterIndex |
| 返回值      | 用返回值提供的构造函数来替换类的声明 | 返回值被用作方法的属性描述符    | 返回值被用作方法的属性描述符    | 被忽略                 | 被忽略                              |





## 1. 类装饰器



### 执行时机

类创建好之后立即执行，不是对每一个实例做修饰

```typescript
function testDecorator(constructor: any) {
    console.log('decorator')
}

@testDecorator
class Test { }

const test1 = new Test();
const test2 = new Test();  
// 只打印一次 "decorator"
```



从上到下、从左到右收集装饰器，但先收集的装饰器会后执行

```typescript
function testDecorator(constructor: any) {
    console.log('decorator')
}

function testDecorator1(constructor: any) {
    console.log('decorator1')
}

@testDecorator
@testDecorator1
class Test { }

// "decorator1"
// "decorator"
```





### 参数

**类装饰器接受的参数是构造函数："constructor"**

*如果需要根据条件判断装饰器中执行逻辑的话 使用装饰器工厂*

```typescript
function testDecorator(flag: boolean) {
    if (flag) {
        return function (constructor: any) {
            constructor.prototype.getName = () => {
                console.log('dell')
            }
        }
    } else {
        return function (constructor: any) { }
    }
}

//  传入参数为 True
@testDecorator(true)
class Test { }

const test = new Test();
(test as any).getName(); // "dell"

//  传入参数为 false
@testDecorator(false)
class Test { }

const test = new Test();
(test as any).getName(); // "test.getName is not a function"


```



**明确类装饰器传入的 "constructor" 类型**

*一个构造函数，可以接收很多的参数，合并到一起就是数组，每一个参数都是`any` 类型，最终的返回值也是 `any` 类型。 T 这个泛型可以被这个构造函数所实例化出来，类包含这个构造函数。 类的装饰器，也可以对构造函数进行扩展。旧的构造函数先执行，最后再执行装饰器的函数*

```typescript
function testDecorator<T extends new (...args: any[]) => {}>(constructor: T) {
    console.log(constructor)
    return class extends constructor {

    }
}

@testDecorator
class Test { }

const test = new Test();
```



### 问题

当使用类装饰器加上一些实例方法后，实例调用该方法时会报错提示没有该方法

```typescript
function testDecorator<T extends new (...args: any[]) => {}>(constructor: T) {
    console.log(constructor)
    return class extends constructor {
        name = 'lee'
        getName() {
            console.log(this.name)
        }
    }
}

@testDecorator
class Test { }

const test = new Test();
test.getName()  // Property 'getName' does not exist on type 'Test'.
```

使用这种方法解决：

```typescript
function testDecorator() {
    return function <T extends new (...args: any[]) => {}>(constructor: T) {
        console.log(constructor)
        return class extends constructor {
            name = 'lee'
            getName() {
                console.log(this.name)
            }
        }
    }
}


const Test = testDecorator()(class {
    name: string;
    constructor(name: string) {
        this.name = name
    }
})

const test = new Test('zephyr');
test.getName()
```





## 2. 方法装饰器

### 执行时机

类创建好之后立即执行，对每一个方法做修饰



### 参数

- target
- propertyKey
- descriptor



#### target

**普通方法中的target：**对应的是类的prototype

**静态方法中的target：**对应的是类的构造函数

```typescript
function getNameDecorator(target: any, propertyKey: string) {
    console.log(target)
}


class Test {
    name: string;
    constructor(name: string) {
        this.name = name
    }

    @getNameDecorator
    getName() {
        return this.name
    }
    
    @getNameDecorator
    static getSex() {
        return '男'
    }
}
const test = new Test('zephyr');  

//  Test { getName: [Function] }
//  { [Function: Test] getName: [Function] }  
```



#### propertykey

使用该装饰器的方法名



#### descriptor

要定义或修改的属性描述符

```typescript
function getNameDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log(descriptor)
}


class Test {
    name: string;
    constructor(name: string) {
        this.name = name
    }

    @getNameDecorator
    getName() {
        return this.name
    }
}
const test = new Test('zephyr');  
/*
  { 
    value: [Function],
    writable: true,
    enumerable: true,
    configurable: true 
  }
*/
```



## 3. 访问器装饰器

### 参数

与方法装饰器相同

```typescript
function visitDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("target:"+target)
    console.log("propertyKey:"+propertyKey)
    console.log("descriptor:"+descriptor)
}


class Test {
    private _name: string;
    constructor(name: string) {
        this._name = name
    }

    @visitDecorator
    get name() {
        return this._name
    }

    set name(name: string) {
        this._name = name
    }
}
const test = new Test('zephyr');  

/*
  target: Test {}
  propertyKey: name
  descriptor: { 
    get: [Function: get],
    set: [Function: set],
    enumerable: false,
    configurable: true 
  }
*/
```



## 4. 属性装饰器

### 参数

- target：原型
- propertyKey：属性名

```typescript
function nameDecorator(target: any, propertyKey: string) {
    console.log("target:"+target)
    console.log("propertyKey:"+propertyKey)
}


class Test {
    @nameDecorator
    name = "dell"
}
const test = new Test(); 
// target: Test {}
// propertyKey: name
```



### 新增属性描述器

```typescript
function nameDecorator(target: any, propertyKey: string): any {
    const descrioptor: PropertyDescriptor = {
        writable: false
    }
    return descrioptor
}


class Test {
    @nameDecorator
    name = "dell"
}
const test = new Test();  
test.name = '123'  // Cannot assign to read only property 'name' of object '#<Test>'
```



### 问题

通过装饰器修改属性

```typescript
function nameDecorator(target: any, propertyKey: string): any {
   target[propertyKey] = 'lee' // 修改的是类对应的 prototype 上面的 name
}


class Test {
    @nameDecorator
    name = "dell" // 定义的是放在类的实例上的 name
}
const test = new Test();  
```



## 5. 参数装饰器

### 参数

- target：原型
- propertyKey：方法名
- paramIndex：参数所在位置

```typescript
function paramDecorator(target: any, propertyKey: string, paramIndex: number): any {
    console.log(target)
    console.log(propertyKey)
    console.log(paramIndex)
}


class Test {
    getInfo(@paramDecorator name: string, age: number) {
        console.log(name, age)
    }
}
const test = new Test();
/*
	Test { getInfo: [Function] }
	getInfo
	0
*/
```

