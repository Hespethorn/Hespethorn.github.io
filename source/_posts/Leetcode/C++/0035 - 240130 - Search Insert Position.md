---
title: Leetcode 0035. Search Insert Position
tags:
  - leetcode
  - 二分查找
categories:
  - Leetcode
  - 二分查找
series: Leetcode
abbrlink: 611ef203
date: 2023-04-12 21:43:00
---

# [35. Search Insert Position](https://leetcode.cn/problems/search-insert-position/)

## 题目

Given a sorted array and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You may assume no duplicates in the array.

**Example 1:**

```
Input: [1,3,5,6], 5
Output: 2
```

**Example 2:**

```
Input: [1,3,5,6], 2
Output: 1
```

**Example 3:**

```
Input: [1,3,5,6], 7
Output: 4
```

**Example 4:**

```
Input: [1,3,5,6], 0
Output: 0
```

## 题目大意

给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

你可以假设数组中无重复元素。

## 核心思路

问题本质上是要找到**第一个大于等于目标值**的位置：

- 如果目标值存在于数组中，这个位置就是目标值的索引
- 如果目标值不存在，这个位置就是它应该插入的位置

## 算法步骤

1. 初始化左右指针：`left = 0`，`right = nums.size()`（使用左闭右开区间 [left, right)）
2. 计算中间位置`mid`，避免使用`(left + right) / 2`以防整数溢出
3. 比较中间值与目标值：
   - 若`nums[mid] < target`，说明目标值应在右侧，调整`left = mid + 1`
   - 否则，说明目标值应在左侧（包括当前位置），调整`right = mid`
4. 当`left == right`时，循环结束，此时`left`就是目标位置


  ```
  #include <vector>
  using namespace std;
  
  class Solution {
  public:
      /**
       * 搜索目标值在排序数组中的插入位置
       * @param nums 升序排列的整数数组
       * @param target 目标值
       * @return 目标值存在则返回索引，否则返回插入位置
       */
      int searchInsert(vector<int>& nums, int target) {
          int left = 0;
          int right = nums.size();  // 右边界初始化为数组长度，使搜索区间为[left, right)
          
          // 二分查找：在[left, right)区间中寻找插入位置
          while (left < right) {
              // 计算中间位置，避免(left + right)可能的整数溢出
              int mid = left + (right - left) / 2;
              
              if (nums[mid] < target) {
                  // 中间值小于目标值，目标值应在右侧
                  left = mid + 1;
              } else {
                  // 中间值大于等于目标值，目标值应在左侧（包括当前位置）
                  right = mid;
              }
          }
          
          // 循环结束时，left == right，即为插入位置
          return left;
      }
  };
  ```

  