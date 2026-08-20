---
title: Leetcode 0013. Roman to Integer
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: 'roman-to-integer'
date: 2023-02-11
---

# [13. Roman to Integer](https://leetcode.com/problems/roman-to-integer/)

## 题目

Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.

```
Symbol       Value
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
```

For example, `2` is written as `II` in Roman numeral, just two one's added together. `12` is written as `XII`, which is simply `X + II`. The number `27` is written as `XXVII`, which is `XX + V + II`.

Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`. There are six instances where subtraction is used:

- `I` can be placed before `V` (5) and `X` (10) to make 4 and 9.
- `X` can be placed before `L` (50) and `C` (100) to make 40 and 90.
- `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.

Given a roman numeral, convert it to an integer.

**Example 1:**

```
Input: s = "III"
Output: 3
Explanation: III represents 3.
```

**Example 2:**

```
Input: s = "LVIII"
Output: 58
Explanation: L = 50, V = 5, III = 3.
```

**Example 3:**

```
Input: s = "MCMXCIV"
Output: 1994
Explanation: M = 1000, CM = 900, XC = 90, IV = 4.
```

**Constraints:**

- `1 <= s.length <= 15`
- `s` contains only the characters `('I', 'V', 'X', 'L', 'C', 'D', 'M')`.
- It is guaranteed that `s` is a valid roman numeral in the range `[1, 3999]`.

## 算法思路

### 核心原理

罗马数字的转换规则：
1. 普通情况：每个字符直接对应其数值
2. 特殊减法规则：当较小的数字在较大的数字前面时，需要减去较小的数字

关键观察：**从左到右遍历时，如果当前字符的值小于下一个字符的值，则需要减去当前值；否则加上当前值。**

### 手推演示例

以 `s = "MCMXCIV"` 为例：

```
M=1000, C=100, M=1000, X=10, C=100, I=1, V=5

M: 1000 < 1000? 否 → +1000
C: 100 < 1000? 是 → -100
M: 1000 < 10? 否 → +1000
X: 10 < 100? 是 → -10
C: 100 < 1? 否 → +100
I: 1 < 5? 是 → -1
V: 最后一位 → +5

结果: 1000 - 100 + 1000 - 10 + 100 - 1 + 5 = 1994
```

### 代码实现

```cpp
class Solution {
public:
    int romanToInt(string s) {
        unordered_map<char, int> roman = {
            {'I', 1},
            {'V', 5},
            {'X', 10},
            {'L', 50},
            {'C', 100},
            {'D', 500},
            {'M', 1000}
        };
        
        int n = s.size();
        int result = 0;
        
        for (int i = 0; i < n; i++) {
            // 如果当前字符的值小于下一个字符的值，则减去当前值
            if (i < n - 1 && roman[s[i]] < roman[s[i + 1]]) {
                result -= roman[s[i]];
            } else {
                result += roman[s[i]];
            }
        }
        
        return result;
    }
};
```

### 代码解析

**哈希表存储映射**：
- 使用 `unordered_map` 存储字符到数值的映射，时间复杂度 O(1)

**核心逻辑**：
1. 从左到右遍历字符串
2. 比较当前字符和下一个字符的值
3. 如果当前值小于下一个值，执行减法；否则执行加法
4. 最后一位字符一定是加法（没有下一个字符可比较）

**边界情况处理**：
- `s.length() == 1`：直接返回单个字符对应的值
- 最后一个字符：没有下一个字符可比较，直接加到结果中

### 复杂度分析

| 指标 | 复杂度 | 说明 |
|:---|:---:|:---|
| **时间复杂度** | O(n) | 只需遍历字符串一次 |
| **空间复杂度** | O(1) | 哈希表大小固定为 7 |

### 特殊用例验证

| 罗马数字 | 特殊规则 | 计算过程 | 结果 |
|:---|:---|:---|:---:|
| `IV` | I < V，减 I | -1 + 5 | 4 |
| `IX` | I < X，减 I | -1 + 10 | 9 |
| `XL` | X < L，减 X | -10 + 50 | 40 |
| `XC` | X < C，减 X | -10 + 100 | 90 |
| `CD` | C < D，减 C | -100 + 500 | 400 |
| `CM` | C < M，减 C | -100 + 1000 | 900 |

### 补充：第 12 题的逆问题

本题是 **第 12 题（整数转罗马数字）** 的逆问题：

| 题目 | 输入 | 输出 | 方法 |
|:---|:---|:---|:---|
| 第 12 题 | 整数 | 罗马数字 | 贪心算法 |
| 第 13 题 | 罗马数字 | 整数 | 单次遍历 |

两道题都利用了罗马数字的特殊减法规则。