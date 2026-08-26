---


tags:
  - C++
  - nique_ptr
  - vector
  - Data-Structures-and-Algorithms
categories: [Algorithms, DSA]
abbrlink: ebb68aeb
title: 'C++ 智能指针与容器组合使用：std::unique_ptr 与 std::vector'
date: 2024-06-28


---

## 一、基础概念与设计原理

在 C++ 开发中，std::unique_ptr与std::vector组合是动态内存管理的常用方案，既灵活又安全。unique_ptr独占所有权的特性，使其与容器存储场景天然适配，容器全权负责指针生命周期。

## 二、完整实现示例

### 1. 定义基础类

定义Point类，包含虚析构函数以支持多态：

```
#include <iostream>
#include <vector>
#include <memory> 

class Point {
private:
    int x_;
    int y_;
public:
    Point(int x = 0, int y = 0) : x_(x), y_(y) {
        std::cout << "Point构造: (" << x_ << "," << y_ << ")" << std::endl;
    }
    virtual ~Point() {
        std::cout << "Point析构: (" << x_ << "," << y_ << ")" << std::endl;
    }
    void setCoordinates(int x, int y) { x_ = x; y_ = y; }
    void print() const { std::cout << "(" << x_ << "," << y_ << ")" << std::endl; }
};
```

### 2. 创建智能指针容器

用std::vector<std::unique_ptr<Point>>声明容器，以std::make_unique初始化元素：

```
int main() {
    std::vector<std::unique_ptr<Point>> points;
    points.reserve(5);
    points.push_back(std::make_unique<Point>(0, 0));
    points.emplace_back(std::make_unique<Point>(1, 1));
    auto newPoint = std::make_unique<Point>(2, 2);
    points.push_back(std::move(newPoint)); 
    return 0;
}
```

### 3. 容器遍历与修改

```
// 迭代器遍历
for (const auto& ptr : points) ptr->print(); 
// 索引遍历
for (size_t i = 0; i < points.size(); ++i) points[i]->print(); 
// 修改元素
if (!points.empty()) points[0]->setCoordinates(10, 20);
```

### 4. 元素操作

```
points.pop_back(); // 移除
points[0] = std::make_unique<Point>(100, 200); // 替换
points.clear(); // 清空
```

## 三、关键技术解析

### 1. move 语义

unique_ptr依赖std::move转移所有权，容器操作触发移动构造，避免悬垂指针。

### 2. 异常安全

std::make_unique保证对象创建与智能指针构造原子性，规避new操作的内存泄漏风险。

### 3. 性能对比

| 特性     | unique_ptr 容器 | 原始指针数组 |
| -------- | --------------- | ------------ |
| 内存安全 | 自动释放        | 需手动释放   |
| 性能开销 | 极低            | 略优但风险高 |
| 异常安全 | 有保障          | 易泄漏       |
| 代码维护 | 简洁            | 复杂         |

## 四、最佳实践与注意事项

- **初始化**：用reserve预分配，优先emplace_back。

- **禁止操作**：勿用裸指针、遍历中修改、复制容器。

- **内存检测**：可用 Valgrind 或析构函数输出调试。