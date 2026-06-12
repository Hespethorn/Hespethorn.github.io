---
title: Leetcode 0020.Valid Parentheses(python)
tags:
  - leetcode
  - python
  - 栈
  - 字符串
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'valid-parentheses'
date: 2024-04-06
---

# [20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)

## 题目

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**

```
Input: s = "()"
Output: true
```

**Example 2:**

```
Input: s = "()[]{}"
Output: true
```

**Example 3:**

```
Input: s = "(]"
Output: false
```

## 题目大意

给定一个只包含括号的字符串，判断字符串是否有效。有效的字符串需要满足：
1. 左括号必须用相同类型的右括号闭合
2. 左括号必须以正确的顺序闭合
3. 每个右括号都有对应的左括号

---

## 你选用何种方法解题？

本题的核心是**使用栈来匹配括号**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 栈 + match-case | O(n) | O(n) | **推荐** |
| 栈 + 字典映射 | O(n) | O(n) | 推荐 |
| 暴力替换 | O(n²) | O(n) | 不推荐 |

**方法选择理由**：
- **栈 + match-case**：代码简洁，逻辑清晰，使用 Python 3.10+ 的 match-case 语法
- **栈 + 字典映射**：兼容性更好，适合所有 Python 版本
- **暴力替换**：效率低，不推荐使用

---

## 解题过程

### 问题分析

输入：只包含括号的字符串 `s`
输出：布尔值，表示字符串是否有效

关键约束：
- 括号必须正确嵌套和匹配
- 空字符串是有效的

### 核心洞察

1. **栈的特性**：后进先出（LIFO），适合处理嵌套结构
2. **匹配规则**：遇到左括号入栈，遇到右括号时检查栈顶是否为对应的左括号
3. **match-case**：Python 3.10+ 的模式匹配语法，代码更简洁

### 算法流程

以 `s = "()[]{}"` 为例：

```
遍历过程：
'(' → 入栈 → stack = ['(']
')' → 弹出 '('，匹配成功 → stack = []
'[' → 入栈 → stack = ['[']
']' → 弹出 '['，匹配成功 → stack = []
'{' → 入栈 → stack = ['{']
'}' → 弹出 '{'，匹配成功 → stack = []

最终栈为空，返回 True
```

### 无效情况示例

| 情况 | 输入 | 原因 |
|:---|:---|:---|
| 类型不匹配 | "(]" | ')' 与 '[' 不匹配 |
| 右括号过多 | "())" | 第二个 ')' 没有对应的左括号 |
| 左括号过多 | "(()" | 遍历结束后栈不为空 |

---

## 这些方法具体怎么运用？

### 方法：栈 + match-case（推荐）

**数据结构**：栈（列表模拟）

**核心逻辑**：
1. **初始化栈**：`st = []`
2. **遍历字符串**：
   - 遇到左括号 `'('`, `'['`, `'{'` → 入栈
   - 遇到右括号 → 检查栈是否为空或栈顶是否匹配
3. **最终检查**：栈为空则有效，否则无效

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 空字符串 | 直接返回 True |
| 右括号开头 | 栈为空时遇到右括号，返回 False |
| 遍历结束后栈不为空 | 返回 False |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 栈 + match-case | **O(n)** | **O(n)** | 每个字符入栈出栈各一次 |
| 栈 + 字典映射 | O(n) | O(n) | 同上 |
| 暴力替换 | O(n²) | O(n) | 每次替换需要遍历字符串 |

---

## 总结与最佳选择

**最快算法**：**栈 + match-case**。代码简洁，效率高。

**工程最优选择**：**栈 + match-case**（Python 3.10+）或 **栈 + 字典映射**（兼容性更好）。理由如下：
1. **时间效率高**：O(n) 时间复杂度
2. **空间效率合理**：O(n) 空间复杂度
3. **代码简洁**：逻辑清晰，易于理解
4. **适用性广**：可以扩展到更多类型的括号

---

## Code

### 方法：栈 + match-case（推荐）

```python
class Solution:
    def isValid(self, s: str) -> bool:
        """
        栈 + match-case 法：
        1. 遇到左括号入栈
        2. 遇到右括号检查栈顶是否匹配
        3. 最终栈为空则有效
        """
        st = []
        
        for ch in s:
            match ch:
                case '(' | '[' | '{':
                    st.append(ch)
                
                case ')':
                    if not st or st.pop() != '(':
                        return False
                
                case ']':
                    if not st or st.pop() != '[':
                        return False
                
                case '}':
                    if not st or st.pop() != '{':
                        return False
        
        return len(st) == 0
```

### 方法二：栈 + 字典映射（兼容性更好）

```python
class Solution:
    def isValid(self, s: str) -> bool:
        """
        栈 + 字典映射法：
        1. 使用字典存储右括号到左括号的映射
        2. 遇到左括号入栈
        3. 遇到右括号检查栈顶是否匹配
        """
        stack = []
        mapping = {')': '(', ']': '[', '}': '{'}
        
        for char in s:
            if char in mapping:
                # 右括号：检查栈顶是否匹配
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                # 左括号：入栈
                stack.append(char)
        
        return not stack
```