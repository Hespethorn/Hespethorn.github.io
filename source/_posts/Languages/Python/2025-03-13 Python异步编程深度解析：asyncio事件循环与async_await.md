---

title: Python异步编程深度解析：asyncio事件循环与async/await（及与多线程对比）
tags:
  - Python
  - 异步编程
  - asyncio
  - 协程
  - 并发
  - C++对比
categories: [Languages, Python]
series: [Python]
abbrlink: python-asyncio-deep-dive
date: 2025-03-13

---

## 一、引子：为什么 `time.sleep` 会"卡死"整个服务

写过网络爬虫或高并发接口的人，迟早会撞上同一个问题：明明机器有 8 个核、网络在等 I/O，程序却像单车道一样，一个请求没回来，后面的全堵着。

先看一个"看似没问题"的代码：

```python
import time

def fetch(name, delay):
    time.sleep(delay)          # 模拟一次网络请求
    print(f"{name} 完成，耗时 {delay}s")

def main():
    for i in range(3):
        fetch(f"任务{i}", 1)

main()
```

输出：

```
任务0 完成，耗时 1s
任务1 完成，耗时 1s
任务2 完成，耗时 1s
# 总耗时约 3s
```

`time.sleep` 是**阻塞**的：线程睡着的这段时间，CPU 什么也干不了，后面的任务只能干等。三个任务串行，总耗时 = 1+1+1。

如果你的服务同时要伺候一万个连接，每个连接都在等数据库或对方接口，这种"一人阻塞、全员等待"的模型会直接把吞吐打趴下。

解决思路有两条路：

- **多线程 / 多进程**：开很多条执行流，靠操作系统调度去"掩盖"等待。
- **异步（async / await）**：在**单线程内**用"协作式多任务"把等待时间腾出来给别人用。

这篇主讲第二条路——`asyncio`，以及它和第一条路到底差在哪。

---

## 二、核心概念：`async`/`await` 到底改变了什么

一句话：**`async def` 定义的函数不再"立即执行"，而是返回一个"协程对象（coroutine）"；只有被事件循环驱动，它才会真正往前跑。**

```python
import asyncio

async def fetch(name, delay):
    await asyncio.sleep(delay)   # 关键点：await 主动"让出"控制权
    print(f"{name} 完成，耗时 {delay}s")

async def main():
    # 三个协程"并发"执行，谁 await 等待谁就先让位
    await asyncio.gather(
        fetch("任务0", 1),
        fetch("任务1", 1),
        fetch("任务2", 1),
    )

asyncio.run(main())
```

输出：

```
任务0 完成，耗时 1s
任务1 完成，耗时 1s
任务2 完成，耗时 1s
# 总耗时约 1s（三个任务重叠执行）
```

同样是三件事各花 1 秒，这里总耗时从 3 秒降到 1 秒。原因就在 `await asyncio.sleep(delay)` 这一行：

- **同步版** `time.sleep`：线程真的睡死，谁也叫不醒，CPU 空转。
- **异步版** `await asyncio.sleep`：当前协程**主动挂起**，把控制权交还给事件循环；事件循环转去执行别的就绪协程。等"睡眠"到点，再被唤醒继续。

这就是**协作式多任务**：不是操作系统强行切换线程，而是协程自己说"我要等了，你们先忙"。

### 三个必须分清的词

| 词 | 是什么 | 类比 |
|----|--------|------|
| 协程（coroutine） | `async def` 返回的对象，可暂停可恢复 | 一个"能中途让位"的函数 |
| 事件循环（event loop） | 不断检查"谁就绪了就跑谁"的调度器 | 一个永不疲倦的调度员 |
| 任务（Task） | 被事件循环"接管"的协程，包装成可调度单元 | 调度员手里的一张工单 |

---

## 三、深入：事件循环是怎么"调度"的

把事件循环想成一个 `while True` 的循环：

```python
# 伪代码，帮助理解，不是真实实现
while True:
    for task in 就绪队列:
        if task.该继续了():        # 比如它的 await 等待的 I/O 完成了
            task.往前走一步()
        else:
            task.保持挂起()        # 还在等，先跳过
```

`await` 的本质，是**在协程里插一个"暂停点"**：执行到 `await` 时，协程把"剩下的部分"打包成一个回调挂起，自己退出；等被等待的对象（比如定时器、socket 可读）就绪，事件循环再把控制权交还，协程从暂停点之后继续。

这就是为什么异步代码**必须全程非阻塞**：只要协程里混进一个 `time.sleep`、一个同步的重 CPU 计算，整个事件循环就被它占住，所有其他协程一起卡死——因为没人主动让位。

### 用 `asyncio.create_task` 显式并发

`gather` 是一次性等一组；更常见的写法是先把协程"登记"成任务，让它们立刻开始跑：

```python
import asyncio

async def worker(name, delay):
    print(f"{name} 开始")
    await asyncio.sleep(delay)
    print(f"{name} 结束")
    return name

async def main():
    # create_task 立即把协程交给事件循环调度（不等它跑完）
    t1 = asyncio.create_task(worker("A", 2))
    t2 = asyncio.create_task(worker("B", 1))
    t3 = asyncio.create_task(worker("C", 1.5))

    # 这里 main 自己 await，等三个任务都交差
    results = await asyncio.gather(t1, t2, t3)
    print("全部完成:", results)

asyncio.run(main())
```

