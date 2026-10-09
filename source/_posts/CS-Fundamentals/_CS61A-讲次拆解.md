---
title: CS61A 讲次拆解（40 讲逐讲精讲）
date: 2026-10-09
categories: [CS-Fundamentals, CS61A]
tags: [CS61A, Python, 讲义, 课程表]
series: [CS61A]
abbrlink: c61a-plan
---

> 内部讲义底稿，**不发布**（`_` 前缀）。依据 UC Berkeley CS 61A Fall 2026 官方课程表（`cs61a.org`），逐讲拆解核心内容，作为后续重写 CS61A 系列博文的选题与大纲来源。
> 每讲四个维度：① 核心主题与目标 ② 主要知识点拆解 ③ 典型应用/代码示例 ④ 易错点与考试重点。
> ⚠️ = 对上一版讲义的订正处，务必以订正后为准。

# 第一模块：函数抽象与编程基础（Lecture 1–7）

## Lecture 1 · Welcome

**① 核心主题与目标**
介绍计算思维、表达式求值的基本规则，以及课程整体结构。本讲只谈两件事：**表达式有值**，**名字可以被绑定**。

**② 主要知识点拆解**
- **表达式分类**：⚠️ 应是**原子表达式（atomic / primitive）** 与**复合表达式（compound）**的二分；调用表达式只是复合表达式里最常见的一种，不是与「原始表达式」并列的另一极。
- **函数调用解构**：运算符（operator）+ 操作数（operands），如 `max(3, 4)`。
- **求值规约**：① 求值运算符 ② 依次求值各操作数 ③ 把函数应用于实参（arguments）。
- **赋值与名字绑定**：`tau = 2 * pi` 右侧先整体求值再绑定；赋值是语句，本身没有值。
- **值与显示是两回事**：REPL 里 `print(1)` 屏幕出现 `1`，但该表达式**值是 `None`**。
- **课程工具链**：61A Code、`ok` 自动评分、本地 Python 3。

**③ 典型应用/代码示例说明**
```python
from math import pi
tau = 2 * pi          # 右侧整体求值 → 绑定到 tau

>>> 2 + 3
5
>>> 7 / 4
1.75              # / 永远给浮点数
>>> 7 // 4
1                 # // 才是整除
>>> print(7 / 4) is None
True              # 证明 print 的返回值是 None
```
嵌套调用的求值顺序推演：
```python
>>> max(min(1, -2), -3)
-2
# 内层先算：min(1, -2) → -2
# 再算外层：max(-2, -3) → -2
```

**④ 易错点与考试重点**
- **混淆打印（print）与返回（return）**——这是全课最高频的错误。
- **嵌套调用表达式的求值顺序推演**：从最内层开始，逐层向外。
- `=`（赋值）与 `==`（比较）从第一天就要分清。
- `/` 与 `//` 的结果类型、`int`/`float` 的自动提升。

## Lecture 2 · Functions

**① 核心主题与目标**
掌握自定义函数（user-defined functions）的语法结构与求值模型，并吃透 61A 贯穿全课的**求值三规则**。

**② 主要知识点拆解**
- **`def` 语句的执行逻辑**：创建函数对象并把名称绑定到当前帧——**执行 `def` 不执行函数体**。
- **形参（parameters）与实参（arguments）**：实参按位置绑定到形参上，形成新帧。
- **纯函数（pure）与非纯函数（non-pure）**：纯函数只返回值；非纯函数有副作用（side effects），如 `print` 修改屏幕状态。
- **缺省返回值**：函数体没有显式 `return` 时，调用返回 `None`。
- **docstring 是契约**：先写清 `"""Return ..."""`，再写实现。

**③ 典型应用/代码示例说明**
```python
def square(x):
    """Return X * X."""
    return x * x

>>> square(4)
16
```
**副作用输出顺序**的经典题——`print(print(1), print(2))`：
```python
>>> print(print(1), print(2))
1
2
None None
```
推演：先求值第一个实参 `print(1)` → 打印 `1`、返回 `None`；再求值第二个 `print(2)` → 打印 `2`、返回 `None`；最后外层 `print(None, None)` 打印 `None None`。**操作数从左到右求值，副作用按这个顺序发生。**

**④ 易错点与考试重点**
- 函数体**未显式写 `return`** → 返回 `None` → 后续运算炸 `TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'`。
- **非纯函数在求值过程中产生的副作用输出顺序预测**：永远按「操作数从左到右」推。
- `return` 一执行，函数立即结束，其后代码是死代码。

## Lecture 3 · Control

**① 核心主题与目标**
用条件分支与循环语句实现复杂逻辑控制，并埋下 61A 最爱的考点——**短路求值**。

**② 主要知识点拆解**
- **`if / elif / else` 选择结构**：按顺序判断，命中即跳过其余分支。
- **短路求值（short-circuiting）**：`and` 遇第一个假值即停，`or` 遇第一个真值即停——未被求值的部分，副作用不会发生。
- **`while` 循环**：状态更新 + 终止条件设计；循环变量必须在循环体内推进。
- **布尔上下文与真假值**：`0`、`0.0`、`''`、`[]`、`{}`、`None`、`False` 为假，其余为真。
- **条件表达式**：`a if c else b`，单行版 `if-else`。

**③ 典型应用/代码示例说明**
```python
def sum_digits(n):
    total = 0
    while n > 0:
        total, n = total + n % 10, n // 10   # 右侧整体求值再同时绑定
    return total

>>> sum_digits(2026)
10
```
`total, n = ...` 这种多重赋值要求右侧**先全部算完**，所以不会出现「`n` 已被改而 `total` 还在用旧 `n`」的问题。

短路求值的副作用判断：
```python
>>> 3 != 0 and 1 / 3 > 0     # 左边真才求右边，这里保护了除零
True
>>> 3 and 4
4                            # 返回的是操作数，不是 True
>>> 1 or 2
1
```

**④ 易错点与考试重点**
- **逻辑运算符 `and` / `or` 返回具体对象而非仅仅 `True`/`False`**（`1 or 2` 返回 `1`）——必考细节。
- ⚠️ 术语订正：循环终止条件写错导致的是**死循环（infinite loop）**，不是「死锁（deadlock）」；死锁是并发领域的专有名词，别混用。
- 短路题的标准问法：**「这行执行完，`print` 被调用了几次？」**——逐项判断副作用是否发生。

## Lecture 4 · Higher-Order Functions

**① 核心主题与目标**
理解高阶函数（HOF）：函数作为参数传入，或作为返回值返回。函数在此成为**一等公民（first-class functions）**。

**② 主要知识点拆解**
- **函数作参数**：`def apply_twice(f, x): return f(f(x))`，把行为参数化。
- **函数作返回值**：函数体内返回另一个函数，形成「制造函数的函数」。
- **组合函数（composition）**：`compose(f, g)` 得到 `f(g(x))`。
- **柯里化（currying）**：把多参数函数拆成单参数函数链。
- **Lambda 匿名表达式**：`lambda x: x * x`；**体内只能是单个表达式**，不能写 `return` 或语句。

**③ 典型应用/代码示例说明**
```python
def make_adder(n):
    return lambda k: n + k      # 返回函数的函数

>>> add3 = make_adder(3)        # 返回函数，不是数
>>> add3(4)
7
>>> make_adder(10)(5)
15

def compose(f, g):
    return lambda x: f(g(x))
>>> compose(square, make_adder(1))(3)
16
```

**④ 易错点与考试重点**
- **高阶函数多层嵌套时的参数传递逻辑**：一层括号对应一次调用，别数错层数。
- **区分 `f(x)`（调用函数，取返回值）与 `f`（引用函数对象本身）**——最经典的送分/送命题。
- 在 `lambda` 里写 `return` 或 `if` **语句**（只能写条件表达式）。

## Lecture 5 · Environments

**① 核心主题与目标**
掌握 61A 最核心的分析工具——**环境图（environment diagrams）**，精准追踪变量作用域与帧（frames）。

**② 主要知识点拆解**
- **全局帧（Global Frame）与局部帧（Local Frames）**：局部帧按调用顺序标 `f1`、`f2`…。
- **名称查找规则（词法作用域 / lexical scoping）**：在当前帧查找；未找到则沿**父帧（parent frame）** 逐层向上，直到全局帧。
- **⚠️ Parent 帧绑定**：函数在**被定义时**绑定其 parent 帧，**而非在被调用时**。这是整张图的命门。
- **函数对象的写法**：`func g(y) [parent=f1]`——函数对象自带 parent 指针。
- **返回箭头**：`return` 的值不写进帧，而是从发起调用的表达式画箭头指向值来源。

**③ 典型应用/代码示例说明**
```python
def f(x):
    def g(y):
        return x + y
    return g

h = f(4)
h(10)
```
作图推演：
1. `Global` 帧绑 `f`、`g`（执行 `def f` 时创建的 `func g(y) [parent=Global]`）。
2. 执行 `f(4)` → 新建 `f1: f [parent=Global]`，绑 `x = 4`；返回时新建 `func g(y) [parent=f1]`，`h` 绑到它。
3. 执行 `h(10)` → 新建 `f2: g [parent=f1]`，绑 `y = 10`。求 `x + y`：`y` 在 `f2` 找到，`x` 在 `f2` 没有 → 沿 parent 到 `f1` → `4`。结果 `14`。

**要点：`g` 的 parent 是 `f1`，所以 `f` 返回之后 `x` 依然活着。**

