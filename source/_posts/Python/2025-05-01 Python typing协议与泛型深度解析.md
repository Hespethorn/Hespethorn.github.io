---
title: Python typing 协议与泛型深度解析：用「形状」而不是「血缘」约束类型
---

## 一、引言：为了一个 read()，我被迫 import 了一个基类

先看一个特别常见的窘境。

你写了个函数，全身上下只用到参数的一个方法：

```python
def load_header(src) -> bytes:
    return src.read(8)
```

现在要给 `src` 加类型注解。按经典 OOP 的教法，应该定义一个抽象基类，让所有实现方继承它：

```python
from abc import ABC, abstractmethod

class BaseReader(ABC):
    @abstractmethod
    def read(self, n: int) -> bytes: ...

def load_header(src: BaseReader) -> bytes:
    return src.read(8)
```

代价立刻来了：

- 第三方库里那个完美满足条件的 `Sock` 类，你改不了它的继承链；
- `io.BytesIO`、`socket.SocketIO` 这些标准库类型，也不会来继承你的基类；
- 测试里想塞一个五行的假对象，还得先 `from myapp.io import BaseReader`。

**你只想要一个 `read()`，却要求全世界都来认你这个祖宗。**

这就是名义子类型（nominal subtyping）的固有代价——它判定"你是不是我要的类型"，看的是**你继承了谁**。而 Python 从第一天起靠的是鸭子类型：能 `read()` 就行，谁管你姓什么。

`typing.Protocol`（PEP 544，Python 3.8 引入）解决的正是这个撕裂：**把鸭子类型静态化**。判定依据从"血缘"换成"形状"。

这篇把 Protocol 与泛型这一整套东西拆开讲清楚：判定规则的差别、`runtime_checkable` 的三个坑、PEP 695 之后泛型该怎么写、方差为什么会咬人，以及大型项目里怎么用它而不被它拖死。

本文所有代码与报错输出均在 **CPython 3.13.14 + mypy 2.3.1** 下实测。

## 二、名义 vs 结构：同一份代码，两种判定

把两种写法放在一起，让 mypy 来判：

```python
from abc import ABC, abstractmethod
from typing import Protocol

class BaseReader(ABC):                      # 名义：靠继承
    @abstractmethod
    def read(self, n: int) -> bytes: ...

class Reader(Protocol):                     # 结构：靠形状
    def read(self, n: int) -> bytes: ...

class Sock:                                 # 谁都没继承
    def read(self, n: int) -> bytes:
        return b"x" * n

def use_abc(r: BaseReader) -> bytes:
    return r.read(4)

def use_proto(r: Reader) -> bytes:
    return r.read(4)

use_abc(Sock())     # ?
use_proto(Sock())   # ?
```

mypy 的实际输出：

```text
d1.py:14: error: Argument 1 to "use_abc" has incompatible type "Sock"; expected "BaseReader"  [arg-type]
```

只报了一处：`use_abc(Sock())` 不过，`use_proto(Sock())` 静悄悄通过。

`Sock` 一个字都没改、一行 import 都没加，就满足了 `Reader`。这就是结构化子类型（structural subtyping）：**协议只描述形状，谁长成这个形状谁就算。**

再看形状不对会怎样。把方法签名改错一个参数：

```python
class Bad:
    def read(self) -> bytes:   # 少了 n
        return b""

use_proto(Bad())
```

```text
d1.py:27: error: Argument 1 to "use_proto" has incompatible type "Bad"; expected "Reader"  [arg-type]
d1.py:27: note: Following member(s) of "Bad" have conflicts:
d1.py:27: note:     Expected:
d1.py:27: note:         def read(self, n: int) -> bytes
d1.py:27: note:     Got:
d1.py:27: note:         def read(self) -> bytes
```

报错信息把"期望的签名"和"实际的签名"逐行摊开——**这是 Protocol 比 ABC 好用的地方之一：它报的是形状差异，而不是一句干巴巴的"没继承"。**

两种判定的分野列成表：

