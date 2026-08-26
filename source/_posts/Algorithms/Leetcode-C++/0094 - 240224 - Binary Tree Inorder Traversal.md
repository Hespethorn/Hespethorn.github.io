---

title: Leetcode 0094. Binary Tree Inorder Traversal
tags:
  - tree
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 8c7c98c4
date: 2023-07-14

---

## [94. Binary Tree Inorder Traversal](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

Given the `root` of a binary tree, return *the inorder traversal of its nodes' values*.

 **Example 1:**

**Input:** root = [1,null,2,3]

**Output:** [1,3,2]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2024/08/29/screenshot-2024-08-29-202743.png)

**Example 2:**

**Input:** root = [1,2,3,4,5,null,8,null,null,6,7,9]

**Output:** [4,2,6,5,7,1,3,9,8]

**Explanation:**

![img](https://assets.leetcode.com/uploads/2024/08/29/tree_2.png)

**Example 3:**

**Input:** root = []

**Output:** []

**Example 4:**

**Input:** root = [1]

**Output:** [1]

 题目大意

给定一棵二叉树的根节点 `root`，返回其节点值的**中序遍历**结果。中序遍历的顺序是「左子树 → 根节点 → 右子树」，遵循 “左 - 根 - 右” 的递归逻辑，且需按此顺序收集所有节点值。

## 解题思路

二叉树的中序遍历有两种经典实现方式：**递归法**和**迭代法**。递归法逻辑直观，迭代法则需借助栈模拟递归过程，两种方法均需遵循 “左 - 根 - 右” 的核心顺序。

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
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> result;
        stack<TreeNode*> st;  // 显式栈存储待处理节点
        TreeNode* curr = root; // 指针跟踪当前节点

        while (curr != nullptr || !st.empty()) {
            // 步骤1：遍历左子树，所有左节点入栈
            while (curr != nullptr) {
                st.push(curr);
                curr = curr->left;
            }

            // 步骤2：弹出栈顶节点（左子树已处理完），访问根节点
            curr = st.top();
            st.pop();
            result.push_back(curr->val);

            // 步骤3：遍历右子树
            curr = curr->right;
        }

        return result;
    }
};
```