**④ 易错点与考试重点**
- **Midterm 1 必考题型！** 极易在确定函数的 parent 帧时混淆**定义位置与调用位置**（词法作用域 vs 动态作用域）。
- 局部帧的 parent 画成「调用者」——**错**，永远指向函数对象定义时所在帧。
- 忘记**每次调用都产生一个新的内层函数对象**（parent 指向不同的 `f1`）。
- 练法：**先看箭头，别急着算**。

## Lecture 6 · Abstraction

**① 核心主题与目标**
理解**抽象屏障（abstraction barriers）**：给它起名，然后在使用时不必知道内部实现。涵盖函数抽象与数据抽象两层。

**② 主要知识点拆解**
- **函数抽象三要素**：Domain（定义域，能接受什么）、Range（值域，会返回什么）、Intent（行为规范，做什么）。
- **数据抽象**：用**构造函数（constructors）** 造数据、用**选择函数（selectors）** 取数据，使用方永不直接触碰内部表示。
- **抽象屏障**：屏障两侧独立演进——实现随便改，只要承诺不变。
- **违反抽象屏障的常见错误**：在高层逻辑里直接操作底层数据结构。
- 补充说明：Fall 2026 官方第 6 讲的标题是 **Abstraction**（幻灯片名 `06-Functional_Abstraction.pdf`），重心偏**函数抽象**；数据抽象在 61A 里通常另成一讲（Sequences 前后）。重写博文时若贴官方讲次，这一讲的数据抽象部分宜以「引入」而非「主课」处理。

**③ 典型应用/代码示例说明**
⚠️ **上一版这里的代码有两处硬错误，订正如下：**
```python
# ✗ 错误版本
def make_rat(n, d): return [n, d]
def numer(r): return r        # 返回了整个列表，不是分子
def denom(r): return r[3]     # 列表只有 2 个元素，r[3] 直接 IndexError

# ✓ 正确版本
def rational(n, d):
    return [n, d]

def numer(x):
    return x[0]               # 分子

def denom(x):
    return x[1]               # 分母
```
违反抽象屏障的对照：
```python
# ✗ 高层逻辑直接碰内部表示，换表示法立刻全崩
def mul_rationals(x, y):
    return [x[0] * y[0], x[1] * y[1]]

# ✓ 只经由构造/选择函数
def mul_rationals(x, y):
    return rational(numer(x) * numer(y), denom(x) * denom(y))

>>> r = rational(3, 4)
>>> numer(r), denom(r)
(3, 4)
```

**④ 易错点与考试重点**
- **在编写高层逻辑代码时直接操作底层数据**（例如直接 `r[0]` 而不调用 `numer(r)`），从而违反抽象屏障——这是本讲唯一的核心考点。
- 记忆点：构造函数与选择函数**必须成对**出现；只要出现裸下标 `x[1]`，几乎就是屏障被拆了。

## Lecture 7 · Function Examples

**① 核心主题与目标**
通过综合案例巩固高阶函数、环境图与函数抽象，为 Midterm 1 做准备。官方这一讲幻灯片已开始带期中复习色彩。

**② 主要知识点拆解**
- **函数包装（function wrappers）**：把一个函数包进另一个函数，附加行为——装饰器的雏形。
- **柯里化与反柯里化（curry / uncurry）的转换实现**。
- **多层 lambda 的环境图手写推演**：几层 lambda 就对应几层帧。
- **数字拆解类函数**：`sum_digits` / `count_digits` 的循环骨架。
- 用环境图验证结论，替代「凭直觉猜」。

**③ 典型应用/代码示例说明**
```python
def curry2(f):
    return lambda x: lambda y: f(x, y)

def uncurry2(g):
    return lambda x, y: g(x)(y)

>>> from operator import add
>>> curry2(add)(2)(3)
5
>>> uncurry2(curry2(add))(2, 3)
5
```
`curry2(add)(2)` 返回的是内层 `lambda y: f(2, y)`（捕获 `x = 2`），再传 `3` 才真正调用 `add`。**三层帧**是这一讲环境图题的典型形状。

函数包装示例：
```python
def trace(f):
    def wrapped(x):
        print("call", f, "with", x)
        return f(x)
    return wrapped

>>> traced_square = trace(square)
>>> traced_square(3)
call <function square at 0x...> with 3
9
```

**④ 易错点与考试重点**
- **手写推演多重 lambda 与高阶调用的环境图**——本节直接对接 Midterm 1 的综合大题。
- 循环里创建函数的**闭包陷阱**：61A 模型中内层函数引用的是「帧里的名字」而非「创建时的值」，循环结束后多个函数可能共享同一个名字的最终值。遇题就画图。
- 少写一层括号 = 少一次调用，返回类型完全不同。

---

# 第二模块：递归与数据结构（Lecture 8–16）

## Lecture 8 · Midterm 1 Review（考点清单）

**① 核心主题与目标**
回顾第一模块（函数抽象、控制流、环境图），为期中一收网。这一讲不是新课，是**考点地图**。

**② 考点清单（按出现频率排）**
1. **环境图手写推演**——几乎每套卷子都有，且常占大题。
2. 高阶函数返回函数 / 多层 lambda 的参数传递。
3. 非纯函数的副作用输出顺序预测。
4. 短路求值下副作用是否发生。
5. `and` / `or` 返回操作数本身而非布尔值。

**③ 与环境图相关的三条快速判据**
- 局部帧的 parent = **函数对象定义时所在的帧**，跟谁调用它无关。
- 每次调用产生**新的内层函数对象**（parent 指向该次调用的帧）。
- `return` 的值画成箭头，不写进帧。

**④ 易错点与考试重点**
- **父帧（parent frame）判断错误**：拿调用位置当定义位置，是 MT1 最高频失分点。
- **对非纯函数的副作用输出预测遗漏**：`print(print(1), print(2))` 这类题要按「操作数从左到右」逐项推。
- 答题技巧：先画图再动笔，别靠脑内模拟——图上一目了然的，脑子里容易串。

## Lecture 9 · Recursion

**① 核心主题与目标**
理解递归的计算模型：把大问题拆成**同类的更小子问题**，并学会「信心跃迁」式的推理方式。

**② 主要知识点拆解**
- **递归基（base case）**：最小可解子问题与终止条件。
- **递归步骤（recursive step）**：缩小问题规模并自我调用。
- **信心跃迁（leap of faith）**：假定 `factorial(n-1)` 已经正确，只关心「怎么用它拼出 `factorial(n)`」——写递归时唯一要想的事。
- **调用栈**：每层递归占一个帧，栈深度 = 递归深度。
- **递归与迭代可互改**，但递归更贴近数学定义。

**③ 典型应用/代码示例说明**
```python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

>>> factorial(5)
120
```
展开过程：
```text
factorial(5) = 5 * factorial(4)
             = 5 * 4 * factorial(3)
             = 5 * 4 * 3 * factorial(2)
             = 5 * 4 * 3 * 2 * factorial(1)
             = 5 * 4 * 3 * 2 * 1
             = 120
```

**④ 易错点与考试重点**
- **遗漏递归基导致无限递归 `RecursionError: maximum recursion depth exceeded`**（Python 默认约 1000 层）。
- **递归调用中未正确缩小参数规模**（写成 `factorial(n)` 而非 `factorial(n - 1)`）。
- 终止条件别写进 `else` 分支；边界判断要放在函数最前面。
- 重点题型：给 docstring 写递归实现。写不出就把 `n = 0`、`n = 1` 手算一遍，再写递归步骤。

## Lecture 10 · Tree Recursion

**① 核心主题与目标**
掌握**单条执行路径里多次自我调用**的树递归模式，并用调用树（call tree）分析其代价。

**② 主要知识点拆解**
- **多重分支探索**：每次递归拆成多个子问题（分割数计数、斐波那契数列）。
- **决策树与回溯**：穷举可能路径解决组合与选择问题。
- **调用树展开分析**：树递归的执行过程本身就是一棵树，节点数 = 调用总次数。
- **重叠子问题**：朴素树递归会重复计算同一个小问题，这是记忆化（memoization）的动机。
- **多重边界条件**：树递归通常需要不止一个终止条件。

**③ 典型应用/代码示例说明**
```python
def count_partitions(n, m):
    """Count partitions of n using parts up to size m."""
    if n == 0:
        return 1
    elif n < 0 or m == 0:
        return 0
    else:
        return count_partitions(n - m, m) + count_partitions(n, m - 1)

>>> count_partitions(5, 3)
5
```
拆解逻辑：`n` 用不超过 `m` 的部分来分，只有两条路——**用至少一个 `m`**（`cp(n - m, m)`）或**完全不用 `m`**（`cp(n, m - 1)`）。两条路刚好覆盖全部情形且互不重叠。

调用树形态：
```text
                      cp(4,2)
              ┌──────────┴──────────┐
           cp(2,2)                cp(4,1)
        ┌────┴────┐             ┌────┴────┐
     cp(0,2)   cp(2,1)       cp(3,1)   cp(4,0)
        1      ┌──┴──┐      ┌──┴──┐       0
            cp(1,1) cp(2,0) cp(2,1) cp(3,0)
```
斐波那契的朴素版是最典型的树递归：
```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```
`fib(n)` 的调用次数以约 `φⁿ` 增长——因为 `fib(n-2)` 被算了两遍。

**④ 易错点与考试重点**
- **期中考试重难点！多重边界条件漏写**：`n < 0`（分不出来）与 `m == 0`（没有可用的最大部分）**两个都要**，各挡一种死路。
- **分支重叠时的重复计数理解偏差**：务必能说清「这两条路为什么不会重复数同一种分法」；说不清就手画小例子的调用树。
- 判别「是不是树递归」：`return` 那一行出现**两次以上自我调用**。

