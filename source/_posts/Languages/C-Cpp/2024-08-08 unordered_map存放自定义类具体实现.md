---

tags:
  - C++
  - unordered_map
  - 自定义类型
  - Foundational-Syntax-and-Core-Concepts
categories: [Languages, C-Cpp]
abbrlink: d8781b37
title: unordered_map存放自定义类具体实现
date: 2024-08-08
series: [C-Cpp]
---

## 一、引言

上一篇文章介绍了`unordered_map`存放自定义类型的六种方法的理论框架，本文将通过完整可运行的代码示例，详细展示每种方法的具体实现细节。这六种方法是通过 2 种哈希实现方式与 3 种相等性比较方式组合而成，每种组合都有其独特的实现要点。

## 二、基础准备

首先定义基础的`Point`类和测试函数，作为六种方法的共同基础：

```
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

// 通用测试函数
template<typename MapType>
void testMap(const std::string& methodName) {
    std::cout << "\n=== 测试 " << methodName << " ===" << std::endl;
    
    MapType map;
    map[Point(1, 2)] = "A";
    map[Point(3, 4)] = "B";
    map[Point(1, 2)] = "C";  // 重复的键，会覆盖值
    map[Point(5, 6)] = "D";
    map[Point(3, 4)] = "E";  // 重复的键，会覆盖值
    
    for (const auto& pair : map) {
        std::cout << pair.first << " -> " << pair.second << std::endl;
    }
}
```

### 2.1 方法 1：std::hash 特化 + == 运算符重载

这种方法通过特化`std::hash`提供哈希功能，通过全局重载`==`运算符提供相等性比较。

```
// 方法1：std::hash特化 + ==运算符重载

// 1. 特化std::hash模板提供哈希函数
namespace std {
    template<>
    struct hash<Point> {
        size_t operator()(const Point& p) const {
            // 组合x和y的哈希值
            size_t hashX = hash<int>()(p.getX());
            size_t hashY = hash<int>()(p.getY());
            // 简单的哈希组合方式
            return hashX ^ (hashY << 1);
        }
    };
}

// 2. 重载==运算符提供相等性比较
bool operator==(const Point& lhs, const Point& rhs) {
    return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
}

// 使用示例
int main() {
    // 不需要指定额外模板参数，使用默认的hash和equal_to
    using MyMap = std::unordered_map<Point, std::string>;
    testMap<MyMap>("方法1：std::hash特化 + ==运算符重载");
    return 0;
}
```

**实现要点**：

- 特化`std::hash`时必须在`std`命名空间内
- `operator()`必须是 const 成员函数，返回`size_t`类型
- `==`运算符重载为全局函数，确保能访问`Point`的必要成员

### 2.2 方法 2：std::hash 特化 + std::equal_to 特化

这种方法同时特化`std::hash`和`std::equal_to`两个标准模板。

```
// 方法2：std::hash特化 + std::equal_to特化

// 1. 特化std::hash模板提供哈希函数
namespace std {
    template<>
    struct hash<Point> {
        size_t operator()(const Point& p) const {
            size_t hashX = hash<int>()(p.getX());
            size_t hashY = hash<int>()(p.getY());
            return hashX ^ (hashY << 1);
        }
    };
    
    // 2. 特化std::equal_to模板提供相等性比较
    template<>
    struct equal_to<Point> {
        bool operator()(const Point& lhs, const Point& rhs) const {
            return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
        }
    };
}

// 使用示例
int main() {
    // 不需要指定额外模板参数，使用特化后的标准模板
    using MyMap = std::unordered_map<Point, std::string>;
    testMap<MyMap>("方法2：std::hash特化 + std::equal_to特化");
    return 0;
}
```

**实现要点**：

- 两个特化都必须放在`std`命名空间中
- 只有用户定义的类型才能特化`std`中的模板
- 不需要重载`==`运算符，避免了全局运算符可能带来的冲突

### 2.3 方法 3：std::hash 特化 + 自定义相等性对象

这种方法使用特化的`std::hash`作为哈希函数，同时定义独立的相等性比较对象。

