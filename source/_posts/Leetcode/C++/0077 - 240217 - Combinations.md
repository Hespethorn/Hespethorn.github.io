---
title: Leetcode 0077. Combinations
tags:
  - leetcode
categories: [Leetcode, C++]
  - 回溯算法
series: Leetcode-C++
abbrlink: '574072e1'
date: 2023-06-17
---

## [77. Combinations](https://leetcode.cn/problems/combinations/)

Given two integers `n` and `k`, return *all possible combinations of* `k` *numbers chosen from the range* `[1, n]`.

You may return the answer in **any order**.

**Example 1:**

```
Input: n = 4, k = 2
Output: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
Explanation: There are 4 choose 2 = 6 total combinations.
Note that combinations are unordered, i.e., [1,2] and [2,1] are considered to be the same combination.
```

**Example 2:**

```
Input: n = 1, k = 1
Output: [[1]]
Explanation: There is 1 choose 1 = 1 total combination.
```

## 题目大意

给定两个整数 `n` 和 `k`，从范围 `[1, n]` 中选择 `k` 个数字，返回所有可能的组合。组合是**无序**的（例如 `[1,2]` 和 `[2,1]` 视为同一种组合），结果顺序可任意。

例如：

- 输入 `n=4, k=2`，输出 `[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]`（共 6 种组合，即组合数 C (4,2)=6）；
- 输入 `n=1, k=1`，输出 `[[1]]`（仅 1 种组合）。

## 解题思路

该问题的核心是从 `[1, n]` 中选择 `k` 个数字，生成所有可能的无序组合。解题思路基于**递归回溯**和**剪枝优化**，具体如下：

1. **倒序枚举与选 / 不选决策**
   从数字 `n` 开始倒序枚举（从大到小），每个数字有两种选择：
   - **选当前数字**：将其加入临时组合，递归处理下一个更小的数字（确保组合内数字无序且不重复）；
   - **不选当前数字**：直接递归处理下一个更小的数字。
2. **终止条件**
   当临时组合的长度达到 `k` 时，将其加入结果列表，结束当前递归。
3. **剪枝优化**
   若不选当前数字 `i`，需保证剩余数字（`i-1` 个）足够填满组合（还需选 `d` 个，`d = k - 当前组合长度`）。仅当 `i > d` 时（即剩余数字 ≥ 所需数字），才考虑不选 `i`，否则直接跳过（避免无效搜索）。

## 代码实现

```
#include <vector>
using namespace std;

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
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> ans;  // 存储最终结果
        vector<int> path;         // 存储当前正在构建的组合

        // 定义递归lambda函数，使用C++14的泛型lambda实现递归
        // i: 当前考虑的数字（从n倒着往1枚举）
        auto dfs = [&](this auto&& dfs, int i) -> void {
            int d = k - path.size();  // 计算还需要选择的数字数量

            // 终止条件：已经选够k个数字，将当前组合加入结果
            if (d == 0) { 
                ans.emplace_back(path);
                return;
            }

            // 剪枝条件1：不选当前数字i
            // 只有当剩余数字（i-1个）足够选d个时，才考虑不选i
            // i > d 等价于 (i-1) >= d（剩余数字i-1 >= 需要选的d个）
            if (i > d) {
                dfs(i - 1);  // 不选i，递归处理i-1
            }

            // 选择当前数字i
            path.push_back(i);       // 将i加入当前组合
            dfs(i - 1);              // 递归处理i-1（下一个数字只能比i小，避免重复）
            path.pop_back();         // 回溯：移除i，恢复现场，尝试其他选择
        };

        dfs(n);  // 从数字n开始倒序枚举
        return ans;
    }
};
```