---
title: Leetcode 0072. Edit Distance
tags:
  - leetcode
categories:
  - Leetcode
  - 动态规划
series: Leetcode
abbrlink: fc74f62
date: 2022-11-03 22:22:40
---

## [72. Edit Distance](https://leetcode.cn/problems/edit-distance/)

Given two strings `word1` and `word2`, return *the minimum number of operations required to convert `word1` to `word2`*.

You have the following three operations permitted on a word:

- Insert a character
- Delete a character
- Replace a character

 **Example 1:**

```
Input: word1 = "horse", word2 = "ros"
Output: 3
Explanation: 
horse -> rorse (replace 'h' with 'r')
rorse -> rose (remove 'r')
rose -> ros (remove 'e')
```

**Example 2:**

```
Input: word1 = "intention", word2 = "execution"
Output: 5
Explanation: 
intention -> inention (remove 't')
inention -> enention (replace 'i' with 'e')
enention -> exention (replace 'n' with 'x')
exention -> exection (replace 'n' with 'c')
exection -> execution (insert 'u')
```

## 题目描述

给你两个单词 word1 和 word2，请返回将 word1 转换成 word2 所使用的最少操作数。你可以对一个单词进行如下三种操作：

- 插入一个字符

- 删除一个字符

- 替换一个字符

示例 1：

- 输入：word1 = "horse", word2 = "ros"

- 输出：3

- 解释：

```
horse -> rorse（将 'h' 替换为 'r'）
rorse -> rose（删除 'r'）
rose -> ros（删除 'e'）
```
示例 2：

- 输入：word1 = "intention", word2 = "execution"

- 输出：5

- 解释：
```
intention -> inention（删除 't'）
inention -> enention（将 'i' 替换为 'e'）
enention -> exention（将 'n' 替换为 'x'）
exention -> exection（将 'n' 替换为 'c'）
exection -> execution（插入 'u'）
```
## 解法：动态规划

```
class Solution {
public:
    int minDistance(string word1, string word2) {
        int dp[word1.length()+1][word2.length()+1];
        for(int i=0;i<=word1.length();i++){
            dp[i][0] = i;
        }
        for(int j=0;j<=word2.length();j++){
            dp[0][j] = j;
        }

        for(int i=1;i<=word1.length();i++){
            for(int j=1;j<=word2.length();j++){
                int c1 = (word1[i-1]==word2[j-1])? dp[i-1][j-1]:dp[i-1][j-1]+1;
                dp[i][j] = min(dp[i-1][j],dp[i][j-1])+1;
                dp[i][j] = min(dp[i][j],c1);
            }
        }
        return dp[word1.length()][word2.length()];
    }
};
```

## 解法解析

编辑距离问题是动态规划的经典应用，其核心思想是通过构建一个二维数组来存储子问题的解。

**状态定义**：

定义 `dp[i][j] `表示将 word1 的前 i 个字符转换为 word2 的前 j 个字符所需的最少操作数。

**边界条件**：

- 当 word2 为空字符串时，将 word1 转换为 word2 需要删除所有字符，因此` dp[i][0] = i`

- 当 word1 为空字符串时，将 word1 转换为 word2 需要插入所有字符，因此` dp[0][j] = j`

**状态转移方程**：

- 如果 word1[i-1] == word2[j-1]（当前字符相同），则不需要任何操作：`dp[i][j] = dp[i-1][j-1]`

- 如果当前字符不同，则需要考虑三种操作：

  - 插入：`dp[i][j-1] + 1`（在 word1 中插入 word2[j-1]）

  - 删除：`dp[i-1][j] + 1`（在 word1 中删除 word1[i-1]）

  - 替换：`dp[i-1][j-1] + 1`（将 word1[i-1] 替换为 word2[j-1]）

  - 取这三种操作的最小值作为 `dp[i][j] `的值

**最终结果**：

`dp[m][n] `即为将整个 word1 转换为 word2 所需的最少操作数，其中 m 和 n 分别是 word1 和 word2 的长度。

该算法的时间复杂度为 O(m*n)，空间复杂度也为 O(m*n)，其中 m 和 n 分别是两个输入字符串的长度。

## 性能分析

| 指标       | 数值           | 说明                                  |
| ---------- | -------------- | ------------------------------------- |
| 时间复杂度 | O(m*n)         | 需要填充整个 dp 数组                  |
| 空间复杂度 | O(m*n)         | 需要存储一个 (m+1) x (n+1) 的二维数组 |
| 适用场景   | 所有字符串长度 | 对短字符串和长字符串都适用            |