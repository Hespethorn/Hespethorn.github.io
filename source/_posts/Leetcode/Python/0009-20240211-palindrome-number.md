---
title: Leetcode 0009. Palindrome Number (python)
tags:
  - leetcode
  - python
  - 数学
  - 回文数
  - 双指针
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'c9d2e7f8'
date: 2024-02-11
---

# [9. Palindrome Number](https://leetcode.com/problems/palindrome-number/)

## 题目

Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.

**Example 1:**

```
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.
```

**Example 2:**

```
Input: x = -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
```

**Example 3:**

```
Input: x = 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.
```

**Constraints:**

- `-2³¹ <= x <= 2³¹ - 1`

**Follow up:** Could you solve it without converting the integer to a string?

## 题目大意

判断一个整数是否为回文数。回文数是指正序（从左向右）和倒序（从右向左）读都一样的整数。例如 `121` 是回文数，而 `-121` 和 `10` 不是。进阶挑战：能否不将整数转为字符串来解决？

---

## 你选用何种方法解题？

本题有四种主流解法，核心区别在于是否使用字符串以及数字反转的范围：

| 方法 | 核心思路 | 时间复杂度 | 说明 |
|:---|:---|:---:|:---|
| 方法一：字符串反转法 | 直接转字符串，比较原串和反转串 | O(log₁₀x) | **最直观**：代码极简，一行搞定 |
| 方法二：字符串双指针法 | 转字符串后用左右下标向中间比较 | O(log₁₀x) | **最易理解**：直观的首尾对比，符合直觉 |
| 方法三：反转一半数字法 | 只反转数字的后半部分，与前半部分比较 | O(log₁₀x) | **最优工程解**：不使用字符串，避免溢出，只遍历一半位数 |
| 方法四：逐位对比法 | 计算最高位除数，首尾数字逐一比较 | O(log₁₀x) | **逻辑直观**：数学版本的双指针，不转字符串 |

**方法三是推荐解**：既满足题目进阶要求（不转字符串），又在时间和空间上最优——只遍历数字的一半位数，完全避免溢出问题，代码可读性也很好。

---

## 解题过程

### 问题分析

- **输入**：整数 `x`，范围 `[-2147483648, 2147483647]`
- **输出**：布尔值，表示是否为回文数
- **特殊情况预判**：
  1. 负数不可能是回文数（负号破坏对称性）
  2. 除 0 外，末尾为 0 的数不可能是回文数（前导 0 不合法）

### 核心洞察

回文数的对称性决定了：**前半部分与后半部分的反转相等**。

对于偶数位数字（如 `1221`）：
```
12 21 → 前半 12，后半 21 → 反转后半为 12 → 12 == 12 ✓
```

对于奇数位数字（如 `12321`）：
```
12 3 21 → 前半 12，中间 3，后半 21 → 反转后半为 12 → 12 == 12 ✓
```

因此**不需要反转整个数字**——只反转到剩下的数字 ≤ 反转后的数字，此时已反转了后半部分。

### 手推演示例

以 `x = 12321` 为例：

```
初始: x = 12321, rev = 0
       ↑     ↑
      前半   后半

第1次循环:
  last_digit = 12321 % 10 = 1
  rev = 0 * 10 + 1 = 1
  x = 12321 // 10 = 1232
  此时 x(1232) > rev(1) → 继续

第2次循环:
  last_digit = 1232 % 10 = 2
  rev = 1 * 10 + 2 = 12
  x = 1232 // 10 = 123
  此时 x(123) > rev(12) → 继续

第3次循环:
  last_digit = 123 % 10 = 3
  rev = 12 * 10 + 3 = 123
  x = 123 // 10 = 12
  此时 x(12) ≤ rev(123) → 停止循环

判断:
  奇数位，rev // 10 = 123 // 10 = 12
  x(12) == rev//10(12) → true ✓
```

再以 `x = 1221`（偶数位）为例：

```
循环停止时: x = 12, rev = 21
判断: x(12) != rev(21) → 不是回文？不，1221 是回文，等一下...

哦，x = 1221 的正确流程：
初始: x=1221, rev=0
第1次: x=122, rev=1
第2次: x=12, rev=12
此时 x(12) 不大于 rev(12) → 停止
判断: x(12) == rev(12) → true ✓
```

---

## 这些方法具体怎么运用？

### 方法一：字符串反转法

**数据结构**：字符串切片。

**核心逻辑**：Python 的字符串切片 `s[::-1]` 可以一行实现反转。

```python
def isPalindrome(x: int) -> bool:
    return str(x) == str(x)[::-1]
```

**边界情况**：

| 场景 | 输入 | 关键点 | 结果 |
|:---|:---|:---|:---|
| 负数 | `-121` | 转字符串后带负号，反转后变成 `121-`，不相等 | `false` |
| 末尾为0 | `10` | 反转后 `01`，不相等 | `false` |
| 0 | `0` | 反转后仍为 `0` | `true` |
| 单数字 | `5` | 反转后仍为 `5` | `true` |

### 方法二：字符串双指针法

**数据结构**：两个整数指针 `left` 和 `right`。

**核心逻辑**：
1. 将整数转为字符串
2. `left` 从头部开始，`right` 从尾部开始
3. 向中间靠拢比较，遇到不相等立即返回 `false`

**边界情况**：

