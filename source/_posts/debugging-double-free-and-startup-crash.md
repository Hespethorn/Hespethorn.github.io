# 一次 C++ 程序三重 bug 的调试之旅：double-free、静态初始化 fiasco 与 RTSP 死锁

> 借助 AI 在 30 分钟内定位并修复了三个偶发性崩溃问题。本文复盘整个排查过程，记录诊断思路和修复方案。

---

## 背景

项目是一个基于 ZLMediaKit 的 UAV（无人艇）客户端程序，运行在 ARM（RK3588）平台上。最近重构了 RTSP 服务管理代码后，程序出现两个症状：

1. **偶尔 double-free 崩溃**（ARM 和 x86 都有）
2. **ARM 启动即段错误，x86 却正常**
3. **RTSP 服务无法正常退出**（卡死）

三个问题看似独立，根因却相互关联。

---

## Bug 1: 偶尔 double-free —— ELF 符号介入

### 症状

程序退出时偶尔报 double-free，不是每次都出现。

### 排查过程

让 AI 读取 `src/` 下所有源代码，分析内存管理。AI 很快注意到 `CMakeLists.txt` 中一段关键注释：

```cmake
# libmk_api.so 提供 toolkit 基础库符号（SocketHelper, EventPoller 等）
# libzlmediakit.a 提供 C++ 高层接口（PlayerProxy, TcpServer 等）
# 两者都包含 ZLMediaKit 全局 std::string，ELF 符号介入导致同一块内存被析构两次 (double-free)
# 解决：用 -Wl,--no-as-needed 确保 libmk_api.so 被链接，并在退出前手动清理
```

进一步检查 `git diff`，发现新代码把结尾的 `_exit(0)` 改成了 `return 0`：

```cpp
// 旧代码（正确）
// 使用 _exit() 跳过 atexit/dl_fini 析构，避免 libmk_api.so 与 libzlmediakit.a
// 的全局 std::string 被 ELF 符号介入导致 double-free。
_exit(0);

// 新代码（有问题）
return 0;
```

### 根因

`libmk_api.so`（动态库）和 `libzlmediakit.a`（静态库）各自编译了一份 ZLMediaKit 的全局 `std::string` 对象。正常运行时没事，但程序退出时的 `atexit`/`dl_fini` 阶段：

1. 动态库 fini 释放一次 string 内存
2. 可执行文件的静态析构再释放**同一块**内存 → double-free

这是因为 ELF 默认符号解析规则下，动态库的 `std::string` 符号介入了可执行文件中的同名符号，两者共享了同一块内存。

### 修复

```cmake
# CMakeLists.txt
set_target_properties(uav PROPERTIES
    LINK_FLAGS "-Wl,-Bsymbolic"   # 可执行文件符号自绑定，阻止 .so 介入
)
```

`-Bsymbolic` 让可执行文件内的符号引用优先绑定到自身定义，`libmk_api.so` 的全局 string 和 `libzlmediakit.a` 的全局 string 各自独立，互不干预。

---

## Bug 2: ARM 启动段错误 —— 静态初始化顺序 fiasco

### 症状

ARM 上程序启动即崩溃，GDB 显示：

```
#4  Factory::registerPlugin → 访问 s_plugins[...]
#7  __static_initialization_and_destruction_0  ← libmk_api.so 的静态构造
```

x86 上完全正常。

### 排查过程

backtrace 中 frame #4 在可执行文件地址空间，frame #7 在 `libmk_api.so` 地址空间，但**都指向同一个源文件** `Factory.cpp`。为什么？

AI 检查了 ARM 和 x86 预编译库的符号表：

```
# x86 libzlmediakit.a（旧版，正常）
_ZN8mediakitL10getPluginsEv          ← getPlugins() 函数
_ZZN8mediakitL10getPluginsEvE9s_plugins  ← s_plugins 在 getPlugins() 内部（Meyers' singleton）

# ARM libzlmediakit.a（新版，有问题）
_ZN8mediakitL9s_pluginsE             ← s_plugins 是文件级 static（独立符号）
_ZN8mediakitL10getPluginsEv          ← getPlugins() 也存在（但 registerPlugin 未使用它）
```

真相大白：

| | x86 | ARM |
|---|---|---|
| `libzlmediakit.a` | 旧版 ZLMediaKit 编译 | 新版 ZLMediaKit（2526）编译 |
| `s_plugins` | 函数内 static（Meyers' singleton） | 文件级 static |
| 初始化时机 | 首次调用时 | ELF 初始化阶段，顺序不可控 |

### 根因

`Factory.cpp` 中有人把 `s_plugins` 从函数内 static 改成了文件级 static：

```cpp
// 旧版（x86，正常）
static auto& getPlugins() {
    static std::unordered_map<int, const CodecPlugin*> s_plugins;
    return s_plugins;  // 首次调用时初始化
}

// 新版（ARM 2526，崩溃）
static std::unordered_map<int, const CodecPlugin*> s_plugins;
// ↑ 文件级 static，构造函数何时执行取决于 ELF 初始化顺序
```

