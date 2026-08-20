---
title: Leetcode 0491. Non-decreasing Subsequences
tags:
  - 回溯算法
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 28af2b40
date: 2024-01-12
---

## [491. Non-decreasing Subsequences](https://leetcode.cn/problems/non-decreasing-subsequences/)

Given an integer array `nums`, return *all the different possible non-decreasing subsequences of the given array with at least two elements*. You may return the answer in **any order**.

 **Example 1:**

```
Input: nums = [4,6,7,7]
Output: [[4,6],[4,6,7],[4,6,7,7],[4,7],[4,7,7],[6,7],[6,7,7],[7,7]]
```

**Example 2:**

```
Input: nums = [4,4,3,2,1]
Output: [[4,4]]
```

## 题目大意

给定一个整数数组 `nums`，返回所有不同的、长度至少为 2 的非递减子序列。子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。

例如：

- 输入 `nums = [4,6,7,7]`，输出包含 `[4,6]`、`[4,6,7]` 等多个符合条件的非递减子序列；
- 输入 `nums = [4,4,3,2,1]`，输出只有 `[[4,4]]`（唯一符合条件的子序列）。

## 解题思路

核心思路是**递归回溯 + 去重**，通过枚举所有可能的子序列，筛选出非递减且长度≥2 的子序列，并确保结果无重复：

1. **递归回溯**：
   - 从数组的每个位置开始，尝试构建子序列；
   - 对于每个位置 `i`，若当前元素大于等于子序列的最后一个元素（保持非递减），则将其加入子序列；
   - 递归处理下一个位置，探索更长的子序列；
   - 回溯时移除最后加入的元素，尝试其他可能的选择。
2. **去重策略**：
   - 在同一层递归中，若遇到与之前处理过的元素相同的元素，跳过该元素（避免生成重复子序列）；
   - 使用临时集合记录当前层已处理的元素，确保每个元素只被考虑一次。
3. **终止条件**：
   - 当子序列长度≥2 时，将其加入结果列表；
   - 当遍历完数组所有元素时，终止递归。

## 代码实现

```
#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    vector<vector<int>> findSubsequences(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> path;
        backtrack(nums, 0, path, result);
        return result;
    }

private:
    /**
     * 递归回溯函数
     * @param nums 原数组
     * @param start 当前开始遍历的索引
     * @param path 当前构建的子序列
     * @param result 结果列表
     */
    void backtrack(vector<int>& nums, int start, vector<int>& path, 
                  vector<vector<int>>& result) {
        // 若当前子序列长度≥2，加入结果
        if (path.size() >= 2) {
            result.push_back(path);
        }

        unordered_set<int> used;  // 记录当前层已使用的元素，用于去重
        // 从start开始遍历，构建子序列
        for (int i = start; i < nums.size(); ++i) {
            // 去重：当前层已使用过该元素，跳过
            if (used.count(nums[i])) {
                continue;
            }
            // 非递减检查：若path非空，当前元素需≥path最后一个元素
            if (!path.empty() && nums[i] < path.back()) {
                continue;
            }

            used.insert(nums[i]);  // 标记当前元素在本层已使用
            path.push_back(nums[i]);  // 加入当前元素
            backtrack(nums, i + 1, path, result);  // 递归处理下一个元素
            path.pop_back();  // 回溯：移除当前元素
        }
    }
};
```