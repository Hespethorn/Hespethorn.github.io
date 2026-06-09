---
title: Leetcode 0116. Populating Next Right Pointers in Each Node
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: 42c77b0c
date: 2023-09-07
---

## [116. Populating Next Right Pointers in Each Node](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node/)

You are given a **perfect binary tree** where all leaves are on the same level, and every parent has two children. The binary tree has the following definition:

```
struct Node {
  int val;
  Node *left;
  Node *right;
  Node *next;
}
```

Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to `NULL`.

Initially, all next pointers are set to `NULL`.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2019/02/14/116_sample.png)

```
Input: root = [1,2,3,4,5,6,7]
Output: [1,#,2,3,#,4,5,6,7,#]
Explanation: Given the above perfect binary tree (Figure A), your function should populate each next pointer to point to its next right node, just like in Figure B. The serialized output is in level order as connected by the next pointers, with '#' signifying the end of each level.
```

**Example 2:**

```
Input: root = []
Output: []
```

## 题目大意

给定一棵**完美二叉树**（所有叶子节点在同一层，且每个父节点都有两个子节点），要求为每个节点的 `next` 指针赋值，使其指向**同一层的右侧相邻节点**。如果没有右侧相邻节点，则 `next` 指针设为 `NULL`。初始时，所有 `next` 指针均为 `NULL`。

例如：

- 输入完美二叉树 `[1,2,3,4,5,6,7]`，处理后每个节点的 `next` 指针指向右侧节点，序列化输出为 `[1,#,2,3,#,4,5,6,7,#]`（`#` 表示每层结束）。

## 解题思路

1. 使用 DFS 遍历二叉树，同时记录每个节点的深度
2. 用一个数组`pre`记录每一层中 "上一个访问的节点"
3. 当访问到一个节点时，如果它是当前层第一个被访问的节点，就将其存入`pre`数组
4. 如果它不是当前层第一个节点，就将当前层上一个节点的`next`指针指向它，并更新`pre`数组中当前层的记录

```
#include <iostream>
#include <queue>
using namespace std;

// 节点定义（题目已提供）
struct Node {
    int val;
    Node *left;
    Node *right;
    Node *next;
    Node() : val(0), left(nullptr), right(nullptr), next(nullptr) {}
    Node(int x) : val(x), left(nullptr), right(nullptr), next(nullptr) {}
    Node(int x, Node *left, Node *right, Node *next) : val(x), left(left), right(right), next(next) {}
};

class Solution {
public:
    Node* connect(Node* root) {
        if (root == nullptr) { // 边界条件：空树直接返回
            return root;
        }

        queue<Node*> q;
        q.push(root); // 根节点入队

        while (!q.empty()) {
            int levelSize = q.size(); // 当前层的节点总数

            // 遍历当前层的所有节点
            for (int i = 0; i < levelSize; ++i) {
                Node* curr = q.front();
                q.pop();

                // 关键：若不是当前层最后一个节点，next指向队列中的下一个节点
                if (i != levelSize - 1) {
                    curr->next = q.front();
                } else {
                    curr->next = nullptr; // 层内最后一个节点，next为NULL
                }

                // 完美二叉树的左右子节点一定存在，直接入队
                if (curr->left != nullptr) {
                    q.push(curr->left);
                }
                if (curr->right != nullptr) {
                    q.push(curr->right);
                }
            }
        }

        return root;
    }
};

```