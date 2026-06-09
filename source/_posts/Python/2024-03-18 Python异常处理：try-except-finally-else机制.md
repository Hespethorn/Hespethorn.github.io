---
title: Python异常处理：try-except-finally-else机制
tags:
  - Python
  - 基础
  - 异常处理
  - try
  - except
  - finally
categories:
  - Python
series: Python
abbrlink: 16a1976e
date: 2024-03-18
---

Python的异常处理机制是一种强大的错误处理方式，使用try、except、finally和else关键字来捕获和处理程序运行过程中的错误。本文将详细介绍Python异常处理的各种用法。

## 一、基本语法

### 1. try-except结构

```python
try:
    # 可能引发异常的代码
    result = 10 / 0
except ZeroDivisionError:
    # 处理特定异常
    print("不能除以零")
```

### 2. 捕获异常信息

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"错误类型: {type(e).__name__}")
    print(f"错误信息: {e}")
```

### 3. 多个except子句

```python
try:
    value = int("abc")
    result = 10 / 0
except ValueError:
    print("值错误：无法转换为整数")
except ZeroDivisionError:
    print("除零错误")
```

### 4. 捕获所有异常

```python
try:
    result = 10 / 0
except Exception as e:
    print(f"发生错误: {e}")
except:
    print("发生未知错误")
```

## 二、else子句

### 1. 基本用法

else子句在没有异常发生时执行：

```python
try:
    result = 10 / 2
except ZeroDivisionError:
    print("除零错误")
else:
    print(f"计算结果: {result}")  # 输出：计算结果: 5.0
```

### 2. 与if-else的区别

```python
# else在try-except结构中的作用
try:
    num = int(input("输入一个数字: "))
except ValueError:
    print("无效输入")
else:
    # 只有在没有异常时才会执行
    print(f"你输入的是: {num}")
```

## 三、finally子句

### 1. 基本用法

finally子句无论是否有异常都会执行：

```python
try:
    file = open("test.txt", "r")
    content = file.read()
except FileNotFoundError:
    print("文件不存在")
finally:
    print("清理工作")
    # 通常用于关闭文件、释放资源等
```

### 2. 典型应用场景

```python
# 资源清理
try:
    file = open("test.txt", "r")
    content = file.read()
    print(content)
except Exception as e:
    print(f"错误: {e}")
finally:
    file.close()  # 无论是否有异常，都会执行关闭操作
```

## 四、Python与C++异常处理的对比

### 1. 语法对比

**C++**：
```cpp
try {
    // 可能抛出异常的代码
    throw std::runtime_error("Error message");
} catch (const std::exception& e) {
    // 处理异常
    std::cerr << e.what() << std::endl;
} catch (...) {
    // 捕获所有其他异常
}
```

**Python**：
```python
try:
    # 可能引发异常的代码
    raise ValueError("错误信息")
except ValueError as e:
    # 处理异常
    print(e)
except Exception:
    # 捕获所有其他异常
    pass
```

### 2. 异常类型

**C++**：使用标准异常类或自定义异常类

**Python**：内置多种异常类型，如ZeroDivisionError、ValueError、TypeError等

## 五、常见异常类型

### 1. 内置异常

```python
# ZeroDivisionError
try:
    result = 10 / 0
except ZeroDivisionError:
    print("除零错误")

# ValueError
try:
    num = int("abc")
except ValueError:
    print("值错误")

# TypeError
try:
    result = "hello" + 123
except TypeError:
    print("类型错误")

# IndexError
try:
    lst = [1, 2, 3]
    print(lst[10])
except IndexError:
    print("索引错误")

# KeyError
try:
    d = {"a": 1}
    print(d["b"])
except KeyError:
    print("键错误")
```

### 2. 自定义异常

```python
class ValidationError(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

def validate_age(age):
    if age < 0:
        raise ValidationError("年龄不能为负数")
    if age > 150:
        raise ValidationError("年龄超出合理范围")

try:
    validate_age(-5)
except ValidationError as e:
    print(f"验证错误: {e.message}")
```

## 六、综合示例

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
异常处理综合示例
"""

class BankAccount:
    def __init__(self, balance=0):
        if balance < 0:
            raise ValueError("初始余额不能为负数")
        self._balance = balance

    def deposit(self, amount):
        try:
            if amount <= 0:
                raise ValueError("存款金额必须为正数")
            self._balance += amount
            return self._balance
        except ValueError as e:
            print(f"存款失败: {e}")
            return None

    def withdraw(self, amount):
        try:
            if amount <= 0:
                raise ValueError("取款金额必须为正数")
            if amount > self._balance:
                raise ValueError("余额不足")
            self._balance -= amount
            return self._balance
        except ValueError as e:
            print(f"取款失败: {e}")
            return None

    @property
    def balance(self):
        return self._balance

def safe_divide(a, b):
    """安全除法"""
    try:
        result = a / b
    except ZeroDivisionError:
        print("错误: 除数不能为零")
        return None
    else:
        print(f"计算成功: {a} / {b} = {result}")
        return result
    finally:
        print("除法运算结束")

def read_config(filename):
    """读取配置文件"""
    config = {}
    try:
        with open(filename, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=')
                    config[key.strip()] = value.strip()
    except FileNotFoundError:
        print(f"配置文件 {filename} 不存在")
    except ValueError:
        print(f"配置文件格式错误")
    else:
        print("配置文件读取成功")
    finally:
        return config

def demo():
    """演示"""
    # 安全除法
    print("=== 安全除法 ===")
    safe_divide(10, 2)
    safe_divide(10, 0)

    # 银行账户
    print("\n=== 银行账户 ===")
    account = BankAccount(100)
    print(f"初始余额: {account.balance}")
    account.deposit(50)
    print(f"存款后余额: {account.balance}")
    account.withdraw(30)
    print(f"取款后余额: {account.balance}")
    account.withdraw(200)

    # 读取配置
    print("\n=== 读取配置 ===")
    config = read_config("config.txt")

if __name__ == "__main__":
    demo()
```

## 七、注意事项

### 1. 不要过度使用异常处理

```python
# 不推荐：使用异常处理控制流程
try:
    result = my_list.pop()
except IndexError:
    result = None

# 推荐：先检查条件
if my_list:
    result = my_list.pop()
else:
    result = None
```

### 2. 异常捕获的顺序

```python
# 顺序很重要
try:
    result = 10 / 0
except Exception:  # 宽泛的异常放后面
    print("Exception")
except ZeroDivisionError:  # 具体的异常放前面
    print("ZeroDivisionError")  # 永远不会执行
```

### 3. 使用finally进行清理

```python
# 确保资源释放
conn = None
try:
    conn = create_connection()
    result = conn.query("SELECT * FROM table")
except Exception as e:
    print(f"查询失败: {e}")
finally:
    if conn:
        conn.close()  # 确保连接被关闭
```