## Lecture 11 · Sequences

**① 核心主题与目标**
掌握 Python 的复合数据类型——序列（列表、字符串、元组），以及 `for` 循环的迭代机制。

**② 主要知识点拆解**
- **索引与切片**：`seq[i]`、`seq[i:j]`（**左闭右开**）、`seq[i:j:k]`；负索引从尾部数。
- **拼接与重复**：`+` 拼同类型序列，`*` 重复。
- **`for` 循环迭代机制**：`for x in seq` 依次绑定元素；`range(n)` 是惰性的序列对象，**不是列表**。
- **序列聚合与内置函数**：`len`、`min`、`max`、`sum`、`in`。
- **元组不可变**：可作字典键；列表不行。

**③ 典型应用/代码示例说明**
⚠️ **这一讲上一版的代码算错了，订正：**
```python
# ✗ 错误版本：7-9 是减法，结果是 -2，不是 [7, 8, 9]
digits = [7-9]           # 实际值是 [-2]，只有一个元素
sub_list = digits[1:3]   # 实际值是 []，不是 [8, 9]

# ✓ 正确版本：元素之间要用逗号
digits = [7, 8, 9]
sub_list = digits[1:3]   # [8, 9]
digits[:2]               # [7, 8]
digits[-1]               # 9
digits[1:]               # [8, 9]
digits + [10]            # [7, 8, 9, 10]
```
`for` 与 `range`：
```python
>>> total = 0
>>> for x in [3, 4, 5]:
...     total += x
>>> total
12
>>> list(range(3, 8, 2))
[3, 5, 7]
>>> s = "abc"
>>> s[0], s[1:]
('a', 'bc')
```

**④ 易错点与考试重点**
- **切片边界左闭右开**：`digits[1:3]` 取下标 1、2，**不含 3**——最高频丢分点。
- **切片生成新的浅拷贝**，与原对象不是同一引用（`a is b` 为 False）；改新列表不影响原列表，但内部嵌套的**可变对象仍共享**。
- `range(n)` 不是列表：`range(5) == [0,1,2,3,4]` 是 False，要 `list(range(5))`。
- 字符串不可变：`s[0] = 'x'` 直接抛 `TypeError`。

## Lecture 12 · Containers

**① 核心主题与目标**
学习 Python 的容器家族——列表推导式、字典、集合——及其高效操作模式。

**② 主要知识点拆解**
- **列表推导式**：`[expr for x in seq if cond]`，把 map + filter 压成一行。
- **字典**：键值对结构，`d[k]` 查找平均 O(1)；**键必须是不可变类型**。
- **集合**：元素唯一、无序，支持交（`&`）并（`|`）差（`-`）等集合代数运算。
- **容器选型**：要顺序用 list，要映射用 dict，要去重/集合运算用 set。
- **推导式的边界**：可以嵌套多层 `for`，但可读性下降很快。

**③ 典型应用/代码示例说明**
```python
>>> sq_evens = [x**2 for x in range(10) if x % 2 == 0]
>>> sq_evens
[0, 4, 16, 36, 64]

>>> d = {'a': 1, 'b': 2}
>>> d['a'], 'a' in d, len(d)
(1, True, 2)

>>> {1, 2, 3} | {3, 4}     # 并
{1, 2, 3, 4}
>>> {1, 2, 3} & {3, 4}     # 交
{3}
>>> {1, 2, 3} - {3, 4}     # 差
{1, 2}
```
嵌套推导（矩阵转置）：
```python
>>> m = [[1, 2, 3], [4, 5, 6]]
>>> [[row[i] for row in m] for i in range(3)]
[[1, 4], [2, 5], [3, 6]]
```

**④ 易错点与考试重点**
- **字典的键必须是不可变类型**：`{(1, 2): 'ok'}` 合法，`{[1, 2]: 'bad'}` 抛 `TypeError: unhashable type: 'list'`。
- 推导式里逻辑过于复杂（三层嵌套或掺副作用）会毁掉可读性——**可读性在 61A 评分里算分**。
- 集合无序：`{1,2,3} == {3,2,1}` 为 True，但**不能用下标取集合元素**。
- `for k in d` 拿到的是**键**，不是键值对。

## Lecture 13 · Objects

**① 核心主题与目标**
建立对「对象」与「数据表示」的认识：Python 中一切皆为对象，每个对象有身份与状态。

**② 主要知识点拆解**
- **统一数据视图**：数字、字符串、函数、列表、类都是对象。
- **身份（identity）与相等性（equality）**：`is` 比身份，`==` 比内容。
- **数据表示可替换**：同一个抽象可以有多种表示（列表 / 字典 / 函数），抽象屏障保证调用方不受影响。
- **用函数实现对象行为**：数据抽象的一种极致形态——把对象表示成「接收消息的函数」（message passing）。
- **类型查询**：`type(x)`。

**③ 典型应用/代码示例说明**
```python
>>> a = [7, 9]
>>> b = [7, 9]
>>> a == b
True          # 内容相等
>>> a is b
False         # 两个不同的对象
>>> c = a
>>> c is a
True          # 同一对象的两个名字
```
用函数表示数据（61A 的经典桥段）：
```python
def pair(x, y):
    def dispatch(m):
        if m == 0:
            return x
        elif m == 1:
            return y
    return dispatch

def first(p):
    return p(0)

def second(p):
    return p(1)
```
`pair` 内部没有任何数据结构，行为却和列表一样——这就是「数据即函数」。

**④ 易错点与考试重点**
- **混淆 `is`（同一引用）与 `==`（相同内容）**：`[7, 9] is [7, 9]` 永远 False。
- 复杂嵌套引用关系下的**浅拷贝**概念混淆：`b = a[:]` 只复制外层，`b[0] is a[0]` 仍为 True。
- 小整数与字符串驻留是 CPython **实现细节**（`256 is 256` 为 True，`257 is 257` 通常为 False）——别拿它当语言语义，判身份只问「是不是同一个对象」。

## Lecture 14 · Linked Lists

**① 核心主题与目标**
理解递归数据结构——链表：一个链表由「第一个元素」和「剩下的链表」构成。

**② 主要知识点拆解**
- **递归定义**：`Link` 要么是空哨兵 `Link.empty`，要么是 `first` + `rest`（而 `rest` 又是 `Link`）。
- **`Link` 类与 ADT**：`first` 存值，`rest` 存下一个 `Link` 或 `Link.empty`。
- **哨兵 `empty`**：类属性 `empty = ()`，全课共用同一个空链表对象；**判空用 `is Link.empty`**。
- **递归遍历**：迭代（`t = t.rest`）与递归（对 `t.rest` 调自己）两种写法。
- **修改 vs 新建**：`rest` 指向可变对象，就地改动会影响所有引用它的地方。

**③ 典型应用/代码示例说明**
```python
class Link:
    empty = ()
    def __init__(self, first, rest=empty):
        self.first = first
        self.rest = rest

    def __repr__(self):
        if self.rest is Link.empty:
            return f'Link({self.first})'
        return f'Link({self.first}, {self.rest})'

>>> Link(1, Link(2, Link(3)))
Link(1, Link(2, Link(3)))
```
递归求和与求长：
```python
def sum_links(t):
    if t is Link.empty:
        return 0
    return t.first + sum_links(t.rest)

def length(t):
    if t is Link.empty:
        return 0
    return 1 + length(t.rest)
```
链表反转（指针原地反转，经典题）：
```python
def reverse(t):
    prev, cur = Link.empty, t
    while cur is not Link.empty:
        cur.rest, prev, cur = prev, cur, cur.rest
    return prev
```

**④ 易错点与考试重点**
- **Midterm 2 必考题型！处理末尾空链表 `Link.empty` 的边界情况**——判空用 `is Link.empty`，不要靠值比较 `t == ()`。
- **对链表结构的递归修改**：先分清「改的是 `rest` 指针还是 `first` 值」；插入与删除本质都是改指针。
- 别把链表与 Python 的 `list` 混——链表没有下标，取第 k 个元素是 O(k)。

## Lecture 15 · Trees

**① 核心主题与目标**
掌握层次化递归数据结构——树：根标签 + 子树列表；所有树算法都是对 `branches` 的递归。

**② 主要知识点拆解**
- **组成**：`label`（根节点标签）+ `branches`（子树列表，每个元素又是 Tree）。
- **`Tree` 类与 ADT**：`branches` 为空列表即为叶子，`is_leaf()` 判叶子。
- **深度优先遍历**：对每个分支递归。
- **树上的聚合**：节点数、叶子数、深度、路径搜索。
- **互递归**：`is_leaf` 与 `branches` 的配合常写成互递归形式。

**③ 典型应用/代码示例说明**
```python
class Tree:
    def __init__(self, label, branches=[]):
        self.label = label
        self.branches = list(branches)   # 防御性拷贝，避免默认参数共享

    def is_leaf(self):
        return not self.branches

def count_nodes(t):
    return 1 + sum([count_nodes(b) for b in t.branches])

def count_leaves(t):
    if t.is_leaf():
        return 1
    return sum([count_leaves(b) for b in t.branches])

>>> t = Tree(1, [Tree(2, [Tree(4)]), Tree(3)])
>>> count_nodes(t), count_leaves(t)
(4, 2)
```
树的深度：
```python
def depth(t):
    if t.is_leaf():
        return 0
    return 1 + max([depth(b) for b in t.branches])
```

