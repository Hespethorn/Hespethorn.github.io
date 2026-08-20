---
title: Leetcode 0145. Binary Tree Postorder Traversal
tags:
  - leetcode
categories: [Leetcode, C++]
  - tree
series: Leetcode-C++
abbrlink: '60640130'
date: 2023-09-18
---

## [145. Binary Tree Postorder Traversal](https://leetcode.cn/problems/binary-tree-postorder-traversal/)

Given the `root` of a binary tree, return *the postorder traversal of its nodes' values*.

 **Example 1:**

**Input:** root = [1,null,2,3]

**Output:** [3,2,1]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2024/08/29/screenshot-2024-08-29-202743.png)

**Example 2:**

**Input:** root = [1,2,3,4,5,null,8,null,null,6,7,9]

**Output:** [4,6,7,5,2,9,8,3,1]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2024/08/29/tree_2.png)

**Example 3:**

**Input:** root = []

**Output:** []

**Example 4:**

**Input:** root = [1]

**Output:** [1]

## 题目大意

给定一棵二叉树的根节点 `root`，返回其节点值的**后序遍历**结果。后序遍历的顺序是「左子树 → 右子树 → 根节点」，遵循 "左 - 右 - 根" 的递归逻辑。

## 解题思路

后序遍历的核心是最后访问根节点，先遍历左子树，再遍历右子树。主要有两种实现方式：

### 1. 递归法

直接按照 "左 - 右 - 根" 的顺序递归遍历：

1. 递归遍历左子树
2. 递归遍历右子树
3. 访问当前根节点

### 2. 迭代法

使用栈来模拟递归过程，后序遍历的迭代实现相对复杂，有两种常用思路：

- 思路 1：通过栈记录节点访问状态，区分 "首次访问" 和 "二次访问"
- 思路 2：利用前序遍历 "根 - 左 - 右" 的变种（根 - 右 - 左），再反转结果得到 "左 - 右 - 根"

```
class Solution {
public:
    // 方法1：递归实现
    vector<int> postorderTraversal1(TreeNode* root) {
        vector<int> result;
        postorderRecursive(root, result);
        return result;
    }
    
    // 方法2：迭代实现（利用前序遍历变种反转）
    vector<int> postorderTraversal2(TreeNode* root) {
        vector<int> result;
        if (root == nullptr) return result;
        
        stack<TreeNode*> st;
        st.push(root);
        
        // 先得到"根-右-左"的顺序
        while (!st.empty()) {
            TreeNode* node = st.top();
            st.pop();
            result.push_back(node->val);
            
            // 先左后右入栈，保证右子树先处理
            if (node->left != nullptr) {
                st.push(node->left);
            }
            if (node->right != nullptr) {
                st.push(node->right);
            }
        }
        
        // 反转得到"左-右-根"的后序遍历
        reverse(result.begin(), result.end());
        return result;
    }
    
    // 方法3：迭代实现（记录访问状态）
    vector<int> postorderTraversal3(TreeNode* root) {
        vector<int> result;
        if (root == nullptr) return result;
        
        stack<pair<TreeNode*, bool>> st;
        st.push({root, false});  // 第二个元素表示是否已访问
        
        while (!st.empty()) {
            auto [node, visited] = st.top();
            st.pop();
            
            if (visited) {
                // 已访问过，直接加入结果
                result.push_back(node->val);
            } else {
                // 未访问过，按"根-右-左"顺序入栈，但标记根为已访问
                st.push({node, true});
                if (node->right != nullptr) {
                    st.push({node->right, false});
                }
                if (node->left != nullptr) {
                    st.push({node->left, false});
                }
            }
        }
        
        return result;
    }
    
    // 为了提交方便，这里用方法3作为默认实现
    vector<int> postorderTraversal(TreeNode* root) {
        return postorderTraversal3(root);
    }
    
private:
    // 递归辅助函数
    void postorderRecursive(TreeNode* root, vector<int>& result) {
        if (root == nullptr) return;
        
        postorderRecursive(root->left, result);   // 遍历左子树
        postorderRecursive(root->right, result);  // 遍历右子树
        result.push_back(root->val);              // 访问根节点
    }
};
```