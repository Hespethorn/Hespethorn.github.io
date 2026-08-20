---
title: Leetcode 0099. Recover Binary Search Tree
tags:
  - leetcode
categories: [Leetcode, C++]
  - tree
series: Leetcode-C++
abbrlink: b20ae183
date: 2023-07-28
---

## [99. Recover Binary Search Tree](https://leetcode.cn/problems/recover-binary-search-tree/)

You are given the `root` of a binary search tree (BST), where the values of **exactly** two nodes of the tree were swapped by mistake. *Recover the tree without changing its structure*.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/10/28/recover1.jpg)

```
Input: root = [1,3,null,null,2]
Output: [3,1,null,null,2]
Explanation: 3 cannot be a left child of 1 because 3 > 1. Swapping 1 and 3 makes the BST valid.
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2020/10/28/recover2.jpg)

```
Input: root = [3,1,4,null,null,2]
Output: [2,1,4,null,null,3]
Explanation: 2 cannot be in the right subtree of 3 because 2 < 3. Swapping 2 and 3 makes the BST valid.
```

## 题目大意

给定一棵二叉搜索树（BST）的根节点，该树中有且仅有两个节点的值被错误地交换了。要求需要恢复这棵树，使其重新成为有效的 BST，且不改变树的结构。

例如：

- 输入 `root = [1,3,null,null,2]`，3 和 1 被错误交换，恢复后为 `[3,1,null,null,2]`；
- 输入 `root = [3,1,4,null,null,2]`，3 和 2 被错误交换，恢复后为 `[2,1,4,null,null,3]`。

## 解题思路

恢复错误的 BST 的核心是**找到被交换的两个节点**，然后交换它们的值。由于 BST 的中序遍历结果是严格递增的序列，因此可以利用这一特性：

1. 对 BST 进行中序遍历，得到一个序列；
2. 在这个序列中找到两个不满足递增关系的节点；
3. 这两个节点就是被错误交换的节点，交换它们的值即可恢复 BST。

具体来说，在中序遍历序列中，异常情况有两种：

- 两个错误节点相邻：序列中会出现一处 `a[i] > a[i+1]`，此时 `a[i]` 和 `a[i+1]` 就是要交换的节点；
- 两个错误节点不相邻：序列中会出现两处 `a[i] > a[i+1]`，此时第一个异常的 `a[i]` 和第二个异常的 `a[i+1]` 是要交换的节点。

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
private:
    // 用于记录中序遍历中发现的异常节点
    TreeNode* first = nullptr;  // 第一个异常节点
    TreeNode* second = nullptr; // 第二个异常节点
    TreeNode* prev = nullptr;   // 中序遍历的前一个节点

    // 中序遍历寻找异常节点
    void inorder(TreeNode* root) {
        if (root == nullptr) return;
        
        // 遍历左子树
        inorder(root->left);
        
        // 处理当前节点：检查是否违反BST的递增特性
        if (prev != nullptr && root->val < prev->val) {
            // 发现异常，记录节点
            if (first == nullptr) {
                first = prev;  // 第一次发现异常，前一个节点是第一个错误节点
            }
            second = root;    // 第二个错误节点（可能更新）
        }
        prev = root;  // 更新前一个节点
        
        // 遍历右子树
        inorder(root->right);
    }

public:
    void recoverTree(TreeNode* root) {
        // 中序遍历找到被交换的两个节点
        inorder(root);
        
        // 交换两个错误节点的值
        swap(first->val, second->val);
    }
};
```