**④ 易错点与考试重点**
- **Midterm 2 核心重点！对子树列表 `branches` 的循环递归逻辑写错**：聚合类函数必须**先对 branches 逐个求值再聚合**；写成 `count_nodes(t.branches)` 就漏了。
- **遗漏叶子节点的特殊边界判断**：`max([...])` 遇空列表会 `ValueError`，所以 `depth` 必须先用 `is_leaf()` 兜住。
- 空树（`branches` 为空）的处理是区分满分与及格的地方。

## Lecture 16 · Midterm 2 Review（考点清单）

**① 核心主题与目标**
全面复习第二模块（递归、链表、树），重点突破综合应用大题。同样是考点地图，不是新课。

**② 考点清单（按分值排）**
1. **树上的聚合与路径搜索**——MT2 大题常客（根到叶的路径和、最大值路径）。
2. **链表递归修改**——去重、反转、拼接、插入有序。
3. **基础递归与树递归的代码编写**——给 docstring 写实现。
4. **多重边界条件**——`Link.empty` / `is_leaf()` / `n < 0` 三者必查。

**③ 三类典型题与解法骨架**
```python
# ① 树：所有叶子的标签和
def leaf_sum(t):
    if t.is_leaf():
        return t.label
    return t.label + sum([leaf_sum(b) for b in t.branches])

# ② 链表去重（保留首次出现）
def remove_dups(t):
    seen = []
    cur = t
    while cur is not Link.empty:
        seen.append(cur.first)
        while cur.rest is not Link.empty and cur.rest.first in seen:
            cur.rest = cur.rest.rest        # 跳过重复节点
        cur = cur.rest
    return t

# ③ 树递归计数：有多少条根到叶路径的和等于 total
def count_paths(t, total):
    if t.is_leaf():
        return 1 if t.label == total else 0
    return sum([count_paths(b, total - t.label) for b in t.branches])
```

**④ 易错点与考试重点**
- 高压考试环境下**递归终止条件漏写**，或**对树分支循环逻辑错构**（写成对 `t` 递归而不是对 `b in t.branches`）。
- 计算机化考试（PrairieLearn / CBTF）答题技巧：先在草稿区画调用树或环境图，再写代码；写完立刻手跑一个最小例子。
- 自查三问：**叶子兜住了吗？`Link.empty` 兜住了吗？递归参数真的变小了吗？**

---

# 第三模块：面向对象编程与高级特性（Lecture 17–25）

## Lecture 17 · Problem Solving

**① 核心主题与目标**
结合 MT2 与复杂实战题，培养系统化的解题思路与调试技巧——这一讲教的不是语法，是**流程**。

**② 主要知识点拆解**
- **问题分解（problem decomposition）**：把大问题拆成能单独测试的小函数，每个函数只做一件事。
- **测试驱动拆解**：先写 docstring 里的例子（即测试），再写实现。
- **边界条件推演**：拿到题先列「最小时 / 空 / 单个元素 / 极值」四类边界。
- **代码追踪（tracing）与环境图**：卡住就画图，不靠脑内模拟。
- **调试策略**：把大函数拆成可独立验证的小调用，逐个 print 或断言。

**③ 典型应用/代码示例说明**
拆解流程示例（树 + 链表的综合题，先列边界再写）：
```text
题目：求从根到每个叶子的路径上，节点标签之和的最大值。
① 边界：空树？（本题无） / 叶子？
② 骨架：
   - 叶子 → 返回自己的 label
   - 非叶子 → label + max(每个分支的递归结果)
③ 陷阱：max([]) 会对空列表报 ValueError，所以必须先判叶子
```
```python
def max_path_sum(t):
    if t.is_leaf():
        return t.label                     # 边界先兜
    return t.label + max([max_path_sum(b) for b in t.branches])
```

**④ 易错点与考试重点**
- **多条件组合题型缺乏系统规划**，导致边界条件漏写或递归逻辑混乱——这是本讲唯一的失分点，也是 MT2/MT3 综合大题的失分主因。
- 应试动作固化：**列边界 → 写 docstring 例子 → 手跑最小例子 → 再写代码**，四步不许跳。

## Lecture 18 · Mutation

**① 核心主题与目标**
理解状态变化与可变数据结构：可变性带来表达力，也带来「改的是谁」的追踪难题。

**② 主要知识点拆解**
- **可变对象**：列表、字典、集合支持原地修改（`.append()`、下标赋值、`.pop()`）。元组与字符串不可变。
- **修改（mutation）与重新赋值（reassignment）是两件事**：前者改对象**内部**，后者改帧里**名字的指向**。
- **环境图两种画法**：mutation 是「擦掉列表对象格子里的旧值写新值」；reassignment 是「把帧里那支箭头改指到新对象」。
- **非局部作用域 `nonlocal`**：让内层函数能**重新赋值**外层函数的变量。
- **可变性带来的等价性变化**：同一个对象被改后，所有指向它的名字都「跟着变」。

**③ 典型应用/代码示例说明**
两种实现同一个「会记账的钱包」，请对着看：
```python
# 用 nonlocal —— 重新赋值
def make_withdraw(balance):
    def withdraw(amount):
        nonlocal balance          # 没有这行 → UnboundLocalError
        balance = balance - amount
        return balance
    return withdraw

# 用列表 mutation —— 不需要 nonlocal
def make_withdraw(balance):
    b = [balance]
    def withdraw(amount):
        b[0] = b[0] - amount      # 改的是列表内部，不是重新绑定名字
        return b[0]
    return withdraw
```
实测：
```python
>>> w = make_withdraw(100)
>>> w(30)
70
>>> w(30)
40
```
两个版本行为一样，**区别只在环境图上**：第一个版本每个 `withdraw` 帧里有一条指向 `f1` 里 `balance` 的赋值箭头；第二个版本 `b` 从头到尾指向同一个列表对象，只是格子里的数字在变。

**④ 易错点与考试重点**
- **期中考试高频考点！混淆「重新赋值」与「修改对象内容」**：`x = x + [1]` 是重新赋值（新列表）；`x.append(1)` 是修改（原列表）。判断后者的快捷方式：**有没有别的名字也会跟着变？**
- **`nonlocal` 声明缺失导致 `UnboundLocalError`**：函数体内只要出现对某名字的赋值，Python 就把它当局部变量，于是 `balance - amount` 里读的也是局部（未绑定）。
- 反过来的坑：用了列表 mutation 却以为需要 `nonlocal`（不需要，因为没对 `b` 这个名字赋值）。

## Lecture 19 · Classes

**① 核心主题与目标**
掌握用 `class` 把数据和行为组织在一起：类定义蓝图，实例承载状态。

**② 主要知识点拆解**
- **类与实例**：类定义本身是对象；`Account('Jo')` 触发实例化，自动调用 `__init__`。
- **`self` 的自动传递**：`a.deposit(20)` 完全等价于 `Account.deposit(a, 20)`。
- **绑定方法（bound method）**：`a.deposit` 是「函数 + 绑定了的 self」，调用时 self 自动补上。
- **实例属性**：由 `__init__`（或任意方法）通过 `self.name = value` 创建，存在实例上。
- **数据封装**：属性存状态、方法改状态，外部通过方法交互。

**③ 典型应用/代码示例说明**
```python
class Account:
    def __init__(self, holder):
        self.holder = holder
        self.balance = 0

    def deposit(self, amount):
        self.balance += amount
        return self.balance

>>> a = Account('Jo')
>>> a.deposit(20)
20
>>> a.balance
20
>>> Account.deposit(a, 20)     # 与上面完全等价
40
```

**④ 易错点与考试重点**
- **定义类方法时遗漏 `self` 形参** → 调用时抛 `TypeError: deposit() takes 1 positional argument but 2 were given`。
- **混淆实例属性与局部变量**：方法里写 `balance = 0` 只是创建局部变量，**不会**改 `self.balance`；必须写 `self.balance = 0`。
- 特别注意 `__init__` 里忘写 `self.` 的赋值——不报错，但实例上根本没有那个属性，之后访问才炸 `AttributeError`。

## Lecture 20 · Attributes

**① 核心主题与目标**
讲透属性查找机制：实例属性与类属性的分工，以及「遮蔽（shadowing）」这个高频陷阱。

**② 主要知识点拆解**
- **点表达式查找规则**：先在**实例**上找，找不到再沿**类与继承链**向上找。
- **类属性被所有实例共享**：适合放「所有实例都一样的常量」，如 `interest = 0.02`。
- **通过实例赋值 ≠ 修改类属性**：`acc.interest = 0.05` 只是给这个实例**新建**一个同名实例属性，把类属性遮蔽掉。
- **通过类名赋值才改类属性**：`Account.interest = 0.05` 影响所有（未遮蔽的）实例。
- 同一套查找规则在**方法**上也成立——这是 Lecture 21 继承的基础。

**③ 典型应用/代码示例说明**
```python
class Account:
    interest = 0.02
    def __init__(self, holder, balance=0):
        self.holder = holder
        self.balance = balance

>>> a = Account('Jo')
>>> a.interest, Account.interest
(0.02, 0.02)

>>> a.interest = 0.05          # 通过实例赋值 → 新建实例属性，遮蔽类属性
>>> a.interest, Account.interest
(0.05, 0.02)                   # 类属性没变！

>>> b = Account('Yu')
>>> b.interest
0.02                           # 新实例仍走类属性
```
最阴的一行是复合赋值：
```python
>>> a.interest += 0.01
# 等价于 a.interest = a.interest + 0.01
# 右边先读（此时读到实例属性 0.05），再写回实例属性 → 又创建/更新实例属性
>>> a.interest, Account.interest
(0.06, 0.02)
```

