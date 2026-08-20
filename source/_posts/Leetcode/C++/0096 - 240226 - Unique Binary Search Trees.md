---
title: Leetcode 0096. Unique Binary Search Trees
tags:
  - leetcode
categories: [Leetcode, C++]
  - tree
series: Leetcode-Cpp
abbrlink: 51c50c32
date: 2023-07-21
---

## [96. Unique Binary Search Trees](https://leetcode.cn/problems/unique-binary-search-trees/)

Given an integer `n`, return *the number of structurally unique **BST'**s (binary search trees) which has exactly* `n` *nodes of unique values from* `1` *to* `n`.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2021/01/18/uniquebstn3.jpg)

```
Input: n = 3
Output: 5
```

**Example 2:**

```
Input: n = 1
Output: 1
```

## 题目大意

给定一个整数 `n`，计算由 `1` 到 `n` 为节点所组成的**结构独特**的二叉搜索树（BST）的数量。

例如：

- 输入 `n = 3`，存在 5 种结构独特的 BST，返回 `5`；
- 输入 `n = 1`，只有 1 种 BST，返回 `1`。

## 解题思路

计算独特 BST 的数量可以通过**动态规划（DP）** 实现，核心思路基于以下观察：

1. 若选择 `i` 作为根节点，则左子树由 `1~i-1` 构成，右子树由 `i+1~n` 构成；
2. 左子树的独特结构数量为 `dp[i-1]`，右子树的独特结构数量为 `dp[n-i]`（右子树可视为 `1~n-i` 的结构映射）；
3. 以 `i` 为根的 BST 数量为左、右子树数量的乘积；
4. 总数量为所有可能根节点的数量之和。

动态规划递推公式：

- `dp[0] = 1`（空树视为 1 种结构）
- `dp[n] = Σ (dp[i-1] * dp[n-i])` ，其中 `i` 从 1 到 n

## 代码实现

```
class Solution {
public:
    int numTrees(int n) {
        // dp[i] 表示i个节点组成的独特BST数量
        vector<int> dp(n + 1, 0);
        dp[0] = 1; // 空树有1种结构
        
        // 计算dp[1]到dp[n]
        for (int i = 1; i <= n; ++i) {
            // 以j为根节点，计算所有可能的组合
            for (int j = 1; j <= i; ++j) {
                // 左子树有j-1个节点，右子树有i-j个节点
                dp[i] += dp[j - 1] * dp[i - j];
            }
        }
        
        return dp[n];
    }
};
```