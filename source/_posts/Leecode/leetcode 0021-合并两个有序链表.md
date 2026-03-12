---
title: Leetcode 0021.合并两个有序链表
tags:
  - 链表
categories:
  - 链表
series: Leetcode
abbrlink: '42568568'
date: 2025-11-18 18:23:24
---

## [21. 合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/)

将两个升序链表合并为一个新的 **升序** 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 

 **示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg)

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

**示例 2：**

```
输入：l1 = [], l2 = []
输出：[]
```

**示例 3：**

```
输入：l1 = [], l2 = [0]
输出：[0]
```

##  题目大意

需要将两个升序排列的链表合并成一个新的升序链表，新链表由原两个链表的所有节点组成，且保持升序排列。

## 解题思路

1. 使用虚拟头节点（dummy node）简化边界情况处理
2. 双指针遍历两个链表，比较当前节点值，将较小的节点接入结果链表
3. 当一个链表遍历完毕后，将另一个链表的剩余部分直接接入结果链表

这种方法的时间复杂度为 O (n + m)，其中 n 和 m 分别是两个链表的长度，空间复杂度为 O (1)，仅使用了常数个额外节点。

```
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // 虚拟头节点，简化链表头部的处理
        ListNode* dummy = new ListNode();
        ListNode* current = dummy;
        
        // 双指针遍历两个链表，选择较小的节点接入结果
        while (list1 != nullptr && list2 != nullptr) {
            if (list1->val <= list2->val) {
                current->next = list1;
                list1 = list1->next;
            } else {
                current->next = list2;
                list2 = list2->next;
            }
            current = current->next;
        }
        
        // 处理剩余节点（其中一个链表已遍历完毕）
        current->next = (list1 != nullptr) ? list1 : list2;
        
        // 保存结果并释放虚拟头节点（避免内存泄漏）
        ListNode* result = dummy->next;
        delete dummy;
        return result;
    }
};
```

