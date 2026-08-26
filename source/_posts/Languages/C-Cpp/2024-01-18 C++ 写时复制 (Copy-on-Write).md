---

tags:
  - C++
  - 共享
  - 写时复制
  - Foundational-Syntax-and-Core-Concepts
categories: [Languages, C-Cpp]
abbrlink: 5c9d9f2f
title: C++ 写时复制 (Copy-on-Write)
date: 2024-01-18

---

## 一、写时复制核心概念

写时复制 (简称 COW) 是一种**资源管理优化技术**，其核心思想是：当多个对象需要共享同一资源时，直到其中一个对象需要修改资源前，都不需要真正复制资源，仅在修改时才创建资源的私有副本。

这种机制通过**延迟复制操作**，减少了不必要的内存分配和数据拷贝，从而提高程序性能，尤其适用于：

- 频繁复制但很少修改的场景

- 内存资源宝贵的环境

- 大型数据结构的共享访问

## 二、写时复制实现三要素

### 1. 共享数据存储

需要一个独立的共享数据结构，存储实际的数据内容。

```
template <typename T>
struct SharedData {
    T* data;          // 实际数据指针
    size_t size;      // 数据大小
    size_t ref_count; // 引用计数
    // 其他元数据...
};
```

### 2. 引用计数机制

通过引用计数跟踪当前有多少对象共享该资源：

- 当新对象共享资源时，引用计数 + 1

- 当对象销毁或不再共享时，引用计数 - 1

- 当引用计数为 0 时，释放共享资源

### 3. 写时复制触发点

在所有可能修改共享数据的操作前，检查当前对象是否是唯一所有者：

- 如果不是唯一所有者，则复制一份新的共享数据

- 确保修改操作只影响当前对象的私有副本

## 三、COW 字符串类实现示例

下面是一个简化的写时复制字符串类实现：

```
// CharProxy定义
class CowString
{
private:
    // 内部类--->处理下标访问运算符的读写逻辑
    class CharProxy{
    public:
        CharProxy(CowString & cowString, size_t index)
        : m_self(cowString)
        , m_index(index)
        {}
        //operator<< 读操作 cout << s1[0] --> charProxy-->CowString-->m_pStr-->char
        //友元函数方式进行重载
        friend
        ostream & operator<<(ostream & os ,const CharProxy & proxy);

        //operator= 写操作 s[0]='A' char = char
        // []-->proxy-->cowString-->m_pStr-->char   =  char
        // 成员函数重载
        char & operator=(const char & ch);
    private:
        CowString & m_self;
        size_t m_index;
    };
public:
    // no arg constructor
    CowString();
    // arg constructor
    CowString(const char * pStr);
    // destructor
    ~CowString();
    // copy constructor
    CowString(const CowString & rhs);
    // 用于获取字符串长度的方法
    size_t size()
    {
        return strlen(m_pStr);
    }
    // 返回C风格字符串
    char * c_str()
    {
        return m_pStr;
    }
};
```

## 四、多线程环境下的 COW 实现

在多线程环境中，COW 实现需要考虑线程安全，主要措施包括：

**原子引用计数**：使用std::atomic<size_t>替代普通计数器

```
#include <atomic>

struct ThreadSafeSharedData {
    char* str;
    size_t length;
    std::atomic<size_t> ref_count; // 原子引用计数
    
    // 构造函数和其他成员...
};
```

**互斥保护修改操作**：在make_unique等关键操作中使用互斥锁

```
#include <mutex>

void thread_safe_make_unique() {
    // 先检查引用计数
    if (data->ref_count.load() > 1) {
        static std::mutex mtx;
        std::lock_guard<std::mutex> lock(mtx);
        
        // 双重检查，避免重复复制
        if (data->ref_count.load() > 1) {
            // 执行复制操作...
        }
    }
}
```

## 五、COW 在 C++ 标准库中的应用与变迁

### 1. std::string 的 COW 实现

- 早期 C++ 标准库（如 libstdc++ 2.95-4.8）中的std::string采用 COW 实现

- C++11 标准后，由于多线程和移动语义的引入，多数标准库放弃了 COW 实现

- 主要原因：COW 在多线程环境下的锁开销可能抵消其带来的收益

### 2. 标准库放弃 COW 的技术原因

- 线程安全成本高：需要原子操作或锁机制

- 与移动语义冲突：移动操作应避免复制

- 迭代器失效问题：修改操作可能导致所有共享对象的迭代器失效

## 六、COW 的最佳实践与适用场景

### 适用场景

- 只读操作远多于写操作的场景

- 数据对象体积大，复制成本高

- 单线程或低并发环境

- 频繁创建临时副本的场景

### 不适用场景

- 频繁修改的场景（复制成本高）

- 高并发环境（锁竞争激烈）

- 需要使用迭代器进行大量操作的场景

### 实现建议

1. 始终将const与非const成员函数区分开
2. 仅在非const成员函数中触发复制
3. 提供移动构造和移动赋值，优化临时对象处理
4. 实现 swap 函数，避免不必要的复制

## 七、COW 性能分析

| 操作       | 传统复制 | 写时复制      | 性能差异       |
| ---------- | -------- | ------------- | -------------- |
| 复制构造   | O(n)     | O(1)          | 大幅提升       |
| 读操作     | O(1)     | O(1)          | 基本持平       |
| 首次写操作 | O(1)     | O(n)          | 略有下降       |
| 多次写操作 | O(1)     | O(n) + O(1)*k | 取决于修改频率 |
| 内存使用   | 高       | 低            | 显著节省       |

> 注：n 为数据大小，k 为写操作次数

通过合理使用写时复制技术，可以在特定场景下显著提升 C++ 程序的性能和内存使用效率，但需根据具体应用场景权衡其优缺点。