---
title: Leetcode 0095. Unique Binary Search Trees II
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: 40fcd2a9
date: 2024-10-07 22:56:44
---

## [95. Unique Binary Search Trees II](https://leetcode.cn/problems/unique-binary-search-trees-ii/)

Given an integer `n`, return *all the structurally unique **BST'**s (binary search trees), which has exactly* `n` *nodes of unique values from* `1` *to* `n`. Return the answer in **any order**.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/01/18/uniquebstn3.jpg)

```
Input: n = 3
Output: [[1,null,2,null,3],[1,null,3,2],[2,1,3],[3,1,null,null,2],[3,2,null,1]]
```

**Example 2:**

```
Input: n = 1
Output: [[1]]
```

## 题目大意

给定一个整数 `n`，生成所有由 `1` 到 `n` 为节点所组成的**结构独特**的二叉搜索树（BST）。返回这些二叉搜索树的根节点列表。

二叉搜索树的特性是：对于任意节点，其左子树中的所有节点值都小于该节点值，右子树中的所有节点值都大于该节点值。

例如：

- 输入 `n = 3`，存在 5 种结构独特的 BST，返回包含这些树的根节点的列表；
- 输入 `n = 1`，只有 1 种 BST（单个节点 1），返回包含该节点的列表。

## 解题思路

生成所有独特 BST 的核心是**递归构造**，利用 BST 的特性：若选择 `i` 作为根节点，则左子树由 `1~i-1` 构成，右子树由 `i+1~n` 构成。具体步骤：

1. **递归参数**：当前构造的节点值范围 `[start, end]`。
2. **递归终止条件**：若 `start > end`，返回包含空节点的列表（表示空树）。
3. **根节点选择**：遍历 `start` 到 `end` 的每个值 `i`，将 `i` 作为根节点。
4. **左右子树构造**：递归生成左子树（`[start, i-1]`）和右子树（`[i+1, end]`）的所有可能结构。
5. **组合左右子树**：将左子树的每种结构与右子树的每种结构分别组合到根节点 `i` 上，形成完整的 BST。

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
    vector<TreeNode*> dfs(int l, int r) {
        // 递归终止条件：当起始范围大于结束范围时，返回包含空指针的列表
        // 表示当前位置没有节点（用于构建叶子节点的左右子树）
        if (l > r) {
            return {NULL};
        }
        
        vector<TreeNode*> ans;  // 存储当前范围内所有可能的BST根节点
        
        // 遍历所有可能的根节点值（从l到r）
        for (int i = l; i <= r; ++i) {
            // 递归生成左子树：由[l, i-1]范围内的节点构成
            vector<TreeNode*> leftTrees = dfs(l, i - 1);
            // 递归生成右子树：由[i+1, r]范围内的节点构成
            vector<TreeNode*> rightTrees = dfs(i + 1, r);
            
            // 组合所有可能的左子树和右子树到当前根节点i
            for (auto left : leftTrees) {      // 遍历所有左子树结构
                for (auto right : rightTrees) { // 遍历所有右子树结构
                    TreeNode* t = new TreeNode(i);  // 创建当前根节点
                    t->left = left;                 // 挂载左子树
                    t->right = right;               // 挂载右子树
                    ans.push_back(t);               // 将完整树加入结果列表
                }
            }
        }
        
        return ans;  // 返回当前范围内所有可能的BST
    }
    
    /**
     * 生成由1到n节点组成的所有独特BST
     * @param n 节点数量
     * @return 所有独特BST的根节点列表
     */
    vector<TreeNode*> generateTrees(int n) {
        // 调用dfs生成[1, n]范围内的所有BST
        return dfs(1, n);
    }
};
```