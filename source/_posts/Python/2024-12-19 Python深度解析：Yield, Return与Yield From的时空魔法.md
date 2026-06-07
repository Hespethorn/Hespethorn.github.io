---
title: Python深度解析：Yield, Return与Yield From的时空魔法
tags:
  - Python
  - 生成器
  - yield
  - 协程
categories:
  - Python
series: Python
abbrlink: python-yield-return-yield-from
date: 2024-12-19 22:17:45
---

## 一、引言：打破"一次性"函数的诅咒

普通函数有一个致命特征——**一次性**。执行到底，`return` 结果，销毁所有局部变量。人死灯灭，不留痕迹。

但有些场景需要函数"记住"上次执行到哪里了。比如遍历一个大文件，你不想一次性读入内存，而是读一行、处理一行、再读一行。这就需要函数拥有"记忆"——**生成器**应运而生。

生成器让函数从"单向流水线"变成了"可暂停的状态机"。

## 二、Yield：时间的暂停与状态的冻结

### 2.1 核心机制

当代码执行到 `yield` 时，函数并没有结束，而是"挂起"了：

- **保存**当前的执行位置和所有局部变量
- **产出**一个值给调用者
- **交还**控制权，等待下次被唤醒

```python
def counter(n):
    i = 0
    while i < n:
        print(f"  [生成器内部] 即将 yield {i}")
        yield i
        print(f"  [生成器内部] 从 yield {i} 处苏醒")
        i += 1

gen = counter(3)  # 只是创建了生成器对象，没有执行任何代码！

print("步骤1：调用 next()")
result1 = next(gen)  # 执行到 yield 0，挂起
print(f"得到：{result1}")

print("\n步骤2：再次调用 next()")
result2 = next(gen)  # 从 yield 0 处苏醒，执行到 yield 1，挂起
print(f"得到：{result2}")

print("\n步骤3：第三次调用 next()")
result3 = next(gen)  # 从 yield 1 处苏醒，执行到 yield 2，挂起
print(f"得到：{result3}")
```

输出：

```
步骤1：调用 next()
  [生成器内部] 即将 yield 0
得到：0

步骤2：再次调用 next()
  [生成器内部] 从 yield 0 处苏醒
  [生成器内部] 即将 yield 1
得到：1

步骤3：第三次调用 next()
  [生成器内部] 从 yield 1 处苏醒
  [生成器内部] 即将 yield 2
得到：2
```

关键点：局部变量 `i` 在多次调用之间**依然存在且值被保留**。这就是生成器的"记忆"——它保存了整个栈帧。

### 2.2 反直觉的关键

**调用生成器函数只是创建了一个迭代器，并没有执行代码。**只有 `next()` 或 `send()` 才会触发执行。这是很多初学者的误区。

```python
def my_gen():
    print("我被执行了！")
    yield 42

g = my_gen()   # 什么都没打印！函数体没有执行
next(g)        # 这时才打印"我被执行了！"
```

## 三、Return：生成器的终结与异常

### 3.1 Return 的双重身份

在普通函数中，`return` 返回数据并结束。在生成器中，`return` 的语义完全不同：

- **`return`（无值）**：等同于 `raise StopIteration`，标志着迭代的正式结束
- **`return value`（有值）**：在 Python 3.3+ 中，触发 `StopIteration` 异常，并将 `value` 赋值给异常的 `value` 属性

```python
def gen_with_return():
    yield 1
    yield 2
    return "done"   # 这个值不会被 next() 获取！

g = gen_with_return()
print(next(g))  # 1
print(next(g))  # 2
try:
    next(g)      # 触发 StopIteration
except StopIteration as e:
    print(f"生成器结束，返回值：{e.value}")  # done
```

### 3.2 重要澄清

生成器的 `return` 值**不会被 `next()` 直接获取**，它被藏在 `StopIteration` 异常里。手动捕获这个值很麻烦，它的主要用途是配合 `yield from`——这是获取生成器 `return` 值的唯一优雅方式。

## 四、Yield From：数据管道的无缝对接

### 4.1 痛点场景

没有 `yield from` 时，委托给子生成器需要写冗余的循环：

```python
def sub_gen():
    yield "A"
    yield "B"
    return "sub_done"

def main_gen():
    result = yield from sub_gen()   # 优雅！
    print(f"子生成器返回：{result}")
    yield "C"

list(main_gen())
# 子生成器返回：sub_done
# ['A', 'B', 'C']
```

如果不用 `yield from`，等价写法是：

```python
def main_gen_manual():
    sub = sub_gen()
    try:
        while True:
            value = next(sub)
            yield value
    except StopIteration as e:
        result = e.value
    print(f"子生成器返回：{result}")
    yield "C"
```

### 4.2 语法糖与代理

`yield from` 不仅仅是语法糖，它是一个**透明通道**：

- **数据从子生成器流向调用者**：子生成器 yield 的值直接传递给调用者
- **异常和 send 值从调用者流向子生成器**：调用者 `send()` 的值直接传给子生成器
- **自动获取返回值**：`result = yield from sub_gen()` 优雅地拿到了子生成器的 `return` 值

### 4.3 获取返回值

```python
def accumulator():
    total = 0
    while True:
        value = yield total
        if value is None:
            break
        total += value
    return total

def delegate():
    result = yield from accumulator()
    print(f"累加结果：{result}")

gen = delegate()
next(gen)          # 启动生成器，返回 0
gen.send(10)       # 返回 10
gen.send(20)       # 返回 30
gen.send(30)       # 返回 60
try:
    gen.send(None)  # 终止子生成器
except StopIteration:
    pass
# 输出：累加结果：60
```

## 五、深度对比：Return vs Yield

| 维度 | Return | Yield |
|------|--------|-------|
| 执行流 | 终止函数 | 暂停函数 |
| 状态 | 销毁栈帧 | 保留栈帧 |
| 返回值 | 返回最终结果 | 产出中间结果 |
| 调用次数 | 一次 | 多次 |
| 函数类型 | 普通函数 | 生成器函数 |
| 内存 | 每次调用重新分配 | 栈帧持续存在 |

## 六、实战演练：协程的雏形

`send()` 方法不仅能唤醒生成器，还可以把数据"发送"进生成器内部，赋值给 `yield` 左边的变量：

```python
def echo():
    print("回声生成器已启动")
    while True:
        received = yield
        print(f"  收到：{received}，原样返回")
        yield received

gen = echo()
next(gen)           # 启动，执行到第一个 yield

gen.send("Hello")   # 发送 "Hello"，yield 左边收到
# 输出：收到：Hello，原样返回

result = next(gen)  # 取出 yield 产出的值
print(f"  回声：{result}")  # 回声：Hello

gen.send("World")
# 输出：收到：World，原样返回

result = next(gen)
print(f"  回声：{result}")  # 回声：World
```

这就是协程的雏形——生成器不仅能产出数据，还能接收数据。`yield` 既是出口也是入口，形成了一个双向通信通道。

## 七、总结

三个核心概念：

1. **Yield 是暂停，不是返回**——函数冻结状态，等待下次唤醒，局部变量不会丢失
2. **Return 在生成器中是终结信号**——它触发 `StopIteration`，返回值藏在异常里，主要服务于 `yield from`
3. **Yield From 是透明管道**——在调用者和子生成器之间建立双向通道，自动传递数据和异常，优雅获取返回值

生成器的本质是**状态机**。每次 `yield` 是一个状态节点，每次 `next()` 或 `send()` 是一次状态转移。理解了这一点，yield 不再神秘，协程也不再遥远。
