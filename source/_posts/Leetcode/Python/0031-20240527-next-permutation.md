---
title: Leetcode 0031.next-permutation(python)
tags:
  - leetcode
  - python
  - Array
  - Two Pointers
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 9a5b3c2d
date: 2024-05-27
---

# [31. Next Permutation](https://leetcode.com/problems/next-permutation/)

## 题目

A permutation of an array of integers is an arrangement of its members into a sequence or linear order.

For example, for `arr = [1,2,3]`, the following are all the permutations of `arr`: `[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]`.

The **next permutation** of an array of integers is the next lexicographically greater permutation of its integer. More formally, if all the permutations of the array are sorted in one container according to their lexicographical order, then the **next permutation** of that array is the permutation that follows it in the sorted container. If such arrangement is not possible, the array must be rearranged as the lowest possible order (i.e., sorted in ascending order).

For example, the next permutation of `arr = [1,2,3]` is `[1,3,2]`.
Similarly, the next permutation of `arr = [2,3,1]` is `[3,1,2]`.
While the next permutation of `arr = [3,2,1]` is `[1,2,3]` because `[3,2,1]` does not have a lexicographical larger rearrangement.

Given an array of integers `nums`, find the next permutation of `nums`.

The replacement must be **in place** and use only constant extra memory.

**Example 1:**

```
Input: nums = [1,2,3]
Output: [1,3,2]
```

**Example 2:**

```
Input: nums = [3,2,1]
Output: [1,2,3]
```

**Example 3:**

```
Input: nums = [1,1,5]
Output: [1,5,1]
```

## 题目大意

找到数组的下一个字典序排列。如果当前已经是最大的排列（降序），则将其重新排列为最小的排列（升序）。要求原地修改，只使用常数级别的额外空间。

## 解题思路

### 方法：两指针法

#### 思路

下一个排列算法的核心思想是：找到第一个可以增大的位置，然后找到右侧比它大的最小元素进行交换，最后将右侧部分反转成升序。

具体步骤：
1. **从右向左找第一个降序位置**：找到 `i` 使得 `nums[i] < nums[i+1]`，这个位置就是可以增大的位置。
2. **从右向左找第一个比 nums[i] 大的元素**：找到 `j` 使得 `nums[j] > nums[i]`，交换 `nums[i]` 和 `nums[j]`。
3. **反转右侧部分**：将 `nums[i+1...n-1]` 反转，使其成为最小的排列。

#### 复杂度分析

- **时间复杂度**：O(n)，其中 `n` 是数组长度。两次扫描和一次反转都是 O(n)。
- **空间复杂度**：O(1)，仅使用常数额外空间。

## 代码实现

### 两指针法

```python
from typing import List

class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        n = len(nums)
        i = n - 2
        
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        
        if i >= 0:
            j = n - 1
            while nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        
        left, right = i + 1, n - 1
        while left < right:
            nums[left], nums[right] = nums[right], nums[left]
            left += 1
            right -= 1
```