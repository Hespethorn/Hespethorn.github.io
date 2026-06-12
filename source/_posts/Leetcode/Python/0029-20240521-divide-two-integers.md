---
title: Leetcode 0029.Divide Two Integers(python)
tags:
  - leetcode
  - python
  - 位运算
  - 数学
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'divide-two-integers'
date: 2024-05-21
---

# [29. Divide Two Integers](https://leetcode.com/problems/divide-two-integers/)

## 你选用何种方法解题？

本题的核心是**不使用乘法、除法和取模运算实现整数除法**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 位运算（位移法） | O(log n) | O(1) | 推荐 |
| 负数倍增法 | O(log n) | O(1) | **推荐** |

**方法选择理由**：
- **位运算（位移法）**：通过左移实现快速乘法，时间效率高
- **负数倍增法**：使用负数处理避免溢出问题，更安全

---

## 解题过程

### 问题分析

输入：被除数 `dividend`，除数 `divisor`
输出：两数相除的商（截断小数部分）

关键约束：
- 不能使用乘法、除法、取模运算
- 需要处理溢出情况

### 核心洞察

1. **位运算替代乘法**：`x << k` 等价于 `x * 2^k`
2. **二分查找思想**：找到最大的 `k` 使得 `divisor * 2^k <= dividend`
3. **符号处理**：先记录符号，将问题转化为正数或负数除法
4. **负数处理**：使用负数避免 `abs(INT_MIN)` 溢出

### 算法流程（负数倍增法）

以 `dividend = 15`, `divisor = 3` 为例：

```
符号：正
转化为负数：-15 / -3

步骤1: 找到最大的倍数
       value = -3, k = 1
       -15 <= -6 (-3 + -3), value = -6, k = 2
       -15 <= -12 (-6 + -6), value = -12, k = 4
       -15 <= -24? 不成立
       a = -15 - (-12) = -3, ans = 4

步骤2: 继续处理剩余
       value = -3, k = 1
       -3 <= -3, 成立
       a = -3 - (-3) = 0, ans = 4 + 1 = 5

结果: 5
```

---

## 这些方法具体怎么运用？

### 方法一：位运算（位移法）

**核心逻辑**：
1. **处理边界情况**：溢出、除数为1、除数为-1
2. **记录符号**：`sign = -1 if (dividend < 0) ^ (divisor < 0) else 1`
3. **转化为正数**：使用绝对值
4. **位运算加速**：
   - 从高位到低位遍历（31位）
   - 如果 `divisor << i <= dividend`，则商加上 `1 << i`，并减去相应值
5. **返回结果**：应用符号并处理溢出

### 方法二：负数倍增法（推荐）

**核心逻辑**：
1. **处理边界情况**：唯一溢出情况 `dividend = INT_MIN, divisor = -1`
2. **记录符号**：`negative = (dividend > 0) != (divisor > 0)`
3. **转化为负数**：全部转为负数避免 `abs(INT_MIN)` 溢出
4. **倍增查找**：
   - 内层循环：找到最大的 `value = divisor * 2^k`
   - 外层循环：减去当前最大倍数，累加商
5. **返回结果**：应用符号

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| `dividend = INT_MIN, divisor = -1` | 返回 INT_MAX（溢出） |
| `divisor = 1` | 直接返回 dividend |
| `divisor = -1` | 返回 -dividend（注意溢出） |
| `dividend = 0` | 返回 0 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 位运算（位移法） | **O(log n)** | **O(1)** | n 是被除数的绝对值 |

---

## 总结与最佳选择

**最快算法**：两种方法时间复杂度相同。

**工程最优选择**：**负数倍增法**。理由如下：
1. **避免溢出**：使用负数处理，避免 `abs(INT_MIN)` 溢出问题
2. **代码简洁**：逻辑清晰，易于理解
3. **安全性高**：不需要额外的溢出检查

**各方法适用场景**：
- **负数倍增法**：生产环境首选，避免溢出问题
- **位运算（位移法）**：代码直观，适合教学

---

## Code

### 方法一：位运算（位移法）

```python
class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        """
        位运算法：
        1. 使用左移实现快速乘法
        2. 从高位到低位遍历，找到最大的倍数
        3. 处理溢出情况
        """
        # 边界情况：溢出
        INT_MIN = -2**31
        INT_MAX = 2**31 - 1
        
        if dividend == INT_MIN and divisor == -1:
            return INT_MAX
        
        # 记录符号
        sign = -1 if (dividend < 0) ^ (divisor < 0) else 1
        
        # 转化为正数
        dividend = abs(dividend)
        divisor = abs(divisor)
        
        result = 0
        
        # 从高位到低位遍历
        for i in range(31, -1, -1):
            # 避免溢出，使用减法判断
            if dividend >= (divisor << i):
                result += 1 << i
                dividend -= divisor << i
        
        return sign * result
```

### 方法二：负数倍增法（推荐）

```python
class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        INT_MAX = 2**31 - 1
        INT_MIN = -2**31
        
        # 边界溢出：唯一会溢出的情况
        if dividend == INT_MIN and divisor == -1:
            return INT_MAX
        
        # 判断符号
        negative = (dividend > 0) != (divisor > 0)
        
        # 全部转为负数处理（避免 abs(-2^31) 溢出）
        a, b = dividend, divisor
        if a > 0: a = -a
        if b > 0: b = -b
        
        ans = 0
        # a <= b < 0（负数比较：绝对值越大，值越小）
        while a <= b:
            # 倍增：找到最大的 (divisor * 2^k) 不超过 dividend
            value = b      # 当前减数
            k = 1          # 当前减数对应的商
            while a <= value + value and value >= INT_MIN // 2:
                value += value  # 减数倍增（负数加法）
                k += k          # 商倍增
            
            a -= value      # dividend 减去当前倍增后的值
            ans += k        # 商累加
        
        return -ans if negative else ans
```