---
title: Leetcode 0053. Maximum Subarray
tags:
  - leetcode
categories:
  - Leetcode
  - 贪心算法
series: Leetcode
abbrlink: 3465f1c0
date: 2025-04-22 21:35:02
---

## [53. Maximum Subarray](https://leetcode.cn/problems/maximum-subarray/)

Given an integer array `nums`, find the subarray with the largest sum, and return *its sum*.

**Example 1:**

```
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
```

**Example 2:**

```
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
```

**Example 3:**

```
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.
```

## 题目大意

给定一个整数数组 `nums`，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

例如：

- 输入 `nums = [-2,1,-3,4,-1,2,1,-5,4]`，输出 `6`（对应子数组 `[4,-1,2,1]`）；
- 输入 `nums = [1]`，输出 `1`（唯一子数组 `[1]`）。

## 解题思路

核心思路是**动态规划**（Kadane 算法），通过遍历数组并实时计算 “以当前元素结尾的最大子数组和”，从而高效找到全局最大和：

1. **状态定义**：
   设 `dp[i]` 表示以 `nums[i]` 结尾的最大子数组和，则有两种选择：
   - 将 `nums[i]` 加入前一个子数组：`dp[i] = dp[i-1] + nums[i]`；
   - 以 `nums[i]` 为起点重新开始子数组：`dp[i] = nums[i]`。
     因此状态转移方程为：`dp[i] = max(nums[i], dp[i-1] + nums[i])`。
2. **空间优化**：
   由于 `dp[i]` 仅依赖 `dp[i-1]`，无需存储整个 `dp` 数组，只需用一个变量 `current_sum` 记录上一个状态，将空间复杂度从 O (n) 降至 O (1)。
3. **全局最大值跟踪**：
   遍历过程中，用 `max_sum` 记录所有 `current_sum` 中的最大值，即为结果。

## 代码实现

```
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int max_sum = INT_MIN;  // 全局最大和（初始化为最小整数）
        int current_sum = 0;    // 当前以nums[i]结尾的最大子数组和
        
        for (int num : nums) {
            // 决策：继续前一个子数组或重新开始
            current_sum = max(num, current_sum + num);
            // 更新全局最大和
            max_sum = max(max_sum, current_sum);
        }
        
        return max_sum;
    }
};
```