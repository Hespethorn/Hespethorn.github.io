---

title: Leetcode 0611. Valid Triangle Number
tags:
  - leetcode
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 7048cf13
date: 2024-02-06

---

## [611. Valid Triangle Number](https://leetcode.cn/problems/valid-triangle-number/)

Given an integer array `nums`, return *the number of triplets chosen from the array that can make triangles if we take them as side lengths of a triangle*.

**Example 1:**

```
Input: nums = [2,2,3,4]
Output: 3
Explanation: Valid combinations are: 
2,3,4 (using the first 2)
2,3,4 (using the second 2)
2,2,3
```

**Example 2:**

```
Input: nums = [4,2,3,4]
Output: 4
```

## 题目大意

给定一个整数数组 `nums`，返回数组中可作为三角形三条边长度的三元组数量。三角形三条边需满足：任意两边之和大于第三边。

## 核心解题思路：排序 + 双指针

三角形三边的核心条件是：**两边之和大于第三边**。对于排序后的数组，可简化为：

- 设三条边为 `a ≤ b ≤ c`，则只需满足 `a + b > c`（因 `a + c > b` 和 `b + c > a` 必然成立）。

```
#include <vector>
#include <algorithm> // 用于std::sort，C++11支持
using namespace std;

class Solution {
public:
    int triangleNumber(vector<int>& nums) {
        int n = nums.size();
        int ans = 0;
        // 使用C++11支持的std::sort替代ranges::sort
        sort(nums.begin(), nums.end());
        
        // 从最大元素开始，依次作为最长边c
        for(int i = n - 1; i >= 2; --i) {
            int c = nums[i];  // 当前最长边
            
            // 优化1：如果最小的两个元素之和都大于c，说明所有组合都有效
            if(nums[0] + nums[1] > c) {
                // 计算从i+1个元素中选3个的组合数
                ans += (i + 1) * i * (i - 1) / 6;
                break;  // 无需再检查更小的c，直接终止循环
            }
            
            // 优化2：如果与c最接近的两个较小元素之和都不大于c，说明无有效组合
            if(nums[i - 2] + nums[i - 1] <= c)
                continue;  // 跳过当前c
            
            // 双指针查找有效组合
            int l = 0, r = i - 1;
            while(l < r) {
                if(nums[l] + nums[r] > c) {
                    // 所有[l, r-1]与r的组合都有效
                    ans += r - l;
                    --r;  // 尝试更小的r
                } else {
                    ++l;  // 两数之和不够，增大l
                }
            }
        }
        return ans;
    }
};
```