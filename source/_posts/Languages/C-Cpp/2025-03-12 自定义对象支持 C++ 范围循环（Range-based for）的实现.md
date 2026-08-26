---

title: 自定义对象支持 C++ 范围循环（Range-based for）的实现
tags:
  - Range-based for
  - Practical-System-Development
categories: [Languages, C-Cpp]
abbrlink: 7aefcfc3
date: 2025-03-12
series: [C-Cpp]
---
## 导言

范围循环（C++11 引入）是现代 C++ 中遍历容器的便捷方式，其核心依赖**迭代器协议**与**begin/end 接口**。

## 一、范围循环的底层实现原理

C++ 标准规定，对于表达式for (range_declaration : range_expression)，编译器会自动将其展开为以下逻辑（伪代码）：

```
// 1. 获取范围的起始与结束迭代器
auto __begin = begin(range_expression);
auto __end = end(range_expression);

// 2. 遍历逻辑：依赖迭代器的 !=、++、* 操作
for (; __begin != __end; ++__begin) {
    range_declaration = *__begin;  // 解引用获取元素
    loop_statement;                // 循环体
}
```

### 关键依赖接口

要支持范围循环，自定义对象需满足：

存在可被调用的 begin() 和 end() 函数（成员函数或非成员函数）；

begin()/end() 返回的**迭代器对象**需支持以下操作：

- 前缀自增：++it（移动到下一个元素）；

- 不等于比较：it != it2（判断是否遍历结束）；

- 解引用：*it（获取当前元素的引用或值）；

- （可选但推荐）拷贝构造与赋值（迭代器需可拷贝）。

## 二、迭代器协议的设计与实现

迭代器本质是 “封装遍历逻辑的对象”，其设计需贴合容器的存储结构（连续存储 / 链式存储等）。以下以**连续存储的自定义容器**为例，设计符合标准的迭代器。

### 2.1 迭代器类的核心结构

以 “动态整型数组容器”IntArray的迭代器IntArrayIterator为例，实现步骤如下：

```
#include <cstddef>  // 用于size_t

// 前置声明容器类，因为迭代器需要访问容器的私有成员
class IntArray;

// 自定义迭代器类：支持正向遍历
class IntArrayIterator {
public:
    // -------------------------- 1. 迭代器类型别名（兼容STL算法，推荐）--------------------------
    using value_type = int;                  // 迭代器指向元素的类型
    using pointer = int*;                   // 元素指针类型
    using reference = int&;                 // 元素引用类型
    using difference_type = std::ptrdiff_t; // 两个迭代器间的距离类型
    using iterator_category = std::forward_iterator_tag; // 迭代器类别（正向迭代器）

    // -------------------------- 2. 构造函数 --------------------------
    // 接收容器的当前位置指针（核心：迭代器本质是“带逻辑的指针”）
    explicit IntArrayIterator(pointer ptr) : m_ptr(ptr) {}

    // -------------------------- 3. 核心操作符重载 --------------------------
    // 1. 解引用：返回当前元素的引用（支持修改元素）
    reference operator*() const {
        return *m_ptr;
    }

    // 2. 箭头操作符：支持通过迭代器访问元素成员（若元素是对象）
    pointer operator->() const {
        return m_ptr;
    }

    // 3. 前缀自增：移动到下一个元素，返回更新后的迭代器
    IntArrayIterator& operator++() {
        ++m_ptr;  // 指针移动（连续存储的核心逻辑）
        return *this;
    }

    // 4. 后缀自增（可选，范围循环不直接依赖，但为完整性实现）
    IntArrayIterator operator++(int) {
        IntArrayIterator temp = *this;  // 保存当前状态
        ++m_ptr;                        // 移动指针
        return temp;                    // 返回旧状态
    }

    // 5. 不等于比较：判断是否到达遍历终点
    friend bool operator!=(const IntArrayIterator& lhs, const IntArrayIterator& rhs) {
        return lhs.m_ptr != rhs.m_ptr;
    }

    // （可选）等于比较：为完整性实现
    friend bool operator==(const IntArrayIterator& lhs, const IntArrayIterator& rhs) {
        return lhs.m_ptr == rhs.m_ptr;
    }

private:
    pointer m_ptr;  // 核心成员：指向当前元素的指针（连续存储场景）
};
```

### 2.2 迭代器设计要点

- **迭代器类别**：std::forward_iterator_tag 表示正向迭代器，若需支持反向遍历，需实现 std::bidirectional_iterator_tag 并添加 -- 操作；

- **引用返回**：operator* 返回引用（int&）而非值，避免元素拷贝，同时支持通过迭代器修改容器元素；

- **友元函数**：operator!= 设为友元，方便访问私有成员 m_ptr（若迭代器成员是公有的，也可改为成员函数）。

## 三、自定义容器实现（支持范围循环）

基于上述迭代器，实现一个简单的动态整型数组容器 IntArray，核心是提供 begin() 和 end() 成员函数。

### 3.1 容器完整实现

