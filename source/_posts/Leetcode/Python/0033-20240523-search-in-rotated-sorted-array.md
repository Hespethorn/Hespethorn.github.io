---
title: Leetcode 0033.search-in-rotated-sorted-array(python)
tags:
  - leetcode
  - python
  - Array
  - Binary Search
categories: [Leetcode, Python]
series: Leetcode-Python
abbrlink: 5e6f7a8b
date: 2024-05-23
---

# [33. Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/)

## 题目

There is an integer array `nums` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, `nums` is **possibly rotated** at an unknown pivot index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (**0-indexed**). For example, `[0,1,2,4,5,6,7]` might be rotated at pivot index `3` and become `[4,5,6,7,0,1,2]`.

Given the array `nums` **after** the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.

You must write an algorithm with `O(log n)` runtime complexity.

**Example 1:**

```
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
```

**Example 2:**

```
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1
```

**Example 3:**

```
Input: nums = [1], target = 0
Output: -1
```

**Constraints:**

- `1 <= nums.length <= 5000`
- `-104 <= nums[i] <= 104`
- All values of `nums` are **unique**.
- `nums` is an ascending array that is possibly rotated.
- `-104 <= target <= 104`

## 题目大意

整数数组 `nums` 按升序排列，数组中的值互不相同。在传递给函数之前，`nums` 在预先未知的某个下标 `k` 上进行了旋转，使数组变为 `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]`。给你旋转后的数组 `nums` 和一个整数 `target` ，如果 `nums` 中存在这个目标值 `target` ，则返回它的下标，否则返回 `-1`。

## 解题思路

### 方法：二分查找

#### 思路

这道题的关键在于利用二分查找，每次判断哪一半是有序的，然后根据有序部分决定搜索方向。

1. 如果 `nums[left] <= nums[mid]`，说明左半部分有序
   - 如果 `nums[left] <= target < nums[mid]`，目标在左半部分
   - 否则目标在右半部分

2. 否则右半部分有序
   - 如果 `nums[mid] < target <= nums[right]`，目标在右半部分
   - 否则目标在左半部分

#### 复杂度分析

- **时间复杂度**：O(log n)，每次比较排除一半元素。
- **空间复杂度**：O(1)，只使用常数额外空间。

## 代码实现

```python
from typing import List

class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1
        
        while left <= right:
            mid = left + (right - left) // 2
            
            if nums[mid] == target:
                return mid
            
            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        
        return -1
```