---
title: Python函数定义：def关键字与缩进规则
tags:
  - Python
  - 基础
  - 函数
  - def
  - 缩进
categories:
  - Python
series: Python
abbrlink: 3464d813
date: 2024-02-12
---

Python的函数定义使用`def`关键字，与C++等语言不同，Python不使用大括号来标记函数体，而是依靠缩进来区分代码块。本文将详细介绍Python函数定义的方式和特点。

## 一、Python函数定义的基本语法

### 1. 基本结构

```python
# Python函数定义
def greet():
    print("Hello, World!")

# 调用函数
greet()  # 输出：Hello, World!
```

### 2. 带参数的函数

```python
# 带参数的函数
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # 输出：Hello, Alice!

# 多个参数
def add(a, b):
    return a + b

result = add(3, 5)
print(result)  # 输出：8
```

### 3. 默认参数值

```python
# 默认参数
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")  # 输出：Hello, Alice!
greet("Bob", "Hi")  # 输出：Hi, Bob!

# 默认参数要紧跟在必需参数后面
# 错误示例：def func(a=1, b)  # SyntaxError
```

### 4. 关键字参数

```python
# 关键字参数
def introduce(name, age, city):
    print(f"I am {name}, {age} years old, from {city}")

# 使用关键字参数调用
introduce(age=25, name="Alice", city="Beijing")
```

## 二、Python与C++函数定义的对比

### 1. 语法对比

**C++**：
```cpp
// C++函数定义
int add(int a, int b) {
    return a + b;
}

// Lambda表达式
auto add = [](int a, int b) {
    return a + b;
};
```

**Python**：
```python
# Python函数定义
def add(a, b):
    return a + b
```

### 2. 缩进vs大括号

**C++**：
```cpp
void func() {
    if (condition) {
        do_something();
    } else {
        do_other();
    }
}
```

**Python**：
```python
def func():
    if condition:
        do_something()
    else:
        do_other()
```

### 3. 返回值

**C++**：
```cpp
// C++必须指定返回类型
int get_value() {
    return 42;
}

// void函数
void print_message() {
    cout << "Hello" << endl;
}
```

**Python**：
```python
# Python不需要指定返回类型
def get_value():
    return 42

# 没有返回值的函数返回None
def print_message():
    print("Hello")

print(print_message())  # 输出：Hello\nNone
```

## 三、缩进规则

### 1. 缩进的重要性

```python
# 正确的缩进
def correct_indent():
    print("This is inside the function")
    if True:
        print("This is inside the if block")
    print("Back to the function level")

# 错误的缩进会导致SyntaxError
# def wrong_indent():
# print("This will cause an error")
```

### 2. 缩进的一致性

```python
# 4个空格是PEP 8推荐的标准
def four_spaces():
    print("Four spaces is standard")

# 也可以使用Tab，但不要混用
def tab_indent():
        print("Tab indentation")
```

### 3. 多层缩进

```python
def outer_function():
    print("Outer function")

    def inner_function():
        print("Inner function")

        def deeply_nested():
            print("Deeply nested")

        deeply_nested()

    inner_function()
```

## 四、特殊函数参数

### 1. *args（可变位置参数）

```python
def sum_all(*args):
    total = 0
    for num in args:
        total += num
    return total

print(sum_all(1, 2, 3))  # 输出：6
print(sum_all(1, 2, 3, 4, 5))  # 输出：15
```

### 2. **kwargs（可变关键字参数）

```python
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25, city="Beijing")
# 输出：
# name: Alice
# age: 25
# city: Beijing
```

### 3. 参数组合

```python
def func(required, *args, **kwargs):
    print(f"Required: {required}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

func(1, 2, 3, name="Alice", age=25)
# 输出：
# Required: 1
# Args: (2, 3)
# Kwargs: {'name': 'Alice', 'age': 25}
```

## 五、函数文档和注解

### 1. Docstring（文档字符串）

```python
def calculate_area(radius):
    """Calculate the area of a circle.

    Args:
        radius: The radius of the circle.

    Returns:
        The area of the circle.
    """
    import math
    return math.pi * radius ** 2

print(calculate_area.__doc__)
```

### 2. 类型注解

```python
def greet(name: str) -> str:
    return f"Hello, {name}"

# 多个参数和返回类型
def add(a: int, b: int) -> int:
    return a + b

# 混合类型注解
from typing import List, Union

def process(items: List[Union[int, str]]) -> List[str]:
    return [str(item) for item in items]
```

## 六、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Python函数定义综合示例
"""

def basic_operations(a, b):
    """基本数学运算"""
    return {
        'sum': a + b,
        'difference': a - b,
        'product': a * b,
        'quotient': a / b if b != 0 else None
    }

def with_defaults(name, greeting="Hello", punctuation="!"):
    """带默认参数的函数"""
    return f"{greeting}, {name}{punctuation}"

def variable_args(*args, operation="sum"):
    """可变参数函数"""
    if operation == "sum":
        return sum(args)
    elif operation == "product":
        result = 1
        for num in args:
            result *= num
        return result
    else:
        return None

def keyword_args(**kwargs):
    """关键字参数函数"""
    return "\n".join(f"{key}: {value}" for key, value in kwargs.items())

def demo():
    """演示函数"""
    # 基本运算
    print("=== 基本运算 ===")
    result = basic_operations(10, 5)
    for op, value in result.items():
        print(f"{op}: {value}")

    # 默认参数
    print("\n=== 默认参数 ===")
    print(with_defaults("Alice"))
    print(with_defaults("Bob", "Hi"))
    print(with_defaults("Charlie", "Hey", "^^^"))

    # 可变参数
    print("\n=== 可变参数 ===")
    print(f"Sum: {variable_args(1, 2, 3, 4, 5)}")
    print(f"Product: {variable_args(1, 2, 3, 4, 5, operation='product')}")

    # 关键字参数
    print("\n=== 关键字参数 ===")
    print(keyword_args(name="Alice", age=25, city="Beijing"))

if __name__ == "__main__":
    demo()
```

## 七、注意事项

### 1. 不要混用缩进风格

```python
# 错误：混用空格和Tab
def mixed_indent():
    print("Space")  # 空格
        print("Tab")  # Tab - 会导致错误
```

### 2. 默认参数不要使用可变对象

```python
# 错误：默认参数是可变对象
def wrong_func(items=[]):  # 危险！
    items.append(1)
    return items

# 正确：使用None作为默认值
def correct_func(items=None):
    if items is None:
        items = []
    items.append(1)
    return items
```

### 3. 函数调用必须在定义之后

```python
# 错误：函数在定义之前被调用
greet()  # NameError: name 'greet' is not defined

def greet():
    print("Hello!")
```
