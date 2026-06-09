---
title: Leetcode 0106. Construct Binary Tree from Inorder and Postorder Traversal
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: a3d1a0ae
date: 2023-08-23
---

## [106. Construct Binary Tree from Inorder and Postorder Traversal](https://leetcode.cn/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

Given two integer arrays `inorder` and `postorder` where `inorder` is the inorder traversal of a binary tree and `postorder` is the postorder traversal of the same tree, construct and return *the binary tree*.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/tree.jpg)

```
Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]
Output: [3,9,20,null,null,15,7]
```

**Example 2:**

```
Input: inorder = [-1], postorder = [-1]
Output: [-1]
```

## 题目大意

给定一棵二叉树的中序遍历数组 `inorder` 和后序遍历数组 `postorder`，请构造并返回这棵二叉树。

例如：

- 输入 `inorder = [9,3,15,20,7]`，`postorder = [9,15,7,20,3]`，输出对应的二叉树（根为 3，左子树为 9，右子树为 20，20 的左右子树分别为 15 和 7）。

## 解题思路

从中序和后序遍历构造二叉树的核心依据是两种遍历的特性：

1. **后序遍历的最后一个元素 = 当前子树的根节点**
   后序遍历的顺序是 “左子树→右子树→根”，因此序列的末尾元素一定是当前子树的根（如示例 1 中，后序`[9,15,7,20,3]`的末尾`3`是整棵树的根）。

2. 中序遍历中根节点的位置 = 划分左右子树的边界

   中序遍历的顺序是 “左子树→根→右子树”，因此找到根节点在中序序列中的位置后：

   - 根节点**左侧**的所有元素 = 当前根的左子树的中序遍历；
   - 根节点**右侧**的所有元素 = 当前根的右子树的中序遍历。

3. **左右子树的节点数量 = 两种遍历中对应区间的长度**
   中序遍历中左子树的节点数，与后序遍历中左子树的节点数完全一致（右子树同理），这是划分后序遍历区间的关键依据。

4. 每次将 “构造整棵树” 的大问题，拆解为 “构造左子树” 和 “构造右子树” 的小问题；

5. 依赖两种遍历的特性确定根节点和区间划分，最终通过递归逐步还原整棵树。

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
    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
        int n = inorder.size();
        // 构建中序遍历值到索引的映射，用于快速查找根节点位置
        unordered_map<int, int> index;
        for (int i = 0; i < n; i++) {
            index[inorder[i]] = i;
        }

        // 定义递归lambda函数（C++14及以上支持泛型lambda和this捕获）
        auto dfs = [&](this auto&& dfs, int in_l, int in_r, int post_l, int post_r) -> TreeNode* {
            // 递归终止条件：左闭右开区间，当左右边界相等时表示空区间（无节点）
            if (post_l == post_r) { 
                return nullptr;
            }
            
            // 1. 后序遍历的最后一个元素（post_r-1位置）是当前根节点
            int root_val = postorder[post_r - 1];
            
            // 2. 计算左子树的大小：根节点在中序中的索引 - 中序左边界
            int left_size = index[root_val] - in_l;
            
            // 3. 递归构建左子树
            // 左子树中序范围：[in_l, in_l + left_size)
            // 左子树后序范围：[post_l, post_l + left_size)
            TreeNode* left = dfs(in_l, in_l + left_size, post_l, post_l + left_size);
            
            // 4. 递归构建右子树
            // 右子树中序范围：[in_l + left_size + 1, in_r)
            // 右子树后序范围：[post_l + left_size, post_r - 1)
            TreeNode* right = dfs(in_l + left_size + 1, in_r, post_l + left_size, post_r - 1);
            
            // 5. 创建当前根节点并挂载左右子树
            return new TreeNode(root_val, left, right);
        };
        
        // 初始调用：所有区间均为左闭右开，范围[0, n)
        return dfs(0, n, 0, n); 
    }
};
```