**④ 易错点与考试重点**
- **通过实例试图修改类属性（`acc.interest = 0.05`）并不会更改类属性本身**，而是创建同名实例属性遮蔽它——标答级考点。
- 判断三步走：① 这个赋值写在**实例**上还是**类名**上？② 之前该名字在实例上存在吗？③ 其他实例受影响吗？
- `a.interest += 0.01` 会**意外创建实例属性**，是 61A 最爱用来埋雷的写法。

## Lecture 21 · Inheritance

**① 核心主题与目标**
掌握继承机制：用层级抽象复用代码，用方法重写实现多态。

**② 主要知识点拆解**
- **基类与子类**：`class CheckingAccount(Account)`，子类自动获得基类的属性与方法。
- **属性/方法查找沿继承链向上**：子类没定义就找基类（沿用 Lecture 20 的规则）。
- **方法重写（overriding）**：子类定义同名方法即覆盖基类版本。
- **显式调用父类实现**：`Account.withdraw(self, ...)` 或更现代的 `super().withdraw(...)`。
- **多态（polymorphism）**：不同类的对象响应同名方法，调用方不必知道具体类型。

**③ 典型应用/代码示例说明**
```python
class Account:
    interest = 0.02
    def __init__(self, holder, balance=0):
        self.holder = holder
        self.balance = balance
    def withdraw(self, amount):
        if amount > self.balance:
            return 'Insufficient funds'
        self.balance -= amount
        return self.balance

class CheckingAccount(Account):
    withdraw_fee = 1
    interest = 0.01                 # 重写类属性
    def withdraw(self, amount):
        return Account.withdraw(self, amount + self.withdraw_fee)
        # 等价写法：return super().withdraw(amount + self.withdraw_fee)

>>> c = CheckingAccount('Yu', 100)
>>> c.withdraw(10)
89                              # 扣了 10 + 1 手续费
>>> c.interest                  # 沿继承链找到子类自己的 0.01
0.01
```
多态的用法：
```python
def withdraw_all(accounts, amount):
    for a in accounts:
        a.withdraw(amount)      # 不关心是 Account 还是 CheckingAccount
```

**④ 易错点与考试重点**
- **重写父类方法时忘记调用父类实现或未传递必要参数**：`Account.withdraw(self, ...)` 里 `self` 必须显式传，写成 `Account.withdraw(amount)` 立刻报参数错。
- **子类定义 `__init__` 时忘了调 `super().__init__(...)`**，导致父类本该建的属性缺失——之后访问才炸 `AttributeError`。
- **复杂多层继承中的属性查找推演**：把继承链画成一条线，从最下层往上找，第一个命中即停。
- 子类重写**类属性**（`interest = 0.01`）时，它是一条**新的类属性**，不是「改了基类那份」。

## Lecture 22 · Lazy Evaluation

**① 核心主题与目标**
学习按需计算的惰性求值思想：不值算就不算，从而能处理大型甚至无限的数据流。

**② 主要知识点拆解**
- **及早求值 vs 惰性求值**：`range(10**9)` 立即造出十亿个数的**不是** Python（它惰性）；`[0]*10**9` 才是真造。
- **迭代器协议**：`iter(obj)` 取迭代器，`next(it)` 取下一个；耗尽抛 `StopIteration`。
- **可迭代对象（iterable）≠ 迭代器（iterator）**：列表是可迭代但**不是**迭代器；`iter()` 后才是。
- **迭代器是一次性的**：走过就走过了，不能回头。
- **Thunk 与 stream**：把「还没算的表达式」包成对象，需要时才求值——61A 用它构造惰性列表。

**③ 典型应用/代码示例说明**
⚠️ **这一讲上一版的代码算错了，订正：**
```python
# ✗ 错误版本：3-5 是减法，[3-5] == [-2]，只有一个元素
s = iter([3-5])
next(s)  # 实际是 -2，不是 1
next(s)  # 实际抛 StopIteration，不是 2

# ✓ 正确版本
s = iter([1, 2, 3])
>>> next(s)
1
>>> next(s)
2
>>> next(s)
3
>>> next(s)
StopIteration
```
`iterable` 与 `iterator` 的区别：
```python
>>> lst = [1, 2, 3]
>>> iter(lst) is iter(lst)
False              # 每次 iter() 得到新的独立游标
>>> it1, it2 = iter(lst), iter(lst)
>>> next(it1), next(it1), next(it2)
(1, 2, 1)          # 两个游标各自独立
>>> next(lst)      # 列表本身不是迭代器
TypeError: 'list' object is not an iterator
```

**④ 易错点与考试重点**
- **迭代器耗尽后继续 `next()` 抛 `StopIteration`**——`for` 循环内部就是靠捕获它来结束的。
- **混淆可迭代对象与迭代器对象**：能放进 `for` 的是 iterable；能喂给 `next()` 的才是 iterator。
- 同一个迭代器不能「重跑」：调试时把 `next()` 写了两次却以为在测两个用例，是常见自坑。

## Lecture 23 · Generators

**① 核心主题与目标**
用 `yield` 写生成器函数，以最自然的方式实现惰性数据流与「会记状态的函数」。

**② 主要知识点拆解**
- **生成器函数 vs 生成器对象**：函数体里有 `yield` 就是生成器函数；**调用它不执行函数体**，只返回生成器对象。
- **暂停与恢复**：第一次 `next()` 才开始执行，遇到 `yield` 暂停并**保留整个帧**（局部变量、PC 都在），下次 `next()` 继续。
- **生成器本身就是迭代器**：一次性、支持 `for`、耗尽抛 `StopIteration`。
- **`yield from`**：把委托交给另一个可迭代对象，把它的产出逐个转出来。
- **无限序列**：`while True: yield ...` 只在需要时算。

**③ 典型应用/代码示例说明**
```python
def evens(start):
    while True:
        yield start
        start += 2

>>> e = evens(0)          # 只创建生成器对象，函数体一行都没执行
>>> next(e), next(e), next(e)
(0, 2, 4)
>>> next(e)
6
```
调用与执行的区别是这一讲的核心，配一个对照：
```python
def gen():
    print('开始')
    yield 1

>>> g = gen()      # 什么都不打印
>>> next(g)        # 这时才打印 "开始"，并返回 1
```
`yield from` 与递归生成器：
```python
def countdown(n):
    if n > 0:
        yield n
        yield from countdown(n - 1)

>>> list(countdown(3))
[3, 2, 1]
```

**④ 易错点与考试重点**
- **期中/期末考试高频重难点！混淆「调用生成器函数（返回生成器对象）」与「执行生成器内部代码（靠 `next()` 触发）」**——判据：只要没 `next`/`for`，函数体一行都没跑。
- **`yield from` 多层递归调用的推演**：`yield from` 的作用域是**平铺**的，多层嵌套最终产出的是一个扁平序列，不是嵌套列表。
- 生成器的状态是**逐实例独立**的：`g1`、`g2 = evens(0), evens(0)` 各有自己的 `start`，互不影响。

## Lecture 24 · Efficiency

**① 核心主题与目标**
学会用 Big-O 定量描述时间/空间开销，并能用记忆化把指数级算法打回线性。

**② 主要知识点拆解**
- **时间复杂度与空间复杂度**：都看**增长阶**，忽略常数与低阶项。
- **常见阶数**：`O(1)` < `O(log n)` < `O(n)` < `O(n log n)` < `O(n²)` < `O(2ⁿ)`。
- **隐藏开销**：`x in lst` 是 `O(n)`，而 `x in st`（集合）平均 `O(1)`——同一行代码，代价差一个量级。
- **树递归的指数代价**：调用树节点数就是调用次数；`fib(n)` 约 `φⁿ`。
- **记忆化（memoization）**：用字典缓存已算过的结果，把重复子树剪掉。

**③ 典型应用/代码示例说明**
```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)     # 调用次数约 φⁿ

def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        result = n
    else:
        result = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    memo[n] = result                   # 算过就存
    return result
```
缓存后 `fib(n)` 的调用次数降到约 `2n`。用 `functools` 更省事：
```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_fast(n):
    if n <= 1:
        return n
    return fib_fast(n - 1) + fib_fast(n - 2)
```
顺带记住：`dict`/`set` 的 `in` 是 `O(1)`，`list` 的 `in` 是 `O(n)`——把循环里反复查的容器换成 `set`，常是最便宜的一次提速。

**④ 易错点与考试重点**
- **忽略隐式操作的时间开销**：`x in lst` 是 `O(n)`（很多人默认它是常数）；`lst.insert(0, x)` 是 `O(n)`；字符串拼接在循环里应改用 `list` + `join`。
- **树递归调用的展开树深度与节点计数**：会画调用树就能算清「这是 `O(2ⁿ)` 还是 `O(n)`」。
- 记忆化的前提是**纯函数**（Lecture 27 会呼应）：有副作用的函数缓存结果会出错。

## Lecture 25 · Object Examples

**① 核心主题与目标**
用一个大型 OOP 系统融会贯通类、继承、状态与设计模式，同时为 Project 3 铺路。

**② 主要知识点拆解**
- **多类交互系统的架构**：基类定义接口，子类实现差异。
- **模板方法模式**：基类写好流程（如 `Insect.action(gamestate)`），子类只填其中一步。
- **状态绑定**：对象与其所在位置（`Place`）互相持有引用。
- **设计模式的价值**：新增一种蚂蚁只需加一个子类，**不改动**已有代码。
- **Project 3：Ants Vs. SomeBees**（塔防游戏）。

