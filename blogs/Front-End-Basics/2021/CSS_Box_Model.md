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

## 1. 盒模型

1. W3C标准盒模型

   `width/height = content` (不包括border和padding)

   设置：`box-sizing：content-box`

   ![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321124400.png)

2. IE盒模型

   `width/height = content + padding + border`

   设置：`box-sizing：border-box`

   ![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321125818.png)



## 2. BFC（边距重叠解决方案）

> BFC（Block Formatting Context）：块级格式化上下文。一个独立的区域

BFC的原理/BFC的布局规划

> BFC的原理就是BFC的渲染规则，如下：

1. BFC **内部的**子元素，在垂直方向，**边距会发生重叠**。
2. BFC在页面中是独立的容器，外面的元素不会影响里面的元素，反之亦然。（稍后看`举例1`）
3. **BFC区域不与旁边的`float box`区域重叠**。（可以用来清除浮动带来的影响）。（稍后看`举例2`）
4. 计算`BFC`的高度时，浮动的子元素也参与计算。（稍后看`举例3`）



### 2.1 生成BFC

- 方法1：`overflow`: 不为`visible`，可以让属性是 `hidden`、`auto`。【最常用】
- 方法2：浮动中：`float`的属性值不为`none`。意思是，只要设置了浮动，当前元素就创建了`BFC`。
- 方法3：定位中：只要`posiiton`的值不是 `static`或者是`relative`即可，可以是`absolute`或`fixed`，也就生成了一个`BFC`。
- 方法4：`display`为`inline-block`, `table-cell`, `table-caption`, `flex`, `inline-flex`



### 2.2 BFC的应用

#### 2.2.1 解决margin的重叠

> 当父元素和子元素发生 `margin` 重叠时，解决办法：**给子元素或父元素创建BFC**。

BFC区域是一个独立的区域，不会影响外面的元素



#### 2.2.2 BFC区域不与float区域重叠

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321144619.png)

效果如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321144647.png)

> 上图中，由于右侧标准流里的元素，比左侧浮动的元素要高，导致右侧有一部分会跑到左边的下面去。

**如果要解决这个问题，可以将右侧的元素创建BFC**，因为**第三条：BFC区域不与`float box`区域重叠**。解决办法如下：（将right区域添加overflow属性）



#### 2.2.3 清除浮动

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321145655.png)

效果如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321145723.png)

上面的代码中，儿子浮动了，但由于父亲没有设置高度，导致看不到父亲的背景色

> 如果想要清除浮动带来的影响，方法一是给父亲设置高度，然后采用隔墙法。方法二是 BFC：给父亲增加 `overflow=hidden`属性即可， 增加之后，效果如下：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321145806.png)

> **计算BFC的高度时，浮动元素也参与计算**。意思是，**在计算BFC的高度时，子元素的float box也会参与计算** 



## 3. JavaScript设置、获取盒模型对应的宽高



### 3.1 通过DOM节点的style样式获取

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/carbon.png)

缺点：通过这种方式，只能获取**行内样式**，不能获取`内嵌`的样式和`外链`的样式。



### 3.2 通用型

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321150056.png)

### 3.3 IE独有

>  只有IE独有。获取到的即时运行完之后的宽高（三种css样式都可以获取）。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321150157.png)



### 3.4 方式4

> 此 `api` 的作用是：获取一个元素的绝对位置。绝对位置是视窗 `viewport` 左上角的绝对位置。此 `api` 可以拿到四个属性：`left`、`top`、`width`、`height`。

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210321150324.png)






