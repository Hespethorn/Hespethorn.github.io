---

title: Python上下文管理器深度解析：with语句、contextlib与C++ RAII对比
tags:
  - Python
  - 上下文管理器
  - with语句
  - contextlib
  - RAII
categories: [Languages, Python]
series: [Python]
abbrlink: python-context-manager-deep-dive
date: 2025-02-27

---

## 一、从一段"看起来没问题"的代码说起

几乎每个 Python 初学者都写过这样的文件读取代码：

```python
f = open('data.txt', 'r', encoding='utf-8')
content = f.read()
f.close()
```

三行，逻辑清晰，运行也正常。但它有一个致命缺陷：**如果 `f.read()` 抛出异常，`f.close()` 永远不会执行**。

```python
f = open('data.txt', 'r', encoding='utf-8')
content = f.read()
print(content[999999])   # IndexError！
f.close()                # 这一行被跳过了
```

文件描述符泄漏了。单次运行看不出问题，但如果这段代码在循环里跑一万次，进程很快就会撞上操作系统的 `ulimit -n` 上限，抛出 `OSError: [Errno 24] Too many open files`。

老派的补救方式是 `try...finally`：

```python
f = open('data.txt', 'r', encoding='utf-8')
try:
    content = f.read()
finally:
    f.close()      # 无论是否异常，都会执行
```

这段代码是正确的，但很啰嗦。更麻烦的是，**它把"资源怎么用"和"资源怎么清理"混在了同一段业务代码里**。如果需要同时打开三个文件，嵌套三层 `try...finally`，可读性会迅速崩坏。

Python 的解决方案是 `with` 语句：

```python
with open('data.txt', 'r', encoding='utf-8') as f:
    content = f.read()
# 离开 with 块时，文件自动关闭（哪怕发生了异常）
```

关键在于：**`with` 不是 `open` 的专属语法糖，而是一套通用协议**。任何对象只要实现了这套协议，就能用在 `with` 后面。

## 二、协议本质：`__enter__` 与 `__exit__`

### 2.1 两个魔术方法

上下文管理器协议只要求两个方法：

| 方法 | 调用时机 | 作用 |
|------|----------|------|
| `__enter__(self)` | 进入 `with` 块之前 | 做准备工作，返回值绑定给 `as` 后的变量 |
| `__exit__(self, exc_type, exc_val, exc_tb)` | 离开 `with` 块时（正常或异常） | 做清理工作 |

自己实现一个计时器：

```python
import time

class Timer:
    def __init__(self, label):
        self.label = label

    def __enter__(self):
        self.start = time.perf_counter()
        print(f'[{self.label}] 开始计时')
        return self                  # 这个返回值会绑定给 as 后的变量

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f'[{self.label}] 耗时 {self.elapsed:.4f} 秒')

with Timer('求和') as t:
    total = sum(range(10_000_000))

print(f'结果={total}，可再次读取耗时：{t.elapsed:.4f}')
```

输出：

```
[求和] 开始计时
[求和] 耗时 0.2831 秒
结果=49999995000000，可再次读取耗时：0.2831
```

### 2.2 `as` 拿到的到底是什么

这是最容易踩坑的地方。**`as` 后面的变量绑定的是 `__enter__` 的返回值，而不是 `with` 后面的那个对象。**

```python
class Wrong:
    def __enter__(self):
        print('进入')
        # 忘记 return，隐式返回 None
    def __exit__(self, *args):
        print('退出')

with Wrong() as w:
    print(f'w = {w}')
```

输出：

```
进入
w = None          # 不是 Wrong 实例！
退出
```

`open()` 之所以能写成 `with open(...) as f`，是因为文件对象的 `__enter__` 里 `return self`。如果你自己写的类希望 `as` 拿到实例本身，**必须显式 `return self`**。

### 2.3 展开后的等价形式

`with cm as x: body` 大致等价于：

```python
cm = EXPR
_exit = type(cm).__exit__          # 注意：从类上取，不是从实例上取
x = type(cm).__enter__(cm)
try:
    body
except:
    if not _exit(cm, *sys.exc_info()):
        raise                       # __exit__ 返回假值，异常继续向外传播
else:
    _exit(cm, None, None, None)
```

有两个细节值得留意：

