---
title: Leetcode 0025.reverse-nodes-in-k-group
tags:
  - C++
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: '769e4480'
date: 2023-03-21
---

## [25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

给你链表的头节点 `head` ，每 `k` 个节点一组进行翻转，请你返回修改后的链表。

`k` 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 `k` 的整数倍，那么请将最后剩余的节点保持原有顺序。

你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

**示例 1：**

![img](https://assets.leetcode.com/uploads/2020/10/03/reverse_ex1.jpg)

```
输入：head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
```

**示例 2：**

![img](https://assets.leetcode.com/uploads/2020/10/03/reverse_ex2.jpg)

```
输入：head = [1,2,3,4,5], k = 3
输出：[3,2,1,4,5]
```

## 解题思路：

「K 个一组翻转链表」的核心思路是：

1. **分组遍历**：每次取 K 个节点作为一组，若不足 K 个则停止。
2. **翻转每组**：对当前 K 个节点进行翻转。
3. **连接各组**：将翻转后的组与前一组连接，更新指针继续处理下一组。

具体步骤：

- 用 `dummy` 虚拟头节点简化边界处理（避免头节点特殊逻辑）。
- 用 `pre` 记录上一组的尾节点（翻转后作为连接点）。
- 用 `end` 遍历并检查当前组是否有 K 个节点。
- 翻转当前组后，重新连接 `pre` 与翻转后的组，并更新 `pre` 和 `end`。

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
    ListNode* reverseKGroup(ListNode* head, int k) {
        // 虚拟头节点，简化头节点处理
        ListNode* dummy = new ListNode(0);
        dummy->next = head;
        // pre 记录上一组的尾节点（初始为虚拟头）
        ListNode* pre = dummy;
        // end 用于寻找当前组的尾节点
        ListNode* end = dummy;

        while (end->next != nullptr) {
            // 检查当前组是否有 k 个节点
            for (int i = 0; i < k && end != nullptr; ++i) {
                end = end->next;
            }
            // 若不足 k 个，直接退出
            if (end == nullptr) break;

            // 记录当前组的头节点（翻转前）和下一组的头节点
            ListNode* start = pre->next;
            ListNode* nextGroup = end->next;

            // 断开当前组与下一组的连接（便于翻转）
            end->next = nullptr;
            // 翻转当前组，并与上一组连接
            pre->next = reverseList(start);
            // 翻转后，start 变成当前组的尾节点，连接下一组
            start->next = nextGroup;

            // 更新 pre 和 end 到下一组的起点
            pre = start;
            end = start;
        }

        ListNode* result = dummy->next;
        delete dummy; // 释放虚拟节点，避免内存泄漏
        return result;
    }

private:
    // 辅助函数：翻转单链表（返回翻转后的头节点）
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* next = curr->next; // 保存下一个节点
            curr->next = prev;           // 翻转指针
            prev = curr;                 // 移动 prev
            curr = next;                 // 移动 curr
        }
        return prev; // 翻转后的头节点
    }
};
```

