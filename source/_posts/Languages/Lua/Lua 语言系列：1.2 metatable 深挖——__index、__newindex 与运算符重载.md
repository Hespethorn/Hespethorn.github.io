---
title: Lua 语言系列：1.2 metatable 深挖——__index、__newindex 与运算符重载
tags:
  - Lua
  - metatable
  - 元方法
  - 运算符重载
categories: [Languages, Lua]
series: [Lua]
abbrlink: lua0102
date: 2026-09-04
---

你写过这样的需求吗：查不到的配置项要有默认值；这张表不许别人改；两个"向量"要能用 `+` 相加、用 `==` 比较。

在 C++ 里，这些分别对应——给类写 getter 兜底、`const` 或私有成员、`operator+` 与 `operator==` 重载。在 Python 里是 `__getattr__`、`__setattr__`、`__add__`、`__eq__`。

而在 Lua 里，它们**全部是同一件事**：给一张表挂上一张**元表（metatable）**，在元表里写下双下划线开头的**元方法**。

Lua 没有 `class` 关键字，也没有运算符重载语法——**所有"让一张表拥有行为"的能力，都收敛到了这一张元表里**。本篇把它拆到底：查、写、运算、调用、打印、销毁，每一条路径上元表站在哪里，以及那些足以让程序静默出错的坑。

<div align="center">
<svg viewBox="0 0 680 380" xmlns="http://www.w3.org/2000/svg">
<rect width="680" height="380" fill="#ffffff"/>
<text x="340" y="28" font-size="16" fill="#1a1a1a" text-anchor="middle" font-weight="bold">元表拦在什么位置：读路径与写路径</text>
<text x="60" y="62" font-size="13" fill="#b3261e" font-weight="bold">读：t[k]</text>
<rect x="60" y="76" width="150" height="52" rx="8" fill="#fde8e8" stroke="#b3261e" stroke-width="1.5"/>
<text x="135" y="98" font-size="13" fill="#1a1a1a" text-anchor="middle" font-weight="bold">rawget(t, k)</text>
<text x="135" y="118" font-size="12" fill="#666" text-anchor="middle">自己身上有吗？</text>
<line x1="210" y1="102" x2="290" y2="102" stroke="#b3261e" stroke-width="2"/>
<text x="250" y="94" font-size="12" fill="#b3261e" text-anchor="middle">nil</text>
<rect x="290" y="76" width="170" height="52" rx="8" fill="#e6f4ea" stroke="#137333" stroke-width="1.5"/>
<text x="375" y="98" font-size="13" fill="#1a1a1a" text-anchor="middle" font-weight="bold">metatable.__index</text>
<text x="375" y="118" font-size="12" fill="#666" text-anchor="middle">表：去那张表找</text>
<line x1="135" y1="128" x2="135" y2="160" stroke="#137333" stroke-width="2"/>
<text x="160" y="150" font-size="12" fill="#137333">非 nil：直接返回</text>
<rect x="60" y="160" width="150" height="44" rx="8" fill="#e6f4ea" stroke="#137333" stroke-width="1.5"/>
<text x="135" y="187" font-size="13" fill="#1a1a1a" text-anchor="middle">返回值（读路径结束）</text>
<text x="500" y="98" font-size="12" fill="#666">函数：调用 f(t, k)</text>
<text x="500" y="118" font-size="12" fill="#666">都没有 → 返回 nil</text>
<text x="60" y="236" font-size="13" fill="#1e63d6" font-weight="bold">写：t[k] = v</text>
<rect x="60" y="250" width="150" height="52" rx="8" fill="#e8f0fe" stroke="#1e63d6" stroke-width="1.5"/>
<text x="135" y="272" font-size="13" fill="#1a1a1a" text-anchor="middle" font-weight="bold">rawget(t, k) ~= nil ?</text>
<text x="135" y="292" font-size="12" fill="#666" text-anchor="middle">键是否已存在？</text>
<line x1="135" y1="302" x2="135" y2="334" stroke="#137333" stroke-width="2"/>
<text x="160" y="326" font-size="12" fill="#137333">存在：直接写，不惊动元表</text>
<rect x="60" y="334" width="300" height="38" rx="8" fill="#e6f4ea" stroke="#137333" stroke-width="1.5"/>
<text x="210" y="358" font-size="13" fill="#1a1a1a" text-anchor="middle">写入自身（__newindex 不触发）</text>
<line x1="210" y1="276" x2="300" y2="276" stroke="#1e63d6" stroke-width="2"/>
<text x="255" y="268" font-size="12" fill="#1e63d6" text-anchor="middle">不存在</text>
<rect x="300" y="250" width="230" height="52" rx="8" fill="#e8f0fe" stroke="#1e63d6" stroke-width="1.5"/>
<text x="415" y="272" font-size="13" fill="#1a1a1a" text-anchor="middle" font-weight="bold">metatable.__newindex</text>
<text x="415" y="292" font-size="12" fill="#666" text-anchor="middle">拦截！想真写入必须 rawset</text>
</svg>
</div>

