---
title: Python元类编程：type与__new__如何拦截类的诞生
tags:
  - Python
  - 元类
  - metaclass
  - 高级特性
categories: [Languages, Python]
series: [Python]
abbrlink: py-metaclass
date: 2025-06-12
---

## 一、先捅破一层窗户纸：类也是对象

写过几年 Python 的人大多听过一句话——"一切皆对象"。但真把这句话吃透，往往要等到第一次被元类（metaclass）绊住脚。

看一段最朴素的代码：

```python
class User:
    role = "member"

    def greet(self):
        return f"hi, I am a {self.role}"

u = User()
print(u.greet())          # hi, I am a member
print(type(u))            # <class '__main__.User'>
print(type(User))         # <class 'type'>
```

输出里最后一行最反直觉：`u` 是 `User` 的实例，所以 `type(u)` 是 `User`；可 `User` 本身呢？`type(User)` 居然是 `type`。

**本质一句话：普通对象是类的实例，而类本身，是"元类"的实例。** 默认元类就是内置的 `type`。所以 `class User:` 这行声明，不是"定义了一个类型"，而是"调用 `type` 构造出了一个对象，这个对象的名字叫 User"。

C++ 视角对照：在 C++ 里 `class User {};` 是编译期的类型声明，类型本身不是运行期对象，你拿不到"User 这个类"的运行时实体，更不能在运行时凭空造一个类。Python 把"类"也当成一等公民的对象，这是后续一切动态魔法的总开关。

下面这张图把"实例 → 类 → 元类"三层关系画清楚（注意箭头方向是"由谁创建"）：

<div align="center">
<svg width="560" height="200" viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="30" width="140" height="60" rx="8" fill="#e8f0fe" stroke="#3367d6" stroke-width="2"/>
  <text x="130" y="56" text-anchor="middle" font-size="15" fill="#1a1a1a">u (实例)</text>
  <text x="130" y="78" text-anchor="middle" font-size="12" fill="#555">User() 创建</text>
  <rect x="230" y="30" width="140" height="60" rx="8" fill="#e6f4ea" stroke="#137333" stroke-width="2"/>
  <text x="300" y="56" text-anchor="middle" font-size="15" fill="#1a1a1a">User (类)</text>
  <text x="300" y="78" text-anchor="middle" font-size="12" fill="#555">type() 创建</text>
  <rect x="400" y="30" width="130" height="60" rx="8" fill="#fef7e0" stroke="#b06000" stroke-width="2"/>
  <text x="465" y="56" text-anchor="middle" font-size="15" fill="#1a1a1a">type (元类)</text>
  <text x="465" y="78" text-anchor="middle" font-size="12" fill="#555">内置默认</text>
  <line x1="200" y1="60" x2="225" y2="60" stroke="#3367d6" stroke-width="2" marker-end="url(#ar)"/>
  <line x1="370" y1="60" x2="395" y2="60" stroke="#137333" stroke-width="2" marker-end="url(#ar)"/>
  <text x="212" y="22" text-anchor="middle" font-size="11" fill="#666">创建</text>
  <text x="382" y="22" text-anchor="middle" font-size="11" fill="#666">创建</text>
  <rect x="60" y="130" width="470" height="50" rx="6" fill="#f1f3f4" stroke="#999" stroke-width="1"/>
  <text x="295" y="150" text-anchor="middle" font-size="12.5" fill="#333">自定义元类继承 type，在"类被创建那一刻"插入钩子</text>
  <text x="295" y="170" text-anchor="middle" font-size="12.5" fill="#333">→ 可自动改类名/校验字段/登记子类，而不让用户手写样板</text>
  <defs>
    <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#444"/>
    </marker>
  </defs>
</svg>
</div>

## 二、type 的双重身份：既是类型，也是类工厂

`type` 有两个完全不像的面貌：

- 单参数 `type(obj)`：返回 obj 的类型（上节用过）。
- 三参数 `type(name, bases, namespace)`：动态地**创建一个类**。

