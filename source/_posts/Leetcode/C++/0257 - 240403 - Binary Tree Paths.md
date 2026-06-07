---
title: Leetcode 0257. Binary Tree Paths
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode
abbrlink: 2cbb7af4
date: 2023-11-23 21:10:00
---

## [257. Binary Tree Paths](https://leetcode.cn/problems/binary-tree-paths/)

Given the `root` of a binary tree, return *all root-to-leaf paths in **any order***.

A **leaf** is a node with no children.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/03/12/paths-tree.jpg)

```
Input: root = [1,2,3,null,5]
Output: ["1->2->5","1->3"]
```

**Example 2:**

```
Input: root = [1]
Output: ["1"]
```

## 题目大意

给定一棵二叉树的根节点 `root`，返回所有从根节点到叶子节点的路径。叶子节点是指没有子节点的节点，路径以字符串形式表示，节点值之间用 "->" 连接。

例如：

- 输入二叉树 `[1,2,3,null,5]`，根到叶子的路径为 `1->2->5` 和 `1->3`，返回 `["1->2->5","1->3"]`。

## 解题思路

要获取所有根到叶子的路径，可采用**深度优先搜索（DFS）** 遍历二叉树，记录从根节点到当前节点的路径，当遇到叶子节点时，将完整路径加入结果集。具体步骤如下：

1. **递归参数**：当前节点、当前路径字符串、结果集引用。
2. **递归终止条件**：若当前节点是叶子节点（左右子节点均为空），将当前路径加入结果集。
3. **递归逻辑**：
   - 将当前节点值加入路径字符串；
   - 若存在左子节点，递归处理左子树，路径字符串后加 "->"；
   - 若存在右子节点，递归处理右子树，路径字符串后加 "->"。

## 代码实现

```
// 二叉树节点定义（题目隐含，此处为完整性补充）
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
    vector<string> binaryTreePaths(TreeNode* root) {
        vector<string> ans;  // 存储所有根到叶子的路径结果
        
        // 定义递归lambda表达式（C++17特性），用于深度优先搜索
        // [&]：捕获外部变量ans的引用，用于存储结果
        // this auto&& dfs：允许lambda表达式递归调用自身
        // 参数：当前节点node，当前路径path
        auto dfs = [&](this auto&& dfs, TreeNode* node, string path) -> void {
            if (node == nullptr) {  // 递归终止条件：空节点无需处理
                return;
            }
            
            // 将当前节点的值添加到路径中
            path += to_string(node->val);
            
            // 判断是否为叶子节点（左右子节点都为空）
            if (node->left == nullptr && node->right == nullptr) { 
                ans.push_back(path);  // 叶子节点：将完整路径加入结果集
                return;
            }
            
            // 非叶子节点：添加路径分隔符"->"
            path += "->";
            
            // 递归处理左子树，传递当前路径
            dfs(node->left, path);
            // 递归处理右子树，传递当前路径
            dfs(node->right, path);
        };
        
        // 从根节点开始DFS，初始路径为空字符串
        dfs(root, "");
        
        return ans;  // 返回所有收集到的路径
    }
};
```