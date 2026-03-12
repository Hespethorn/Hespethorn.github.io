---
title: Leetcode 0024. Swap Nodes in Pairs
tags:
  - leetcode
categories:
  - Leetcode
  - List
series: Leetcode
abbrlink: b31fb8df
date: 2023-05-08 20:44:51
---

## [24. Swap Nodes in Pairs](https://leetcode.cn/problems/swap-nodes-in-pairs/)

Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only nodes themselves may be changed.)

 **Example 1:**

**Input:** head = [1,2,3,4]

**Output:** [2,1,4,3]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2020/10/03/swap_ex1.jpg)

**Example 2:**

- **Input:** head = []$
- **Output:** []

**Example 3:**

- **Input:** head = [1]
- **Output:** [1]

**Example 4:**

- **Input:** head = [1,2,3]

- **Output:** [2,1,3]

## 题目大意

给定一个链表，要求**两两交换相邻节点**（如 1→2→3→4 变为 2→1→4→3），且只能通过调整节点指针实现，不能修改节点内部的值。最终返回交换后链表的头节点，需处理空链表或仅含一个节点的边界情况。

## 解题思路

采用**虚拟头节点 + 迭代**的方法，通过固定的指针操作步骤实现两两交换，避免处理头节点的特殊逻辑：

1. 定义虚拟头节点（`dummyHead`），使其指向原链表头节点，简化头节点交换的边界处理。
2. 定义当前指针（`curr`），初始指向虚拟头节点，用于定位每次需要交换的两个节点的前驱。
3. 每次交换时，需保存三个关键指针（待交换的两个节点 `node1`、`node2`，以及 `node2` 的后继 `nextNode`），避免指针丢失。
4. 按固定顺序调整指针：`curr` 指向 `node2` → `node2` 指向 `node1` → `node1` 指向 `nextNode`。
5. 更新 `curr` 到 `node1`（下一轮交换的前驱），重复步骤 3-4，直到没有可交换的节点（`curr` 的后继为 `null` 或仅一个节点）。

```
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        // 虚拟头节点，指向原链表头，简化边界处理
        ListNode* dummyHead = new ListNode(0);
        dummyHead->next = head;
        // 当前指针，初始指向虚拟头（定位待交换节点的前驱）
        ListNode* curr = dummyHead;
        
        // 循环条件：当前节点后至少有两个节点可交换
        while (curr->next != nullptr && curr->next->next != nullptr) {
            // 保存待交换的两个节点及 node2 的后继（避免指针丢失）
            ListNode* node1 = curr->next;       // 第一个待交换节点
            ListNode* node2 = curr->next->next; // 第二个待交换节点
            ListNode* nextNode = node2->next;   // node2 的后继（交换后接在 node1 后）
            
            // 步骤1：curr 指向 node2（交换后 node2 成为前节点）
            curr->next = node2;
            // 步骤2：node2 指向 node1（完成两个节点的交换）
            node2->next = node1;
            // 步骤3：node1 指向 nextNode（连接后续链表）
            node1->next = nextNode;
            
            // 更新 curr 到 node1（下一轮交换的前驱）
            curr = node1;
        }
        
        // 虚拟头节点的 next 即为交换后的新头节点
        ListNode* newHead = dummyHead->next;
        delete dummyHead; // 释放虚拟头节点内存，避免泄漏
        return newHead;
    }
};
```