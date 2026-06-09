---
title: Leetcode 0513. Find Bottom Left Tree Value
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: 72cf0114
date: 2024-01-22 19:27:00
---

## [513. Find Bottom Left Tree Value](https://leetcode.cn/problems/find-bottom-left-tree-value/)

Given the `root` of a binary tree, return the leftmost value in the last row of the tree.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/12/14/tree1.jpg)

```
Input: root = [2,1,3]
Output: 1
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2020/12/14/tree2.jpg)

```
Input: root = [1,2,3,4,null,5,6,null,null,7]
Output: 7
```

## 题目大意

给定一棵二叉树的根节点 `root`，返回树的最后一行中最左边的节点值。即需要找到二叉树最深一层的最左侧节点的值。

例如：

- 输入二叉树 `[2,1,3]`，最深层是第 2 层，最左侧节点值为 1，返回 `1`；
- 输入二叉树 `[1,2,3,4,null,5,6,null,null,7]`，最深层是第 4 层，最左侧节点值为 7，返回 `7`。

## 解题思路

找到树左下角的值，关键是确定**最深层**和该层的**最左侧节点**。主要有两种实现方法：

### 1. 层序遍历（BFS）

- 按层遍历二叉树，记录每一层的第一个节点值；
- 最后一层的第一个节点值即为结果。

### 2. 深度优先搜索（DFS）

- 记录当前节点的深度，追踪最大深度及对应节点值；
- 优先遍历左子树，确保同深度下左节点先被访问，从而记录最左侧节点值。

## 代码实现

### 方法 1：层序遍历（BFS）

```
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
class Solution {
public:
    int findBottomLeftValue(TreeNode *root) {
        TreeNode *node;
        queue<TreeNode *> q;
        q.push(root);
        while (!q.empty()) {
            node = q.front(); q.pop();
            if (node->right) q.push(node->right);
            if (node->left)  q.push(node->left);
        }
        return node->val;
    }
};
```

### 方法 2：深度优先搜索（DFS）

```
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
public:
    int findBottomLeftValue(TreeNode* root) {
        int maxDepth = -1; // 记录最大深度
        int result = root->val; // 记录结果值
        
        // 深度优先搜索，追踪深度和结果
        dfs(root, 0, maxDepth, result);
        return result;
    }

private:
    // 辅助函数：DFS遍历
    // 参数：当前节点、当前深度、最大深度（引用）、结果值（引用）
    void dfs(TreeNode* node, int depth, int& maxDepth, int& result) {
        if (node == nullptr) {
            return;
        }
        
        // 若当前深度大于最大深度，更新最大深度和结果值
        if (depth > maxDepth) {
            maxDepth = depth;
            result = node->val;
        }
        
        // 优先遍历左子树（确保同深度下左节点先被访问）
        dfs(node->left, depth + 1, maxDepth, result);
        dfs(node->right, depth + 1, maxDepth, result);
    }
};
```

