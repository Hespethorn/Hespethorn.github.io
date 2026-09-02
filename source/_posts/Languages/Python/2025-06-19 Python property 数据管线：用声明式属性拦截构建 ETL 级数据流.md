---
title: Python property 数据管线：用声明式属性拦截构建 ETL 级数据流
tags:
  - Python
  - property
  - 描述符
  - 数据管线
  - 高级特性
categories: [Languages, Python]
series: [Python]
abbrlink: py-property-pipeline
date: 2025-06-19
---

## 一、为什么“数据”需要先过一道管线，而不是裸字段

真实工程里，原始输入（接口返回的 dict、配置文件、CSV 行）往往很脏：字段类型不对、越界、缺失、需要单位换算、还要派生出新的指标。如果直接把脏值塞进对象字段，后面每一处使用都得重新做判空、判范围、判类型——坑多且分散。

**Python 的 `property` 不只是 getter/setter 的语法糖，它是在“属性访问这一刻”插入逻辑的能力**。这就天然适合做一条“访问即清洗 / 校验 / 派生 / 缓存”的数据管线：调用方写 `r.temp_c`、`r.heat_index`，看起来像读普通字段，背后却已经把脏数据挡在门外。

C++ 视角对照：C++ 没有语言级 `property`。要实现“访问即校验 + 派生”，要么手写一堆 `getX()/setX()`（啰嗦，且调用方要改写法），要么依赖 Qt 的 `Q_PROPERTY` 宏（仅 Qt 生态、需 moc 预处理），要么用 `operator>>` 做流式管线（在“读取时”校验，而非“访问属性时”）。Python 用 `@property` 把“管线节点”声明成普通属性访问，调用方无感——这是它在数据建模上很舒服的一点。

## 二、property 的三副面孔：只读、可写、可删 + 计算属性

最基础的用法是只读计算属性：

```python
class Person:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def full_name(self):
        # 不存字段，每次访问实时算
        return f"{self.first} {self.last}"

p = Person("Zhou", "Chengxin")
print(p.full_name)   # Zhou Chengxin
```

加上 setter / deleter 就成了可读写的“虚拟字段”：

```python
class Temperature:
    def __init__(self, celsius):
        self._c = celsius

    @property
    def celsius(self):
        return self._c

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("低于绝对零度")
        self._c = value

t = Temperature(25)
t.celsius = -300     # ValueError: 低于绝对零度
```

**要点**：`property` 把“一段逻辑”伪装成“一个字段”。读 `t.celsius` 触发 getter，写 `t.celsius = x` 触发 setter，调用方代码完全不变——这正是管线的入口。

## 三、把“访问即计算”升级成“访问即缓存”：下划线私有 + 懒加载

计算属性有个痛点：每次访问都重算，贵。解决法是经典的“私有字段存缓存 + 脏标记”：

```python
class Reading:
    def __init__(self, temp):
        self._temp = temp
        self._cached = None      # 缓存
        self._dirty = True       # 脏标记

    @property
    def temp(self):
        return self._temp

    @temp.setter
    def temp(self, value):
        self._temp = value
        self._dirty = True       # 原始值变了 → 缓存失效

    @property
    def heat(self):
        if self._cached is None or self._dirty:
            # 昂贵计算只在实际需要且缓存失效时才跑
            self._cached = self._temp * 1.8 + 32
            self._dirty = False
        return self._cached

r = Reading(25)
print(r.heat)   # 77.0（首次计算并缓存）
r.temp = 30
print(r.heat)   # 86.0（脏了，重算）
```

C++ 视角：C++ 里这套“懒加载 + dirty flag”得手写——维护一个 `bool dirty_` 和 `T cached_`，在 getter 里判断，setter 里置脏。没有语言内建的“属性即缓存”语义，样板代码更多。

## 四、描述符 + __set_name__：声明式字段校验层

