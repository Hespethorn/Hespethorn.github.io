---

title: Leetcode 0023.Merge k Sorted Lists(python)
tags:
  - leetcode
  - python
  - 链表
  - 分治
  - 堆
categories: [Algorithms, Leetcode-Python]
series: [Leetcode-Python]
abbrlink: 'merge-k-sorted-lists'
date: 2024-04-21

---

# [23. Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)

## 题目

You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*

**Example 1:**

```
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6
```

**Example 2:**

```
Input: lists = []
Output: []
```

**Example 3:**

```
Input: lists = [[]]
Output: []
```

## 题目大意

给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。

---

## 你选用何种方法解题？

本题是“合并两个有序链表”的进阶版。核心难点在于如何高效地从 `k` 个链表中选择最小的节点。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 分治合并 | O(N log k) | O(log k) | **推荐** |
| 优先队列（最小堆） | O(N log k) | O(k) | **推荐** |
| 顺序合并 | O(kN) | O(1) | 不推荐 |

**方法选择理由**：
- **分治合并**：将 k 个链表两两配对合并，类似归并排序。无需额外空间存储节点引用，递归栈空间较小。
- **优先队列（最小堆）**：维护一个大小为 k 的堆，每次获取最小节点。思路直观，适合需要动态维护最小值的场景。
- **顺序合并**：像“冒泡”一样一个个合并，效率最低，容易被卡超时。

---

## 解题过程

### 问题分析

输入：包含 `k` 个升序链表的数组 `lists`。
输出：合并后的升序链表。

关键约束：
- 链表已按升序排列。
- 需要高效地找到当前 `k` 个链表头节点中的最小值。

### 核心洞察

1. **分治法**：
   - 类似归并排序的 `merge` 阶段。
   - 第一轮合并 `lists[0]` & `lists[1]`, `lists[2]` & `lists[3]`...
   - 第二轮合并上一轮的结果，直到只剩一个链表。
   - 每个节点参与的合并次数为 `log k` 次。

2. **优先队列（堆）**：
   - 利用最小堆自动维护当前所有链表头节点的最小值。
   - 每次从堆顶取出最小节点，将其后继节点加入堆。
   - 每个节点入堆、出堆各一次，复杂度为 `log k`。

### 算法流程演示

**分治法流程**（以 `lists = [L1, L2, L3, L4]` 为例）：

```
Round 1:
  Merge(L1, L2) -> M12
  Merge(L3, L4) -> M34
  lists 变为 [M12, M34]

Round 2:
  Merge(M12, M34) -> Result
  lists 变为 [Result]

返回 Result
```

**最小堆流程**（以 `lists = [[1,4,5],[1,3,4],[2,6]]` 为例）：

```
初始化堆：将各链表头节点入堆 -> Heap: [1, 1, 2]
Dummy -> None

Step 1: Pop 1 (from L2)
  Heap: [1, 2]
  连接: Dummy -> 1
  Push 3 (L2的下一个) -> Heap: [1, 2, 3]

Step 2: Pop 1 (from L1)
  Heap: [2, 3]
  连接: ... -> 1 -> 1
  Push 4 (L1的下一个) -> Heap: [2, 3, 4]

...以此类推
```

---

## 这些方法具体怎么运用？

### 方法一：分治合并（推荐）

**核心逻辑**：
1. **迭代合并**：使用 `while` 循环，只要 `lists` 中不止一个链表就继续。
2. **两两配对**：在内层循环中，取出两个链表调用 `mergeTwoLists`。
3. **更新列表**：将合并后的结果放入新列表 `merged`，一轮结束后用 `merged` 替换 `lists`。

**边界情况处理**：
- 如果 `lists` 为空或长度为 0，返回 `None`。
- 如果 `lists` 长度为奇数，最后一个链表会落单，直接加入 `merged` 即可。

### 方法二：优先队列（最小堆）（推荐）

**核心逻辑**：
1. **初始化堆**：遍历 `lists`，将所有非空头节点加入堆。
2. **构建结果链表**：使用 `dummy` 节点。
3. **循环处理**：
   - 弹出堆顶最小节点 `node`。
   - 将 `node` 接到结果链表末尾。
   - 若 `node.next` 存在，将其加入堆。

**Python 技巧**：
- Python 的 `heapq` 默认支持元组比较。如果节点值相同，元组第二个元素（索引）可用于打破平局。
- 自定义 `__lt__` 方法可以让 `ListNode` 直接入堆（如本题代码所示）。

---

## 复杂度

设 $N$ 为所有链表中的节点总数，$k$ 为链表条数。

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 分治合并 | **O(N log k)** | **O(log k)** | 递归栈深度（迭代法可优化为 O(1)） |
| 优先队列 | O(N log k) | O(k) | 堆的大小最大为 k |

---

## 总结与最佳选择

**最快算法**：**分治合并** 和 **优先队列** 时间复杂度相同。
- **分治合并**：不需要额外的堆空间，空间复杂度更优（不考虑递归栈时）。
- **优先队列**：代码逻辑更符合直觉（“每次找最小”），但在 Python 中实现需要处理自定义比较或使用元组。

**工程最优选择**：
- **分治合并**：面试首选，展示对归并思想的深入理解，且空间效率高。
- **优先队列**：适合快速实现，逻辑直观。

---

## Code

### 方法一：分治合并（推荐）

```python
from typing import List, Optional

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # 合并两个有序链表的辅助函数
        def mergeTwoLists(list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
            dummy = ListNode(0)
            curr = dummy
            while list1 and list2:
                if list1.val < list2.val:
                    curr.next = list1
                    list1 = list1.next
                else:
                    curr.next = list2
                    list2 = list2.next
                curr = curr.next
            curr.next = list1 if list1 else list2
            return dummy.next

        if not lists:
            return None

        # 分治归并：两两合并，每次数量减半
        while len(lists) > 1:
            merged = []
            # 每次取出两个链表合并
            for i in range(0, len(lists), 2):
                l1 = lists[i]
                # 防止越界，如果是奇数个，最后一个单独处理（或与None合并）
                l2 = lists[i + 1] if i + 1 < len(lists) else None
                merged.append(mergeTwoLists(l1, l2))
            lists = merged # 更新 lists 为新合并后的列表

        return lists[0]
```

### 方法二：优先队列（最小堆）

```python
from typing import List, Optional
import heapq

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    
    # 重载小于号，使 ListNode 可以直接入堆比较
    def __lt__(self, other):
        return self.val < other.val

class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        min_heap = []
        # 将所有链表的头节点入堆
        for l in lists:
            if l:
                heapq.heappush(min_heap, l)
        
        dummy = ListNode(0)
        tail = dummy
        
        while min_heap:
            # 弹出当前最小节点
            node = heapq.heappop(min_heap)
            tail.next = node
            tail = tail.next
            
            # 若该节点后面还有节点，将下一个节点入堆
            if node.next:
                heapq.heappush(min_heap, node.next)
        
        return dummy.next
```