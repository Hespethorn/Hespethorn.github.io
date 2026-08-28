---
title: Python描述符进阶：__get__/__set__协议与属性拦截底层深度解析
tags:
  - Python
  - 描述符
  - 元编程
  - C++对比
categories:
  - Languages
  - Python
series: [Python]
abbrlink: py-descriptor-protocol
date: 2025-06-05
---

## 一、引言：当你写 `obj.x = 1` 时，Python 到底做了什么

很多 Python 用者以为 `obj.x = 1` 就是"往对象里塞一个叫 x 的字段"。其实在 C 层面，它走的是 `type(obj).__setattr__(obj, 'x', 1)`，而 `__setattr__` 在落盘之前会**先去类型上找 x 是不是一个描述符**——如果是，就把控制权交给描述符的协议方法。

**一句话本质**：描述符（descriptor）是 Python 用**协议方法**（`__get__`/`__set__`/`__delete__`）实现的"属性拦截器"，它让"读/写一个属性"变成一次可定制的函数调用；而 C++ 没有语言级的属性拦截，只能靠 getter/setter 约定或元对象编译器（如 Qt 的 moc）来近似。

**坑**：描述符只认**类属性**（定义在类型上），定义在实例字典里的同名函数不会触发协议；而且"数据描述符"和"非数据描述符"在查找优先级上完全不同，混用会出莫名其妙的 bug。

下面用可运行代码把这套机制彻底拆开。

## 二、描述符协议：三类特殊方法

一个对象只要实现了下面这些方法中的一部分，就会被 Python 当成描述符：

- `__get__(self, instance, owner)`：访问属性时调用。`instance` 是持有者实例，`owner` 是所属类（通过类访问时为 `None`）。
- `__set__(self, instance, value)`：赋值时调用。
- `__delete__(self, instance)`：删除时调用。

按"实现了哪些"分为两类：

- **数据描述符（data descriptor）**：同时实现 `__get__` 和 `__set__`（或 `__delete__`）。它**优先级最高**，会盖过实例字典。
- **非数据描述符（non-data descriptor）**：只实现 `__get__`。优先级低于实例字典——实例一旦自己写了同名属性，描述符就被"遮蔽"。

```python
class ReadOnly:
    """非数据描述符：只实现 __get__，不实现 __set__"""
    def __init__(self, value):
        self._value = value

    def __get__(self, instance, owner):
        # instance 为 None 表示通过类访问，例如 MyClass.attr
        if instance is None:
            return self
        return self._value


class Box:
    tag = ReadOnly("fixed")   # 定义在类上的描述符


b = Box()
print(b.tag)        # -> fixed（走 __get__）
b.tag = "changed"   # 非数据描述符不管 __set__，于是写进了实例字典
print(b.tag)        # -> changed（实例字典盖过了非数据描述符）
print(Box.tag)      # -> <__main__.ReadOnly object>（类访问时 instance=None）
```

输出：

```
fixed
changed
<__main__.ReadOnly object at 0x...>
```

注意最后一行：通过**类**访问时 `instance` 是 `None`，描述符返回了自身——这是很多"为什么类属性是描述符对象而不是值"困惑的根源。

## 三、数据描述符 vs 非数据描述符：优先级玄机

属性查找时，Python 按下面顺序裁决（简化自 CPython 的 `type.__getattribute__`）：

