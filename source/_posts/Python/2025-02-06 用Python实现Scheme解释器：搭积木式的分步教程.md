---
title: 用Python实现Scheme解释器：搭积木式的分步教程
tags:
  - Python
  - Scheme
  - 解释器
  - 解析器
  - 闭包
categories:
  - Python
series: Python
abbrlink: python-scheme-interpreter-tutorial
date: 2025-02-06
---

## 一、引言

编写解释器是理解编程语言本质的最佳方式。本文将用 Python 实现一个最小但功能完整的 Scheme 解释器，覆盖三个核心模块：

1. **解析器（Parser）**：将字符串代码转换为 Python 内部数据结构
2. **求值器（Evaluator）**：根据 Scheme 规则计算数据结构的值
3. **环境（Environment）**：存储和查找变量值的"记事本"

## 二、模块一：解析器

### 2.1 原理

Scheme 的语法极其简单——一切都是 S-表达式（括号嵌套列表）。解析过程分两步：

1. **词法分析（Tokenize）**：将字符串拆分为 token
2. **语法分析（Parse）**：将 token 序列转换为嵌套列表

### 2.2 实现

```python
import re

def tokenize(source):
    tokens = re.findall(r'\(|\)|[^\s()]+', source)
    return tokens

def parse(tokens):
    if not tokens:
        raise SyntaxError("意外的输入结束")

    token = tokens.pop(0)

    if token == '(':
        lst = []
        while tokens[0] != ')':
            lst.append(parse(tokens))
        tokens.pop(0)  # 弹出 ')'
        return lst
    elif token == ')':
        raise SyntaxError("意外的 )")
    else:
        return atom(token)

def atom(token):
    try:
        return int(token)
    except ValueError:
        try:
            return float(token)
        except ValueError:
            return token

# 测试
source = "(+ 1 (* 2 3))"
tokens = tokenize(source)
print(parse(tokens))  # ['+', 1, ['*', 2, 3]]
```

`(+ 1 (* 2 3))` 被解析为 `['+', 1, ['*', 2, 3]]`——嵌套列表完美对应括号嵌套。

## 三、模块二：环境

### 3.1 原理

环境是一个"记事本"，存储变量名到值的映射。它支持嵌套——内层环境可以访问外层环境的变量，这就是**作用域链**。

### 3.2 实现

```python
class Env(dict):
    def __init__(self, params=(), args=(), outer=None):
        self.update(zip(params, args))
        self.outer = outer

    def find(self, var):
        if var in self:
            return self
        if self.outer is None:
            raise NameError(f"未定义的变量: {var}")
        return self.outer.find(var)

# 测试
outer_env = Env(params=('x',), args=(10,))
inner_env = Env(params=('y',), args=(20,), outer=outer_env)

print(inner_env.find('y').get('y'))  # 20 —— 在内层找到
print(inner_env.find('x').get('x'))  # 10 —— 在外层找到
```

`find` 方法沿作用域链向外查找，直到找到变量或到达最外层。

### 3.3 标准环境

```python
import operator
import math

def standard_env():
    env = Env()
    env.update({
        '+': operator.add,
        '-': operator.sub,
        '*': operator.mul,
        '/': operator.truediv,
        '>': operator.gt,
        '<': operator.lt,
        '>=': operator.ge,
        '<=': operator.le,
        '=': operator.eq,
        'abs': abs,
        'max': max,
        'min': min,
        'round': round,
        'number?': lambda x: isinstance(x, (int, float)),
        'symbol?': lambda x: isinstance(x, str),
        'list': lambda *args: list(args),
        'length': len,
        'append': lambda *args: sum(args, []),
        'car': lambda lst: lst[0],
        'cdr': lambda lst: lst[1:],
        'cons': lambda x, lst: [x] + lst,
        'null?': lambda lst: lst == [],
        'display': lambda x: print(x, end=''),
        'newline': lambda: print(),
        'pi': math.pi,
    })
    return env
```

## 四、模块三：求值器

### 4.1 原理

求值器根据表达式的类型采取不同的求值策略：

