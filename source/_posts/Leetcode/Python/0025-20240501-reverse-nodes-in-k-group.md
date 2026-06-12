---
title: Leetcode 0025.Reverse Nodes in k-Group(python)
tags:
  - leetcode
  - python
  - 链表
  - 迭代
  - 头插法
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'reverse-nodes-in-k-group'
date: 2024-05-01
---

# [25. Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/)

## 题目

Given the `head` of a linked list, reverse the nodes of the list `k` at a time, and return *the modified list*.

`k` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of `k` then left-out nodes, in the end, should remain as it is.

You may not alter the values in the list's nodes, only nodes themselves may be changed.

**Example 1:**

```
Input: head = [1,2,3,4,5], k = 2
Output: [2,1,4,3,5]
```

**Example 2:**

```
Input: head = [1,2,3,4,5], k = 3
Output: [3,2,1,4,5]
```

## 题目大意

给定一个链表，每 k 个节点一组进行翻转，并返回翻转后的链表。如果节点总数不是 k 的倍数，那么最后剩余的节点保持原有顺序。要求不能修改节点的值，只能改变节点指针。

---

## 你选用何种方法解题？

本题的核心是**分组翻转链表**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 迭代法（统计节点数） | O(n) | O(1) | **推荐** |
| 头插法 | O(n) | O(1) | 推荐 |

**方法选择理由**：
- **迭代法（统计节点数）**：逻辑清晰，代码易于理解
- **头插法**：更高效，不需要提前统计节点数

---

## 解题过程

### 问题分析

输入：链表头节点 `head`，整数 `k`
输出：每 k 个节点一组翻转后的链表

关键约束：
- 不能修改节点的值
- 最后不足 k 个节点保持不变

### 核心洞察

1. **迭代法**：先统计节点总数，然后逐组翻转，每组翻转后正确连接
2. **头插法**：在遍历过程中直接进行翻转，不需要提前统计节点数

### 迭代法算法流程

以 `head = [1,2,3,4,5]`, `k = 2` 为例：

```
统计节点数: n = 5

初始化: dummy -> 1 -> 2 -> 3 -> 4 -> 5
        p0 = dummy, pre = None, cur = head

第一组(k=2):
  翻转 [1,2] -> [2,1]
  连接: dummy -> 2 -> 1 -> 3 -> 4 -> 5
  更新: p0 = 1

第二组(k=2):
  翻转 [3,4] -> [4,3]
  连接: dummy -> 2 -> 1 -> 4 -> 3 -> 5
  更新: p0 = 3

n = 1 < k = 2，结束

结果: [2,1,4,3,5]
```

### 头插法算法流程

以 `head = [1,2,3,4,5]`, `k = 2` 为例：

```
初始化: dummy -> 1 -> 2 -> 3 -> 4 -> 5
        pre = dummy

第一组:
  2 -> 1 -> 3 -> 4 -> 5
  3 -> 2 -> 1 -> 4 -> 5
  pre = 1

第二组:
  4 -> 3 -> 1 -> 5
  5 -> 4 -> 3 -> 1
  pre = 3

到达末尾，结束

结果: [2,1,4,3,5]
```

---

## 这些方法具体怎么运用？

### 方法一：迭代法（统计节点数）（推荐）

**核心逻辑**：
1. **统计节点数**：遍历链表统计总节点数 `n`
2. **初始化指针**：`dummy = ListNode(next=head)`, `p0 = dummy`, `pre = None`, `cur = head`
3. **分组翻转**：
   - 当 `n >= k` 时，翻转 k 个节点
   - 使用头插法翻转：`cur.next = pre`, `pre = cur`, `cur = nxt`
4. **连接翻转后的组**：
   - `nxt = p0.next`（翻转前的第一个节点，现在是最后一个）
   - `nxt.next = cur`（连接下一组）
   - `p0.next = pre`（连接翻转后的组）
   - `p0 = nxt`（移动到下一组的前一个节点）
5. **返回结果**：返回 `dummy.next`

### 方法二：头插法

**核心逻辑**：
1. **创建哑节点**：`dummy = ListNode(next=head)`
2. **初始化指针**：`pre = dummy`, `cur = head`
3. **遍历链表**：
   - 检查剩余节点是否 >= k
   - 使用头插法将后面的 k-1 个节点依次插入到 pre 后面
4. **返回结果**：返回 `dummy.next`

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| k = 1 | 不需要翻转，直接返回原链表 |
| 链表长度 < k | 不需要翻转，直接返回原链表 |
| 链表长度是 k 的倍数 | 全部翻转 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 迭代法（统计节点数） | **O(n)** | **O(1)** | n 是链表长度 |
| 头插法 | O(n) | O(1) | 不需要提前统计 |

---

## 总结与最佳选择

**最快算法**：两种方法时间复杂度相同。

**工程最优选择**：**迭代法（统计节点数）**。理由如下：
1. **逻辑清晰**：代码结构清晰，易于理解和维护
2. **可读性强**：分组处理逻辑明确

**各方法适用场景**：
- **迭代法（统计节点数）**：代码清晰，适合大多数情况
- **头插法**：更简洁，不需要提前统计节点数

---

## Code

### 方法一：迭代法（统计节点数）（推荐）

```python
from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        """
        迭代法：先统计节点数，再分组翻转
        时间复杂度 O(n)，空间复杂度 O(1)
        """
        # 统计节点个数
        n = 0
        cur = head
        while cur:
            n += 1
            cur = cur.next
        
        p0 = dummy = ListNode(next=head)
        pre = None
        cur = head
        
        # k 个一组处理
        while n >= k:
            n -= k
            for _ in range(k):  # 同 92 题，头插法翻转
                nxt = cur.next
                cur.next = pre  # 每次循环只修改一个 next，方便理解
                pre = cur
                cur = nxt
            
            # 连接翻转后的组
            nxt = p0.next
            nxt.next = cur
            p0.next = pre
            p0 = nxt
        
        return dummy.next
```

### 方法二：头插法

```python
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        """
        头插法：在遍历过程中直接翻转
        时间复杂度 O(n)，空间复杂度 O(1)
        """
        if k == 1:
            return head
        
        dummy = ListNode(next=head)
        pre = dummy
        
        while True:
            # 检查剩余节点是否 >= k
            cur = pre.next
            for _ in range(k):
                if not cur:
                    return dummy.next
                cur = cur.next
            
            # 头插法翻转 k 个节点
            cur = pre.next
            for _ in range(k - 1):
                nxt = cur.next
                cur.next = nxt.next
                nxt.next = pre.next
                pre.next = nxt
            
            pre = cur
        
        return dummy.next
```