**③ 典型应用/代码示例说明**
结构骨架（61A 的真实设计）：
```python
class Insect:
    def __init__(self, armor=2):
        self.armor = armor
        self.place = None

    def action(self, gamestate):
        raise NotImplementedError    # 由子类实现
    def reduce_armor(self, amount):
        self.armor -= amount
        if self.armor <= 0:
            self.place.remove_insect(self)

class Ant(Insect):
    food_cost = 0
    def action(self, gamestate):
        self.place.add_insect(Bee())  # 各子类行为不同

class HarvesterAnt(Ant):
    def action(self, gamestate):
        gamestate.food += 1            # 只重写变化的那一步
```
`Insect.action` 抛 `NotImplementedError` 是「抽象方法」的惯用写法，强制子类实现。

**④ 易错点与考试重点**
- **对象间循环引用时的属性修改同步问题**：`insect.place` 与 `place.insects` 必须同时维护，只改一边就会出现「蚂蚁在战场上但战场里没有这只蚂蚁」的不一致状态。
- **子类方法未正确维护继承体系下的实例状态**：重写 `action` 时忘了 `self.armor`/`self.place` 的更新，前面的测试能过、后面的过不了。
- 应试提醒：Project 3 的每个 `Ant`/`Bee` 子类都只覆盖**差异行为**，看到自己写了大段重复代码，就是抽象没做对。

---

# 第四模块：函数式编程与解释器（Lecture 26–33）

## Lecture 26 · Midterm 3 Review（考点清单）

**① 核心主题与目标**
复习 OOP、属性查找、`nonlocal` 可变状态、生成器与算法效率，为 MT3 收网。考点地图，不是新课。

**② 考点清单（按分值排）**
1. **继承链中的属性遮蔽与方法覆盖推演**（配合 Lecture 20/21 的查找规则）。
2. **`nonlocal` 与可变对象的环境图**（mutation vs reassignment）。
3. **生成器的暂停/恢复执行追踪**，含多层 `yield from`。
4. **复杂度分析**：给代码判 Big-O、给指数算法加记忆化。

**③ 三类典型题**
```python
# ① 继承链属性查找：问 a.interest / Account.interest 各是什么
class Account:
    interest = 0.02
class Savings(Account):
    interest = 0.03
    def __init__(self, holder, rate=interest):     # 注意默认参数在定义时求值！
        self.rate = rate
# 陷阱：rate 的默认值取自定义时的 interest（0.03），之后改类属性不影响它

# ② nonlocal 状态追踪
def counter():
    n = 0
    def tick():
        nonlocal n
        n += 1
        return n
    return tick
c1, c2 = counter(), counter()
>>> c1(), c1(), c2()
(1, 2, 1)         # 每个 counter() 调用有独立帧

# ③ 生成器状态推演
def gen(n):
    for i in range(n):
        yield i * 2
>>> list(gen(3)), list(gen(3))     # 新建生成器，能重跑
([0, 2, 4], [0, 2, 4])
>>> g = gen(3)
>>> list(g), list(g)
([0, 2, 4], [])                    # 同一个生成器耗尽后再取是空的
```

**④ 易错点与考试重点**
- **生成器函数多次实例化时的独立状态混淆**：`g = gen(3); list(g); list(g)` 第二次是空列表，因为迭代器一次性。
- **`nonlocal` 作用域查找越界**：只能绑定**已存在的**外层函数变量；外层没有该名字就报 `SyntaxError: no binding for nonlocal 'x' found`。
- **默认参数在函数定义时求值**（见上例 `rate=interest`）——这个坑在 MT3 里常作为隐藏陷阱。

## Lecture 27 · Functional Programming

**① 核心主题与目标**
引入函数式编程范式，并开始学 Gleam：无副作用、纯函数、静态类型。

**② 主要知识点拆解**
- **纯函数与无副作用**：同样输入永远同样输出，不改外部世界——可测、可缓存、可并行。
- **Gleam 的语言特点**：强类型 + 静态类型推导；编译到 Erlang/JavaScript；**没有 `while` 循环**，用递归代替。
- **一等函数与高阶函数在 FP 中的重构应用**：`map` / `filter` / `fold` 式的组合代替逐个改元素。
- **不可变是默认值**：变量一旦绑定不能重新赋值。
- **类型标注语法**：`pub fn name(x: Int) -> Int { ... }`。

**③ 典型应用/代码示例说明**
```gleam
pub fn add_one(x: Int) -> Int {
  x + 1
}

pub fn apply_twice(f: fn(Int) -> Int, x: Int) -> Int {
  f(f(x))
}

pub fn compose(f: fn(b) -> c, g: fn(a) -> b) -> fn(a) -> c {
  fn(x) { f(g(x)) }
}
```
⚠️ **Gleam 的坑**：整数与浮点用**不同的运算符**——`+`/`-`/`*` 只用于 `Int`，浮点必须写 `+.`/`-.`/`*.`。字符串拼接用 `<>`。用错直接编译不过。

**④ 易错点与考试重点**
- **从 Python 的可变思维向 Gleam 不可变思维转变**：`x = x + 1` 在 Gleam 里是**新绑定**（实际上同名重绑定会警告/不允许），习惯上要改成递归或 `let` 新名字。
- 静态类型声明与类型推导语法适应：函数签名里的 `->` 与 Python 的 `:` 别混。
- 写 Gleam 的函数时，**类型签名先写对**，编译器会帮你把剩下的错挑出来。

## Lecture 28 · Algebraic Data Types

**① 核心主题与目标**
掌握代数数据类型与模式匹配，在函数式语言里构建强类型的数据抽象。

**② 主要知识点拆解**
- **积类型（product types）**：字段的「与」组合，如 `Rectangle(width, height)`。
- **和类型（sum types）**：变体的「或」组合，如 `Circle | Rectangle`。
- **自定义类型与变体**：`type Shape { ... }`，变体名可带标注字段。
- **模式匹配（`case`）**：按结构解构并分支。
- **`Option` / `Result`**：用类型消灭「可能是空」的隐式假设，`None`/`null` 不再需要。

**③ 典型应用/代码示例说明**
```gleam
type Shape {
  Circle(radius: Float)
  Rectangle(width: Float, height: Float)
}

pub fn area(shape: Shape) -> Float {
  case shape {
    Circle(radius) -> 3.14159 *. radius *. radius
    Rectangle(width, height) -> width *. height
  }
}
```
`Result` 处理可能失败的计算：
```gleam
pub fn safe_div(a: Int, b: Int) -> Result(Int, String) {
  case b {
    0 -> Error("division by zero")
    _ -> Ok(a / b)
  }
}
```

**④ 易错点与考试重点**
- **模式匹配时漏掉某种可能性（非穷举匹配错误）**：Gleam 的 `case` 要求穷举；漏一个变体编译器直接报错——这是静态类型的红利，也是从 Python 转过来最容易忘的地方。
- **嵌套 ADT 的递归解构**：`case` 里再套 `case`，注意每个分支都要覆盖。
- 浮点运算别忘 `*.`；用 `*` 会因类型不匹配编译失败。

## Lecture 29 · Immutable Data

**① 核心主题与目标**
理解不可变数据结构的持久性与递归操作模式：更新靠「造新结构」，效率靠结构共享。

**② 主要知识点拆解**
- **不可变列表**：Gleam 的 `List` 是链式结构，头部插入 `O(1)`，尾部追加 `O(n)`。
- **结构共享（structural sharing）**：在头部加元素不复制原列表，新列表与原列表**共享尾部**。
- **列表模式匹配**：`[]` 匹配空表，`[first, ..rest]` 拆头拆尾。
- **递归代替循环**：没有 `while`，遍历全部靠递归 + 模式匹配。
- **尾递归优化（TCO）**：只有**尾调用**才被优化成循环，不会爆栈。

**③ 典型应用/代码示例说明**
```gleam
pub fn sum_list(items: List(Int)) -> Int {
  case items {
    [] -> 0
    [first, ..rest] -> first + sum_list(rest)
  }
}
```
⚠️ **这里要点破一处矛盾**：上一版讲义把「尾递归优化」写在这一讲的标题下，但上面这个 `sum_list` **不是尾递归**——`sum_list(rest)` 的返回值还要参与 `+`，所以它处在非尾位置。列长了会爆栈。真正尾递归的写法要加累加器：
```gleam
pub fn sum_list(items: List(Int)) -> Int {
  sum_acc(items, 0)
}

fn sum_acc(items: List(Int), acc: Int) -> Int {
  case items {
    [] -> acc
    [first, ..rest] -> sum_acc(rest, acc + first)   // 尾位置，可被优化成循环
  }
}
```
结构共享示例：
```gleam
let xs = [2, 3, 4]
let ys = [1, ..xs]     // 不复制 xs，ys 的尾巴直接指向 xs
// xs 仍然是 [2, 3, 4]
```

**④ 易错点与考试重点**
- **习惯 Python 列表的原地修改（`.append()`），在不可变结构里忘了要用返回的新对象**——Gleam 里没有 `.append()`，必须 `[..xs, x]` 并**接收返回值**。
- **递归没写终止基**：`case` 分支漏了 `[] -> ...` 就编译不过（穷举检查），但**逻辑上的终止条件**（比如该停的规模）还得自己想清楚。
- 记一条判据：**调用是不是出现在函数体的最后一个位置？** 是则尾递归可优化，否则会堆栈。

## Lecture 30 · Interpreters

