---
title: Leetcode 0704. Binary Search
tags:
  - leetcode
categories:
  - Leetcode
  - 二分查找
series: Leetcode
abbrlink: 34d48a6b
date: 2024-02-18 21:53:00
---

# [704. Binary Search](https://leetcode.cn/problems/binary-search/)


## 题目

Given a **sorted** (in ascending order) integer array `nums` of `n` elements and a `target` value, write a function to search `target` in `nums`. If `target` exists, then return its index, otherwise return `-1`.

**Example 1:**

    Input: nums = [-1,0,3,5,9,12], target = 9
    Output: 4
    Explanation: 9 exists in nums and its index is 4

**Example 2:**

    Input: nums = [-1,0,3,5,9,12], target = 2
    Output: -1
    Explanation: 2 does not exist in nums so return -1

**Note:**

1. You may assume that all elements in `nums` are unique.
2. `n` will be in the range `[1, 10000]`.
3. The value of each element in `nums` will be in the range `[-9999, 9999]`.

## 解法：二分查找算法

```cpp
#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0;
        int right = nums.size() - 1;
        
        // 在[left, right]区间中查找目标值
        while (left <= right) {
            // 计算中间索引，避免(left + right)可能导致的整数溢出
            int mid = left + (right - left) / 2;
            
            if (nums[mid] == target) {
                return mid;  // 找到目标值，返回索引
            } else if (nums[mid] < target) {
                left = mid + 1;  // 目标值在右侧，调整左边界
            } else {
                right = mid - 1;  // 目标值在左侧，调整右边界
            }
        }
        
        // 循环结束仍未找到，返回-1
        return -1;
    }
};
```

## 解法解析

二分查找是一种高效的查找算法，适用于**已排序**的数组。其核心思想是通过不断将搜索区间减半来快速定位目标值：

1. **初始化边界**：设置左指针 `left` 为 0，右指针 `right` 为数组最后一个元素的索引

2. **计算中间位置**：`mid = left + (right - left) / 2`，这种写法比 `(left + right) / 2` 更安全，可避免整数溢出

3. 比较与调整：

   - 若 `nums[mid] == target`，找到目标值，返回 `mid`

   - 若 `nums[mid] < target`，目标值在右侧，将 `left` 调整为 `mid + 1`
   - 若 `nums[mid] > target`，目标值在左侧，将 `right` 调整为 `mid - 1`

4. **循环终止**：当 `left > right` 时，说明搜索区间为空，目标值不存在，返回 `-1`

## 性能分析

| 指标       | 数值     | 说明                                      |
| ---------- | -------- | ----------------------------------------- |
| 时间复杂度 | O(log n) | 每次查找将区间减半，最多需要 log₂n 次比较 |
| 空间复杂度 | O(1)     | 只使用常数级别的额外空间                  |

## 关键注意事项

1. **数组必须有序**：二分查找仅适用于已排序的数组，这是前提条件
2. **边界条件处理**：
   - 循环条件是 `left <= right` 而不是 `left < right`
   - 调整边界时要使用 `mid + 1` 和 `mid - 1`，避免陷入无限循环
3. **整数溢出预防**：使用 `left + (right - left) / 2` 计算中间索引更安全

二分查找是算法中的基础经典算法，不仅可用于数组查找，其思想还可应用于各种需要高效搜索的场景，如寻找旋转排序数组中的最小值、寻找峰值元素等问题。掌握二分查找的边界处理技巧是解决这类问题的关键。