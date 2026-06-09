---
title: Leetcode 0162. Find Peak Element
tags:
  - leetcode
categories:
  - Leetcode
  - 二分查找
series: Leetcode-Cpp
abbrlink: 5783eb6c
date: 2023-10-09 23:07:00
---

------

# [162. Find Peak Element](https://leetcode.com/problems/find-peak-element/)


## 题目

A peak element is an element that is greater than its neighbors.

Given an input array `nums`, where `nums[i] ≠ nums[i+1]`, find a peak element and return its index.

The array may contain multiple peaks, in that case return the index to any one of the peaks is fine.

You may imagine that `nums[-1] = nums[n] = -∞`.

**Example 1:**

    Input: nums = [1,2,3,1]
    Output: 2
    Explanation: 3 is a peak element and your function should return the index number 2.

**Example 2:**

    Input: nums = [1,2,1,3,5,6,4]
    Output: 1 or 5 
    Explanation: Your function can return either index number 1 where the peak element is 2, 
                 or index number 5 where the peak element is 6.

**Note:**

Your solution should be in logarithmic complexity.

## 解法 1：线性扫描法

```
#include <stdio.h>

int findPeakElement(int* nums, int numsSize) {
    // 遍历数组，找到第一个满足峰值条件的元素
    for (int i = 0; i < numsSize - 1; i++) {
        // 当前元素大于下一个元素，说明当前元素是峰值
        if (nums[i] > nums[i + 1]) {
            return i;
        }
    }
    // 如果所有元素都递增，则最后一个元素是峰值
    return numsSize - 1;
}

int main() {
    int nums1[] = {1, 2, 3, 1};
    int size1 = sizeof(nums1) / sizeof(nums1[0]);
    printf("峰值索引: %d\n", findPeakElement(nums1, size1));  // 输出: 2
    
    int nums2[] = {1, 2, 1, 3, 5, 6, 4};
    int size2 = sizeof(nums2) / sizeof(nums2[0]);
    printf("峰值索引: %d\n", findPeakElement(nums2, size2));  // 输出: 1
    
    return 0;
}
```

## 解法 1 解析

线性扫描法的思路非常直观：

- 遍历数组中的每个元素，找到第一个满足nums[i] > nums[i+1]的元素

- 因为题目假设nums[-1] = nums[n] = -∞，所以数组的第一个元素只需要大于第二个元素就是峰值，最后一个元素只需要大于倒数第二个元素就是峰值

- 如果数组是严格递增的，那么最后一个元素就是峰值

这种方法的时间复杂度是 O (n)，空间复杂度是 O (1)。虽然它能正确解决问题，但不符合题目要求的 O (logN) 时间复杂度，因此我们需要更高效的算法。

## 解法 2：二分查找法

```
#include <stdio.h>

int findPeakElement(int* nums, int numsSize) {
    int left = 0;
    int right = numsSize - 1;
    
    // 二分查找
    while (left < right) {
        int mid = left + (right - left) / 2;  // 避免整数溢出
        
        // 中间元素小于右侧元素，说明峰值在右侧
        if (nums[mid] < nums[mid + 1]) {
            left = mid + 1;
        } 
        // 中间元素大于右侧元素，说明峰值在左侧(包括当前元素)
        else {
            right = mid;
        }
    }
    
    // 循环结束时left == right，即为峰值索引
    return left;
}

int main() {
    int nums1[] = {1, 2, 3, 1};
    int size1 = sizeof(nums1) / sizeof(nums1[0]);
    printf("峰值索引: %d\n", findPeakElement(nums1, size1));  // 输出: 2
    
    int nums2[] = {1, 2, 1, 3, 5, 6, 4};
    int size2 = sizeof(nums2) / sizeof(nums2[0]);
    printf("峰值索引: %d\n", findPeakElement(nums2, size2));  // 输出: 5
    
    return 0;
}
```

## 解法 2 解析

二分查找法利用了题目中的关键性质：只要数组中存在一个元素比它的邻居大，那么沿着该方向一定存在一个峰值。

算法步骤：

- 初始化左右指针 left=0，right=numsSize-1
- 当 left < right 时，计算中间索引 mid
- 如果 nums [mid] < nums [mid+1]，说明右侧一定存在峰值，将 left 更新为 mid+1
- 否则，说明左侧 (包括当前元素) 一定存在峰值，将 right 更新为 mid
- 当 left == right 时，找到峰值索引

为什么这种方法有效？

- 因为题目中nums[i] ≠ nums[i+1]，保证了不会有平坡

- 当 nums [mid] < nums [mid+1] 时，向右移动，因为右侧呈上升趋势，必然存在峰值

- 当 nums [mid] > nums [mid+1] 时，向左移动，因为当前位置可能就是峰值或左侧存在峰值

这种方法的时间复杂度是 O (logN)，空间复杂度是 O (1)，完全满足题目的要求。

## 性能对比

| 解法类型 | 时间复杂度 | 空间复杂度 | 优点                     | 缺点                           |
| -------- | ---------- | ---------- | ------------------------ | ------------------------------ |
| 线性扫描 | O(n)       | O(1)       | 实现简单，直观易懂       | 时间复杂度较高，不适合大数据量 |
| 二分查找 | O(logN)    | O(1)       | 时间效率高，适合大数据量 | 逻辑稍复杂，需要理解二分条件   |

在 LeetCode 的测试用例中，二分查找法的性能明显优于线性扫描法，特别是当数组规模较大时，差距更为明显。

### 峰值问题的本质理解

峰值元素问题看似简单，但蕴含着重要的算法设计思想。该问题的关键 insight 是：在满足nums[i] ≠ nums[i+1]的条件下，数组中必然存在至少一个峰值。

这个结论可以通过反证法证明：如果数组中没有峰值，那么元素应该一直递增，但最后一个元素的右侧是 -∞，所以最后一个元素必然是峰值，矛盾。

### 二分查找的适用场景扩展

通常我们认为二分查找只适用于有序数组，但峰值元素问题展示了二分查找的另一种应用场景：只要能通过比较中间元素与相邻元素的大小，确定搜索方向，就能使用二分查找。

这种 "局部有序" 或 "存在明确搜索方向" 的问题，都可以考虑使用二分查找优化时间复杂度，例如：

- 寻找旋转排序数组中的最小值

- 山脉数组中查找目标值

- 寻找数组中的峰值

### 算法扩展思考

**寻找所有峰值元素**

如果题目要求找出所有峰值元素，二分查找法就不再适用，此时需要使用线性扫描法，时间复杂度为 O (n)。

**二维峰值元素**

在二维矩阵中寻找峰值元素（该元素大于其上下左右四个方向的元素），可以将二分查找的思想扩展到二维，但实现更为复杂。

**允许 nums [i] == nums [i+1] 的情况**

这种情况下问题会变得更复杂，需要额外的逻辑处理平坡情况，可能需要后退一步或使用其他策略确定搜索方向。

峰值元素问题展示了如何将一个看似需要线性时间的问题优化到对数时间，体现了算法设计中 "寻找问题特性并加以利用" 的核心思想。掌握这种思维方式，对于解决更复杂的算法问题非常有帮助。

