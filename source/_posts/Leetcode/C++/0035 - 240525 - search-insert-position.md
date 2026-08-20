---
title: Leetcode 0035.search-insert-position
tags:
  - leetcode
  - Array
  - Binary Search
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 7c8d9e0f
date: 2024-05-25
---

# [35. Search Insert Position](https://leetcode.com/problems/search-insert-position/)

## 题目

Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with `O(log n)` runtime complexity.

**Example 1:**

```
Input: nums = [1,3,5,6], target = 5
Output: 2
```

**Example 2:**

```
Input: nums = [1,3,5,6], target = 2
Output: 1
```

**Example 3:**

```
Input: nums = [1,3,5,6], target = 7
Output: 4
```

**Constraints:**

- `1 <= nums.length <= 104`
- `-104 <= nums[i] <= 104`
- `nums` contains **distinct** values.
- `-104 <= target <= 104`

## 题目大意

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

## 解题思路

### 方法：二分查找

#### 思路

这道题是标准的二分查找问题，需要找到目标值在数组中的位置或插入位置。

使用左闭右开区间 `[left, right)`：
- 如果 `nums[mid] >= target`，目标值在左半部分，收缩右边界
- 如果 `nums[mid] < target`，目标值在右半部分，扩张左边界

最终 `left` 就是目标值的位置或插入位置。

#### 复杂度分析

- **时间复杂度**：O(log n)，每次比较排除一半元素。
- **空间复杂度**：O(1)，只使用常数额外空间。

## 代码实现

```cpp
#include <vector>
using namespace std;

class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        
        while (left < right) {
            int mid = left + (right - left) / 2;
            
            if (nums[mid] >= target) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        
        return left;
    }
};
```