---

title: Leetcode 0013. Roman to Integer (python)
tags:
  - leetcode
  - python
  - 哈希表
  - 字符串
categories: [Algorithms, Leetcode-Python]
series: [Leetcode-Python]
abbrlink: 'roman-to-integer-py'
date: 2024-03-02

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

## 题目大意

将罗马数字转换为整数。罗马数字使用特定的符号表示不同的值，且有特殊的减法规则（如 IV 表示 4，IX 表示 9 等）。

---

## 你选用何种方法解题？

本题有三种主流解法：

| 方法 | 核心思路 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---|:---:|:---:|:---|
| 方法一：哈希表 + 单次遍历（推荐） | 利用减法规则，单次遍历完成转换 | O(n) | O(1) | **最优解**：代码简洁，效率高 |
| 方法二：switch-case 映射 | 使用 switch-case 或字典映射 | O(n) | O(1) | **直观实现**：易于理解 |
| 方法三：逐一判断 | 使用 if-elif 判断每个字符 | O(n) | O(1) | **最原始**：不使用数据结构 |

**方法一是推荐解**：利用"当前值小于下一个值则减去当前值"的规则，一行代码即可完成核心逻辑。

---

## 解题过程

### 问题分析

罗马数字的关键是处理 6 个特殊减法组合：
- 4 = IV, 9 = IX
- 40 = XL, 90 = XC
- 400 = CD, 900 = CM

### 核心洞察

**从左到右遍历时，如果当前字符的值小于下一个字符的值，则需要减去当前值；否则加上当前值。**

这个规则的原理：
- 对于 `IV`：I(1) < V(5)，所以结果是 V - I = 5 - 1 = 4
- 对于 `VI`：V(5) > I(1)，所以结果是 V + I = 5 + 1 = 6

### 手推演示例

以 `s = "MCMXCIV"` 为例：

```
M=1000, C=100, M=1000, X=10, C=100, I=1, V=5

遍历过程：
M: 1000 < 1000? 否 → +1000 → result = 1000
C: 100 < 1000? 是 → -100  → result = 900
M: 1000 < 10? 否 → +1000 → result = 1900
X: 10 < 100? 是 → -10   → result = 1890
C: 100 < 1? 否 → +100  → result = 1990
I: 1 < 5? 是 → -1      → result = 1989
V: 最后一位 → +5       → result = 1994

最终结果: 1994
```

### 特殊用例验证

| 罗马数字 | 特殊规则 | 计算过程 | 结果 |
|:---|:---|:---|:---:|
| `IV` | I < V，减 I | -1 + 5 | 4 |
| `IX` | I < X，减 I | -1 + 10 | 9 |
| `XL` | X < L，减 X | -10 + 50 | 40 |
| `XC` | X < C，减 X | -10 + 100 | 90 |
| `CD` | C < D，减 C | -100 + 500 | 400 |
| `CM` | C < M，减 C | -100 + 1000 | 900 |

---

## 这些方法具体怎么运用？

### 方法一：哈希表 + 单次遍历（推荐）

**数据结构**：字典 `roman` 存储字符到数值的映射。

**核心逻辑**：
1. 建立字符到数值的映射表
2. 从左到右遍历字符串
3. 比较当前字符和下一个字符的值
4. 如果当前值小于下一个值，执行减法；否则执行加法

### 方法二：字典映射

**核心逻辑**：与方法一类似，使用字典存储映射。

### 方法三：逐一判断

**核心逻辑**：使用 if-elif 判断每个字符是否属于特殊组合。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 哈希表 + 遍历 | O(n) | O(1) | 最优 |
| 字典映射 | O(n) | O(1) | 同上 |
| 逐一判断 | O(n) | O(1) | 代码较长 |

所有方法的时间复杂度都是 O(n)，空间复杂度都是 O(1)。

---

## 总结与最佳选择

**最快算法**：哈希表 + 单次遍历，代码最简洁。

**工程最优选择**：**哈希表 + 单次遍历（方法一）**，理由：
1. **代码简洁**：核心逻辑仅需一行
2. **效率最高**：单次遍历，无重复计算
3. **易于维护**：映射表清晰明了

**各方法的使用场景**：
- **哈希表 + 遍历**：生产环境，推荐使用
- **字典映射**：与方法一等价
- **逐一判断**：学习理解逻辑时使用

**与第 12 题的关系**：本题是第 12 题（整数转罗马数字）的逆问题。

---

## Code

### 方法一：哈希表 + 单次遍历（推荐）

```python
class Solution:
    def romanToInt(self, s: str) -> int:
        """哈希表 + 单次遍历：利用减法规则，单次遍历完成转换。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        roman = {
            'I': 1,
            'V': 5,
            'X': 10,
            'L': 50,
            'C': 100,
            'D': 500,
            'M': 1000
        }
        
        result = 0
        n = len(s)
        
        for i in range(n):
            # 如果当前值小于下一个值，则减去当前值
            if i < n - 1 and roman[s[i]] < roman[s[i + 1]]:
                result -= roman[s[i]]
            else:
                result += roman[s[i]]
        
        return result
```

### 方法二：字典映射（简洁版）

```python
class Solution:
    def romanToInt(self, s: str) -> int:
        """字典映射：使用字典存储映射，简洁实现。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        roman = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
        return sum(roman[s[i]] * (-1 if i < len(s) - 1 and roman[s[i]] < roman[s[i + 1]] else 1) for i in range(len(s)))
```

### 方法三：逐一判断

```python
class Solution:
    def romanToInt(self, s: str) -> int:
        """逐一判断：使用 if-elif 判断每个字符或组合。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        result = 0
        n = len(s)
        i = 0
        
        while i < n:
            if s[i] == 'I':
                if i + 1 < n and s[i + 1] == 'V':
                    result += 4
                    i += 2
                elif i + 1 < n and s[i + 1] == 'X':
                    result += 9
                    i += 2
                else:
                    result += 1
                    i += 1
            elif s[i] == 'X':
                if i + 1 < n and s[i + 1] == 'L':
                    result += 40
                    i += 2
                elif i + 1 < n and s[i + 1] == 'C':
                    result += 90
                    i += 2
                else:
                    result += 10
                    i += 1
            elif s[i] == 'C':
                if i + 1 < n and s[i + 1] == 'D':
                    result += 400
                    i += 2
                elif i + 1 < n and s[i + 1] == 'M':
                    result += 900
                    i += 2
                else:
                    result += 100
                    i += 1
            else:
                result += {'V': 5, 'L': 50, 'D': 500, 'M': 1000}[s[i]]
                i += 1
        
        return result
```