崩溃链路：

```
libmk_api.so 加载 → 静态构造函数运行
  → REGISTER_CODEC(vp8_plugin) 展开的 onceToken 构造
    → 调用 Factory::registerPlugin()
      → 符号介入，解析到可执行文件的版本
        → 访问 uav 中的 s_plugins
          → 可执行文件的静态构造在 .so 之后才执行
            → s_plugins 尚未初始化 → 段错误
```

### 为什么 x86 正常？

x86 预编译库是旧版 ZLMediaKit 编译的，`s_plugins` 在函数内（Meyers' singleton），首次调用时才初始化，天然免疫初始化顺序问题。

**与 CPU 架构无关，纯粹是预编译库版本不同。**

### 修复

两件事：

1. 恢复 `Factory.cpp` 的 Meyers' singleton 写法
2. ARM 预编译库从备份恢复旧版 `libzlmediakit.a.bak`

---

## Bug 3: RTSP 无法正常退出 —— EventPoller 线程死锁

### 症状

程序退出时卡住，必须 `kill -9`。

### 排查过程

旧代码的注释已经指出了问题：

> PlayerProxy/TcpServer 的析构依赖 EventPoller 线程协同完成，推流重连时 EventPoller 被异步任务占满，同步析构必然死锁。

之前的"修复"是让 `RtspService::stop()` 什么也不做，靠 `_exit(0)` 让 OS 回收资源。但 Bug 1 修了之后不能用 `_exit(0)` 了，必须正确清理。

AI 查阅了 ZLMediaKit 的 `EventPoller.h` 头文件，找到了 `async()` API，提出了关键思路：**把清理任务投递到 EventPoller 线程内部执行**。

### 根因

```
主线程 proxy.reset()
  → PlayerProxy 析构函数需要取消 EventPoller 上的定时器
    → 向 EventPoller 线程投递"取消"任务，并同步等待完成
      → 但 EventPoller 线程正忙于推流重连的异步任务
        → "取消"任务永远排不到
          → 主线程永远在等 → 死锁
```

### 修复

```cpp
void stop() {
    if (proxies.empty() && !server) return;

    // 将析构投递到 EventPoller 线程执行，避免跨线程同步等待
    auto poller = EventPollerPool::Instance().getFirstPoller();
    if (poller) {
        poller->async([proxies = std::move(this->proxies),
                       server  = std::move(this->server)]() mutable {
            // 在 EventPoller 自己的线程里析构 PlayerProxy
            // 所有内部清理操作都是同线程同步，不会死锁
            proxies.clear();
            server.reset();
        });
    }
}
```

核心思想：让 PlayerProxy 的析构发生**在 EventPoller 自己的线程里**。这样析构函数内部的所有操作（取消定时器、关闭连接等）都是同线程同步，不需要跨线程等待，自然不会死锁。

---

## AI 辅助调试的价值

这次调试过程展示了 AI 在系统级 bug 排查中的几个关键优势：

1. **全量代码扫描**：人工排查三个相互关联的 bug 需要逐文件阅读，AI 可以在几分钟内遍历 `src/` 下所有源文件并建立关联关系。

2. **快速定位关键注释**：`CMakeLists.txt` 中那段解释 ELF 符号介入的注释是关键线索，AI 从庞杂的构建配置中精准提取了它。

3. **跨领域知识关联**：ELF 符号介入、Meyers' singleton、静态初始化顺序 fiasco、EventPoller 线程模型——这四个知识点分属链接器、C++ 语言规范、Linux 动态加载和 ZLMediaKit 框架，AI 能同时调动这些领域的知识进行交叉分析。

4. **符号表分析**：通过对比 x86 和 ARM 预编译库的 mangled symbol，AI 快速确认了 `s_plugins` 在两个版本中的差异——这一步如果人工做，需要手动 `strings | grep` 然后手工 demangle，耗时且容易遗漏。

5. **API 发现**：AI 主动查找并阅读了 `EventPoller.h` 的 API 文档，发现了 `async()` 方法，从而提出了从根本上解决死锁的方案。

---

## 小结

三个 bug，各自涉及不同的计算机科学基础概念：

| Bug | 涉及概念 | 一句话总结 |
|-----|---------|-----------|
| double-free | ELF 符号介入、动态/静态链接 | `-Wl,-Bsymbolic` 让可执行文件的符号自绑定 |
| 启动段错误 | 静态初始化顺序 fiasco、Meyers' singleton | 永远用函数内 static 替代文件级 static |
| RTSP 退出死锁 | 事件循环线程模型、异步析构 | 把析构投递到 EventPoller 自己的线程执行 |

> 三个 bug 都是"改一行修好"的类型，但定位每一行都需要对底层机制有准确理解。AI 的价值不在于替代这种理解，而在于**加速从症状到根因的推理链条**——帮你快速排除噪音、关联线索、找到关键证据。
