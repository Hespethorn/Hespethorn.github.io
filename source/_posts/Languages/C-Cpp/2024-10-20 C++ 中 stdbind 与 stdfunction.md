---

title: 'C++ 中 std::bind 与 std::function'
tags:
  - function
  - bind
  - Foundational-Syntax-and-Core-Concepts
categories: [Languages, C-Cpp]
abbrlink: a9e5787b
date: 2024-10-20
series: [C-Cpp]
---
## 一、std::function —— 可调用对象的 "万能容器"

### 1.1 概念解析：什么是 std::function？

std::function 是 C++11 标准库 <functional> 头文件中引入的**通用可调用对象封装器**，其核心作用是将各种不同类型的可调用实体（函数指针、成员函数指针、lambda 表达式、函数对象）统一到一个类型安全的容器中。

可以将其类比为 "函数的通用接口转换器"—— 无论原始可调用对象的类型如何，只要签名（返回值类型 + 参数类型列表）匹配，就能被 std::function 封装并统一调用。

### 1.2 实现原理：类型擦除（Type Erasure）

std::function 本质是通过**类型擦除**技术实现的多态封装，核心流程如下：

1. 定义一个抽象基类（如 function_base），包含纯虚函数 operator()（对应目标签名）和析构函数；

1. 为每个具体的可调用对象类型，实现一个模板派生类（如 function_impl<T>），继承自 function_base，并在 operator() 中调用具体对象；

1. std::function 类内部持有一个 function_base* 指针，指向具体的 function_impl 实例；

1. 调用 std::function 的 operator() 时，通过基类指针调用派生类的实现，实现多态分发。

**关键特性**：

- 类型安全：编译期检查签名匹配性，不匹配则编译失败；

- 值语义：支持拷贝、赋值，内部通过堆内存存储具体可调用对象；

- 非侵入式：无需修改原有可调用对象的定义即可封装。

### 1.3 语法规范与基础用法

#### 1.3.1 模板定义

```
template <typename Ret, typename... Args>
class function<Ret(Args...)>;
```

- Ret：返回值类型（可 void）；

- Args...：参数类型列表（可变参数模板，C++11 特性）。

#### 1.3.2 基础使用示例

```
#include <functional>
#include <iostream>
#include <vector>

// 1. 普通函数
int add(int a, int b) { return a + b; }

// 2. 函数对象（仿函数）
struct Multiply {
    int operator()(int a, int b) const {
        return a * b;
    }
};

// 3. 成员函数
struct Calculator {
    int subtract(int a, int b) const {
        return a - b;
    }
};

int main() {
    // 封装普通函数
    std::function<int(int, int)> func_add = add;
    std::cout << "add(2,3) = " << func_add(2, 3) << std::endl; // 输出 5

    // 封装函数对象
    std::function<int(int, int)> func_mul = Multiply{};
    std::cout << "multiply(2,3) = " << func_mul(2, 3) << std::endl; // 输出 6

    // 封装成员函数（需绑定对象实例）
    Calculator calc;
    std::function<int(int, int)> func_sub = 
        std::bind(&Calculator::subtract, &calc, std::placeholders::_1, std::placeholders::_2);
    std::cout << "subtract(5,2) = " << func_sub(5, 2) << std::endl; // 输出 3

    // 封装lambda表达式
    std::function<int(int, int)> func_div = [](int a, int b) {
        if (b == 0) throw std::invalid_argument("division by zero");
        return a / b;
    };
    try {
        std::cout << "divide(6,2) = " << func_div(6, 2) << std::endl; // 输出 3
    } catch (const std::exception& e) {
        std::cerr << e.what() << std::endl;
    }

    // 存储到容器中（统一调用）
    std::vector<std::function<int(int, int)>> funcs = {func_add, func_mul, func_sub, func_div};
    int x = 10, y = 4;
    for (const auto& f : funcs) {
        std::cout << "f(" << x << "," << y << ") = " << f(x, y) << std::endl;
    }

    return 0;
}
```

### 1.4 高级特性与注意事项

#### 1.4.1 空状态与有效性检查

std::function 存在**空状态**（未绑定任何可调用对象），调用空的 std::function 会抛出 std::bad_function_call 异常，因此使用前建议检查有效性：

```
std::function<int(int, int)> func;
if (!func) { // 或 func == nullptr
    std::cout << "func is empty" << std::endl;
}
// func(1,2); // 抛出 std::bad_function_call
```