1. **方法从类上查找，不是从实例上查找**。给实例动态挂一个 `obj.__exit__ = ...` 是无效的，魔术方法的隐式调用永远走类型查找（这一点和 `__len__`、`__iter__` 一致）。
2. **`__enter__` 抛异常时，`__exit__` 不会被调用**。因为此时资源还没成功获取，谈不上清理。

## 三、异常处理：`__exit__` 的返回值决定一切

### 3.1 三个参数的含义

当 `with` 块内发生异常时，`__exit__` 会收到完整的异常信息：

```python
class Inspector:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            print('正常退出，无异常')
        else:
            print(f'异常类型：{exc_type.__name__}')
            print(f'异常内容：{exc_val}')
            print(f'发生位置：第 {exc_tb.tb_lineno} 行')
        return False       # 关键：返回假值，异常继续传播

try:
    with Inspector():
        raise ValueError('数据格式错误')
except ValueError as e:
    print(f'外层捕获到：{e}')
```

输出：

```
异常类型：ValueError
异常内容：数据格式错误
发生位置：第 17 行
外层捕获到：数据格式错误
```

正常退出时，三个参数都是 `None`。

### 3.2 返回 True 会"吞掉"异常

这是上下文管理器最强大也最危险的能力：**`__exit__` 返回真值，异常就会被静默吞掉**，程序继续从 `with` 块之后执行。

```python
class Suppress:
    def __init__(self, *exc_types):
        self.exc_types = exc_types

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # 只吞掉指定类型的异常
        return exc_type is not None and issubclass(exc_type, self.exc_types)

with Suppress(ZeroDivisionError):
    print('开始计算')
    x = 1 / 0
    print('这一行不会执行')       # with 块内剩余代码被跳过

print('程序继续运行')
```

输出：

```
开始计算
程序继续运行
```

注意一个关键事实：**异常被吞掉不等于 `with` 块继续执行**。异常发生的那一刻，`with` 块内后续代码就已经被跳过了，`__exit__` 只能决定异常要不要向外传播。

标准库已经提供了这个功能，不用自己写：

```python
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove('可能不存在的临时文件.tmp')
```

**慎用**：无差别吞异常是排查线上问题时最痛苦的事情之一。只在你明确知道"这个异常出现是正常的"时候才用。

### 3.3 一个隐蔽的陷阱

`__exit__` 里如果没有显式 `return`，隐式返回 `None`（假值），异常正常传播——这是符合直觉的默认行为。但如果你在 `__exit__` 里写了一个总是返回真值的表达式，就会意外吞掉所有异常：

```python
def __exit__(self, exc_type, exc_val, exc_tb):
    return self.cleanup()     # 如果 cleanup() 返回了非空对象，异常就被吞了！
```

**建议：`__exit__` 要么不写 return，要么显式 `return False`。**

## 四、contextlib：用生成器写上下文管理器

### 4.1 `@contextmanager` 装饰器

为了两个方法专门定义一个类，对简单场景来说太重了。`contextlib.contextmanager` 允许用生成器函数实现同样的效果：

```python
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.perf_counter()
    print(f'[{label}] 开始')
    try:
        yield start                        # yield 之前 = __enter__
    finally:
        elapsed = time.perf_counter() - start
        print(f'[{label}] 耗时 {elapsed:.4f} 秒')   # yield 之后 = __exit__

with timer('排序') as t0:
    data = sorted(range(1_000_000), reverse=True)
```

输出：

```
[排序] 开始
[排序] 耗时 0.1204 秒
```

对应关系非常清晰：

| 生成器写法 | 类写法 |
|------------|--------|
| `yield` 之前的代码 | `__enter__` 方法体 |
| `yield` 出去的值 | `__enter__` 的返回值 |
| `yield` 之后的代码 | `__exit__` 方法体 |
| `try...finally` 包住 yield | 保证异常时也清理 |

### 4.2 为什么 finally 不能省

如果不写 `try...finally`，`with` 块内一旦抛异常，异常会在 `yield` 处被重新抛进生成器，导致 `yield` 之后的清理代码被跳过：

```python
@contextmanager
def bad_timer(label):
    start = time.perf_counter()
    yield                                   # 异常从这里抛出
    print(f'[{label}] 耗时统计')            # 永远不会执行

try:
    with bad_timer('危险'):
        raise RuntimeError('炸了')
except RuntimeError:
    print('没有看到耗时统计')
```

