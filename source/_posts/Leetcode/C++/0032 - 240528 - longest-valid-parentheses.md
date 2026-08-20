---
title: Leetcode 0032.longest-valid-parentheses
tags:
  - leetcode
  - String
  - Stack
  - Dynamic Programming
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 8d7e1f2c
date: 2024-05-28
---

# [32. Longest Valid Parentheses](https://leetcode.com/problems/longest-valid-parentheses/)

## 题目

Given a string containing just the characters `'('` and `')'`, find the length of the longest valid (well-formed) parentheses substring.

**Example 1:**

```
Input: s = "(()"
Output: 2
Explanation: The longest valid parentheses substring is "()".
```

**Example 2:**

```
Input: s = ")()())"
Output: 4
Explanation: The longest valid parentheses substring is "()()".
```

**Example 3:**

```
Input: s = ""
Output: 0
```

## 题目大意

给定一个只包含 `'('` 和 `')'` 的字符串，找出最长的有效括号子串的长度。

## 解题思路

### 方法一：栈

#### 思路

使用栈来跟踪括号的匹配情况。栈底始终保存当前最长有效括号子串的起始位置的前一个位置。

具体步骤：
1. 初始化栈，将 `-1` 压入栈作为基准位置。
2. 遍历字符串：
   - 遇到 `'('`，将当前索引压入栈。
   - 遇到 `')'`，弹出栈顶元素：
     - 如果栈为空，将当前索引压入栈作为新的基准位置。
     - 如果栈不为空，计算当前索引与栈顶元素的差值，更新最长长度。

#### 复杂度分析

- **时间复杂度**：O(n)，其中 `n` 是字符串长度。每个字符最多被压入和弹出栈一次。
- **空间复杂度**：O(n)，最坏情况下需要存储所有字符的索引。

### 方法二：动态规划

#### 思路

使用动态规划数组 `dp`，其中 `dp[i]` 表示以第 `i` 个字符结尾的最长有效括号子串的长度。

状态转移：
- 如果 `s[i] == ')'` 且 `s[i-1] == '('`，则 `dp[i] = dp[i-2] + 2`
- 如果 `s[i] == ')'` 且 `s[i-1] == ')'` 且 `s[i-dp[i-1]-1] == '('`，则 `dp[i] = dp[i-1] + dp[i-dp[i-1]-2] + 2`

#### 复杂度分析

- **时间复杂度**：O(n)，仅需遍历一次字符串。
- **空间复杂度**：O(n)，需要额外的动态规划数组。

## 代码实现

```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

class Solution {
public:
    int longestValidParentheses(string s) {
        int max_len = 0;
        stack<int> st;
        st.push(-1);
        
        for (int i = 0; i < s.size(); i++) {
            if (s[i] == '(') {
                st.push(i);
            } else {
                st.pop();
                if (st.empty()) {
                    st.push(i);
                } else {
                    max_len = max(max_len, i - st.top());
                }
            }
        }
        
        return max_len;
    }
};
```

```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    int longestValidParentheses(string s) {
        int n = s.size();
        int max_len = 0;
        vector<int> dp(n, 0);
        
        for (int i = 1; i < n; i++) {
            if (s[i] == ')') {
                if (s[i-1] == '(') {
                    dp[i] = (i >= 2 ? dp[i-2] : 0) + 2;
                } else if (i - dp[i-1] > 0 && s[i - dp[i-1] - 1] == '(') {
                    dp[i] = dp[i-1] + (i - dp[i-1] >= 2 ? dp[i - dp[i-1] - 2] : 0) + 2;
                }
                max_len = max(max_len, dp[i]);
            }
        }
        
        return max_len;
    }
};
```