<div align="center">
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="360" viewBox="0 0 640 360">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L8,3 L0,6 Z" fill="#334155" />
    </marker>
  </defs>
  <rect x="20" y="20" width="600" height="320" rx="12" fill="#f8fafc" stroke="#cbd5e1" />
  <text x="320" y="48" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">obj.x 查找裁决顺序</text>
  <rect x="60" y="78" width="520" height="40" rx="8" fill="#fee2e2" stroke="#ef4444" />
  <text x="80" y="103" font-size="13" fill="#7f1d1d">1. 类型上有数据描述符(__get__+__set__/__delete__)？ → 调用它，优先级最高</text>
  <rect x="60" y="132" width="520" height="40" rx="8" fill="#dcfce7" stroke="#22c55e" />
  <text x="80" y="157" font-size="13" fill="#14532d">2. 实例字典(obj.__dict__)里有 x？ → 直接返回（非数据描述符在此被遮蔽）</text>
  <rect x="60" y="186" width="520" height="40" rx="8" fill="#dbeafe" stroke="#3b82f6" />
  <text x="80" y="211" font-size="13" fill="#1e3a8a">3. 类型上有非数据描述符(__get__ only)？ → 调用它</text>
  <rect x="60" y="240" width="520" height="40" rx="8" fill="#fef9c3" stroke="#eab308" />
  <text x="80" y="265" font-size="13" fill="#713f12">4. 类型上有 x（普通类属性）？ → 返回它</text>
  <rect x="60" y="294" width="520" height="34" rx="8" fill="#f1f5f9" stroke="#94a3b8" />
  <text x="80" y="316" font-size="13" fill="#475569">5. 都没有 → 触发 __getattr__，否则抛 AttributeError</text>
  <line x1="320" y1="118" x2="320" y2="132" stroke="#334155" marker-end="url(#arrow)" />
  <line x1="320" y1="172" x2="320" y2="186" stroke="#334155" marker-end="url(#arrow)" />
  <line x1="320" y1="226" x2="320" y2="240" stroke="#334155" marker-end="url(#arrow)" />
  <line x1="320" y1="280" x2="320" y2="294" stroke="#334155" marker-end="url(#arrow)" />
</svg>
</div>

关键直觉：**数据描述符压过实例字典，非数据描述符被实例字典压过**。这就是为什么 `property` 一定是数据描述符——它必须能拦截赋值。

```python
class Validated:
    def __init__(self, min_=0, max_=100):
        self.min_ = min_
        self.max_ = max_
        self._store = {}          # 用实例 id 存真实值，避免递归

    def __set_name__(self, owner, name):
        self.name = name          # Python 3.6+ 自动注入字段名

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return self._store.get(id(instance))

    def __set__(self, instance, value):
        if not (self.min_ <= value <= self.max_):
            raise ValueError(f"{self.name} 必须落在 [{self.min_}, {self.max_}]")
        self._store[id(instance)] = value   # 真值存在描述符自身，不会被 __setattr__ 递归


class Player:
    hp = Validated(0, 100)


p = Player()
p.hp = 80
print(p.hp)        # -> 80
p.hp = 200         # ValueError: hp 必须落在 [0, 100]
```

输出：

```
80
Traceback (most recent call last):
    ...
ValueError: hp 必须落在 [0, 100]
```

`__set_name__` 是常被忽略的宝藏：Python 在类创建时会自动把描述符所在的**属性名**喂给它，省去手写字段名。

## 四、property 的底层就是描述符

`property` 不是魔法，它只是用 C 实现的数据描述符。下面两者等价：

```python
class Celsius:
    def __init__(self, temp=0):
        self._temp = temp

    @property                 # 非数据？错——property 三个方法都实现，是数据描述符
    def temp(self):
        return self._temp

    @temp.setter
    def temp(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._temp = value


# 等价的手工描述符写法：
def _get(self):    return self._temp
def _set(self, v):
    if v < -273.15: raise ValueError("低于绝对零度")
    self._temp = v
class Celsius2:
    temp = property(_get, _set)
```

**为什么 `property` 能拦截赋值**：因为它内部实现了 `__set__`，属于数据描述符，优先级高于实例字典，所以 `c.temp = 999` 一定走你的校验逻辑，而不是悄悄写进 `c.__dict__['temp']`。

## 五、实战：用描述符打造轻量 ORM 字段校验

把上面的 `Validated` 升级成通用字段，可直接用于轻量 ORM / 配置对象：

