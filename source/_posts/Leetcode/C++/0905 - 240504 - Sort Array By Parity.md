---
title: Leetcode 0905. Sort Array By Parity
tags:
  - leetcode
  - 双指针
categories:
  - Leetcode
  - 双指针
series: Leetcode
abbrlink: '5579e862'
date: 2024-03-11 23:01:00
---

## [905. Sort Array By Parity](https://leetcode.cn/problems/sort-array-by-parity/)

Given an integer array `nums`, move all the even integers at the beginning of the array followed by all the odd integers.

Return ***any array** that satisfies this condition*.

 **Example 1:**

```
Input: nums = [3,1,2,4]
Output: [2,4,3,1]
Explanation: The outputs [4,2,3,1], [2,4,1,3], and [4,2,1,3] would also be accepted.
```

**Example 2:**

```
Input: nums = [0]
Output: [0]
```

### 解法1：双指针

```
class Solution
{
public:
    vector<int> sortArrayByParity(vector<int> &nums)
    {
        int l = 0, r = nums.size() - 1;
        while (l < r)
        {
            if (nums[l] % 2 == 0)
                l++;
            else
                swap(nums[l], nums[r--]);
        }
        return nums;
    }
};
```

解法2：库函数

```
bool IsOdd(int n){
    return (n & 1);  // 使用位运算判断奇数，比取模运算更高效
}

class Solution {
public:
    vector<int> sortArrayByParity(vector<int>& nums) {
        // 使用partition算法将偶数移到前面，奇数移到后面
        auto partition_point = std::partition(nums.begin(), nums.end(), [](int n) { return !IsOdd(n); });  // 谓词：是否为偶数
        return nums;
    }
};
```

## 实现原理

`std::partition` 函数的工作原理：

- 重新排列范围内的元素，使满足谓词的元素（此处为偶数）出现在不满足谓词的元素（此处为奇数）之前
- 返回一个迭代器，指向第一个不满足谓词的元素（即第一个奇数的位置）
- 该算法采用**不稳定排序**，不保证元素之间的相对顺序

## 关键技术点

1. **位运算判断奇偶**：
   - `n & 1` 比 `n % 2 == 1` 更高效
   - 对于整数，二进制最后一位为 1 则是奇数，为 0 则是偶数
2. **lambda 表达式作为谓词**：
   - `!IsOdd(n)` 表示 "不是奇数"，即 "是偶数"
   - 符合`std::partition`要求的谓词格式（返回 bool 值）