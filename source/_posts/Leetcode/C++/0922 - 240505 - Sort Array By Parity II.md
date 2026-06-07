---
title: Leetcode 0922. Sort Array By Parity II
tags:
  - leetcode
  - 双指针
categories:
  - Leetcode
  - 双指针
series: Leetcode
abbrlink: '18417049'
date: 2024-03-15 23:26:00
---

## [922. Sort Array By Parity II](https://leetcode.cn/problems/sort-array-by-parity-ii/)

Given an array of integers `nums`, half of the integers in `nums` are **odd**, and the other half are **even**.

Sort the array so that whenever `nums[i]` is odd, `i` is **odd**, and whenever `nums[i]` is even, `i` is **even**.

Return *any answer array that satisfies this condition*.

 **Example 1:**

```
Input: nums = [4,2,5,7]
Output: [4,5,2,7]
Explanation: [4,7,2,5], [2,5,4,7], [2,7,4,5] would also have been accepted.
```

**Example 2:**

```
Input: nums = [2,3]
Output: [2,3]
```

## 双指针解法：

1. **初始化**：
   - 偶数索引指针 `i` 从 0 开始，每次移动 2 步
   - 奇数索引指针 `j` 从 1 开始，每次移动 2 步
2. **遍历与交换**：
   - 当偶数索引 `i` 上的元素是奇数时
   - 移动奇数索引指针 `j` 找到一个偶数
   - 交换这两个元素，使它们都处于正确的位置
3. **终止条件**：
   - 当 `i` 遍历完所有偶数索引（`i < n`），数组已满足条件

### 复杂度分析

- **时间复杂度**：O (n)，其中 n 是数组长度。每个元素最多被访问一次
- **空间复杂度**：O (1)，只使用了两个指针变量，原地操作

```
class Solution {
public:
    vector<int> sortArrayByParityII(vector<int>& nums) {
        int i = 0, j = 1;
        while (i < nums.size()) {
            if (nums[i] % 2 == 0) { // 寻找偶数下标中最左边的奇数
                i += 2;
            } else if (nums[j] % 2 == 1) { // 寻找奇数下标中最左边的偶数
                j += 2;
            } else {
                swap(nums[i], nums[j]);
                i += 2;
                j += 2;
            }
        }
        return nums;
    }
};
```

