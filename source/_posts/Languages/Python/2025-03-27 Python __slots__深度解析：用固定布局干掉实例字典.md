---
title: Python __slots__深度解析：用固定布局干掉实例字典
tags:
  - Python
  - __slots__
  - 内存优化
  - 面向对象
categories:
  - Languages
  - Python
series:
  - Python
abbrlink: f5b501ef
date: 2025-03-27 00:00:00
---

## 一、一个被忽略的内存黑洞:每个实例都有一本"字典"

写 Python 的人几乎都见过这种类:

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
```

看着简单,但它藏着一个代价。Python 为了实现"运行时随便加属性"的灵活性,**默认给每个实例都挂了一本字典 `__dict__`**,用来存 `x`、`y` 这些实例变量。这本字典本身是个哈希表,哪怕你只放两个字段,它也要预分配几十个字节的槽位。

做个实验就知道了:

```python
import sys

class Plain:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Plain(1, 2)
print("实例大小:", sys.getsizeof(p))          # 实例对象自身
print("__dict__ 大小:", sys.getsizeof(p.__dict__))  # 那本字典
print("总占用 ≈", sys.getsizeof(p) + sys.getsizeof(p.__dict__))
```

输出(64 位 Python):

```
实例大小: 48
__dict__ 大小: 232
总占用 ≈ 280
```

一个只装两个小整数的对象,实际吃掉约 **280 字节**。更要命的是,如果你要造一百万个点,这 280 字节就会膨胀成约 **267 MB**——其中绝大部分是那本为"灵活性"买单的字典,而不是你真正的数据。

那问题来了:**如果我明知道一个类只有固定的几个字段,能不能把这本字典去掉?**

答案是 `__slots__`。

## 二、__slots__ 是什么:给类一份"固定字段清单"

`__slots__` 是一个类变量,值是字段名组成的序列。它告诉 Python:"这个类的实例,**只会有清单里这些属性,别给我建 `__dict__` 了**。"

```python
class SlotPoint:
    __slots__ = ("x", "y")   # 固定字段清单,只有 x 和 y

    def __init__(self, x, y):
        self.x = x
        self.y = y
```

此时实例不再有 `__dict__`,属性直接以 **描述符(descriptor) + 固定偏移** 的方式存储。对比一下:

```python
import sys

sp = SlotPoint(1, 2)
print("实例大小:", sys.getsizeof(sp))     # 不再包含 __dict__
print("有 __dict__ 吗?", hasattr(sp, "__dict__"))   # False
```

输出:

```
实例大小: 56
有 __dict__ 吗? False
```

从约 280 字节降到约 **56 字节**,省了 **80% 以上** 的内存。一百万个实例从 267 MB 降到约 **53 MB**。

底层发生了什么?可以用这张图理解普通实例与 slots 实例的布局差异:

```
普通实例 Point                slots 实例 SlotPoint
┌──────────────┐             ┌──────────────┐
│ 类型指针      │             │ 类型指针      │
│ 引用计数      │             │ 引用计数      │
│ __dict__ ────┼──► {x, y}   │ x (直接存储)  │  ← 固定偏移,无哈希表
│              │             │ y (直接存储)  │
└──────────────┘             └──────────────┘
  每个字段一次哈希查找           每个字段一次内存偏移寻址
```

关键区别:**普通实例的属性访问要先算 key 的哈希、再查哈希表;slots 实例的属性访问是直接按编译期确定的内存偏移取值**,既省内存又快。

## 三、深入:它到底改了什么,又带来了哪些约束

`__slots__` 的本质是**在类创建期(class 创建阶段,还记得我们讲元类时说的"类的类"吗)把属性布局写死**。具体有三处硬约束:

**(1) 不能再动态加属性。** 清单外的一律拒绝:

```python
sp = SlotPoint(1, 2)
sp.z = 3
# AttributeError: 'SlotPoint' object has no attribute 'z'
```

这正是它"砍掉灵活性换性能"的交易——你放弃运行时加字段的自由,换来内存和速度。

**(2) 子类要小心继承。** 如果父类有 `__slots__`,子类**没有** `__slots__`,子类实例又会重新长出 `__dict__`(因为子类要容纳可能的新字段)。要让整条继承链都省内存,每层都要声明:

```python
class Base:
    __slots__ = ("a",)

