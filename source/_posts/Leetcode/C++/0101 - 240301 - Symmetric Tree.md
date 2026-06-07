---
title: Leetcode 0101. Symmetric Tree
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: df366c05
date: 2023-08-05 19:10:00
---

## [101. Symmetric Tree](https://leetcode.cn/problems/symmetric-tree/)

Given the `root` of a binary tree, *check whether it is a mirror of itself* (i.e., symmetric around its center).

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/symtree1.jpg)

```
Input: root = [1,2,2,3,4,4,3]
Output: true
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2021/02/19/symtree2.jpg)

```
Input: root = [1,2,2,null,3,null,3]
Output: false
```

## 题目大意

给定一棵二叉树的根节点 `root`，判断该二叉树是否是**对称的**（即围绕中心轴镜像对称）。

例如：

- 输入二叉树 `[1,2,2,3,4,4,3]`，其左子树与右子树成镜像，故返回 `true`；
- 输入二叉树 `[1,2,2,null,3,null,3]`，左子树与右子树不镜像，故返回 `false`。

## 解题思路

判断二叉树是否对称的核心是**比较左子树与右子树是否成镜像**，即：

- 左子树的左节点需与右子树的右节点值相等；
- 左子树的右节点需与右子树的左节点值相等。

### 1. 递归法

设计一个辅助函数，比较两个子树是否镜像对称：

- 若两个子树都为空，对称；
- 若其中一个为空，另一个非空，不对称；
- 若两个子树的根节点值不等，不对称；
- 递归比较左子树的左节点与右子树的右节点，以及左子树的右节点与右子树的左节点。

### 2. 迭代法（使用队列）

通过队列成对存储待比较的节点，依次检查对称性：

- 初始将根节点的左、右子树入队；
- 每次从队列取出两个节点比较，若对称则将其子女按「左左与右右」「左右与右左」的顺序入队；
- 若所有成对节点均对称，且队列最终为空，则树对称。

## 代码实现

### 方法 1：递归法

```
class Solution {
    // 在【100. 相同的树】的基础上稍加改动
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (p == nullptr || q == nullptr) {
            return p == q;
        }
        return p->val == q->val && isSameTree(p->left, q->right) && isSameTree(p->right, q->left);
    }

public:
    bool isSymmetric(TreeNode* root) {
        return isSameTree(root->left, root->right);
    }
};
```

作者：灵茶山艾府
链接：https://leetcode.cn/problems/symmetric-tree/solutions/2015063/ru-he-ling-huo-yun-yong-di-gui-lai-kan-s-6dq5/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

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
    bool isSymmetric(TreeNode* root) {
        if (root == nullptr) { // 空树视为对称
            return true;
        }

        queue<TreeNode*> q;
        // 初始将左右子树入队，成对比较
        q.push(root->left);
        q.push(root->right);

        while (!q.empty()) {
            // 取出一对节点
            TreeNode* t1 = q.front();
            q.pop();
            TreeNode* t2 = q.front();
            q.pop();

            // 两个节点都为空，继续检查下一对
            if (t1 == nullptr && t2 == nullptr) {
                continue;
            }
            // 一个为空一个非空，不对称
            if (t1 == nullptr || t2 == nullptr) {
                return false;
            }
            // 节点值不等，不对称
            if (t1->val != t2->val) {
                return false;
            }

            // 按镜像顺序入队：左左与右右、左右与右左
            q.push(t1->left);
            q.push(t2->right);
            q.push(t1->right);
            q.push(t2->left);
        }

        // 所有成对节点均对称
        return true;
    }
};
```