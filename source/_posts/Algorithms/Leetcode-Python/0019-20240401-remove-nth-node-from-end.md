---

title: Leetcode 0019.Remove Nth Node From End of List(python)
tags:
  - leetcode
  - python
  - 链表
  - 双指针
categories: [Algorithms, Leetcode-Python]
series: [Leetcode-Python]
abbrlink: 'remove-nth-from-end'
date: 2024-04-01

---

# [19. Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)

## 题目

Given the `head` of a linked list, remove the `nth` node from the end of the list and return its head.

**Example 1:**

```
Input: head = [1,2,3,4,5], n = 2
Output: [1,2,3,5]
```

**Example 2:**

```
Input: head = [1], n = 1
Output: []
```

**Example 3:**

```
Input: head = [1,2], n = 1
Output: [1]
```

## 题目大意

给定一个链表的头节点 `head`，删除链表的倒数第 `n` 个节点，并返回链表的头节点。

---

## 你选用何种方法解题？

本题的核心是**找到链表的倒数第 n 个节点并删除**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 双指针（快慢指针，哑节点） | O(n) | O(1) | **推荐** |
| 双指针（快慢指针，无哑节点） | O(n) | O(1) | 推荐 |
| 两次遍历 | O(n) | O(1) | 可选 |
| 栈 | O(n) | O(n) | 不推荐 |

**方法选择理由**：
- **双指针（快慢指针，哑节点）**：只需一次遍历，时间效率最高，空间复杂度 O(1)，边界处理简单
- **双指针（快慢指针，无哑节点）**：只需一次遍历，代码更简洁，但需要单独处理删除头节点的情况
- **两次遍历**：第一次计算链表长度，第二次找到目标节点，需要两次遍历
- **栈**：需要额外 O(n) 空间存储节点，空间效率低

---

## 解题过程

### 问题分析

输入：链表头节点 `head`，整数 `n`
输出：删除倒数第 `n` 个节点后的链表头节点

关键约束：
- 链表长度至少为 1
- n 是有效的（1 ≤ n ≤ 链表长度）

### 核心洞察

1. **双指针技巧**：快指针先前进 `n` 步，然后快慢指针一起前进，当快指针到达末尾时，慢指针指向倒数第 `n+1` 个节点
2. **哑节点**：使用哑节点可以简化边界处理（如删除头节点的情况）
3. **一次遍历**：只需一次遍历即可找到目标节点的前一个节点

### 算法流程

以 `head = [1,2,3,4,5]`, `n = 2` 为例：

**步骤 1**：创建哑节点 `dummy`，指向头节点

```
dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
```

**步骤 2**：快指针前进 `n=2` 步

```
dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
         ^         ^
        slow      fast
```

**步骤 3**：快慢指针一起前进，直到快指针到达末尾

```
dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
                   ^         ^
                  slow      fast
```

**步骤 4**：删除慢指针指向的下一个节点

```
slow.next = slow.next.next

dummy -> 1 -> 2 -> 3 -> 5 -> None
```

**步骤 5**：返回 `dummy.next`

---

## 这些方法具体怎么运用？

### 方法：双指针（快慢指针）（推荐）

**数据结构**：链表节点 + 两个指针（fast, slow）

**核心逻辑**：
1. **创建哑节点**：`dummy = ListNode(0, head)`，简化边界处理
2. **初始化指针**：`fast = slow = dummy`
3. **快指针前进**：快指针先前进 `n` 步
4. **双指针同步前进**：当 `fast.next` 不为空时，快慢指针一起前进
5. **删除节点**：`slow.next = slow.next.next`
6. **返回结果**：返回 `dummy.next`

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 删除头节点（n = 链表长度） | 哑节点指向新的头节点 |
| 删除尾节点（n = 1） | 正常处理，slow.next 指向 None |
| 链表只有一个节点 | 删除后返回空链表 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 双指针（快慢指针） | **O(n)** | **O(1)** | 只需一次遍历 |
| 两次遍历 | O(n) | O(1) | 需要两次遍历 |
| 栈 | O(n) | O(n) | 需要额外空间存储节点 |

---

## 总结与最佳选择

**最快算法**：**双指针（快慢指针）**。只需一次遍历，时间效率最高。

**工程最优选择**：**双指针（快慢指针）**。理由如下：
1. **时间效率高**：只需一次遍历
2. **空间效率高**：O(1) 空间复杂度
3. **代码简洁**：逻辑清晰，易于理解
4. **边界处理简单**：使用哑节点简化删除头节点的情况

**各方法适用场景**：
- **双指针（快慢指针，哑节点）**：首选方案，边界处理简单，不易出错
- **双指针（快慢指针，无哑节点）**：代码更简洁，使用海象运算符，适合追求代码简洁性的场景
- **两次遍历**：逻辑更直观，适合教学
- **栈**：不推荐使用

---

## Code

### 方法：双指针（快慢指针）（推荐）

```python
from typing import Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        """
        双指针（快慢指针）法：
        1. 使用哑节点简化边界处理
        2. 快指针先前进 n 步
        3. 快慢指针一起前进，直到快指针到达末尾
        4. 删除慢指针指向的下一个节点
        """
        dummy = ListNode(0, head)
        fast = dummy
        slow = dummy
        
        # 快指针先前进 n 步
        for i in range(n):
            fast = fast.next
        
        # 快慢指针一起前进，直到快指针到达末尾
        while fast.next:
            fast = fast.next
            slow = slow.next
        
        # 删除慢指针指向的下一个节点
        slow.next = slow.next.next
        
        return dummy.next
```

### 方法二：双指针（快慢指针，无哑节点）

```python
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(
        self,
        head: Optional[ListNode],
        n: int
    ) -> Optional[ListNode]:
        """
        双指针（快慢指针，无哑节点）法：
        1. 快指针先前进 n 步
        2. 如果快指针为空，说明删除的是头节点
        3. 否则快慢指针一起前进，直到快指针到达末尾
        4. 删除慢指针指向的下一个节点
        """
        fast = head
        
        # 快指针先前进 n 步
        for _ in range(n):
            fast = fast.next
        
        # 特殊情况：删除头节点
        if fast is None:
            return head.next
        
        slow = head
        
        # 快慢指针一起前进，使用海象运算符简化代码
        while (fast := fast.next):
            slow = slow.next
        
        # 删除节点
        slow.next = slow.next.next
        
        return head
```

### 方法三：两次遍历

```python
from typing import Optional

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        """
        两次遍历法：
        1. 第一次遍历计算链表长度
        2. 第二次遍历找到要删除的节点
        """
        # 第一次遍历：计算链表长度
        length = 0
        curr = head
        while curr:
            length += 1
            curr = curr.next
        
        # 特殊情况：删除头节点
        if length == n:
            return head.next
        
        # 第二次遍历：找到要删除节点的前一个节点
        curr = head
        for _ in range(length - n - 1):
            curr = curr.next
        
        # 删除节点
        curr.next = curr.next.next
        
        return head
```