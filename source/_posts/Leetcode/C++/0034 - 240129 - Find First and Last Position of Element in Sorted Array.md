---
title: Leetcode 0034. Find First and Last Position of Element in Sorted Array
tags:
  - leetcode
  - 二分查找
categories:
  - Leetcode
  - 二分查找
series: Leetcode
abbrlink: f2c6559a
date: 2023-04-08 22:35:00
---

# [34. Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)


## 题目

Given an array of integers `nums` sorted in ascending order, find the starting and ending position of a given `target` value.

Your algorithm's runtime complexity must be in the order of *O*(log *n*).

If the target is not found in the array, return `[-1, -1]`.

**Example 1:**

    Input: nums = [5,7,7,8,8,10], target = 8
    Output: [3,4]

**Example 2:**

    Input: nums = [5,7,7,8,8,10], target = 6
    Output: [-1,-1]
**查找第一个出现的位置**：

- 当找到目标值时，不立即返回，而是继续向左查找（right = mid - 1）
用一个变量记录当前找到的位置，最终得到的就是第一个出现的位置

**查找最后一个出现的位置**：

 - 当找到目标值时，不立即返回，而是继续向右查找（left = mid + 1）
    同样用变量记录位置，最终得到的就是最后一个出现的位置

**边界处理**：

- 如果第一个位置查找结果为 - 1，说明目标值不存在，直接返回 [-1, -1]
  处理空数组的情况

```
#include <vector>
using namespace std;

class Solution {
public:
    /**
     * 在排序数组中查找目标值的第一个和最后一个位置
     * @param nums 升序排列的整数数组
     * @param target 要查找的目标值
     * @return 包含起始位置和结束位置的向量，未找到则返回[-1, -1]
     */
    vector<int> searchRange(vector<int>& nums, int target) {
        // 查找左边界：第一个大于等于target的位置
        int leftBound = findBound(nums, target, true);
        
        // 检查目标值是否存在于数组中
        // 两种情况表示不存在：1.左边界超出数组范围 2.左边界位置的值不等于target
        if (leftBound == nums.size() || nums[leftBound] != target) {
            return {-1, -1};
        }
        
        // 查找右边界：第一个大于target的位置，减1即为最后一个等于target的位置
        int rightBound = findBound(nums, target, false) - 1;
        
        return {leftBound, rightBound};
    }
    
private:
    /**
     * 通用的边界查找函数，使用二分查找高效定位边界
     * @param nums 升序排列的整数数组
     * @param target 要查找的目标值
     * @param isLeft 标志位：true表示查找左边界，false表示查找右边界
     * @return 左边界返回第一个>=target的位置，右边界返回第一个>target的位置
     */
    int findBound(vector<int>& nums, int target, bool isLeft) {
        int left = 0;
        // 右指针初始化为数组长度，使搜索区间为[left, right)左闭右开
        // 这样可以统一处理数组最后一个元素的情况
        int right = nums.size();
        
        // 循环条件：left < right，当left == right时循环结束
        // 此时left即为我们要找的边界位置
        while (left < right) {
            // 计算中间位置，使用这种写法避免(left + right)可能导致的整数溢出
            int mid = left + (right - left) / 2;
            
            // 确定搜索方向：
            // 1. 当nums[mid] > target时，无论查找哪个边界，都需要向左收缩
            // 2. 当nums[mid] == target时，若查找左边界则向左收缩，查找右边界则向右收缩
            if (nums[mid] > target || (isLeft && nums[mid] == target)) {
                right = mid;  // 向左收缩，新的搜索区间为[left, mid)
            } else {
                left = mid + 1;  // 向右收缩，新的搜索区间为[mid+1, right)
            }
        }
        
        // 循环结束时，left == right，返回该位置作为边界
        return left;
    }
};
```

