---
title: Leetcode 0206. Reverse Linked List
tags:
  - leetcode
  - 递归
categories: [Leetcode, C++]
  - 递归
series: Leetcode-Cpp
abbrlink: eed004f4
date: 2023-10-22
---

# [206. Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/description/)

Given the `head` of a singly linked list, reverse the list, and return *the reversed list*.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/rev1ex1.jpg)

```
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2021/02/19/rev1ex2.jpg)

```
Input: head = [1,2]
Output: [2,1]
```

**Example 3:**

```
Input: head = []
Output: []
```

 **Constraints:**

- The number of nodes in the list is the range `[0, 5000]`.
- `-5000 <= Node.val <= 5000`

## 解法 1：迭代解法

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
    ListNode* reverseList(ListNode* head) {
    struct ListNode *prev = NULL;  // 前驱节点
    struct ListNode *curr = head;  // 当前节点
    struct ListNode *next = NULL;  // 后继节点
    
    while (curr != NULL) {
        next = curr->next;  // 保存下一个节点
        curr->next = prev;  // 反转当前节点的指针
        prev = curr;        // 移动前驱节点到当前位置
        curr = next;        // 移动当前节点到下一个位置
    }
    
    return prev;  // 反转后prev成为新的头节点   
    }
};
```

## 解法 1 解析

迭代解法的核心思想是通过三个指针 (prev、curr、next) 逐步遍历链表并反转指针方向：

初始化prev为NULL，curr为头节点

遍历链表，在每一步：

- - 保存当前节点的下一个节点到next

- - 将当前节点的next指针指向prev（完成反转）

- - 将prev和curr指针向后移动一位

当curr变为NULL时，prev就是新的头节点

这种方法只需一次遍历链表，过程中没有使用额外的数据结构存储节点值，而是直接修改指针方向。

## 解法 2：递归解法

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
    ListNode* reverseList(ListNode* head) {
// 基线条件：空链表或只有一个节点，直接返回
    if (head == NULL || head->next == NULL) {
        return head;
    }
    
    // 递归反转剩余节点
    struct ListNode* newHead = reverseList(head->next);
    
    // 反转当前节点与下一个节点的指向
    head->next->next = head;
    head->next = NULL;
    
    return newHead;  // 返回新的头节点
    }
};
```

## 解法 2 解析

递归解法的核心思想是将问题分解为更小的子问题：

基线条件：如果链表为空或只有一个节点，直接返回该节点

递归步骤：

- - 递归反转当前节点之后的所有节点

- - 得到反转后的子链表的头节点newHead

- - 将当前节点的下一个节点的next指针指向当前节点

- - 将当前节点的next指针设为NULL

返回newHead作为反转后链表的头节点

递归解法利用函数调用栈来 "记住" 每个节点的位置，当递归回溯时完成指针反转操作。

## 性能对比

| 解法类型 | 时间复杂度 | 空间复杂度 | 优点                     | 缺点                                 |
| -------- | ---------- | ---------- | ------------------------ | ------------------------------------ |
| 迭代解法 | O(n)       | O(1)       | 空间效率高，无栈溢出风险 | 相对抽象，需要维护多个指针           |
| 递归解法 | O(n)       | O(n)       | 代码简洁，逻辑清晰       | 空间复杂度高，链表过长可能导致栈溢出 |

两种解法的时间复杂度相同，都需要遍历整个链表一次。主要区别在于空间复杂度：

- 迭代解法只使用常数级别的额外空间

- 递归解法的空间复杂度由递归调用栈决定，等于链表长度