## 一、`__index`：只在"自己没有"时才来找我

`__index` 是元表里最常用的字段，它只在**从表里读一个不存在的键**时被调用。它有两种形态——一张表，或一个函数。

```lua
-- 形态一：__index 指向一张表 → 查不到就去那张表里找
local proto = {kind = "animal", speak = function() return "..." end}
local dog = setmetatable({}, {__index = proto})

print(dog.kind)                  -- 自己没有，去 proto 找
dog.kind = "dog"                 -- 写进自己身上（此时不触发任何元方法）
print(dog.kind, rawget(dog, "kind"))
print(rawget(dog, "speak") == nil)   -- rawget 绕过元表，看真实存储
```

输出：

```
animal
dog	dog
true
```

`rawget(dog, "kind")` 返回 `"dog"`、`rawget(dog, "speak")` 返回 nil，说明：**继承来的字段从来不在实例身上，`__index` 只是一条"查不到时去别处看看"的兜底规则**。理解这一点，后面所有"继承"的怪现象都能解释。

再看函数形态——它更灵活，也因此藏着本系列第一个重量级坑：

```lua
local bad = setmetatable({}, {
    __index = function(t, k) return t[k] end   -- 致命：t[k] 又会触发 __index
})
print(pcall(function() return bad.x end))

-- 正确写法：用 rawget 自查，避免二次触发
local defaults = {host = "127.0.0.1", port = 6379}
local conf = setmetatable({}, {
    __index = function(t, k)
        local v = rawget(t, k)
        if v ~= nil then return v end
        return defaults[k]          -- 只有自己确实没有，才回退默认值
    end
})
print(conf.host, conf.port)
```

输出（`...` 是省略的文件名与行号，随运行环境变化）：

```
false	...: stack overflow
127.0.0.1	6379
```

为什么第一段会栈溢出？因为 `__index` 函数里的 `t[k]` 是一次**普通索引**，而 `t` 里没有 `k`，于是又去调用 `__index`，无限递归。**在元方法内部读写表，一律用 `rawget` / `rawset` 绕开元方法**——这是 Lua 元表编程的第一条纪律。

## 二、`__newindex`：赋值拦截，以及"键已存在就不触发"的坑

`__newindex` 管的是"写入一个键"。但它触发的条件极其反直觉：

```lua
local log = {}
local t = setmetatable({}, {
    __newindex = function(t, k, v)
        log[#log + 1] = k
        rawset(t, k, v)      -- 必须 rawset，否则值根本不会落进表里
    end
})

t.a = 1     -- 键不存在 → 触发 __newindex
t.a = 2     -- 键已存在（上一步 rawset 过）→ 不触发！
print(#log, table.concat(log, ","))
```

输出：

```
1	a
```

**`__newindex` 只在"这个键当前不存在"时触发。** 一旦键有了值，后续赋值就是普通写入，元方法完全不知情。想记录每一次写入，得让表永远"空着"（用代理表转发到另一张真实表，见本章末尾）。

它最适合的两件事：只读表，和代理转发。

```lua
-- 只读表：读走 __index，写直接报错
local function readonly(t)
    return setmetatable({}, {
        __index = t,
        __newindex = function() error("attempt to modify a read-only table", 2) end
    })
end

local cfg = readonly({host = "localhost"})
print(cfg.host)
print(pcall(function() cfg.host = "x" end))
```

输出：

```
localhost
false	...: attempt to modify a read-only table
```

还有个容易踩的点：`pairs` **只遍历表自身**，看不见 `__index` 指向的内容：