两者是同一个对象，差别只在参数个数。三参数版本等价于一次 `class` 声明：

```python
# 下面三行，和上面那段 class User 完全等价
User = type(
    "User",                 # 类名 name
    (object,),              # 基类元组 bases
    {                       # 命名空间 dict：类属性与方法
        "role": "member",
        "greet": lambda self: f"hi, I am a {self.role}",
    },
)
print(User().greet())       # hi, I am a member
```

这正是元类的入口：**当你写 `class User:` 时，Python 解释器真正做的是调用 `type(name, bases, ns)`**。而"用哪个 type 来调"，是可以被你换掉的——换成你自己的元类。

C++ 对照：C++ 没有运行期"类工厂"。想动态生成类型，只能靠模板在编译期实例化（`template<class T> struct Wrapper {};`），或者干脆代码生成（写脚本吐 .hpp）。运行期？做不到。Python 这份"类即对象、可运行时构造"的能力，是元类存在的根本前提。

## 三、元类就是"类的类"：在 __new__ 里拦截诞生

想自定义类的创建行为，写一个继承 `type` 的类，并重写它的 `__new__`（或 `__init__`）：

- `__new__(mcs, name, bases, ns)`：在类**对象被构造出来之前**调用，返回最终的类对象。适合"改头换面"（改名字、加属性、替换方法）。
- `__init__(cls, name, bases, ns)`：类对象已构造好之后调用，只能做校验，改不了它本体。

习惯上元类第一个参数叫 `mcs`（metaclass），以区别普通类的 `cls`/`self`。

```python
class StrictMeta(type):
    def __new__(mcs, name, bases, ns):
        # ns 是即将成为类体的那个 dict，此刻还能动手脚
        print(f"[meta] 正在创建类 {name}，已有属性: {list(ns)}")
        if "version" not in ns:
            ns["version"] = 1          # 自动补一个默认字段
        cls = super().__new__(mcs, name, bases, ns)
        # 类对象已生成，可做一次性校验
        if not any(k.startswith("do_") for k in ns if callable(ns[k])):
            raise TypeError(f"{name} 必须至少定义一个 do_* 方法")
        return cls

class Service(metaclass=StrictMeta):
    def do_run(self):
        return "running"

# 打印: [meta] 正在创建类 Service，已有属性: ['__module__', '__qualname__', 'do_run']
print(Service.version)     # 1  （元类自动补的）
```

`class Service(metaclass=StrictMeta)` 这句，翻译过来就是："别用默认 `type` 来造我，请用 `StrictMeta` 来造。" Python 于是执行 `StrictMeta('Service', (object,), ns)`，把类的诞生拱手交给你的钩子。

> 小坑提醒：前文《Python描述符进阶》讲过描述符协议也是在"类创建时"就确定好查找裁决顺序的。元类的 `__new__` 比描述符更早、更底层——它能在描述符甚至方法被绑定之前，就改写整个类体。

## 四、实战一：用元类做自动子类注册表

元类最常见的落地，是**插件/子类自动登记**——不用让用户手动 `REGISTRY.append(SubClass)`，类一定义就自动入册：

```python
class PluginMeta(type):
    registry = {}                      # 所有插件类共享的注册表

    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        # 跳过基类本身（它没标 name 字段）
        if bases:
            key = ns.get("name", name)
            PluginMeta.registry[key] = cls
        return cls

class Plugin(metaclass=PluginMeta):
    name = None

class MySQLSink(Plugin):
    name = "mysql"

class RedisSink(Plugin):
    name = "redis"

print(PluginMeta.registry)
# {'mysql': <class '...MySQLSink'>, 'redis': <class '...RedisSink'>}
```

`MySQLSink` 一被定义，元类的 `__new__` 就把它塞进了 `registry`。新增一种 sink 只需写类，无需任何注册样板——这正是 Django、SQLAlchemy 等框架里 model/plugin 机制的雏形。

## 五、实战二：ORM 字段校验（轻量版）

