---
title: Leetcode 0977. Squares of a Sorted Array
tags:
  - leetcode
  - 双指针
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: 67872dc4
date: 2024-03-19
---

## [977. Squares of a Sorted Array](https://leetcode.com/problems/squares-of-a-sorted-array/)

Given an array of integers A sorted in non-decreasing order, return an array of the squares of each number, also in sorted non-decreasing order.

Example 1:

```c
Input: [-4,-1,0,3,10]
Output: [0,1,9,16,100]
```

Example 2:

```c
Input: [-7,-3,2,3,11]
Output: [4,9,9,49,121]
```

Note:

1. 1 <= A.length <= 10000
2. -10000 <= A[i] <= 10000
3. A is sorted in non-decreasing order.

## 解题思路

这一题由于原数组是有序的，所以要尽量利用这一特点来减少时间复杂度。

最终返回的数组，最后一位，是最大值，这个值应该是由原数组最大值，或者最小值得来的，所以可以从数组的最后一位开始排列最终数组。用 2 个指针分别指向原数组的首尾，分别计算平方值，然后比较两者大小，大的放在最终数组的后面。然后大的一个指针移动。直至两个指针相撞，最终数组就排列完成了。

## 解法1：auto自动遍历，重新排序sort

```
class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        for(auto & it : nums){
            it *= it;
        }
        std::sort(nums.begin(),nums.end());
        return nums;
    }
};
```

## 解法2：双指针

### 实现原理

利用原数组**非递减排序**的特性，采用**双指针法**求解：

1. **关键观察**：
   - 原数组可能包含负数，但其平方后的值的最大值一定出现在数组的两端
   - 平方后的数组需要按非递减排序，因此可以从最大的平方值开始填充结果数组
2. **双指针策略**：
   - 左指针 `i` 从数组开头开始
   - 右指针 `j` 从数组末尾开始
   - 结果指针 `p` 从结果数组末尾开始向前移动
3. **填充逻辑**：
   - 比较左右指针指向元素的平方值
   - 将较大的平方值放入结果指针位置
   - 移动相应的指针（左指针右移或右指针左移）
   - 结果指针向前移动一位

#### 复杂度分析

- **时间复杂度**：O (n)，其中 n 是数组长度。每个元素只需处理一次
- **空间复杂度**：O (n)，需要一个额外的数组存储结果（不计算在原地修改的情况下）

```
class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n);
        int i = 0, j = n - 1;
        for (int p = n - 1; p >= 0; p--) {
            int x = nums[i] * nums[i];
            int y = nums[j] * nums[j];
            if (x > y) {
                ans[p] = x;
                i++;
            } else {
                ans[p] = y;
                j--;
            }
        }
        return ans;
    }
};
```



