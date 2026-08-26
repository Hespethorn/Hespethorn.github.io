---

title: Leetcode 0029.Divide Two Integers(C++)
tags:
  - leetcode
  - c++
  - 位运算
  - 数学
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 'divide-two-integers-cpp'
date: 2024-05-21

---

# [29. Divide Two Integers](https://leetcode.com/problems/divide-two-integers/)

## 题目

Given two integers `dividend` and `divisor`, divide two integers **without** using multiplication, division, and mod operator.

The integer division should truncate toward zero, which means losing its fractional part. For example, `8.345` would be truncated to `8`, and `-2.7335` would be truncated to `-2`.

Return *the quotient after dividing* `dividend` *by* `divisor`.

**Note:** Assume we are dealing with an environment that could only store integers within the 32-bit signed integer range: `[−2^31, 2^31 − 1]`. For this problem, if the quotient is strictly greater than `2^31 - 1`, then return `2^31 - 1`, and if the quotient is strictly less than `-2^31`, then return `-2^31`.

**Example 1:**

```
Input: dividend = 10, divisor = 3
Output: 3
```

**Example 2:**

```
Input: dividend = 7, divisor = -3
Output: -2
```

## 题目大意

不使用乘法、除法和取模运算实现整数除法，返回商（截断小数部分）。

---

## 你选用何种方法解题？

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 位运算（位移法） | O(log n) | O(1) | **推荐** |

---

## 解题思路

### 核心思想

1. **位运算替代乘法**：`x << k` 等价于 `x * 2^k`
2. **二分查找思想**：找到最大的 `k` 使得 `divisor * 2^k <= dividend`
3. **符号处理**：先记录符号，将问题转化为正数除法

### 算法流程

1. **处理边界情况**：溢出、除数为1等
2. **记录符号**：使用异或运算判断符号
3. **转化为正数**：使用绝对值
4. **位运算加速**：从高位到低位遍历
5. **返回结果**：应用符号并处理溢出

---

## 代码

```cpp
class Solution {
public:
    int divide(int dividend, int divisor) {
        // 边界情况：溢出
        if (dividend == INT_MIN && divisor == -1) {
            return INT_MAX;
        }
        
        // 记录符号
        int sign = (dividend < 0) ^ (divisor < 0) ? -1 : 1;
        
        // 转化为 long long 避免溢出
        long long dvd = labs(dividend);
        long long dvs = labs(divisor);
        
        long long result = 0;
        
        // 从高位到低位遍历
        for (int i = 31; i >= 0; --i) {
            // 使用 long long 避免溢出
            if (dvd >= (dvs << i)) {
                result += (1LL << i);
                dvd -= (dvs << i);
            }
        }
        
        return sign * result;
    }
};
```

### 代码解释

1. **边界处理**：当 `dividend = INT_MIN` 且 `divisor = -1` 时，结果会溢出，返回 `INT_MAX`
2. **符号判断**：使用异或运算 `^` 判断两个数是否符号不同
3. **类型转换**：将 `int` 转换为 `long long` 避免溢出
4. **位运算**：`dvs << i` 表示 `divisor * 2^i`，找到最大的倍数
5. **结果返回**：应用符号后返回

---

## 复杂度分析

| 复杂度 | 说明 |
|:---|:---|
| 时间复杂度 | O(log n) |
| 空间复杂度 | O(1) |

---

## 注意事项

1. **溢出处理**：在 C++ 中，`INT_MIN` 的绝对值比 `INT_MAX` 大 1，需要特别处理
2. **类型转换**：使用 `long long` 类型避免中间结果溢出
3. **位运算优先级**：注意位移运算的优先级低于比较运算