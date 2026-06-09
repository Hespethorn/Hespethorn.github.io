---
title: C++ 中 struct 与 class 的核心差异与应用场景
tags:
  - class
  - struct
categories:
  - C++
  - Foundational Syntax and Core Concepts
series: C++
abbrlink: e7ef88fa
date: 2025-02-27
---
## 导言

在 C++ 编程中，struct与class是定义复合数据类型的核心语法元素，二者既共享大部分 OOP（面向对象编程）特性，又因设计初衷不同存在关键差异。

## 一、语法定义与核心共性

struct源于 C 语言的结构化数据设计，class则是 C++ 为支持 OOP 引入的特性。在 C++ 标准（ISO/IEC 14882）中，二者**功能上高度重合**，仅在默认行为上存在差异。

### 1.1 核心共性

- **成员定义能力**：均可包含**数据成员**（如int x）和**成员函数**（如void print()），支持静态成员（static）和友元（friend）。

- **OOP 特性支持**：均支持构造函数、析构函数、拷贝 / 移动语义、继承、多态（虚函数）。

- **内存布局规则**：数据成员的对齐（alignment）、填充（padding）逻辑完全一致，由编译器根据平台（如 32 位 / 64 位）和类型大小决定。

- **模板与容器适配**：均可作为 STL 容器（如std::vector）的元素类型（需满足容器要求，如可拷贝性）。

### 1.2 共性示例代码

```
#include <iostream>
#include <string>

// struct示例：包含数据成员、成员函数、静态成员
struct StructDemo {
    std::string name;  // 数据成员
    static int count;  // 静态成员

    // 构造函数
    StructDemo(std::string n) : name(std::move(n)) { count++; }

    // 成员函数
    void print() const {
        std::cout << "Struct: " << name << ", Count: " << count << std::endl;
    }
};
int StructDemo::count = 0;  // 静态成员初始化

// class示例：与struct功能对等
class ClassDemo {
public:  // 显式指定public（后续会解释默认访问控制）
    std::string name;
    static int count;

    ClassDemo(std::string n) : name(std::move(n)) { count++; }

    void print() const {
        std::cout << "Class: " << name << ", Count: " << count << std::endl;
    }
};
int ClassDemo::count = 0;

int main() {
    StructDemo s1("Struct A");
    StructDemo s2("Struct B");
    s1.print();  // 输出：Struct: Struct A, Count: 2

    ClassDemo c1("Class A");
    ClassDemo c2("Class B");
    c1.print();  // 输出：Class: Class A, Count: 2

    return 0;
}
```

## 二、核心差异深度解析

struct与class的本质差异集中在**默认访问控制**和**默认继承方式**，其他差异均由此衍生。

### 2.1 默认访问控制（最核心差异）

C++ 标准规定：

- struct的**所有成员（数据 + 函数）默认访问权限为public**（即外部可直接访问）；

- class的**所有成员默认访问权限为private**（即仅内部或友元可访问）。

#### 补充说明

- 访问控制可通过public/private/protected显式修改，例如class可显式定义public成员，struct也可显式定义private成员；

- 静态成员的默认访问权限与普通成员一致（struct默认public，class默认private）；

- 友元（friend）不受访问控制限制，无论struct还是class，友元均可访问所有成员。

### 2.2 默认继承方式

当涉及继承时，两者的默认继承权限不同：

- struct默认采用 **public继承 **（基类的public成员在派生类中仍为public，protected成员仍为protected）；

- class默认采用 **private继承 **（基类的public/protected成员在派生类中变为private，外部不可访问）。

### 2.3 C 语言兼容性

struct是 C 语言的原生类型，C++ 为保持兼容性，对struct做了特殊适配：

- C 风格的struct（仅含数据成员，无成员函数）可直接在 C++ 中编译和使用；

- C++ 的struct可兼容 C 的内存布局（如通过typedef定义的 C 结构体，在 C++ 中可直接访问成员）；

- class是 C++ 特有类型，**无法在 C 语言中编译**，若需跨 C/C++ 使用，必须使用struct。

### 2.4 POD 类型适配性

POD（Plain Old Data，简单旧数据）是 C++ 中对 “可与 C 兼容的数据类型” 的定义，满足两个条件：

1. **平凡性（Trivial）**：默认构造、拷贝构造、移动构造、析构函数均为编译器生成（无自定义逻辑）；

