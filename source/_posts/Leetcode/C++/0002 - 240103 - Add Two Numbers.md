---
title: Leetcode 0002. Add Two Numbers
tags:
  - leetcode
  - 递归
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: 92a3ae0a
date: 2023-01-04
---

# [2. Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)

## 题目

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zeros, except the number 0 itself.

**Example 1:**

```plaintext
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.
```

**Example 2:**

```plaintext
Input: l1 = [0], l2 = [0]
Output: [0]
```

**Example 3:**

```plaintext
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]
```

## 题目大意

给定两个逆序存储数字各位的非空链表（如 `2->4->3` 表示 342），将这两个数相加并以链表形式返回结果。假设两数除 0 外无前导零，需处理进位情况。



## 解题思路

### 方法一：**递归实现**

#### 思路

1. 通过递归逐位相加并传递进位，可以避免显式的循环和虚拟头节点。

#### 缺陷

- **栈溢出**：递归深度受栈空间限制，可能导致栈溢出（但链表长度通常不会达到该限制）。

### 方法二：逐位相加（基础版）

#### 思路

1. 同时遍历两个链表，逐位相加并处理进位。
2. 用 `carry` 变量记录进位（如 9+9=18，`carry=1`，当前位存 8，18+1=19；所以只需要一个变量）。
3. 当任一链表遍历完后，继续处理剩余链表和进位。

#### 复杂度分析

- **时间复杂度**：O (max (m,n))，其中 m 和 n 是两链表长度，最多遍历较长链表一次。
- **空间复杂度**：O (max (m,n)+1)，最坏情况下需创建与较长链表等长的结果链表，加最后一个进位节点。

### 方法三：优化逐位相加（使用哑节点）

#### 思路

1. 使用哑节点（dummy node）作为结果链表头部，避免处理头节点的特殊情况。
2. 合并循环条件为 `l1 || l2 || carry`，确保处理完所有节点和最后进位。
3. 动态分配节点时直接连接到当前节点后，简化指针操作。

#### 优化点

- **代码简洁性**：减少空指针检查和边界条件处理。
- **内存管理**：使用 `calloc` 自动初始化节点值为 0，避免手动设置。
- **鲁棒性**：明确处理内存分配失败的情况（返回 NULL）。



## 代码实现

{% tabs addTwoNumbers %}

<!-- tab **递归实现** -->

```c
struct ListNode* addTwoNumbersRecursive(struct ListNode* l1, struct ListNode* l2, int carry) {
    if (l1 == NULL && l2 == NULL && carry == 0) return NULL;
    
    int sum = carry;
    if (l1) sum += l1->val;
    if (l2) sum += l2->val;
    
    struct ListNode* node = (struct ListNode*)malloc(sizeof(struct ListNode));
    if (!node) return NULL;
    node->val = sum % 10;
    
    node->next = addTwoNumbersRecursive(
        l1 ? l1->next : NULL,
        l2 ? l2->next : NULL,
        sum / 10
    );
    
    return node;
}

struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    return addTwoNumbersRecursive(l1, l2, 0);
}
```

<!-- endtab -->

<!-- tab 逐位相加，无头结点 -->

