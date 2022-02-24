---
title: flex 布局详解
date: 2022-02-24
tags:
 - CSS
 - 基础
 - 前端
categories: 
 - Front-End-Basics
---

## 概念

弹性盒子是一种用于按行或按列布局元素的一维布局方法，元素可以膨胀以填充额外的空间，收缩以适应更小的空间，适用于任何元素上，如果一个元素使用了 flex 弹性布局（以下都会简称为：flex布局），则会在内部形成[BFC](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FGuide%2FCSS%2FBlock_formatting_context)，


## 兼容性



![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20220224111032.png)



## 主轴与交叉轴

学习flex布局需要明白 "主轴" 与 "交叉轴" 的概念，采用flex布局的元素，称为 "容器" （ flex container），它的所有子元素都是容器的 "项目"（flex item），容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做 `main start` ，结束位置叫做 `main end` ；交叉轴的开始位置叫做 `cross start` ，结束位置叫做 `cross end` 。




![](https://markdowncun.oss-cn-beijing.aliyuncs.com/Set%20Diagram-flex.drawio.png)



## 容器的属性



### flex 容器

#### flex-direction

> `flex-direction` 属性决定主轴的方向（即项目的排列方向）

- `row`（默认值）：主轴为水平方向，起点在左端。
- `row-reverse`：主轴为水平方向，起点在右端。
- `column`：主轴为垂直方向，起点在上沿。
- `column-reverse`：主轴为垂直方向，起点在下沿。

#### flex-wrap

> 默认情况下，项目都排在一条线上，无论是否给定宽度，都是不会主动换行的：

- `nowrap`（默认值）：不换行。
- `wrap`：换行，第一行在上方。
- `wrap-reverse`：换行，第一行在下方。flex-flow

#### flex-flow

> flex-flow` 属性是 `flex-direction` 属性和 `flex-wrap` 属性的简写形式，默认值为 `row nowrap

```css
flex-flow: <flex-direction>|| <flex-wrap>;
```

#### justify-content

> `justify-content` 属性定义了项目在主轴上的对齐方式

- `flex-start`（默认值）：左对齐

- `flex-end`：右对齐

- `center`： 居中

- `space-around`：每个项目两侧的间隔相等。

- `space-between`：两端对齐，项目之间的间隔都相等。

- `space-evenly`：每个项目的间隔与项目和容器之间的间隔是相等的。

  ![](https://markdowncun.oss-cn-beijing.aliyuncs.com/Set%20Diagram-flex_%20justify-content.drawio.png)

  

#### align-items

> `align-items` 属性定义项目在交叉轴上如何对齐

- `flex-start`：交叉轴的起点对齐。
- `flex-end`：交叉轴的终点对齐。
- `center`：交叉轴的中点对齐。
- `baseline`: 项目的第一行文字的基线对齐。
- `stretch`（默认值）: 如果项目未设置高度或设为auto，将占满整个容器的高度。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/Set%20Diagram-flex_%20align-items.drawio.png)

#### align-content

> `align-content` 属性定义了多根轴线的对齐方式，前提是需要设置flex-wrap: wrap，否则不会有效

- `flex-start`：与交叉轴的起点对齐。
- `flex-end`：与交叉轴的终点对齐。
- `center`：与交叉轴的中点对齐。
- `space-between`：与交叉轴两端对齐，轴线之间的间隔平均分布。
- `space-around`：每根轴线两侧的间隔都相等。
- `stretch`（默认值）：轴线占满整个交叉轴。



### flex 子项

#### order

> `order` 属性定义项目的排列顺序。数值越小，排列越靠前，默认为0，可以是负数。

```css
order: <integer>;
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/flex%20layout-flex-item_%20order.drawio1.png)

#### flex-grow

> `flex-grow` flex容器中剩余空间的多少应该分配给项目，也称为扩展规则。最终的项目的宽度为：自身宽度 + 容器剩余空间分配宽度，flex-grow最大值是1，超过1按照1来扩展

```css
flex-grow: <number>;
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/flex%20layout-flex-item_flex-grow.drawio.png)

#### flex-shrink

> `flex-shrink` 属性指定了 flex 元素的收缩规则。flex 元素仅在默认宽度之和大于容器的时候才会发生收缩，其收缩的大小是依据 flex-shrink 的值，默认值是1

```css
flex-shrink: <number>;
/* default 1 */
```

***假设有父元素宽度为 400px，有两个子元素 `div` ，一个宽度为 200 一个宽度为 300***

类似以下公式进行计算：

1. `(200+300)`所有子项的宽度的和 - `(400)`容器的宽度  = `(100)`
2. 第一个子项的宽度占比：`2/5`，第二个子项的宽度占比：`3/5`
3. 则第一个子项的的宽度为：`200  - 2/5 * 100 = 160`，第二个子项的宽度为：`300  - 3/5 * 100 = 240`

#### flex-basis

> `flex-basis` 指定了子项在容器主轴方向上的初始大小，优先级高于自身的宽度width

```css
flex-basis: 0 | 100% | auto | <length>
```

#### flex

> `flex` 属性是 `flex-grow` , `flex-shrink` 和 `flex-basis` 的简写，默认值为 `0 1 auto` 。后两个属性可选。

```css
flex: none | [ <'flex-grow'><'flex-shrink'>? || <'flex-basis'>]
```

#### align-self

> `align-self` 属性允许单个项目有与其他项目不一样的对齐方式，可覆盖 `align-items` 属性。默认值为 `auto` ，表示继承父元素的 `align-items` 属性，如果没有父元素，则等同于 `stretch` 。

```css
align-self: auto | flex-start | flex-end | center | baseline | stretch;
```


![](https://markdowncun.oss-cn-beijing.aliyuncs.com/flex%20layout-flex-item_align-self.drawio.png)

## 参考

1. [深入浅出之 Flex 弹性布局](https://juejin.cn/post/7019075844664459278#heading-3)