---
title: Python pickle 与对象序列化深度解析：把对象连结构带指令一起冻住再复活
tags:
  - Python
  - 序列化
  - pickle
  - 对象持久化
categories:
  - Languages
  - Python
series:
  - Python
abbrlink: 7a670d8e
date: 2025-05-15 00:00:00
---

## 一、引言：为什么需要序列化

你写好的对象活在内存里，进程一关就没了。可真实工程里，我们常常要把内存里的对象**存盘、跨进程传、丢进缓存、或者发到另一台机器**——这就离不开"序列化"：把活的 Python 对象变成一串能落盘/能传输的字节，再在另一端"复活"成等价对象。

Python 标准库给的方案是 **`pickle`**：一行 `dumps` 把对象冻成字节串，一行 `loads` 再把它 thaw 回来，几乎零样板。

```python
import pickle

config = {
    "model": "resnet50",
    "lr": 0.01,
    "layers": [3, 4, 6, 3],
    "pretrained": True,
}
blob = pickle.dumps(config)        # 序列化: 对象 -> 字节串
restored = pickle.loads(blob)      # 反序列化: 字节串 -> 新对象

print("类型:", type(blob).__name__)   # bytes
print("内容相等:", restored == config) # True
print("同对象?:", restored is config)  # False (是新对象)
```

```text
类型: bytes
内容相等: True
同对象?: False
```

**C++ 对照**：C++ 没有内建序列化。一个 `struct` 想落盘，要么自己手写 `serialize()/deserialize()`，要么上 **protobuf / flatbuffers / boost::serialization** 这类框架（后面会比对）。Python 的 `pickle` 胜在"基本不写样板就能把任意对象冻住"，代价是它**只认 Python**，而且暗藏一处危险（第三、四节详说）。

---

## 二、核心概念：pickle 是一台"栈式虚拟机"

很多人以为 `pickle.dumps` 是把对象"拍扁成字节"，其实没那么简单。它生成的是一段**字节码（opcode 流）**，由反序列化时的**栈式解释器**逐条执行，从而"重建"出原对象。

```python
import pickle, pickletools

class C:
    def __init__(self, x):
        self.x = x

blob = pickle.dumps(C(7), protocol=2)
pickletools.dis(blob)   # 把字节码反汇编出来看看
```

```text
    0: \x80 PROTO      2
    2: c    GLOBAL     '__main__ C'
   15: q    BINPUT     0
   17: K    BININT1    7
   19: \x85 TUPLE1
   20: q    BINPUT     1
   22: R    REDUCE
   23: q    BINPUT     2
   25: .    STOP
```

可以看到：pickle 记录的是"**去哪找类 `C` → 压入参数 `7` → 用 REDUCE 调 `C(7)`**"这样一串指令。反序列化时，解释器照着执行，对象就重建回来了。

pickle 序列化 / 反序列化全过程的示意：

```text
   对象 a (内存里)
        │  pickle.dumps
        ▼
   +---------------------------+
   |  pickle 字节码 (opcode 流) |
   |   e.g. c __main__\nC\n...  |
   +---------------------------+
        │  pickle.loads (栈式解释器执行)
        ▼
   +-----------------------------------+
   |  操作数栈 (operand stack)          |
   |   push 类 → push 参数 → 构造       |
   |   REDUCE: 弹出 (callable, args)    |
   |           调用 -> push 结果         |
   +-----------------------------------+
        ▼
   重建对象 a' (新内存)
```

**C++ 对照（关键差异）**：C++ 的 `struct` 没有"运行时反射 + 指令"这种东西。你想要可序列化，得显式声明 schema：

- **protobuf**：写 `.proto` 定义字段，工具生成代码，`SerializeToString()/ParseFromString()` 是 schema 驱动、跨语言、二进制紧凑；
- **flatbuffers**：零拷贝，直接读一块内存，不需要先解析成对象，性能极致；
- **boost::serialization**：最接近 pickle 的"按类型自动分流"思路，但仍是 C++ 模板在编译期做的，不跨语言。

一句话：pickle 是"**按对象结构 + 运行时指令**"的 Python 专属方案；C++ 这边要么手写、要么靠协议，都得先把格式定清楚。

---

## 三、深入：可序列化边界、协议版本与致命安全坑

### 3.1 对象靠 `__reduce__` 告诉 pickle "怎么重建我"

绝大多数内置类型（int、dict、list、set、甚至嵌套结构）pickle 都认识。自定义类的实例之所以也能冻住，是因为 pickle 会去调它的 **`__reduce__` / `__reduce_ex__`**：返回一个 `(callable, args)` 元组，意思是"用 `callable(*args)` 就能把我造出来"。第二节那段字节码里的 `REDUCE` 就是在执行这个约定。

你可以自己接管这个过程：

```python
import pickle

class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __reduce__(self):
        # 告诉 pickle: 用 Point(x, y) 重建我
        return (Point, (self.x, self.y))

p = Point(3, 4)
p2 = pickle.loads(pickle.dumps(p))
print(p2.x, p2.y)         # 3 4
print(type(p2) is Point)  # True
```

### 3.2 协议版本（protocol 0~5）

`pickle.dumps(obj, protocol=N)` 可以指定协议号，越高越新：

