---
title: Leetcode 0082. Remove Duplicates from Sorted List II
tags:
  - leetcode
categories:
  - Leetcode
  - 双指针
series: Leetcode-Cpp
abbrlink: 277ebfd
date: 2023-06-24 21:33:00
---

## [82. Remove Duplicates from Sorted List II](https://leetcode.cn/problems/remove-duplicates-from-sorted-list-ii/)

Given the `head` of a sorted linked list, *delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list*. Return *the linked list **sorted** as well*.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/01/04/linkedlist1.jpg)

```
Input: head = [1,2,3,3,4,4,5]
Output: [1,2,5]
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2021/01/04/linkedlist2.jpg)

```
Input: head = [1,1,1,2,3]
Output: [2,3]
```

## 题目大意

给定一个**已排序**的链表，要求删除所有存在重复的节点（即重复的节点一个都不保留），仅保留原链表中只出现过一次的节点，最终返回排序后的新链表头节点。

## 核心解题思路

由于链表已排序，重复节点必然**相邻**，因此可通过「遍历链表 + 跳过重复节点」的思路解决，关键是：

1. **虚拟头节点**：避免删除头节点时的特殊处理（如示例 2 中头节点 1 是重复节点，需删除）。
2. **前驱指针**：用 `prev` 指向「当前无重复的最后一个节点」，便于跳过重复节点后重新连接链表。
3. **重复检测**：遍历链表时，若发现当前节点与下一个节点值相同，标记为重复并跳过所有相同节点，最后让 `prev` 的 `next` 指向跳过重复节点后的第一个节点。

```
// 链表节点结构（系统已提供，无需重复定义）
// struct ListNode {
//     int val;
//     ListNode *next;
//     ListNode() : val(0), next(nullptr) {}
//     ListNode(int x) : val(x), next(nullptr) {}
//     ListNode(int x, ListNode *next) : val(x), next(next) {}
// };

class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        // 1. 创建虚拟头节点，简化头节点删除逻辑
        ListNode* dummyHead = new ListNode(0);
        dummyHead->next = head;
        
        // 2. 前驱指针：指向当前无重复的最后一个节点（初始为虚拟头）
        ListNode* prev = dummyHead;
        
        // 3. 遍历链表（curr 为当前检测节点）
        while (prev->next != nullptr && prev->next->next != nullptr) {
            ListNode* curr = prev->next; // 当前节点（从无重复的下一个节点开始）
            
            // 检测当前节点是否与下一个节点重复
            if (curr->val == curr->next->val) {
                // 记录重复值，跳过所有相同节点
                int duplicateVal = curr->val;
                while (curr != nullptr && curr->val == duplicateVal) {
                    ListNode* temp = curr; // 保存待删除节点，便于释放内存
                    curr = curr->next;
                    delete temp; // 释放重复节点内存
                }
                // 跳过所有重复节点后，prev 连接到 curr（下一个可能无重复的节点）
                prev->next = curr;
            } else {
                // 无重复，prev 向后移动一步
                prev = prev->next;
            }
        }
        
        // 4. 保存新头节点，释放虚拟头节点，返回结果
        ListNode* newHead = dummyHead->next;
        delete dummyHead;
        return newHead;
    }
};
```