| 场景 | 输入 | 关键点 | 结果 |
|:---|:---|:---|:---|
| 负数 | `-121` | 第一个字符是 `-`，与最后一个字符 `1` 不相等 | `false` |
| 末尾为0 | `10` | `s[0]='1'` 与 `s[1]='0'` 不相等 | `false` |
| 0 | `0` | `left == right`，直接返回 `true` | `true` |
| 单数字 | `5` | `left == right`，直接返回 `true` | `true` |

### 方法三：反转一半数字法（推荐）

**数据结构**：两个整数变量 `x`（逐渐去掉末位）、`rev`（逐渐累加反转位）。

**核心逻辑**：
1. 先处理特殊情况
2. 循环反转后半部分，直到 `x ≤ rev`
3. 根据奇偶位数判断是否相等

**为什么只反转一半？** 
- 避免反转整个数可能造成的溢出问题（虽然 Python 不需要担心，但这是通用算法的好习惯）
- 时间减半，只需要遍历 `log₁₀x / 2` 次

**边界情况**：

| 场景 | 输入 | 特殊处理 | 结果 |
|:---|:---|:---|:---|
| 负数 | `-121` | 直接返回 `false` | `false` |
| 末尾为0且非0 | `10` | 直接返回 `false` | `false` |
| 0 | `0` | 不进入循环，直接判断 `x == rev` | `true` |
| 偶数位回文 | `1221` | `x == rev` | `true` |
| 奇数位回文 | `12321` | `x == rev // 10` | `true` |
| 非回文偶数位 | `1234` | `x != rev` | `false` |

### 方法四：逐位对比法

**数据结构**：`divisor`（最高位除数，如 12321 的 divisor = 10000）。

**核心逻辑**：
1. 计算最高位除数 `divisor`
2. 循环：取首数字 `x // divisor`，取尾数字 `x % 10`，比较
3. 去掉首尾数字，`divisor` 除以 100

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 字符串反转法 | **O(log₁₀x)** | **O(log₁₀x)** | 需要存储字符串，长度为数字的位数 |
| 字符串双指针法 | **O(log₁₀x)** | **O(log₁₀x)** | 需要存储字符串，双指针遍历 |
| 反转一半数字法 | **O(log₁₀x)** | **O(1)** | 只遍历一半位数，常数空间 |
| 逐位对比法 | **O(log₁₀x)** | **O(1)** | 遍历全部位数，常数空间 |

虽然都是 O(log₁₀x)，但反转一半数字法的实际循环次数最少，是其他方法的一半。

---

## 总结与最佳选择

**最快算法**：反转一半数字法（方法三），循环次数最少。

**工程最优选择**：**反转一半数字法（方法三）**，理由：
1. **满足进阶要求**：不使用字符串，完全在数字层面操作
2. **避免溢出**：只反转一半，无需处理整数溢出问题
3. **最优效率**：循环次数为数字位数的一半
4. **代码简洁**：逻辑清晰，易于理解和维护

**各方法的使用场景**：
- **字符串反转法**：快速解题、面试白板写代码时，代码最简
- **字符串双指针法**：教学演示，最符合直觉的首尾对比思路
- **反转一半数字法**：生产环境、算法竞赛，性能最优
- **逐位对比法**：理解回文数对称性本质，纯数学实现

**一句话**：回文数的核心是**对称性**——利用对称性只处理一半数据是最优解，这也是很多对称问题的通用优化思路。

---

## Code

### 方法一：字符串反转法

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        """字符串反转法：直接转字符串比较原串和反转串。
        时间复杂度 O(log₁₀x)，空间复杂度 O(log₁₀x)。
        """
        return str(x) == str(x)[::-1]
```

### 方法二：字符串双指针法

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        """字符串双指针法：将整数转为字符串，使用左右下标向中间靠拢比较。
        最符合直觉的首尾对比思路，时间复杂度 O(log₁₀x)，空间复杂度 O(log₁₀x)。
        """
        s = str(x)
        left, right = 0, len(s) - 1
        
        while left < right:
            if s[left] != s[right]:
                return False
            left += 1
            right -= 1
        
        return True
```

### 方法三：反转一半数字法（推荐）

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        """反转一半数字法：只反转数字的后半部分，与前半部分比较。
        避免字符串转换，避免整数溢出，时间复杂度 O(log₁₀x)，空间复杂度 O(1)。
        """
        # 特殊情况：负数直接返回 false
        # 特殊情况：除 0 外，末尾为 0 的数直接返回 false
        if x < 0 or (x % 10 == 0 and x != 0):
            return False

        reversed_num = 0
        while x > reversed_num:
            # 提取 x 的最后一位数字
            last_digit = x % 10
            # 将最后一位数字拼接到 reversed_num 中
            reversed_num = reversed_num * 10 + last_digit
            # 去掉 x 的最后一位数字
            x = x // 10

        # 偶数位：x == reversed_num
        # 奇数位：x == reversed_num // 10（去掉中间位）
        return x == reversed_num or x == reversed_num // 10
```

### 方法四：逐位对比法

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        """逐位对比法：计算最高位除数，首尾数字逐一比较。
        时间复杂度 O(log₁₀x)，空间复杂度 O(1)。
        """
        # 负数直接返回 false
        if x < 0:
            return False

        # 计算最高位除数
        divisor = 1
        while x // divisor >= 10:
            divisor *= 10

        while x > 0:
            # 提取最左边数字
            left = x // divisor
            # 提取最右边数字
            right = x % 10

            if left != right:
                return False

            # 去掉最左边和最右边的数字
            x = (x % divisor) // 10
            # 除数除以 100（去掉了两位）
            divisor = divisor // 100

        return True
```
