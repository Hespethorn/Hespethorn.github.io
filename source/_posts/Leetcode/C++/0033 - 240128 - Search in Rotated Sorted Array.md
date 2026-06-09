---
title: Leetcode 0033. Search in Rotated Sorted Array
tags:
  - leetcode
  - 二分查找
categories:
  - Leetcode
  - 二分查找
series: Leetcode-Cpp
abbrlink: a491ad2e
date: 2023-04-06
---

# [33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

## 题目

Suppose an array sorted in ascending order is rotated at some pivot unknown to you beforehand.

(i.e., `[0,1,2,4,5,6,7]` might become `[4,5,6,7,0,1,2]`).

You are given a target value to search. If found in the array return its index, otherwise return `-1`.

You may assume no duplicate exists in the array.

Your algorithm's runtime complexity must be in the order of *O*(log *n*).

**Example 1:**

    Input: nums = [4,5,6,7,0,1,2], target = 0
    Output: 4

**Example 2:**

    Input: nums = [4,5,6,7,0,1,2], target = 3
    Output: -1


## 题目大意

假设按照升序排序的数组在预先未知的某个点上进行了旋转。( 例如，数组 [0,1,2,4,5,6,7] 可能变为 [4,5,6,7,0,1,2] )。搜索一个给定的目标值，如果数组中存在这个目标值，则返回它的索引，否则返回 -1 。你可以假设数组中不存在重复的元素。

### 解法一：二分查找法

这种方法充分利用了旋转排序数组的特性，通过两次二分查找高效定位目标值：

```cpp
class Solution {
    // 找到旋转点（最小值位置）
    int findMIN(vector<int>& nums){
        int left = -1, right = nums.size() - 1;
        while(left + 1 < right){
            int mid = left + (right - left) / 2;
            if(nums[mid] < nums.back()){
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }

    // 在指定区间内二分查找目标值
    int find_target(vector<int>& nums, int left, int right, int target){
        while(left + 1 < right){
            int mid = left + (right - left) / 2;
            if(nums[mid] >= target){
                right = mid;
            } else {
                left = mid;
            }
        }
        return nums[right] == target ? right : -1;
    }

public:
    int search(vector<int>& nums, int target) {
        int minIndex = findMIN(nums);
        
        if(target > nums.back()){
            return find_target(nums, -1, minIndex, target);
        } else {
            return find_target(nums, minIndex - 1, nums.size(), target);
        }
    }
};
```

### 解法二：哈希表法

这种方法忽略数组的排序特性，使用空间换时间的策略：

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        
        // 构建元素到索引的映射
        for(int i = 0; i < nums.size(); i++){
            mp[nums[i]] = i;
        }
        
        // 查找目标值
        if(mp.find(target) == mp.end()){
            return -1;
        } else {
            return mp[target];
        }
    }
};
```

## 核心思想对比

### 二分查找法

二分查找法的核心思想是**利用旋转排序数组的特性，将问题分解为两个子问题**：

1. 旋转排序数组的特性：数组从旋转点分为两个升序部分，且左侧部分所有元素都大于右侧部分
2. 利用二分查找高效定位旋转点和目标值，整体时间复杂度为 O (log n)
3. 使用左闭右开的区间处理方式，简化了边界条件判断

这种方法充分利用了数组 "局部有序" 的特性，通过分治策略不断缩小搜索范围。

### 哈希表法

哈希表法的核心思想是**空间换时间**：

1. 首先遍历数组，构建元素值到索引的映射关系
2. 然后直接通过哈希表查找目标值对应的索引

这种方法完全忽略了数组的排序特性，将问题转化为一个简单的键值查找问题。

## 性能对比

| 指标       | 二分查找法         | 哈希表法                  |
| ---------- | ------------------ | ------------------------- |
| 时间复杂度 | O(log n)           | O(n)                      |
| 空间复杂度 | O(1)               | O(n)                      |
| 预处理     | 无                 | 需要 O (n) 时间构建哈希表 |
| 单次查询   | O(log n)           | O(1)                      |
| 多次查询   | 每次都是 O (log n) | 首次 O (n)，后续 O (1)    |

