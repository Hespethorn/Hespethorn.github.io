---
title: Leetcode 0019. Remove Nth Node From End of List
tags:
  - leetcode
categories:
  - Leetcode
  - List
series: Leetcode
abbrlink: e0bb65fe
date: 2023-06-09 19:29:44
---

## [19. Remove Nth Node From End of List](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

Given the `head` of a linked list, remove the `nth` node from the end of the list and return its head.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/10/03/remove_ex1.jpg)

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

给定一个链表的头节点，要求删除链表的倒数第 N 个节点，并返回删除后的链表头节点。

## 解题思路

可以使用**双指针法**高效解决这个问题，只需一次遍历：

1. 定义两个指针 `fast` 和 `slow`，初始都指向虚拟头节点
2. 先让 `fast` 指针向前移动 N 步
3. 然后让 `fast` 和 `slow` 同时向前移动，直到 `fast` 到达链表末尾
4. 此时 `slow` 指针指向的就是要删除节点的前一个节点
5. 通过调整指针删除目标节点

这种方法不需要先计算链表长度，时间效率更高。

```
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        // 创建虚拟头节点，简化边界处理
        ListNode* dummyHead = new ListNode(0);
        dummyHead->next = head;
        
        // 定义快慢指针
        ListNode* fast = dummyHead;
        ListNode* slow = dummyHead;
        
        // 快指针先移动n步
        for (int i = 0; i < n; ++i) {
            fast = fast->next;
        }
        
        // 快慢指针同时移动，直到快指针到达末尾
        while (fast->next != nullptr) {
            fast = fast->next;
            slow = slow->next;
        }
        
        // 删除慢指针后面的节点
        ListNode* temp = slow->next;
        slow->next = slow->next->next;
        delete temp; // 释放内存
        
        // 保存新的头节点并释放虚拟头节点
        ListNode* newHead = dummyHead->next;
        delete dummyHead;
        
        return newHead;
    }
};
```