**① 核心主题与目标**
剖析解释器的架构与执行循环：计算机是怎么「读懂并运行」一段代码的。

**② 主要知识点拆解**
- **REPL 循环**：Read（读入一串字符）→ Eval（求值）→ Print（打印结果）→ Loop（回到开始）。
- **词法分析（lexer/tokenizer）与语法分析（parser）**：字符流 → token 流 → 抽象语法树（AST）。
- **AST 与「表达式的表示」**：`['+', 1, 2]` 这样的嵌套列表本身就是一棵树。
- **Eval/Apply 核心双环**：`eval` 求值表达式，遇到函数调用转 `apply`；`apply` 建立新帧、执行函数体，体内表达式又回 `eval`。
- **环境**：解释器的环境帧模型，与 Lecture 5 的环境图是同一套东西。

**③ 典型应用/代码示例说明**
61A 的 Calculator 解释器骨架：
```python
def calc_eval(exp):
    if isinstance(exp, (int, float)):
        return exp
    elif exp[0] == '+':
        return calc_eval(exp[1]) + calc_eval(exp[2])
    elif exp[0] == '*':
        return calc_eval(exp[1]) * calc_eval(exp[2])

>>> calc_eval(['+', 1, ['*', 2, 3]])
7
```
Eval/Apply 双环示意（以 Scheme 解释器为例）：
```text
scheme_eval(expr, env):
  数字/符号 → 直接返回 / 在 env 里查
  组合式   → 先 eval 运算符，再 eval 各操作数，然后 apply
scheme_apply(proc, args):
  内建过程 → 直接调
  用户过程 → 新建帧 + 把形参绑到 args + 对函数体逐句 eval
```
**两条环咬在一起**：`eval` 里调 `apply`，`apply` 里又调 `eval`。递归深度就是程序的嵌套深度。

**④ 易错点与考试重点**
- **期末考试重难点！区分表达式本身的语法树表示与其求值后的结果**：`['+', 1, 2]` 是**数据**（一棵树），`3` 是**求值结果**。混淆二者是所有解释器题失分的总源头。
- **解释器环境帧的建立过程**：`apply` 建帧时，parent 指向过程定义处的环境（不是调用处）——**又是 Lecture 5 的词法作用域**，一通百通。
- 建议做法：拿到解释器题先画「谁调谁」的环，再往环上填代码。

## Lecture 31 · Coding Agents

**① 核心主题与目标**
探讨 LLM 与 AI 编程智能体在代码生成、软件构建与自动调试中的前沿应用。

**② 主要知识点拆解**
- **智能体的思考-工具调用循环**：Prompt（提要求）→ Code（生成代码）→ Test（跑测试）→ Fix（按失败信息改）→ 回到第二步。
- **工具调用**：智能体之所以比「聊天模型」强，是因为它能读文件、跑命令、看报错。
- **代码重构与自动化测试生成**：让模型先生成测试，再用测试约束它的实现。
- **能力边界**：AI 在程序分析与符号计算上仍有硬限制，尤其缺乏「全程一致的全局假设」。
- **和本课的关系**：Lecture 5 的环境图、Lecture 24 的复杂度、Lecture 37 的测试，正是评估 AI 输出的工具。

**③ 典型应用/代码示例说明**
智能体循环的伪代码形态：
```text
goal = "让所有 doctest 通过"
loop:
    code   = model(prompt + 当前代码 + 上次报错)
    result = run_tests(code)              # doctest / unittest
    if result.ok: 结束
    else: 把失败信息塞回 prompt，继续
```
关键点：**循环里必须有个外部的客观判据**（测试/断言），否则模型只会「自我感觉良好」地改。

**④ 易错点与考试重点**
- **理解 AI 生成代码的潜在逻辑漏洞**——它写得像对的，边界条件常常是错的（空列表、`None`、越界）。
- **如何通过规范的单元测试与断言约束 AI 输出**：把 docstring 例子当合同，让 AI 去满足它，而不是让 AI 告诉你「这段代码是对的」。
- 反向提醒：本讲不是「让 AI 替你写作业」的许可，期末照样手写。

## Lecture 32 · Browsers

**① 核心主题与目标**
了解浏览器的工作机制：前端执行环境、DOM 树与跨语言计算。

**② 主要知识点拆解**
- **渲染管道（rendering pipeline）**：解析 HTML → 构建 DOM 树 → 计算样式 → 布局 → 绘制。
- **DOM 就是一棵树**：与 Lecture 15 的 `Tree` 完全同构，`branches` 换成 `children`。
- **JavaScript / TypeScript 执行引擎**：TS 增加静态类型，编译期报错，运行前就把一类错消掉。
- **同步计算 vs 异步事件循环**：耗时操作不阻塞主线程，靠回调/`await` 回到「事件循环」。
- **Project 4：Animator**（含 TypeScript 版本）。

**③ 典型应用/代码示例说明**
树结构在前端里的样子（TypeScript）：
```typescript
interface TreeNode {
  label: string;
  children: TreeNode[];
}

function countNodes(node: TreeNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}
```
同步与异步的直觉差别：
```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
// 输出：A, C, B   —— 回调用的是事件循环，不阻塞后面的同步代码
```

**④ 易错点与考试重点**
- **混淆同步计算与异步事件循环**：`setTimeout(f, 0)` 不是「立刻执行」，而是「当前同步代码跑完后」执行。
- **TypeScript 静态类型系统与 Gleam 类型的异同**：TS 是结构类型 + 编译后擦除类型；Gleam 是名义类型 + 编译到强类型目标。两者都在编译期挡错，但运行时行为不同。

## Lecture 33 · Applications

**① 核心主题与目标**
总结第四模块：用综合案例展示函数式编程、类型系统与解释器在真实软件中的威力。

**② 主要知识点拆解**
- **函数式编程在数据流水线中的应用**：`map` / `filter` / `fold` 串成可组合的转换链。
- **解释器设计在 DSL 中的实践**：把「规则」写成数据，把「执行」写成 `eval`——配置引擎、查询语言都这么做。
- **抽象演化复盘**：从 Python 高阶函数 → 不可变数据 → 类型系统 → 解释器，是一条「越来越会描述自己」的路线。
- **架构组合**：类型系统管形状，解释器管行为，FP 管组合。

**③ 典型应用/代码示例说明**
数据流水线的可组合写法：
```python
def pipeline(*fns):
    def run(x):
        for f in fns:
            x = f(x)
        return x
    return run

clean = pipeline(
    lambda xs: [x for x in xs if x is not None],
    lambda xs: [str(x).strip() for x in xs],
)
>>> clean([None, ' a ', 'b', None])
['a', 'b']
```
解释器式 DSL 的骨架：
```python
def run_rule(rule, row):
    op, col, value = rule
    return {'==': lambda: row[col] == value,
            '>':  lambda: row[col] > value}[op]()
```

**④ 易错点与考试重点**
- **解释器与类型检查在复杂表达中的联合调试与边界推演**：表达式嵌套越深，越要先手画出 AST 再谈求值。
- 期末综合题的常见形态：给定一个小 DSL 的语法与求值规则，要求补全 `eval`。**先写 AST 示例，再写分支**。

---

# 第五模块：数据库、软件工程与总结（Lecture 34–40）

## Lecture 34 · Tables

**① 核心主题与目标**
引入声明式编程范式：描述「想要什么数据」，而不是「怎么一步步算出来」。

**② 主要知识点拆解**
- **命令式 vs 声明式**：命令式给步骤，声明式给条件。
- **数据表结构**：行（rows）、列（columns），每列有类型约束。
- **表创建与单表过滤**：`CREATE TABLE`、`INSERT`、`SELECT ... WHERE`。
- **与 Python 的分工**：SQL 负责「查什么」，Python 负责「拿结果去干什么」。
- **本质区别**：SQL 查的是**集合**，不保证顺序；要顺序必须显式 `ORDER BY`。

**③ 典型应用/代码示例说明**
61A 的做法是在 Python 里通过 `sqlite3` 操作内存数据库：
```python
from sqlite3 import connect

c = connect(':memory:').cursor()
c.execute('create table cities (name text, state text)')
c.execute('insert into cities values ("Berkeley", "CA")')
c.execute('insert into cities values ("Boston", "MA")')

for row in c.execute('select * from cities where state = "CA"'):
    print(row)
```
```text
('Berkeley', 'CA')
```
这段代码把「声明式的查询」嵌进「命令式的 Python」——`execute` 收下一句 SQL，回来的是一个**迭代器**（正是 Lecture 22 的东西）。

**④ 易错点与考试重点**
- **习惯命令式循环思维，一时难转变为 SQL 式声明查询思维**——这是本讲唯一的门槛。
- 别指望 `SELECT` 有序：不加 `ORDER BY` 的顺序是实现细节。
- 字符串字面量在 SQL 里用单引号；用双引号会被当作**列名**解释。

## Lecture 35 · SQL

**① 核心主题与目标**
掌握 `SELECT`、`WHERE`、`ORDER BY` 与 `JOIN`，完成多表数据的关联与提取。

**② 主要知识点拆解**
- **`SELECT` 三件事**：投影（选列）、过滤（`WHERE`）、排序（`ORDER BY`）。
- **多表连接**：`FROM a, b` 是**笛卡尔积**（危险）；`JOIN ... ON 条件` 才是连接。
- **自连接（self-join）**：同一张表取两个别名，用来表达「表内关系」（如学生之间的伙伴关系）。
- **别名（alias）**：`students AS a`，自连接时**必须**用别名区分两个副本。
- **本质一句话**：SQL 的 `JOIN` 就是「先做笛卡尔积，再按 `ON` 过滤」。