```
// 方法3：std::hash特化 + 自定义相等性对象

// 1. 特化std::hash模板提供哈希函数
namespace std {
    template<>
    struct hash<Point> {
        size_t operator()(const Point& p) const {
            size_t hashX = hash<int>()(p.getX());
            size_t hashY = hash<int>()(p.getY());
            return hashX ^ (hashY << 1);
        }
    };
}

// 2. 定义自定义相等性比较对象
struct PointEqual {
    bool operator()(const Point& lhs, const Point& rhs) const {
        return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
    }
};

// 使用示例
int main() {
    // 需要指定第四个模板参数为自定义的相等性比较对象
    using MyMap = std::unordered_map<Point, std::string, std::hash<Point>, PointEqual>;
    testMap<MyMap>("方法3：std::hash特化 + 自定义相等性对象");
    return 0;
}
```

**实现要点**：

- 自定义比较对象需要实现`operator()`，接受两个`Point`参数
- 声明`unordered_map`时需要显式指定第四个模板参数
- 比较对象的`operator()`必须是 const 成员函数

### 2.4 方法 4：自定义哈希对象 + == 运算符重载

这种方法使用自定义的哈希函数对象，通过全局`==`运算符提供相等性比较。

```
// 方法4：自定义哈希对象 + ==运算符重载

// 1. 定义自定义哈希函数对象
struct PointHash {
    size_t operator()(const Point& p) const {
        // 可以使用与其他方法不同的哈希算法
        return (p.getX() * 31) ^ p.getY();
    }
};

// 2. 重载==运算符提供相等性比较
bool operator==(const Point& lhs, const Point& rhs) {
    return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
}

// 使用示例
int main() {
    // 需要指定第三个模板参数为自定义哈希对象
    using MyMap = std::unordered_map<Point, std::string, PointHash>;
    testMap<MyMap>("方法4：自定义哈希对象 + ==运算符重载");
    return 0;
}
```

**实现要点**：

- 自定义哈希对象是普通的结构体，不需要放在`std`命名空间
- 哈希对象的`operator()`接受`const Point&`参数并返回`size_t`
- 声明`unordered_map`时需要显式指定第三个模板参数

### 2.5 方法 5：自定义哈希对象 + std::equal_to 特化

这种方法组合了自定义哈希对象和特化的`std::equal_to`。

```
// 方法5：自定义哈希对象 + std::equal_to特化

// 1. 定义自定义哈希函数对象
struct PointHash {
    size_t operator()(const Point& p) const {
        return (p.getX() * 31) ^ p.getY();
    }
};

// 2. 特化std::equal_to模板提供相等性比较
namespace std {
    template<>
    struct equal_to<Point> {
        bool operator()(const Point& lhs, const Point& rhs) const {
            return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
        }
    };
}

// 使用示例
int main() {
    // 需要指定第三个模板参数为自定义哈希对象
    using MyMap = std::unordered_map<Point, std::string, PointHash>;
    testMap<MyMap>("方法5：自定义哈希对象 + std::equal_to特化");
    return 0;
}
```

**实现要点**：

- 不需要重载`==`运算符，避免全局命名空间污染
- `std::equal_to`的特化提供了相等性比较逻辑
- 哈希逻辑封装在自定义哈希对象中，便于修改和维护

### 2.6 方法 6：自定义哈希对象 + 自定义相等性对象

这种方法使用两个完全自定义的组件：哈希对象和相等性比较对象。

```
// 方法6：自定义哈希对象 + 自定义相等性对象

// 1. 定义自定义哈希函数对象
struct PointHash {
    size_t operator()(const Point& p) const {
        return (p.getX() * 31) ^ p.getY();
    }
};

// 2. 定义自定义相等性比较对象
struct PointEqual {
    bool operator()(const Point& lhs, const Point& rhs) const {
        return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
    }
};

// 使用示例
int main() {
    // 需要同时指定哈希对象和相等性比较对象
    using MyMap = std::unordered_map<Point, std::string, PointHash, PointEqual>;
    testMap<MyMap>("方法6：自定义哈希对象 + 自定义相等性对象");
    return 0;
}
```

**实现要点**：

