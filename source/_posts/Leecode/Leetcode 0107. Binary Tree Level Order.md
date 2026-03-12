---
title: Leetcode 0107. Binary Tree Level Order Traversal II
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: b92a5eaf
date: 2024-04-14 23:16:04
---

## [107. Binary Tree Level Order Traversal II](https://leetcode.cn/problems/binary-tree-level-order-traversal-ii/)

Given the `root` of a binary tree, return *the bottom-up level order traversal of its nodes' values*. (i.e., from left to right, level by level from leaf to root).

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: [[15,7],[9,20],[3]]
```

**Example 2:**

```
Input: root = [1]
Output: [[1]]
```

**Example 3:**

```
Input: root = []
Output: []
```

## 题目大意

给定一棵二叉树的根节点 `root`，返回其节点值的**自底向上的层序遍历**结果。即按「从叶子节点所在层到根节点所在层」的顺序逐层返回，每层内部仍保持「从左到右」的顺序。

例如：

- 输入二叉树 `[3,9,20,null,null,15,7]`，其自底向上的层序遍历结果为 `[[15,7],[9,20],[3]]`。

## 解题思路

自底向上的层序遍历可基于「常规层序遍历（自顶向下）」实现，核心思路是：

1. 先按常规层序遍历（从根到叶子）收集每一层的节点值，得到 `[[3],[9,20],[15,7]]`；
2. 将收集到的结果**反转**，即可得到自底向上的层序遍历 `[[15,7],[9,20],[3]]`。

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
    vector<vector<int>> levelOrderBottom(TreeNode* root) {
        vector<vector<int>> result;
        if (root == nullptr) {
            return result;
        }
        
        queue<TreeNode*> q;
        q.push(root);
        
        // 常规层序遍历，从上到下收集节点值
        while (!q.empty()) {
            int levelSize = q.size();
            vector<int> currentLevel;
            
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* node = q.front();
                q.pop();
                
                currentLevel.push_back(node->val);
                
                if (node->left != nullptr) {
                    q.push(node->left);
                }
                if (node->right != nullptr) {
                    q.push(node->right);
                }
            }
            
            result.push_back(currentLevel);
        }
        
        // 反转结果，得到从下到上的层序遍历
        reverse(result.begin(), result.end());
        
        return result;
    }
};
```