| 维度          | 名义子类型（ABC / 继承）            | 结构化子类型（Protocol）                 |
| ----------- | -------------------------- | -------------------------------- |
| 判定依据        | 继承链上有没有那个基类                | 方法/属性签名是否匹配                      |
| 实现方是否需要感知   | 必须 import 并继承              | 完全无需知道协议存在                       |
| 能否约束第三方类型   | 不能（改不了别人的继承链）              | 能                                |
| 默认实现 / 模板方法 | 天然支持                       | 支持，但要显式继承才拿得到                    |
| 运行时强制力      | `abstractmethod` 未实现即无法实例化 | 无（除非 `runtime_checkable` + 手动检查） |
| 依赖方向        | 实现方 → 抽象（实现方依赖你）           | 调用方 → 抽象（协议归调用方所有）               |

最后一行才是关键。**Protocol 让依赖方向反了过来**：协议定义在"用它的那一侧"，实现方毫不知情。这正是六边形架构、依赖倒置里那个"接口应该属于调用者"的原则，在 Python 里终于有了不需要继承就能落地的表达方式。

## 三、Protocol 的真正红利：窄接口和五行 fake

Protocol 的第二个红利在测试上，前提是**协议要写得窄**。

反面写法是把整个类的方法照抄一遍：

```python
class Storage(Protocol):                    # 太宽了
    def put(self, key: str, blob: bytes) -> None: ...
    def get(self, key: str) -> bytes: ...
    def delete(self, key: str) -> None: ...
    def list_keys(self, prefix: str) -> list[str]: ...
    def stat(self, key: str) -> dict[str, int]: ...
```

而某个函数其实只用到 `put`。协议写宽了，测试里就得实现五个方法才能塞进去。

正确做法是**按调用点切协议**，只写这个函数真正用到的那部分：

```python
from typing import Protocol

class SupportsPut(Protocol):
    def put(self, key: str, blob: bytes) -> None: ...

def archive(report: bytes, storage: SupportsPut) -> None:
    storage.put("report.bin", report)
```

于是测试替身可以短到这个程度——注意它**没有继承 `SupportsPut`**：

```python
class FakeStorage:
    def __init__(self) -> None:
        self.data: dict[str, bytes] = {}

    def put(self, key: str, blob: bytes) -> None:
        self.data[key] = blob

fake = FakeStorage()
archive(b"hello", fake)
print(fake.data)
```

```text
{'report.bin': b'hello'}
```

没有 mock 库、没有 patch、没有继承声明，类型检查也完全通过。**协议越窄，替换成本越低**——这条经验比任何 mock 框架都管用。

顺带一个细节：协议里的 `...` 不是"待实现"的占位符语义，它就是函数体。协议类可以被实例化（虽然没意义），但**不能被当成基类去 `isinstance`**，除非加装饰器——这就是下一节的坑。

## 四、runtime_checkable 的三个坑

Protocol 默认**不支持** `isinstance`：

```python
from typing import Protocol

class Reader(Protocol):
    def read(self, n: int) -> bytes: ...

class Sock:
    def read(self, n: int) -> bytes:
        return b"x" * n

try:
    print(isinstance(Sock(), Reader))
except TypeError as e:
    print("TypeError:", e)
```

```text
TypeError: Instance and class checks can only be used with @runtime_checkable protocols
```

加上 `@runtime_checkable` 就能查了。但接下来是**最容易骗自己的一个坑**：

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class RC(Protocol):
    def read(self, n: int) -> bytes: ...

class Bad:
    def read(self) -> bytes:      # 签名完全不符
        return b""

print("isinstance(Bad(), RC) =", isinstance(Bad(), RC))
try:
    Bad().read(10)
except TypeError as e:
    print("call blows up:", e)
```

```text
isinstance(Bad(), RC) = True
call blows up: Bad.read() takes 1 positional argument but 2 were given
```

**坑一：`runtime_checkable` 只查成员名字存在，不查签名。** `isinstance` 返回 `True` 给了你一种"我已经校验过了"的错觉，真调用的时候照样炸。想要签名级保证，只有静态检查器能给，运行时给不了。

**坑二：带非方法成员的协议不支持 `issubclass`。**

```python
@runtime_checkable
class HasName(Protocol):
    name: str

