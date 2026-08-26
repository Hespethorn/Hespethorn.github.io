---

tags:
  - C++
  - unordered_map
  - 自定义类型
  - Foundational-Syntax-and-Core-Concepts
categories: [Languages, C-Cpp]
abbrlink: 9ead7de4
title: unordered_map 存放自定义类型的六种方法
date: 2024-08-04
series: [C-Cpp]
---

## 引言

`std::unordered_map`是 C++ 标准库中提供的无序关联容器，与`std::map`不同，它通过哈希表实现，因此需要两个关键组件：哈希函数（用于计算键的哈希值）和相等性比较函数（用于判断两个键是否相等）。当使用自定义类型作为`unordered_map`的键时，我们需要显式提供这两种组件。

## 一、核心概念

`std::unordered_map`的模板定义如下：

```cpp
template<
    class Key,
    class T,
    class Hash = std::hash<Key>,      // 哈希函数类型
    class KeyEqual = std::equal_to<Key>,  // 相等性比较类型
    class Allocator = std::allocator<std::pair<const Key, T>>
> class unordered_map;
```

- `Hash`类型必须满足*Hash*概念：`Hash`对象的`operator()`接受`const Key&`参数，返回`size_t`
- `KeyEqual`类型必须满足*EqualityComparable*概念：`KeyEqual`对象的`operator()`接受两个`const Key&`参数，返回`bool`
- 对于任意两个键`a`和`b`，若`KeyEqual()(a, b) == true`，则`Hash()(a) == Hash()(b)`必须成立

## 二、自定义类型准备

首先定义一个示例自定义类型`Point`，作为`unordered_map`的键：

```cpp
#include <iostream>
#include <unordered_map>
#include <string>
#include <functional>

// 自定义点类型
class Point {
private:
    int x;
    int y;

public:
    Point(int x_ = 0, int y_ = 0) : x(x_), y(y_) {}
    
    int getX() const { return x; }
    int getY() const { return y; }
    
    // 用于打印
    friend std::ostream& operator<<(std::ostream& os, const Point& p) {
        os << "(" << p.x << "," << p.y << ")";
        return os;
    }
};
```

## 三、六种实现方法

### 3.1 哈希函数的两种实现方式

#### 3.1.1 方式 A：特化 std::hash 模板

```cpp
namespace std {
    // 必须在std命名空间中特化
    template<>
    struct hash<Point> {
        // 必须提供const成员函数operator()
        size_t operator()(const Point& p) const noexcept {
            // 实现必须满足：若p1 == p2，则hash(p1) == hash(p2)
            size_t h1 = hash<int>{}(p.getX());
            size_t h2 = hash<int>{}(p.getY());
            // 哈希组合应减少碰撞，标准未指定具体算法
            return h1 ^ (h2 << 1);
        }
    };
}
```

标准文档说明：`std::hash`的特化必须满足哈希函数的语义要求，即对于相等的对象必须产生相同的哈希值。

#### 3.1.2 方式 B：自定义哈希函数对象

```cpp
// 自定义哈希类型，无需在std命名空间
struct PointHash {
    // 必须是可复制构造、可复制赋值、可析构的
    // 必须提供const成员函数operator()
    size_t operator()(const Point& p) const noexcept {
        // 实现需满足哈希函数语义
        return (p.getX() * 31) ^ p.getY();
    }
};
```

### 3.2 相等性比较的三种实现方式

#### 3.2.1 方式 1：重载 == 运算符

```cpp
// 全局重载==运算符
bool operator==(const Point& lhs, const Point& rhs) noexcept {
    // 必须满足等价关系：
    // 1. 自反性：lhs == lhs
    // 2. 对称性：lhs == rhs 等价于 rhs == lhs
    // 3. 传递性：若lhs == rhs且rhs == rhs，则lhs == rhs
    return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
}
```

#### 3.2.2 方式 2：特化 std::equal_to 模板

```cpp
namespace std {
    template<>
    struct equal_to<Point> {
        // 必须提供const成员函数operator()
        bool operator()(const Point& lhs, const Point& rhs) const noexcept {
            // 必须满足等价关系
            return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
        }
    };
}
```

#### 3.2.3 方式 3：自定义相等性比较对象

```cpp
struct PointEqual {
    // 必须是可复制构造、可复制赋值、可析构的
    // 必须提供const成员函数operator()
    bool operator()(const Point& lhs, const Point& rhs) const noexcept {
        // 必须满足等价关系
        return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
    }
};
```

### 3.3 六种组合方法示例

