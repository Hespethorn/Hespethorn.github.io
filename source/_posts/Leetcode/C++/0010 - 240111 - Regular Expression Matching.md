---
title: Leetcode 0010. Regular Expression Matching
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: b8d9b34
date: 2023-02-01
---

## [10. Regular Expression Matching](https://leetcode.cn/problems/regular-expression-matching/)

Given an input string `s` and a pattern `p`, implement regular expression matching with support for `'.'` and `'*'` where:

- `'.'` Matches any single character.
- `'*'` Matches zero or more of the preceding element.

The matching should cover the **entire** input string (not partial).

 **Example 1:**

```
Input: s = "aa", p = "a"
Output: false
Explanation: "a" does not match the entire string "aa".
```

**Example 2:**

```
Input: s = "aa", p = "a*"
Output: true
Explanation: '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".
```

**Example 3:**

```
Input: s = "ab", p = ".*"
Output: true
Explanation: ".*" means "zero or more (*) of any character (.)".
```

## 算法思路

采用动态规划（DP）的方法解决这个问题：

1. 定义状态 `dp[i][j]` 表示 s 的前 i 个字符与 p 的前 j 个字符是否匹配
2. 初始化边界条件：空字符串与空模式匹配，即 `dp[0][0] = true`
3. 处理 '*' 号的特殊情况：
   - '*' 可以匹配 0 个前面的元素：`dp[i][j] = dp[i][j-2]`
   - '*' 可以匹配 1 个或多个前面的元素（需当前字符匹配）：`dp[i][j] = dp[i-1][j]`
4. 处理普通字符和 '.' 的匹配情况

```
class Solution {
public:
    bool isMatch(string s, string p) {
        int m = s.size();
        int n = p.size();
        
        // 创建DP表，dp[i][j]表示s[0..i-1]与p[0..j-1]是否匹配
        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));
        dp[0][0] = true; // 空字符串匹配空模式
        
        // 处理模式中可能匹配空字符串的情况（主要是*的作用）
        for (int j = 1; j <= n; ++j) {
            if (p[j - 1] == '*') {
                dp[0][j] = dp[0][j - 2];
            }
        }
        
        // 填充DP表
        for (int i = 1; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                // 当前字符匹配（相同字符或模式为.）
                if (s[i - 1] == p[j - 1] || p[j - 1] == '.') {
                    dp[i][j] = dp[i - 1][j - 1];
                }
                // 模式当前字符是*，需要特殊处理
                else if (p[j - 1] == '*') {
                    // *匹配0个前面的元素
                    dp[i][j] = dp[i][j - 2];
                    
                    // 如果前面的字符匹配，可以考虑*匹配1个或多个
                    if (s[i - 1] == p[j - 2] || p[j - 2] == '.') {
                        dp[i][j] = dp[i][j] || dp[i - 1][j];
                    }
                }
                // 其他情况不匹配
                else {
                    dp[i][j] = false;
                }
            }
        }
        
        return dp[m][n];
    }
};
```

### 代码解析

**DP 表定义**：

- `dp[i][j]` 表示 s 的前 i 个字符（s [0..i-1]）与 p 的前 j 个字符（p [0..j-1]）是否匹配

**边界条件处理**：

- 空字符串与空模式匹配：`dp[0][0] = true`

- 对于模式中的 '*'，可以匹配 0 个前面的元素，所以 `dp[0][j] = dp[0][j-2]`

**状态转移**：

- 当当前字符匹配（相同或模式为 '.'）：`dp[i][j] = dp[i-1][j-1]`

- 当模式字符为 '*' 时：
  - 匹配 0 个前面的元素：`dp[i][j] = dp[i][j-2]`
  - 若当前字符与 '*' 前面的字符匹配，还可以匹配 1 个或多个：`dp[i][j] |= dp[i-1][j]`