class P:
    def __init__(self) -> None:
        self.name = "p"

print("isinstance:", isinstance(P(), HasName))
try:
    print(issubclass(P, HasName))
except TypeError as e:
    print("issubclass TypeError:", e)
```

```text
isinstance: True
issubclass TypeError: Protocols with non-method members don't support issubclass(). Non-method members: 'name'.
```

原因很直接：`name` 是实例属性，类对象上根本不存在，`issubclass` 只能看类，看不到 `self.name`。`isinstance` 能看到实例，所以它可以。

**坑三：`isinstance` 对协议的检查是逐成员 `hasattr`，比普通类的 `isinstance` 慢得多。** 普通 `isinstance` 是查 MRO，协议 `isinstance` 要对每个协议成员做一次属性查找（3.12 之后有缓存优化，但仍然贵）。**别把它放进热循环**，尤其别放在每帧/每条消息都要走一遍的路径上。

一句话结论：**`runtime_checkable` 适合做"能力探测"（它有没有这个方法），不适合做"契约校验"（它的方法对不对）。**

## 五、泛型：从 TypeVar 到 PEP 695

Protocol 管"形状"，泛型管"类型之间的联动关系"。

最典型的场景：一个函数取列表首元素，返回类型必须**跟着入参变**。`list[Any] -> Any` 是放弃治疗，`list[int] -> int` 又写死了。老写法要先造一个类型变量：

```python
from typing import TypeVar, Sequence

T = TypeVar("T")

def first(xs: Sequence[T]) -> T:
    return xs[0]
```

Python 3.12 起（PEP 695）可以直接就地声明，不用再手动造 `TypeVar`：

```python
from typing import Sequence

def first[T](xs: Sequence[T]) -> T:
    return xs[0]

class Box[T]:
    def __init__(self, item: T) -> None:
        self.item = item
    def get(self) -> T:
        return self.item

type UserId = int          # 类型别名也有了专门语法

print(first([1, 2, 3]), first(["a", "b"]))
print(Box("hi").get(), Box(3).get())
print("type_params:", first.__type_params__, Box.__type_params__)
print("alias:", UserId, "->", UserId.__value__)
```

```text
1 a
hi 3
type_params: (T,) (T,)
alias: UserId -> <class 'int'>
```

新语法有三个实际好处：作用域是**词法级**的（`T` 不再是模块级全局变量，不会被别的函数误用）、类型参数**延迟求值**（可以引用后面才定义的类）、以及 `__type_params__` 让运行时能反查泛型签名。

### bound 与 constraints：两个经常被写混的东西

**bound（上界）**：T 可以是这个类型或它的任意子类型。

```python
from typing import Protocol, Sequence

class Comparable(Protocol):
    def __lt__(self, other, /) -> bool: ...

def biggest[T: Comparable](xs: Sequence[T]) -> T:
    best = xs[0]
    for x in xs[1:]:
        if best < x:
            best = x
    return best

print(biggest([3, 9, 4]), biggest(["pear", "apple"]))
```

```text
9 pear
```

注意这里 `Comparable` 是个 Protocol——**bound 配 Protocol 是最常见的组合**，含义是"任何能比大小的东西"，而不需要它们继承什么共同基类。传个不能比较的类进去：

```python
class Opaque: ...
biggest([Opaque(), Opaque()])
```

```text
d2.py:10: error: Value of type variable "T" of "biggest" cannot be "Opaque"  [type-var]
```

**constraints（约束集）**：T 只能**恰好是**列出的其中一个，不能是子类混搭。

```python
from typing import TypeVar

AnyStr2 = TypeVar("AnyStr2", str, bytes)

def cat(a: AnyStr2, b: AnyStr2) -> AnyStr2:
    return a + b

