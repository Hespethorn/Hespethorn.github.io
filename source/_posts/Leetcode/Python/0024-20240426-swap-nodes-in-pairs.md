---
title: Leetcode 0024.Swap Nodes in Pairs(python)
tags:
  - leetcode
  - python
  - 链表
  - 递归
  - 迭代
categories: [Leetcode, Python]
series: Leetcode-Python
abbrlink: 'swap-nodes-in-pairs'
date: 2024-04-26
---

# [24. Swap Nodes in Pairs](https://leetcode.com/problems/swap-nodes-in-pairs/)

## 题目

Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only nodes themselves may be changed.)

**Example 1:**

```
Input: head = [1,2,3,4]
Output: [2,1,4,3]
```

**Example 2:**

```
Input: head = []
Output: []
```

**Example 3:**

```
Input: head = [1]
Output: [1]
```

## 题目大意

给定一个链表，两两交换其中相邻的节点，并返回交换后的链表头节点。要求不能修改节点的值，只能通过改变节点指针来实现交换。

---

## 你选用何种方法解题？

本题的核心是**两两交换链表节点**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 递归 | O(n) | O(n) | **推荐** |
| 迭代（哑节点） | O(n) | O(1) | 推荐 |

**方法选择理由**：
- **递归**：代码简洁优雅，逻辑清晰
- **迭代（哑节点）**：空间复杂度更低，适合处理长链表

---

## 解题过程

### 问题分析

输入：链表头节点 `head`
输出：两两交换后的链表头节点

关键约束：
- 不能修改节点的值，只能改变指针
- 空链表或只有一个节点时直接返回

### 核心洞察

1. **递归方法**：将问题分解为子问题，每次处理一对节点，递归处理剩余部分
2. **迭代方法**：使用哑节点简化边界处理，遍历链表并交换相邻节点

### 递归算法流程

以 `head = [1,2,3,4]` 为例：

```
swapPairs([1,2,3,4])
  -> first = 1, second = 2
  -> 递归处理 [3,4]
     -> swapPairs([3,4])
        -> first = 3, second = 4
        -> 递归处理 [] (终止条件)
        -> 4.next = 3, 返回 4
     -> first.next = 4
     -> 2.next = 1
     -> 返回 2

结果: [2,1,4,3]
```

### 迭代算法流程

以 `head = [1,2,3,4]` 为例：

```
初始化：dummy -> 1 -> 2 -> 3 -> 4
       prev = dummy

步骤1: 交换 1 和 2
       prev -> 2 -> 1 -> 3 -> 4
       prev = 1

步骤2: 交换 3 和 4
       prev -> 4 -> 3
       prev = 3

步骤3: prev.next = None，结束

结果: dummy -> 2 -> 1 -> 4 -> 3
```

---

## 这些方法具体怎么运用？

### 方法一：递归（推荐）

**核心逻辑**：
1. **终止条件**：如果链表为空或只有一个节点，直接返回
2. **定位节点**：`first = head`, `second = head.next`
3. **递归处理**：`first.next = self.swapPairs(second.next)`
4. **交换节点**：`second.next = first`
5. **返回结果**：返回 `second` 作为新的头节点

### 方法二：迭代（哑节点）

**核心逻辑**：
1. **创建哑节点**：`dummy = ListNode(0, head)`, `prev = dummy`
2. **遍历链表**：
   - `first = prev.next`
   - `second = first.next`
   - 交换指针：`prev.next = second`, `first.next = second.next`, `second.next = first`
   - 更新 `prev = first`
3. **返回结果**：返回 `dummy.next`

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 空链表 | 直接返回空 |
| 只有一个节点 | 直接返回该节点 |
| 节点数为奇数 | 最后一个节点不交换 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 递归 | **O(n)** | **O(n)** | n 是链表长度，递归栈深度 |
| 迭代（哑节点） | O(n) | O(1) | 常数空间 |

---

## 总结与最佳选择

**最快算法**：两种方法时间复杂度相同。

**工程最优选择**：**递归**。理由如下：
1. **代码简洁**：逻辑清晰，易于理解和维护
2. **可读性强**：递归结构直观反映问题分解思路

**各方法适用场景**：
- **递归**：代码简洁，适合大多数情况
- **迭代（哑节点）**：空间效率更高，适合处理极长链表

---

## Code

### 方法一：递归（推荐）

```python
from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        """
        递归法：将问题分解为子问题
        时间复杂度 O(n)，空间复杂度 O(n)
        """
        # 终止条件：空节点或只有一个节点
        if not head or not head.next:
            return head
        
        # 定位两个待交换节点
        first = head
        second = head.next
        
        # 递归处理后续节点
        first.next = self.swapPairs(second.next)
        
        # 当前交换
        second.next = first
        
        return second  # 新的头节点是 second
```

### 方法二：迭代（哑节点）

```python
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        """
        迭代法：使用哑节点简化边界处理
        时间复杂度 O(n)，空间复杂度 O(1)
        """
        dummy = ListNode(0, head)
        prev = dummy
        
        while prev.next and prev.next.next:
            # 定位待交换节点
            first = prev.next
            second = first.next
            
            # 交换指针
            prev.next = second
            first.next = second.next
            second.next = first
            
            # 更新 prev 指针
            prev = first
        
        return dummy.next
```