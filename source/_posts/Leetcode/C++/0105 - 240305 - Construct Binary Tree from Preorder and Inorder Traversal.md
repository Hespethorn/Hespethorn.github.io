---
title: Leetcode 0105. Construct Binary Tree from Preorder and Inorder Traversal
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: e37153b2
date: 2023-08-21
---

# [105. Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)


## 题目

Given preorder and inorder traversal of a tree, construct the binary tree.

**Note:**You may assume that duplicates do not exist in the tree.

For example, given

    preorder = [3,9,20,15,7]
    inorder = [9,3,15,20,7]

Return the following binary tree:

    	3
       / \
      9  20
        /  \
       15   7



## 题目大意

根据一棵树的前序遍历与中序遍历构造二叉树。

注意:
你可以假设树中没有重复的元素。


## 解题思路

- `inorder_map`：用于快速查找中序遍历中元素对应的索引，时间复杂度 O (1)
- `pre`：保存前序遍历数组的副本，避免在递归中反复传递参数
- **确定根节点**：前序遍历的第一个元素为当前树的根节点
- **划分左右子树**：在中序遍历中找到根节点的位置，其左侧为左子树元素，右侧为右子树元素
- **递归构建**：根据左右子树的元素数量，在前序遍历中划分出对应范围，分别递归构建左右子树

为了提高查找效率，可使用哈希表存储中序遍历中元素与索引的映射关系。

```
#include <vector>
#include <unordered_map>
using namespace std;
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
    unordered_map<int, int> inorder_map;
    vector<int> pre;  

    TreeNode* build(int pre_start, int pre_end, int in_start, int in_end) {
        // 递归终止条件：起始索引大于结束索引，说明当前子树为空
        if (pre_start > pre_end) return nullptr;

        // 前序遍历的第一个元素是当前子树的根节点
        int root_val = pre[pre_start];
        TreeNode* root = new TreeNode(root_val);

        // 如果只有一个节点，直接返回该节点（叶子节点）
        if (pre_start == pre_end) return root;

        // 在中序遍历中找到根节点的位置
        int root_idx = inorder_map[root_val];
        // 计算左子树的节点数量
        int left_size = root_idx - in_start;

        // 递归构建左子树
        root->left = build(pre_start + 1, pre_start + left_size, 
                          in_start, root_idx - 1);

        // 递归构建右子树
        root->right = build(pre_start + left_size + 1, pre_end, 
                           root_idx + 1, in_end);

        return root;
}
    
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < inorder.size(); ++i) {
            inorder_map[inorder[i]] = i;
        }
        pre = preorder;  // 直接赋值，无需引用
        return build(0, preorder.size() - 1, 0, inorder.size() - 1);
    }
};
```

#### **执行流程**：

1. 终止条件判断：若`pre_start > pre_end`，返回空指针
2. 创建根节点：值为前序遍历的第一个元素（`pre[pre_start]`）
3. 查找根节点在中序遍历中的位置（`root_idx`）
4. 计算左子树节点数量（`left_size = root_idx - in_start`）
5. 递归构建左子树：前序遍历范围为`[pre_start+1, pre_start+left_size]`，中序遍历范围为`[in_start, root_idx-1]`
6. 递归构建右子树：前序遍历范围为`[pre_start+left_size+1, pre_end]`，中序遍历范围为`[root_idx+1, in_end]`