- `protocol 0`：纯文本、人能读，体积大；
- `protocol 2+`：二进制、更紧凑、支持新版类型；
- `protocol 5`：支持**带外数据（out-of-band data）**，适合超大数组零拷贝传输。

```python
import pickle
print("当前最高协议号:", pickle.HIGHEST_PROTOCOL)   # 随 Python 版本变化, 如 5
print("默认协议号:", pickle.DEFAULT_PROTOCOL)
data = pickle.dumps({"a": 1}, protocol=5)           # 显式指定
```

### 3.3 安全红线：pickle.loads 会**执行任意代码**

这是 pickle 最阴险的一点：`loads` 不是"解析数据"，而是**执行字节码**。如果字节流是别人精心构造的，它就能在你进程里跑任意命令。

```python
import pickle
# 恶意构造的 pickle 字节流: 反序列化时执行 os.system(...)
evil = b"cos\nsystem\n(S'echo pwned'\ntR."
# pickle.loads(evil)   # 真实会执行 shell 命令, 输出 pwned —— 切勿对不可信输入这样做!
```

```text
# （示意）真实执行会调用系统命令, 切勿对不可信输入做此操作
```

**C++ 对照**：protobuf / flatbuffers 的解析只是"按 schema 填字段"，**不执行任何代码**，面对不可信输入安全得多。这就是为什么——**pickle 只该用在"你能完全信任的数据源"（自己进程、同版本同代码），绝不对外部 / 用户上传的数据 `loads`**。

---

## 四、实战：自定义序列化、真实踩坑与跨语言取舍

### 4.1 用 `__getstate__` / `__setstate__` 精细控制

想让某个字段不参与序列化，或重建时做点额外处理，可以定义这两个钩子：

```python
import pickle

class Conn:
    def __init__(self, host, sock=None):
        self.host = host
        self.sock = sock          # 运行时 socket, 不该被序列化
    def __getstate__(self):
        return {"host": self.host}          # 只存 host
    def __setstate__(self, state):
        self.host = state["host"]
        self.sock = None                     # 重建时不带 socket

c = Conn("db.local", sock=object())
c2 = pickle.loads(pickle.dumps(c))
print(c2.host, c2.sock)      # db.local None
```

### 4.2 一个匿名化的真实踩坑：把对象 pickle 进缓存，版本一变就崩

某次排查一个常驻服务：它把"服务配置对象"用 `pickle` 塞进 Redis 做跨进程缓存。最初配置类有 3 个字段：

```python
import pickle

class SvcConfig:
    def __init__(self, host, port, timeout):
        self.host, self.port, self.timeout = host, port, timeout

blob = pickle.dumps(SvcConfig("db", 5432, 30))
# ... 写进 Redis 缓存 ...
```

后来部署新版本，配置类**加了一个必填字段** `pool_size`。老缓存里那条 pickle 还是旧结构，新代码一 `loads`：

```text
TypeError: __init__() missing 1 required positional argument: 'pool_size'
```

反过来也一样危险：删字段后，旧 pickle 反序列化会得到一个"缺字段的僵尸对象"，运行到一半才在别的模块炸出来。**根因**：pickle 把"类定义在哪、长什么样"也默默写进了数据（还记得第二节字节码里那个 `c __main__ C` 吗？它存的是类的**路径引用**，不是类本身）。所以 pickle 数据跟**代码版本强耦合**，跨版本极其脆弱。

修法有两条路：要么给配置加 `__getstate__/__setstate__` 做字段兼容，要么干脆**改用 JSON / protobuf** 这种"显式 schema、向后兼容"的格式。

### 4.3 跨语言：pickle 是 Python 私有的

pickle 字节流里存的是 `__main__.C` 这种 Python 类路径，换一门语言根本没法解释。需要跨服务、跨语言传数据，请上 **JSON**（通用、人读）或 **protobuf / flatbuffers**（紧凑、强 schema、跨语言）。pickle 的舒适区是：进程内缓存、同版本 Python 之间的数据搬运。

---

## 五、对比总结：Python pickle vs C++ 序列化方案

| 维度 | Python pickle | C++（protobuf / flatbuffers / 手写） |
|------|---------------|--------------------------------------|
| 易用性 | 几乎零样板，`dumps/loads` 即用 | 需写 schema 或手写 `serialize/deserialize` |
| 跨语言 | 仅 Python（按类路径引用） | protobuf / flatbuffers 跨语言；手写仅同语言 |
| 安全性 | **危险**：`loads` 执行任意代码 | 解析不执行代码，更安全 |
| 版本演进 | 与代码版本强耦合，易碎 | schema 演进有显式规则（字段号、optional） |
| 性能 | 快但字节通常偏大；协议 5 + 压缩更优 | flatbuffers 零拷贝最快；protobuf 紧凑 |
| 适用场景 | 进程内缓存、同版本 Python 间传数据 | 跨服务、跨语言、不可信输入 |

一句话收束：**pickle 是"把 Python 对象连结构带指令一起冻住再复活"的便利工具，但它是 Python 私有的、且会执行代码的——缓存别跨越代码版本、绝不对不可信输入 `loads`。需要跨语言或面对外部数据，请上 JSON / protobuf。**
