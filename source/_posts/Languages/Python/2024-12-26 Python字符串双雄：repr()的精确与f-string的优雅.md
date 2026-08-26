---

title: Python字符串双雄：repr()的精确与f-string的优雅
tags:
  - Python
  - repr
  - f-string
  - 字符串格式化
categories: [Languages, Python]
series: [Python]
abbrlink: python-repr-vs-fstring
date: 2024-12-26

---

## 一、引言：字符串的两种面孔

在 Python 交互式命令行中，同一个对象可以呈现两种截然不同的面貌：

```python
>>> s = "Hello\nWorld"
>>> print(s)
Hello
World

>>> s
'Hello\nWorld'
```

`print(s)` 展示的是面向用户的友好输出——换行符真的换行了。而直接输入 `s`，展示的是面向开发者的精确描述——换行符被保留为 `\n`，还带着引号。

为什么 Python 需要两种方式来表示对象？因为它们服务于不同的受众：**用户需要可读性，开发者需要精确性**。

核心观点：**`repr()` 追求精确与可复现性，`f-string` 追求可读性与灵活性。**

## 二、repr()：对象的"官方身份证"

### 2.1 核心概念

`repr()` 旨在返回一个"官方"的字符串表示。理想情况下，这个字符串应该能作为 Python 代码来重新创建该对象：

```python
eval(repr(obj)) == obj
```

这不是硬性要求，但对于内置类型（如 `int`、`str`、`list`）来说，这个约定被严格遵守。

### 2.2 主要用途

**调试与开发**：在交互式解释器或日志中查看变量的精确状态：

```python
>>> name = "Alice"
>>> repr(name)
"'Alice'"          # 带引号！你能看出这是字符串

>>> nums = [1, 2, 3]
>>> repr(nums)
'[1, 2, 3]'        # 精确的列表表示
```

**容器显示**：当打印列表、字典等容器时，其内部元素会自动调用 `repr()`：

```python
>>> items = ["hello", "world"]
>>> print(items)
['hello', 'world']    # 元素用的是 repr()，带引号
```

### 2.3 关键特性

**保留细节**：对于字符串，`repr()` 会保留引号和转义字符：

```python
>>> s = "Hello\nWorld\t!"
>>> print(repr(s))
'Hello\nWorld\t!'     # \n 和 \t 被保留，而不是被解释
```

**自定义 `__repr__`**：

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"

p = Point(1, 2)
print(repr(p))   # Point(x=1, y=2) —— 清晰、可复现
```

## 三、f-string：字符串格式化的"瑞士军刀"

### 3.1 核心概念

f-string（Python 3.6+）在字符串前加 `f` 或 `F` 前缀，允许在花括号 `{}` 中直接嵌入 Python 表达式：

```python
name = "Alice"
age = 30
print(f"Hello, {name}! You are {age} years old.")
# Hello, Alice! You are 30 years old.
```

### 3.2 主要用途

**变量插值**：将变量或表达式的值嵌入到字符串中：

```python
import math
print(f"Pi is approximately {math.pi:.2f}")  # Pi is approximately 3.14
```

**复杂格式化**：

```python
# 数字精度
print(f"{3.14159:.2f}")       # 3.14

# 对齐填充
print(f"{'hello':>10}")       #      hello
print(f"{'hello':*^10}")      # **hello***

# 千位分隔符
print(f"{1000000:,}")         # 1,000,000

# 百分比
print(f"{0.85:.1%}")          # 85.0%

# 日期格式化
from datetime import datetime
now = datetime.now()
print(f"{now:%Y-%m-%d %H:%M}")  # 2024-12-26 21:42
```

### 3.3 关键特性

**表达式求值**：花括号内可以是任何合法的 Python 表达式：

```python
def double(x):
    return x * 2

print(f"Double of 5 is {double(5)}")  # Double of 5 is 10
print(f"2 + 3 = {2 + 3}")             # 2 + 3 = 5
```

**转换标志 `!r`**：在 f-string 内部直接调用 `repr()`：

```python
name = "Alice\n"
print(f"Debug: {name!r}")   # Debug: 'Alice\n' —— 保留了引号和转义
print(f"Show: {name}")      # Show: Alice
```

这是 `repr()` 和 f-string 结合使用的绝佳场景——在格式化输出中嵌入调试信息。

**调试利器 `f"{var=}"`**（Python 3.8+）：

```python
x = 42
y = "hello"
print(f"{x=}, {y=}")   # x=42, y='hello'
```

一行代码同时输出变量名和值，调试时极为方便。

## 四、终极对决：repr() vs f-string

### 4.1 对比维度

| 维度 | repr() | f-string |
|------|--------|----------|
| 目标受众 | 开发者（调试） | 用户（展示） |
| 输出内容 | 对象的精确描述 | 格式化后的文本 |
| 调用时机 | 调试或容器打印时自动触发 | 需要构建字符串时显式使用 |
| 可复现性 | 高（理想情况可 eval） | 低（面向可读性） |
| 格式控制 | 无 | 丰富（精度、对齐、日期等） |

### 4.2 代码对比

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Person(name={self.name!r}, age={self.age})"

    def __str__(self):
        return f"{self.name}, age {self.age}"

p = Person("Alice", 30)

# repr() —— 面向开发者
print(repr(p))   # Person(name='Alice', age=30)

# f-string —— 面向用户
print(f"Hello, {p.name}!")   # Hello, Alice!
```

## 五、实战技巧与最佳实践

### 5.1 组合使用

在 f-string 中使用 `!r` 来快速调试：

```python
items = ["apple", "banana", None]
for item in items:
    print(f"Processing {item!r}...")
# Processing 'apple'...
# Processing 'banana'...
# Processing None...
```

### 5.2 自定义类的 `__str__` 与 `__repr__`

如果只实现一个，**优先实现 `__repr__`**。原因：

- `__repr__` 是兜底方案——当 `__str__` 未定义时，`print()` 和 `str()` 会退而使用 `__repr__`
- `__repr__` 在调试、日志、容器打印时都会被调用，覆盖面更广
- `__str__` 只在 `print()` 和 `str()` 时被调用

```python
class Good:
    def __repr__(self):
        return "Good(only repr)"

g = Good()
print(g)       # Good(only repr) —— 自动退回 __repr__
print(repr(g)) # Good(only repr)
```

### 5.3 性能优势

f-string 在性能上优于 `%` 格式化和 `.format()` 方法：

```python
import timeit

name = "World"

timeit.timeit(f"'Hello {name}'", number=100000)           # 最快
timeit.timeit("'Hello {}'.format(name)", number=100000)   # 次之
timeit.timeit("'Hello %s' % name", number=100000)         # 最慢
```

f-string 在编译期就被解析为常量拼接，运行时几乎没有额外开销。

## 六、总结

| 特性 | repr() | f-string |
|------|--------|----------|
| 核心目标 | 精确与可复现 | 可读与灵活 |
| 典型场景 | 调试、日志、容器打印 | 用户展示、字符串构建 |
| 关键语法 | `repr(obj)` / `__repr__` | `f"..."` / `!r` / `var=` |
| 性能 | — | 优于 `%` 和 `.format()` |

**专家建议**：在开发过程中，善用 `repr()` 和 `!r` 进行调试；在构建最终输出时，优先使用 f-string 以获得最佳的可读性和性能。两者不是竞争关系，而是互补关系——`repr()` 告诉你"它是什么"，f-string 告诉你"它看起来怎样"。