**③ 典型应用/代码示例说明**
```sql
SELECT a.name, b.location
FROM students AS a
JOIN classes AS b ON a.class_id = b.id
WHERE a.gpa > 3.5
ORDER BY a.name;
```
自连接：
```sql
SELECT a.name AS student, b.name AS buddy
FROM students AS a, students AS b
WHERE a.buddy_id = b.id;
```
注意第二条如果漏写 `WHERE`，得到的就是 学生数² 行的笛卡尔积。

**④ 易错点与考试重点**
- **期末考试重难点！自连接时的表别名混淆**：两个别名必须分别加在 `SELECT`、`FROM`、`WHERE` 的每一处列引用上，漏一处就会歧义报错或结果错。
- **连接条件漏写导致笛卡尔积膨胀**：`n × m` 行，数字一大就跑不动，也是「看起来没报错但结果全错」的典型。
- 顺序记牢：`FROM → WHERE → SELECT → ORDER BY`（写的时候 `SELECT` 在最前，执行顺序不是）。

## Lecture 36 · Aggregation

**① 核心主题与目标**
用聚合函数与分组对海量数据做汇总分析。

**② 主要知识点拆解**
- **聚合函数**：`COUNT`、`SUM`、`AVG`、`MIN`、`MAX`。
- **`GROUP BY`**：按某列分组，每个组算一次聚合。
- **`WHERE` vs `HAVING`**：`WHERE` 在**分组前**过滤单行；`HAVING` 在**分组后**过滤聚合结果。
- **非聚合列的合法性**：`SELECT` 里的非聚合列**必须**出现在 `GROUP BY` 里。
- **执行顺序**：`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY`。

**③ 典型应用/代码示例说明**
```sql
SELECT department, COUNT(*) AS num_employees
FROM staff
GROUP BY department
HAVING COUNT(*) > 5;
```
`WHERE` 与 `HAVING` 的对照：
```sql
-- 先剔掉实习/离职（分组前，逐行过滤），再按部门汇总，最后只留人多的部门
SELECT department, AVG(salary) AS avg_salary
FROM staff
WHERE status = 'active'
GROUP BY department
HAVING COUNT(*) > 5;
```

**④ 易错点与考试重点**
- **混淆 `WHERE`（分组前过滤单行）与 `HAVING`（分组后过滤聚合组）**——标答级考点。判据：过滤条件是**行级**还是**组级**？
- **在 `SELECT` 中包含既未分组也未聚合的非法列**：`SELECT department, name, COUNT(*) ... GROUP BY department` 里的 `name` 就是非法的（一个组里有很多 `name`，取哪个？）。
- `COUNT(*)` 数所有行；`COUNT(col)` 跳过该列的 `NULL`——两者结果常常不同。

## Lecture 37 · Software Testing

**① 核心主题与目标**
学习质量保证手段：单元测试、断言与测试驱动开发。

**② 主要知识点拆解**
- **TDD（测试驱动开发）思想**：先写测试用例，再实现功能代码。
- **`doctest`**：把交互式例子写进 docstring，直接当测试跑。
- **`unittest`**：类风格的测试框架，适合组织大量用例。
- **`assert` 语句**：在代码内部声明「这里必定为真」，不成立即抛 `AssertionError`。
- **边界值测试（edge cases）**：零、负数、空容器、单元素。
- **覆盖率**：跑过的代码比例，但覆盖率高 ≠ 测得好。

**③ 典型应用/代码示例说明**
```python
def square(x):
    """Return x squared.

    >>> square(3)
    9
    >>> square(-2)
    4
    >>> square(0)
    0
    """
    return x * x
```
跑 doctest：
```bash
python -m doctest square.py -v
```
`assert` 的两种用法——**契约**（前置条件）与**后置条件**：
```python
def average(nums):
    assert len(nums) > 0, 'average of empty sequence'
    return sum(nums) / len(nums)
```

**④ 易错点与考试重点**
- **忽略极值（零、负数、空链表/空树）引起的边界测试遗漏**——见 Lecture 17 的「先列四类边界」。
- doctest 的期望输出必须**逐字符一致**（含空格与引号），多一个空格就失败。
- 测试的判据要**客观**：`print` 出来的东西没法自动判定，返回值才能。

## Lecture 38 · Software Tracing

**① 核心主题与目标**
掌握动态追踪、调用栈分析与异常处理，把「程序为什么不对」变成可观测的问题。

**② 主要知识点拆解**
- **异常处理控制流**：`try` 监视代码块，`except` 捕获匹配的异常，`finally` **无论如何都执行**。
- **异常传播**：本级不处理就沿调用栈向上抛，直到有人接住或程序终止。
- **调用栈（call stack）分析**：报错的 traceback 就是从抛出点到 `main` 的完整路径。
- **日志与状态追踪**：在关键位置记录变量状态，比反复重跑快得多。
- **`assert` 作为调试器**：把「我以为是这样的」写成断言，错了立刻停在该处。

**③ 典型应用/代码示例说明**
```python
try:
    result = 10 / n
except ZeroDivisionError:
    result = 0
finally:
    print("done")          # 无论是否出错都执行
```
三个陷阱示例：
```python
# ① 裸 except 吞掉一切，包括自己代码的 TypeError
try:
    do_something()
except:                    # ✗ 连 Ctrl-C 之外的所有异常都吞了
    pass

# ② finally 里 return 会覆盖 try 里的 return
def f():
    try:
        return 1
    finally:
        return 2           # 实际返回 2

# ③ except 顺序：先写具体的，后写宽泛的
try:
    ...
except ValueError:         # ✓ 具体的在前
    ...
except Exception:          # 宽泛的在后
    ...
```

**④ 易错点与考试重点**
- **过度宽泛地捕获所有异常（空 `except:` / `except Exception`）**，导致真正的逻辑 bug 被隐蔽掩盖——这是最常被批的坏习惯。
- `finally` 一定会执行，且**其中的 `return` 会覆盖 `try` 里的 `return`**——反直觉，常考。
- 调试动作：拿到 traceback 先看**最下面那一行**（真正的抛出点），不是最上面。

## Lecture 39 · Ethics

**① 核心主题与目标**
探讨技术背后的社会责任：数据隐私、算法偏见与自动化决策的伦理红线。

**② 主要知识点拆解**
- **数据隐私与安全**：用户数据收集的边界、最小必要原则、合规要求。
- **算法偏见（algorithmic bias）**：训练数据里的历史偏差会被模型学走，并在自动化决策中放大。
- **自动化决策的社会影响**：信贷、招聘、住房等场景中，模型输出直接影响人的机会。
- **可解释性与问责**：无法解释的决策难以被申诉，这是工程问题也是伦理问题。
- **技术中立性是个幻觉**：设计选择本身就承载价值判断。

**③ 典型应用/代码示例说明**
以「招聘筛选模型」为例做伦理评估：
```text
① 数据来源：历史录用的简历——历史本身可能已存在偏见
② 标签选择：把「是否被录用」当作正确标签，等于把历史偏见固化为目标
③ 特征选择：邮编、姓名、毕业院校常与受保护属性高度相关
④ 评估指标：只看总体准确率会掩盖某一群体的系统性劣化；
            需要分群体看假阳性/假阴性率
⑤ 部署与申诉：决策需可解释、可申诉
```

**④ 易错点与考试重点**
- **缺乏对技术社会效应的多维度审视，单纯从工程角度忽略伦理风险**。
- 关键分辨力：**「这个模型准不准」和「这个模型该不该用」是两个问题**，工程指标回答不了后者。
- 记住一个具体抓手：分群体看误差率，是识别偏见最直接的技术手段。

## Lecture 40 · Conclusion

**① 核心主题与目标**
全面复盘四大编程范式，并给出后续学习路线。

**② 主要知识点拆解**
- **四大范式**：函数式（高阶函数 / 不可变）、面向对象（类 / 继承）、解释器（eval/apply）、声明式（SQL / 表）。
- **统一主线**：整门课都在讲「抽象」——用越来越强的抽象能力描述计算（`SICP` 的书名就是答案：**Structure and Interpretation of Computer Programs**）。
- **Homework 10（Finale）**：最后的综合挑战。
- **后续路线**：CS 61B（数据结构与算法）→ CS 61C（计算机系统与体系结构）。
- **回望自己**：从 Lecture 1 的 `2 + 3` 到 Lecture 35 的 `JOIN`，走的是同一条「抽象演化」的路。

**③ 典型应用/代码示例说明**
一张对照表把范式串起来：

| 范式 | 代表手段 | 本课讲次 | 核心问题 |
| --- | --- | --- | --- |
| 函数式 | 高阶函数、lambda、纯函数 | L4、L22–L23、L27–L29 | 怎么组合计算 |
| 面向对象 | class、继承、属性查找 | L18–L21、L25 | 怎么组织状态与行为 |
| 解释器 | REPL、AST、eval/apply | L30、L33 | 怎么描述并执行语言 |
| 声明式 | 表、SELECT、GROUP BY | L34–L36 | 怎么描述想要什么 |

**④ 易错点与考试重点**
- **期末终极大考（Final Exam）是全课程知识点综合串联**：环境图 + 类 + 生成器 + 复杂度 + SQL，常在一道大题里同时出现。
- 复习策略：**按抽象层级纵向串**（函数 → 数据结构 → 类 → 解释器 → 数据库），比按讲次横向背更牢。
- 最后一件事：把 Project 1–4 的代码重读一遍，期末题与项目设计高度相关。
