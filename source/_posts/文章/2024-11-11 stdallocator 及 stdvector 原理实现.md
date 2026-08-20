---
title: 'std::allocator 及 std::vector 原理实现'
tags:
  - STL
categories: [C-Code, Data-Structures-and-Algorithms]
series: STL
abbrlink: 7334dfaa
date: 2024-11-11
---
## 一、Vector 整体结构与 allocator 定位

### 1.1 Vector 核心数据成员构成

std::vector 作为动态数组容器，其核心数据结构由三个指针（或类似指针的迭代器）构成，分别指向：

- 数据区起始位置（begin）：指向已分配内存块的起始地址
- 有效数据结束位置（end）：指向当前已存储元素的下一个位置
- 内存块结束位置（capacity_end）：指向已分配内存块的末尾位置

### 1.2 allocator 在 Vector 中的核心定位

std::allocator 作为 Vector 的内存分配器组件，承担以下核心职责：

- 提供类型安全的内存分配 / 释放接口
- 解耦容器逻辑与底层内存管理实现
- 实现元素构造与内存分配的分离操作
- 支持自定义内存分配策略的扩展接口

## 二、std::allocator 核心接口与内存分配流程

### 2.1 allocator 核心成员函数

1. **allocate(size_t n)**：分配能够存储 n 个元素的未初始化内存块，返回指向内存块起始位置的指针，内存大小为 n * sizeof (T)
2. **deallocate(T* p, size_t n)**：释放由 allocate 分配的内存块，p 为内存起始指针，n 为当初分配的元素数量
3. **construct(T* p, Args&&... args)**：在已分配的内存位置 p 上构造元素，使用 Args 类型的参数进行完美转发
4. **destroy(T* p)**：销毁内存位置 p 上的元素，调用元素的析构函数，但不释放内存

### 2.2 内存分配完整流程

1. 容量检查：当 Vector 需要存储新元素时，首先检查当前 size 是否小于 capacity
2. 内存申请判断：若 size >= capacity，触发扩容流程，调用 allocator.allocate (new_capacity) 申请新内存
3. 元素迁移：通过 allocator.construct 在新内存位置构造元素，将旧内存中的元素移动或复制到新内存
4. 旧资源清理：调用 allocator.destroy 销毁旧内存中的元素，再调用 allocator.deallocate 释放旧内存
5. 指针调整：更新 begin、end、capacity_end 指针，指向新内存区域的对应位置

## 三、Vector 完整实现逻辑框架

### 3.1 构造函数实现逻辑

1. 默认构造：初始化 begin、end、capacity_end 为 nullptr，不分配内存
2. 带初始大小构造：调用 allocator.allocate (n) 分配内存，通过 allocator.construct 初始化 n 个元素
3. 范围构造：计算元素数量 n，分配对应内存，遍历输入范围构造元素
4. 拷贝构造：分配与源 Vector 相同 capacity 的内存，复制构造所有元素
5. 移动构造：直接接管源 Vector 的内存指针，将源 Vector 指针置空，避免内存分配

### 3.2 元素访问与修改逻辑

1. 随机访问：通过 begin + index 计算元素地址，提供 operator [] 和 at () 接口
2. 元素插入：
   - 检查容量，必要时扩容
   - 将插入位置后的元素向后移动
   - 在目标位置调用 allocator.construct 构造新元素
   - 更新 end 指针
3. 元素删除：
   - 调用 allocator.destroy 销毁目标元素
   - 将删除位置后的元素向前移动
   - 更新 end 指针
4. 清空操作：遍历所有元素调用 allocator.destroy，将 end 指针重置为 begin，不释放内存

### 3.3 析构函数实现逻辑

1. 元素销毁：遍历从 begin 到 end 的所有元素，调用 allocator.destroy
2. 内存释放：调用 allocator.deallocate 释放 begin 指向的内存块
3. 指针重置：将所有内部指针置为 nullptr

## 四、代码实现

### 4.1 头文件：my_vector.h

