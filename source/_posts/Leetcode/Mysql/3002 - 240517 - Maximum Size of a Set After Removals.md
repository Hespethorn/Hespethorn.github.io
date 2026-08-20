---
title: Leetcode 3002. Maximum Size of a Set After Removals
tags:
  - leetcode
categories: [Leetcode, C++]
  - Hash
series: Leetcode-C++-Mysql
abbrlink: d384b331
date: 2024-04-28
---

## [3002. Maximum Size of a Set After Removals](https://leetcode.cn/problems/maximum-size-of-a-set-after-removals/)

You are given two **0-indexed** integer arrays `nums1` and `nums2` of even length `n`.

You must remove `n / 2` elements from `nums1` and `n / 2` elements from `nums2`. After the removals, you insert the remaining elements of `nums1` and `nums2` into a set `s`.

Return *the **maximum** possible size of the set* `s`.

**Example 1:**

```
Input: nums1 = [1,2,1,2], nums2 = [1,1,1,1]
Output: 2
Explanation: We remove two occurences of 1 from nums1 and nums2. After the removals, the arrays become equal to nums1 = [2,2] and nums2 = [1,1]. Therefore, s = {1,2}.
It can be shown that 2 is the maximum possible size of the set s after the removals.
```

**Example 2:**

```
Input: nums1 = [1,2,3,4,5,6], nums2 = [2,3,2,3,2,3]
Output: 5
Explanation: We remove 2, 3, and 6 from nums1, as well as 2 and two occurrences of 3 from nums2. After the removals, the arrays become equal to nums1 = [1,4,5] and nums2 = [2,3,2]. Therefore, s = {1,2,3,4,5}.
It can be shown that 5 is the maximum possible size of the set s after the removals.
```

**Example 3:**

```
Input: nums1 = [1,1,2,2,3,3], nums2 = [4,4,5,5,6,6]
Output: 6
Explanation: We remove 1, 2, and 3 from nums1, as well as 4, 5, and 6 from nums2. After the removals, the arrays become equal to nums1 = [1,2,3] and nums2 = [4,5,6]. Therefore, s = {1,2,3,4,5,6}.
It can be shown that 6 is the maximum possible size of the set s after the removals.
```

## 题目大意

给定两个长度均为 `n`（偶数）的整数数组 `nums1` 和 `nums2`，需从每个数组中删除 `n/2` 个元素，将剩余元素合并到一个集合 `s` 中（集合自动去重）。要求返回集合 `s` 可能的最大大小。

## 解题思路

1. **排序与去重**：先对数组排序，再通过 `unique` 函数提取不重复元素，统计两个数组的 “唯一元素总数”（`n1`、`n2`）。
2. **双指针找重叠**：用双指针遍历两个去重后的数组，统计 “两数组共有的唯一元素数”（`n3`）。
3. **计算可保留的唯一元素**：
   - 从 `n1`、`n2` 中减去重叠数 `n3`，得到 “仅在 nums1 中有的唯一元素数”（`n1-n3`）和 “仅在 nums2 中有的唯一元素数”（`n2-n3`）。
   - 结合 “每个数组需保留 `n/2` 个元素” 的限制，计算最大可保留的唯一元素总数，最终得到集合的最大大小。

```
class Solution {
public:
    int maximumSetSize(vector<int>& nums1, vector<int>& nums2) {
        int n = nums1.size(), n1, n2, n3 = 0, i = 0, j = 0;
        sort(nums1.begin(), nums1.end());
        sort(nums2.begin(), nums2.end());
        n1 = unique(nums1.begin(), nums1.end()) - nums1.begin();
        n2 = unique(nums2.begin(), nums2.end()) - nums2.begin();
        while(i < n1 && j < n2) {
            if(nums1[i] == nums2[j]) {
                i++;
                j++;
                n3++;
            }else if(nums1[i] < nums2[j]) {
                i++;
            }else if(nums1[i] > nums2[j]) {
                j++;
            }
        }
        n1 -= n3;
        n2 -= n3;
        return min(n + n % 2, min(n - n / 2, n1) + min(n - n / 2, n2) + n3);
    }
};
```