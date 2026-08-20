---
title: Leetcode 0509. Fibonacci Number
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 99808cc9
date: 2024-01-20
---

# [509. Fibonacci Number](https://leetcode.ccn/problems/fibonacci-number/)


## 题目

The **Fibonacci numbers**, commonly denoted `F(n)` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from `0` and `1`. That is,

    F(0) = 0,   F(1) = 1
    F(N) = F(N - 1) + F(N - 2), for N > 1.

Given `N`, calculate `F(N)`.

**Example 1:**

    Input: 2
    Output: 1
    Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.

**Example 2:**

    Input: 3
    Output: 2
    Explanation: F(3) = F(2) + F(1) = 1 + 1 = 2.

**Example 3:**

    Input: 4
    Output: 3
    Explanation: F(4) = F(3) + F(2) = 2 + 1 = 3.

**Note:**

0 ≤ `N` ≤ 30.


## 题目大意

斐波那契数，通常用 F(n) 表示，形成的序列称为斐波那契数列。该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。也就是：

```
F(0) = 0,   F(1) = 1
F(N) = F(N - 1) + F(N - 2), 其中 N > 1.
```

给定 N，计算 F(N)。

提示：0 ≤ N ≤ 30

## 解题思路


- 求斐波那契数列
- 这一题解法很多，大的分类是四种，递归，记忆化搜索(dp)，矩阵快速幂，通项公式。其中记忆化搜索可以写 3 种方法，自底向上的，自顶向下的，优化空间复杂度版的。通项公式方法实质是求 a^b 这个还可以用快速幂优化时间复杂度到 O(log n) 。

## 解法 1：递归解法

```
class Solution {
public:
    int fib(int N) {
        if (N == 0) return 0;
        if (N == 1) return 1;
        return fib(N - 1) + fib(N - 2);
    }
};
```

## 解法 2：动态规划（记忆化）

```
class Solution {
public:
    int fib(int N) {
        if (N == 0) return 0;
        if (N == 1) return 1;
        
        vector<int> dp(N + 1);
        dp[0] = 0;
        dp[1] = 1;
        
        for (int i = 2; i <= N; ++i) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        
        return dp[N];
    }
};
```

## 解法 3：空间优化的动态规划

```
class Solution {
public:
    int fib(int N) {
        if (N == 0) return 0;
        if (N == 1) return 1;
        
        int first = 0, second = 1, current;
        for (int i = 2; i <= N; ++i) {
            current = first + second;
            first = second;
            second = current;
        }
        
        return current;
    }
};
```

## 解法 4：矩阵快速幂

```
class Solution {
private:
    vector<vector<long long>> multiply(vector<vector<long long>>& a, vector<vector<long long>>& b) {
        return {
            {a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]},
            {a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]}
        };
    }
    
    vector<vector<long long>> matrixPower(vector<vector<long long>> a, int n) {
        vector<vector<long long>> res = {{1, 0}, {0, 1}}; // 单位矩阵
        while (n > 0) {
            if (n % 2 == 1) {
                res = multiply(res, a);
            }
            a = multiply(a, a);
            n /= 2;
        }
        return res;
    }
    
public:
    int fib(int N) {
        if (N == 0) return 0;
        if (N == 1) return 1;
        
        vector<vector<long long>> base = {{1, 1}, {1, 0}};
        return matrixPower(base, N - 1)[0][0];
    }
};
```

基于矩阵快速幂的斐波那契数求解方法，本质上是利用线性代数中的矩阵乘法性质，将原问题转化为矩阵幂次计算问题，从而实现时间复杂度的优化。

通过运用矩阵快速幂算法，即采用分治策略将幂次计算分解为对数级别的乘法操作，可以高效地计算目标矩阵的幂次。对于 *n* 次幂的计算，矩阵快速幂算法仅需执行 *O*(log*n*) 次矩阵乘法操作，显著优于传统的线性时间复杂度算法。

在空间复杂度方面，由于在计算过程中仅需存储固定维度的矩阵，且不随输入规模 *n* 的增加而改变，因此该算法的空间复杂度为 *O*(1)。这种时空效率的优化，使得矩阵快速幂算法在处理大规模斐波那契数计算时具有显著优势。