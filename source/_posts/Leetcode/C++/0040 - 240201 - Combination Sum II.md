---
title: Leetcode 0040. Combination Sum II
tags:
  - leetcode
categories: [Leetcode, C++]
  - 回溯算法
series: Leetcode-Cpp
abbrlink: 3b1f13b1
date: 2023-04-19
---

## [40. Combination Sum II](https://leetcode.cn/problems/combination-sum-ii/)

Given a collection of candidate numbers (`candidates`) and a target number (`target`), find all unique combinations in `candidates` where the candidate numbers sum to `target`.

Each number in `candidates` may only be used **once** in the combination.

**Note:** The solution set must not contain duplicate combinations.

 **Example 1:**

```
Input: candidates = [10,1,2,7,6,1,5], target = 8
Output: 
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]
```

**Example 2:**

```
Input: candidates = [2,5,2,1,2], target = 5
Output: 
[
[1,2,2],
[5]
]
```

## 题目大意

给定一个可能包含重复元素的整数数组 `candidates` 和一个目标整数 `target`，找出所有不重复的组合，使得组合中数字的和等于 `target`。数组中的每个数字只能使用一次，且解集不能包含重复的组合。

例如：

- 输入 `candidates = [10,1,2,7,6,1,5], target = 8`，输出 `[[1,1,6],[1,2,5],[1,7],[2,6]]`
- 输入 `candidates = [2,5,2,1,2], target = 5`，输出 `[[1,2,2],[5]]`

## 解题思路

核心思路是**递归回溯 + 排序去重**，在允许重复元素的数组中寻找符合条件的组合：

1. **排序预处理**：先对 `candidates` 排序，使相同元素相邻，为后续去重做准备。
2. **递归回溯**：
   - 每次从当前位置开始选择数字（避免组合内元素重复使用）；
   - 选择数字后，目标和减去该数字，递归处理下一个位置（数字不能重复使用）；
   - 递归结束后回溯（移除最后选择的数字），尝试其他数字。
3. **去重关键**：
   - 当遇到与前一个元素相同的数字时，若前一个元素未被选择，则跳过当前数字（避免重复组合）。
4. **终止条件**：
   - 若剩余目标和为 0，将当前组合加入结果；
   - 若剩余目标和小于 0，终止当前递归（剪枝）。

## 代码实现

```
class Solution {
public:
    vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
        vector<vector<int>> ans;
        vector<int> path;
        // 排序，使相同元素相邻，便于去重
        sort(candidates.begin(), candidates.end());
        backtrack(candidates, target, 0, path, ans);
        return ans;
    }

private:
    void backtrack(vector<int>& candidates, int target, int start, 
                  vector<int>& path, vector<vector<int>>& ans) {
        // 找到符合条件的组合
        if (target == 0) {
            ans.push_back(path);
            return;
        }

        for (int i = start; i < candidates.size(); ++i) {
            // 剪枝：当前数字大于剩余目标和，后续数字更大，无需继续
            if (candidates[i] > target) {
                break;
            }

            // 去重：相同元素跳过（确保相同元素只在第一个位置被选择）
            if (i > start && candidates[i] == candidates[i-1]) {
                continue;
            }

            // 选择当前数字
            path.push_back(candidates[i]);
            // 递归：目标和减去当前数字，下一个数字从i+1开始（不能重复使用）
            backtrack(candidates, target - candidates[i], i + 1, path, ans);
            // 回溯：移除当前数字
            path.pop_back();
        }
    }
};
```