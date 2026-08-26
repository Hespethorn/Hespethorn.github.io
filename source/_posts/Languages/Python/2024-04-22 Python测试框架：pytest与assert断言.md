---

title: Python测试框架：pytest与assert断言
tags:
  - Python
  - 基础
  - 测试
  - pytest
  - assert
  - 单元测试
categories: [Languages, Python]
series: [Python]
abbrlink: python-testing-pytest
date: 2024-04-22

---

Python提供了多种测试工具，其中pytest是最流行的单元测试框架之一。本文将介绍Python中的assert语句以及pytest框架的基本用法。

## 一、assert语句

### 1. 基本用法

```python
# assert 条件
x = 10
assert x > 0  # 条件为True，无输出

# assert 条件, 错误信息
x = -5
assert x > 0, "x必须大于0"  # 抛出AssertionError
```

### 2. 常见用途

```python
def divide(a, b):
    assert b != 0, "除数不能为零"
    return a / b

def validate_age(age):
    assert 0 <= age <= 150, "年龄必须在0到150之间"
    return age

print(validate_age(25))  # 正常
# validate_age(-5)  # 抛出AssertionError
```

## 二、pytest框架

### 1. 基本安装和使用

```bash
pip install pytest
```

### 2. 编写测试函数

```python
# test_math.py
def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0
```

### 3. 运行测试

```bash
pytest test_math.py
pytest test_math.py::test_add  # 运行特定测试
pytest -v  # 详细输出
```

## 三、pytest常用功能

### 1. 断言

```python
def test_assertions():
    # 相等
    assert 1 == 1

    # 不等
    assert 1 != 2

    # 布尔值
    assert True
    assert not False

    # 成员
    assert "a" in "abc"
    assert 1 in [1, 2, 3]

    # 类型
    assert isinstance(1, int)
    assert isinstance("hello", str)
```

### 2. 异常测试

```python
import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(1, 0)
```

### 3. 参数化测试

```python
import pytest

@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, expected):
    assert a + b == expected
```

## 四、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试示例
"""

def add(a, b):
    """加法函数"""
    return a + b

def subtract(a, b):
    """减法函数"""
    return a - b

def multiply(a, b):
    """乘法函数"""
    return a * b

def divide(a, b):
    """除法函数"""
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

# 测试函数
def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0

def test_subtract():
    assert subtract(5, 3) == 2
    assert subtract(1, 1) == 0

def test_multiply():
    assert multiply(3, 4) == 12
    assert multiply(0, 100) == 0

def test_divide():
    assert divide(10, 2) == 5
    assert divide(9, 3) == 3

def test_divide_by_zero():
    import pytest
    with pytest.raises(ValueError):
        divide(1, 0)
```

## 五、注意事项

### 1. 不要过度使用assert

```python
# assert可能被优化掉
# python -O 运行时，assert语句会被忽略

# 重要检查使用if+raise
if b == 0:
    raise ValueError("除数不能为零")
```

### 2. 测试覆盖

```python
# 使用pytest-cov插件
# pytest --cov=my_module tests/
```

### 3. 测试文件命名

```
test_example.py      # 测试文件以test_开头
_example_test.py     # 或以_test结尾
```