输出：

```
A 开始
B 开始
C 开始
B 结束
C 结束
A 结束
全部完成: ['A', 'B', 'C']
```

注意 `B` 只睡 1 秒，比 `A`（2 秒）先结束——说明它们确实在**交错执行**，而不是谁先 `create_task` 谁就独占。

---

## 四、实战：异步爬虫 / 并发请求

异步最经典的用武之地，就是"同时发起一大堆 I/O 请求"。下面用 `aiohttp` 演示并发抓取（需 `pip install aiohttp`）：

```python
import asyncio
import aiohttp
import time

URLS = [
    "https://www.python.org",
    "https://www.openai.com",
    "https://www.github.com",
]

async def get(session, url):
    async with session.get(url) as resp:   # 异步上下文管理器
        await resp.text()                  # await 等待响应体
        return url, resp.status

async def main():
    start = time.perf_counter()
    async with aiohttp.ClientSession() as session:
        # gather 并发发起所有请求
        results = await asyncio.gather(*(get(session, u) for u in URLS))
    print(f"并发抓取耗时 {time.perf_counter() - start:.2f}s")
    for url, status in results:
        print(f"{url} -> {status}")

asyncio.run(main())
```

关键点：**三个 `session.get` 是真正同时发出去的**，总耗时约等于"最慢的那个请求"，而不是三者相加。如果是同步 `requests.get` 串行写，耗时会是三者之和。

### 注意两个"坑"

1. **别在协程里调阻塞函数。** 如果一定要跑重 CPU 任务，用 `await loop.run_in_executor(...)` 把它丢到线程池，避免卡住事件循环。
2. **`await` 要一路贯穿。** `async def` 里调别的协程忘了 `await`，拿到的是"没执行的协程对象"，什么也不会发生——这是新手最高频的 bug。

---

## 五、对比：asyncio vs 多线程 vs C++

### 5.1 与多线程对比

| 维度 | 多线程 | asyncio 异步 |
|------|--------|--------------|
| 切换成本 | 内核态切换，较重 | 用户态协作切换，极轻 |
| 并发规模 | 几百线程就吃力 | 单线程可挂上万协程 |
| 数据竞争 | 有（需锁） | 单线程内无抢占，天然无锁 |
| 适用场景 | CPU 密集 + I/O 混合 | I/O 密集（网络、磁盘）为主 |
| 调试难度 | 竞态难复现 | 回调地狱已用 `async/await` 化解 |

一句话：**I/O 密集、要高并发连接数，优先 asyncio；有重 CPU 计算，单靠异步没用，得上多进程或 `run_in_executor`。**

### 5.2 与 C++ 对照

C++ 没有内建的 `async/await` 语法糖（直到 **C++20 才引入协程**），而且它的协程是"无栈协程（stackless coroutine）"，更底层、更灵活，也更难用：

```cpp
// C++20 协程（最小示意，promise 类型需自己定义，略去样板）
#include <coroutine>
#include <chrono>

struct Task {
    struct promise_type {
        Task get_return_object() { return {}; }
        std::suspend_always initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_void() {}
        void unhandled_exception() {}
    };
    // ... 省略 operator co_await 等样板
};

Task async_sleep(std::chrono::seconds d) {
    // 真正的实现要把"等待"挂到某个调度器/IO 多路复用上
    co_return;   // co_await / co_return 是 C++20 协程关键字
}
```

对比之下，Python 的写法轻得多：

```python
async def async_sleep(d):
    await asyncio.sleep(d)   # 一句话搞定，调度器由 asyncio 提供
```

**差异本质**：
- Python 把"事件循环 + 调度 + 唤醒"整套基础设施打包好了，你只管写 `await`。
- C++20 协程只提供**语言级原语**（`co_await`/`co_yield`/`co_return` 和 `promise_type`），**事件循环、I/O 多路复用、定时器**全得你自己接（或依赖 `cppcoro`、`boost::asio` 这类库）。控制粒度更细，认知负担也更重。

> 一句话对照：**Python 的 asyncio 是"开箱即用的协程运行时"；C++20 协程是"给你砖头，自己盖调度器"。** 前者上手快、生态齐；后者性能上限高、能与现有异步 I/O 框架深度整合。

---

## 六、小结

- `async def` 返回**协程对象**，`await` 是**主动让位点**；只有被事件循环驱动才会执行。
- 异步提速的真相：**用"等待时间"去跑别的任务**，而非真的让一个任务变快。它只在 **I/O 密集**场景有效。
- 并发用 `asyncio.gather` / `asyncio.create_task`；**全程必须非阻塞**，否则整个循环被卡死。
- 对比多线程：异步单线程、无锁、切换极轻，适合海量连接；重 CPU 活它扛不动。
- 对比 C++20：Python 给了完整运行时，C++ 只给语言原语，要自己接调度器。

记住一句最实用的：**"异步解决的是等待，不是计算。"** 你的瓶颈在等网络/磁盘，用 asyncio；瓶颈在算，上多进程或 `run_in_executor`。别拿错锤子。
