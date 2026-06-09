---
title: Python格式化字符串：f-string用法详解
tags:
  - Python
  - 基础
  - 字符串
  - f-string
  - 格式化
categories:
  - Python
series: Python
abbrlink: 1276b97d
date: 2024-01-05
---

Python的f-string是一种强大的字符串格式化方式，它允许在字符串中直接嵌入表达式。本文将详细介绍f-string的用法和特点。

## 一、f-string的基本用法

### 1. 基本语法

```python
# f-string基本用法
name = "Alice"
age = 25
print(f"My name is {name}, and I am {age} years old.")
# 输出：My name is Alice, and I am 25 years old.
```

### 2. 表达式求值

```python
# f-string中的表达式
x = 10
y = 20
print(f"The sum of {x} and {y} is {x + y}.")
# 输出：The sum of 10 and 20 is 30.

# 调用函数
def get_greeting():
    return "Hello"

print(f"{get_greeting()}, world!")
# 输出：Hello, world!
```

### 3. 格式化选项

```python
# 数字格式化
pi = 3.1415926535
print(f"Pi is approximately {pi:.2f}.")  # 保留两位小数
# 输出：Pi is approximately 3.14.

# 宽度控制
number = 42
print(f"The number is {number:5d}.")  # 宽度为5
# 输出：The number is    42.

# 对齐
print(f"Left-aligned: {number:<10d}")  # 左对齐
print(f"Right-aligned: {number:>10d}")  # 右对齐
print(f"Centered: {number:^10d}")  # 居中对齐
```

## 二、f-string的高级用法

### 1. 嵌套f-string

```python
# 嵌套f-string
name = "Alice"
age = 25
print(f"{name} is {age} years old, which is {f'{age * 12}'} months.")
# 输出：Alice is 25 years old, which is 300 months.
```

### 2. 字典和对象

```python
# 字典
person = {"name": "Alice", "age": 25}
print(f"Name: {person['name']}, Age: {person['age']}")
# 输出：Name: Alice, Age: 25

# 对象
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

person = Person("Alice", 25)
print(f"Name: {person.name}, Age: {person.age}")
# 输出：Name: Alice, Age: 25
```

### 3. 转义字符

```python
# 转义大括号
print(f"{{Hello}} world")
# 输出：{Hello} world

# 多行f-string
message = f"""
Name: {name}
Age: {age}
Occupation: Programmer
"""
print(message)
```

## 三、f-string与其他格式化方法的对比

### 1. 与str.format()对比

```python
# str.format()
name = "Alice"
age = 25
print("My name is {}, and I am {} years old.".format(name, age))

# f-string
print(f"My name is {name}, and I am {age} years old.")
```

### 2. 与%格式化对比

```python
# %格式化
name = "Alice"
age = 25
print("My name is %s, and I am %d years old." % (name, age))

# f-string
print(f"My name is {name}, and I am {age} years old.")
```

## 四、f-string的优势

1. **简洁易读**：直接在字符串中嵌入变量和表达式，代码更加简洁易读
2. **表达式求值**：支持在字符串中直接计算表达式
3. **类型转换**：自动处理不同类型的变量，无需手动转换
4. **性能优越**：f-string的性能通常优于其他格式化方法
5. **灵活性高**：支持嵌套、字典访问、对象属性访问等多种操作

## 五、注意事项

### 1. 引号使用

```python
# 注意引号的使用
print(f"He said, 'Hello!'")
print(f'He said, "Hello!"')
```

### 2. 表达式复杂性

```python
# 避免过于复杂的表达式
# 不推荐：
print(f"The result is {sum([x**2 for x in range(100)])}")

# 推荐：
result = sum([x**2 for x in range(100)])
print(f"The result is {result}")
```

### 3. 版本兼容性

f-string是在Python 3.6及以上版本引入的，如果需要兼容更早的Python版本，应使用其他格式化方法。

## 六、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python f-string格式化字符串综合示例
"""

def calculate_area(radius):
    """计算圆的面积"""
    import math
    return math.pi * radius ** 2

def main():
    # 基本用法
    name = "Alice"
    age = 25
    print(f"=== 基本用法 ===")
    print(f"Name: {name}")
    print(f"Age: {age}")
    print(f"Next year, I'll be {age + 1} years old.")
    
    # 数字格式化
    print(f"\n=== 数字格式化 ===")
    pi = 3.1415926535
    print(f"Pi: {pi:.4f}")  # 保留4位小数
    
    # 宽度和对齐
    print(f"\n=== 宽度和对齐 ===")
    numbers = [1, 10, 100, 1000]
    for num in numbers:
        print(f"Number: {num:5d}")
    
    # 字典和对象
    print(f"\n=== 字典和对象 ===")
    person = {"name": "Bob", "age": 30}
    print(f"Person: {person['name']}, {person['age']}")
    
    # 调用函数
    print(f"\n=== 调用函数 ===")
    radius = 5
    print(f"Area of circle with radius {radius}: {calculate_area(radius):.2f}")

if __name__ == "__main__":
    main()
```
