---


tags:
  - C++
  - partition
  - remove_if
  - Data-Structures-and-Algorithms
categories: [Algorithms, DSA]
abbrlink: a0783a16
title: 'C++ 算法：remove_if 与 partition '
date: 2024-07-03


---

## 一、remove_if 算法原理与实现细节

### 1.1 核心功能与特性

remove_if是 C++ 标准库中用于**条件过滤**的算法，它能移除容器中满足特定条件的元素。需要特别注意的是：

- 执行的是**逻辑删除**而非物理删除

- 不会改变容器的大小（size）

- 返回指向新的逻辑末尾的迭代器

### 1.2 底层实现逻辑

```
// 模拟标准库remove_if实现逻辑
template<class ForwardIt, class UnaryPredicate>
ForwardIt remove_if(ForwardIt first, ForwardIt last, UnaryPredicate p) {
    // 跳过不符合删除条件的元素
    first = std::find_if(first, last, p);
    if (first != last) {
        // 用后面的元素覆盖需要删除的元素
        for (ForwardIt i = std::next(first); i != last; ++i) {
            if (!p(*i)) {
                *first++ = std::move(*i);
            }
        }
    }
    return first; // 返回新的逻辑终点
}
```

### 1.3 完整应用示例

```
#include <vector>
#include <algorithm>
#include <iostream>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9};
    
    // 定义删除条件：移除所有偶数
    auto is_even = [](int n) { return n % 2 == 0; };
    
    // 执行逻辑删除
    auto new_end = std::remove_if(numbers.begin(), numbers.end(), is_even);
    
    // 输出结果（注意容器实际大小未变）
    std::cout << "逻辑删除后元素: ";
    for (auto it = numbers.begin(); it != new_end; ++it) {
        std::cout << *it << " ";
    }
    std::cout << "\n容器实际大小: " << numbers.size() << std::endl;
    
    // 执行物理删除（真正减小容器大小）
    numbers.erase(new_end, numbers.end());
    std::cout << "物理删除后大小: " << numbers.size() << std::endl;
    
    return 0;
}
```

### 1.4 关键注意事项

- 必须配合erase()才能完成物理删除（"erase-remove 惯用法"）

- 对于非简单类型，移动操作可能导致未定义行为

- 迭代器new_end之后的元素仍存在但值不确定

- 适用于**前向迭代器**及以上（如 vector、deque、list）

## 二、partition 算法原理与应用场景

### 2.1 核心功能与特性

partition用于将容器中的元素**按条件分成两组**：

- 满足条件的元素移至容器前部

- 不满足条件的元素移至容器后部

- 返回指向两组元素分界点的迭代器

- **不稳定排序**（同组元素相对顺序可能改变）

### 2.2 底层实现逻辑

```
// 模拟标准库partition实现逻辑
template<class BidirIt, class UnaryPredicate>
BidirIt partition(BidirIt first, BidirIt last, UnaryPredicate p) {
    // 从前端找到第一个不满足条件的元素
    while (first != last && p(*first)) {
        ++first;
    }
    if (first == last) return first;
    
    // 从后端向前寻找
    --last;
    while (first != last && !p(*last)) {
        --last;
    }
    
    // 交换并继续，直到两个迭代器相遇
    while (first < last) {
        std::swap(*first, *last);
        ++first;
        while (p(*first)) {
            ++first;
        }
        --last;
        while (!p(*last)) {
            --last;
        }
    }
    return first; // 返回分界点
}
```

### 2.3 完整应用示例

```
#include <vector>
#include <algorithm>
#include <iostream>

int main() {
    std::vector<int> data = {3, 1, 4, 1, 5, 9, 2, 6};
    
    // 定义分区条件：小于5的元素放前面
    auto less_than_five = [](int n) { return n < 5; };
    
    // 执行分区操作
    auto partition_point = std::partition(data.begin(), data.end(), less_than_five);
    
    // 输出结果
    std::cout << "小于5的元素: ";
    for (auto it = data.begin(); it != partition_point; ++it) {
        std::cout << *it << " ";
    }
    
    std::cout << "\n大于等于5的元素: ";
    for (auto it = partition_point; it != data.end(); ++it) {
        std::cout << *it << " ";
    }
    
    return 0;
}
```

### 2.4 稳定版本与应用场景

- stable_partition：保持同组元素的相对顺序，但性能略低
- 适用场景：

  - 快速将数据分为符合 / 不符合条件的两组
  - 实现基于条件的部分排序
  - 预处理数据以提高后续算法效率
  - 实现自定义排序逻辑

## 三、算法组合示例（remove_if + partition）

### 3.1 先分区后过滤模式

```
#include <vector>
#include <algorithm>
#include <iostream>
#include <string>

struct Person {
    std::string name;
    int age;
    bool is_student;
};

int main() {
    std::vector<Person> people = {
        {"Alice", 22, true},
        {"Bob", 35, false},
        {"Charlie", 17, true},
        {"David", 42, false},
        {"Eve", 19, true},
        {"Frank", 28, false}
    };
    
    // 步骤1: 先按是否为学生分区
    auto is_student = [](const Person& p) { return p.is_student; };
    auto students_end = std::partition(people.begin(), people.end(), is_student);
    
    // 步骤2: 从学生组中移除年龄小于20的
    auto young_student = [](const Person& p) { return p.age < 20; };
    auto remaining_students = std::remove_if(people.begin(), students_end, young_student);
    
    // 输出结果
    std::cout << "成年学生: \n";
    for (auto it = people.begin(); it != remaining_students; ++it) {
        std::cout << "  " << it->name << ", " << it->age << std::endl;
    }
    
    std::cout << "非学生: \n";
    for (auto it = students_end; it != people.end(); ++it) {
        std::cout << "  " << it->name << ", " << it->age << std::endl;
    }
    
    return 0;
}
```

### 3.2 算法组合的最佳实践

**顺序选择原则**：

- 先分区后过滤：适合需要保留分区结构的场景

- 先过滤后分区：适合需要减少后续处理数据量的场景

**性能考量**：

- 两次遍历 vs 一次遍历的取舍

- 大型数据集应优先考虑减少数据移动

**迭代器有效性维护**：

- 分区后迭代器可能失效，需重新获取

- 过滤操作不影响分区边界外的元素

## 四、总结与最佳实践

**remove_if 使用要点**：

- 始终使用 "erase-remove" 惯用法完成物理删除

- 理解逻辑删除与物理删除的区别

- 注意复杂类型的移动语义问题

**partition 使用要点**：

- 根据是否需要保持顺序选择 partition 或 stable_partition

- 利用返回的分界点迭代器高效处理分组数据

- 大型数据集考虑算法的缓存友好性

**算法组合策略**：

- 先分区后过滤保留分组结构

- 先过滤后分区提高处理效率

- 组合使用时注意迭代器有效性管理
