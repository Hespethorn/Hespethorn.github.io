---
title: Leetcode 0367. Valid Perfect Square
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: daa261f7
date: 2023-12-09
---

# [367. Valid Perfect Square](https://leetcode.cn/problems/valid-perfect-square/)

## 题目

Given a positive integer num, write a function which returns True if num is a perfect square else False.

**Note:** **Do not** use any built-in library function such as `sqrt`.

**Example 1:**

    Input: 16
    Output: true

**Example 2:**

    Input: 14
    Output: false

> **完全平方数可以表示为连续奇数的和**。

### 算法原理

该算法利用了以下数学特性：

- 1 = 1（1²）
- 1 + 3 = 4（2²）
- 1 + 3 + 5 = 9（3²）
- 1 + 3 + 5 + 7 = 16（4²）
- 以此类推，n² = 1 + 3 + 5 + ... + (2n-1)

算法通过不断从目标数中减去连续的奇数（1, 3, 5, 7...），如果最终结果恰好为 0，则说明该数是完全平方数。

```
class Solution 
{
public:
    /**
     * 验证一个数是否为完全平方数
     * 利用数学性质：完全平方数 = 连续奇数的和
     * @param num 待验证的正整数
     * @return 如果是完全平方数返回true，否则返回false
     */
    bool isPerfectSquare(int num) 
    {
        // 从1开始的奇数序列
        int odd = 1;
        
        // 不断减去下一个奇数
        while(num > 0) 
        {
            num -= odd;    // 减去当前奇数
            odd += 2;      // 生成下一个奇数（每次增加2）
        }
        
        // 如果最终num为0，说明刚好减完所有必要的奇数，是完全平方数
        return num == 0;
    }
};
```

