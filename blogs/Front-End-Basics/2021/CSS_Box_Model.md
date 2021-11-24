---
title: 盒模型（CSS Box Model）
date: 2021-03-22
tags:
 - CSS
 - 基础
 - 前端
categories: 
 - Front-End-Basics
---

## 盒模型

### W3C标准盒模型

`width/height = content ` (不包括border和padding)

设置：`box-sizing：content-box`

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/Set%20Diagram-content-box.drawio.png)

**标准 W3C 盒子模型的范围包括 margin、border、padding、content，并且 content 部分不包含其他部分。**

### 盒模型

`width/height = content + padding + border`

设置：`box-sizing：border-box`

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/Set%20Diagram-border-box.drawio%20(1).png)

**IE 盒子模型的范围也包括 margin、border、padding、content，和标准 W3C 盒子模型不同的是：IE 盒子模型的 content 部分包括了 border 和 padding。**



## BFC

> BFC（Block Formatting Context）：块级格式化上下文。一个独立的区域
>
> 是一个独立的布局环境，其中的元素布局是不受外界的影响，并且在一个 BFC 中，块盒与行盒（行盒由一行中所有的内联元素所组成）都会垂直的沿着其父元素的边框排列。

Box 是 CSS 布局的对象和基本单位， 直观点来说，就是一个页面是由很多个 Box 组成的。元素的类型和 display 属性，决定了这个 Box 的类型。 不同类型的 Box， 会参与不同的 `Formatting Context`（一个决定如何渲染文档的容器），因此Box内的元素会以不同的方式渲染。让我们看看有哪些盒子：

**block-level box: **display 属性为 `block, list-item, table` 的元素，会生成 `block-level box`。并且参与 `block fomatting context`；
**inline-level box:** display 属性为 `inline, inline-block, inline-table` 的元素，会生成 `inline-level box`。并且参与 `inline formatting context`;



**Formatting Context**

Formatting context 是 W3C CSS2.1 规范中的一个概念。它是页面中的一块渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用。最常见的 `Formatting context` 有 `Block fomatting context` (简称BFC)和 `Inline formatting context` (简称IFC)。



### BFC的原理/布局规划

> BFC的原理就是BFC的渲染规则，如下：

1. BFC **内部的** 子元素，在垂直方向，**边距会发生重叠**。
2. BFC在页面中是独立的容器，外面的元素不会影响里面的元素，反之亦然。（稍后看 `举例1`）
3. **BFC区域不与旁边的`float box`区域重叠**。（可以用来清除浮动带来的影响）。（稍后看 `举例2`）
4. 计算`BFC`的高度时，浮动的子元素也参与计算。（稍后看 `举例3`）



### 生成 BFC 的方法

- 方法1：`overflow`: 不为`visible`，可以让属性是 `hidden`、`auto`。【最常用】
- 方法2：浮动中：`float`的属性值不为`none`。意思是，只要设置了浮动，当前元素就创建了`BFC`。
- 方法3：定位中：只要`posiiton`的值不是 `static`或者是`relative`即可，可以是`absolute`或`fixed`，也就生成了一个`BFC`。
- 方法4：`display`为`inline-block`, `table-cell`, `table-caption`, `flex`, `inline-flex`



### 对于 BFC 的应用

#### 1.解决margin的重叠

> 当父元素和子元素发生 `margin` 重叠时，解决办法：**给子元素或父元素创建BFC**。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>防止margin重叠</title>
  </head>
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    .block {
      padding: 30px;
      width: 240px;
      text-align: center;
      font-weight: bold;
      background: yellow;
    }

    .block:nth-of-type(1) {
      background: rgb(139, 214, 78);
      margin-bottom: 30px;
    }
    .block:nth-of-type(2) {
      background: rgb(170, 54, 236);
      margin-top: 30px;
    }
  </style>
  <body>
    <div class="block">
      <p>TOP</p>
      <p>（with 30px margin-bottom）</p>
    </div>
    <div class="block">
      <p>BOTTOM</p>
      <p>（with 30px margin-top)</p>
    </div>
  </body>
</html>

```

当两个元素上下都具有margin属性且自身没有 BFC 时会造成外边距重叠（以值大的为主）

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20211124184941.png)

#### 2.BFC区域不与float区域重叠

```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<style>
    *{
        margin: 0;
        padding: 0;
    }
    body {
        width: 100%;
        position: relative;
    }
 
    .left {
        width: 100px;
        height: 150px;
        float: left;
        background: rgb(139, 214, 78);
        text-align: center;
        line-height: 150px;
        font-size: 20px;
    }
 
    .right {
        height: 300px;
        background: rgb(170, 54, 236);
        text-align: center;
        line-height: 300px;
        font-size: 40px;
    }
</style>
<body>
    <div class="left">LEFT</div>
    <div class="right">RIGHT</div>
</body>
</html>
```

效果如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20211124175334.png)

> 上图中，由于右侧标准流里的元素，比左侧浮动的元素要高，导致右侧有一部分会跑到左边的下面去。

**如果要解决这个问题，可以将右侧的元素创建BFC**，因为 **第三条：BFC 区域不与 `float box` 区域重叠**。解决办法如下：将 right 区域添加 `overflow `属性。



#### 3.清除浮动

> 子元素的浮动会造成父元素的高度塌陷

```HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>防止margin重叠</title>
  </head>
  <style>
    * {
      margin: 0;
      padding: 0;
    }

    .parent {
      width: 200px;
      background: rgb(139, 214, 78);
    }
    .son {
      height: 100px;
      width: 140px;
      background: rgb(170, 54, 236);
      text-align: center;
      float: left;
    }
  </style>
  <body>
    <div class="parent">
      <div class="son">SON</div>
    </div>
  </body>
</html>

```

效果如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20211124185627.png)



上面的代码中，子元素浮动了，但由于父元素没有设置高度，导致看不到父元素的背景色

如果想要清除浮动带来的影响

1. 给父亲设置高度；
2. 给父亲增加 `overflow=hidden` 属性创造 BFC 区域即可，

增加之后，效果如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20211124185857.png)

> **计算BFC的高度时，浮动元素也参与计算**。意思是，在计算BFC的高度时，子元素如果是 `float box` 也会参与计算。



## 设置、获取盒模型对应的宽高

### 通过DOM节点的style样式获取

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/carbon.png)

**缺点：**通过这种方式，只能获取**行内样式**，不能获取 **内嵌** 的样式和 **外链** 的样式。



### 通用型

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321150056.png)

### IE独有

>  只有IE独有。获取到的即时运行完之后的宽高（三种css样式都可以获取）。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321150157.png)



### 方式四

> 此 `api` 的作用是：获取一个元素的绝对位置。绝对位置是视窗 `viewport` 左上角的绝对位置。此 `api` 可以拿到四个属性：`left`、`top`、`width`、`height`。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321150324.png)