class Child(Base):
    __slots__ = ("b",)   # 必须再声明,否则 Child 实例会带 __dict__
```

如果父类有 slots、子类也只想复用父类的字段且不新增,子类可以写 `__slots__ = ()`(空元组),这样它本身不长 `__dict__`,但仍能继承父类的 slots 字段。

**(3) 默认没有 `__weakref__`。** 普通实例支持弱引用,slots 类默认不支持。需要弱引用时,把 `__weakref__` 加进清单:

```python
class WeakPoint:
    __slots__ = ("x", "y", "__weakref__")
```

## 四、实战:和 C++ 结构体对比,以及 dataclass 的写法

**C++ 视角下的等价物。** `__slots__` 类在内存上最接近 C++ 的 `struct`——固定字段、连续布局、无字典:

```cpp
// C++:固定布局,编译期确定偏移,无运行时字典
struct Point {
    int x;
    int y;
};
// sizeof(Point) == 8 字节(两个 int),没有哈希表开销
```

Python 因为有对象头(类型指针 + 引用计数)、且字段是 PyObject* 指针,单个对象比 C struct 大,但 **slots 已经把"每实例一本字典"这个 Python 独有的最大开销砍掉了**,布局理念与 C struct 一致:固定、紧凑、偏移寻址。

**现代写法:dataclass + slots。** 从 Python 3.10 起,`dataclass` 可以直接生成 slots,少写样板:

```python
from dataclasses import dataclass

@dataclass(slots=True)
class SlotPoint:
    x: int
    y: int

p = SlotPoint(1, 2)
print(hasattr(p, "__dict__"))   # False,已启用 slots
```

3.10 之前可以用 `@dataclass` 配合手动声明 `__slots__`,或借助 `from dataclasses import Field` 的等价写法;3.11+ 还支持 `slots=True` 的进一步优化(把类自身也压缩)。

**什么时候该用?** 不是所有类都该上 slots。判断标准很简单:

- ✅ 会创建**海量实例**(百万级以上)的数据载体:坐标点、树节点、ORM 行对象、网络报文。
- ✅ 字段**固定且已知**,不需要运行时加属性。
- ❌ 需要动态挂属性、用 `__dict__` 做缓存/猴子补丁的小工具类。
- ❌ 实例数量很少、性能不敏感的业务类——收益可忽略,还牺牲灵活性。

## 五、对比总结:普通类、slots 类、C struct

| 维度 | 普通 Python 类 | `__slots__` 类 | C++ struct |
|------|----------------|----------------|------------|
| 每实例是否含 `__dict__` | 是(约 232B) | 否 | 否 |
| 单实例典型占用(2 字段) | ~280 B | ~56 B | 8 B(两 int) |
| 属性访问方式 | 哈希表查找 | 固定内存偏移 | 编译期偏移 |
| 能否运行时加属性 | 能 | 不能 | 不能 |
| 内存随字段线性增长 | 否(字典有预分配) | 是 | 是 |
| 弱引用默认支持 | 是 | 否(需声明) | 不适用 |
| 适用规模 | 少量对象 | 海量对象 | 任意 |

一句话本质:**`__slots__` 是把 Python 实例从"灵活的字典容器"降维成"紧凑的固定结构体"。** 它用"放弃运行时动态性"换来了"接近 C 的内存效率与访问速度"——当你要造一百万个轻量对象时,这一刀省下的内存,往往就是程序能不能跑起来的分水岭。

> 小结:普通类默认每实例一本 `__dict__`,是 Python 灵活性的代价;`__slots__` 用固定字段清单干掉这本字典,内存省 80%+、访问走偏移寻址;代价是不能动态加属性、继承与弱引用要小心声明;海量数据对象优先用,并通过 `dataclass(slots=True)` 省力落地。