```
#ifndef MY_VECTOR_H_
#define MY_VECTOR_H_

#include <memory>  // 用于std::allocator

// 自定义动态数组类
template <class T>
class MyVector {
 public:
  // 默认构造函数：初始化空数组
  MyVector();

  // 析构函数：销毁元素并释放内存
  ~MyVector();

  // 尾插元素：拷贝构造传入的元素
  // 参数：val - 待插入的元素常量引用
  void PushBack(const T& val);

  // 尾删元素：销毁末尾元素（不释放内存）
  // 前置条件：数组非空（size() > 0）
  void PopBack();

  // 获取当前元素个数
  // 返回值：数组中已存储的元素数量（int类型）
  int Size() const;

  // 获取当前容量（可容纳的最大元素数）
  // 返回值：已分配内存可存储的元素数量（int类型）
  int Capacity() const;

  // 获取数组起始位置迭代器（指针）
  // 返回值：指向第一个元素的常量指针
  T* Begin() const { return start_; }

  // 获取数组末尾位置迭代器（指针）
  // 返回值：指向最后一个元素下一位的常量指针
  T* End() const { return finish_; }

 private:
  // 重新分配内存：动态扩容核心函数
  // 逻辑：按2倍策略扩容，迁移旧元素，释放旧内存
  void Reallocate();

  // 内存分配器：静态成员，所有MyVector实例共享
  static std::allocator<T> alloc_;

  // 数组核心指针
  T* start_;              // 指向数组起始位置
  T* finish_;             // 指向最后一个元素的下一位（当前元素结束位置）
  T* end_of_storage_;     // 指向已分配内存的末尾（容量结束位置）
};

// 模板类静态成员初始化声明（需在头文件中声明，.cc文件中定义）
template <class T>
std::allocator<T> MyVector<T>::alloc_;

// 引入模板成员函数实现（模板类多文件编译必需，避免链接错误）
#include "my_vector.cc"

#endif  // MY_VECTOR_H_
```

### 4.2 实现文件：my_vector.cc

```
#include "my_vector.h"
#include <utility>  // 用于std::move（优化元素迁移）

// 模板类成员函数实现：默认构造函数
template <class T>
MyVector<T>::MyVector() 
    : start_(nullptr), 
      finish_(nullptr), 
      end_of_storage_(nullptr) {
  // 空初始化：所有指针置空，不分配内存
}

// 模板类成员函数实现：析构函数
template <class T>
MyVector<T>::~MyVector() {
  // 步骤1：销毁所有已构造的元素（内存分配与对象销毁分离）
  if (start_ != nullptr) {
    // 从后往前销毁元素
    for (T* ptr = finish_; ptr != start_; ) {
      alloc_.destroy(--ptr);  // 调用元素析构函数
    }
    // 步骤2：释放已分配的内存（仅释放空间，不销毁对象）
    alloc_.deallocate(start_, end_of_storage_ - start_);
  }
}

// 模板类成员函数实现：尾插元素
template <class T>
void MyVector<T>::PushBack(const T& val) {
  // 检查容量：若已达最大容量，先扩容
  if (finish_ == end_of_storage_) {
    Reallocate();
  }
  // 在当前末尾位置构造元素（拷贝构造）
  alloc_.construct(finish_, val);
  // 更新元素结束指针
  ++finish_;
}

// 模板类成员函数实现：尾删元素
template <class T>
void MyVector<T>::PopBack() {
  // 前置条件检查：避免空数组删元素
  if (Size() == 0) {
    // 可根据需求替换为日志打印或自定义异常（此处简化处理）
    return;
  }
  // 销毁末尾元素（不释放内存）
  --finish_;
  alloc_.destroy(finish_);
}

// 模板类成员函数实现：获取当前元素个数
template <class T>
int MyVector<T>::Size() const {
  // 元素个数 = 结束指针 - 起始指针（指针差值计算）
  return static_cast<int>(finish_ - start_);
}

// 模板类成员函数实现：获取当前容量
template <class T>
int MyVector<T>::Capacity() const {
  // 容量 = 内存结束指针 - 起始指针（指针差值计算）
  return static_cast<int>(end_of_storage_ - start_);
}

// 模板类成员函数实现：动态扩容（核心辅助函数）
template <class T>
void MyVector<T>::Reallocate() {
  // 步骤1：计算新容量
  // 空数组初始容量设为1，非空数组按2倍扩容
  const int old_capacity = Capacity();
  const int new_capacity = (old_capacity == 0) ? 1 : old_capacity * 2;

  // 步骤2：分配新内存（仅分配空间，不构造元素）
  T* new_start = alloc_.allocate(new_capacity);
  T* new_finish = new_start;

  // 步骤3：迁移旧元素（移动构造，减少拷贝开销）
  try {
    for (T* old_ptr = start_; old_ptr != finish_; ++old_ptr, ++new_finish) {
      // 移动构造：将旧元素资源转移到新内存 
      alloc_.construct(new_finish, std::move(*old_ptr));
      // 销毁旧内存中的元素（避免资源泄漏）
      alloc_.destroy(old_ptr);
    }
  } catch (...) {
    // 异常安全处理：若构造失败，清理已分配资源 
    for (T* rollback_ptr = new_start; rollback_ptr != new_finish; ++rollback_ptr) {
      alloc_.destroy(rollback_ptr);
    }
    alloc_.deallocate(new_start, new_capacity);
    throw;  // 重新抛出异常，让上层处理
  }

  // 步骤4：释放旧内存（仅释放空间，元素已销毁）
  if (start_ != nullptr) {
    alloc_.deallocate(start_, old_capacity);
  }

  // 步骤5：更新指针，指向新内存
  start_ = new_start;
  finish_ = new_finish;
  end_of_storage_ = new_start + new_capacity;
}
```