再做一个贴近真实工程的例子：用元类在类创建时，把所有标为 `Field` 的描述符收集成一张 schema，并强制要求主键存在：

```python
class Field:
    def __init__(self, pk=False):
        self.pk = pk
    def __set_name__(self, owner, name):
        self.name = name

class ModelMeta(type):
    def __new__(mcs, name, bases, ns):
        cls = super().__new__(mcs, name, bases, ns)
        fields = {k: v for k, v in ns.items() if isinstance(v, Field)}
        cls._fields = fields
        if not any(f.pk for f in fields.values()):
            raise TypeError(f"{name} 必须声明一个主键 Field(pk=True)")
        return cls

class Model(metaclass=ModelMeta):
    pass

class User(Model):
    id = Field(pk=True)
    name = Field()

print(User._fields)        # {'id': <Field>, 'name': <Field>}
# class Bad(Model):         # 触发 TypeError: Bad 必须声明一个主键
#     name = Field()
```

注意这里复用了前文《Python描述符进阶》讲的 `__set_name__`：描述符在类体里能反查自己挂在了哪个属性名上。元类则站在更高的位置，把整张字段表一次性收口。

### C++ 视角对照表

| 需求 | Python（元类） | C++ 近似方案 | 差异 |
|------|----------------|--------------|------|
| 运行时动态创建类型 | `type(name, bases, ns)` 直接造类 | 不支持，类型在编译期固定 | Python 独有运行时灵活性 |
| 类创建时自动改/加成员 | 元类 `__new__` 改写 namespace | 无直接对应；可用宏在预处理期注入 | C++ 只能编译期，且易踩坑 |
| 子类自动注册 | 元类 `__new__` 入册 registry | CRTP + 静态成员在构造函数注册 | C++ 靠模板递归+静态对象，样板更多 |
| 编译期约束/校验 | 元类抛 `TypeError` | `static_assert` / `std::enable_if` | C++ 是编译期硬错误，Python 是运行时 |
| "类即对象"反射 | 类本身可当参数传递、可 introspect | `typeid` / `std::type_info` 仅查类型名 | C++ 反射极弱，无运行时改类能力 |
| 字段 schema 自动收集 | 遍历类体 namespace 即可 | 需手写注册宏或外部代码生成 | Python 内省天然支持 |

> 一句话总结差异：**C++ 的"类元编程"发生在编译期（模板/宏），是给编译器看的；Python 的元类发生在运行时，是给解释器和程序员自己看的。** 前者零运行时开销但僵硬，后者灵活但要为此付出一点运行时成本与可读性代价。

## 六、收尾：什么时候该用元类

元类很 powerful，但也最容易"杀鸡用牛刀"。经验法则：

- **能用classmethod/装饰器解决的，别上元类。** 比如"注册表"用类装饰器 `@register` 往往更直观。
- 元类适合**横切所有子类、且必须在类创建时就介入**的场景：全局注册、字段/schema 收集、统一的 API 约束、DSL 式框架（ORM、测试框架）。
- 真要写，优先重写 `__new__` 做"构造期变换"，把纯校验留给 `__init__`；多用 `super()`，别把 `type.__new__` 写死。

| 手段 | 介入时机 | 典型用途 | 推荐度 |
|------|----------|----------|--------|
| 类装饰器 | 类已完整定义后 | 注册、加方法、打补丁 | ⭐⭐⭐ 首选 |
| `__init_subclass__` | 子类定义时（Python 3.6+） | 轻量子类钩子 | ⭐⭐⭐ 首选 |
| 元类 `__new__` | 类体还没定型时 | 改写类体/强制 schema | ⭐⭐ 必要时 |
| 元类 `__init__` | 类对象已生成 | 仅校验 | ⭐ 很少单独用 |

记住那张三层图：实例由类造，类由元类造。元类不是炫技工具，而是 Python 把"类本身"也变成可编程对象后，留给你的最后一道、也是最底层的一道钩子。🐾
