---
title: Leetcode 0021.Merge Two Sorted Lists(python)
tags:
  - leetcode
  - python
  - 链表
  - 递归
  - 迭代
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'merge-two-sorted-lists'
date: 2024-04-11
---

# [21. Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)

## 题目

You are given the heads of two sorted linked lists `list1` and `list2`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.

**Example 1:**

```
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
```

**Example 2:**

```
Input: list1 = [], list2 = []
Output: []
```

**Example 3:**

```
Input: list1 = [], list2 = [0]
Output: [0]
```

## 题目大意

将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

---

## 你选用何种方法解题？

本题的核心是**合并两个有序链表**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 迭代（哑节点） | O(n + m) | O(1) | **推荐** |
| 递归 | O(n + m) | O(n + m) | 推荐 |

**方法选择理由**：
- **迭代（哑节点）**：时间效率高，空间复杂度 O(1)，代码直观
- **递归**：代码简洁优雅，适合理解递归思想

---

## 解题过程

### 问题分析

输入：两个升序链表 `list1` 和 `list2`
输出：合并后的升序链表

关键约束：
- 链表已按升序排列
- 需要原地合并，不创建新节点

### 核心洞察

1. **迭代方法**：使用哑节点简化边界处理，双指针遍历两个链表，每次选择较小的节点
2. **递归方法**：将问题分解为子问题，每次选择较小的头节点，然后递归合并剩余部分

### 迭代算法流程

以 `list1 = [1,2,4]`, `list2 = [1,3,4]` 为例：

```
初始化：dummy -> None, curr = dummy
list1: 1 -> 2 -> 4
list2: 1 -> 3 -> 4

步骤1: 1 vs 1 -> 取1 (list1)
       dummy -> 1, curr = 1, list1 = 2 -> 4

步骤2: 2 vs 1 -> 取1 (list2)
       dummy -> 1 -> 1, curr = 1, list2 = 3 -> 4

步骤3: 2 vs 3 -> 取2 (list1)
       dummy -> 1 -> 1 -> 2, curr = 2, list1 = 4

步骤4: 4 vs 3 -> 取3 (list2)
       dummy -> 1 -> 1 -> 2 -> 3, curr = 3, list2 = 4

步骤5: 4 vs 4 -> 取4 (list1)
       dummy -> 1 -> 1 -> 2 -> 3 -> 4, curr = 4, list1 = None

步骤6: list1为空，连接剩余list2
       dummy -> 1 -> 1 -> 2 -> 3 -> 4 -> 4

返回 dummy.next
```

### 递归算法流程

以 `list1 = [1,2,4]`, `list2 = [1,3,4]` 为例：

```
merge([1,2,4], [1,3,4])
  -> 1 vs 1 -> 取较小的1(list1)，递归合并 [2,4] 和 [1,3,4]
     -> 2 vs 1 -> 取较小的1(list2)，递归合并 [2,4] 和 [3,4]
        -> 2 vs 3 -> 取较小的2(list1)，递归合并 [4] 和 [3,4]
           -> 4 vs 3 -> 取较小的3(list2)，递归合并 [4] 和 [4]
              -> 4 vs 4 -> 取较小的4(list1)，递归合并 [] 和 [4]
                 -> list1为空，返回 [4]
              -> 返回 4 -> 4
           -> 返回 3 -> 4 -> 4
        -> 返回 2 -> 3 -> 4 -> 4
     -> 返回 1 -> 2 -> 3 -> 4 -> 4
  -> 返回 1 -> 1 -> 2 -> 3 -> 4 -> 4
```

---

## 这些方法具体怎么运用？

### 方法一：迭代（哑节点）（推荐）

**数据结构**：哑节点 + 指针

**核心逻辑**：
1. **创建哑节点**：`dummy = ListNode()`, `curr = dummy`
2. **遍历两个链表**：
   - 如果 `list1.val < list2.val`，取 list1 节点
   - 否则，取 list2 节点
3. **连接剩余节点**：将未遍历完的链表连接到结果末尾
4. **返回结果**：返回 `dummy.next`

### 方法二：递归

**核心逻辑**：
1. **终止条件**：如果其中一个链表为空，返回另一个链表
2. **递归步骤**：
   - 如果 `list1.val < list2.val`，取 list1 作为当前节点，递归合并 `list1.next` 和 `list2`
   - 否则，取 list2 作为当前节点，递归合并 `list1` 和 `list2.next`
3. **返回结果**：返回当前节点

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 两个链表都为空 | 返回空链表 |
| 其中一个链表为空 | 返回另一个链表 |
| 链表长度不同 | 连接剩余节点 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 迭代（哑节点） | **O(n + m)** | **O(1)** | n 和 m 分别是两个链表的长度 |
| 递归 | O(n + m) | O(n + m) | 递归栈深度 |

---

## 总结与最佳选择

**最快算法**：**迭代（哑节点）**。空间复杂度更低。

**工程最优选择**：**迭代（哑节点）**。理由如下：
1. **空间效率高**：O(1) 空间复杂度
2. **代码直观**：逻辑清晰，易于理解和维护
3. **适用性广**：不涉及递归深度限制

**各方法适用场景**：
- **迭代（哑节点）**：生产环境首选
- **递归**：教学演示递归思想

---

## Code

### 方法一：迭代（哑节点）（推荐）

```python
from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        """
        迭代法：使用哑节点简化边界处理
        时间复杂度 O(n + m)，空间复杂度 O(1)
        """
        dummy = ListNode()
        curr = dummy
        
        # 遍历两个链表
        while list1 and list2:
            if list1.val < list2.val:
                curr.next = list1
                list1 = list1.next
            else:
                curr.next = list2
                list2 = list2.next
            curr = curr.next
        
        # 连接剩余节点
        curr.next = list1 if list1 else list2
        
        return dummy.next
```

### 方法二：递归

```python
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        """
        递归法：将问题分解为子问题
        时间复杂度 O(n + m)，空间复杂度 O(n + m)
        """
        # 终止条件：如果其中一个链表为空，返回另一个链表
        if not list1:
            return list2
        if not list2:
            return list1
        
        # 递归步骤：选择较小的节点
        if list1.val < list2.val:
            list1.next = self.mergeTwoLists(list1.next, list2)
            return list1
        else:
            list2.next = self.mergeTwoLists(list1, list2.next)
            return list2
```