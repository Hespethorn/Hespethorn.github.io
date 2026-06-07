---
title: Leetcode 0022.GenerateParentheses
tags:
  - C语言
  - 数据结构
  - 程序
  - 函数
categories:
  - C-Code
series: Leecode
abbrlink: 57fc8873
date: 2023-03-11 19:21:00
---

# [22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)


## 题目

Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

For example, given n = 3, a solution set is:


    [
      "((()))",
      "(()())",
      "(())()",
      "()(())",
      "()()()"
    ]


## 题目大意

给出 n 代表生成括号的对数，请你写出一个函数，使其能够生成所有可能的并且有效的括号组合。


## 解题思路

- 这道题乍一看需要判断括号是否匹配的问题，如果真的判断了，那时间复杂度就到 O(n * 2^n)了，虽然也可以 AC，但是时间复杂度巨高。
- 这道题实际上不需要判断括号是否匹配的问题。因为在 DFS 回溯的过程中，会让 `(` 和 `)` 成对的匹配上的。

```
class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        string current;
        backtrack(result, current, 0, 0, n);
        return result;
    }
private:
    void backtrack(vector<string>&result, string &current, int open, int close, int n) {
         // 终止条件：左右括号都用完
        if (current.size() == 2 * n) {
            result.push_back(current);
            return;
        }
        
        // 可以添加左括号的条件：左括号数量未达上限
        if (open < n) {
            current.push_back('(');
            backtrack(result, current, open + 1, close, n);
            current.pop_back(); // 回溯
        }
        
        // 可以添加右括号的条件：右括号数量小于左括号数量
        if (close < open) {
            current.push_back(')');
            backtrack(result, current, open, close + 1, n);
            current.pop_back(); // 回溯
        }
    }
};
```

### 灵神的思路：

```
class Solution {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> ans;
        vector<int> path; // 记录左括号的下标

        // 目前填了 i 个括号
        // 这 i 个括号中的左括号个数 - 右括号个数 = balance
        auto dfs = [&](this auto&& dfs, int i, int balance) {
            if (path.size() == n) {
                string s(n * 2, ')');
                for (int j : path) {
                    s[j] = '(';
                }
                ans.emplace_back(s);
                return;
            }
            // 枚举填 right=0,1,2,...,balance 个右括号
            for (int right = 0; right <= balance; right++) {
                // 先填 right 个右括号，然后填 1 个左括号，记录左括号的下标 i+right
                path.push_back(i + right);
                dfs(i + right + 1, balance - right + 1);
                path.pop_back(); // 恢复现场
            }
        };

        dfs(0, 0);
        return ans;
    }
};
```