```lua
local defaults = {a = 1, b = 2}
local t = setmetatable({c = 3}, {__index = defaults})

local n = 0
for _ in pairs(t) do n = n + 1 end
print("pairs count:", n)
print("t.a via index:", t.a)
```

输出：

```
pairs count:	1
t.a via index:	1
```

`pairs` 只数出 1 个键（`c`），但 `t.a` 却读得到值。序列化、日志打印、深拷贝这类操作如果只依赖 `pairs`，会静默丢掉所有"继承"来的字段。

## 三、运算符元方法：一张表学会 `+`、`==`、`#`

算术与比较运算各有对应的元方法。先看一个完整例子：

```lua
local Vec = {}
Vec.__index = Vec
function Vec.new(x, y) return setmetatable({x = x, y = y}, Vec) end
function Vec.__add(a, b) return Vec.new(a.x + b.x, a.y + b.y) end
function Vec.__tostring(v) return ("Vec(%d, %d)"):format(v.x, v.y) end
function Vec.__len(v) return 2 end                       -- 维度
function Vec.__eq(a, b) return a.x == b.x and a.y == b.y end
function Vec.__lt(a, b)                                  -- 按模长比较
    return (a.x * a.x + a.y * a.y) < (b.x * b.x + b.y * b.y)
end

local a, b = Vec.new(1, 2), Vec.new(10, 20)
print(tostring(a + b))            -- 走 __add
print(a == Vec.new(1, 2))         -- 走 __eq
print(#a)                         -- 走 __len
print(a < b)                      -- 走 __lt
```

输出：

```
Vec(11, 22)
true
2
true
```

注意 `Vec.__index = Vec` 这行：它让实例能找到 `new` 等方法；而 `__add`、`__eq` 这些元方法本身就在元表 `Vec` 上，不需要 `__index` 也能被运算触发——**元方法的查找，和 `t[k]` 的查找，是两条不同的路**。

### 坑 1：`==` 会失去对称性

二元运算的元方法查找顺序是：**先看第一个操作数，没有再看第二个**。这会让 `==` 变得不对称：

```lua
local x = setmetatable({}, {__eq = function() return true end})
local y = setmetatable({}, {__eq = function() return false end})

print("x==y:", x == y)   -- 用 x 的元方法 → true
print("y==x:", y == x)   -- 用 y 的元方法 → false
```

输出：

```
x==y:	true
y==x:	false
```

同样的两个对象，换个顺序结果就变了。所以**同一个"类"的所有实例必须共享同一张元表**（也就是同一个 `__eq` 函数），否则相等性就是一团乱麻。

另外，`__eq` 还有个前提：**两边都是表（或都是 userdata），且不是同一个对象时才调用**。类型不同直接返回 false，连元方法都不看：

```lua
local z = setmetatable({}, {__eq = function() return true end})
print("z==0:", z == 0)   -- 类型不同，不调用 __eq
print("z==z:", z == z)   -- 同一个对象，原生相等，也不调用
```

输出：

```
z==0:	false
z==z:	true
```

### 坑 2：`<=` 别指望自动推导（版本差异，实测两版）

只定义 `__lt`，不定义 `__le`，然后用 `<=`——这在 Lua 5.2/5.3 上能跑（解释器用 `not (b < a)` 推导），在更新的版本上会直接报错：

```lua
local mt = {}
mt.__index = mt
function mt.__lt(a, b) return a.v < b.v end

local p = setmetatable({v = 1}, mt)
local q = setmetatable({v = 2}, mt)
print("p<q:", p < q)
print("p<=q:", pcall(function() return p <= q end))   -- 只定义了 __lt
```

实测输出（Lua 5.3）：

```
p<q:	true
p<=q:	true	true
```

同一段代码在 Lua 5.5 下，第二行变成：

```
p<=q:	false	...: attempt to compare two table values
```

**结论：需要 `<=` 就显式定义 `__le`。** 依赖"自动推导"的代码会在版本升级后静默从"能跑"变成"报错"，这是最难排查的一类坑——因为改的不是你的代码，是解释器。

### 坑 3：`#` 被 `__len` 劫持，真实长度要用 `rawlen`

```lua
local arr = setmetatable({1, 2, 3}, {__len = function() return 99 end})
print("#arr:", #arr)
print("rawlen:", rawlen(arr))
```

