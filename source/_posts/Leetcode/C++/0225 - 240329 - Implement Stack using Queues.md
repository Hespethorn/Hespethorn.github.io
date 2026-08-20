---
title: Leetcode 0225. Implement Stack using Queues
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: b38cba9d
date: 2023-11-06
---

## [225. Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/)

Implement a last-in-first-out (LIFO) stack using only two queues. The implemented stack should support all the functions of a normal stack (push, top, pop, and empty).

Implement the MyStack class:

- `void push(int x)`: Pushes element x to the top of the stack.
- `int pop()`: Removes the element on the top of the stack and returns it.
- `int top()`: Returns the element on the top of the stack.
- `boolean empty()`: Returns true if the stack is empty, false otherwise.

Notes:

- You must use only standard operations of a queue, which means that only push to back, peek/pop from front, size and is empty operations are valid.
- Depending on your language, the queue may not be supported natively. You may simulate a queue using a list or deque (double-ended queue) as long as you use only a queue's standard operations.

## 题目大意

要求仅使用两个队列实现一个 **后进先出（LIFO）** 的栈，并支持普通栈的全部功能（`push`、`top`、`pop`、`empty`）。
核心限制：只能使用队列的标准操作（仅允许 `push` 到队尾、从队首 `peek`/`pop`、获取队列大小、判断队列是否为空），不能使用队列之外的其他数据结构特性。

## 解题思路

队列的特性是 **先进先出（FIFO）**，而栈是 **后进先出（LIFO）**，通过两个队列的 “元素转移” 可模拟栈的顺序，核心思路是 **让其中一个队列始终保持 “栈顶元素在队首”**，具体如下：

1. **划分功能队列**：
   - `main_q`（主队列）：始终存储当前栈的所有元素，且 **栈顶元素位于 `main_q` 的队首**（便于 `pop` 和 `top` 直接操作队首）。
   - `temp_q`（临时队列）：仅在 `push` 新元素时用于暂存 `main_q` 的原有元素，辅助调整顺序。
2. **核心逻辑**：
   - `push`：先将新元素压入空的 `temp_q`，再将 `main_q` 的所有元素依次转移到 `temp_q`（此时新元素在 `temp_q` 队首，即栈顶），最后交换 `main_q` 和 `temp_q` 的角色（`main_q` 变为新的存储队列，`temp_q` 清空备用）。
   - `pop`/`top`：直接操作 `main_q` 的队首（因 `main_q` 队首就是栈顶），无需额外转移（`pop` 弹出队首，`top` 查看队首）。
   - `empty`：仅需判断 `main_q` 是否为空（`temp_q` 始终为空或仅暂存元素，不存储最终数据）。

```
#include <queue>
using namespace std;

class MyStack {
private:
    queue<int> main_q;  // 主队列：存储栈元素，栈顶在队首
    queue<int> temp_q;  // 临时队列：辅助push操作调整顺序

public:
    MyStack() {
        // 构造函数：默认初始化两个空队列
    }
    
    // 压入元素到栈顶
    void push(int x) {
        // 1. 新元素先入temp_q（此时temp_q仅含新元素，新元素在队首）
        temp_q.push(x);
        
        // 2. 将main_q的所有元素转移到temp_q（新元素仍在队首）
        while (!main_q.empty()) {
            temp_q.push(main_q.front());  // main_q队首元素入temp_q队尾
            main_q.pop();                 // 弹出main_q队首元素
        }
        
        // 3. 交换main_q和temp_q，使main_q成为新的存储队列
        swap(main_q, temp_q);
        // 此时temp_q为空（原temp_q的元素已转移到main_q），备用
    }
    
    // 弹出栈顶元素并返回
    int pop() {
        // main_q队首就是栈顶，直接弹出
        int top_val = main_q.front();
        main_q.pop();
        return top_val;
    }
    
    // 返回栈顶元素（不弹出）
    int top() {
        // main_q队首就是栈顶，直接查看
        return main_q.front();
    }
    
    // 判断栈是否为空
    bool empty() {
        // 仅需判断main_q是否为空（temp_q始终为空）
        return main_q.empty();
    }
};
```