```c
/**
 * @brief 释放链表内存（统一实现）
 * @param head 链表头节点
 */
void freeList(struct ListNode* head) {
    struct ListNode* current = head;
    while (current != NULL) {
        struct ListNode* temp = current;
        current = current->next;
        free(temp);
    }
}
/**
 * @brief 两逆序链表数字逐位相加（基础版）
 * @param l1 第一个数字链表
 * @param l2 第二个数字链表
 * @return 结果链表头节点，失败返回NULL
 * @note 处理进位但未使用哑节点，代码稍冗余
 */
struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    // 分配头节点
    struct ListNode* resultHead = (struct ListNode*)calloc(1, sizeof(struct ListNode));
    if (resultHead == NULL) {
        return NULL;
    }
    
    struct ListNode* current = resultHead;
    struct ListNode* node1 = l1;
    struct ListNode* node2 = l2;
    int carry = 0;  // 进位标志，初始为0
    
    // 逐位相加主循环
    while (node1 != NULL || node2 != NULL || carry != 0) {
        int sum = carry;
        
        // 累加第一个链表当前位
        if (node1 != NULL) {
            sum += node1->val;
            node1 = node1->next;
        }
        
        // 累加第二个链表当前位
        if (node2 != NULL) {
            sum += node2->val;
            node2 = node2->next;
        }
        
        // 计算新进位和当前位值
        carry = sum / 10;
        current->val = sum % 10;
        
        // 若需要后续节点，分配新节点
        if (node1 != NULL || node2 != NULL || carry != 0) {
            struct ListNode* newNode = (struct ListNode*)calloc(1, sizeof(struct ListNode));
            if (newNode == NULL) {
                freeList(resultHead);
                return NULL;
            }
            current->next = newNode;
            current = newNode;
        }
    }
    
    return resultHead;
}
```

<!-- endtab -->

<!-- tab 带头结点逐位相加 -->

```c
/**
 * @brief 释放链表内存（统一实现）
 * @param head 链表头节点
 */
void freeList(struct ListNode* head) {
    struct ListNode* current = head;
    while (current != NULL) {
        struct ListNode* temp = current;
        current = current->next;
        free(temp);
    }
}

/**
 * @brief 两逆序链表数字相加（优化版，使用哑节点）
 * @param l1 第一个数字链表（如2->4->3表示342）
 * @param l2 第二个数字链表
 * @return 结果链表头节点，失败返回NULL
 * @note 时间复杂度O(max(m,n))，空间复杂度O(max(m,n))
 */
struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    // 哑节点作为头节点，避免头节点特殊处理
    struct ListNode dummy = {0, NULL};
    struct ListNode* current = &dummy;
    int carry = 0;  // 进位标志
    
    // 循环条件：任一链表未结束或仍有进位
    while (l1 != NULL || l2 != NULL || carry != 0) {
        int sum = carry;  // 初始为进位值
        
        // 累加第一个链表当前位（若存在）
        if (l1 != NULL) {
            sum += l1->val;
            l1 = l1->next;
        }
        
        // 累加第二个链表当前位（若存在）
        if (l2 != NULL) {
            sum += l2->val;
            l2 = l2->next;
        }
        
        // 计算新的进位和当前位值
        carry = sum / 10;
        current->next = (struct ListNode*)calloc(1, sizeof(struct ListNode));
        
        // 内存分配失败处理
        if (current->next == NULL) {
            freeList(dummy.next);
            return NULL;
        }
        
        current->next->val = sum % 10;
        current = current->next;
    }
    
    return dummy.next;  // 返回实际头节点
}


```

<!-- endtab -->

<!-- tab 官方答案 -->

```
struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2) {
    struct ListNode *head = NULL, *tail = NULL;
    int carry = 0;
    while (l1 || l2) {
        int n1 = l1 ? l1->val : 0;
        int n2 = l2 ? l2->val : 0;
        int sum = n1 + n2 + carry;
        if (!head) {
            head = tail = malloc(sizeof(struct ListNode));
            tail->val = sum % 10;
            tail->next = NULL;
        } else {
            tail->next = malloc(sizeof(struct ListNode));
            tail->next->val = sum % 10;
            tail = tail->next;
            tail->next = NULL;
        }
        carry = sum / 10;
        if (l1) {
            l1 = l1->next;
        }
        if (l2) {
            l2 = l2->next;
        }
    }
    if (carry > 0) {
        tail->next = malloc(sizeof(struct ListNode));
        tail->next->val = carry;
        tail->next->next = NULL;
    }
    return head;
}
```

<!-- endtab -->

{% endtabs %}

