---
title: Python条件语句：if-elif-else分支结构
tags:
  - Python
  - 基础
  - 条件语句
  - if
  - elif
  - else
categories:
  - Python
series: Python
abbrlink: 70c320a5
date: 2024-03-04 19:55:55
---

Python的条件语句用于根据不同的条件执行不同的代码块。本文将详细介绍Python中if、elif、else条件语句的使用方法。

## 一、基本语法

### 1. 简单的if语句

```python
x = 10

if x > 5:
    print("x大于5")  # 输出：x大于5
```

### 2. if-else语句

```python
x = 3

if x > 5:
    print("x大于5")
else:
    print("x不大于5")  # 输出：x不大于5
```

### 3. if-elif-else语句

```python
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")  # 输出：良好
elif score >= 70:
    print("中等")
else:
    print("及格")
```

## 二、Python与C++的对比

### 1. 条件表达式

**C++**：
```cpp
if (x > 0) {
    // ...
} else if (x == 0) {
    // ...
} else {
    // ...
}
```

**Python**：
```python
if x > 0:
    # ...
elif x == 0:
    # ...
else:
    # ...
```

### 2. 条件判断

**C++**：
```cpp
// 使用 == 比较，使用 && 和 ||
if (x == 10 && y > 5) {
    // ...
}
```

**Python**：
```python
# 使用 == 比较，使用 and, or, not
if x == 10 and y > 5:
    # ...
```

## 三、条件表达式

### 1. 比较运算符

```python
x, y = 10, 20

print(x == y)   # False
print(x != y)   # True
print(x < y)    # True
print(x > y)    # False
print(x <= y)   # True
print(x >= y)   # False
```

### 2. 逻辑运算符

```python
x, y, z = 10, 20, 30

# and：所有条件都为True时结果为True
print(x < y and y < z)  # True

# or：任意一个条件为True时结果为True
print(x > y or y < z)   # True

# not：取反
print(not x > y)        # True
```

### 3. 成员运算符

```python
fruits = ["apple", "banana", "cherry"]

print("apple" in fruits)      # True
print("orange" not in fruits) # True
```

## 四、嵌套条件

### 1. 基本嵌套

```python
x = 10

if x > 0:
    print("x是正数")
    if x > 5:
        print("x大于5")
    else:
        print("x不大于5")
else:
    print("x是负数或零")
```

### 2. 合理使用嵌套

```python
# 判断三角形类型
def triangle_type(a, b, c):
    if a + b > c and a + c > b and b + c > a:
        if a == b == c:
            return "等边三角形"
        elif a == b or b == c or a == c:
            return "等腰三角形"
        else:
            return "普通三角形"
    else:
        return "不能构成三角形"

print(triangle_type(3, 4, 5))   # 普通三角形
print(triangle_type(3, 3, 3))   # 等边三角形
```

## 五、条件表达式（三元运算符）

### 1. 基本用法

```python
# Python的三元表达式
x = 10
result = "x大于5" if x > 5 else "x不大于5"
print(result)  # 输出：x大于5
```

### 2. 嵌套三元表达式

```python
score = 85
result = "优秀" if score >= 90 else "良好" if score >= 80 else "及格" if score >= 60 else "不及格"
print(result)  # 输出：良好
```

## 六、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
条件语句综合示例
"""

def check_number(n):
    """判断数字的性质"""
    if n > 0:
        if n % 2 == 0:
            return "正偶数"
        else:
            return "正奇数"
    elif n < 0:
        if n % 2 == 0:
            return "负偶数"
        else:
            return "负奇数"
    else:
        return "零"

def grade_student(score):
    """根据分数评定等级"""
    if score < 0 or score > 100:
        return "无效分数"
    elif score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

def traffic_light_control(color):
    """交通灯控制"""
    if color == "red":
        return "停"
    elif color == "yellow":
        return "慢"
    elif color == "green":
        return "行"
    else:
        return "无效信号"

def demo():
    """演示"""
    # 数字判断
    print("=== 数字判断 ===")
    for n in [-5, 0, 5, 10]:
        print(f"{n}: {check_number(n)}")

    # 成绩评定
    print("\n=== 成绩评定 ===")
    scores = [95, 85, 75, 65, 55, 105]
    for score in scores:
        print(f"{score}分: {grade_student(score)}")

    # 交通灯
    print("\n=== 交通灯 ===")
    for color in ["red", "yellow", "green", "blue"]:
        print(f"{color}: {traffic_light_control(color)}")

if __name__ == "__main__":
    demo()
```

## 七、注意事项

### 1. 缩进一致性

```python
# 正确
if x > 0:
    if x > 5:
        print("x大于5")  # 缩进4个空格

# 错误：缩进不一致
if x > 0:
        print("x大于5")  # Tab和空格混用可能导致问题
```

### 2. 避免过多嵌套

```python
# 不推荐：过多嵌套
if condition1:
    if condition2:
        if condition3:
            do_something()

# 推荐：使用and或提前返回
if condition1 and condition2 and condition3:
    do_something()
```

### 3. 条件顺序

```python
# 注意条件顺序
def check_age(age):
    if 0 <= age <= 120:  # 先检查范围
        if age < 18:
            return "未成年"
        else:
            return "成年"
    else:
        return "无效年龄"
```
