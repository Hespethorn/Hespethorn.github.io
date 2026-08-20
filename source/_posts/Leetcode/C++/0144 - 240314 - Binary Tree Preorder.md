---
title: Leetcode 0144. Binary Tree Preorder Traversal
tags:
  - leetcode
categories: [Leetcode, C++]
  - tree
series: Leetcode-C++
abbrlink: 944106b5
date: 2023-09-15
---

## [144. Binary Tree Preorder Traversal](https://leetcode.cn/problems/binary-tree-preorder-traversal/)

Given the `root` of a binary tree, return *the preorder traversal of its nodes' values*.

 **Example 1:**

**Input:** root = [1,null,2,3]

**Output:** [1,2,3]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2024/08/29/screenshot-2024-08-29-202743.png)

**Example 2:**

**Input:** root = [1,2,3,4,5,null,8,null,null,6,7,9]

**Output:** [1,2,4,5,6,7,3,8,9]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2024/08/29/tree_2.png)

**Example 3:**

**Input:** root = []

**Output:** []

**Example 4:**

**Input:** root = [1]

**Output:** [1]

## 题目大意

给定一棵二叉树的根节点 `root`，返回其节点值的**前序遍历**结果。前序遍历的顺序是「根节点 → 左子树 → 右子树」，遵循 "根 - 左 - 右" 的递归逻辑。

## 解题思路

前序遍历的核心是先访问根节点，再遍历左子树，最后遍历右子树。主要有两种实现方式：

### 1. 递归法

直接按照 "根 - 左 - 右" 的顺序递归遍历：

1. 访问当前根节点
2. 递归遍历左子树
3. 递归遍历右子树

### 2. 迭代法

使用栈来模拟递归过程：

1. 将根节点入栈
2. 当栈不为空时，弹出栈顶节点并访问
3. 先将右子节点入栈（因为栈是后进先出）
4. 再将左子节点入栈
5. 重复步骤 2-4 直到栈为空

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
    // 方法1：递归实现
    vector<int> preorderTraversal1(TreeNode* root) {
        vector<int> result;
        preorderRecursive(root, result);
        return result;
    }
    
    // 方法2：迭代实现
    vector<int> preorderTraversal2(TreeNode* root) {
        vector<int> result;
        if (root == nullptr) return result;
        
        stack<TreeNode*> st;
        st.push(root);
        
        while (!st.empty()) {
            // 弹出栈顶节点并访问
            TreeNode* node = st.top();
            st.pop();
            result.push_back(node->val);
            
            // 先右后左入栈，保证左子树先处理
            if (node->right != nullptr) {
                st.push(node->right);
            }
            if (node->left != nullptr) {
                st.push(node->left);
            }
        }
        
        return result;
    }
    
    // 为了提交方便，这里用方法2作为默认实现
    vector<int> preorderTraversal(TreeNode* root) {
        return preorderTraversal2(root);
    }
    
private:
    // 递归辅助函数
    void preorderRecursive(TreeNode* root, vector<int>& result) {
        if (root == nullptr) return;
        
        result.push_back(root->val);      // 访问根节点
        preorderRecursive(root->left, result);  // 遍历左子树
        preorderRecursive(root->right, result); // 遍历右子树
    }
};
```