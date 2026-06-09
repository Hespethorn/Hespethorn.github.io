---
title: Leetcode 0012. Integer to Roman (python)
tags:
  - leetcode
  - python
  - 贪心算法
  - 字符串
  - match-case
categories:
  - Leetcode
series: Leetcode-Cpp-Python
abbrlink: 'integer-to-roman'
date: 2024-02-27 20:51:00
---

# [12. Integer to Roman](https://leetcode.com/problems/integer-to-roman/)

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

Given an integer, convert it to a roman numeral.

**Example 1:**

```
Input: num = 3
Output: "III"
Explanation: 3 is represented as 3 ones.
```

**Example 2:**

```
Input: num = 58
Output: "LVIII"
Explanation: L = 50, V = 5, III = 3.
```

**Example 3:**

```
Input: num = 1994
Output: "MCMXCIV"
Explanation: M = 1000, CM = 900, XC = 90, IV = 4.
```

**Constraints:**

- `1 <= num <= 3999`

## 题目大意

将一个整数转换为罗马数字。罗马数字使用特定的符号表示不同的值，且有特殊的减法规则（如 IV 表示 4，IX 表示 9 等）。

---

## 你选用何种方法解题？

本题有三种主流解法：

| 方法 | 核心思路 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---|:---:|:---:|:---|
| 方法一：贪心算法（推荐） | 从大到小依次减去对应值并拼接符号 | O(1) | O(1) | **最优解**：固定 13 种符号组合 |
| 方法二：逐位处理 | 按千位、百位、十位、个位分别处理 | O(1) | O(1) | **最直观**：按位映射 |
| 方法三：match-case 尝试 | 使用 Python 3.10+ 的 match-case 语法 | O(1) | O(1) | **语法探索**：展示新语法用法 |

**方法一是推荐解**：贪心算法简洁高效，只需遍历固定的 13 种符号组合。

---

## 解题过程

### 问题分析

罗马数字的关键是处理 6 个特殊减法组合：
- 4 = IV, 9 = IX
- 40 = XL, 90 = XC
- 400 = CD, 900 = CM

### 核心洞察

贪心策略：从最大的符号开始，尽可能多地使用当前符号，然后处理剩余值。

### 贪心算法步骤

```
数值: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
符号: ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]

对于每个数值-符号对：
    while num >= value:
        将符号添加到结果
        num -= value
```

### match-case 方法说明

Python 3.10+ 的 match-case 支持 guard clauses，可以实现类似的分支逻辑：
```python
match num:
    case _ if num >= 1000:
        # 处理 M
    case _ if num >= 900:
        # 处理 CM
    # ...
```

---

## 这些方法具体怎么运用？

### 方法一：贪心算法（推荐）

**数据结构**：两个列表分别存储数值和对应的罗马符号。

**核心逻辑**：
1. 定义所有可能的数值-符号映射（包含特殊组合）
2. 从大到小遍历，每次尽可能多地使用当前符号
3. 拼接结果字符串

### 方法二：逐位处理

**核心逻辑**：
1. 分别处理千位、百位、十位、个位
2. 每个位使用对应的符号映射表

### 方法三：match-case 方法

**核心逻辑**：
1. 使用 while 循环持续处理 num
2. 利用 match-case 的 guard clauses 判断当前应该使用哪个符号
3. 每次处理后减少 num 的值

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 贪心算法 | O(1) | O(1) | 最多循环 13 × 3 = 39 次 |
| 逐位处理 | O(1) | O(1) | 固定 4 个位的处理 |
| match-case | O(1) | O(1) | 同贪心算法 |

所有方法的时间复杂度都是 O(1)，因为输入范围是固定的 (1-3999)。

---

## 总结与最佳选择

**最快算法**：贪心算法，代码最简洁。

**工程最优选择**：**贪心算法（方法一）**，理由：
1. **代码简洁**：只需两个列表和一个循环
2. **效率最高**：最少的条件判断
3. **易于维护**：符号映射表清晰明了

**各方法的使用场景**：
- **贪心算法**：生产环境，代码简洁高效
- **逐位处理**：教学演示，逻辑清晰
- **match-case**：学习新语法，展示 Python 特性

---

## Code

### 方法一：贪心算法（推荐）

```python
class Solution:
    def intToRoman(self, num: int) -> str:
        """贪心算法：从大到小依次减去对应值并拼接符号。
        时间复杂度 O(1)，空间复杂度 O(1)。
        """
        values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
        symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
        
        result = []
        for i in range(len(values)):
            while num >= values[i]:
                result.append(symbols[i])
                num -= values[i]
            if num == 0:
                break
        
        return ''.join(result)
```

### 方法二：逐位处理

```python
class Solution:
    def intToRoman(self, num: int) -> str:
        """逐位处理：按千位、百位、十位、个位分别转换。
        时间复杂度 O(1)，空间复杂度 O(1)。
        """
        thousands = ["", "M", "MM", "MMM"]
        hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"]
        tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"]
        ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]
        
        return thousands[num // 1000] + \
               hundreds[(num // 100) % 10] + \
               tens[(num // 10) % 10] + \
               ones[num % 10]
```

### 方法三：match-case 方法

```python
class Solution:
    def intToRoman(self, num: int) -> str:
        """match-case 方法：使用 Python 3.10+ 的 match-case 语法。
        时间复杂度 O(1)，空间复杂度 O(1)。
        """
        result = []
        
        while num > 0:
            match num:
                case _ if num >= 1000:
                    result.append("M")
                    num -= 1000
                case _ if num >= 900:
                    result.append("CM")
                    num -= 900
                case _ if num >= 500:
                    result.append("D")
                    num -= 500
                case _ if num >= 400:
                    result.append("CD")
                    num -= 400
                case _ if num >= 100:
                    result.append("C")
                    num -= 100
                case _ if num >= 90:
                    result.append("XC")
                    num -= 90
                case _ if num >= 50:
                    result.append("L")
                    num -= 50
                case _ if num >= 40:
                    result.append("XL")
                    num -= 40
                case _ if num >= 10:
                    result.append("X")
                    num -= 10
                case _ if num >= 9:
                    result.append("IX")
                    num -= 9
                case _ if num >= 5:
                    result.append("V")
                    num -= 5
                case _ if num >= 4:
                    result.append("IV")
                    num -= 4
                case _ if num >= 1:
                    result.append("I")
                    num -= 1
        
        return ''.join(result)
```