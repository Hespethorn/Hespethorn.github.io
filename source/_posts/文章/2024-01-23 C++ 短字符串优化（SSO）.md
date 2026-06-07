---
tags:
  - C++
  - 短字符串优化
  - 写时复制
categories:
  - C++
  - Foundational Syntax and Core Concepts
series: C++
abbrlink: ad103c1f
title: C++ 短字符串优化（SSO）
date: 2024-01-23 23:23:37
---

## 引言：字符串性能的关键挑战

在 C++ 开发中，std::string作为最常用的容器之一，其性能直接影响整体程序效率。传统字符串实现采用**动态内存分配**策略，无论字符串长度如何，都需要在堆上分配空间，这会带来：

- 内存分配 / 释放的开销

- 缓存局部性不佳

- 小字符串场景下的效率低下

短字符串优化（Short String Optimization, SSO）正是为解决这些问题而生的关键技术，已成为现代 C++ 标准库（如 libstdc++、libc++）的标配实现策略。

## 一、SSO 的核心原理

### 1.1 传统字符串实现的缺陷

传统std::string（C++11 之前）通常采用 "胖指针" 结构：

```
// 传统字符串实现（概念模型）
struct String {
    char* data;      // 指向堆内存的指针
    size_t length;   // 字符串长度
    size_t capacity; // 已分配容量
};
```

这种结构对短字符串极不友好，例如存储 "hello" 这样的字符串：

- 需要一次堆分配

- 指针本身占用 8 字节（64 位系统）

- 实际数据仅 6 字节（含终止符）

- 内存利用率低下

### 1.2 SSO 的核心思想

SSO 的本质是**空间换时间**：利用字符串对象本身的内存空间存储短字符串，避免堆分配。

实现关键在于：

- 在字符串对象内部嵌入小型缓冲区

- 当字符串长度小于缓冲区大小时，直接存储在对象内部

- 当字符串超长时，自动切换到堆分配模式

## 二、SSO 的内存布局设计

现代std::string通过**联合体（union）** 实现 SSO，典型内存布局如下：

```
// SSO实现概念模型（64位系统）
class String {
private:
    union {
        // 短字符串：直接存储在对象内部
        struct {
            char buffer[15];  // 字符缓冲区
            uint8_t size;     // 字符串长度（0-15）
        } short_str;
        
        // 长字符串：使用堆分配
        struct {
            char* data;       // 指向堆内存的指针
            size_t size;      // 字符串长度
            size_t capacity;  // 已分配容量
        } long_str;
    };
    // 通过size或capacity的特殊值区分两种模式
};
```

## 三、SSO 实现示例

以下是一个简化的 SSO 字符串实现，展示核心原理：

```
#include <cstring>
#include <algorithm>
#include <stdexcept>

class SSOString {
private:
    size_t BUFFER_SIZE = 15;
    
    // 存储联合体
    union Storage {
        // 短字符串存储：缓冲区+长度
        struct Short {
            char buffer[BUFFER_SIZE + 1];  // +1用于终止符
            int size;                  // 实际长度（不包含终止符）
        } short_;
        
        // 长字符串存储：指针+大小+容量
        struct Long {
            char* data;
            size_t size;
            size_t capacity;
        } long_;
    } storage_;
    
    // 判断当前是否为短字符串模式
    bool is_short() const {
        // 当短字符串的size <= BUFFER_SIZE时为短模式
        return storage_.short_.size <= BUFFER_SIZE;
    }

public:
    // 构造函数：空字符串
    SSOString() {
        storage_.short_.buffer[0] = '\0';
        storage_.short_.size = 0;
    }
    
    // 构造函数：从C字符串构造
    SSOString(const char* str) {
        const size_t len = std::strlen(str);
        if (len <= BUFFER_SIZE) {
            // 短字符串：直接复制到内部缓冲区
            std::memcpy(storage_.short_.buffer, str, len + 1);
            storage_.short_.size = static_cast<size_t>(len);
        } else {
            // 长字符串：分配堆内存
            storage_.long_.data = new char[len + 1];
            std::memcpy(storage_.long_.data, str, len + 1);
            storage_.long_.size = len;
            storage_.long_.capacity = len;
        }
    }
    
    // 析构函数
    ~SSOString()  {
        if (!is_short()) {
            delete[] storage_.long_.data;
        }
    }
    
    // 复制构造函数
    SSOString(const SSOString& other) {
        if (other.is_short()) {
            // 短字符串：直接复制缓冲区
            storage_.short_ = other.storage_.short_;
        } else {
            // 长字符串：深拷贝
            storage_.long_.size = other.storage_.long_.size;
            storage_.long_.capacity = other.storage_.long_.capacity;
            storage_.long_.data = new char[storage_.long_.capacity + 1];
            std::memcpy(storage_.long_.data, other.storage_.long_.data, 
                       storage_.long_.size + 1);
        }
    }
    
       
    // 获取字符串长度
    size_t size() const  {
        return is_short() ? storage_.short_.size : storage_.long_.size;
    }
    
    // 获取C风格字符串
    const char* c_str() const  {
        if (is_short()) {
            return storage_.short_.buffer;
        } else {
            return storage_.long_.data;
        }
    }
    
    // ...
};
```

## 四、SSO 的适用场景与限制

### 4.1 最佳适用场景

- 字符串长度通常小于 15-22 字节（取决于标准库实现）

- 频繁创建、销毁或拷贝字符串

- 对内存分配开销敏感的性能关键路径

- 嵌入式系统或内存受限环境

### 4.2 限制与权衡

**对象体积增大**：SSO 字符串对象通常为 32 字节，而传统实现仅 16 字节

- 影响：存储大量字符串对象时内存占用可能增加

**长字符串的额外开销**：SSO 结构对长字符串没有优化，反而因对象体积大带来轻微 overhead

**线程局部性影响**：大对象在多线程环境中可能导致更多的缓存争用

**实现复杂性**：增加了字符串类的实现复杂度，容易引入 bug