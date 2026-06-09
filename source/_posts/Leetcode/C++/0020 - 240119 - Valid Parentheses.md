---
title: Leetcode 0020. Valid Parentheses
tags:
  - leetcode
categories:
  - Leetcode
  - Stack
series: Leetcode-Cpp
abbrlink: f8df0d33
date: 2023-03-04 21:01:00
---

## [20. Valid Parentheses](https://leetcode.cn/problems/valid-parentheses/)

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

## 题目大意

给定一个只包含 `'('`、`')'`、`'{'`、`'}'`、`'['` 和 `']'` 的字符串，判断该字符串是否有效。有效字符串需满足：

1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的相同类型的左括号。

## 解题思路

判断括号有效性的经典解法是使用**栈**数据结构，核心思路如下：

1. 遍历字符串中的每个字符。
2. 遇到左括号（`'('`、`'{'`、`'['`）时，将其压入栈中。
3. 遇到右括号时：
   - 若栈为空，说明没有对应的左括号，直接返回 `false`。
   - 弹出栈顶元素，检查是否与当前右括号匹配（如 `')'` 对应 `'('`）。
   - 若不匹配，返回 `false`。
4. 遍历结束后，若栈为空，说明所有左括号都有匹配的右括号，返回 `true`；否则返回 `false`。

```
class Solution {
public:
    string removeDuplicates(string s) {
        // 用vector模拟栈，效率比stack更高
        vector<char> stack;
        
        for (char c : s) {
            // 若栈不为空且栈顶元素与当前字符相同，则弹出栈顶（删除重复）
            if (!stack.empty() && stack.back() == c) {
                stack.pop_back();
            } else {
                // 否则将当前字符压入栈
                stack.push_back(c);
            }
        }
        
        // 将栈中剩余字符转换为字符串返回
        return string(stack.begin(), stack.end());
    }
};
```