#### 1.4.2 异常安全

- std::function 的拷贝 / 赋值操作：若内部存储的可调用对象拷贝构造函数抛出异常，std::function 会保证自身状态的一致性（要么拷贝成功，要么保持原有状态）；

- 调用时的异常传播：被封装函数抛出的异常会直接传播给调用者，std::function 不拦截任何异常。

#### 1.4.3 线程安全性

- **非线程安全**：std::function 的拷贝、赋值、调用操作不是线程安全的；

- **线程安全建议**：若多个线程同时访问同一个 std::function 对象，需通过互斥锁（如 std::mutex）进行同步；若仅读取（调用），且对象状态不变，则无需同步。

#### 1.4.4 性能开销

std::function 因类型擦除和多态调用，存在一定性能开销，主要来自：

1. 堆内存分配（存储具体可调用对象）；

1. 虚函数调用（通过基类指针调用派生类的 operator()）；

1. 拷贝时的深拷贝（需拷贝内部存储的可调用对象）。

## 二、std::bind —— 参数绑定的 "适配器"

### 2.1 概念解析：什么是 std::bind？

std::bind 是 C++11 标准库 <functional> 头文件中引入的**参数绑定工具**，其核心作用是：

- 将函数的部分或全部参数**预先绑定**到指定值，生成一个新的可调用对象；

- 调整函数参数的**顺序**；

- 将成员函数与对象实例绑定（解决成员函数需要 this 指针的问题）。

可以将其类比为 "函数参数的预处理器"—— 通过绑定部分参数，将一个多参数函数转换为少参数（或无参数）的函数，适配不同的调用场景。

### 2.2 实现原理：函数适配器模式

std::bind 的本质是一个**函数适配器**，其工作流程如下：

1. 接收一个可调用对象 f 和一组参数 args...；

1. 生成一个**绑定对象**（bind object），内部存储 f 的拷贝和 args... 的拷贝；

1. 当调用绑定对象时，绑定对象会将存储的参数 args... 展开，替换占位符后传递给 f，并调用 f。

**关键特性**：

- 延迟计算：绑定参数时不执行函数，仅在调用绑定对象时执行；

- 参数占位：通过 std::placeholders::_1, _2, ... 表示后续调用时需要传入的参数；

- 值语义：绑定对象支持拷贝、赋值，内部存储的参数和函数对象均为拷贝。

### 2.3 语法规范与基础用法

#### 2.3.1 函数原型

```
template <typename F, typename... Args>
constexpr /* C++14 新增 constexpr */ bind(F&& f, Args&&... args);
```

- F&&：被绑定的可调用对象（支持完美转发，C++11 特性）；

- Args&&...：绑定的参数列表（可包含具体值或占位符）。

#### 2.3.2 核心概念：占位符（Placeholders）

std::placeholders 命名空间下定义了占位符 _1, _2, ..., _N（N 至少为 20，C++11 标准要求），表示绑定对象被调用时需要传入的第 N 个参数：

- _1：调用绑定对象时的第一个参数；

- _2：调用绑定对象时的第二个参数；

- 以此类推。

#### 2.3.3 基础使用场景

##### 场景 1：绑定部分参数（参数固化）

将函数的部分参数预先绑定为固定值，减少调用时需要传入的参数数量：

```
#include <functional>
#include <iostream>

int pow(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; ++i) {
        result *= base;
    }
    return result;
}

int main() {
    // 绑定第二个参数为 2（计算平方），第一个参数由调用时传入（_1）
    auto square = std::bind(pow, std::placeholders::_1, 2);
    std::cout << "square(3) = " << square(3) << std::endl; // 3^2 = 9

    // 绑定第一个参数为 2（计算 2 的 N 次方），第二个参数由调用时传入（_1）
    auto pow2 = std::bind(pow, 2, std::placeholders::_1);
    std::cout << "pow2(4) = " << pow2(4) << std::endl; // 2^4 = 16

    // 绑定全部参数（无占位符），调用时无需传入参数
    auto pow3_4 = std::bind(pow, 3, 4);
    std::cout << "pow3_4() = " << pow3_4() << std::endl; // 3^4 = 81

    return 0;
}
```

##### 场景 2：调整参数顺序

通过占位符调整函数参数的传递顺序：

