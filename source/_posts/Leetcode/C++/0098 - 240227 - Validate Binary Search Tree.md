---
title: Leetcode 0098. Validate Binary Search Tree
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: ad3b6ff4
date: 2023-07-26
---

## [98. Validate Binary Search Tree](https://leetcode.cn/problems/validate-binary-search-tree/)

Given the `root` of a binary tree, *determine if it is a valid binary search tree (BST)*.

A **valid BST** is defined as follows:

- The left subtree of a node contains only nodes with keys **strictly less than** the node's key.
- The right subtree of a node contains only nodes with keys **strictly greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/12/01/tree1.jpg)

```
Input: root = [2,1,3]
Output: true
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2020/12/01/tree2.jpg)

```
Input: root = [5,1,4,null,null,3,6]
Output: false
Explanation: The root node's value is 5 but its right child's value is 4.
```

## 题目大意

给定一棵二叉树的根节点 `root`，判断其是否为有效的二叉搜索树（BST）。有效的 BST 需满足：

1. 左子树的所有节点值均当前节点值；
2. 右子树的所有节点值＞当前节点值；
3. 左、右子树也必须是有效的 BST。

例如：

- 输入 `root = [2,1,3]`，满足 BST 条件，返回 `true`；
- 输入 `root = [5,1,4,null,null,3,6]`，右子树包含 3（小于根节点 5），返回 `false`。

## 解题思路

验证 BST 的核心是**维护节点值的有效范围**，确保每个节点的值都在其父节点限定的范围内。可通过深度优先搜索（DFS）实现：

1. **递归参数**：当前节点、允许的最小值（下界）、允许的最大值（上界）。
2. **递归终止条件**：若当前节点为空，返回 `true`（空树是有效的 BST）。
3. **节点值检查**：若当前节点值≤下界或≥上界，返回 `false`（违反 BST 规则）。
4. **递归逻辑**：
   - 左子树的上界更新为当前节点值（左子树所有节点必须＜当前节点值）；
   - 右子树的下界更新为当前节点值（右子树所有节点必须＞当前节点值）；
   - 左右子树都有效时，当前树才有效。

## 代码实现

```
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        // 初始范围：负无穷到正无穷（使用long避免INT_MIN/INT_MAX的边界问题）
        return dfs(root, LONG_MIN, LONG_MAX);
    }

private:
    // 辅助函数：DFS验证BST，检查当前节点是否在[lower, upper]范围内
    bool dfs(TreeNode* node, long long lower, long long upper) {
        if (node == nullptr) { // 空节点是有效的BST
            return true;
        }
        
        // 当前节点值必须严格大于lower且严格小于upper
        if (node->val <= lower || node->val >= upper) {
            return false;
        }
        
        // 递归验证左子树：左子树的最大值不能超过当前节点值
        // 递归验证右子树：右子树的最小值不能小于当前节点值
        return dfs(node->left, lower, node->val) && dfs(node->right, node->val, upper);
    }
};
```

### 解法2：中序遍历

BST 的**中序遍历结果是严格递增序列**（左→根→右），若遍历过程中出现 “当前节点值≤前一个节点值”，则不是有效 BST。

```
#include <climits>
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
    long long pre = LLONG_MIN; // 记录中序遍历的前一个节点值，初始为负无穷（避免INT_MIN边界问题）
public:
    bool isValidBST(TreeNode* root) {
        if (root == nullptr) return true; // 空树是有效BST
        
        // 1. 先遍历左子树（中序：左优先）
        if (!isValidBST(root->left)) return false;
        
        // 2. 再访问当前节点（中序：左遍历完后处理根）
        if (root->val <= pre) return false; // 若当前值≤前一个值，违反严格递增
        pre = root->val; // 更新前一个值为当前值
        
        // 3. 最后遍历右子树（中序：根处理完后遍历右）
        return isValidBST(root->right);
    }
};
```

作者：灵茶山艾府
链接：https://leetcode.cn/problems/validate-binary-search-tree/solutions/2020306/qian-xu-zhong-xu-hou-xu-san-chong-fang-f-yxvh/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。