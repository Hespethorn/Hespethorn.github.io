---
title: C++/MySQL/Redis 锁机制 - 1
tags:
  - C++
categories: [C-Code, Foundational-Syntax-and-Core-Concepts]
series: Foundational-Syntax-and-Core-Concepts
abbrlink: 6e72f340
date: 2025-05-06
---

## 导言

在并发编程与分布式系统中，锁机制是保障数据一致性的核心技术。不同技术栈因运行环境（本地进程 / 数据库 / 分布式集群）差异，锁的实现逻辑、核心特性与适用场景存在显著区别。

## 一、C++ 锁机制：本地进程内的并发控制

C++ 作为系统级编程语言，其锁机制基于操作系统内核态同步原语（如互斥量、信号量）与用户态原子操作实现，核心解决**单进程内多线程共享内存的线程安全问题**。C++11 及以后通过 `<thread>、 <mutex>、 <atomic>` 等标准库提供统一锁接口，同时支持自定义锁实现。

### 1. 互斥锁（std::mutex）：C++ 基础悲观锁

#### 核心定义

C++ 标准库中的基础悲观锁，通过操作系统互斥量（Mutex）实现，保证**同一时间只有一个线程进入临界区**，其他竞争线程会阻塞等待，直到锁释放。是解决本地线程并发冲突的 “通用方案”。

#### 底层实现

- 依赖操作系统内核态同步原语（如 Linux 的 pthread_mutex_t、Windows 的 CRITICAL_SECTION）；

- 线程竞争失败时会从用户态切换到内核态，进入阻塞状态（Blocked），释放 CPU 资源；

- 锁释放时，操作系统唤醒阻塞队列中的线程，重新竞争锁（默认非公平）。

#### 代码示例（std::mutex + RAII 管理）

```
#include <iostream>
#include <thread>
#include <mutex>
#include <vector>

std::mutex mtx; // 全局互斥锁
int shared_count = 0; // 共享资源

// 临界区操作：安全递增计数
void safe_increment(int id) {
    // std::lock_guard 是 RAII 锁管理类，构造时加锁，析构时自动释放（避免锁泄漏）
    std::lock_guard<std::mutex> lock(mtx); 
    shared_count++;
    std::cout << "Thread " << id << ": shared_count = " << shared_count << std::endl;
    // 离开作用域时，lock_guard 析构，自动解锁
}

int main() {
    std::vector<std::thread> threads;
    // 创建 5 个线程并发操作共享资源
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back(safe_increment, i);
    }
    // 等待所有线程执行完成
    for (auto& t : threads) {
        t.join();
    }
    return 0;
}
```

#### 优缺点与适用场景

| 维度             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **优点**         | 实现简单，标准库原生支持；RAII 管理（如 std::lock_guard）避免锁泄漏；绝对保证线程安全。 |
| **缺点**         | 线程阻塞导致内核态 / 用户态切换开销；非公平锁可能导致线程饥饿；不支持重入（需用 std::recursive_mutex）。 |
| **适用场景**     | 本地进程内多线程共享资源（如内存缓存、全局计数器）；临界区操作耗时较长（如文件读写、复杂计算）。 |
| **与 Java 对比** | 类似 Java 的 synchronized（底层均依赖 OS 互斥量），但 C++ 需手动通过 RAII 类管理锁生命周期，Java 自动释放锁。 |

### 2. 递归互斥锁（std::recursive_mutex）：支持重入的悲观锁

#### 核心定义

允许**同一线程多次获取同一把锁**，避免线程在递归调用或多函数嵌套时因重复请求锁而死锁，是 C++ 版的 “可重入锁”。

#### 底层实现

- 内部维护 “持有线程 ID” 和 “重入计数器”：首次获取锁时计数器设为 1，再次获取时计数器 + 1；

- 释放锁时计数器 - 1，直到计数器为 0 时，锁才真正释放，允许其他线程竞争。

#### 代码示例（递归调用场景）

```
#include <iostream>
#include <thread>
#include <mutex>

std::recursive_mutex rec_mtx;
int depth = 0;

// 递归函数：需多次获取同一把锁
void recursive_func(int level) {
    std::lock_guard<std::recursive_mutex> lock(rec_mtx); // 第 level 次获取锁
    depth = level;
    std::cout << "Current recursion depth: " << depth << std::endl;
    
    if (level < 3) {
        recursive_func(level + 1); // 递归调用，再次请求锁
    }
    
    // 析构时释放锁，计数器-1
}

int main() {
    std::thread t(recursive_func, 1);
    t.join();
    return 0;
}
// 输出：
// Current recursion depth: 1
// Current recursion depth: 2
// Current recursion depth: 3
```

#### 优缺点与适用场景

| 维度             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **优点**         | 解决递归 / 嵌套函数的死锁问题；兼容 std::lock_guard 等 RAII 工具。 |
| **缺点**         | 比普通 std::mutex 性能略低（需维护计数器）；滥用可能隐藏逻辑漏洞（如递归深度失控）。 |
| **适用场景**     | 递归函数操作共享资源（如递归遍历线程安全的树形结构）；多函数嵌套调用同一锁。 |
| **与 Java 对比** | 功能等同于 Java 的 ReentrantLock 和 synchronized（两者均支持重入），但 C++ 需显式使用 std::recursive_mutex，Java 无需额外声明。 |

