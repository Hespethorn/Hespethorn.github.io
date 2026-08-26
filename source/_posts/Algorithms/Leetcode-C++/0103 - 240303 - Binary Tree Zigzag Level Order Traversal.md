---

title: Leetcode 0103. Binary Tree Zigzag Level Order Traversal
tags:
  - tree
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 1e306ca2
date: 2023-08-13

---

[103. Binary Tree Zigzag Level Order Traversal](https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/)

Given the `root` of a binary tree, return *the zigzag level order traversal of its nodes' values*. (i.e., from left to right, then right to left for the next level and alternate between).

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/19/tree1.jpg)

```
Input: root = [3,9,20,null,null,15,7]
Output: [[3],[20,9],[15,7]]
```

**Example 2:**

```
Input: root = [1]
Output: [[1]]
```

**Example 3:**

```
Input: root = []
Output: []
```

## 题目大意

给定一棵二叉树的根节点，返回其节点值的锯齿形层序遍历。即：第一层从左到右，第二层从右到左，第三层再从左到右，以此类推，交替进行。

例如：

- 输入 `root = [3,9,20,null,null,15,7]`，输出 `[[3],[20,9],[15,7]]`；
- 输入 `root = [1]`，输出 `[[1]]`。

## 解题思路

锯齿形层序遍历可以基于**广度优先搜索（BFS）** 实现，核心是在常规层序遍历的基础上，根据层数的奇偶性决定是否反转当前层的节点值顺序：

1. 使用队列存储每一层的节点；
2. 遍历每一层节点时，记录当前层的节点值；
3. 若当前层为偶数层（从 0 开始计数），保持节点值顺序不变；
4. 若当前层为奇数层，反转当前层的节点值顺序；
5. 将处理后的当前层节点值加入结果列表，继续遍历下一层。

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
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (root == nullptr) {
            return result; // 空树直接返回空列表
        }
        
        queue<TreeNode*> q;
        q.push(root);
        bool leftToRight = true; // 标记当前层是否从左到右遍历
        
        while (!q.empty()) {
            int levelSize = q.size(); // 当前层的节点数量
            vector<int> currentLevel;
            
            // 遍历当前层的所有节点
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* node = q.front();
                q.pop();
                currentLevel.push_back(node->val);
                
                // 将下一层的节点加入队列
                if (node->left != nullptr) {
                    q.push(node->left);
                }
                if (node->right != nullptr) {
                    q.push(node->right);
                }
            }
            
            // 若当前层需要从右到左，则反转当前层的节点值
            if (!leftToRight) {
                reverse(currentLevel.begin(), currentLevel.end());
            }
            
            // 将当前层的结果加入总结果
            result.push_back(currentLevel);
            // 切换下一层的遍历方向
            leftToRight = !leftToRight;
        }
        
        return result;
    }
};
```