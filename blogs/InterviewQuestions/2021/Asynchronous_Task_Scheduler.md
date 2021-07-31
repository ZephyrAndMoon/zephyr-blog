---
title: 字节跳动面试题 —— 异步任务调度器
date: 2021-08-01
tags:
 - 面试
categories: 
 - 面试
---

### JavaScript实现异步任务调度器

**题目**

```javascript
// JS实现一个带并发限制的异步调度器Scheduler，
// 保证同时运行的任务最多有两个。
// 完善代码中Scheduler类，
// 使得以下程序能正确输出

class Scheduler {
	constructor() {
		this.count = 2
		this.queue = []
		this.run = []
	}

	add(task) {
                 // ...
	}
}


const timeout = (time) => new Promise(resolve => {
	setTimeout(resolve, time)
})

const scheduler = new Scheduler()
const addTask = (time, order) => {
	scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
// output: 2 3 1 4

// 一开始，1、2两个任务进入队列
// 500ms时，2完成，输出2，任务3进队
// 800ms时，3完成，输出3，任务4进队
// 1000ms时，1完成，输出1
// 1200ms时，4完成，输出4
```

**题解**

```javascript
class Scheduler {
	constructor(maxNum) {
		// 当前执行异步函数数量
		this.count = 0
		// 暂存异步函数队列
		this.taskList = []
		// 最大可同步执行的异步函数数量
		this.maxNum = maxNum
	}
	async add(promiseCreator) {
		// 如果当前执行异步函数的数量 大于 最大可同步执行的异步函数数量
		if (this.count >= this.maxNum) {
			// 创建一个Promise 将resolve推进任务队列 —— 此时Promise的状态未pending 持续await
			await new Promise(resolve => {
				this.taskList.push(resolve)
			})
		}
		// 当前执行的异步函数数量 +1
		this.count++
		// 等待异步任务的结束
		await promiseCreator()
		// 当前执行的异步函数数量 -1
		this.count--
		// 如果有等待的异步任务
		if (this.taskList.length > 0) {
			// 释放 taskList 中的 resolve 函数,解除上面的pending状态
			this.taskList.shift()()
		} 
	}
}

const timeout = time =>
	new Promise(resolve => {
		setTimeout(resolve, time)
	})
const scheduler = new Scheduler(2)

const addTask = (time, val) => {
	scheduler.add(() => {
		return timeout(time).then(() => {
			console.log(val)
		})
	})
}
addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')
```


