---
title: Leetcode 0227. Basic Calculator II
tags:
  - leetcode
categories:
  - Leetcode
  - Stack
series: Leetcode-Cpp
abbrlink: cb0c2dcd
date: 2023-11-12 20:15:00
---

## [227. Basic Calculator II](https://leetcode.cn/problems/basic-calculator-ii/)

Given a string `s` which represents an expression, *evaluate this expression and return its value*. 

The integer division should truncate toward zero.

You may assume that the given expression is always valid. All intermediate results will be in the range of `[-231, 231 - 1]`.

**Note:** You are not allowed to use any built-in function which evaluates strings as mathematical expressions, such as `eval()`.

## 题目大意

给定一个字符串 `s` 表示一个算术表达式，要求计算该表达式的值并返回。表达式仅包含非负整数、`+`、`-`、`*`、`/` 四种运算符，以及可能的空格。整数除法需要向零截断，且输入表达式保证有效。

注意：不允许使用任何内置的表达式求值函数（如 `eval()`）。

## 核心思路

该实现的核心思想是利用栈来处理运算符的优先级问题：

- 对于加法和减法，将操作数（或其相反数）直接压入栈中
- 对于乘法和除法，立即与栈顶元素进行计算并更新栈顶
- 最后遍历所有元素后，将栈中所有元素求和得到最终结果

这种方法能够正确处理运算符优先级，先计算所有乘除运算，再计算加减运算。

```
class Solution {
public:
  int calculate(const string &s) {
    char sign = '+';
    vector<int> stack;

    stack.reserve(20);

    for (int pos{0}, num = 0; pos < s.size(); ++pos) {
      if (isdigit(s[pos]))
        num = num * 10 + (s[pos] - '0');

      if ((!isdigit(s[pos]) && s[pos] != ' ') || pos + 1 == s.size()) {
        switch (sign) {
          case '+':
            stack.push_back(num);
            break;
          case '-':
            stack.push_back(-num);
            break;
          default:
            const int top = stack.back();
            stack.pop_back();

            if (sign == '*')
              stack.push_back(top * num);
            else
              stack.push_back(top / num);
        }

        num = 0;
        sign = s[pos];
      }
    }

    return ranges::fold_left(stack.begin(), stack.end(), 0, plus{});
  }
};
```