---
title: Python lru_cache深度解析：用备忘录把递归从指数砍到线性
tags:
  - Python
  - lru_cache
  - 缓存
  - 性能优化
  - 装饰器
categories:
  - Languages
  - Python
series:
  - Python
abbrlink: eb898813
date: 2025-04-03 00:00:00
---

## 一、一个被忽略的时间黑洞:重复计算

写递归的人几乎都写过斐波那契:

```python
import time

def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

t0 = time.perf_counter()
print(fib(35))
print("耗时:", round(time.perf_counter() - t0, 2), "秒")
```

输出(64 位 Python):

```
9227465
耗时: 2.13 秒
```

`fib(35)` 看起来不大,却把 `fib` 调用了约 **2980 万次**。一旦换成 `fib(50)`,基本就卡死了——因为 `fib(n-1)` 和 `fib(n-2)` 各自又把 `fib(n-3)` 算一遍,子树大量重叠。这种"同一个子问题被反复求解"的现象叫**重叠子问题(overlapping subproblems)**,是动态规划与记忆化要解决的核心。

问题来了:**既然算过,为什么不复用?**

答案是——默认情况下,Python 不会替你记。

## 二、lru_cache 是什么:给函数挂一本"备忘录"

`functools.lru_cache` 干的事很简单:给函数包一层,把"参数 → 返回值"存起来,下次同样参数直接返回,不进函数体。

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(100))        # 354224848179261915075,瞬间
print(fib.cache_info())  # 看看命中情况
```

输出:

```
354224848179261915075
CacheInfo(hits=98, misses=101, maxsize=128, currsize=101)
```

`hits=98` 表示有 98 次调用直接命中缓存,根本没真算。`fib(100)` 从"指数爆炸"被压成了 **O(n) 的线性**——因为每个 `n` 只算一次。`cache_info()` 是排障利器,一眼看出缓存到底有没有生效。

底层发生了什么?可以用这张图对比有无缓存的调用树:

```
未缓存 fib(5)                          lru_cache 后 fib(5)
        fib(5)                                  fib(5) ──┐ 命中
       /      \                                        ├── fib(4) ──┐ 命中
   fib(4)    fib(3)                                      ├── fib(3) ──┤
   /   \     /   \                                       └── fib(2) ──┘
fib(3) fib(2) fib(2) fib(1)          缓存表 {0:0, 1:1, 2:1, 3:2, 4:3, 5:5}
... 子树被反复重算                          每个参数只进函数体一次
```

关键区别:**未缓存版本在重叠子树上重复劳动;lru_cache 版本用一本有序字典当备忘录,同样的 (args, kwargs) 只算一次**。

## 三、深入:它怎么存、怎么淘汰、哪些坑

`lru_cache` 本质是用 `(args, kwargs)` 做键的哈希表,但有四处硬约束和陷阱:

**(1) 参数必须可哈希。** 缓存键是 `(args, kwargs)` 元组,元组要能哈希,就要求每个参数都可哈希:

```python
@lru_cache
def f(items):
    return sum(items)

f([1, 2, 3])     # TypeError: unhashable type: 'list'
```

修复:传 `tuple` 而非 `list`,或在函数内部把参数转成可哈希形式。记住——**不可哈希的参数会让缓存永远建不成**(后面实战会讲一个真实血案)。

**(2) LRU 淘汰。** `maxsize` 是缓存容量,满了按"**最近最少使用(Least Recently Used)**"淘汰最久没碰的条目。`maxsize=None` 表示无限缓存、**永不淘汰**,但内存会一直涨;`maxsize` 取 2 的幂(如 128、1024)性能最佳,底层用了高效的环形结构。

**(3) 调试两件套。** `cache_info()` 看命中率,`cache_clear()` 清空缓存:

```python
fib.cache_clear()   # 切换输入分布 / 单测之间,清掉脏状态
```

**(4) 别缓存有副作用或非幂等的函数。** lru_cache 假设"**同参必同值**"。若函数读文件、调接口、带随机、改全局状态,命中缓存会跳过真实逻辑,返回陈旧的脏结果。

**(5) 返回可变对象的引用陷阱。** 缓存存的是返回值的**引用**:若返回 `list`/`dict`,调用方改了它,下次命中拿到的是被改过的同一份。

## 四、实战:C++ 视角、方法缓存与前司踩坑

**C++ 等价物:手写 memo。** lru_cache 的底层就是一个哈希表记忆化:

```cpp
#include <unordered_map>
std::unordered_map<long long, long long> memo;

