---
title: Leetcode 0232. Implement Queue using Stacks
tags:
  - leetcode
categories:
  - Leetcode
  - Stack
series: Leetcode-Cpp
abbrlink: e8433ada
date: 2023-11-15 22:03:00
---

## [232. Implement Queue using Stacks](https://leetcode.cn/problems/implement-queue-using-Stacks/)

Implement a first in first out (FIFO) queue using only two Stacks. The implemented queue should support all the functions of a normal queue (`push`, `peek`, `pop`, and `empty`).

Implement the `MyQueue` class:

- `void push(int x)` Pushes element x to the back of the queue.
- `int pop()` Removes the element from the front of the queue and returns it.
- `int peek()` Returns the element at the front of the queue.
- `boolean empty()` Returns `true` if the queue is empty, `false` otherwise.

**Notes:**

- You must use **only** standard operations of a Stacks, which means only `push to top`, `peek/pop from top`, `size`, and `is empty` operations are valid.
- Depending on your language, the Stacks may not be supported natively. You may simulate a Stack using a list or deque (double-ended queue) as long as you use only a Stack's standard operations.

 **Example 1:**

```
Input
["MyQueue", "push", "push", "peek", "pop", "empty"]
[[], [1], [2], [], [], []]
Output
[null, null, null, 1, 1, false]

Explanation
MyQueue myQueue = new MyQueue();
myQueue.push(1); // queue is: [1]
myQueue.push(2); // queue is: [1, 2] (leftmost is front of the queue)
myQueue.peek(); // return 1
myQueue.pop(); // return 1, queue is [2]
myQueue.empty(); // return false
```

## 题目大意

要求仅使用两个栈实现一个 **先进先出（FIFO）** 的队列，并支持普通队列的全部功能（`push`、`peek`、`pop`、`empty`）。
核心限制：只能使用栈的标准操作（仅允许 `push` 到栈顶、从栈顶 `peek`/`pop`、获取栈大小、判断栈是否为空），不能使用栈之外的其他数据结构特性。

## 解题思路

栈的特性是 **后进先出（LIFO）**，而队列是 **先进先出（FIFO）**，通过两个栈的 “配合反转” 可模拟队列：

1. **划分功能栈**：
   - `in_vec`：专门用于处理 `push` 操作（元素始终压入 `in_vec` 栈顶，模拟队列 “入队到队尾”）。
   - `out_vec`：专门用于处理 `pop` 和 `peek` 操作（当 `out_vec` 为空时，将 `in_vec` 的所有元素转移到 `out_vec`，此时 `out_vec` 的栈顶就是队列的队首，实现 “反转顺序”）。
2. **核心逻辑**：
   - `push`：直接将元素压入 `in_vec`（O (1) 时间，仅栈顶操作）。
   - `pop`/`peek`：先检查 `out_vec` 是否为空，若为空则将 `in_vec` 所有元素 **逐个弹出并压入 `out_vec`**（此时 `out_vec` 栈顶为队列队首）；再从 `out_vec` 栈顶执行 `pop` 或 `peek`（转移元素的时间为 O (n)，但每个元素仅转移一次，均摊时间为 O (1)）。
   - `empty`：当两个栈均为空时，队列才为空（O (1) 时间）。

```
#include <vector>
using namespace std;

class MyQueue {
private:
    vector<int> in_vec;  // 模拟输入栈：接收push的元素（队尾方向）
    vector<int> out_vec; // 模拟输出栈：提供pop/peek的元素（队首方向）

    // 辅助函数：out_vec为空时，将in_vec的所有元素转移到out_vec
    void transfer() {
        if (out_vec.empty()) {
            // 从in_vec尾部弹出元素，加入out_vec尾部（模拟栈的弹栈+压栈）
            while (!in_vec.empty()) {
                out_vec.push_back(in_vec.back()); // in_vec尾部元素压入out_vec尾部
                in_vec.pop_back();                // 弹出in_vec尾部元素
            }
        }
    }

public:
    MyQueue() {
        // 构造函数：默认初始化两个空vector
    }
    
    // 压入元素到队尾（模拟队列push）
    void push(int x) {
        in_vec.push_back(x); // 元素加入in_vec尾部（栈顶）
    }
    
    // 弹出队首元素并返回（模拟队列pop）
    int pop() {
        transfer();                  // 确保out_vec有元素（队首在尾部）
        int front = out_vec.back();  // 获取out_vec尾部元素（队首）
        out_vec.pop_back();          // 弹出out_vec尾部元素（队首）
        return front;
    }
    
    // 返回队首元素（不弹出，模拟队列peek）
    int peek() {
        transfer();                  // 确保out_vec有元素（队首在尾部）
        return out_vec.back();       // 返回out_vec尾部元素（队首）
    }
    
    // 判断队列是否为空
    bool empty() {
        return in_vec.empty() && out_vec.empty();
    }
};
```