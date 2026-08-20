---
title: Leetcode 1201. Ugly Number III
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: 267b35b5
date: 2024-04-09
---

# [1201. Ugly Number III](https://leetcode.com/problems/ugly-number-iii/)


## 题目

Write a program to find the `n`-th ugly number.

Ugly numbers are **positive integers** which are divisible by `a` **or** `b` **or** `c`.

**Example 1:**

    Input: n = 3, a = 2, b = 3, c = 5
    Output: 4
    Explanation: The ugly numbers are 2, 3, 4, 5, 6, 8, 9, 10... The 3rd is 4.

**Example 2:**

    Input: n = 4, a = 2, b = 3, c = 4
    Output: 6
    Explanation: The ugly numbers are 2, 3, 4, 6, 8, 9, 10, 12... The 4th is 6.

**Example 3:**

    Input: n = 5, a = 2, b = 11, c = 13
    Output: 10
    Explanation: The ugly numbers are 2, 4, 6, 8, 10, 11, 12, 13... The 5th is 10.

**Example 4:**

    Input: n = 1000000000, a = 2, b = 217983653, c = 336916467
    Output: 1999999984

**Constraints:**

- `1 <= n, a, b, c <= 10^9`
- `1 <= a * b * c <= 10^18`
- It's guaranteed that the result will be in range `[1, 2 * 10^9]`


## 题目大意


请你帮忙设计一个程序，用来找出第 n 个丑数。丑数是可以被 a 或 b 或 c 整除的 正整数。


提示：

- 1 <= n, a, b, c <= 10^9
- 1 <= a * b * c <= 10^18
- 本题结果在 [1, 2 * 10^9] 的范围内

## 解题思路


- **问题转化**：将 "找第 N 个丑数" 转化为 "对于某个数 x，判断 <=x 的丑数是否有至少 N 个"，然后通过二分查找找到最小的 such x。
- **容斥原理**：计算 <=x 的丑数数量时，使用容斥原理：
  - 能被 a、b、c 中至少一个整除的数的个数 =
    (能被 a 整除的数) + (能被 b 整除的数) + (能被 c 整除的数) -
    (能被 a 和 b 同时整除的数) - (能被 a 和 c 同时整除的数) - (能被 b 和 c 同时整除的数) +
    (能被 a、b、c 同时整除的数)
- **最小公倍数**：判断一个数能否被两个数同时整除，等价于判断能否被它们的最小公倍数整除，因此需要计算 lcm (a,b)、lcm (a,c)、lcm (b,c) 和 lcm (a,b,c)。
- **二分查找**：在合理的范围内进行二分查找，找到满足条件的最小 x。

```
class Solution {
public:
    int nthUglyNumber(int n, int a, int b, int c) {
        // 快速处理n=1的情况
        if (n == 1) return min({a, b, c});
        
        // 转换为long long避免后续计算溢出
        long long A = a, B = b, C = c;
        
        // 计算最小公倍数
        long long lcmAB = lcm(A, B);
        long long lcmAC = lcm(A, C);
        long long lcmBC = lcm(B, C);
        long long lcmABC = lcm(lcmAB, C);
        
        // 容斥原理计算<=x的丑数数量
        auto count = [&](long long x) {
            return x/A + x/B + x/C 
                  - x/lcmAB - x/lcmAC - x/lcmBC 
                  + x/lcmABC;
        };
        
        // 优化边界：使用更紧凑的范围
        long long minVal = min({A, B, C});
        long long L = minVal;               // 理论最小可能值
        long long R = minVal * n;           // 安全上界
        
        // 二分查找
        while (L < R) {
            long long mid = L + (R - L) / 2;
            long long cnt = count(mid);
            
            if (cnt < n) {
                L = mid + 1;  // 数量不足，必须右移
            } else {
                R = mid;      // 数量足够，尝试左移
            }
        }
        
        return (int)L;
    }

private:
   
    long long gcd(long long x, long long y) {
        while (y) {
            x %= y;
            swap(x, y);
        }
        return x;
    }
    
    long long lcm(long long x, long long y) {
        return x / gcd(x, y) * y;  // 先除后乘避免溢出
    }
};
    
```

