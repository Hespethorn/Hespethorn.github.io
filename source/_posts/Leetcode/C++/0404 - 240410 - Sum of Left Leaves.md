---
title: Leetcode 0404. Sum of Left Leaves
tags:
  - leetcode
categories: [Leetcode, C++]
  - tree
series: Leetcode-Cpp
abbrlink: 93483f08
date: 2023-12-15
---

## [404. Sum of Left Leaves](https://leetcode.cn/problems/sum-of-left-leaves/)

Given the `root` of a binary tree, return *the sum of all left leaves.*

A **leaf** is a node with no children. A **left leaf** is a leaf that is the left child of another node.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/04/08/leftsum-tree.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: 24
Explanation: There are two left leaves in the binary tree, with values 9 and 15 respectively.
```

**Example 2:**

```
Input: root = [1]
Output: 0
```

## 题目大意

给定一棵二叉树的根节点 `root`，返回所有**左叶子**的节点值之和。左叶子的定义是：既是叶子节点（没有子节点），又是其父节点的左子节点。

例如：

- 输入二叉树 `[3,9,20,null,null,15,7]`，左叶子为 9（3 的左子节点）和 15（20 的左子节点），和为 `24`；
- 输入二叉树 `[1]`，没有左叶子，返回 `0`。

## 解题思路

计算左叶子之和的核心是**识别左叶子节点**并累加其值，可通过深度优先搜索（DFS）实现：

1. **递归参数**：当前节点、是否为左子节点的标记（用于判断是否是左叶子）。
2. **递归终止条件**：若当前节点为空，返回 0。
3. **左叶子判断**：若当前节点是叶子节点（左右子节点均为空）且是左子节点，返回其值。
4. **递归逻辑**：递归计算左子树和右子树的左叶子之和，累加后返回。

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
    int sumOfLeftLeaves(TreeNode* root) {
        // 从根节点开始DFS，根节点不是左子节点（标记为false）
        return dfs(root, false);
    }

private:
    // 辅助函数：DFS遍历，计算左叶子之和
    // 参数：node-当前节点，isLeft-当前节点是否是其父节点的左子节点
    int dfs(TreeNode* node, bool isLeft) {
        if (node == nullptr) { // 空节点，贡献0
            return 0;
        }
        
        // 判断是否是左叶子：是叶子节点且是左子节点
        if (node->left == nullptr && node->right == nullptr) {
            return isLeft ? node->val : 0;
        }
        
        // 递归计算左子树（标记为左子节点）和右子树（标记为右子节点）的左叶子之和
        return dfs(node->left, true) + dfs(node->right, false);
    }
};
```