print(cat("a", "b"), cat(b"a", b"b"))
cat("a", b"b")     # 混用
cat(1, 2)          # 都不在集合里
```

```text
ab b'ab'
d2.py:16: error: Value of type variable "AnyStr2" of "cat" cannot be "Sequence[object]"  [type-var]
d2.py:17: error: Value of type variable "AnyStr2" of "cat" cannot be "int"  [type-var]
```

两者的区别一句话拎清：

| 写法                                     | 语义                   | 适用场景                  |
| -------------------------------------- | -------------------- | --------------------- |
| `[T: Comparable]` bound                | T 是 Comparable 或其子类型 | 「至少具备某种能力」——绝大多数情况用这个 |
| `TypeVar("T", str, bytes)` constraints | T 只能是 str 或 bytes 之一 | 少数几个互不相关的具体类型间做重载式复用  |

经验法则：**先想 bound，想不通再考虑 constraints。** constraints 的语义比直觉更严格——`cat("a", b"b")` 报错时 mypy 试图求解出一个公共类型 `Sequence[object]`，然后告诉你它不在约束集里，这个报错信息第一次看到时相当迷惑。

## 六、方差：为什么 list[Dog] 不是 list[Animal]

这是 typing 里最容易咬人的一块，而且它咬的是直觉。

```python
from typing import Sequence

class Animal: ...
class Dog(Animal): ...

def feed_all(xs: list[Animal]) -> None: ...
def count_all(xs: Sequence[Animal]) -> int:
    return len(xs)

dogs: list[Dog] = [Dog()]
feed_all(dogs)      # ?
count_all(dogs)     # ?
```

mypy 的实际输出：

```text
d1.py:36: error: Argument 1 to "feed_all" has incompatible type "list[Dog]"; expected "list[Animal]"  [arg-type]
d1.py:36: note: "list" is invariant -- see https://mypy.readthedocs.io/en/stable/common_issues.html#variance
d1.py:36: note: Consider using "Sequence" instead, which is covariant
```

`feed_all(dogs)` 报错，`count_all(dogs)` 通过。为什么？

因为 `list` **可写**。如果允许 `list[Dog]` 当 `list[Animal]` 用，那么 `feed_all` 内部完全可以合法地写一句 `xs.append(Cat())`——回到调用方，那个声明为 `list[Dog]` 的列表里就躺着一只猫。**可变容器必须不变（invariant），这不是设计者保守，是类型安全的硬约束。**

而 `Sequence` 只读，取不出问题，所以它可以协变（covariant）。

第三种是逆变（contravariant），发生在函数参数位置：

```python
from typing import Callable

def apply_to_dog(f: Callable[[Dog], None]) -> None: ...

def handle_animal(a: Animal) -> None: ...
def handle_dog(d: Dog) -> None: ...

apply_to_dog(handle_animal)   # 通过
apply_to_dog(handle_dog)      # 通过
```

两个都通过，其中 `handle_animal` 那个才是逆变的体现：**要一个"能处理狗的函数"，给一个"能处理任何动物的函数"当然更保险。** 参数位置上，越宽越安全，所以方向是反的。

三条规则背下来不如记住判定法：

| 位置                                                   | 方差 | 记法              |
| ---------------------------------------------------- | -- | --------------- |
| 只读的输出位置（返回值、只读属性、`Sequence`/`Iterable`/`Mapping` 的值） | 协变 | 只能取出来 → 子类型可以顶上 |
| 可读可写位置（`list`、`dict`、可写属性）                           | 不变 | 能塞东西进去 → 必须严格一致 |
| 函数参数位置（`Callable` 的入参）                               | 逆变 | 要求越宽越安全 → 方向反过来 |

落到 Protocol 上是同一套逻辑：**协议里的只读属性可以协变，可写属性必须不变。** 所以协议里的属性能标 `@property` 就标（只读），别一律写成可写字段——很多莫名其妙的方差报错都是这么来的。

实务上还有一条比记规则更有效的操作：**入参标抽象，返回标具体。**

```python
# 别这么写
def summarize(rows: list[dict[str, str]]) -> list[str]: ...

