---
title: Leetcode 0209. Minimum Size Subarray Sum
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: e9a158c2
date: 2023-10-27
---

## [209. Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/)

## 题目

Given an array of n positive integers and a positive integer s, find the minimal length of a contiguous subarray of which the sum ≥ s. If there isn't one, return 0 instead.

Example 1:

```c
Input: s = 7, nums = [2,3,1,2,4,3]
Output: 2
Explanation: the subarray [4,3] has the minimal length under the problem constraint.
```

Follow up:       

If you have figured out the O(n) solution, try coding another solution of which the time complexity is O(n log n). 

## 解题思路

这一题的解题思路是用滑动窗口。在滑动窗口 [i,j]之间不断往后移动，如果总和小于 s，就扩大右边界 j，不断加入右边的值，直到 sum > s，之和再缩小 i 的左边界，不断缩小直到 sum < s，这时候右边界又可以往右移动。以此类推。

### 解法1：滑动窗口

```cpp
#include <vector>
#include <climits> // 用于INT_MAX
using namespace std;

class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size();
        int left = 0;       // 窗口左边界
        int sum = 0;        // 当前窗口的总和
        int min_len = INT_MAX; // 最小长度，初始化为最大值
        
        for (int right = 0; right < n; ++right) {
            sum += nums[right]; // 扩大窗口右边界
            
            // 当窗口总和满足条件时，尝试缩小左边界
            while (sum >= target) {
                // 更新最小长度
                int current_len = right - left + 1;
                if (current_len < min_len) {
                    min_len = current_len;
                }
                // 缩小左边界
                sum -= nums[left];
                left++;
            }
        }
        
        // 如果min_len仍为初始值，说明没有找到符合条件的子数组
        return min_len == INT_MAX ? 0 : min_len;
    }
};
```

1. **初始化**：
   - `left`指针起始位置为 0
   - `sum`用于累计当前窗口的元素和
   - `min_len`初始化为`INT_MAX`，用于记录最小长度
2. **扩大窗口**：
   - `right`指针从 0 开始遍历数组
   - 每次将`nums[right]`加入`sum`
3. **缩小窗口**：
   - 当`sum >= target`时，进入循环尝试缩小窗口
   - 计算当前窗口长度并更新`min_len`
   - 从`sum`中减去`nums[left]`并将`left`右移，缩小窗口
4. **结果处理**：
   - 如果`min_len`仍为`INT_MAX`，说明没有找到符合条件的子数组，返回 0
   - 否则返回`min_len`

#### 复杂度分析

- **时间复杂度**：O (n)，其中 n 是数组长度。每个元素最多被`left`和`right`指针访问一次
- **空间复杂度**：O (1)，只使用了常数个额外变量

### 解法2：滑动窗口优化

```
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int n = nums.size(),i = 0,xiao = INT_MAX,s = 0;
        for(int j = 0;j<n;j++)
        {
            s += nums[j];
            for(;s >= target;)
            {
                xiao = min(xiao,j - i + 1);
                s -= nums[i];
                i++;
            }
        }
        return xiao == INT_MAX ? 0 : xiao;
    }
};
```

#### 核心逻辑解析

1. **变量定义**：
   - `i`：窗口左边界
   - `j`：窗口右边界
   - `s`：当前窗口的元素总和
   - `xiao`：记录最小子数组长度，初始化为`INT_MAX`
2. **算法流程**：
   - 外层循环移动右边界`j`，不断扩大窗口并累加总和`s`
   - 当`s >= target`时，进入内层循环尝试缩小左边界
   - 每次缩小左边界时更新最小长度，并调整总和`s`
   - 最终根据`xiao`的值判断是否存在符合条件的子数组