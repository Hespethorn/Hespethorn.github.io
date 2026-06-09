---
title: Leetcode 0012. Integer to Roman
tags:
  - leetcode
categories:
  - Leetcode
  - 哈希表
series: Leetcode-Cpp
abbrlink: ad2ee4f4
date: 2023-02-09 20:29:00
---

# [12. Integer to Roman](https://leetcode.com/problems/integer-to-roman/)


## 题目

Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.

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

For example, `2` is written as `II` in Roman numeral, just two one's added together. `12` is written as `XII`, which is simply `X + II`. The number `27` is written as `XXVII`, which is `XX + V + II`.

Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`. There are six instances where subtraction is used:

- `I` can be placed before `V` (5) and `X` (10) to make 4 and 9.
- `X` can be placed before `L` (50) and `C` (100) to make 40 and 90.
- `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.

Given an integer, convert it to a roman numeral.

**Example 1:**

```
Input: num = 3
Output: "III"
```

**Example 2:**

```
Input: num = 4
Output: "IV"
```

**Example 3:**

```
Input: num = 9
Output: "IX"
```

**Example 4:**

```
Input: num = 58
Output: "LVIII"
Explanation: L = 50, V = 5, III = 3.
```

**Example 5:**

```
Input: num = 1994
Output: "MCMXCIV"
Explanation: M = 1000, CM = 900, XC = 90 and IV = 4.
```

**Constraints:**

- `1 <= num <= 3999`

## 题目大意

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。这个特殊的规则只适用于以下六种情况：

- I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。
- X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。
- C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。

给定一个整数，将其转为罗马数字。输入确保在 1 到 3999 的范围内。

## 解题思路

**贪心算法**，利用罗马数字的符号与对应数值的映射关系，从最大的数值开始逐步递减，直到将整数减为 0：

1. 建立罗马数字符号与对应数值的映射表，按从大到小排序

2. 遍历映射表，对于每个数值：

   若当前整数大于等于该数值，将对应的符号添加到结果中

   减去该数值，重复上述操作，直到当前整数小于该数值

3. 继续处理下一个较小的数值，直到整数变为 0

## 代码

```go
#include <string>
#include <vector>
#include <utility> // for pair
using namespace std;

class Solution {
public:
    string intToRoman(int num) {
        // 建立罗马数字符号与对应数值的映射表（从大到小排序）
        vector<pair<int, string>> roman = {
            {1000, "M"},
            {900,  "CM"},
            {500,  "D"},
            {400,  "CD"},
            {100,  "C"},
            {90,   "XC"},
            {50,   "L"},
            {40,   "XL"},
            {10,   "X"},
            {9,    "IX"},
            {5,    "V"},
            {4,    "IV"},
            {1,    "I"}
        };
        
        string result;
        // 遍历映射表，从最大数值开始处理
        for (auto& pair : roman) {
            // 当当前数值小于等于剩余整数时，添加对应符号并减去该数值
            while (num >= pair.first) {
                result += pair.second;
                num -= pair.first;
            }
            // 整数减为0时，提前退出
            if (num == 0) break;
        }
        
        return result;
    }
};
```