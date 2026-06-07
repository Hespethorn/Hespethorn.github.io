---
title: Leetcode 0287. Find the Duplicate Number
tags:
  - leetcode
categories:
  - Leetcode
  - 双指针
series: Leetcode
abbrlink: 8a031859
date: 2023-11-29 21:03:00
---

## [287. Find the Duplicate Number](https://leetcode.cn/problems/find-the-duplicate-number/)

Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive.

There is only **one repeated number** in `nums`, return *this repeated number*.

You must solve the problem **without** modifying the array `nums` and using only constant extra space.

**Example 1:**

```
Input: nums = [1,3,4,2,2]
Output: 2
```

**Example 2:**

```
Input: nums = [3,1,3,4,2]
Output: 3
```

**Example 3:**

```
Input: nums = [3,3,3,3,3]
Output: 3
```

## 题目大意

给定一个包含 `n + 1` 个整数的数组 `nums`，其中每个整数都在 `[1, n]` 范围内。数组中**只有一个数字重复出现**，请找出这个重复的数字。要求**不能修改原数组**且**只能使用常数额外空间**。

## 核心解题思路： Floyd 判圈算法（龟兔赛跑算法）

该问题可转化为**链表环检测问题**，利用数组特性构建隐式链表：

- 将数组索引 `i` 视为链表节点，`nums[i]` 视为节点 `i` 的 `next` 指针。
- 由于数组长度为 `n+1` 且元素范围为 `[1,n]`，必然存在环（抽屉原理），且重复数字是环的入口节点。

Floyd 算法通过两步实现：

1. **检测环**：用快慢指针遍历，快指针速度是慢指针的 2 倍，若相遇则存在环。
2. **定位环入口**：将慢指针重置到起点，两指针以相同速度移动，再次相遇的节点即为环入口（重复数字）。

```
#include <vector>
using namespace std;

class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        // 1. 检测环：快慢指针相遇
        int slow = nums[0];
        int fast = nums[0];
        do {
            slow = nums[slow];      // 慢指针走1步
            fast = nums[nums[fast]]; // 快指针走2步
        } while (slow != fast);
        
        // 2. 定位环入口：两指针同速移动
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        
        return slow;
    }
};
```

