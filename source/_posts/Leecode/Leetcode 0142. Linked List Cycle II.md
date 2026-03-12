---
title: Leetcode 0142. Linked List Cycle II
tags:
  - leetcode
categories:
  - Leetcode
  - List
series: Leetcode
abbrlink: 501d35ad
date: 2023-06-09 21:57:01
---

## [142. Linked List Cycle II](https://leetcode.cn/problems/linked-list-cycle-ii/)

Given the `head` of a linked list, return *the node where the cycle begins. If there is no cycle, return* `null`.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer. Internally, `pos` is used to denote the index of the node that tail's `next` pointer is connected to (**0-indexed**). It is `-1` if there is no cycle. **Note that** `pos` **is not passed as a parameter**.

**Do not modify** the linked list.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist.png)

```
Input: head = [3,2,0,-4], pos = 1
Output: tail connects to node index 1
Explanation: There is a cycle in the linked list, where tail connects to the second node.
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist_test2.png)

```
Input: head = [1,2], pos = 0
Output: tail connects to node index 0
Explanation: There is a cycle in the linked list, where tail connects to the first node.
```

**Example 3:**

![img](https://assets.leetcode.com/uploads/2018/12/07/circularlinkedlist_test3.png)

```
Input: head = [1], pos = -1
Output: no cycle
Explanation: There is no cycle in the linked list.
```

## 题目大意

给定一个链表的头节点，判断链表中是否存在环。如果存在环，返回环的起始节点；如果不存在环，返回 null。

## 解题思路

采用**快慢指针法（Floyd 算法）** 来解决这个问题，该方法可以在 O (1) 的额外空间和 O (n) 的时间内找到环的起始节点：

1. **检测环的存在**：
   - 使用两个指针，快指针（fast）每次移动两步，慢指针（slow）每次移动一步
   - 如果链表中存在环，两个指针最终会在环中相遇
   - 如果快指针到达 null，则链表中不存在环
2. **找到环的起始节点**：
   - 当两个指针相遇时，将慢指针（或快指针）重置到链表头部
   - 然后让两个指针以相同的速度（每次一步）移动
   - 它们再次相遇的节点就是环的起始节点

```
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        if (head == nullptr || head->next == nullptr)
            return nullptr;
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast != nullptr && fast->next != nullptr) {
            if (fast->next->next != nullptr) {
                slow = slow->next;
                fast = fast->next->next;
                if (fast == slow) {
                    slow = head;
                    while (slow != fast) {
                        slow = slow->next;
                        fast = fast->next;
                    }
                    return slow;
                }
            } else break;;
        }

        return nullptr;
    }
};
```