```python
class Field:
    """通用字段描述符：类型 + 范围 + 必填校验"""
    def __init__(self, typ, min_=None, max_=None, required=True):
        self.typ = typ
        self.min_, self.max_ = min_, max_
        self.required = required
        self._data = {}

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        if self.name not in self._data:
            if self.required:
                raise AttributeError(f"{self.name} 尚未赋值")
            return None
        return self._data[self.name]

    def __set__(self, instance, value):
        if not isinstance(value, self.typ):
            raise TypeError(f"{self.name} 必须是 {self.typ.__name__}")
        if self.min_ is not None and value < self.min_:
            raise ValueError(f"{self.name} 不能小于 {self.min_}")
        if self.max_ is not None and value > self.max_:
            raise ValueError(f"{self.name} 不能大于 {self.max_}")
        self._data[self.name] = value


class User:
    uid = Field(int, min_=1)
    name = Field(str)
    age = Field(int, min_=0, max_=150)


u = User()
u.uid = 7
u.name = "老周"
u.age = 29
print(u.uid, u.name, u.age)     # -> 7 老周 29
u.age = 200                     # ValueError: age 不能大于 150
```

输出：

```
7 老周 29
Traceback (most recent call last):
    ...
ValueError: age 不能大于 150
```

整个校验逻辑**零样板重复**——新增字段只需一行声明，这正是 Django ORM、SQLAlchemy 等框架字段系统的雏形。

## 六、C++ 视角对照与总结

C++ 没有描述符协议，属性访问拦截只能靠**约定或外部工具**：

| 能力 | Python（描述符） | C++ |
| --- | --- | --- |
| 语言级属性拦截 | ✅ 协议方法 `__get__`/`__set__` | ❌ 无原生属性语法 |
| 典型写法 | `self.x = Desc()` 定义在类上 | 手写 `getX()` / `setX(v)` 方法 |
| 运行时可定制 | ✅ 同一描述符跨类复用、可动态换 | ⚠️ 编译期固定，靠模板/CRTP 做静态拦截 |
| 声明式字段校验 | ✅ `Field(int, min_=0)` 一行 | ⚠️ 需宏或元对象编译器 |
| 最接近的对等物 | —— | Qt 的 `Q_PROPERTY`（moc 生成 READ/WRITE/NOTIFY） |

C++ 的两种近似方案：

1. **手写 getter/setter**：最普遍，但每个字段都是样板；且调用方写 `obj.getX()` 而非 `obj.x`，语义不透明。
2. **Qt 的 `Q_PROPERTY` + moc**：用宏声明 `Q_PROPERTY(int x READ getX WRITE setX NOTIFY xChanged)`，moc 在编译期生成访问器与信号——这是 C++ 里**最像描述符**的东西，但它依赖独立的元对象编译器，不是语言核心机制，且只服务于 Qt 生态。

C++20/23 有过"原生属性（properties）"提案，但至今未入标准。换句话说，**Python 用运行时协议把"属性即方法调用"这件事做成了语言一等公民，而 C++ 仍把它留在约定与工具链里**。这正是 Python 在 ORM、序列化、依赖注入等"声明式框架"领域开发体验更顺滑的根本原因。

### 小结

- 描述符 = 类属性上的协议对象，`__get__`/`__set__`/`__delete__` 决定读写语义。
- **数据描述符（有 `__set__`）压过实例字典；非数据描述符（仅 `__get__`）被实例字典遮蔽**——这是 90% 诡异 bug 的来源。
- `property` 本质是 C 实现的数据描述符；`__set_name__` 让字段自感知名字。
- 用它做字段校验，零样板、可跨类复用，是 ORM 类框架的基石。
- 对照 C++：无语言级属性拦截，靠 getter/setter 或 Qt moc 近似；Python 把"属性即调用"做成了一等公民。

> **收敛一句**：会写 `@property` 只是入门，懂"描述符协议 + 优先级裁决"才算真正握住 Python 属性系统的方向盘 🐾