```cpp
// 测试函数模板
template<typename MapType>
void testUnorderedMap(const std::string& methodName) {
    std::cout << "\n=== 测试 " << methodName << " ===" << std::endl;
    
    MapType map;
    map[Point(1, 2)] = "A";
    map[Point(3, 4)] = "B";
    map[Point(1, 2)] = "C";  // 重复的键，会覆盖值
    map[Point(5, 6)] = "D";
    
    for (const auto& pair : map) {
        std::cout << pair.first << " -> " << pair.second << std::endl;
    }
}

int main() {
    // 方法1：A1 = std::hash特化 + ==运算符重载
    testUnorderedMap<std::unordered_map<Point, std::string>>(
        "A1: std::hash特化 + ==运算符重载");
    
    // 方法2：A2 = std::hash特化 + std::equal_to特化
    // 需要先注释掉==运算符重载，避免冲突
    testUnorderedMap<std::unordered_map<Point, std::string>>(
        "A2: std::hash特化 + std::equal_to特化");
    
    // 方法3：A3 = std::hash特化 + 自定义相等性对象
    testUnorderedMap<std::unordered_map<Point, std::string, std::hash<Point>, PointEqual>>(
        "A3: std::hash特化 + 自定义相等性对象");
    
    // 方法4：B1 = 自定义哈希对象 + ==运算符重载
    testUnorderedMap<std::unordered_map<Point, std::string, PointHash>>(
        "B1: 自定义哈希对象 + ==运算符重载");
    
    // 方法5：B2 = 自定义哈希对象 + std::equal_to特化
    testUnorderedMap<std::unordered_map<Point, std::string, PointHash>>(
        "B2: 自定义哈希对象 + std::equal_to特化");
    
    // 方法6：B3 = 自定义哈希对象 + 自定义相等性对象
    testUnorderedMap<std::unordered_map<Point, std::string, PointHash, PointEqual>>(
        "B3: 自定义哈希对象 + 自定义相等性对象");
    
    return 0;
}
```

## 四、各种方法的对比分析

| 方法 | 哈希实现       | 相等性实现         | 优点                    | 缺点                         |
| ---- | -------------- | ------------------ | ----------------------- | ---------------------------- |
| A1   | std::hash 特化 | == 运算符          | 符合 STL 习惯，使用方便 | 全局运算符可能影响其他代码   |
| A2   | std::hash 特化 | std::equal_to 特化 | 不影响全局命名空间      | 需要侵入 std 命名空间        |
| A3   | std::hash 特化 | 自定义比较对象     | 比较逻辑独立            | 声明容器时需指定比较器       |
| B1   | 自定义哈希对象 | == 运算符          | 哈希逻辑独立，使用方便  | 全局运算符可能有副作用       |
| B2   | 自定义哈希对象 | std::equal_to 特化 | 两者都独立于全局运算符  | 实现稍复杂                   |
| B3   | 自定义哈希对象 | 自定义比较对象     | 完全独立，灵活性最高    | 声明容器时需指定两个模板参数 |

## 五、注意事项

1. **哈希函数设计**：
   - 应尽量减少哈希冲突，否则会降低性能
   - 对于相同的对象必须返回相同的哈希值
   - 不同对象可能返回相同哈希值（哈希冲突），这是允许的但应尽量避免
2. **相等性比较**：
   - 必须满足等价关系：自反性、对称性和传递性
   - 如果两个对象相等（`a == b`），它们的哈希值必须相同
   - 反之不成立：哈希值相同的两个对象不一定相等
3. **命名空间考量**：
   - 只有当自定义类型是用户定义的类型时，才能特化`std`命名空间中的模板
   - 不要在`std`命名空间中添加新的模板或函数，只能特化现有模板
4. **性能优化**：
   - 哈希函数应快速计算
   - 对于频繁使用的`unordered_map`，可以适当调整负载因子（`max_load_factor`）
5. **冲突处理**：
   - `unordered_map`内部会处理哈希冲突，但过多的冲突会导致性能下降
   - 良好的哈希函数应将键值均匀分布在哈希表中

## 六、适用场景推荐

1. **通用场景**：推荐使用 B3（自定义哈希对象 + 自定义比较对象），完全独立，无副作用
2. **简单场景**：如果只需偶尔使用，且不担心全局运算符影响，A1（`std::hash`特化 + `==`运算符）更简洁
3. **多比较策略**：当需要为同一类型定义多种哈希或比较方式时，必须使用 B3 方案
4. **库开发**：开发库时应优先使用 B3 方案，避免全局命名空间污染

## 总结

为`std::unordered_map`配置自定义类型键需要同时提供哈希函数和相等性比较函数。本文介绍的六种方法各有优劣，选择时应考虑代码封装性、灵活性和性能需求。

> 注意：本文介绍的方法适用于所有无序容器，包括`unordered_map`、`unordered_set`、`unordered_multimap`和`unordered_multiset`。C++11 及以上标准支持这些特性。