输出：

```
#arr:	99
rawlen:	3
```

`#` 对带 `__len` 的表返回的是元方法的结果（这里是 99），真实元素个数要用 `rawlen`。顺带一提：`__len` 对**表**生效是 Lua 5.2 才有的，5.1 里它只对 userdata 有效。

## 四、`__call` 与 `__tostring`：让表伪装成函数和字符串

`__call` 让一张表可以被"调用"，用来做带状态的函数对象再合适不过：

```lua
local counter = setmetatable({n = 0}, {
    __call = function(self, step)
        self.n = self.n + (step or 1)      -- 第一个参数就是表自己
        return self.n
    end
})
print(counter(), counter(), counter(10))
```

输出：

```
1	2	12
```

`__concat` 管 `..` 连接，参数顺序与表达式一致：

```lua
local W = {}
function W.__concat(a, b) return tostring(a) .. tostring(b) end
function W.__tostring(t) return t.v end

local w = setmetatable({v = "world"}, W)
print("hello " .. w)      -- a="hello "（字符串），b=w（表）
```

输出：

```
hello world
```

`__tostring` 决定 `print` / `tostring` 看到什么；而 `__metatable` 是个特殊字段——它不拦截任何操作，只用来**把元表藏起来**：

```lua
local account = setmetatable({balance = 100}, {
    __tostring = function(a) return ("Account(balance=%d)"):format(a.balance) end,
    __metatable = "protected"        -- 元表"锁"
})
print(account)
print(getmetatable(account))
print(pcall(setmetatable, account, {}))
```

输出：

```
Account(balance=100)
protected
false	cannot change a protected metatable
```

`getmetatable` 不再返回真元表，而是返回 `__metatable` 的值；谁再想 `setmetatable` 就报错。这是 Lua 里少数能做出"封装"的手段——但记住，`getmetatable` 只能防君子，`debug.getmetatable` 照样能拿到一切。

## 五、`__gc` 与元表链：能力边界在这里

`__gc` 是对象被回收时触发的终结器。表的 `__gc` 从 Lua 5.2 起支持，但它有三个硬约束，每一条都能让人调试半天：

```lua
-- ① 正常：元表在 setmetatable 时就带 __gc
local mt = {__gc = function(o) print("gc: " .. o.name) end}
local obj = setmetatable({name = "res"}, mt)
obj = nil
collectgarbage("collect")
print("after collect")

-- ② 事后补 __gc：无效！
local late = setmetatable({}, {})
getmetatable(late).__gc = function() print("late gc fired") end
late = nil
collectgarbage("collect")
print("late done")

-- ③ 对象还活着就不会触发
local keep = setmetatable({name = "alive"}, mt)
collectgarbage("collect")
print("still alive:", keep ~= nil)
keep = nil
collectgarbage("collect")
print("released")
```

输出：

```
gc: res
after collect
late done
still alive:	true
gc: alive
released
```

三条结论：

1. **`__gc` 必须在 `setmetatable` 那一刻就存在于元表里**，之后补进去的不会被登记（② 里 `late gc fired` 从未打印）。
2. **触发时机由 GC 决定，不是变量离开作用域的瞬间**——所以 `__gc` 不适合做文件句柄、锁这类需要确定性释放的资源管理（那要用 Lua 5.4 的 `<close>` 变量）。
3. 对象仍被引用时不会触发（③ 里 `keep` 还活着，`gc: alive` 到释放后才打印）。

### 元表链：多级查找与"继承"的极限

`__index` 可以指向另一张也有元表的表，于是形成查找链——这就是 Lua 的"继承"：

```lua
local Animal = {}
function Animal:speak() return "..." end

local Dog = setmetatable({}, {__index = Animal})
function Dog:speak() return "woof" end

local Puppy = setmetatable({}, {__index = Dog})
local p = setmetatable({}, {__index = Puppy})

print(p:speak())     -- 沿链往上找：Puppy 没有 → Dog 有 → 用 Dog 的
```

输出：

```
woof
```

而"子类覆盖"的本质，只是把值写进自己身上，把上游的挡住：