输出：

```
没有看到耗时统计
```

**规则：`@contextmanager` 函数里的 `yield` 必须包在 `try...finally` 中。** 如果需要吞掉异常，用 `try...except` 并且不 re-raise。

### 4.3 一个实用例子：临时切换工作目录

```python
import os
from contextlib import contextmanager

@contextmanager
def chdir(path):
    origin = os.getcwd()
    os.chdir(path)
    try:
        yield path
    finally:
        os.chdir(origin)       # 无论如何都切回来

print(os.getcwd())             # /home/user/project
with chdir('/tmp'):
    print(os.getcwd())         # /tmp
print(os.getcwd())             # /home/user/project
```

这类"临时修改全局状态，用完还原"的场景，是上下文管理器最有价值的用武之地——比 `try...finally` 表达力强得多，因为它把"还原"的责任封装进了工具本身，调用方不可能忘记。

### 4.4 contextlib 常用工具速查

| 工具 | 用途 |
|------|------|
| `@contextmanager` | 用生成器定义上下文管理器 |
| `suppress(*exc)` | 静默忽略指定异常 |
| `closing(obj)` | 为只有 `close()` 没有 `__exit__` 的对象补上协议 |
| `nullcontext(x)` | 什么都不做的占位管理器，用于条件式 with |
| `ExitStack()` | 动态管理数量不定的上下文管理器 |
| `redirect_stdout(f)` | 临时重定向标准输出 |

`nullcontext` 解决了一个很常见的尴尬——"有时需要加锁，有时不需要"：

```python
from contextlib import nullcontext
import threading

def process(data, lock=None):
    ctx = lock if lock is not None else nullcontext()
    with ctx:                      # 不用写两份分支代码
        return sum(data)

process([1, 2, 3])                          # 无锁
process([1, 2, 3], threading.Lock())        # 有锁
```

## 五、进阶：多重管理与 ExitStack

### 5.1 多个上下文管理器

同一行可以写多个，从左到右依次进入、从右到左依次退出：

```python
with open('in.txt') as fin, open('out.txt', 'w') as fout:
    fout.write(fin.read().upper())
```

等价于嵌套写法，但少了一层缩进。行太长时用括号换行（Python 3.10+ 官方支持，早期版本可用反斜杠）：

```python
with (
    open('in.txt') as fin,
    open('out.txt', 'w') as fout,
):
    fout.write(fin.read().upper())
```

### 5.2 ExitStack：数量不定时的救星

如果要打开的文件数量在运行时才确定，硬编码的 `with a, b, c` 就无能为力了：

```python
from contextlib import ExitStack

filenames = ['a.txt', 'b.txt', 'c.txt', 'd.txt']

with ExitStack() as stack:
    files = [stack.enter_context(open(name)) for name in filenames]
    # 此时所有文件都已打开
    total_lines = sum(len(f.readlines()) for f in files)
    print(f'总行数：{total_lines}')
# 退出时，所有文件按注册的逆序自动关闭
```

`ExitStack` 还能注册普通的回调函数：

```python
with ExitStack() as stack:
    conn = connect_db()
    stack.callback(conn.close)          # 注册清理动作
    stack.callback(print, '清理完成')    # 支持带参数
    do_something(conn)
```

这在编写"部分初始化失败要回滚已完成部分"的代码时非常有用——传统写法需要层层嵌套的 `try...except`，而 `ExitStack` 把它压平成了线性代码。

### 5.3 异步上下文管理器

`asyncio` 场景下有一套平行的协议：`__aenter__` / `__aexit__`，配合 `async with` 使用。

```python
import asyncio

class AsyncResource:
    async def __aenter__(self):
        print('异步获取资源')
        await asyncio.sleep(0.1)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print('异步释放资源')
        await asyncio.sleep(0.1)
        return False

async def main():
    async with AsyncResource() as r:
        print('使用资源')

asyncio.run(main())
```

输出：

```
异步获取资源
使用资源
异步释放资源
```

`contextlib` 也提供了对应的 `@asynccontextmanager` 和 `AsyncExitStack`。

## 六、与 C++ RAII 的对比

C++ 程序员会立刻联想到 RAII（Resource Acquisition Is Initialization）——构造函数获取资源，析构函数释放资源：