# 这么写
def summarize(rows: Sequence[Mapping[str, str]]) -> list[str]: ...
```

参数用 `Sequence`/`Iterable`/`Mapping`，返回用 `list`/`dict`。就这一条改动，能消掉项目里大半的方差报错，而且顺手把"我不会改你的入参"这个契约写进了签名里。

## 七、工程落地：六条被拖死过才总结出来的经验

typing 用不好，最典型的结局是：注解写满了、CI 红了三个月、然后全组把 mypy 关掉。下面几条是为了避免这个结局。

**1. 选 ABC 还是 Protocol，只看一个判据：你能不能改对方的类。**

改不了（第三方库、内置类型、遗留代码）→ Protocol，别无选择。改得了，再问一句"要不要复用默认实现或运行时强制"：要 → ABC；不要 → 仍然用窄 Protocol。两者也可以并存：ABC 做内部实现基类（共享代码），Protocol 做对外契约（约束调用点）。

**2. 只标边界，不标内部。** 模块公共 API、跨层调用、序列化出入口必须标注；私有小函数、局部变量交给推断。全量注解的收益曲线在内部实现那一段几乎是平的，而维护成本是线性的。

**3. 协议按调用点切，切到最窄。** 一个函数用到几个方法就写几个方法，宁可有 `SupportsPut`、`SupportsGet` 两个小协议，也别搞一个十方法的 `Storage`。

**4. mypy 不要一次全开 strict。** 按模块逐步收紧（`[mypy-myapp.core.*] strict = true`），CI 走 baseline：新增代码零错误，历史债不阻塞合并。一次全开的结局一定是被淹然后被关掉。

**5. 类型别名收敛到一个文件。** `type UserId = int`、`type Row = dict[str, str]` 之类的语义别名集中放 `types.py`，别让 `dict[str, list[tuple[int, str]]]` 满仓库飞——它既不可读，也不可搜索。

**6. 绝不为了类型注解去改运行时结构。** typing 只对检查器有效力。循环导入用 `if TYPE_CHECKING:` + 字符串注解解决，不要真去拆包重构；只有 dataclass、pydantic 这类明确在运行时读注解的库才是例外。

## 八、对比与小结

把这一整套东西和 C++ 放一起看，会发现两边解的是同一个问题：

| 能力       | Python                             | C++                           | 关键差别                                                 |
| -------- | ---------------------------------- | ----------------------------- | ---------------------------------------------------- |
| 靠形状约束类型  | `Protocol`                         | C++20 `concept` + `requires`  | concept 违反 → **编译失败**；Protocol 违反 → 仅检查器报错，**运行时照跑** |
| 未约束的鸭子类型 | 不标注解                               | 模板 + SFINAE                   | 两边都能跑通，但报错信息都难读                                      |
| 参数化类型    | `class Box[T]`（PEP 695）            | `template<class T> class Box` | Python 无实例化期代码生成，泛型只是注解                              |
| 类型上界     | `[T: Comparable]`                  | `template<Comparable T>`      | 语义几乎一致                                               |
| 运行时能力探测  | `runtime_checkable` + `isinstance` | 无（编译期已定）                      | Python 只查名字不查签名                                      |
| 强制实现     | `ABC` + `abstractmethod`           | 纯虚函数                          | 两边都是名义的、运行时/编译期强制                                    |

**一句话本质：Protocol 把「约定」从注释和口头搬进了类型系统，泛型则把「类型之间的联动关系」写成了可检查的表达式；代价是这套东西只在检查器里有效力——它是 CI 门禁和活文档，不是运行时保险。**

收尾三条实战建议：

- **协议归调用方所有，而且要窄。** 你需要 `read()`，就定义一个只有 `read()` 的协议放在自己这一侧，别去要求全世界继承你的基类。
- **入参用 `Sequence`/`Iterable`/`Mapping`，返回用 `list`/`dict`。** 这一条能消掉大半方差报错，还顺手表达了"我不改你的入参"。
- **别把 `isinstance(x, SomeProtocol)` 当契约校验。** 它只回答"有没有这个名字"，不回答"签名对不对"，更不该出现在热路径里。

