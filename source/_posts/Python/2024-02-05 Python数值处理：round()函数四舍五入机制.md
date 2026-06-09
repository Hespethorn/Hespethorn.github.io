---
title: Python数值处理：round()函数四舍五入机制
tags:
  - Python
  - 基础
  - round
  - 四舍五入
  - 数值处理
categories:
  - Python
series: Python
abbrlink: 8e1546a3
date: 2024-02-05
---

Python的`round()`函数是处理浮点数四舍五入的重要工具。本文将详细介绍`round()`函数的使用方法以及常见的精度问题。

## 一、round()函数的基本用法

### 1. 基本语法

```python
round(number, ndigits)
```

- `number`：要四舍五入的数字
- `ndigits`：保留的小数位数（可选，默认为0）

### 2. 基本示例

```python
# 基本四舍五入
print(round(3.14159))      # 输出：3
print(round(3.5))          # 输出：4
print(round(3.14159, 2))   # 输出：3.14
print(round(3.14159, 4))   # 输出：3.1416
```

### 3. 负数四舍五入

```python
# 负数四舍五入到整数
print(round(-3.5))         # 输出：-4
print(round(-3.4))         # 输出：-3

# 负数四舍五入到小数位
print(round(-3.14159, 2))  # 输出：-3.14
print(round(-3.14159, 3))  # 输出：-3.142
```

## 二、常见的精度问题

### 1. 浮点数表示问题

```python
# 浮点数精度问题
print(round(2.5))   # 输出：2（不是3！）
print(round(1.5))   # 输出：2

# 原因：浮点数在计算机中无法精确表示
print(0.1 + 0.2)    # 输出：0.30000000000000004
```

### 2. 银行家舍入

Python使用"银行家舍入"（Banker's Rounding）：

```python
# 银行家舍入规则：四舍六入五成双
print(round(2.5))   # 输出：2
print(round(3.5))   # 输出：4
print(round(4.5))   # 输出：4
print(round(5.5))   # 输出：6

# 原理：当要舍弃的部分恰好是0.5时，
# 看前一位是奇数则进位，偶数则舍弃
```

### 3. 解决方法：使用Decimal

```python
from decimal import Decimal, ROUND_HALF_UP

# 使用Decimal进行精确运算
print(round(Decimal('2.5')))  # 输出：3

# 指定舍入模式
result = Decimal('2.5').quantize(Decimal('1'), rounding=ROUND_HALF_UP)
print(result)  # 输出：3
```

## 三、实际应用场景

### 1. 货币计算

```python
from decimal import Decimal, ROUND_HALF_UP

def calculate_price(price, tax_rate):
    """计算含税价格"""
    p = Decimal(str(price))
    t = Decimal(str(tax_rate))
    total = (p * (1 + t)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    return total

# 测试
print(calculate_price(99.99, 0.07))  # 输出：106.99
print(calculate_price(100.00, 0.05))  # 输出：105.00
```

### 2. 百分比计算

```python
from decimal import Decimal, ROUND_HALF_UP

def calculate_percentage(value, total):
    """计算百分比"""
    if total == 0:
        return Decimal('0.00')
    percentage = (Decimal(str(value)) / Decimal(str(total)) * 100)
    return percentage.quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)

# 测试
print(calculate_percentage(1, 3))   # 输出：33.3
print(calculate_percentage(2, 3))   # 输出：66.7
```

### 3. 统计计算

```python
from decimal import Decimal

def calculate_average(numbers):
    """计算平均值并四舍五入"""
    if not numbers:
        return 0
    total = sum(Decimal(str(n)) for n in numbers)
    avg = total / len(numbers)
    return float(round(avg, 2))

# 测试
print(calculate_average([1, 2, 3, 4, 5]))  # 输出：3.0
print(calculate_average([1.5, 2.5, 3.5]))   # 输出：2.5
```

## 四、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
四舍五入综合示例
"""
from decimal import Decimal, ROUND_HALF_UP

def basic_round_demo():
    """基本round函数演示"""
    print("=== 基本round函数 ===")
    print(f"round(3.14159) = {round(3.14159)}")
    print(f"round(3.14159, 2) = {round(3.14159, 2)}")
    print(f"round(3.14159, 4) = {round(3.14159, 4)}")

def precision_demo():
    """精度问题演示"""
    print("\n=== 精度问题 ===")
    print(f"0.1 + 0.2 = {0.1 + 0.2}")  # 不是0.3
    print(f"round(2.675, 2) = {round(2.675, 2)}")  # 不是2.68

def decimal_demo():
    """Decimal精确计算演示"""
    print("\n=== Decimal精确计算 ===")

    # 基本用法
    print(f"Decimal('2.5') = {Decimal('2.5')}")
    print(f"round(Decimal('2.5')) = {round(Decimal('2.5'))}")

    # 四舍五入到指定位数
    num = Decimal('3.14159')
    print(f"quantize(Decimal('0.01')) = {num.quantize(Decimal('0.01'))}")
    print(f"quantize(Decimal('0.001')) = {num.quantize(Decimal('0.001'))}")

def financial_calculation():
    """金融计算示例"""
    print("\n=== 金融计算 ===")

    def format_currency(amount):
        """格式化货币"""
        return Decimal(str(amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    # 商品价格
    items = [
        {"name": "苹果", "price": 3.50, "quantity": 2},
        {"name": "香蕉", "price": 2.99, "quantity": 3},
        {"name": "橙子", "price": 4.25, "quantity": 1},
    ]

    subtotal = sum(Decimal(str(item['price'])) * item['quantity'] for item in items)
    tax = subtotal * Decimal('0.07')
    total = subtotal + tax

    print(f"小计: ${format_currency(subtotal)}")
    print(f"税 (7%): ${format_currency(tax)}")
    print(f"总计: ${format_currency(total)}")

if __name__ == "__main__":
    basic_round_demo()
    precision_demo()
    decimal_demo()
    financial_calculation()
```

## 五、注意事项

### 1. 避免用round()进行金融计算

```python
# 不好：使用round()
price = 0.01 * 3
print(round(price, 2))  # 可能得到0.03或0.04

# 好：使用Decimal
from decimal import Decimal
price = Decimal('0.01') * 3
print(price)  # 精确的0.03
```

### 2. 理解银行家舍入

```python
# Python的round使用银行家舍入
# 不是传统的"四舍五入"

# 传统四舍五入：
# round(2.5) = 3
# round(3.5) = 4

# Python银行家舍入：
# round(2.5) = 2（因为2是偶数）
# round(3.5) = 4（因为3是奇数）
```

### 3. 处理列表中的数值

```python
# 对列表中的数值四舍五入
numbers = [1.234, 2.567, 3.891]
rounded = [round(n, 2) for n in numbers]
print(rounded)  # 输出：[1.23, 2.57, 3.89]

# 使用map
rounded = list(map(lambda x: round(x, 2), numbers))
print(rounded)  # 输出：[1.23, 2.57, 3.89]
```