```cpp
{
    std::ifstream fin("data.txt");   // 构造：打开文件
    std::string line;
    std::getline(fin, line);
    // 离开作用域，fin 的析构函数自动关闭文件（即使抛异常，栈展开也会调用）
}
```

两者解决的是同一个问题，但机制完全不同：

| 维度 | C++ RAII | Python `with` |
|------|----------|---------------|
| 触发时机 | 离开作用域，编译期确定 | 离开 `with` 块，运行时协议调用 |
| 绑定对象 | 对象生命周期，隐式 | `with` 语句，显式 |
| 底层机制 | 析构函数 + 栈展开 | `__exit__` + 解释器字节码 |
| 能否感知异常 | 不能（析构函数拿不到异常信息） | 能（`__exit__` 收到三元组） |
| 能否吞掉异常 | 不能 | 能（`return True`） |
| 忘记使用的后果 | 不会——语法上无法绕过 | 会——可以直接调 `open()` 不用 `with` |

**核心差异在于"显式 vs 隐式"。** C++ 的资源管理绑定在对象生命周期上，你无法"忘记"析构；Python 的资源管理绑定在语法块上，`with` 是可选的，忘记写就会泄漏。这也是为什么 Python 需要靠 linter（如 `flake8` 的 SIM115 规则）来提醒"这里应该用 with"。

反过来，Python 的方案更灵活：`__exit__` 能拿到异常信息，可以做"失败时回滚、成功时提交"这种数据库事务语义，而 C++ 的析构函数做不到（析构函数中无法可靠区分正常退出和异常退出，`std::uncaught_exceptions()` 也只是权宜之计）。

### 6.1 为什么不能靠 `__del__`

有人会想：Python 不是也有析构方法 `__del__` 吗？为什么不用它？

```python
class Bad:
    def __del__(self):
        print('清理资源')       # 不可靠！
```

三个致命问题：

1. **时机不确定**。CPython 靠引用计数，通常能及时触发；但一旦对象进了循环引用，就要等 GC，时机完全不可控。PyPy、Jython 根本没有引用计数。
2. **解释器退出时可能不调用**。程序结束时的 `__del__` 调用没有任何保证。
3. **异常被吞**。`__del__` 中抛出的异常会被忽略，只在 stderr 打印一条警告。

**结论：Python 里做确定性资源清理，只有 `with` 一条路。`__del__` 只能当兜底的最后防线。**

## 七、总结

### 7.1 何时该写上下文管理器

一个简单的判据：**只要存在"成对操作"，就应该考虑上下文管理器。**

| 获取 | 释放 |
|------|------|
| 打开文件 | 关闭文件 |
| 获取锁 | 释放锁 |
| 开启事务 | 提交 / 回滚 |
| 建立连接 | 断开连接 |
| 修改全局状态 | 还原状态 |
| 切换工作目录 | 切回原目录 |
| 开始计时 | 停止计时并上报 |

### 7.2 三种实现方式怎么选

| 方式 | 适用场景 |
|------|----------|
| 类 + `__enter__` / `__exit__` | 需要维护状态、需要复用、需要精细控制异常 |
| `@contextmanager` 生成器 | 逻辑简单、一次性使用、代码更短 |
| `ExitStack` | 管理数量不定的资源、需要动态注册清理回调 |

### 7.3 六条实践清单

1. **`__enter__` 想让 `as` 拿到自己，必须 `return self`**——这是最高频的踩坑点。
2. **`__exit__` 默认返回 `None`（不吞异常）**，需要吞异常时才显式 `return True`，并且要精确判断异常类型。
3. **`@contextmanager` 里的 `yield` 必须包在 `try...finally` 中**，否则异常路径下清理代码会被跳过。
4. **不要用 `__del__` 做资源清理**，时机不可控且跨解释器行为不一致。
5. **条件式的 with 用 `nullcontext()`**，避免写两份重复的分支代码。
6. **`with` 块内异常发生后，块内剩余代码一定被跳过**——`__exit__` 只能决定异常是否外传，不能让 `with` 块"继续跑"。

上下文管理器的价值，不在于少写几行 `try...finally`，而在于**把"用完必须清理"这条约束从程序员的记忆里，搬进了工具本身的类型定义中**。这是一种把纪律固化为语法的设计思路——和 C++ 的 RAII 殊途同归。