```lua
local Base = {kind = "base"}
Base.__index = Base
local inst = setmetatable({}, Base)
print("before:", inst.kind, rawget(inst, "kind"))
inst.kind = "own"                       -- 只落在实例自身，Base 不受影响
print("after:", inst.kind, rawget(inst, "kind"))
```

输出：

```
before:	base	nil
after:	own	own
```

**这就是元表"继承"的全部真相**：没有类、没有副本、没有私有，只有"读不到就顺着链往上问"。它带来三个必须知道的极限：

- **没有封装**：任何代码都能 `rawset` 改写、都能用 `debug.getmetatable` 看穿，`__metatable` 只是君子协定。
- **没有类型检查**：`Vec.__add` 拿到什么就加什么，传个字符串进来只会在 `a.x` 上报错，错误还在"错误的层次"。
- **链有代价**：每次字段缺失都要沿链走一遍；深链 + 高频访问是隐藏的性能陷阱（热路径上把用到的字段缓存到实例自身即可）。

## 六、对比表 + 🐾 小结

| 能力 | Lua（元表） | Python | C++ |
|------|-------------|--------|-----|
| 读缺失字段 | `__index`（表 / 函数） | `__getattr__` | 编译期成员，不存在即报错 |
| 拦截写入 | `__newindex`（仅键不存在时） | `__setattr__`（每次都触发） | 无（靠私有 + setter 约定） |
| 运算符重载 | `__add/__eq/__lt/__len/__concat` | `__add__/__eq__/__lt__/__len__` | `operator+` 等（编译期绑定） |
| 让对象可调用 | `__call` | `__call__` | `operator()` |
| 打印友好 | `__tostring`（5.4 另有 `__name`） | `__str__` / `__repr__` | `operator<<` |
| 析构 | `__gc`（时机不确定） | `__del__`（同样不确定） | 析构函数（确定性，RAII） |
| 继承 | `__index` 链（原型式） | class 继承（MRO） | class 继承（编译期） |

| 常用元方法 | 触发时机 | 备注 |
|------------|----------|------|
| `__index` | 读到不存在的键 | 表或函数；内部用 `rawget` 防递归 |
| `__newindex` | 写入**不存在**的键 | 内部用 `rawset`；已存在的键不触发 |
| `__add` 等算术 | 二元 / 一元运算 | 先查第一个操作数，再查第二个 |
| `__eq` / `__lt` / `__le` | 比较运算 | `__eq` 要求两边同为表/userdata；`__le` 可由 `__lt` 推导 |
| `__len` / `__concat` | `#` / `..` | 表的 `__len` 需 Lua 5.2+；真实长度用 `rawlen` |
| `__call` / `__tostring` | `t(...)` / `print(t)` | 让表伪装成函数 / 字符串 |
| `__gc` | 对象被回收 | 表需 Lua 5.2+；**必须 setmetatable 时就存在** |
| `__metatable` | `getmetatable` / `setmetatable` | 元表"锁"，防君子不防 `debug` |

| 高频坑 | 症状 | 解法 |
|--------|------|------|
| `__index` 里写 `t[k]` | 栈溢出 | 改用 `rawget(t, k)` |
| 以为 `__newindex` 每次都触发 | 第二次赋值没反应 | 想全程拦截就用代理表 + `rawset` 转发 |
| 两个实例的 `__eq` 不同 | `a==b` 与 `b==a` 结果相反 | 同类共享同一张元表 |
| `pairs` 看不到继承字段 | 序列化丢数据 | 序列化前显式展开 `__index` 链 |
| 事后给元表补 `__gc` | 终结器从不执行 | `setmetatable` 时就把 `__gc` 写进元表 |

🐾 **小结**：元表的全部秘密，是**"在表做不到的事上接管一次"**——读不到 key 时接管（`__index`）、写不存在的 key 时接管（`__newindex`）、做不了运算时接管（`__add`/`__eq`/`__len`）、被调用时接管（`__call`）、被回收时接管（`__gc`）。它不是类系统，而是一组**可插拔的钩子**：正因如此，Lua 用一个关键字都没加，就长出了对象、继承、运算符重载和资源终结。代价是这些钩子全靠约定维系——**用 `rawget`/`rawset` 防递归、同类共享一张元表、`pairs` 只看自身、`__gc` 必须当场登记**，记住这四条，元表就从"玄学"变成" predictable 的工具"。
