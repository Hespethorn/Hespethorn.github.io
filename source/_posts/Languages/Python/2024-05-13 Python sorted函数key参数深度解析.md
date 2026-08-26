---

title: Python sorted函数key参数深度解析
tags:
  - Python
  - 函数
  - sorted
  - key参数
categories: [Languages, Python]
series: [Python]
abbrlink: python-sorted-key-parameter
date: 2024-05-13

---

在Python中，sorted函数是一个强大的排序工具，而其中的key参数更是其最核心、最灵活的功能之一。本文将深入解析key参数的工作原理和使用技巧，帮助你在各种场景下优雅地实现排序需求。

## 一、key参数的基本原理

key参数接收一个函数，这个函数会被应用到列表中的每一个元素上。sorted不会直接比较元素本身，而是比较这个函数处理元素后返回的"结果"。你可以把它想象成给每个元素贴一个"标签"，排序是根据"标签"的内容来排，而不是根据元素本身。

## 二、key参数的三种传参方式

### 1. 使用lambda表达式（最常用）

当你需要快速定义一个简单的规则（比如按字典的某个键、按对象的某个属性）时，lambda是最方便的。

```python
users = [
    {"name": "Alice", "age": 25},
    {"name": "Bob", "age": 20},
    {"name": "Charlie", "age": 30}
]

# key接收一个函数，这里用lambda提取出age
sorted_users = sorted(users, key=lambda x: x['age'])

print(sorted_users)
# 输出: [{'name': 'Bob', 'age': 20}, {'name': 'Alice', 'age': 25}, {'name': 'Charlie', 'age': 30}]
```

### 2. 使用operator模块（最高效）

如果你只是单纯地想按索引或属性取值，Python标准库operator提供了比lambda更快、更可读的工具。

- `itemgetter(n)`：用于字典或元组，相当于`lambda x: x[n]`。
- `attrgetter('name')`：用于对象，相当于`lambda x: x.name`。

```python
from operator import itemgetter

users = [
    {"name": "Alice", "age": 25},
    {"name": "Bob", "age": 20},
    {"name": "Charlie", "age": 30}
]

# 直接指定按'age'键取值，速度比lambda略快
sorted_users = sorted(users, key=itemgetter('age'))

print(sorted_users)
```

### 3. 使用自定义函数（最灵活）

当你的排序规则很复杂（比如需要计算、判断、或者查表）时，可以定义一个标准的def函数传进去。

```python
numbers = [-10, 5, -2, 8]

def get_abs(n):
    return abs(n)

# 传入函数名（注意不要加括号）
sorted_nums = sorted(numbers, key=get_abs)

print(sorted_nums)
# 输出: [-2, 5, 8, -10]  (按绝对值 2, 5, 8, 10 排序)
```

## 三、进阶技巧：多级排序

如果第一个条件相同，想按第二个条件排怎么办？技巧：让key返回一个元组`(条件1, 条件2)`。

```python
users = [
    {"name": "Alice", "age": 25},
    {"name": "Bob", "age": 20},
    {"name": "Carry", "age": 25} # 和Alice同龄
]

# 返回一个元组 (age, name)
# Python会自动先比元组第一个元素，如果一样再比第二个
sorted_users = sorted(users, key=lambda x: (x['age'], x['name']))

print(sorted_users)
# 输出: [Bob(20), Alice(25), Carry(25)] 
# Alice排在Carry前面，因为 'Alice' < 'Carry'
```

## 四、总结

| 传参方式 | 代码示例 | 适用场景 |
|---------|---------|--------|
| Lambda | `key=lambda x: x['age']` | 简单逻辑，不想专门定义函数时（最常用）。 |
| Operator | `key=itemgetter('age')` | 纯粹的数据提取，追求性能和代码整洁。 |
| 自定义函数 | `key=my_func` | 逻辑复杂，需要计算或处理异常时。 |

