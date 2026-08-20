---
title: Leetcode 0110. Balanced Binary Tree
tags:
  - tree
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: b5c6d6e4
date: 2023-09-01
---

## [110. Balanced Binary Tree](https://leetcode.cn/problems/balanced-binary-tree/)

Given a binary tree, determine if it is **height-balanced**.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/10/06/balance_1.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: true
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2020/10/06/balance_2.jpg)

```
Input: root = [1,2,2,3,3,null,null,4,4]
Output: false
```

**Example 3:**

```
Input: root = []
Output: true
```

## 题目大意

给定一棵二叉树，判断它是否是**高度平衡的**。高度平衡平衡二叉树 ** 的定义是：二叉树的每个节点的左右两个子树的高度差的绝对值不超过 1。



例如：



- 输入二叉树 `[3,9,20,null,null,15,7]`，每个节点的左右子树高度差均不超过 1，返回 `true`；
- 输入二叉树 `[1,2,2,3,3,null,null,4,4]`，根节点的左子树高度为 3，右子树高度为 1，差为 2，返回 `false`。

## 解题思路

判断平衡二叉树的核心是**计算每个节点的左右子树高度，并检查高度差是否超过 1**。主要有两种实现方式：

### 自底向上递归（优化法）

- 后序遍历二叉树，先计算子树高度，再判断是否平衡；
- 若子树不平衡，直接返回 - 1 标记；
- 若平衡，返回当前子树的高度。
- 优点：每个节点只计算一次高度，时间复杂度更优。

## 代码实现

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
    int get_height(TreeNode* node) {
        // 边界条件：空节点没有高度，返回 0（空树视为平衡）
        if (node == nullptr) {
            return 0;
        }

        // 1. 递归计算左子树高度（后序遍历：先处理左子树）
        int left_h = get_height(node->left);
        // 2. 递归计算右子树高度（后序遍历：再处理右子树）
        int right_h = get_height(node->right);

        // 3. 平衡判断：满足以下任一条件，说明当前子树不平衡
        // - 左子树已标记为不平衡（left_h == -1）
        // - 右子树已标记为不平衡（right_h == -1）
        // - 当前节点的左右子树高度差绝对值 > 1（违反平衡树定义）
        if (left_h == -1 || right_h == -1 || abs(left_h - right_h) > 1) {
            return -1;  // 返回 -1 标记当前子树不平衡
        }

        // 4. 若子树平衡，返回当前子树的高度：
        // 高度 = 左右子树的最大高度 + 1（+1 是因为要包含当前节点）
        return max(left_h, right_h) + 1;
    }

public:
    /**
     * 主函数：判断二叉树是否为高度平衡二叉树
     * @param root: 二叉树的根节点
     * @return: 若树平衡，返回 true；否则返回 false
     */
    bool isBalanced(TreeNode* root) {
        // 调用 get_height 函数，若返回值不是 -1，说明整棵树平衡
        return get_height(root) != -1;
    }
};

```