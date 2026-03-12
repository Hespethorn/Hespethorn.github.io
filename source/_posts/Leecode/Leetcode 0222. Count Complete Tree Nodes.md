---
title: Leetcode 0222. Count Complete Tree Nodes
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: 8b563592
date: 2024-07-07 21:15:51
---

## [222. Count Complete Tree Nodes](https://leetcode.cn/problems/count-complete-tree-nodes/)

Given the `root` of a **complete** binary tree, return the number of the nodes in the tree.

According to **[Wikipedia](http://en.wikipedia.org/wiki/Binary_tree#Types_of_binary_trees)**, every level, except possibly the last, is completely filled in a complete binary tree, and all nodes in the last level are as far left as possible. It can have between `1` and `2h` nodes inclusive at the last level `h`.

Design an algorithm that runs in less than `O(n)` time complexity.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/01/14/complete.jpg)

```
Input: root = [1,2,3,4,5,6]
Output: 6
```

**Example 2:**

```
Input: root = []
Output: 0
```

**Example 3:**

```
Input: root = [1]
Output: 1
```

## 题目大意

给定一棵完全二叉树的根节点 `root`，返回该树的节点总数。完全二叉树的定义是：除最后一层外，每一层都被完全填满，且最后一层的节点都靠左排列。要求设计一个时间复杂度**小于 O (n)** 的算法。

例如：

- 输入完全二叉树 `[1,2,3,4,5,6]`，节点总数为 6，返回 `6`。

## 解题思路

完全二叉树的特性为优化算法提供了可能：

1. 若一棵完全二叉树同时是满二叉树（最后一层也被填满），则节点总数为 `2^h - 1`（`h` 为树的高度）。
2. 对任意完全二叉树，左子树或右子树中至少有一个是满二叉树，可利用此特性减少遍历次数。

核心思路：

- 计算当前节点的**左深度**（沿左子树一直向下的深度）和**右深度**（沿右子树一直向下的深度）；
- 若左深度 == 右深度，说明是满二叉树，直接返回 `2^h - 1`；
- 否则，递归计算左子树和右子树的节点数，总和加 1（当前节点）。

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
    int countNodes(TreeNode* root) {
        if (root == nullptr) { // 空树节点数为0
            return 0;
        }

        // 计算左深度（沿左子树向下）
        int leftDepth = 0;
        TreeNode* left = root;
        while (left != nullptr) {
            leftDepth++;
            left = left->left;
        }

        // 计算右深度（沿右子树向下）
        int rightDepth = 0;
        TreeNode* right = root;
        while (right != nullptr) {
            rightDepth++;
            right = right->right;
        }

        // 若左右深度相等，是满二叉树，节点数为 2^h - 1
        if (leftDepth == rightDepth) {
            return (1 << leftDepth) - 1; // 等价于 2^leftDepth - 1
        }

        // 否则递归计算左右子树节点数之和 + 1（当前节点）
        return countNodes(root->left) + countNodes(root->right) + 1;
    }
};
```