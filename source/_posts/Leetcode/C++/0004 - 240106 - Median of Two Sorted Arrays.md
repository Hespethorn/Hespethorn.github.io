---
title: Leetcode 0004. Median of Two Sorted Arrays
tags:
  - leetcode
  - 二分查找
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: bde3b15b
date: 2023-01-13
---



# [4. Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/)


## 题目

There are two sorted arrays **nums1** and **nums2** of size m and n respectively.

Find the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).

You may assume **nums1** and **nums2** cannot be both empty.

**Example 1:**

    nums1 = [1, 3]
    nums2 = [2]
    
    The median is 2.0

**Example 2:**

    nums1 = [1, 2]
    nums2 = [3, 4]
    
    The median is (2 + 3)/2 = 2.5


## 题目大意


给定两个大小为 m 和 n 的有序数组 nums1 和 nums2。

请你找出这两个有序数组的中位数，并且要求算法的时间复杂度为 O(log(m + n))。

你可以假设 nums1 和 nums2 不会同时为空。

## 解题思路

要找出两个有序数组合并后的中位数且时间复杂度为 O(log(m+n))，可采用二分搜索法，步骤如下：

1. **核心思路**：利用中位数在合并数组中的位置固定性，通过二分搜索较短数组确定切分位置，另一数组的切分位置可相应算出，以此避免全合并（O(m+n)复杂度）。
2. **切分逻辑**：对较短数组二分得到切分点 `midA`，另一数组切分点 `midB` 由总长度推导。需满足切分线左侧数均小于右侧数，即 `nums1[midA-1] ≤ nums2[midB] 且 nums2[midB-1] ≤ nums1[midA]`。
3. **调整切分**：若 `nums1[midA] < nums2[midB-1]`，切分线右移；若 `nums1[midA-1] > nums2[midB]`，切分线左移，直至找到合适位置。
4. **计算中位数**：
   - 合并后长度为奇数：中位数是 `max(nums1[midA-1], nums2[midB-1])`。
   - 长度为偶数：中位数是 `(max(nums1[midA-1], nums2[midB-1]) + min(nums1[midA], nums2[midB])) / 2`。

### 方法一：暴力合并（基础思路）

**思路**

- **合并数组**：直接将两个有序数组合并为一个新的有序数组。
- **计算中位数**：根据合并后数组的长度奇偶性，计算中位数

**复杂度分析**

- **时间复杂度**：*O*(*m*+*n*)，需要遍历两个数组的所有元素。
- **空间复杂度**：*O*(*m*+*n*)，需要额外的数组存储合并结果。

### 方法二：二分查找法（优化核心）

#### 思路

- 通过二分查找在较短的数组上确定分割点，使得两个数组的左半部分元素总数等于右半部分（或多一个），并且满足左半部分所有元素均小于等于右半部分的元素。
- **确保短数组优先**：令 `nums1` 为较短的数组，减少二分查找的范围。
- **计算分割点**：通过二分查找在 `nums1` 上确定分割点 `i`，并计算 `nums2` 上的对应分割点 `j`。
- **调整条件**：确保 `nums1[i-1] ≤ nums2[j]` 且 `nums2[j-1] ≤ nums1[i]`，即左半部分的最大值不超过右半部分的最小值。
- **处理边界**：当分割点位于数组端点时，使用 `INT_MIN` 或 `INT_MAX` 作为边界值。

#### 复杂度分析

- **时间复杂度**：*O*(log(min(*m*,*n*)))，通过二分查找在较短数组上快速定位分割点。
- **空间复杂度**：*O*(1)，仅使用常数级额外空间。
- **边界处理**：使用 `INT_MIN` 和 `INT_MAX` 处理分割点在数组端点的情况，避免复杂的条件判断。

### 方法三：双指针法（进阶优化）

#### 思路

- 通过双指针遍历两个数组，直接找到中位数位置，无需合并整个数组。
- **计算目标位置**：根据总长度确定中位数所在的位置 `k`。
- **指针移动**：每次比较两个数组当前指针的值，移动较小值的指针，直到找到第 `k` 小的元素。

#### 复杂度分析

- **时间复杂度**：*O*(*k*)，其中 *k*=(*m*+*n*+1)/2，最坏情况下需要遍历一半元素。
- **空间复杂度**：*O*(1)，仅使用常数级额外空间。



## 代码实现

{% tabs Longest Substring Without Repeating Characters %}

<!-- tab 暴力合并 -->

```c
double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    int totalSize = nums1Size + nums2Size;
    int* merged = (int*)malloc(totalSize * sizeof(int));
    int i = 0, j = 0, k = 0;
    
    // 合并两个有序数组
    while (i < nums1Size && j < nums2Size) {
        merged[k++] = (nums1[i] < nums2[j]) ? nums1[i++] : nums2[j++];
    }
    while (i < nums1Size) merged[k++] = nums1[i++];
    while (j < nums2Size) merged[k++] = nums2[j++];
    
    // 计算中位数
    double median;
    if (totalSize % 2 == 1) {
        median = (double)merged[totalSize / 2];
    } else {
        median = (double)(merged[totalSize / 2 - 1] + merged[totalSize / 2]) / 2.0;
    }
    
    free(merged);
    return median;
}
```