### 3. 自旋锁（基于 std::atomic）：用户态轻量锁

#### 核心定义

线程获取锁失败时，不进入内核态阻塞，而是通过**用户态原子操作循环重试**（忙等待），直到获取锁。适用于 “临界区操作极短” 的场景，避免内核态切换开销。

#### 底层实现

- 基于 C++11 std::atomic<bool> 原子变量实现：false 表示锁未持有，true 表示已持有；

- 通过 std::atomic::compare_exchange_weak（CAS 操作）尝试获取锁，失败则循环重试；

- 无内核态参与，纯用户态操作，性能高于互斥锁（临界区短时）。

#### 代码示例（自定义自旋锁）

```
#include <iostream>
#include <thread>
#include <atomic>
#include <vector>

class SpinLock {
private:
    std::atomic<bool> locked{false}; // 原子变量标记锁状态
public:
    // 获取锁：CAS 循环重试
    void lock() {
        bool expected = false;
        // 循环直到 CAS 成功（将 locked 从 false 设为 true）
        while (!locked.compare_exchange_weak(expected, true, 
                                             std::memory_order_acquire, 
                                             std::memory_order_relaxed)) {
            expected = false; // CAS 失败后重置预期值
        }
    }
    // 释放锁：原子操作设为 false
    void unlock() {
        locked.store(false, std::memory_order_release);
    }
};

SpinLock spin_lock;
int shared_val = 0;

void increment() {
    for (int i = 0; i < 10000; ++i) {
        spin_lock.lock();
        shared_val++; // 临界区极短（仅自增）
        spin_lock.unlock();
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < 4; ++i) {
        threads.emplace_back(increment);
    }
    for (auto& t : threads) {
        t.join();
    }
    std::cout << "Final shared_val: " << shared_val << std::endl; // 输出 40000
    return 0;
}
```

#### 优缺点与适用场景

| 维度             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **优点**         | 无内核态切换开销，临界区短时性能远超互斥锁；实现简单，纯用户态操作。 |
| **缺点**         | 忙等待浪费 CPU 资源，临界区长时或高竞争场景下性能骤降；不支持优先级反转保护。 |
| **适用场景**     | 临界区操作极短（如简单变量自增、指针修改）；CPU 核心数较多的高并发场景。 |
| **与 Java 对比** | 功能等同于 Java 的 “自旋锁”（如 JVM 轻量级锁中的自旋逻辑），但 C++ 需自定义实现，Java 由 JVM 自动管理自旋阈值。 |

### 4. 读写锁（std::shared_mutex）：读多写少场景优化

#### 核心定义

区分 “读操作” 和 “写操作” 的锁机制：**多个线程可同时获取读锁（共享模式），但写锁与读锁 / 写锁互斥（独占模式）**，适用于 “读多写少” 场景，提升并发效率。

#### 底层实现

- 基于 “读者 - 写者” 模型，维护 “读者计数” 和 “写锁状态”；

- 读锁：无写锁时，读者计数 + 1 即可获取；有写锁时，阻塞等待；

- 写锁：读者计数为 0 且无其他写锁时，才能获取；否则阻塞等待。

#### 代码示例（读多写少场景）

```
#include <iostream>
#include <thread>
#include <shared_mutex>
#include <vector>
#include <chrono>

std::shared_mutex rw_mutex;
int shared_data = 0;

// 读操作：获取共享读锁（多线程可同时读）
void read_data(int thread_id) {
    std::shared_lock<std::shared_mutex> read_lock(rw_mutex);
    std::cout << "Reader " << thread_id << ": shared_data = " << shared_data << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(100)); // 模拟读耗时
}

// 写操作：获取独占写锁（仅单线程可写）
void write_data(int new_val) {
    std::unique_lock<std::shared_mutex> write_lock(rw_mutex);
    shared_data = new_val;
    std::cout << "Writer: updated shared_data to " << new_val << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(200)); // 模拟写耗时
}

int main() {
    std::vector<std::thread> threads;
    // 启动 5 个读线程（同时读）
    for (int i = 0; i < 5; ++i) {
        threads.emplace_back(read_data, i);
    }
    // 启动 1 个写线程（独占写）
    threads.emplace_back(write_data, 100);
    // 再启动 3 个读线程（写完成后读）
    for (int i = 5; i < 8; ++i) {
        threads.emplace_back(read_data, i);
    }

    for (auto& t : threads) {
        t.join();
    }
    return 0;
}
```

#### 优缺点与适用场景

| 维度             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| **优点**         | 读多写少场景下并发效率远高于互斥锁；读操作无互斥开销。       |
| **缺点**         | 实现复杂，写操作可能因读锁累积导致 “写饥饿”；高写竞争场景性能不如互斥锁。 |
| **适用场景**     | 读多写少的共享资源（如配置缓存、日志查询、统计数据读取）。   |
| **与 Java 对比** | 等同于 Java 的 ReentrantReadWriteLock，但 C++ std::shared_mutex 是 C++17 引入的标准库组件，Java 更早支持（JDK 1.5）。 |

