---
title: Python全局变量：作用域与global关键字
tags:
  - Python
  - 基础
  - 全局变量
  - global
  - 作用域
categories:
  - Python
series: Python
abbrlink: d17a61c7
date: 2024-02-26
---

在Python编程中，全局变量和局部变量的作用域是一个重要的概念。本文将详细介绍Python中全局变量的使用，以及如何通过`global`关键字在函数内部修改全局变量。

## 一、全局变量和局部变量

### 1. 基本概念

```python
# 全局变量
global_var = 10

def func():
    # 局部变量
    local_var = 20
    print(f"Inside function: global_var = {global_var}")
    print(f"Inside function: local_var = {local_var}")

func()
print(f"Outside function: global_var = {global_var}")
# print(local_var)  # NameError: name 'local_var' is not defined
```

### 2. 作用域规则

```python
# 【全局作用域 Global】：整个文件顶层的变量
x = "global"

def outer():
    # 【嵌套外层作用域 Enclosing】：outer 函数内部，独立于全局 x
    x = "enclosing"

    def inner():
        # 【本地作用域 Local】：inner 函数内部，独立于外层所有 x
        x = "local"
        # 查找规则：优先用自己内部的 Local x → 输出 local
        print(f"Inner: x = {x}")

    # 调用 inner，执行完后，inner 的本地 x 就销毁了
    inner()
    # 查找规则：outer 自己的 Enclosing x → 输出 enclosing
    print(f"Outer: x = {x}")

# 调用 outer，执行完后，outer 的嵌套 x 就销毁了
outer()
# 查找规则：全局作用域的 Global x → 输出 global
print(f"Global: x = {x}")
```

## 二、global关键字

### 1. 在函数内部修改全局变量

```python
counter = 0

def increment():
    global counter
    counter += 1
    return counter

print(increment())  # 输出：1
print(counter)      # 输出：1
print(increment())  # 输出：2
print(counter)      # 输出：2
```

### 2. global与局部变量的区别

```python
# 没有global关键字
x = 10

def func_without_global():
    x = 20  # 创建新的局部变量，不影响全局变量
    return x

print(func_without_global())  # 输出：20
print(x)  # 输出：10（全局变量未改变）

# 有global关键字
def func_with_global():
    global x
    x = 20  # 修改全局变量
    return x

print(func_with_global())  # 输出：20
print(x)  # 输出：20（全局变量被改变）

def test():
    x += 1  # 报错！因为你想修改全局 x，但没声明 global
test()
```

### 3. 在同一函数中声明多个全局变量

```python
count = 0
name = "original"

def update():
    global count, name
    count += 1
    name = "updated"

update()
print(f"count = {count}, name = {name}")  # 输出：count = 1, name = updated
```

## 三、全局变量的最佳实践

### 1. 尽量避免使用全局变量

```python
# 不推荐：使用全局变量
total = 0

def add_to_total(value):
    global total
    total += value

# 推荐：使用参数和返回值
def add_to_total_good(value, total=0):
    return total + value

total = add_to_total_good(10, 0)
total = add_to_total_good(20, total)
```

### 2. 使用类或模块封装

```python
# 使用类封装相关状态
class Counter:
    def __init__(self):
        self._count = 0

    def increment(self):
        self._count += 1

    @property
    def count(self):
        return self._count

counter = Counter()
counter.increment()
counter.increment()
print(counter.count)  # 输出：2
```

### 3. 使用函数闭包

```python
def create_counter():
    count = 0

    def increment():
        nonlocal count
        count += 1
        return count

    return increment

counter = create_counter()
print(counter())  # 输出：1
print(counter())  # 输出：2
```

## 四、nonlocal关键字

### 1. 基本用法

`nonlocal`用于在嵌套函数中修改外层函数的变量：

```python
def outer():
    x = 10

    def inner():
        nonlocal x
        x = 20

    inner()
    print(f"Outer: x = {x}")  # 输出：Outer: x = 20

outer()
```

### 2. global vs nonlocal

```python
# global：作用于全局变量
x = "global"

def func1():
    global x
    x = "modified global"

# nonlocal：作用于外层函数的变量
def outer():
    x = "enclosing"

    def inner():
        nonlocal x
        x = "modified enclosing"

    inner()
    print(f"Inside outer: x = {x}")  # 输出：Inside outer: x = modified enclosing

func1()
print(f"Global: x = {x}")  # 输出：Global: x = modified global
outer()
```

## 五、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全局变量综合示例
"""

# 示例1：配置管理器（使用类而非全局变量）
class Config:
    _instance = None
    _config = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def set(self, key, value):
        self._config[key] = value

    def get(self, key, default=None):
        return self._config.get(key, default)

config1 = Config()
config2 = Config()

config1.set("debug", True)
print(config2.get("debug"))  # 输出：True（单例模式）
print(config1 is config2)    # 输出：True

# 示例2：使用函数闭包替代全局变量
def create_logger():
    logs = []

    def log(message):
        logs.append(message)
        return logs

    return log

logger = create_logger()
logger("Message 1")
logger("Message 2")
print(logger([]))  # 输出：['Message 1', 'Message 2']

# 示例3：状态机
class StateMachine:
    def __init__(self):
        self._state = "idle"
        self._transitions = {
            "idle": {"start": "running"},
            "running": {"stop": "idle", "pause": "paused"},
            "paused": {"resume": "running", "stop": "idle"}
        }

    def transition(self, action):
        if action in self._transitions.get(self._state, {}):
            self._state = self._transitions[self._state][action]
            return True
        return False

    @property
    def state(self):
        return self._state

sm = StateMachine()
print(sm.state)        # 输出：idle
sm.transition("start")
print(sm.state)        # 输出：running
sm.transition("pause")
print(sm.state)        # 输出：paused
```

## 六、注意事项

### 1. 全局变量的线程安全性

```python
import threading

# 全局变量在多线程环境下不安全
counter = 0

def increment_ntimes(n):
    for _ in range(n):
        global counter
        counter += 1

# 创建两个线程同时修改全局变量
t1 = threading.Thread(target=increment_ntimes, args=(100000,))
t2 = threading.Thread(target=increment_ntimes, args=(100000,))

t1.start()
t2.start()
t1.join()
t2.join()

print(counter)  # 可能不是200000（存在竞态条件）
```

### 2. 模块级全局变量

```python
# mymodule.py
# module_level_var = "initial"

# main.py
# import mymodule
# print(mymodule.module_level_var)  # 输出：initial
# mymodule.module_level_var = "modified"  # 可以修改模块级变量
```

### 3. 调试全局变量问题

```python
# 使用globals()查看所有全局变量
x = 10
y = "hello"

def show_globals():
    for key, value in globals().items():
        if not key.startswith('_'):
            print(f"{key}: {value}")

show_globals()
```
