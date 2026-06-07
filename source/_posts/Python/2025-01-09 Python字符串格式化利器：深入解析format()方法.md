---
title: Python字符串格式化利器：深入解析format()方法
tags:
  - Python
  - format
  - 字符串格式化
categories:
  - Python
series: Python
abbrlink: python-str-format-deep-dive
date: 2025-01-09 21:33:47
---

## 一、引言：从"老式"到"新式"的进化

Python 早期的 `%` 格式化继承自 C 语言的 `printf`，语法繁琐且类型绑定严格：

```python
name = "Alice"
age = 30
print("Name: %s, Age: %d" % (name, age))
```

`format()` 作为 Python 2.6 引入的"新式"格式化方法，是 f-string 的前身，也是目前功能最全面的格式化方案。

核心观点：**虽然 f-string 更简洁，但 format() 在模板分离和动态格式化场景中依然是王者。**

## 二、基础语法：三种参数传递方式

### 2.1 位置参数

```python
# 默认顺序
"{} {}".format("Hello", "World")          # 'Hello World'

# 指定索引——可以打乱顺序或重复使用
"{1} {0} {1}".format("Hello", "World")    # 'World Hello World'
```

### 2.2 关键字参数

```python
"Hello, {name}! You are {age}.".format(name="Alice", age=30)
# 'Hello, Alice! You are 30.'

# 字典解包——配置生成的利器
data = {"name": "Alice", "age": 30}
"Hello, {name}! Age: {age}".format(**data)
# 'Hello, Alice! Age: 30'
```

### 2.3 混合使用

```python
"{0} is {age} years old. {0} lives in {city}.".format("Alice", age=30, city="Beijing")
# 'Alice is 30 years old. Alice lives in Beijing.'
```

建议保持清晰，避免过度混合。

## 三、核心进阶：格式说明符

冒号 `:` 后面的语法是 `[[fill]align][sign][#][0][width][,][.precision][type]`。

### 3.1 对齐与填充

```python
# 左对齐（默认字符串）
"{:<10}".format("hi")      # 'hi        '

# 右对齐（默认数字）
"{:>10}".format("hi")      # '        hi'

# 居中
"{:^10}".format("hi")      # '    hi    '

# 自定义填充字符
"{:*^10}".format("hi")     # '****hi****'
```

### 3.2 数字格式化

**精度控制**：

```python
"{:.2f}".format(3.14159)   # '3.14'
"{:.0f}".format(3.14159)   # '3'
```

**千位分隔符**——财务数据必备：

```python
"{:,}".format(1000000)     # '1,000,000'
"{:,.2f}".format(1234567.89)  # '1,234,567.89'
```

**百分比**：

```python
"{:.1%}".format(0.25)      # '25.0%'
"{:.2%}".format(1/3)       # '33.33%'
```

**进制转换**：

```python
"{:b}".format(42)          # '101010' —— 二进制
"{:x}".format(42)          # '2a' —— 十六进制
"{:o}".format(42)          # '52' —— 八进制
"{:#x}".format(42)         # '0x2a' —— 带前缀
```

**符号控制**：

```python
"{:+}".format(42)          # '+42'
"{:+}".format(-42)         # '-42'
"{: }".format(42)          # ' 42' —— 正数前加空格
```

### 3.3 动态宽度

```python
# 使用嵌套 {} 动态指定宽度
"{:{width}}".format("hi", width=10)       # 'hi        '
"{:>{width}.{prec}f}".format(3.14159, width=10, prec=2)  # '      3.14'
```

## 四、高级技巧：访问对象与容器

### 4.1 访问属性

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Alice", 30)
"{p.name} is {p.age}".format(p=p)  # 'Alice is 30'
```

### 4.2 访问字典键

```python
data = {"name": "Alice", "scores": [90, 85, 92]}
"Name: {d[name]}".format(d=data)  # 'Name: Alice'
```

### 4.3 访问列表索引

```python
items = ["apple", "banana", "cherry"]
"First: {0[0]}, Last: {0[2]}".format(items)  # 'First: apple, Last: cherry'
```

## 五、实战对比：format() vs f-string vs %

### 5.1 format() vs f-string

| 维度 | format() | f-string |
|------|----------|----------|
| 语法 | `"{}".format(x)` | `f"{x}"` |
| 性能 | 中等 | 最快 |
| 模板分离 | 支持 | 不支持 |
| 动态格式化 | 支持 | 有限支持 |
| Python 版本 | 2.6+ | 3.6+ |

**format() 的独特优势——模板与数据分离**：

```python
# 多语言支持
templates = {
    "en": "Hello, {name}!",
    "zh": "你好，{name}！",
    "ja": "こんにちは、{name}！"
}

lang = "zh"
name = "Alice"
print(templates[lang].format(name=name))  # 你好，Alice！
```

f-string 无法做到这一点，因为模板在编译期就被求值了。

**日志格式定义**：

```python
LOG_FORMAT = "[{level}] {time} - {message}"

def log(level, message):
    import datetime
    print(LOG_FORMAT.format(
        level=level,
        time=datetime.datetime.now().strftime("%H:%M:%S"),
        message=message
    ))

log("INFO", "Server started")  # [INFO] 21:33:47 - Server started
```

### 5.2 format() vs %

| 维度 | format() | % |
|------|----------|---|
| 类型安全 | 自动处理 | 严格绑定（%s, %d, %f） |
| 字典映射 | 支持 `{key}` | 需 `%(key)s` |
| 元组处理 | 安全 | 单元素元组必须加逗号 |
| 功能丰富度 | 高 | 低 |

`%` 格式化的经典陷阱：

```python
# 单元素元组必须加逗号，否则报错
"Value: %s" % (42,)   # 正确
"Value: %s" % (42)    # 等价于 "Value: %s" % 42，整数不是元组，会报错
```

## 六、总结与最佳实践

| 格式说明符 | 效果 | 示例 |
|-----------|------|------|
| `{:<10}` | 左对齐，宽10 | `'hi        '` |
| `{:>10}` | 右对齐，宽10 | `'        hi'` |
| `{:^10}` | 居中，宽10 | `'    hi    '` |
| `{:.2f}` | 保留2位小数 | `'3.14'` |
| `{:,}` | 千位分隔 | `'1,000,000'` |
| `{:.1%}` | 百分比 | `'25.0%'` |
| `{:b}` | 二进制 | `'101010'` |
| `{:+}` | 显示正负号 | `'+42'` |

**专家建议**：

1. **在 Python 3.6+ 项目中优先使用 f-string**——性能更好，语法更简
2. **在需要动态构建格式字符串或处理模板文件时，坚持使用 format()**——模板分离是它的核心优势
3. **尽量避免在 Python 3 中使用 % 格式化**——功能弱、陷阱多
4. **善用字典解包 `**data`**——让模板与数据自然对接
