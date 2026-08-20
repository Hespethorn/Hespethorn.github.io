---
title: Leetcode 0034.find-first-and-last-position-of-element-in-sorted-array
tags:
  - leetcode
  - Array
  - Binary Search
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 9a0b1c2d
date: 2024-05-24
---

# [34. Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

## 题目

Given an array of integers `nums` sorted in non-decreasing order, find the starting and ending position of a given `target` value.

If `target` is not found in the array, return `[-1, -1]`.

You must write an algorithm with `O(log n)` runtime complexity.

**Example 1:**

```
Input: nums = [5,7,7,8,8,10], target = 8
Output: [3,4]
```

**Example 2:**

```
Input: nums = [5,7,7,8,8,10], target = 6
Output: [-1,-1]
```

**Example 3:**

```
Input: nums = [], target = 0
Output: [-1,-1]
```

**Constraints:**

- `0 <= nums.length <= 105`
- `-109 <= nums[i] <= 109`
- `nums` is a non-decreasing array.
- `-109 <= target <= 109`

## 题目大意

给你一个按照非递减顺序排列的整数数组 `nums`，和一个目标值 `target`。请你找出给定目标值在数组中的开始位置和结束位置。如果数组中不存在目标值 `target`，返回 `[-1, -1]`。

## 解题思路

### 方法：两次二分查找

#### 思路

这道题需要找到目标值的左右边界，可以使用两次二分查找：

1. 第一次二分查找找到左边界（第一个等于目标值的位置）
2. 第二次二分查找找到右边界（最后一个等于目标值的位置）

对于左边界查找：
- 当 `nums[mid] >= target` 时，收缩右边界
- 当 `nums[mid] < target` 时，扩张左边界

对于右边界查找：
- 当 `nums[mid] <= target` 时，收缩左边界
- 当 `nums[mid] > target` 时，扩张右边界

#### 复杂度分析

- **时间复杂度**：O(log n)，两次二分查找。
- **空间复杂度**：O(1)，只使用常数额外空间。

## 代码实现

```cpp
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int leftBound = findBound(nums, target, true);
        if (leftBound == -1) {
            return {-1, -1};
        }
        int rightBound = findBound(nums, target, false);
        return {leftBound, rightBound};
    }
    
    int findBound(vector<int>& nums, int target, bool isLeft) {
        int left = 0, right = nums.size() - 1;
        int bound = -1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] == target) {
                bound = mid;
                if (isLeft) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return bound;
    }
};
```