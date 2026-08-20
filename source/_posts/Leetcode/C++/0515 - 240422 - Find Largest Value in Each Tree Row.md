---
title: Leetcode 0515. Find Largest Value in Each Tree Row
tags:
  - leetcode
categories: [Leetcode, C++]
  - tree
series: Leetcode-C++
abbrlink: 46ac1ea3
date: 2024-01-25
---

## [515. Find Largest Value in Each Tree Row](https://leetcode.cn/problems/find-largest-value-in-each-tree-row/)

Given the `root` of a binary tree, return *an array of the largest value in each row* of the tree **(0-indexed)**.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/08/21/largest_e1.jpg)

```
Input: root = [1,3,2,5,3,null,9]
Output: [1,3,9]
```

**Example 2:**

```
Input: root = [1,2,3]
Output: [1,3]
```

## 题目大意

给定一棵二叉树的根节点 `root`，返回一个数组，其中每个元素是二叉树对应行（从 0 开始索引）中的最大值。

例如：

- 输入二叉树 `[1,3,2,5,3,null,9]`，第 0 行最大值为 1，第 1 行最大值为 3，第 2 行最大值为 9，因此返回 `[1,3,9]`。

## 解题思路

要找到每一行的最大值，核心是**按层遍历二叉树**，并在遍历过程中记录每层的最大值。具体步骤如下：

1. **层序遍历初始化**：若根节点为空，直接返回空数组；否则将根节点入队。
2. **逐层处理节点**：
   - 记录当前队列大小（即当前层的节点总数 `levelSize`），用于控制只处理当前层的节点。
   - 初始化当前层的最大值 `maxVal`（可设为当前层第一个节点的值，再与其他节点比较）。
   - 遍历当前层的所有节点：
     - 取出队首节点，比较其值与 `maxVal`，更新 `maxVal` 为两者中的较大值。
     - 将节点的左、右子节点入队（为下一层遍历做准备）。
   - 当前层处理完毕后，将 `maxVal` 加入结果集。
3. **遍历结束**：所有层处理完成后，返回结果集。

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
    vector<int> largestValues(TreeNode* root) {
        vector<int> result;
        if (root == nullptr) { // 边界条件：空树返回空数组
            return result;
        }

        queue<TreeNode*> q;
        q.push(root); // 根节点入队，启动层序遍历

        while (!q.empty()) {
            int levelSize = q.size(); // 当前层的节点总数
            int maxVal = INT_MIN;     // 初始化当前层最大值为最小整数

            // 遍历当前层的所有节点
            for (int i = 0; i < levelSize; ++i) {
                TreeNode* curr = q.front();
                q.pop();

                // 更新当前层的最大值
                if (curr->val > maxVal) {
                    maxVal = curr->val;
                }

                // 下一层节点入队
                if (curr->left != nullptr) {
                    q.push(curr->left);
                }
                if (curr->right != nullptr) {
                    q.push(curr->right);
                }
            }

            result.push_back(maxVal); // 将当前层最大值加入结果集
        }

        return result;
    }
};
```