---
title: 二分查找算法
date: 2021-07-26
tags:
  - 杂
  - 算法
categories:
  - Algorithm
---

> **Knuth：Although the basic idea of binary search is comparatively straightforward, the details can be surprisingly tricky**

**应用场景：寻找一个数、寻找左侧边界、寻找右侧边界**

### 零、二分查找框架

```javascript
let binarySearch = (nums=[], target) => {
    let left = 0, right = ...;

    while(...) {
        let mid = (right + left) / 2;
        if (nums[mid] === target) {
            ...
        } else if (nums[mid] < target) {
            left = ...
        } else if (nums[mid] > target) {
            right = ...
        }
    }
    return ...;
}

```

### 寻找一个数（基本的二分搜索）

> 即搜索一个数，如果存在，返回其索引，否则返回 -1

```javascript
let binarySearch = (nums = [], target) => {
  let left = 0;
  let right = nums.length - 1; // 注意

  while (left <= right) {
    // 注意
    let mid = (right + left) / 2;
    if (nums[mid] == target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1; // 注意
    } else if (nums[mid] > target) {
      right = mid - 1; // 注意
    }
  }
  return -1;
};
```

**1.为什么 while 循环的条件中是 <=，而不是 < ？**

答：因为初始化 `right` 的赋值是 `nums.length - 1`，即最后一个元素的索引，而不是 `nums.length`。

这二者可能出现在不同功能的二分查找中，区别是：前者相当于两端都闭区间 `[left, right]`，后者相当于左闭右开区间 `[left, right)`，因为索引大小为 `nums.length` 是越界的。

这个算法中使用的是 `[left, right]` 两端都闭的区间。**这个区间就是每次进行搜索的区间，称为「搜索区间」**。

当找到目标值的时候可以终止：

```javascript
if (nums[mid] == target) {
  return mid;
}
```

当**搜索区间为空**的时候 `while` 循环应该终止，然后返回 `-1`

- **`while(left <= right)`**

终止条件是 `left == right + 1`，写成区间的形式就是 `[right + 1, right]`，或者带个具体的数字进去 `[3, 2]`，可见**这时候搜索区间为空**，因为没有数字既大于等于 `3` 又小于等于 `2` 的吧。所以这时候 `while` 循环终止是正确的，直接返回 `-1` 即可。

- **`while(left < right)`**

终止条件是 `left == right`，写成区间的形式就是 `[right, right]`，或者带个具体的数字进去 `[2, 2]`，**这时候搜索区间非空**，还有一个数 `2`，但此时 `while` 循环终止了。也就是说这区间 `[2, 2]` 被漏掉了，索引 `2` 没有被搜索，如果这时候直接返回 `-1` 就可能出现错误。

如果非要用 `while(left < right)` 也可以，已经知道了出错的原因，就打个补丁好了：

```javascript
//...
while (left < right) {
  // ...
}
return nums[left] == target ? left : -1;
```

**2.为什么 `left = mid + 1`，`right = mid - 1`？我看有的代码是 `right = mid` 或者 `left = mid`，没有这些加加减减，到底怎么回事，怎么判断？**

答：这也是二分查找的一个难点，不过只要你能理解前面的内容，就能够很容易判断。

刚才明确了「搜索区间」这个概念，而且本算法的搜索区间是两端都闭的，即 `[left, right]`。那么当我们发现索引 `mid` 不是要找的 `target` 时，如何确定下一步的搜索区间呢？

当然是去搜索 `[left, mid - 1]` 或者 `[mid + 1, right]` 对不对？因为 `mid` 已经搜索过，应该从搜索区间中去除。

**3. 此算法有什么缺陷？**

答：至此应该已经掌握了该算法的所有细节，以及这样处理的原因。但是，这个算法存在局限性。

比如说给你有序数组 `nums = [1,2,2,2,3]`，`target = 2`，此算法返回的索引是 `2`，没错。但是如果我想得到 `target` 的左侧边界，即索引 `1`，或者我想得到 `target` 的右侧边界，即索引 `3`，这样的话此算法是无法处理的。

这样的需求很常见。你也许会说，找到一个 `target` 索引，然后向左或向右线性搜索不行吗？可以，但是不好，因为这样难以保证二分查找对数级的复杂度了。

后续的算法就来讨论这两种二分查找的算法。

### 寻找左侧边界的二分搜索

```javascript
let left_bound = (nums = [], target) => {
  if (nums.length == 0) return -1;
  let left = 0;
  let right = nums.length; // 注意

  while (left < right) {
    // 注意
    let mid = (left + right) / 2;
    if (nums[mid] == target) {
      right = mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else if (nums[mid] > target) {
      right = mid; // 注意
    }
  }
  return left;
};
```

**1. 为什么 `while(left < right)` 而不是 <= ?**

答：用相同的方法分析，因为初始化 `right = nums.length` 而不是 `nums.length - 1` 。因此每次循环的「搜索区间」是 `[left, right)` 左闭右开。

`while(left < right)` 终止的条件是 `left == right`，此时搜索区间 `[left, left)` 恰巧为空，所以可以正确终止。

**2.为什么没有返回 -1 的操作？如果 nums 中不存在 target 这个值，怎么办？**

答：因为要一步一步来，先理解一下这个「左侧边界」有什么特殊含义：

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210726144210.png)

