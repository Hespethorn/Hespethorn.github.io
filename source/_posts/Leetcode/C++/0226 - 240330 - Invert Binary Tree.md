---
title: Leetcode 0226. Invert Binary Tree
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: e977e474
date: 2023-11-08 21:46:00
---

## [226. Invert Binary Tree](https://leetcode.cn/problems/invert-binary-tree/)

Given the `root` of a binary tree, invert the tree, and return *its root*.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/03/14/invert1-tree.jpg)

```
Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2021/03/14/invert2-tree.jpg)

```
Input: root = [2,1,3]
Output: [2,3,1]
```

**Example 3:**

```
Input: root = []
Output: []
```

## 题目大意

给定一棵二叉树的根节点 `root`，翻转这棵二叉树（即交换每个节点的左子树和右子树），并返回翻转后的根节点。

例如：

- 输入二叉树 `[4,2,7,1,3,6,9]`，翻转后每个节点的左右子树互换，输出为 `[4,7,2,9,6,3,1]`。

## 解题思路

翻转二叉树的核心是**交换每个节点的左子节点和右子节点**，可以通过递归或迭代两种方式实现：

### 1. 递归法

利用二叉树的递归性质：

- 若当前节点为空，直接返回；
- 否则，先交换当前节点的左、右子节点；
- 递归翻转当前节点的左子树和右子树。

### 2. 迭代法（使用队列）

通过层序遍历的思想，逐个处理每个节点：

- 初始化队列并将根节点入队；
- 循环处理队列中的节点：取出节点，交换其左、右子节点，再将子节点入队；
- 直到所有节点处理完毕，返回根节点（此时树已被翻转）。

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
    TreeNode* invertTree(TreeNode* root) {
        // 基准情况：空节点直接返回
        if (root == nullptr) {
            return nullptr;
        }
        
        // 交换当前节点的左、右子节点
        swap(root->left, root->right);
        
        // 递归翻转左子树和右子树
        invertTree(root->left);
        invertTree(root->right);
        
        return root;
    }
};
```

### 方法 2：迭代法（使用队列）

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
    TreeNode* invertTree(TreeNode* root) {
        // 基准情况：空节点直接返回
        if (root == nullptr) {
            return nullptr;
        }
        
        // 交换当前节点的左、右子节点
        swap(root->left, root->right);
        
        // 递归翻转左子树和右子树
        invertTree(root->left);
        invertTree(root->right);
        
        return root;
    }
};
```