<!-- endtab -->

<!-- tab 二分查找 -->

```c
#include <stdio.h>
#include <limits.h>

// 比较两个整数的最大值
int max(int a, int b) {
    return a > b ? a : b;
}

// 比较两个整数的最小值
int min(int a, int b) {
    return a < b ? a : b;
}

double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    // 确保对较短的数组进行二分查找，优化时间复杂度
    if (nums1Size > nums2Size) {
        return findMedianSortedArrays(nums2, nums2Size, nums1, nums1Size);
    }
    
    int m = nums1Size;
    int n = nums2Size;
    int left = 0;          // 二分查找的左边界
    int right = m;         // 二分查找的右边界（取m而非m-1，确保能取到所有可能的分割点）
    
    while (left <= right) {
        // 计算nums1的分割点
        int midA = (left + right) / 2;
        // 计算nums2的分割点，确保总数组左右两部分总长度相等（或左比右多1）
        int midB = (m + n + 1) / 2 - midA;
        
        // 处理分割点在数组边界的情况（极端情况）
        int leftA = (midA == 0) ? INT_MIN : nums1[midA - 1];
        //midA在左边界 其中INT_MIN、INT_MAX 看做正负最大值
        int rightA = (midA == m) ? INT_MAX : nums1[midA];
        int leftB = (midB == 0) ? INT_MIN : nums2[midB - 1];
        int rightB = (midB == n) ? INT_MAX : nums2[midB];
        
        // 检查当前分割是否满足条件：左半部分所有元素 <= 右半部分所有元素
        if (leftA <= rightB && leftB <= rightA) {
            // 总长度为奇数时，中位数是左半部分的最大值
            if ((m + n) % 2 == 1) {
                return (double)max(leftA, leftB);
            } else {
                // 总长度为偶数时，中位数是左半部分最大值与右半部分最小值的平均值
                return (double)(max(leftA, leftB) + min(rightA, rightB)) / 2.0;
            }
        } else if (leftA > rightB) {
            // 左A太大，需要左移分割点
            right = midA - 1;
        } else {
            // 左B太大，需要右移分割点
            left = midA + 1;
        }
    }
    
    // 理论上不会走到这里，因为题目保证数组非空且有解
    return 0.0;
}
```

<!-- endtab -->

<!-- tab 双指针法 -->

```c
double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {
    int total = nums1Size + nums2Size;
    if (total == 0) return 0.0; // 处理空数组
    
    int k = total / 2; // 偶数时需第k和k-1个元素，奇数时需第k个元素
    int i = 0, j = 0;
    int first = 0, second = 0; // 存储中间的两个元素
    
    // 遍历获取前k+1个元素，最终first=第k-1个，second=第k个
    for (int count = 0; count <= k; count++) {
        first = second; // 每次迭代将前一个值赋给first
        
        // 严格检查边界，避免越界
        if (i >= nums1Size) {
            // nums1已遍历完，取nums2的元素
            second = nums2[j++];
        } else if (j >= nums2Size) {
            // nums2已遍历完，取nums1的元素
            second = nums1[i++];
        } else if (nums1[i] < nums2[j]) {
            // 取较小的元素
            second = nums1[i++];
        } else {
            second = nums2[j++];
        }
    }
    
    // 根据总长度奇偶性计算中位数
    if (total % 2 == 1) {
        // 奇数：直接返回第k个元素（second）
        return (double)second;
    } else {
        // 偶数：返回第k-1个（first）和第k个（second）的平均值
        return (double)(first + second) / 2.0;
    }
}
```

<!-- endtab -->

<!-- tab 官方答案 -->

```
int compFunc(void* a, void* b)
{
    //排序算法：
    /*返回值需要注意
    < 0 elem1将被排在elem2前面
    0  elem1 等于 elem2
    > 0  elem1 将被排在elem2后面
    */
    int* node1 = (int*)a;
    int* node2 = (int*)b;

    return (*node1 - *node2);
}

double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size)
{
    int *merge = (int * )malloc ( sizeof(int) *  (nums1Size +nums2Size) ) ;
    int i = 0;
    //复制数组nums1
    for(i = 0; i <nums1Size; i++ )
    {
        merge[i] = nums1[i];
    }
    //复制数组nums2
    for(i = 0; i <nums2Size; i++ )
    {
        merge[nums1Size + i] = nums2[i];
    }

    //快速排序
    qsort(merge,nums1Size + nums2Size,sizeof(int),compFunc);

    double middleValue;
    if( (nums1Size+ nums2Size) % 2 == 1 )
    {
        middleValue = (double)merge[ (nums1Size+ nums2Size) / 2];
    }
    else
    {
        middleValue = ((double)merge[ (nums1Size+ nums2Size) / 2 - 1]  + (double)merge[ (nums1Size+ nums2Size) / 2])/2;
    }
    return middleValue;

}
```

<!-- endtab -->

{% endtabs %}

