---
tags:
  - C++
  - map
  - 自定义类
categories: [C-Code, Foundational-Syntax-and-Core-Concepts]
series: Foundational-Syntax-and-Core-Concepts
abbrlink: 49b110e8
title: 'map 存放 pair<Point,string> 的三种解决方案'
date: 2024-07-17
---

## 引言

在 C++ 中使用std::map存储自定义类型作为键时，需要确保该类型能够被正确比较大小，因为std::map是一个有序关联容器，其内部通过比较操作来组织元素。本文将介绍三种方法来解决map中存放pair<Point, string>元素的问题，其中Point是一个自定义点类型。

## 核心概念

std::map要求其键类型必须支持比较操作（默认使用<运算符）。对于自定义类型Point，我们需要通过以下三种方式之一提供比较能力：

1. 为Point类重载<运算符

1. 定义一个比较结构体（仿函数）

1. 为Point准备std::less的特化模板

## 代码示例

首先定义基础的Point类：

```
#include <math.h>
#include <iostream>
#include <set>
using std::cout;
using std::endl;
using std::set;

template <class Container>
void display(const Container & con)
{
    for(auto & ele : con)
    {
        cout << ele << " ";
    }
    cout << endl;
}

class Point
{
public:
    Point(int x,int y)
        : m_ix(x)
          , m_iy(y)
    {}

    void print() const
    {
    }

    float getDistance() const
    {
        return sqrt(m_ix * m_ix
                    + m_iy * m_iy);
    }

    int getX() const{ return m_ix; }
    int getY() const{ return m_iy; }

    /* friend struct std::less<Point>; */
private:
    int m_ix;
    int m_iy;
};

std::ostream & operator<<(std::ostream & os, const Point & rhs)
{
    os << "(" << rhs.getX()
        << "," << rhs.getY()
        << ")";
    return os;
}
```

### 方法一：重载 < 运算符

这是最直接的方案，通过为`Point`类型重载全局的`<`运算符，使其能够使用`set`的默认比较器`std::less`。

```
// 方案一：为Point类型重载<
bool operator<(const Point & lhs,const Point & rhs) 
{
    cout << "<运算符重载" << endl;
    // 先比较距离，再比较x坐标，最后比较y坐标
    if(lhs.getDistance() < rhs.getDistance()) {
        return true;
    } else if(lhs.getDistance() == rhs.getDistance()) {
        if(lhs.getX() < rhs.getX()) {   
            return true;
        } else if(lhs.getX() == rhs.getX()) {
            if(lhs.getY() < rhs.getY()) {
                return true;
            }
        }
    }
    return false;
}
```

工作原理：

- 当`set`创建时，默认使用`std::less`作为比较器
- `std::less`的`operator()`会调用我们重载的`operator<`
- 比较逻辑：先按点到原点的距离排序，距离相等则按 x 坐标，x 也相等则按 y 坐标

### 方法二：使用比较结构体

创建一个独立的比较器结构体，作为`set`的第二个模板参数。

```
//自定义比较类型
struct PointCompare
{
    bool operator()(const Point & lhs,const Point & rhs) const
    {
        cout << "自定义Compare类型的函数对象" << endl;
        // 比较逻辑与前两种方案相同
        if(lhs.getDistance() < rhs.getDistance()) {
            return true;
        } else if(lhs.getDistance() == rhs.getDistance()) {
            if(lhs.getX() < rhs.getX()) {   
                return true;
            } else if(lhs.getX() == rhs.getX()) {
                if(lhs.getY() < rhs.getY()) {
                    return true;
                }
            }
        }
        return false;
    }
};
```

工作原理：

- 自定义比较器需要实现`operator()`，接受两个`Point`参数
- `set`会使用该比较器替代默认的`std::less`
- 比较逻辑完全独立，不依赖`operator<`或`std::less`的特化

### 方法三：为Point准备std::less的特化模板

通过为`Point`类型特化`std::less`模板，定制比较逻辑。

```
//为Point准备std::less的特化模板
namespace std
{
template <>
struct less<Point>
{
    bool operator()(const Point & lhs,const Point & rhs) const 
    {
        cout << "std::less的特化模板" << endl;
        // 比较逻辑与方案一相同
        if(lhs.getDistance() < rhs.getDistance()) {
            return true;
        } else if(lhs.getDistance() == rhs.getDistance()) {
            if(lhs.getX() < rhs.getX()) {   
                return true;
            } else if(lhs.getX() == rhs.getX()) {
                if(lhs.getY() < rhs.getY()) {
                    return true;
                }
            }
        }
        return false;
    }
};
}//end of namespace std
```

工作原理：

- 特化`std::less`后，`set`会使用这个特化版本
- 无需重载`operator<`，比较逻辑封装在特化的`std::less`中
- 同样遵循`set`的默认行为，但比较逻辑更明确地与`std::less`绑定

## 三种方案的对比与适用场景

| 方案           | 优点                                  | 缺点                       | 适用场景                                    |
| -------------- | ------------------------------------- | -------------------------- | ------------------------------------------- |
| 重载 < 运算符  | 简单直接，适用范围广                  | 全局运算符可能影响其他代码 | 比较逻辑通用，且希望类型支持自然比较        |
| 特化 std::less | 保持与 STL 习惯一致，不影响全局运算符 | 需要侵入 std 命名空间      | 希望使用 set 默认语法，但需要自定义比较逻辑 |
| 自定义比较类型 | 完全独立，可定义多种比较方式          | 需要显式指定比较器类型     | 需要多种比较策略，或不希望修改原类型        |

## 注意事项

1. **严格弱序**：三种方案的比较逻辑都必须满足严格弱序，否则`set`的行为将是未定义的
   - 对于任意 a，a < a 必须为 false
   - 若 a < b 为 true，则 b < a 必须为 false
   - 若 a < b 且 b < c，则 a < c 必须为 true
2. **性能考量**：比较操作会在`set`的插入、查找等操作中频繁调用，应尽量优化比较逻辑
3. **代码冲突**：
   - 方案一和方案二不应同时使用，会导致二义性
   - 当开启方案一时（`#if 1`），方案二会被忽略，因为`std::less`会优先调用`operator<`
4. **输出语句**：代码中的`cout`语句用于演示比较器的调用过程，实际生产环境中应移除
5. **友元声明**：代码中注释掉的`friend struct std::less;`在方案二中可能需要，以便`std::less`访问`Point`的私有成员（如果比较逻辑需要的话）

> 注意：本文讨论的三种方案适用于所有基于比较器的 STL 容器，包括`set`、`map`、`multiset`和`multimap`等。