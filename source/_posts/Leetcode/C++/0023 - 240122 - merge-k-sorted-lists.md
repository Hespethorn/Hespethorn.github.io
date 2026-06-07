---
title: Leetcode 0023.merge-k-sorted-lists
tags:
  - queue
categories:
  - Lists
series: Leecode
abbrlink: ab971fff
date: 2023-03-14 20:47:00
---

## [23. 合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/)

给你一个链表数组，每个链表都已经按升序排列。

请你将所有链表合并到一个升序链表中，返回合并后的链表。

**示例 1：**

```
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
解释：链表数组如下：
[
  1->4->5,
  1->3->4,
  2->6
]
将它们合并到一个有序链表中得到。
1->1->2->3->4->4->5->6
```

**示例 2：**

```
输入：lists = []
输出：[]
```

**示例 3：**

```
输入：lists = [[]]
输出：[]
```

## 题目大意

多个有序链表的合并，使用归并排序整理有序链表，更优秀的思考是采用优先级队列（小根堆）来排序。归并可以看21题。

## 解题思路

### 解法一：分治法（两两合并）

#### 思路核心

借鉴「归并排序」的分治思想，将 K 个链表逐步拆分为成对的子问题，合并后再递归 / 迭代合并结果，减少重复比较次数。

#### 步骤拆解

**边界处理**：若 lists 为空，直接返回 nullptr；

**迭代合并**：

- 初始时，待合并链表个数为 k = lists.size()；

- 每次循环中，将相邻的两个链表合并，结果存入数组前半部分；

- 更新待合并链表个数为 k = (k + 1) / 2（向上取整），重复直至 k = 1；

**返回结果**：数组中剩余的唯一链表即为合并后的结果。

#### 关键逻辑

- 利用「合并两个升序链表」的成熟函数作为子函数，复用代码；

- 原地存储合并结果，无需额外开辟大量空间，空间效率高。

```
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // 预处理：过滤所有空链表，避免后续无效合并
        vector<ListNode*> validLists;
        for (auto& list : lists) {
            if (list != nullptr) validLists.push_back(list);
        }
        if (validLists.empty()) return nullptr;

        int n = validLists.size();
        // 迭代合并：步长从1开始，每次翻倍（模拟归并排序的合并阶段）
        for (int step = 1; step < n; step *= 2) {
            for (int i = 0; i + step < n; i += 2 * step) {
                // 合并 i 和 i+step 位置的链表，结果存入 i 位置
                validLists[i] = mergeTwoLists(validLists[i], validLists[i + step]);
            }
        }
        return validLists[0];
    }

private:
    // 合并两个链表的优化版：减少指针操作，提前终止判断
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        if (!l1) return l2;
        if (!l2) return l1;
        // 直接选择较小的头节点作为真实头，避免虚拟节点的内存开销
        ListNode* head = (l1->val <= l2->val) ? l1 : l2;
        ListNode* prev = head;
        if (head == l1) l1 = l1->next;
        else l2 = l2->next;

        while (l1 && l2) {
            if (l1->val <= l2->val) {
                prev->next = l1;
                l1 = l1->next;
            } else {
                prev->next = l2;
                l2 = l2->next;
            }
            prev = prev->next;
        }
        prev->next = l1 ? l1 : l2;
        return head;
    }
};
```

### 解法二：优先队列（最小堆）

#### 思路核心

用「最小堆」维护所有链表的当前头节点，每次提取堆顶（最小值节点）接入结果，再将该节点的下一个节点（若存在）加入堆，实现动态维护最小值。

#### 步骤拆解

**初始化堆**：遍历 lists，将所有非空链表的头节点加入最小堆（堆的排序规则为节点值从小到大）；

**构建结果链表**：

- 创建虚拟头节点 dummy，用于简化结果链表的拼接；

- 循环提取堆顶节点（当前最小值节点），接入结果链表的尾部；

- 若该节点的下一个节点非空，将其加入堆，维持堆的结构；

**返回结果**：虚拟头节点的 next 指针即为合并后链表的头节点。

```
class Solution {
public:
    // 自定义堆节点比较规则（使用结构体更高效，避免lambda的隐式开销）
    struct Cmp {
        bool operator()(ListNode* a, ListNode* b) {
            return a->val > b->val; // 小根堆
        }
    };

    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // 优先队列：指定初始容量（减少动态扩容开销），使用自定义比较器
        priority_queue<ListNode*, vector<ListNode*>, Cmp> minHeap;

        // 初始化堆：仅加入非空节点，避免堆中存储nullptr
        for (auto& list : lists) {
            if (list) minHeap.push(list);
        }

        // 虚拟头节点（此处保留，因为结果链表需要动态拼接，虚拟头更简洁）
        ListNode dummy;
        ListNode* curr = &dummy; // 栈上分配，避免new/delete的内存泄漏风险

        while (!minHeap.empty()) {
            ListNode* top = minHeap.top();
            minHeap.pop();

            curr->next = top;
            curr = curr->next;

            // 加入下一个节点（若存在）
            if (top->next) {
                minHeap.push(top->next);
            }
        }

        return dummy.next; // 无需释放栈上节点，自动析构
    }
};
```