```
#include <stdexcept>  // 用于std::out_of_range
#include <utility>    // 用于std::move

class IntArray {
public:
    // -------------------------- 1. 容器类型别名（关联迭代器）--------------------------
    using iterator = IntArrayIterator;          // 普通迭代器
    using const_iterator = const IntArrayIterator; // const迭代器（下文扩展）

    // -------------------------- 2. 构造/析构/拷贝控制（三法则）--------------------------
    // 构造函数：初始化指定大小的数组
    explicit IntArray(size_t size) : m_size(size), m_data(new int[size]()) {}

    // 析构函数：释放动态内存
    ~IntArray() {
        delete[] m_data;
    }

    // 拷贝构造函数：深拷贝（避免浅拷贝导致的内存泄漏）
    IntArray(const IntArray& other) : m_size(other.m_size), m_data(new int[other.m_size]) {
        for (size_t i = 0; i < m_size; ++i) {
            m_data[i] = other.m_data[i];
        }
    }

    // 拷贝赋值运算符：深拷贝
    IntArray& operator=(const IntArray& other) {
        if (this != &other) {  // 避免自赋值
            // 先释放当前内存，再分配新内存并拷贝
            delete[] m_data;
            m_size = other.m_size;
            m_data = new int[m_size];
            for (size_t i = 0; i < m_size; ++i) {
                m_data[i] = other.m_data[i];
            }
        }
        return *this;
    }

    // （可选）移动构造与移动赋值：提升性能（C++11）
    IntArray(IntArray&& other) noexcept : m_size(other.m_size), m_data(other.m_data) {
        other.m_size = 0;
        other.m_data = nullptr;  // 避免被析构函数重复释放
    }

    IntArray& operator=(IntArray&& other) noexcept {
        if (this != &other) {
            delete[] m_data;
            m_size = other.m_size;
            m_data = other.m_data;
            other.m_size = 0;
            other.m_data = nullptr;
        }
        return *this;
    }

    // -------------------------- 3. 核心：范围循环依赖的begin/end --------------------------
    // 普通迭代器：支持修改元素
    iterator begin() {
        return iterator(m_data);  // 返回指向第一个元素的迭代器
    }

    iterator end() {
        return iterator(m_data + m_size);  // 返回指向“尾后位置”的迭代器
    }

    // const迭代器：不支持修改元素（用于const容器）
    const_iterator begin() const {
        return const_iterator(m_data);
    }

    const_iterator end() const {
        return const_iterator(m_data + m_size);
    }

    // （C++11）cbegin/cend：显式返回const迭代器（兼容STL习惯）
    const_iterator cbegin() const {
        return begin();
    }

    const_iterator cend() const {
        return end();
    }

    // -------------------------- 4. 辅助接口（可选）--------------------------
    // 元素访问：支持下标操作
    int& operator[](size_t index) {
        if (index >= m_size) {
            throw std::out_of_range("IntArray: index out of range");
        }
        return m_data[index];
    }

    const int& operator[](size_t index) const {
        if (index >= m_size) {
            throw std::out_of_range("IntArray: index out of range");
        }
        return m_data[index];
    }

    size_t size() const {
        return m_size;
    }

private:
    size_t m_size;  // 数组大小
    int* m_data;    // 动态数组指针（连续存储）
};
```

### 3.2 容器实现核心要点

- **begin/end 的语义**：begin() 返回指向**第一个元素**的迭代器，end() 返回指向**尾后位置**（即最后一个元素的下一个位置）的迭代器，这是 C++ 迭代器的 “左闭右开” 原则；

- **const 迭代器**：const_iterator 需确保解引用后返回const int&，避免修改元素。通过重载const版本的begin()/end()，支持const IntArray对象的范围循环；

- **内存安全**：严格遵循 “三法则”（析构、拷贝构造、拷贝赋值），避免动态内存泄漏；添加移动语义（C++11）可提升性能。

## 四、编译验证与测试案例

提供完整的可编译代码，验证自定义容器的范围循环功能，测试场景包括：普通遍历、修改元素、const 容器遍历、边界情况（空容器）。

### 4.1 测试代码

```
#include <iostream>
#include "IntArray.h"  // 假设上述容器和迭代器代码在IntArray.h中

int main() {
    // 测试1：普通容器的范围循环（修改元素）
    IntArray arr(5);
    for (size_t i = 0; i < arr.size(); ++i) {
        arr[i] = i * 10;  // 初始化元素：0, 10, 20, 30, 40
    }

    std::cout << "测试1：修改元素的范围循环\n";
    for (auto& val : arr) {  // auto& 支持修改元素
        val += 5;            // 元素变为：5, 15, 25, 35, 45
        std::cout << val << " ";
    }
    std::cout << "\n";  // 输出：5 15 25 35 45


    // 测试2：const容器的范围循环（不可修改元素）
    const IntArray const_arr = arr;  // const容器
    std::cout << "测试2：const容器的范围循环\n";
    for (const auto& val : const_arr) {  // const auto& 不可修改
        std::cout << val << " ";
    }
    std::cout << "\n";  // 输出：5 15 25 35 45


    // 测试3：空容器（边界情况）
    IntArray empty_arr(0);
    std::cout << "测试3：空容器的范围循环（无输出）\n";
    for (auto& val : empty_arr) {
        std::cout << val;  // 不会执行
    }


    // 测试4：兼容STL算法（依赖迭代器类型别名）
    #include <algorithm>  // 用于std::for_each
    #include <functional> // 用于std::cout
    std::cout << "测试4：兼容STL算法（std::for_each）\n";
    std::for_each(arr.begin(), arr.end(), [](int val) {
        std::cout << val * 2 << " ";  // 输出：10 30 50 70 90
    });
    std::cout << "\n";

    return 0;
}
```

### 4.2 预期输出：

```
测试1：修改元素的范围循环
5 15 25 35 45 
测试2：const容器的范围循环
5 15 25 35 45 
测试3：空容器的范围循环（无输出）
测试4：兼容STL算法（std::for_each）
10 30 50 70 90 
```