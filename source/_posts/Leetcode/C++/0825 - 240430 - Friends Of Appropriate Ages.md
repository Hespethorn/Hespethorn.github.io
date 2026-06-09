---
title: Leetcode 0825. Friends Of Appropriate Ages
tags:
  - leetcode
categories:
  - Leetcode
  - 双指针
series: Leetcode-Cpp
abbrlink: 8b3a0d01
date: 2024-02-25 23:12:00
---

## [825. Friends Of Appropriate Ages](https://leetcode.cn/problems/friends-of-appropriate-ages/)

There are `n` persons on a social media website. You are given an integer array `ages` where `ages[i]` is the age of the `ith` person.

A Person `x` will not send a friend request to a person `y` (`x != y`) if any of the following conditions is true:

- `age[y] <= 0.5 * age[x] + 7`
- `age[y] > age[x]`
- `age[y] > 100 && age[x] < 100`

Otherwise, `x` will send a friend request to `y`.

Note that if `x` sends a request to `y`, `y` will not necessarily send a request to `x`. Also, a person will not send a friend request to themself.

Return *the total number of friend requests made*.

 **Example 1:**

```
Input: ages = [16,16]
Output: 2
Explanation: 2 people friend request each other.
```

**Example 2:**

```
Input: ages = [16,17,18]
Output: 2
Explanation: Friend requests are made 17 -> 16, 18 -> 17.
```

**Example 3:**

```
Input: ages = [20,30,100,110,120]
Output: 3
Explanation: Friend requests are made 110 -> 100, 120 -> 110, 120 -> 100.
```

## 题目大意

在一个社交网站上有 n 个人，给定一个整数数组 ages 表示每个人的年龄。如果满足以下任一条件，人 x 不会向人 y（x≠y）发送好友请求：

- age[y] ≤ 0.5 * age[x] + 7
- age[y] > age[x]
- age [y] > 100 且 age [x] < 100

否则，x 会向 y 发送好友请求。注意 x 向 y 发送请求不代表 y 也会向 x 发送，且人不会向自己发送请求。要求返回总共的好友请求数量。

## 解题思路

1. 首先分析有效好友请求的条件，通过对题目条件取反，可以得出 x 会向 y 发送请求的条件是：
   - age[y] > 0.5 * age[x] + 7
   - age[y] ≤ age[x]
   - 第三个条件已被前两个条件涵盖，无需单独考虑
2. 采用排序 + 双指针的高效解法：
   - 先对年龄数组进行排序
   - 对于每个年龄 x，使用双指针找到所有满足条件的 y 的范围
   - 统计每个 x 对应的有效 y 的数量，累加得到总请求数

```
class Solution {
public:
    int numFriendRequests(vector<int>& ages) {
        sort(ages.begin(), ages.end());
        int n = ages.size();
        int result = 0;
        
        for (int i = 0; i < n; ++i) {
            int x = ages[i];
            // 计算年龄y需要满足的下界
            int lower = x / 2 + 7;
            
            // 找到第一个大于lower的年龄索引
            auto left = upper_bound(ages.begin(), ages.end(), lower);
            // 找到第一个大于x的年龄索引
            auto right = upper_bound(ages.begin(), ages.end(), x);
            
            // 计算有效范围的人数，减去自己
            int count = (right - left) - 1;
            if (count > 0) {
                result += count;
            }
        }
        
        return result;
    }
};
```