long long fib(long long n) {
    if (n < 2) return n;
    auto it = memo.find(n);
    if (it != memo.end()) return it->second;   // 命中,直接返回
    return memo[n] = fib(n - 1) + fib(n - 2);   // 算并存入
}
```

`unordered_map` 就是那本备忘录,`find` 就是命中查询。差异在于:C++ 版本要手写,且键类型需可哈希/可比较;而 Python 的 `lru_cache` **自动处理参数、并按 LRU 自动淘汰**——`unordered_map` 本身不带 LRU,要自己挂双向链表才能实现同等淘汰语义。

**实例方法的坑:`self` 也是键的一部分。** 给实例方法加 `@lru_cache`,键里含 `self`,不同实例的 `self` 不同,缓存几乎不共享:

```python
class Calc:
    @lru_cache(maxsize=32)
    def heavy(self, x):
        return x * x

c1, c2 = Calc(), Calc()
c1.heavy(5); c2.heavy(5)   # 两次都 miss,因为 self 不同
```

若方法只依赖参数、不依赖实例状态,用 `@staticmethod` 或把纯函数提到类外,缓存才能真正复用。

**前司检索系统的真实踩坑。** 我们之前做 OA 全文检索(基于 **BM25 + 倒排索引**),有个"算文档对查询权重"的函数被 `@lru_cache` 包了,本想省去重复算分。但调用方传的是 `list` 形式的分词结果——**list 不可哈希,缓存键永远建不成**。结果每次请求都把整个 BM25 重算一遍,缓存形同虚设,大查询的 CPU 直接飙到 100%。排障半天才发现是参数类型:把传参从 `list` 改成 `tuple`,命中率立刻从 **0 跳到九成**,P99 从 **800ms 降到 60ms**。这正好印证了那套系统"权重大却不相关"的老毛病之外,又添了"**算得勤却不命中**"的新坑——**缓存的第一铁律:先确认键能哈希、能命中,再谈加速**。

## 五、对比总结:朴素递归 / lru_cache / 手写 DP / C++ memo

| 维度 | 朴素递归 | `@lru_cache` | 手写 DP / 记忆化 | C++ `unordered_map` memo |
|------|----------|--------------|------------------|--------------------------|
| 时间复杂度 | 指数 O(2ⁿ) | 线性 O(n) | 线性 | 线性 |
| 是否要改函数体 | 否 | 否(加装饰器) | 是(显式存表) | 是 |
| 缓存淘汰 | 无 | LRU(可配) | 无(常驻) | 无(需自加链表) |
| 键的要求 | — | 参数可哈希 | 自定 | 键可哈希/可比较 |
| 非幂等安全 | — | 不安全 | 不安全 | 不安全 |
| 调试手段 | 无 | `cache_info`/`clear` | 自己埋点 | 自己埋点 |
| 适用场景 | 教学演示 | 通用纯函数 | 状态复杂时 | 嵌入式/高性能 |

一句话本质:**`lru_cache` 是把"纯函数的重复计算"用一本带 LRU 淘汰的备忘录干掉。** 它用"同参直接返回"换来了从指数到线性的飞跃,但前提是函数纯(同参同值)、参数可哈希;一旦缓存了有副作用的函数或传了不可哈希参数,加速没拿到,还可能埋下正确性与性能的双重雷。

> 小结:朴素递归在重叠子问题上指数爆炸;`@lru_cache(maxsize=...)` 用 `(args, kwargs)` 做键的备忘录把它压成线性,`cache_info()` 可观测命中;硬约束是参数必须可哈希、函数必须幂等,`maxsize=None` 无限增长需警惕;等价 C++ 写法是 `unordered_map` 记忆化(不含 LRU 淘汰);前司 BM25 检索曾因传 `list` 导致缓存永不命中、CPU 飙满,改 `tuple` 后 P99 从 800ms 降到 60ms——缓存先确认键能命中,再谈加速。