```
#include <functional>
#include <iostream>
#include <string>

void print(const std::string& a, const std::string& b) {
    std::cout << "a: " << a << ", b: " << b << std::endl;
}

int main() {
    // 交换参数顺序：调用时传入的第一个参数给 b，第二个给 a
    auto print_reversed = std::bind(print, std::placeholders::_2, std::placeholders::_1);
    print("hello", "world");          // 输出 "a: hello, b: world"
    print_reversed("hello", "world"); // 输出 "a: world, b: hello"

    return 0;
}
```

##### 场景 3：绑定成员函数

成员函数需要隐含的 this 指针作为第一个参数，std::bind 可将成员函数与对象实例绑定：

```
#include <functional>
#include <iostream>
#include <vector>
#include <algorithm>

struct Person {
    std::string name;
    int age;

    void print() const {
        std::cout << "name: " << name << ", age: " << age << std::endl;
    }

    bool is_adult() const {
        return age >= 18;
    }
};

int main() {
    std::vector<Person> people = {
        {"Alice", 25}, {"Bob", 17}, {"Charlie", 30}
    };

    // 绑定成员函数 print 到具体对象
    Person alice = {"Alice", 25};
    auto print_alice = std::bind(&Person::print, &alice); // 传入对象指针（避免拷贝）
    print_alice(); // 输出 "name: Alice, age: 25"

    // 结合算法使用：统计成年人数量（绑定成员函数 is_adult）
    int adult_count = std::count_if(people.begin(), people.end(),
        std::bind(&Person::is_adult, std::placeholders::_1)); // _1 表示遍历的 Person 对象
    std::cout << "adult count: " << adult_count << std::endl; // 输出 2

    return 0;
}
```

### 2.4 高级特性与注意事项

#### 2.4.1 参数传递方式

std::bind 对绑定的参数采用**值传递**（默认拷贝），若需传递引用，需使用 std::ref 或 std::cref：

```
#include <functional>
#include <iostream>

void modify(int& x) {
    x += 10;
}

int main() {
    int a = 5;
    // 错误：std::bind 会拷贝 a，modify 修改的是拷贝后的副本
    auto bad_bind = std::bind(modify, a);
    bad_bind();
    std::cout << "a = " << a << std::endl; // 输出 5（未修改）

    // 正确：使用 std::ref 传递引用
    auto good_bind = std::bind(modify, std::ref(a));
    good_bind();
    std::cout << "a = " << a << std::endl; // 输出 15（已修改）

    return 0;
}
```

#### 2.4.2 绑定对象的类型

std::bind 生成的绑定对象类型是**未指定的**（implementation-defined），无法直接写出，因此必须通过 auto 推导类型，或存储到 std::function 中：

```
// 正确：auto 推导绑定对象类型
auto bind_obj = std::bind(add, 1, std::placeholders::_1);

// 正确：存储到 std::function 中
std::function<int(int)> func = std::bind(add, 1, std::placeholders::_1);

// 错误：无法写出绑定对象的具体类型
// std::bind<int(int)>(add, 1, std::placeholders::_1) bind_obj2; // 编译失败
```

#### 2.4.3 嵌套绑定

std::bind 支持嵌套使用，即绑定的参数可以是另一个 std::bind 生成的绑定对象：

```
#include <functional>
#include <iostream>

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

int main() {
    // 计算：(x + 2) * 3，其中 x 是调用时传入的参数
    auto compute = std::bind(mul, std::bind(add, std::placeholders::_1, 2), 3);
    std::cout << compute(4) << std::endl; // (4+2)*3 = 18

    return 0;
}
```

#### 2.4.4 与 lambda 表达式的对比

在很多场景下，std::bind 的功能可被 lambda 表达式替代，且 lambda 表达式通常具有更好的可读性和性能：

| 特性         | std::bind                          | lambda 表达式                  |
| ------------ | ---------------------------------- | ------------------------------ |
| 可读性       | 依赖占位符，复杂场景可读性差       | 直观的参数列表，可读性好       |
| 性能         | 可能存在额外的参数转发开销         | 无额外开销，编译器优化更充分   |
| 参数调整     | 支持参数顺序调整、部分绑定         | 需显式处理参数，灵活性稍低     |
| 捕获外部变量 | 需通过绑定参数传递，不支持捕获列表 | 支持值捕获、引用捕获等多种方式 |
| 适用场景     | 成员函数绑定、参数顺序调整         | 简单参数绑定、局部函数逻辑     |

