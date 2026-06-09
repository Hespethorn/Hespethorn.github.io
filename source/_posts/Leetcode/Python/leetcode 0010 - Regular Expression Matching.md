---
title: Leetcode 0010. Regular Expression Matching (python)
tags:
  - leetcode
  - python
  - 动态规划
  - 正则表达式
  - 递归
categories:
  - Leetcode
series: Leetcode-Cpp-Python
abbrlink: 'regex-matching-dp'
date: 2024-02-17 20:47:00
---

# [10. Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/)

## 题目

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

**Constraints:**

- `1 <= s.length <= 20`
- `1 <= p.length <= 30`
- `s` contains only lowercase English letters.
- `p` contains only lowercase English letters, `'.'`, and `'*'`.
- It is guaranteed for each appearance of the character `'*'`, there will be a previous valid character to match.

## 题目大意

实现一个支持 `'.'` 和 `'*'` 的正则表达式匹配。其中 `'.'` 匹配任意单个字符，`'*'` 匹配零个或多个前面的元素。要求匹配整个输入字符串，而非部分匹配。

---

## 你选用何种方法解题？

本题是动态规划的经典应用场景，有两种主流思路：

| 方法 | 核心思路 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---|:---:|:---:|:---|
| 方法一：递归 + 记忆化 | 暴力递归搜索所有可能，用记忆化避免重复计算 | O(m×n) | O(m×n) | **最直观**：思路清晰，容易理解 |
| 方法二：动态规划（DP） | 构建二维 DP 表，自底向上填充 | O(m×n) | O(m×n) | **最优工程解**：迭代实现，无递归栈开销 |

**方法二是推荐解**：动态规划方法通过表格化的方式系统地枚举所有可能的匹配情况，代码结构清晰，便于维护和理解。

---

## 解题过程

### 问题分析

正则表达式匹配的核心难点在于 `'*'` 的处理：
- `'*'` 可以匹配零个前面的元素（如 `"a*"` 可以匹配空字符串）
- `'*'` 可以匹配一个或多个前面的元素（如 `"a*"` 可以匹配 `"a"`、`"aa"`、`"aaa"` 等）

### 核心洞察

定义 `dp[i][j]` 表示 `s` 的前 `i` 个字符与 `p` 的前 `j` 个字符是否匹配。

状态转移需要考虑以下情况：
1. 普通字符匹配：`s[i-1] == p[j-1]`
2. 通配符匹配：`p[j-1] == '.'`
3. `'*'` 匹配零个前面的元素
4. `'*'` 匹配一个或多个前面的元素

### 手推演示例

以 `s = "aa"`, `p = "a*"` 为例：

```
初始化 DP 表（行表示 s，列表示 p）：
     ""  a  *
  "" T   F  F
  a  F   ?  ?
  a  F   ?  ?

填充过程：
1. dp[0][2] = dp[0][0] = T （"a*" 匹配空串）
2. dp[1][1] = dp[0][0] = T （"a" 匹配 "a"）
3. dp[1][2] = dp[1][0] (F) OR dp[0][2] (T) = T （"a*" 匹配 "a"）
4. dp[2][1] = F （"a" 不匹配 "aa"）
5. dp[2][2] = dp[2][0] (F) OR dp[1][2] (T) = T （"a*" 匹配 "aa"）

最终结果：dp[2][2] = T ✓
```

---

## 这些方法具体怎么运用？

### 方法一：递归 + 记忆化

**数据结构**：字典 `memo` 存储已计算的状态。

**核心逻辑**：
1. 递归终止条件：模式串为空时，检查字符串是否也为空
2. 当前字符匹配时（相同或模式为 `'.'`），继续匹配下一个字符
3. 遇到 `'*'` 时，有两种选择：匹配零个或匹配一个/多个

```python
def isMatch(s: str, p: str) -> bool:
    memo = {}
    
    def dp(i: int, j: int) -> bool:
        if (i, j) in memo:
            return memo[(i, j)]
        
        # 模式串已用完
        if j == len(p):
            return i == len(s)
        
        # 当前字符是否匹配
        first_match = i < len(s) and (p[j] == s[i] or p[j] == '.')
        
        # 处理 '*' 情况
        if j + 1 < len(p) and p[j + 1] == '*':
            # 两种选择：匹配零个 or 匹配一个/多个
            result = dp(i, j + 2) or (first_match and dp(i + 1, j))
        else:
            # 普通匹配
            result = first_match and dp(i + 1, j + 1)
        
        memo[(i, j)] = result
        return result
    
    return dp(0, 0)
```

### 方法二：动态规划（推荐）

**数据结构**：二维布尔数组 `dp`。

**核心逻辑**：
1. 初始化边界条件
2. 填充 DP 表
3. 返回最终结果

**状态转移表**：

