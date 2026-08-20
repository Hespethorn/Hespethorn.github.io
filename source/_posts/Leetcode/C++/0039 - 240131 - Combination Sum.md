---
title: Leetcode 0039. Combination Sum
tags:
  - leetcode
categories: [Leetcode, C++]
  - null
series: Leetcode-Cpp
abbrlink: 1af886ae
date: 2023-04-15
---

## [39. Combination Sum](https://leetcode.cn/problems/combination-sum/)

Given an array of **distinct** integers `candidates` and a target integer `target`, return *a list of all **unique combinations** of* `candidates` *where the chosen numbers sum to* `target`*.* You may return the combinations in **any order**.

The **same** number may be chosen from `candidates` an **unlimited number of times**. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

The test cases are generated such that the number of unique combinations that sum up to `target` is less than `150` combinations for the given input.

**Example 1:**

```
Input: candidates = [2,3,6,7], target = 7
Output: [[2,2,3],[7]]
Explanation:
2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
7 is a candidate, and 7 = 7.
These are the only two combinations.
```

**Example 2:**

```
Input: candidates = [2,3,5], target = 8
Output: [[2,2,2,2],[2,3,3],[3,5]]
```

**Example 3:**

```
Input: candidates = [2], target = 1
Output: []
```

### 题目大意

给定一个无重复元素的整数数组数组 `candidates` 和一个目标整数 `target`，找出 `candidates` 中所有可以使数字和为 `target` 的组合。`candidates` 中的数字可以无限制重复被选取。

说明：

- 所有数字（包括 `target`）都是正整数。
- 解集不能包含重复的组合。

例如：

- 输入 `candidates = [2,3,6,7], target = 7`，输出 `[[2,2,3],[7]]`；
- 输入 `candidates = [2,3,5], target = 8`，输出 `[[2,2,2,2],[2,3,3],[3,5]]`。

### 解题思路

核心思路是**递归回溯 + 剪枝**，通过控制选择顺序避免重复组合：

1. **递归状态定义**
   递归函数 `dfs(i, left)` 表示：
   - `i`：当前考虑的候选数字索引（从 0 开始）；
   - `left`：还需要凑齐的目标和（初始为 `target`，随选择逐步递减）。
2. **核心决策逻辑**
   对每个数字 `candidates[i]`，有两种选择：
   - **不选当前数字**：直接递归处理下一个数字（`dfs(i+1, left)`）；
   - **选当前数字**：将其加入临时组合 `path`，剩余目标和减去该数字，递归处理**当前数字（允许重复选择）**（`dfs(i, left - candidates[i])`），递归结束后回溯（移除数字，恢复现场）。
3. **终止条件**
   - 若 `left == 0`：当前组合的和等于目标，将其加入结果列表；
   - 若 `i == candidates.size()` 或 `left < 0`：已遍历完所有数字，或当前和超过目标，终止递归。
4. **去重原理**
   按索引顺序递归（从 0 到 n-1），确保组合内数字的选择顺序与数组索引一致（例如只可能出现 `[2,3]` 而不会出现 `[3,2]`），自然避免重复组合。

```
class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> ans;
        vector<int> path;

        auto dfs = [&](this auto&& dfs, int i, int left) {
            if (left == 0) {
                // 找到一个合法组合
                ans.push_back(path);
                return;
            }

            if (i == candidates.size() || left < 0) {
                return;
            }

            // 不选
            dfs(i + 1, left);

            // 选
            path.push_back(candidates[i]);
            dfs(i, left - candidates[i]);
            path.pop_back(); // 恢复现场
        };

        dfs(0, target);
        return ans;
    }
};
```