1. **标准布局（Standard Layout）**：无虚函数、无基类（或仅继承 POD 类型）、成员访问控制一致（如全为public）。

struct更容易满足 POD 特性（因默认public且常无复杂逻辑），而class因可能包含private成员或虚函数，更易成为非 POD 类型。

#### POD 类型示例

```
#include <iostream>
#include <type_traits>  // 用于判断POD特性

// 1. POD struct（全public、无自定义特殊函数、无虚函数）
struct POD_Struct {
    int x;
    double y;
};

// 2. 非POD class（有private成员和虚函数）
class NonPOD_Class {
private:
    int x;
public:
    virtual void print() {}  // 虚函数破坏标准布局
};

// 3. 非POD struct（有自定义析构函数，破坏平凡性）
struct NonPOD_Struct {
    int x;
    ~NonPOD_Struct() {}  // 自定义析构函数，破坏平凡性
};

int main() {
    // C++17前用std::is_pod，C++20推荐用std::is_standard_layout + std::is_trivial
    std::cout << std::boolalpha;
    std::cout << "POD_Struct is POD: " << std::is_pod<POD_Struct>::value << std::endl;         // true
    std::cout << "NonPOD_Class is POD: " << std::is_pod<NonPOD_Class>::value << std::endl;     // false
    std::cout << "NonPOD_Struct is POD: " << std::is_pod<NonPOD_Struct>::value << std::endl;   // false

    // POD类型支持低级内存操作（如memcpy）
    POD_Struct s1 = {10, 3.14};
    POD_Struct s2;
    memcpy(&s2, &s1, sizeof(POD_Struct));  // 合法且安全
    std::cout << "s2.x: " << s2.x << ", s2.y: " << s2.y << std::endl;  // 输出：10, 3.14

    return 0;
}
```

## 三、应用场景案例分析

选择struct还是class，核心依据是**场景需求**（而非功能限制）。以下为典型场景及选择逻辑：

### 3.1 数据载体（DTO / 协议解析 / 配置存储）

- **需求**：存储纯数据，无需隐藏实现，需内存布局固定、支持高效序列化 / 反序列化。

- **选择**：struct（默认public，易满足 POD，兼容 C 风格内存操作）。

### 3.2 面向对象封装（隐藏实现细节）

- **需求**：需控制成员访问权限，隐藏内部逻辑（如数据校验、状态维护），仅通过接口暴露功能。

- **选择**：class（默认private，符合封装原则，避免外部误修改内部状态）。

### 3.3 性能敏感场景

- **需求**：数据需频繁访问、内存紧凑、缓存命中率高（避免虚函数表指针等额外开销）。

- **选择**：struct（POD 类型，无虚函数，内存布局紧凑，适合大规模数据处理）。

## 四、高级场景总结

### 4.1 性能考量

| 维度         | struct 优势                               | class 注意点                                           |
| ------------ | ----------------------------------------- | ------------------------------------------------------ |
| 内存开销     | 无虚函数时无额外开销（如 vptr），内存紧凑 | 含虚函数时，每个对象多 1 个 vptr（8 字节 / 64 位平台） |
| 内存操作效率 | POD 类型支持memcpy/memset，比拷贝构造快   | 非 POD 类型需调用拷贝构造，开销较高                    |
| 缓存命中率   | 数据连续，适合批量访问，缓存友好          | 若含虚函数或复杂成员，可能破坏连续性                   |

## 五、总结：如何选择？

struct与class的核心差异是**默认行为**（访问控制、继承方式），而非功能上限。选择时遵循以下原则：

**优先选 struct 的场景**：

- 需兼容 C 语言代码；

- 存储纯数据（无复杂逻辑），需高效内存操作（如 POD 类型）；

- 数据需完全透明（外部可直接访问成员）；

- 模板元编程中的标签类型或元数据载体。

**优先选 class 的场景**：

- 需面向对象封装（隐藏内部状态和实现）；

- 包含复杂业务逻辑（如数据校验、资源管理）；

- 需使用 private 继承（限制基类成员访问）；

- 团队协作中需明确接口与实现分离。

**灵活调整**：

- 若struct需封装，可显式添加private成员；

- 若class需数据透明，可显式添加public成员；

- 继承方式可通过public/private显式指定，不受类型本身限制。