`property` 适合“单字段逻辑”。当字段多、校验规则重复时，更优雅的是**描述符（descriptor）**——把“校验 + 规整”抽成一个可复用的类，挂在类属性上，所有实例共享。关键是描述符的 `__set_name__` 钩子：类体定义一结束，Python 自动把属性名告诉描述符，省去手写字符串。

```python
class Validated:
    """声明式校验描述符：赋值时拦截并规整。"""
    def __set_name__(self, owner, name):
        self.name = name              # 自动拿到属性名
        self.private = "_" + name     # 缓存对应的私有字段名

    def __init__(self, min_=None, max_=None, cast=float):
        self.min_, self.max_, self.cast = min_, max_, cast

    def __get__(self, obj, owner):
        return None if obj is None else getattr(obj, self.private)

    def __set__(self, obj, value):
        v = self.cast(value)          # 类型规整（脏字符串→数字）
        if self.min_ is not None and v < self.min_:
            raise ValueError(f"{self.name} 不能小于 {self.min_}")
        if self.max_ is not None and v > self.max_:
            raise ValueError(f"{self.name} 不能大于 {self.max_}")
        setattr(obj, self.private, v)
        obj._dirty = True             # 任何原始字段变化 → 派生缓存失效
```

`__set_name__` 让我们声明字段时只写一次规则，不用重复写字段名，是描述符组合成“校验层”的粘合剂。

## 五、实战：声明式数据管线（传感器读数 ETL）

把上面三层串起来：描述符做**校验层**、setter 做**转换层**、`property` getter 做**派生层 + 缓存**。一条脏数据进来，实例化即被清洗；访问派生指标时实时计算且缓存；改原始值后缓存自动失效。

```python
class Validated:
    def __set_name__(self, owner, name):
        self.name = name
        self.private = "_" + name

    def __init__(self, min_=None, max_=None, cast=float):
        self.min_, self.max_, self.cast = min_, max_, cast

    def __get__(self, obj, owner):
        return None if obj is None else getattr(obj, self.private)

    def __set__(self, obj, value):
        v = self.cast(value)
        if self.min_ is not None and v < self.min_:
            raise ValueError(f"{self.name} 不能小于 {self.min_}")
        if self.max_ is not None and v > self.max_:
            raise ValueError(f"{self.name} 不能大于 {self.max_}")
        setattr(obj, self.private, v)
        obj._dirty = True


class Reading:
    # 校验层：声明即生效，无需手写字段名
    temp_c = Validated(min_=-40, max_=85)
    humidity = Validated(min_=0, max_=100)

    def __init__(self, temp_c, humidity):
        self._dirty = True
        self._heat_index = None
        self.temp_c = temp_c       # 走描述符 __set__：校验+规整+置脏
        self.humidity = humidity

    @property
    def heat_index(self):
        """派生层：酷热指数（简化示意公式），计算较贵，缓存之。"""
        if self._heat_index is None or self._dirty:
            t, h = self.temp_c, self.humidity
            hi = 0.5 * (t + 61 + (t - 68) * 1.2 + h * 0.094)
            self._heat_index = round(hi, 2)
            self._dirty = False
        return self._heat_index

    @property
    def level(self):
        """派生分级：纯计算、无状态，实时即可。"""
        return "危险" if self.heat_index > 40 else ("预警" if self.heat_index > 30 else "正常")


# ---------- 脏数据进，干净对象出 ----------
r = Reading(temp_c=33.5, humidity=70)
print(r.temp_c, r.humidity)   # 33.5 70.0（已 cast 为 float）
print(r.heat_index)           # 首次计算并缓存
print(r.level)                # 正常
r.temp_c = 41.0               # setter 触发校验 + 置脏
print(r.heat_index)           # 缓存失效，重算
try:
    r.humidity = 150          # 越界 → 描述符拦截
except ValueError as e:
    print("拦截:", e)
```

输出：

