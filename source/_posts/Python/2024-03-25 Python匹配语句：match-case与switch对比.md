---
title: Python匹配语句：match-case与switch对比
tags:
  - Python
  - 基础
  - match
  - switch
  - 模式匹配
categories:
  - Python
series: Python
abbrlink: a51cdce
date: 2024-03-25
---

Python 3.10引入了match语句，这是一种强大的模式匹配机制，类似于其他语言中的switch语句，但功能更加强大。本文将详细介绍Python中match语句的用法。

## 一、match语句的基本用法

### 1. 基本语法

```python
def http_status(status):
    match status:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Internal Server Error"
        case _:
            return "Unknown"

print(http_status(200))   # 输出：OK
print(http_status(404))   # 输出：Not Found
print(http_status(999))   # 输出：Unknown
```

### 2. 与switch的对比

**C++/Java switch**：
```cpp
switch (status) {
    case 200:
        return "OK";
    case 404:
        return "Not Found";
    default:
        return "Unknown";
}
```

**Python match**：
```python
match status:
    case 200:
        return "OK"
    case 404:
        return "Not Found"
    case _:
        return "Unknown"
```

## 二、多个条件匹配

### 1. 使用|组合多个值

```python
def color_name(color_code):
    match color_code:
        case 1 | 2 | 3:
            return "Primary color"
        case 4 | 5 | 6:
            return "Secondary color"
        case _:
            return "Other"

print(color_name(1))  # 输出：Primary color
print(color_name(5))  # 输出：Secondary color
```

### 2. 默认分支

使用下划线`_`作为默认分支，匹配所有未匹配的情况：

```python
def grade(score):
    match score:
        case 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100:
            return "A"
        case 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89:
            return "B"
        case _:
            return "C"
```

## 三、模式匹配

### 1. 解构元组

```python
def handle_command(command):
    match command.split():
        case ["quit"]:
            print("Goodbye!")
        case ["look"]:
            print("You see nothing special.")
        case ["go", direction]:
            print(f"You go {direction}")
        case ["take", item]:
            print(f"You take the {item}")
        case _:
            print("Unknown command")

handle_command("quit")        # Goodbye!
handle_command("go north")    # You go north
handle_command("take sword")  # You take the sword
```

### 2. 解构列表

```python
def process_points(points):
    match points:
        case []:
            return "No points"
        case [x]:
            return f"Single point at {x}"
        case [x, y]:
            return f"Points at {x} and {y}"
        case [x, y, z]:
            return f"Points at {x}, {y}, and {z}"
        case _:
            return f"Many points: {len(points)} total"

print(process_points([]))        # No points
print(process_points([1]))      # Single point at 1
print(process_points([1, 2]))  # Points at 1 and 2
```

### 3. 解构类

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

def describe_shape(shape):
    match shape:
        case Point(x=0, y=0):
            return "Origin point"
        case Point(x=x, y=y):
            return f"Point at ({x}, {y})"
        case Rectangle(width=w, height=h) if w == h:
            return f"Square with side {w}"
        case Rectangle(width=w, height=h):
            return f"Rectangle {w}x{h}"

p1 = Point(0, 0)
p2 = Point(3, 4)
r1 = Rectangle(5, 5)
r2 = Rectangle(4, 6)

print(describe_shape(p1))  # Origin point
print(describe_shape(p2))  # Point at (3, 4)
print(describe_shape(r1))  # Square with side 5
print(describe_shape(r2))  # Rectangle 4x6
```

## 四、添加条件

### 1. guard子句

使用if添加条件：

```python
def classify_number(n):
    match n:
        case x if x < 0:
            return "Negative"
        case 0:
            return "Zero"
        case x if x > 0:
            return "Positive"

print(classify_number(-5))  # Negative
print(classify_number(0))   # Zero
print(classify_number(10))  # Positive
```

### 2. 复杂的guard条件

```python
def handle_login(username, password):
    match (username, password):
        case ("admin", "admin123"):
            return "Admin login"
        case ("user", p) if len(p) >= 8:
            return "Valid user login"
        case ("user", _):
            return "Invalid password"
        case _:
            return "Unknown user"

print(handle_login("admin", "admin123"))      # Admin login
print(handle_login("user", "password123"))     # Valid user login
print(handle_login("user", "short"))          # Invalid password
print(handle_login("guest", "any"))            # Unknown user
```

## 五、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
match语句综合示例
"""

def parse_message(msg):
    """解析不同类型的消息"""
    match msg.split(maxsplit=1):
        case ["HELLO"]:
            return "Hello there!"
        case ["HELLO", name]:
            return f"Hello, {name}!"
        case ["GOODBYE"]:
            return "Goodbye!"
        case ["ECHO", text]:
            return text
        case ["REPEAT", n, text] if n.isdigit():
            return text * int(n)
        case _:
            return "Unknown command"

def shape_area(shape):
    """计算不同形状的面积"""
    match shape:
        case {"type": "circle", "radius": r}:
            import math
            return math.pi * r ** 2
        case {"type": "rectangle", "width": w, "height": h}:
            return w * h
        case {"type": "triangle", "base": b, "height": h}:
            return 0.5 * b * h
        case _:
            return None

def http_error(status):
    """返回HTTP错误信息"""
    match status:
        case 400:
            return "Bad Request"
        case 401 | 403:
            return "Unauthorized or Forbidden"
        case 404:
            return "Not Found"
        case 500 | 502 | 503:
            return "Server Error"
        case _:
            return "Unknown Error"

def demo():
    """演示"""
    # 消息解析
    print("=== 消息解析 ===")
    messages = ["HELLO", "HELLO Alice", "ECHO Hello", "UNKNOWN"]
    for msg in messages:
        print(f"'{msg}': {parse_message(msg)}")

    # 形状面积
    print("\n=== 形状面积 ===")
    shapes = [
        {"type": "circle", "radius": 5},
        {"type": "rectangle", "width": 4, "height": 6},
        {"type": "triangle", "base": 3, "height": 4},
    ]
    for shape in shapes:
        print(f"{shape['type']}: {shape_area(shape)}")

    # HTTP错误
    print("\n=== HTTP错误 ===")
    statuses = [400, 401, 404, 500, 999]
    for status in statuses:
        print(f"{status}: {http_error(status)}")

if __name__ == "__main__":
    demo()
```

## 六、注意事项

### 1. match是表达式，不是语句

```python
# match可以返回值
result = match value:
    case 1:
        "one"
    case 2:
        "two"
    case _:
        "other"
```

### 2. 模式顺序很重要

```python
def demo(x):
    match x:
        case _:
            print("Default")
        case 0:
            print("Zero")  # 永远不会执行，因为_会匹配所有
```

### 3. 只匹配第一个匹配的case

```python
def demo(x):
    match x:
        case 1:
            print("One")
        case 1:
            print("Another One")  # 永远不会执行
```

### 4. 下划线只能使用一次

```python
# 错误
match x:
    case 1 | _:
        print("Matches 1 or anything")

# 正确
match x:
    case 1 | 2 | 3:
        print("Matches 1, 2, or 3")
    case _:
        print("Matches anything")
```
