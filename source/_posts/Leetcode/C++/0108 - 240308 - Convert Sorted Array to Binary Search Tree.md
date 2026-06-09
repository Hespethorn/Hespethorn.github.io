---
title: Leetcode 0108. Convert Sorted Array to Binary Search Tree
tags:
  - leetcode
categories:
  - Leetcode
  - tree
series: Leetcode-Cpp
abbrlink: 387af610
date: 2023-08-30 19:10:00
---

## [108. Convert Sorted Array to Binary Search Tree](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

Given an integer array `nums` where the elements are sorted in **ascending order**, convert *it to a* ***height-balanced\*** *binary search tree*.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/02/18/btree1.jpg)

```
Input: nums = [-10,-3,0,5,9]
Output: [0,-3,9,-10,null,5]
Explanation: [0,-10,5,null,-3,null,9] is also accepted:
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2021/02/18/btree.jpg)

```
Input: nums = [1,3]
Output: [3,1]
Explanation: [1,null,3] and [3,1] are both height-balanced BSTs.
```

## 题目大意

给定一个**升序排列**的整数数组 `nums`，将其转换为一棵**高度平衡**的二叉搜索树（BST）。高度平衡的定义是：二叉树的左右两个子树的高度差的绝对值不超过 1，且左右子树也均为高度平衡二叉树。

例如：

- 输入 `nums = [-10,-3,0,5,9]`，可输出 `[0,-3,9,-10,null,5]` 或 `[0,-10,5,null,-3,null,9]`（均满足高度平衡 BST）；
- 输入 `nums = [1,3]`，可输出 `[1,null,3]` 或 `[3,1]`（均满足条件）。

## 解题思路

将有序数组转换为高度平衡二叉搜索树的核心思路基于**二叉搜索树（BST）的特性**和**分治思想**，步骤如下：

1. **利用 BST 与有序数组的关联**
   BST 的中序遍历结果是升序序列，因此给定的升序数组可视为目标 BST 的中序遍历结果。
2. **选择根节点确保平衡**
   为保证树的高度平衡（左右子树高度差≤1），每次选择数组的**中间元素作为当前子树的根节点**。
   - 中间元素的索引为 `mid = left + (right - left) / 2`（避免整数溢出）；
   - 此选择可使左右子树的节点数量尽可能接近，天然满足平衡条件。
3. **分治构建左右子树**
   - 左子树：递归处理数组左半部分（`[left, mid-1]` 或左闭右开区间 `[left, mid)`）；
   - 右子树：递归处理数组右半部分（`[mid+1, right]` 或左闭右开区间 `[mid+1, right)`）。
4. **终止条件**
   当处理的数组区间为空（左边界≥右边界）时，返回空节点（`nullptr`）。

## 代码实现

```
#include <vector>
using namespace std;

// 二叉树节点定义
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Solution {
    // 递归函数：将 nums[left..right-1] 区间转换为平衡BST
    // 采用左闭右开区间 [left, right)，即包含left，不包含right
    TreeNode* dfs(vector<int>& nums, int left, int right) {
        // 终止条件：当左右边界相等时，区间为空，返回空节点
        if (left == right) {
            return nullptr;
        }
        
        // 选择区间中点作为根节点（保证左右子树高度差不超过1）
        // m = left + (right-left)/2 等价于 (left+right)/2，可避免整数溢出
        int m = left + (right - left) / 2;
        
        // 递归构建左子树和右子树，并创建当前根节点
        // 左子树区间：[left, m)（中点左侧部分）
        // 右子树区间：[m+1, right)（中点右侧部分）
        return new TreeNode(nums[m], dfs(nums, left, m), dfs(nums, m + 1, right));
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        // 初始调用：处理整个数组，区间为 [0, nums.size())
        return dfs(nums, 0, nums.size());
    }
};
```