```
33.5 70.0
29.84
正常
38.09
拦截: humidity 不能大于 100
```

**这条管线的流动长这样**（原始输入只碰一次校验，派生指标按需懒算、改值自动失效）：

<div align="center">
<svg width="640" height="200" viewBox="0 0 640 170" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="55" width="120" height="60" rx="8" fill="#e8f0fe" stroke="#3367d6" stroke-width="1.5"/>
  <text x="70" y="80" text-anchor="middle" font-size="13" fill="#1a1a1a">原始输入</text>
  <text x="70" y="100" text-anchor="middle" font-size="11" fill="#555">temp/humidity</text>
  <line x1="130" y1="85" x2="180" y2="85" stroke="#3367d6" stroke-width="2"/>
  <rect x="180" y="55" width="120" height="60" rx="8" fill="#fef7e0" stroke="#f9ab00" stroke-width="1.5"/>
  <text x="240" y="80" text-anchor="middle" font-size="12" fill="#1a1a1a">校验层</text>
  <text x="240" y="100" text-anchor="middle" font-size="10" fill="#555">描述符 __set__</text>
  <line x1="300" y1="85" x2="350" y2="85" stroke="#f9ab00" stroke-width="2"/>
  <rect x="350" y="55" width="120" height="60" rx="8" fill="#e6f4ea" stroke="#137333" stroke-width="1.5"/>
  <text x="410" y="80" text-anchor="middle" font-size="12" fill="#1a1a1a">转换层</text>
  <text x="410" y="100" text-anchor="middle" font-size="10" fill="#555">写入 _temp/_hum</text>
  <line x1="470" y1="85" x2="520" y2="85" stroke="#137333" stroke-width="2"/>
  <rect x="520" y="55" width="110" height="60" rx="8" fill="#fce8e6" stroke="#c5221f" stroke-width="1.5"/>
  <text x="575" y="80" text-anchor="middle" font-size="12" fill="#1a1a1a">派生层</text>
  <text x="575" y="100" text-anchor="middle" font-size="10" fill="#555">getter+懒缓存</text>
  <line x1="240" y1="115" x2="240" y2="145" stroke="#888" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="250" y="142" font-size="10" fill="#888">置脏 _dirty 回流 → 派生缓存失效</text>
</svg>
</div>


## 六、与 C++ 的终极对比 + 收尾

同样一套“校验 + 派生 + 缓存”的数据管线，不同语言实现成本差异明显：

| 维度 | Python property + 描述符 | C++ 手写 getter/setter | Qt Q_PROPERTY | C++ operator>> 流式 |
|------|--------------------------|------------------------|---------------|---------------------|
| 声明式 | ✅ 字段上直接声明规则 | ❌ 每个字段一对方法 | ⚠️ 需宏 + moc | ❌ 过程式拼接 |
| 调用方无感 | ✅ 像读普通属性 | ❌ 要写 `getX()` | ✅ 像读属性 | ❌ 是 `in >> x` |
| 校验位置 | 赋值即校验 | 手写于 setter | setter 内 | 读取时 |
| 派生 + 缓存 | property getter + 脏标记 | 手写 dirty flag | NOTIFY + 手写 | 不适用 |
| 生态依赖 | 仅标准库 | 仅标准库 | 绑定 Qt | 仅标准库 |

**🐾 小结**：`property` 的真正威力不在“少写两个方法”，而在它把**数据血缘（清洗→校验→派生→缓存）收敛成属性访问这一件事**。C++ 没有语言级 property，要么接受啰嗦的手写 getter/setter，要么绑定 Qt 的 `Q_PROPERTY`，要么退回到 `operator>>` 的流式管线——都能做，但“声明即管线”的优雅度差了一截。在 Python 里做配置解析、传感器接入、ETL 行建模时，优先用“描述符做校验层 + property 做派生/缓存层”的组合，能让脏数据在入口处就被消化干净。
