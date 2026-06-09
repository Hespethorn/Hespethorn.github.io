---
title: Leetcode 0104. Maximum Depth of Binary Tree
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: 9c415c5b
date: 2023-08-17 19:21:00
---

## [104. Maximum Depth of Binary Tree](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

Given the `root` of a binary tree, return *its maximum depth*.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/11/26/tmp-tree.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: 3
```

**Example 2:**

```
Input: root = [1,null,2]
Output: 2
```

## 题目大意

给定一棵二叉树的根节点 `root`，返回该二叉树的**最大深度**。二叉树的最大深度是指从根节点到最远叶子节点的最长路径上的节点数量。

例如：

- 输入二叉树 `[3,9,20,null,null,15,7]`，其最大深度为 3（路径：3 → 20 → 15 或 3 → 20 → 7，均包含 3 个节点）。

## 解题思路

计算二叉树的最大深度可通过**递归**或**迭代**两种方式实现：

### 1. 递归法（深度优先搜索，DFS）

二叉树的最大深度具有递归性质：

- 空树的最大深度为 0；
- 非空树的最大深度 = 1 + max (左子树的最大深度，右子树的最大深度)。

### 2. 迭代法（层序遍历，BFS）

利用层序遍历统计二叉树的层数，层数即最大深度：

- 每遍历完一层，深度加 1；
- 最终的层数即为最大深度。

## 代码实现

### 方法 1：递归法

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
    int maxDepth(TreeNode* root) {
        // 空树深度为0
        if (root == nullptr) {
            return 0;
        }
        
        // 递归计算左子树和右子树的深度
        int leftDepth = maxDepth(root->left);
        int rightDepth = maxDepth(root->right);
        
        // 当前树的最大深度 = 1（当前节点） + 左右子树深度的最大值
        return 1 + max(leftDepth, rightDepth);
    }
};
```

### 方法 2：迭代法（层序遍历）

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
    int maxDepth(TreeNode* root) {
        if (root == nullptr) { // 空树深度为0
            return 0;
        }

        int depth = 0;
        queue<TreeNode*> q;
        q.push(root);

        // 层序遍历，每遍历完一层，深度加1
        while (!q.empty()) {
            int levelSize = q.size(); // 当前层的节点数
            depth++; // 开始处理新的一层，深度加1

            // 遍历当前层的所有节点
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* curr = q.front();
                q.pop();

                // 下一层节点入队
                if (curr->left != nullptr) {
                    q.push(curr->left);
                }
                if (curr->right != nullptr) {
                    q.push(curr->right);
                }
            }
        }

        return depth;
    }
};
```