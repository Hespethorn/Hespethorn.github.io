---
title: Scheme quote深度解析：求值与数据的边界
tags:
  - Python
  - Scheme
  - quote
  - 解释器
  - 求值规则
categories:
  - Python
series: Python
abbrlink: python-scheme-quote-explained
date: 2025-02-20
---

## 一、核心概念：求值规则

### 1.1 Scheme 的默认行为：自动求值

Scheme 解释器的默认行为是**对一切表达式求值**。当你输入 `(+ 1 2)` 时，解释器不会把 `+`、`1`、`2` 当作符号保留，而是：

1. 查找 `+` 对应的加法函数
2. 求值 `1` 和 `2` 得到数字
3. 调用加法函数，返回 `3`

这是 Scheme 的"本能"——看到代码就执行，就像演员看到剧本就演出。

### 1.2 quote 的作用：阻止求值

`quote` 的作用是**阻止这种默认行为**，把代码当作数据处理。它告诉解释器："别执行这段代码，原样返回就好。"

```scheme
(+ 1 2)       ;; => 3        （求值：执行加法）
'(+ 1 2)      ;; => (+ 1 2)  （不求值：返回列表本身）
(quote (+ 1 2))  ;; => (+ 1 2)  （同上，' 是语法糖）
```

`'` 是 `(quote ...)` 的简写——它们完全等价。

## 二、直观对比：有 quote vs 无 quote

| 表达式 | 求值结果 | 说明 |
|--------|---------|------|
| `42` | `42` | 数字自求值 |
| `"hello"` | `"hello"` | 字符串自求值 |
| `x` | x 的值 | 查找变量 x |
| `'x` | `x` | 返回符号 x 本身 |
| `(+ 1 2)` | `3` | 执行加法 |
| `'(+ 1 2)` | `(+ 1 2)` | 返回列表 |
| `(list 1 2 3)` | `(1 2 3)` | 构造列表（参数被求值） |
| `'(1 2 3)` | `(1 2 3)` | 返回列表（参数不求值） |
| `#t` | `#t` | 布尔值自求值 |
| `'#t` | `#t` | 同上（quote 对自求值对象无效果） |

关键区别：**没有 quote 时，`(+ 1 2)` 被执行为 `3`；有 quote 时，`(+ 1 2)` 被当作一个包含三个元素的列表保留。**

## 三、生动的比喻：剧本与演出

把代码比作**剧本**，把求值比作**演出**。

- **没有 quote**：演员看到剧本就上台表演。`(+ 1 2)` 就像一句台词"把1和2加起来"，演员照做，结果是3。
- **有 quote**：把剧本锁在柜子里，只让人看文字，不让人去表演。`'(+ 1 2)` 就像把这句台词原样抄在纸上，结果是 `(+ 1 2)` 这个列表。

再换一个比喻：**引号**。

在自然语言中，我说"你好"是在打招呼，但我说"'你好'"是在引用这两个字本身。Scheme 的 `quote` 就是这个"引号"——它把代码从"被执行"的状态切换到"被引用"的状态。

## 四、在 Python 解释器中的实现

结合我们之前实现的 Scheme 解释器，`quote` 的处理非常简单——**跳过求值，直接返回数据**。

### 4.1 修改求值器

```python
def eval_expr(x, env):
    if isinstance(x, int) or isinstance(x, float):
        return x

    if isinstance(x, str):
        if x == '#t':
            return True
        if x == '#f':
            return False
        return env.find(x)[x]

    if not isinstance(x, list):
        return x

    op = x[0]

    # 处理 quote：直接返回第二个元素，不求值
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

    proc = eval_expr(op, env)
    args = [eval_expr(arg, env) for arg in x[1:]]
    return proc(*args)
```

关键只有两行：

```python
if op == 'quote':
    return x[1]   # 跳过求值，直接返回
```

当解释器看到 `quote` 关键字时，它**跳过对后续内容的计算，直接返回数据**。这就是"阻止求值"的全部实现。

### 4.2 修改解析器：支持 `'` 语法糖

```python
def parse(tokens):
    if not tokens:
        raise SyntaxError("意外的输入结束")

    token = tokens.pop(0)

    if token == "'":
        return ['quote', parse(tokens)]  # 'x 转为 (quote x)
    elif token == '(':
        lst = []
        while tokens[0] != ')':
            lst.append(parse(tokens))
        tokens.pop(0)
        return lst
    elif token == ')':
        raise SyntaxError("意外的 )")
    else:
        return atom(token)
```

当解析器遇到 `'` 时，自动将其转换为 `(quote ...)` 形式。这样 `'(+ 1 2)` 会被解析为 `['quote', ['+', 1, 2]]`。

### 4.3 测试

```python
env = standard_env()

# quote 阻止求值
print(eval_expr(parse(tokenize("'(+ 1 2)")), env))
# ['+', 1, 2] —— 列表本身，不是3

# 没有 quote 时正常求值
print(eval_expr(parse(tokenize("(+ 1 2)")), env))
# 3

# quote 符号
print(eval_expr(parse(tokenize("'x")), env))
# 'x' —— 符号本身

# quote 嵌套结构
print(eval_expr(parse(tokenize("'(a (b c) d)")), env))
# ['a', ['b', 'c'], 'd']
```

## 五、quote 的深层意义

### 5.1 代码即数据

`quote` 揭示了 Lisp/Scheme 家族最强大的特性——**代码和数据是同一种东西**。一段代码加上 `quote` 就变成了数据，去掉 `quote` 就变回了代码。这就是"同像性（Homoiconicity）"。

### 5.2 宏的基础

没有 `quote`，宏就不可能存在。宏的本质是：接收代码作为数据，变换后再作为代码执行。`quote` 是"代码→数据"的桥梁，`eval` 是"数据→代码"的桥梁。

### 5.3 对比 Python

Python 中没有直接等价的 `quote`。最接近的是：

```python
# Python 的 "quote"：用字符串表示代码
code = "1 + 2"          # 字符串，不会被求值
result = eval(code)     # 手动求值，得到 3

# Python 的列表不是代码
lst = [1, 2, 3]         # 这只是数据，不是可执行的代码
```

Python 的代码和数据是分离的——代码是语法树，数据是对象。Scheme 中代码本身就是列表数据，`quote` 只是让你看到它的本来面目。

## 六、总结

`quote` 的核心是**求值与数据的边界**：

1. **没有 quote**：表达式被求值，`(+ 1 2)` → `3`
2. **有 quote**：表达式被当作数据，`'(+ 1 2)` → `(+ 1 2)`
3. **在解释器中**：只需两行代码——遇到 `quote` 就跳过求值，直接返回
4. **深层意义**：代码即数据，这是 Lisp 家族一切魔力的根源

理解了 `quote`，你就理解了 Scheme 最核心的设计哲学——程序和数据不是两个世界，而是同一个世界的两种视角。加上 `quote` 看到的是数据，去掉 `quote` 看到的是程序。这种统一性，正是函数式编程的优雅所在。