| 情况 | 条件 | 转移方程 |
|:---|:---|:---|
| 普通字符匹配 | `s[i-1] == p[j-1]` 或 `p[j-1] == '.'` | `dp[i][j] = dp[i-1][j-1]` |
| `'*'` 匹配零个 | `p[j-1] == '*'` | `dp[i][j] = dp[i][j-2]` |
| `'*'` 匹配多个 | `p[j-1] == '*'` 且前一字符匹配 | `dp[i][j] |= dp[i-1][j]` |

**边界情况**：

| 场景 | 输入 | 关键点 | 结果 |
|:---|:---|:---|:---|
| 空串匹配空模式 | `s=""`, `p=""` | `dp[0][0] = True` | `true` |
| 空串匹配 `a*` | `s=""`, `p="a*"` | `dp[0][2] = dp[0][0]` | `true` |
| 单字符匹配 `.` | `s="a"`, `p="."` | `dp[1][1] = dp[0][0]` | `true` |
| 不匹配 | `s="aa"`, `p="a"` | `dp[2][1] = False` | `false` |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 递归 + 记忆化 | **O(m×n)** | **O(m×n)** | 每个状态计算一次 |
| 动态规划 | **O(m×n)** | **O(m×n)** | 二维 DP 表 |

两种方法的时间复杂度相同，但动态规划避免了递归调用的开销，实际性能更好。

---

## 总结与最佳选择

**最快算法**：动态规划方法，无递归栈开销。

**工程最优选择**：**动态规划（方法二）**，理由：
1. **逻辑清晰**：状态转移方程明确，易于理解和维护
2. **性能稳定**：迭代实现，避免递归深度限制
3. **扩展性强**：便于添加额外的正则特性

**各方法的使用场景**：
- **递归 + 记忆化**：快速原型开发，代码量少
- **动态规划**：生产环境，性能更优

**一句话**：正则表达式匹配的核心是状态转移——用 DP 表记录每一步的匹配状态，`'*'` 的处理是关键。

---

## Code

### 方法一：递归 + 记忆化

```python
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        """递归 + 记忆化：暴力搜索所有可能，用记忆化避免重复计算。
        时间复杂度 O(m×n)，空间复杂度 O(m×n)。
        """
        memo = {}
        
        def dp(i: int, j: int) -> bool:
            if (i, j) in memo:
                return memo[(i, j)]
            
            if j == len(p):
                return i == len(s)
            
            first_match = i < len(s) and (p[j] == s[i] or p[j] == '.')
            
            if j + 1 < len(p) and p[j + 1] == '*':
                result = dp(i, j + 2) or (first_match and dp(i + 1, j))
            else:
                result = first_match and dp(i + 1, j + 1)
            
            memo[(i, j)] = result
            return result
        
        return dp(0, 0)
```

### 方法二：动态规划（推荐）

```python
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        """动态规划：构建二维 DP 表，自底向上填充。
        dp[i][j] 表示 s 的前 i 个字符与 p 的前 j 个字符是否匹配。
        时间复杂度 O(m×n)，空间复杂度 O(m×n)。
        """
        m, n = len(s), len(p)
        
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True  # 空字符串匹配空模式
        
        # 处理模式中可能匹配空字符串的情况（主要是 '*' 的作用）
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]
        
        # 填充 DP 表
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                # 当前字符匹配（相同字符或模式为 '.'）
                if s[i - 1] == p[j - 1] or p[j - 1] == '.':
                    dp[i][j] = dp[i - 1][j - 1]
                # 模式当前字符是 '*'，需要特殊处理
                elif p[j - 1] == '*':
                    # '*' 匹配 0 个前面的元素
                    dp[i][j] = dp[i][j - 2]
                    
                    # 如果前面的字符匹配，可以考虑 '*' 匹配 1 个或多个
                    if s[i - 1] == p[j - 2] or p[j - 2] == '.':
                        dp[i][j] |= dp[i - 1][j]
        
        return dp[m][n]
```

### 方法三：动态规划（空间优化版）

```python
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        """动态规划空间优化版：使用一维数组代替二维数组。
        时间复杂度 O(m×n)，空间复杂度 O(n)。
        """
        m, n = len(s), len(p)
        
        dp = [False] * (n + 1)
        dp[0] = True  # 空字符串匹配空模式
        
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[j] = dp[j - 2]
        
        for i in range(1, m + 1):
            new_dp = [False] * (n + 1)
            for j in range(1, n + 1):
                if s[i - 1] == p[j - 1] or p[j - 1] == '.':
                    new_dp[j] = dp[j - 1]
                elif p[j - 1] == '*':
                    new_dp[j] = new_dp[j - 2]
                    if s[i - 1] == p[j - 2] or p[j - 2] == '.':
                        new_dp[j] |= dp[j]
            dp = new_dp
        
        return dp[n]
```