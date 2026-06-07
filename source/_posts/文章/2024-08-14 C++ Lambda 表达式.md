---
tags:
  - C++
  - Lambda
  - STL 算法
categories:
  - C++
  - Foundational Syntax and Core Concepts
series: C++
abbrlink: e4d97659
title: C++ Lambda 表达式
date: 2024-08-14 21:04:06
---

## 导言

在现代 C++ 开发中，lambda 表达式（匿名函数）已经成为编写简洁高效代码的重要工具。尤其在配合 STL 算法（如`for_each`）时，lambda 表达式能够消除编写命名函数或函数对象的额外开销，使代码更加紧凑直观。

## 一、Lambda 表达式的基本语法

lambda 表达式的完整语法结构如下：

```cpp
[capture](parameters) mutable noexcept -> return_type {
    // 函数体
}
```

各组成部分的含义：

- `[capture]`：捕获列表，定义 lambda 表达式可以访问的外部变量
- `(parameters)`：参数列表，与普通函数的参数列表类似
- `mutable`：可选修饰符，允许修改按值捕获的变量
- `noexcept`：可选修饰符，指定函数不会抛出异常
- `-> return_type`：返回类型，当函数体只有 return 语句时可省略
- `{}`：函数体，包含具体的执行逻辑

### 1.1 最简单的 Lambda 表达式

最简化的 lambda 表达式可以省略参数列表、返回类型和修饰符，仅保留捕获列表和函数体：

```cpp
#include <iostream>

int main() {
    // 无参数、无返回值的lambda表达式
    auto hello = []{
        std::cout << "Hello, Lambda!" << std::endl;
    };
    
    hello();  // 调用lambda表达式
    return 0;
}
```

## 二、捕获列表详解

捕获列表是 lambda 表达式最具特色的部分，它控制着 lambda 如何访问外部作用域中的变量。根据捕获方式的不同，可分为以下几类：

### 2.1 捕获列表的简化写法

C++ 提供了几种简化的捕获方式：

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int x = 5, y = 10;
    
    // 1. 捕获所有外部变量（按值）
    auto by_value = [=]() {
        std::cout << "x = " << x << ", y = " << y << std::endl;
    };
    
    // 2. 捕获所有外部变量（按引用）
    auto by_ref = [&]() {
        x++;
        y++;
        std::cout << "x = " << x << ", y = " << y << std::endl;
    };
    
    // 3. 混合方式：默认按值，特定变量按引用
    auto mixed1 = [=, &x]() {
        x++;  // 可以修改，因为x是按引用捕获
        // y++;  // 错误：y是按值捕获
        std::cout << "x = " << x << ", y = " << y << std::endl;
    };
    
    // 4. 混合方式：默认按引用，特定变量按值
    auto mixed2 = [&, y]() {
        x++;  // 可以修改，x按引用捕获
        // y++;  // 错误：y按值捕获
        std::cout << "x = " << x << ", y = " << y << std::endl;
    };
    
    by_value();
    by_ref();
    mixed1();
    mixed2();
    
    return 0;
}
```

### 2.2 mutable 修饰符的作用

默认情况下，按值捕获的变量在 lambda 表达式内部是只读的，使用`mutable`可以解除这一限制：

```cpp
#include <iostream>

int main() {
    int a = 10;
    
    // 不使用mutable，无法修改按值捕获的变量
    auto func1 = [a]() {
        // a++;  // 错误
        std::cout << "a = " << a << std::endl;
    };
    
    // 使用mutable，可以修改按值捕获的变量（但不影响外部变量）
    auto func2 = [a]() mutable {
        a++;  // 允许修改
        std::cout << "内部a = " << a << std::endl;
    };
    
    func1();  // 输出：a = 10
    func2();  // 输出：内部a = 11
    std::cout << "外部a = " << a << std::endl;  // 输出：外部a = 10
    
    return 0;
}
```

## 三、与 STL 算法配合使用

lambda 表达式与 STL 算法（尤其是`for_each`）配合使用时，能极大简化代码：

### 3.1 for_each 算法示例

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // 使用lambda表达式遍历并打印元素
    std::cout << "元素列表：";
    std::for_each(numbers.begin(), numbers.end(),
                  [](int n) { std::cout << n << " "; });
    std::cout << std::endl;
    
    // 使用lambda表达式修改元素（增加10）
    std::for_each(numbers.begin(), numbers.end(),
                  [](int& n) { n += 10; });
    
    // 再次打印修改后的元素
    std::cout << "修改后：";
    std::for_each(numbers.begin(), numbers.end(),
                  [](int n) { std::cout << n << " "; });
    std::cout << std::endl;
    
    return 0;
}
```

**输出结果**：

```plaintext
元素列表：1 2 3 4 5 
修改后：11 12 13 14 15 
```

### 3.2 带捕获的 lambda 与算法结合

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int threshold = 5;
    int count = 0;
    int sum = 0;
    
    // 统计大于threshold的元素并计算它们的和
    std::for_each(numbers.begin(), numbers.end(),
                  [threshold, &count, &sum](int n) {
                      if (n > threshold) {
                          count++;
                          sum += n;
                      }
                  });
    
    std::cout << "大于" << threshold << "的元素有" << count << "个，";
    std::cout << "它们的和是" << sum << std::endl;
    
    return 0;
}
```

**输出结果**：

```plaintext
大于5的元素有5个，它们的和是40
```

## 四、Lambda 表达式的返回类型

大多数情况下，lambda 表达式的返回类型可以被编译器自动推导，无需显式指定。但在某些复杂情况下（如多个 return 语句返回不同类型），需要显式指定返回类型：

```cpp
#include <iostream>

int main() {
    // 自动推导返回类型（int）
    auto add = [](int a, int b) {
        return a + b;
    };
    
    // 显式指定返回类型
    auto divide = [](double a, double b) -> double {
        if (b == 0) return 0;
        return a / b;
    };
    
    std::cout << "3 + 5 = " << add(3, 5) << std::endl;
    std::cout << "10 / 3 = " << divide(10, 3) << std::endl;
    
    return 0;
}
```

## 五、Lambda 表达式的实际应用场景

### 5.1 作为回调函数

```cpp
#include <iostream>
#include <functional>

// 接受lambda作为回调函数
void process_data(int data, const std::function<void(int)>& callback) {
    // 处理数据...
    int result = data * 2;
    // 调用回调函数
    callback(result);
}

int main() {
    int value = 5;
    
    // 传递lambda作为回调
    process_data(value, [](int result) {
        std::cout << "处理结果: " << result << std::endl;
    });
    
    // 带捕获的回调
    process_data(value, [value](int result) {
        std::cout << value << "的两倍是: " << result << std::endl;
    });
    
    return 0;
}
```

### 5.2 在排序算法中使用

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 9, 1, 5, 6};
    
    // 按升序排序
    std::sort(numbers.begin(), numbers.end());
    
    // 按降序排序（使用lambda表达式）
    std::sort(numbers.begin(), numbers.end(),
              [](int a, int b) { return a > b; });
    
    // 打印结果
    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```



