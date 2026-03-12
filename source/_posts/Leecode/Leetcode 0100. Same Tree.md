---
title: Leetcode 0100. Same Tree
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: 24a20f1c
date: 2024-08-05 23:25:33
---

## [100. Same Tree](https://leetcode.cn/problems/same-tree/)

Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/12/20/ex1.jpg)

```
Input: p = [1,2,3], q = [1,2,3]
Output: true
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2020/12/20/ex2.jpg)

```
Input: p = [1,2], q = [1,null,2]
Output: false
```

**Example 3:**

![img](https://assets.leetcode.com/uploads/2020/12/20/ex3.jpg)

```
Input: p = [1,2,1], q = [1,1,2]
Output: false
```

## 题目大意

给定两棵二叉树的根节点 `p` 和 `q`，判断这两棵树是否相同。两棵树相同的定义是：结构完全相同，且对应节点的值也相同。

例如：

- 输入两棵结构和节点值均相同的树 `[1,2,3]` 和 `[1,2,3]`，返回 `true`；
- 输入结构不同的树 `[1,2]` 和 `[1,null,2]`，返回 `false`。

## 解题思路

判断两棵树是否相同可通过**同步递归遍历**实现，核心思路是：

1. 若两棵树的当前节点都为空，说明结构相同，返回 `true`；
2. 若其中一棵树的当前节点为空，另一棵不为空，结构不同，返回 `false`；
3. 若两棵树的当前节点值不同，返回 `false`；
4. 递归判断两棵树的左子树和右子树是否分别相同，只有两者都相同时，才返回 `true`。

## 代码实现

```
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        // 1. 两节点都为空：结构相同
        if (p == nullptr && q == nullptr) {
            return true;
        }
        // 2. 一个为空一个非空：结构不同
        if (p == nullptr || q == nullptr) {
            return false;
        }
        // 3. 节点值不同：不相同
        if (p->val != q->val) {
            return false;
        }
        // 4. 递归判断左子树和右子树是否都相同
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
```