- 两个独立的结构体分别负责哈希计算和相等性比较
- 声明`unordered_map`时需要显式指定第三和第四个模板参数
- 完全不依赖全局运算符和`std`命名空间的特化，封装性最好

## 三、实现要点总结

1. **哈希函数要求**：
   - 必须是纯函数：相同输入必须产生相同输出
   - 应尽量减少哈希冲突
   - 运算应高效，避免复杂计算
2. **相等性比较要求**：
   - 必须满足等价关系（自反、对称、传递）
   - 若`a == b`为 true，则`hash(a) == hash(b)`也必须为 true
   - 比较函数应高效
3. **模板参数指定**：
   - 当使用默认组件时可省略模板参数
   - 自定义哈希函数时需指定第三个模板参数
   - 自定义相等性比较时需指定第四个模板参数
4. **命名空间注意**：
   - 特化`std`模板必须在`std`命名空间内
   - 自定义哈希和比较对象应放在全局命名空间或用户命名空间

## 四、完整测试代码

```
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
    
    friend std::ostream& operator<<(std::ostream& os, const Point& p) {
        os << "(" << p.x << "," << p.y << ")";
        return os;
    }
};

// 通用测试函数
template<typename MapType>
void testMap(const std::string& methodName) {
    std::cout << "\n=== 测试 " << methodName << " ===" << std::endl;
    
    MapType map;
    map[Point(1, 2)] = "A";
    map[Point(3, 4)] = "B";
    map[Point(1, 2)] = "C";
    map[Point(5, 6)] = "D";
    map[Point(3, 4)] = "E";
    
    for (const auto& pair : map) {
        std::cout << pair.first << " -> " << pair.second << std::endl;
    }
}

// 选择要测试的方法，注释掉其他方法以避免冲突

// 方法1实现
/*
namespace std {
    template<> struct hash<Point> {
        size_t operator()(const Point& p) const {
            return hash<int>()(p.getX()) ^ (hash<int>()(p.getY()) << 1);
        }
    };
}
bool operator==(const Point& lhs, const Point& rhs) {
    return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
}
*/

// 方法2实现
/*
namespace std {
    template<> struct hash<Point> {
        size_t operator()(const Point& p) const {
            return hash<int>()(p.getX()) ^ (hash<int>()(p.getY()) << 1);
        }
    };
    template<> struct equal_to<Point> {
        bool operator()(const Point& lhs, const Point& rhs) const {
            return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
        }
    };
}
*/

// 方法3实现
/*
namespace std {
    template<> struct hash<Point> {
        size_t operator()(const Point& p) const {
            return hash<int>()(p.getX()) ^ (hash<int>()(p.getY()) << 1);
        }
    };
}
struct PointEqual {
    bool operator()(const Point& lhs, const Point& rhs) const {
        return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
    }
};
*/

// 方法4实现
/*
struct PointHash {
    size_t operator()(const Point& p) const {
        return (p.getX() * 31) ^ p.getY();
    }
};
bool operator==(const Point& lhs, const Point& rhs) {
    return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
}
*/

// 方法5实现
/*
struct PointHash {
    size_t operator()(const Point& p) const {
        return (p.getX() * 31) ^ p.getY();
    }
};
namespace std {
    template<> struct equal_to<Point> {
        bool operator()(const Point& lhs, const Point& rhs) const {
            return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
        }
    };
}
*/

// 方法6实现
/*
struct PointHash {
    size_t operator()(const Point& p) const {
        return (p.getX() * 31) ^ p.getY();
    }
};
struct PointEqual {
    bool operator()(const Point& lhs, const Point& rhs) const {
        return lhs.getX() == rhs.getX() && lhs.getY() == rhs.getY();
    }
};
*/

int main() {
    // 根据测试的方法选择对应的Map类型
    //using MyMap = std::unordered_map<Point, std::string>;               // 方法1,2
    //using MyMap = std::unordered_map<Point, std::string, std::hash<Point>, PointEqual>;  // 方法3
    //using MyMap = std::unordered_map<Point, std::string, PointHash>;    // 方法4,5
    //using MyMap = std::unordered_map<Point, std::string, PointHash, PointEqual>;  // 方法6
    
    //testMap<MyMap>("选中的方法");
    return 0;
}
```

