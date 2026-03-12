---
title: Leetcode 0102. Binary Tree Level Order Traversal
tags:
  - leetcode
categories:
  - Leetcode
  - Tree
series: Leetcode
abbrlink: 95c1faaa
date: 2024-03-13 19:20:17
---

## [102. Binary Tree Level Order Traversal](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

Given the `root` of a binary tree, return *the level order traversal of its nodes' values*. (i.e., from left to right, level by level).

  **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[9,20],[15,7]]
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

给定一棵二叉树的根节点 `root`，返回其节点值的**层序遍历**结果（即从左到右、逐层遍历）。结果需以二维数组形式呈现，每一层的节点值构成一个子数组（例如，第一层 `[根节点]`，第二层 `[左子节点, 右子节点]`，以此类推）。

## 解题思路

层序遍历的核心是**按照树的层次依次访问节点**，从根节点开始，先访问第一层（根节点），再访问第二层（根节点的左右子节点），以此类推，直到所有节点都被访问。

实现这一目标的关键是使用**队列**这种数据结构，它的 "先进先出" 特性非常适合按顺序处理每一层的节点：

1. 首先将根节点加入队列
2. 循环处理队列中的节点，每次处理当前层的所有节点：
   - 记录当前队列的大小（即当前层的节点数量）
   - 依次取出这些节点，将它们的值加入当前层的结果集
   - 同时将这些节点的左右子节点加入队列（作为下一层的节点）
3. 重复上述过程，直到队列为空

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
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;  // 存储最终层序遍历结果
        if (root == nullptr) {       // 边界条件：空树直接返回空数组
            return result;
        }

        queue<TreeNode*> q;  // 队列存储待处理的节点
        q.push(root);        // 根节点入队，启动遍历

        while (!q.empty()) {
            int levelSize = q.size();  // 当前层的节点总数（关键：确保只处理当前层）
            vector<int> currentLevel;  // 存储当前层的节点值

            // 遍历当前层的所有节点
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* curr = q.front();  // 取出队首节点
                q.pop();                     // 弹出队首节点（已处理）

                currentLevel.push_back(curr->val);  // 将当前节点值加入当前层

                // 左子节点入队（下一层）
                if (curr->left != nullptr) {
                    q.push(curr->left);
                }
                // 右子节点入队（下一层）
                if (curr->right != nullptr) {
                    q.push(curr->right);
                }
            }

            result.push_back(currentLevel);  // 当前层处理完毕，加入结果集
        }

        return result;
    }
};
```