- **数字**：直接返回
- **符号**：在环境中查找
- **列表**：根据第一个元素分派（函数调用、特殊形式）

### 4.2 实现

```python
def eval_expr(x, env):
    if isinstance(x, int) or isinstance(x, float):
        return x

    if isinstance(x, str):
        return env.find(x)[x]

    if not isinstance(x, list):
        return x

    op = x[0]

    if op == 'quote':
        return x[1]

    if op == 'if':
        _, test, conseq = x[0:3]
        alt = x[3] if len(x) > 3 else None
        if eval_expr(test, env):
            return eval_expr(conseq, env)
        elif alt is not None:
            return eval_expr(alt, env)
        return None

    if op == 'define':
        _, var, expr = x
        env[var] = eval_expr(expr, env)
        return None

    if op == 'lambda':
        _, params, body = x
        def procedure(*args):
            local_env = Env(params=params, args=args, outer=env)
            return eval_expr(body, local_env)
        return procedure

    # 函数调用
    proc = eval_expr(op, env)
    args = [eval_expr(arg, env) for arg in x[1:]]
    return proc(*args)
```

### 4.3 测试

```python
env = standard_env()

# 基础运算
print(eval_expr(parse(tokenize("(+ 1 2)")), env))  # 3

# 变量定义与引用
eval_expr(parse(tokenize("(define x 10)")), env)
print(eval_expr(parse(tokenize("x")), env))  # 10

# 条件判断
print(eval_expr(parse(tokenize("(if (> x 5) 100 0)")), env))  # 100

# lambda 与闭包
eval_expr(parse(tokenize("(define square (lambda (n) (* n n)))")), env)
print(eval_expr(parse(tokenize("(square 7)")), env))  # 49

# 闭包：函数记住定义时的环境
eval_expr(parse(tokenize("(define make-adder (lambda (n) (lambda (x) (+ n x))))")), env)
eval_expr(parse(tokenize("(define add5 (make-adder 5))")), env)
print(eval_expr(parse(tokenize("(add5 10)")), env))  # 15
```

`make-adder` 返回的 `lambda` 捕获了外层环境中的 `n=5`，形成闭包。调用 `add5(10)` 时，内层 `lambda` 在自己的局部环境中查找 `x=10`，在外层环境中查找 `n=5`，返回 `15`。

## 五、REPL：交互式命令行

```python
def repl(prompt="lispy> "):
    env = standard_env()
    while True:
        try:
            source = input(prompt)
            if source.strip() == "":
                continue
            tokens = tokenize(source)
            while True:
                try:
                    expr = parse(tokens)
                    result = eval_expr(expr, env)
                    if result is not None:
                        print(result)
                except SyntaxError:
                    break
                if not tokens:
                    break
        except KeyboardInterrupt:
            print("\n再见！")
            break
        except Exception as e:
            print(f"错误：{e}")

if __name__ == "__main__":
    repl()
```

运行后可以交互式输入 Scheme 代码：

```
lispy> (define x 42)
lispy> (+ x 8)
50
lispy> (define fact (lambda (n) (if (= n 0) 1 (* n (fact (- n 1))))))
lispy> (fact 5)
120
lispy> (define make-counter (lambda () (define n 0) (lambda () (set! n (+ n 1)) n)))
```

## 六、总结

这个解释器虽然只有约 100 行代码，但已经覆盖了编程语言的核心概念：

| 模块 | 功能 | 对应的 Python 实现 |
|------|------|-------------------|
| 解析器 | 字符串 → 嵌套列表 | `tokenize()` + `parse()` |
| 环境 | 变量存储与作用域 | `Env` 类（嵌套字典） |
| 求值器 | 递归求值表达式 | `eval_expr()` 函数 |
| 闭包 | 函数记住定义时环境 | `lambda` 捕获 `env` |
| REPL | 交互式命令行 | `repl()` 循环 |

通过实现这个解释器，你亲手构建了编程语言的三大基石——解析、环境、求值。理解了它们，任何语言都不再是黑魔法。