对于这个数组，算法会返回 `1`。这个 `1` 的含义可以这样解读：`nums` 中小于 `2` 的元素有 `1` 个。

比如对于有序数组 `nums = [2,3,5,7]`, `target = 1`，算法会返回 `0`，含义是：`nums` 中小于 `1` 的元素有 `0` 个。如果 `target = 8`，算法会返回 `4`，含义是：`nums` 中小于 `8` 的元素有 `4` 个。

综上可以看出，函数的返回值（即 `left` 变量的值）取值区间是闭区间 `[0, nums.length]`，所以我们简单添加两行代码就能在正确的时候 `return -1`：

```javascript
while (left < right) {
  //...
}
// target 比所有数都大
if (left == nums.length) return -1;
// 类似之前算法的处理方式
return nums[left] == target ? left : -1;
```

**3. 为什么 left = mid + 1，right = mid ？和之前的算法不一样？**

答：这个很好解释，因为我们的「搜索区间」是 `[left, right)` 左闭右开，所以当 `nums[mid]` 被检测之后，下一步的搜索区间应该去掉 `mid` 分割成两个区间，即 `[left, mid)` 或 `[mid + 1, right)`。

**4.为什么该算法能够搜索左侧边界？**

答：关键在于对于 `nums[mid] == target` 这种情况的处理：

```javascript
if (nums[mid] == target) {
  right = mid;
}
```

可见，找到 `target` 时不要立即返回，而是缩小「搜索区间」的上界 `right`，在区间 `[left, mid)` 中继续搜索，即不断向左收缩，达到锁定左侧边界的目的。

**5.为什么返回 left 而不是 right？**

答：都是一样的，因为 `while` 终止的条件是 `left == right`。

### 寻找右侧边界的二分查找

> 寻找右侧边界和寻找左侧边界的代码差不多，只有两处不同，已标注：

```javascript
let right_bound = (nums, target) => {
    if (nums.length == 0) return -1;
    int left = 0, right = nums.length;

    while (left < right) {
        int mid = (left + right) / 2;
        if (nums[mid] == target) {
            left = mid + 1; // 注意
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else if (nums[mid] > target) {
            right = mid;
        }
    }
    return left - 1; // 注意
}


```

**1.为什么这个算法能够找到右侧边界？**

答：类似地，关键点还是这里：

```javascript
if (nums[mid] == target) {
  left = mid + 1;
}
```

当 `nums[mid] == target` 时，不要立即返回，而是增大「搜索区间」的下界 `left`，使得区间不断向右收缩，达到锁定右侧边界的目的。

**2.为什么最后返回 `left - 1` 而不像左侧边界的函数，返回 `left`？而且我觉得这里既然是搜索右侧边界，应该返回 `right` 才对。**

答：首先，`while` 循环的终止条件是 `left == right`，所以 `left` 和 `right` 是一样的，你非要体现右侧的特点，返回 `right - 1` 好了。

至于为什么要减一，这是搜索右侧边界的一个特殊点，关键在这个条件判断：

```javascript
if (nums[mid] == target) {    left = mid + 1;    // 这样想: mid = left - 1}
```

![](https://markdowncun.oss-cn-beijing.aliyuncs.com/20210726164543.png)

因为我们对 `left` 的更新必须是 `left = mid + 1`，就是说 `while` 循环结束时，`nums[left]` 一定不等于 `target` 了，而 `nums[left - 1]` 可能是 `target`。

至于为什么 `left` 的更新必须是 `left = mid + 1`，同左侧边界搜索，就不再赘述。

**3.为什么没有返回 `-1` 的操作？如果 `nums` 中不存在 `target` 这个值，怎么办？**

答：类似之前的左侧边界搜索，因为 `while` 的终止条件是 `left == right`，就是说 `left` 的取值范围是 `[0, nums.length]`，所以可以添加两行代码，正确地返回 `-1`：

```javascript
while (left < right) {    
    // ...
}
if (left == 0) return -1;
return nums[left-1] == target ? (left-1) : -1;
```

### 总结

**第一个，最基本的二分查找算法：**

```
因为我们初始化 right = nums.length - 1
所以决定了我们的「搜索区间」是 [left, right]
所以决定了 **while** (left <= right)
同时也决定了 left = mid+1 和 right = mid-1

因为我们只需找到一个 target 的索引即可
所以当 nums[mid] == target 时可以立即返回
```



**第二个，寻找左侧边界的二分查找：**

```
因为我们初始化 right = nums.length
所以决定了我们的「搜索区间」是 [left, right)
所以决定了 while (left < right)
同时也决定了 left = mid+1 和 right = mid

因为我们需找到 target 的最左侧索引
所以当 nums[mid] == target 时不要立即返回
而要收紧右侧边界以锁定左侧边界
```



**第三个，寻找右侧边界的二分查找：**

```
因为我们初始化 right = nums.length
所以决定了我们的「搜索区间」是 [left, right)
所以决定了 while (left < right)
同时也决定了 left = mid+1 和 right = mid

因为我们需找到 target 的最右侧索引
所以当 nums[mid] == target 时不要立即返回
而要收紧左侧边界以锁定右侧边界

又因为收紧左侧边界时必须 left = mid + 1
所以最后无论返回 left 还是 right，必须减一
```

