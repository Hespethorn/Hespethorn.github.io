---
title: Leetcode 0150. Evaluate Reverse Polish Notation
tags:
  - leetcode
categories:
  - Leetcode
  - Stack
series: Leetcode
abbrlink: a5569a6f
date: 2023-09-28 20:26:00
---

## [150. Evaluate Reverse Polish Notation](https://leetcode.cn/problems/evaluate-reverse-polish-notation/)

You are given an array of strings `tokens` that represents an arithmetic expression in a [Reverse Polish Notation](http://en.wikipedia.org/wiki/Reverse_Polish_notation).

Evaluate the expression. Return *an integer that represents the value of the expression*.

**Note** that:

- The valid operators are `'+'`, `'-'`, `'*'`, and `'/'`.
- Each operand may be an integer or another expression.
- The division between two integers always **truncates toward zero**.
- There will not be any division by zero.
- The input represents a valid arithmetic expression in a reverse polish notation.
- The answer and all the intermediate calculations can be represented in a **32-bit** integer.

**Example 1:**

```
Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9
```

**Example 2:**

```
Input: tokens = ["4","13","5","/","+"]
Output: 6
Explanation: (4 + (13 / 5)) = 6
```

**Example 3:**

```
Input: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]
Output: 22
Explanation: ((10 * (6 / ((9 + 3) * -11))) + 17) + 5
= ((10 * (6 / (12 * -11))) + 17) + 5
= ((10 * (6 / -132)) + 17) + 5
= ((10 * 0) + 17) + 5
= (0 + 17) + 5
= 17 + 5
= 22
```

## 题目大意

给定一个表示算术表达式的逆波兰表示法（Reverse Polish Notation）的字符串数组 `tokens`，要求计算该表达式的值并返回结果。

逆波兰表示法是一种数学表达式方式，其中每个运算符位于其操作数之后，因此也称为后缀表示法。这种表示法的优势是不需要括号来表示运算的优先级。

### 关键说明

- 有效的运算符为 '+', '-', '*', '/'
- 每个操作数可以是整数或另一个表达式的结果
- 两个整数相除时，结果总是向零截断（例如 13/5=2，-13/5=-2）
- 输入保证是有效的逆波兰表达式，不会出现除零情况
- 结果和所有中间计算都可以用 32 位整数表示

## 解题思路

逆波兰表达式的计算非常适合使用栈（Stack）数据结构来解决，具体步骤如下：

1. 遍历表达式中的每个 token
2. 如果 token 是数字，将其转换为整数并压入栈中
3. 如果 token 是运算符，则从栈中弹出两个元素：
   - 第一个弹出的元素是右操作数
   - 第二个弹出的元素是左操作数
   - 对这两个操作数应用当前运算符
   - 将运算结果压回栈中
4. 遍历结束后，栈中只剩下一个元素，即为表达式的结果

```
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<int> st;
        
        for (const string& token : tokens) {
            // 判断当前token是否为运算符
            if (token.size() == 1 && !isdigit(token[0])) {
                // 弹出两个操作数，注意顺序
                int b = st.top(); st.pop();
                int a = st.top(); st.pop();
                
                // 根据运算符进行计算
                if (token == "+") {
                    st.push(a + b);
                } else if (token == "-") {
                    st.push(a - b);
                } else if (token == "*") {
                    st.push(a * b);
                } else if (token == "/") {
                    // 除法向零截断
                    st.push(a / b);
                }
            } else {
                // 数字直接入栈
                st.push(stoi(token));
            }
        }
        
        // 栈中最后剩下的元素就是结果
        return st.top();
    }
};
```