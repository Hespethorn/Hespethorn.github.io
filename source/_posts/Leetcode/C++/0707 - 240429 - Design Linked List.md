---
title: Leetcode 0707. Design Linked List
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: fb67fadc
date: 2024-02-20
---

## [707. Design Linked List](https://leetcode.cn/problems/design-linked-list/)

Design your implementation of the linked list. You can choose to use a singly or doubly linked list.
A node in a singly linked list should have two attributes: `val` and `next`. `val` is the value of the current node, and `next` is a pointer/reference to the next node.
If you want to use the doubly linked list, you will need one more attribute `prev` to indicate the previous node in the linked list. Assume all nodes in the linked list are **0-indexed**.

Implement the `MyLinkedList` class:

- `MyLinkedList()` Initializes the `MyLinkedList` object.
- `int get(int index)` Get the value of the `indexth` node in the linked list. If the index is invalid, return `-1`.
- `void addAtHead(int val)` Add a node of value `val` before the first element of the linked list. After the insertion, the new node will be the first node of the linked list.
- `void addAtTail(int val)` Append a node of value `val` as the last element of the linked list.
- `void addAtIndex(int index, int val)` Add a node of value `val` before the `indexth` node in the linked list. If `index` equals the length of the linked list, the node will be appended to the end of the linked list. If `index` is greater than the length, the node **will not be inserted**.
- `void deleteAtIndex(int index)` Delete the `indexth` node in the linked list, if the index is valid.

**Example 1:**

```
Input
["MyLinkedList", "addAtHead", "addAtTail", "addAtIndex", "get", "deleteAtIndex", "get"]
[[], [1], [3], [1, 2], [1], [1], [1]]
Output
[null, null, null, null, 2, null, 3]

Explanation
MyLinkedList myLinkedList = new MyLinkedList();
myLinkedList.addAtHead(1);
myLinkedList.addAtTail(3);
myLinkedList.addAtIndex(1, 2);    // linked list becomes 1->2->3
myLinkedList.get(1);              // return 2
myLinkedList.deleteAtIndex(1);    // now the linked list is 1->3
myLinkedList.get(1);              // return 3
```

## 题目大意

设计一个单链表或双链表的实现，支持以下操作：

- 初始化链表
- 获取指定索引节点的值
- 在链表头部添加节点
- 在链表尾部添加节点
- 在指定索引前插入节点
- 删除指定索引的节点

## 解题思路

我们可以使用单链表来实现，通过定义节点结构和一个头指针，以及一个记录链表长度的变量来简化操作：

1. 定义节点结构，包含值和指向下一个节点的指针
2. 使用虚拟头节点（dummy head）简化边界条件处理
3. 维护一个长度变量，方便快速判断索引是否有效

```
class MyLinkedList {
private:
    // 定义节点结构
    struct ListNode {
        int val;
        ListNode* next;
        ListNode(int x) : val(x), next(nullptr) {}
    };
    
    ListNode* dummyHead;  // 虚拟头节点
    int length;           // 链表长度
    
public:
    // 初始化链表
    MyLinkedList() {
        dummyHead = new ListNode(0);
        length = 0;
    }
    
    // 获取索引为index的节点值
    int get(int index) {
        // 索引无效的情况
        if (index < 0 || index >= length) {
            return -1;
        }
        
        ListNode* curr = dummyHead->next;
        for (int i = 0; i < index; ++i) {
            curr = curr->next;
        }
        return curr->val;
    }
    
    // 在头部添加节点
    void addAtHead(int val) {
        ListNode* newNode = new ListNode(val);
        newNode->next = dummyHead->next;
        dummyHead->next = newNode;
        length++;
    }
    
    // 在尾部添加节点
    void addAtTail(int val) {
        ListNode* newNode = new ListNode(val);
        ListNode* curr = dummyHead;
        
        // 找到最后一个节点
        while (curr->next != nullptr) {
            curr = curr->next;
        }
        
        curr->next = newNode;
        length++;
    }
    
    // 在索引为index的节点前插入新节点
    void addAtIndex(int index, int val) {
        // 索引大于长度，不插入
        if (index > length) {
            return;
        }
        // 索引小于0，插入到头部
        if (index < 0) {
            index = 0;
        }
        
        ListNode* newNode = new ListNode(val);
        ListNode* curr = dummyHead;
        
        // 找到要插入位置的前一个节点
        for (int i = 0; i < index; ++i) {
            curr = curr->next;
        }
        
        newNode->next = curr->next;
        curr->next = newNode;
        length++;
    }
    
    // 删除索引为index的节点
    void deleteAtIndex(int index) {
        // 索引无效，不删除
        if (index < 0 || index >= length) {
            return;
        }
        
        ListNode* curr = dummyHead;
        
        // 找到要删除节点的前一个节点
        for (int i = 0; i < index; ++i) {
            curr = curr->next;
        }
        
        ListNode* temp = curr->next;
        curr->next = curr->next->next;
        delete temp;  // 释放内存，避免泄漏
        length--;
    }
};

/**
 * Your MyLinkedList object will be instantiated and called as such:
 * MyLinkedList* obj = new MyLinkedList();
 * int param_1 = obj->get(index);
 * obj->addAtHead(val);
 * obj->addAtTail(val);
 * obj->addAtIndex(index,val);
 * obj->deleteAtIndex(index);
 */
```