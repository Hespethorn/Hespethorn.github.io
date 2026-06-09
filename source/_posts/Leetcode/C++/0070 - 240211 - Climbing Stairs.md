---
title: Leetcode 0070. Climbing Stairs
tags:
  - leetcode
categories:
  - Leetcode
  - 动态规划
series: Leetcode-Cpp
abbrlink: 1eceaa5c
date: 2023-05-25 20:12:00
---

# [70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)


## 题目

You are climbing a stair case. It takes *n* steps to reach to the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

**Note:** Given *n* will be a positive integer.

**Example 1:**

    Input: 2
    Output: 2
    Explanation: There are two ways to climb to the top.
    1. 1 step + 1 step
    2. 2 steps

**Example 2:**

    Input: 3
    Output: 3
    Explanation: There are three ways to climb to the top.
    1. 1 step + 1 step + 1 step
    2. 1 step + 2 steps
    3. 2 steps + 1 step


## 题目大意

假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？注意：给定 n 是一个正整数


## 解题思路

- 简单的 DP，经典的爬楼梯问题。一个楼梯可以由 `n-1` 和 `n-2` 的楼梯爬上来。
- 这一题求解的值就是斐波那契数列。

## 解法 1：递归解法（基础版）

```c
#include <stdio.h>

// 递归解法
int climbStairs(int n) {
    // 基线条件
    if (n == 1) return 1;  // 1阶楼梯只有1种方法
    if (n == 2) return 2;  // 2阶楼梯有2种方法
    
    // 递归关系：n阶楼梯的方法数 = n-1阶 + n-2阶
    return climbStairs(n-1) + climbStairs(n-2);
}

int main() {
    int n;
    printf("请输入楼梯阶数: ");
    scanf("%d", &n);
    
    printf("爬 %d 阶楼梯的方法数: %d\n", n, climbStairs(n));
    return 0;
}
```

## 解法 1 解析

递归解法直接基于问题的数学定义：

- 要到达第 n 阶楼梯，最后一步只有两种可能：
  1. 从第 n-1 阶爬 1 步上来
  2. 从第 n-2 阶爬 2 步上来

因此，爬 n 阶楼梯的方法数 = 爬 n-1 阶的方法数 + 爬 n-2 阶的方法数

- n=1 时，只有 1 种方法（爬 1 步）
- n=2 时，有 2 种方法（1+1 或 2）

这种方法虽然直观，但存在严重的效率问题，因为会重复计算大量相同的子问题。例如计算 climbStairs (5) 时，需要计算 climbStairs (4) 和 climbStairs (3)，而计算 climbStairs (4) 又需要计算 climbStairs (3)，导致 climbStairs (3) 被计算了两次。

## 解法 2：动态规划解法（优化版）

```c
#include <stdio.h>

// 动态规划解法
int climbStairs(int n) {
    // 处理特殊情况
    if (n == 1) return 1;
    if (n == 2) return 2;
    
    // 创建dp数组存储子问题的解
    int dp[n + 1];
    dp[1] = 1;  // 1阶楼梯的方法数
    dp[2] = 2;  // 2阶楼梯的方法数
    
    // 填充dp数组
    for (int i = 3; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

int main() {
    int n;
    printf("请输入楼梯阶数: ");
    scanf("%d", &n);
    
    printf("爬 %d 阶楼梯的方法数: %d\n", n, climbStairs(n));
    return 0;
}
```

## 解法 2 解析

动态规划解法通过存储子问题的解来避免重复计算：

1. 创建一个 dp 数组，其中 dp [i] 表示爬 i 阶楼梯的方法数
2. 初始化 dp [1] = 1，dp [2] = 2 作为基线条件
3. 对于 i 从 3 到 n，计算 dp [i] = dp [i-1] + dp [i-2]
4. 最终返回 dp [n] 作为结果

这种方法将时间复杂度从递归解法的 O (2ⁿ) 优化到了 O (n)，因为每个子问题只计算一次。空间复杂度为 O (n)，用于存储 dp 数组。

## 解法 3：空间优化的动态规划

```c
#include <stdio.h>

// 空间优化的动态规划解法
int climbStairs(int n) {
    // 处理特殊情况
    if (n == 1) return 1;
    if (n == 2) return 2;
    
    // 只保存前两个值，无需完整数组
    int first = 1;  // 对应dp[i-2]
    int second = 2; // 对应dp[i-1]
    int current;    // 对应dp[i]
    
    // 迭代计算
    for (int i = 3; i <= n; i++) {
        current = first + second;
        first = second;
        second = current;
    }
    
    return current;
}

int main() {
    int n;
    printf("请输入楼梯阶数: ");
    scanf("%d", &n);
    
    printf("爬 %d 阶楼梯的方法数: %d\n", n, climbStairs(n));
    return 0;
}
```

## 解法 3 解析

观察动态规划解法可以发现，计算 dp [i] 时只需要用到 dp [i-1] 和 dp [i-2] 两个值，因此不需要存储整个 dp 数组：

1. 使用 first 和 second 两个变量分别表示 dp [i-2] 和 dp [i-1]
2. 每次迭代计算 current = first + second（即 dp [i]）
3. 更新 first 和 second 的值，为下一次迭代做准备
4. 最终返回 current 作为结果

这种优化将空间复杂度从 O (n) 进一步降低到了 O (1)，同时保持时间复杂度为 O (n)，是该问题的最优解法。

## 性能对比

| 解法类型    | 时间复杂度 | 空间复杂度 | 优点                   | 缺点                                       |
| ----------- | ---------- | ---------- | ---------------------- | ------------------------------------------ |
| 递归解法    | O(2ⁿ)      | O(n)       | 实现简单，直观         | 效率极低，有大量重复计算，n 较大时无法使用 |
| 动态规划    | O(n)       | O(n)       | 效率高，避免重复计算   | 需要额外存储空间                           |
| 空间优化 DP | O(n)       | O(1)       | 效率最高，空间消耗最小 | 稍微增加了代码复杂度                       |

### 问题本质分析

爬楼梯问题本质上是一个斐波那契数列问题，只是初始条件略有不同：

- 斐波那契数列：F (1)=1, F (2)=1, F (n)=F (n-1)+F (n-2)
- 爬楼梯问题：F (1)=1, F (2)=2, F (n)=F (n-1)+F (n-2)

这揭示了一个重要的算法设计思想：很多看似不同的问题可能具有相同的数学模型。

### 常见错误与解决方案

1. **递归解法的效率问题**
   递归解法在 n=40 时就会明显变慢，n=50 时几乎无法在合理时间内得出结果。
   解决方案：使用动态规划或空间优化的动态规划解法。
2. **边界条件处理不当**
   常见错误是没有正确处理 n=1 和 n=2 的情况。
   解决方案：在函数开始时显式处理这些特殊情况。
3. **整数溢出问题**
   当 n 较大时（如 n>45），结果会超过 int 类型的最大值。
   解决方案：对于大 n，可以使用 long long 类型存储结果。