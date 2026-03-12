---
title: Leetcode 0046. Permutations
tags:
  - leetcode
categories:
  - Leetcode
  - 回溯算法
series: Leetcode
abbrlink: bffc8823
date: 2025-03-20 22:50:18
---

## [46. Permutations](https://leetcode.cn/problems/permutations/)

Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in **any order**.

**Example 1:**

```
Input: nums = [1,2,3]
Output: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

**Example 2:**

```
Input: nums = [0,1]
Output: [[0,1],[1,0]]
```

**Example 3:**

```
Input: nums = [1]
Output: [[1]]
```

## 题目大意

给定一个**无重复元素**的整数数组 `nums`，返回该数组所有可能的全排列。全排列是指包含数组所有元素的有序序列，且每个元素仅出现一次，结果顺序可任意。

例如：

- 输入 `nums = [1,2,3]`，输出 `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`（共 3! = 6 种全排列）；
- 输入 `nums = [0,1]`，输出 `[[0,1],[1,0]]`（共 2! = 2 种全排列）。

## 解题思路

核心思路是**递归回溯 + 标记已选元素**，通过逐步选择未使用的元素构建全排列，确保每个元素仅使用一次：

1. **递归状态设计**
   - 递归函数`dfs(i)`表示：正在构建排列的第`i`个位置（从 0 开始）
   - `path`数组：存储当前构建的排列，长度固定为`n`（与原数组长度一致）
   - `on_path`数组：标记元素是否已被选入当前排列（`on_path[j]=true`表示`nums[j]`已使用）
2. **核心决策逻辑**
   - 对于排列的第`i`个位置，遍历所有未被使用的元素（`on_path[j]=false`）
   - 选择`nums[j]`放入`path[i]`，标记`on_path[j]=true`
   - 递归处理下一个位置`i+1`
   - 回溯时只需将`on_path[j]`重置为`false`（`path`无需恢复，后续会被新值覆盖）
3. **终止条件**
   - 当`i == n`时，说明已构建完一个完整排列，将`path`加入结果列表
4. **优化点**
   - 使用固定长度的`path`数组，通过索引直接赋值，避免动态增减元素的开销
   - 回溯时仅需恢复`on_path`状态，`path`会在后续递归中被自动覆盖

## 代码实现

```
class Solution {
public:
    vector<vector<int>> permute(vector<int> &nums) {
        int n = nums.size();
        vector<vector<int>> ans;
        vector<int> path(n), on_path(n); // 所有排列的长度都是一样的 n
        auto dfs = [&](this auto&& dfs, int i) {
            if (i == n) {
                ans.emplace_back(path);
                return;
            }
            for (int j = 0; j < n; j++) {
                if (!on_path[j]) {
                    path[i] = nums[j]; // 从没有选的数字中选一个
                    on_path[j] = true; // 已选上
                    dfs(i + 1);
                    on_path[j] = false; // 恢复现场
                    // 注意 path 无需恢复现场，因为排列长度固定，直接覆盖就行
                }
            }
        };
        dfs(0);
        return ans;
    }
};
```