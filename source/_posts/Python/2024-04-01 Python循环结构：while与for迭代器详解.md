---
title: Python循环结构：while与for迭代器详解
tags:
  - Python
  - 基础
  - 循环
  - while
  - for
  - range
  - 迭代器
categories:
  - Python
series: Python
abbrlink: python-loops-while-for
date: 2024-04-01
---

Python提供了两种主要的循环结构：while循环和for循环。本文将详细介绍这两种循环的使用方法，以及range()迭代器的使用。

## 一、while循环

### 1. 基本语法

```python
count = 0
while count < 5:
    print(count)
    count += 1
# 输出：0, 1, 2, 3, 4
```

### 2. while-else结构

```python
count = 0
while count < 5:
    print(count)
    count += 1
else:
    print("循环正常结束")  # 循环正常结束时执行
```

### 3. 无限循环

```python
while True:
    user_input = input("输入 'quit' 退出: ")
    if user_input == "quit":
        break
    print(f"你输入了: {user_input}")
```

## 二、for循环

### 1. 基本语法

```python
# 遍历列表
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# 遍历字符串
for char in "Python":
    print(char)
```

### 2. range()函数

```python
# range(stop)
for i in range(5):
    print(i)  # 输出：0, 1, 2, 3, 4

# range(start, stop)
for i in range(2, 6):
    print(i)  # 输出：2, 3, 4, 5

# range(start, stop, step)
for i in range(0, 10, 2):
    print(i)  # 输出：0, 2, 4, 6, 8

# 逆序
for i in range(5, 0, -1):
    print(i)  # 输出：5, 4, 3, 2, 1
```

### 3. 遍历字典

```python
person = {"name": "Alice", "age": 25, "city": "Beijing"}

# 遍历键
for key in person:
    print(key)

# 遍历值
for value in person.values():
    print(value)

# 遍历键值对
for key, value in person.items():
    print(f"{key}: {value}")
```

## 三、break和continue

### 1. break语句

```python
for i in range(10):
    if i == 5:
        break  # 跳出循环
    print(i)  # 输出：0, 1, 2, 3, 4
```

### 2. continue语句

```python
for i in range(10):
    if i % 2 == 0:
        continue  # 跳过本次循环
    print(i)  # 输出：1, 3, 5, 7, 9
```

## 四、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
循环综合示例
"""

def while_loop_demo():
    """while循环示例"""
    print("=== while循环 ===")
    count = 0
    while count < 5:
        print(f"count = {count}")
        count += 1

def for_loop_demo():
    """for循环示例"""
    print("\n=== for循环 ===")
    for i in range(5):
        print(f"i = {i}")

def nested_loop_demo():
    """嵌套循环示例"""
    print("\n=== 嵌套循环 ===")
    for i in range(3):
        for j in range(3):
            print(f"({i}, {j})", end=" ")
        print()

def break_continue_demo():
    """break和continue示例"""
    print("\n=== break和continue ===")
    for i in range(10):
        if i == 3:
            continue
        if i == 8:
            break
        print(i, end=" ")
    print()

def list_comprehension_demo():
    """列表推导式"""
    print("\n=== 列表推导式 ===")
    squares = [x**2 for x in range(10)]
    print(f"平方数: {squares}")

    even_squares = [x**2 for x in range(10) if x % 2 == 0]
    print(f"偶数的平方: {even_squares}")

def demo():
    """演示"""
    while_loop_demo()
    for_loop_demo()
    nested_loop_demo()
    break_continue_demo()
    list_comprehension_demo()

if __name__ == "__main__":
    demo()
```

## 五、注意事项

### 1. 避免无限循环

```python
# 错误：忘记更新循环变量
# while True:
#     print("无限循环")

# 正确：确保有退出条件
count = 0
while count < 5:
    print(count)
    count += 1
```

### 2. 使用enumerate获取索引

```python
fruits = ["apple", "banana", "cherry"]
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")
```

### 3. 使用zip并行遍历

```python
names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
for name, age in zip(names, ages):
    print(f"{name}: {age}")
```
