---
tags:
  - C++
  - splice
  - sort
categories:
  - C++
  - Data Structures and Algorithms
series: C++
abbrlink: 59ddcdb1
title: C++ 容器中的 sort () 与 splice ()
date: 2024-06-08
---

## 一、sort ()：容器元素的排序利器

sort()是 C++ 标准库中用于排序的函数，其核心功能是对容器中的元素进行升序或自定义规则排序。不过，并非所有容器都支持sort()，它仅适用于**随机访问迭代器**的容器（如vector、deque、array等），而像list、set等容器则有自己的排序方式。

### 1. 基本用法

sort()的函数原型如下（以vector为例）：

```
#include <algorithm> // 需包含算法库

// 升序排序（默认）
sort(begin_iterator, end_iterator);

// 自定义排序规则
sort(begin_iterator, end_iterator, comparator);
```

其中，begin_iterator和end_iterator指定排序的范围（左闭右开），comparator是一个自定义的比较函数或 lambda 表达式，用于定义排序规则。

### 2. 实战示例

- **默认升序排序**：

```
#include <vector>
#include <algorithm>
#include <iostream>

int main() {
    std::vector<int> nums = {3, 1, 4, 1, 5, 9};
    // 升序排序
    std::sort(nums.begin(), nums.end());
    for (int num : nums) {
        std::cout << num << " "; // 输出：1 1 3 4 5 9
    }
    return 0;
}
```

- **自定义降序排序**：

```
// 使用lambda表达式定义降序规则
std::sort(nums.begin(), nums.end(), [](int a, int b) {
    return a > b; // 降序排列
});
```

- **使用** **std::greater** **定制化排序**：

std::greater 是 C++ 标准库中提供的一个函数对象，用于定义大于比较关系，可方便地用于实现降序排序，相比 lambda 表达式，在一些场景下更加简洁规范。

```
#include <vector>
#include <algorithm>
#include <iostream>

int main() {
    std::vector<int> nums = {3, 1, 4, 1, 5, 9};
    // 使用 std::greater 实现降序排序
    std::sort(nums.begin(), nums.end(), std::greater<int>());
    for (int num : nums) {
        std::cout << num << " "; // 输出：9 5 4 3 1 1
    }
    return 0;
}
```

### 3. 注意事项

- sort()会改变容器中元素的原有顺序，且排序后元素是连续存储的（适用于随机访问容器）。

- 对于list容器，由于其不支持随机访问迭代器，不能直接使用std::sort()，而应使用list自带的成员函数sort()，例如：

```
std::list<int> mylist = {3, 1, 4};
mylist.sort(); // list自带的排序函数
```

## 二、splice ()：链表元素的高效迁移

splice()是list和forward_list（单向链表）特有的成员函数，用于将一个链表中的元素迁移到另一个链表中，且操作效率极高（时间复杂度为 O (1)），因为它仅通过修改指针实现，无需复制元素。

### 1. 函数原型（以list为例）

splice()有三种常用形式：

```
// 1. 将整个链表other迁移到当前链表的pos位置前
void splice(const_iterator pos, list& other);

// 2. 将链表other中[first, last)范围内的元素迁移到当前链表的pos位置前
void splice(const_iterator pos, list& other, const_iterator first, const_iterator last);

// 3. 将链表other中it指向的单个元素迁移到当前链表的pos位置前
void splice(const_iterator pos, list& other, const_iterator it);
```

### 2. 实战示例

- **迁移整个链表**：

```
#include <list>
#include <iostream>

int main() {
    std::list<int> list1 = {1, 2, 3};
    std::list<int> list2 = {4, 5, 6};

    // 将list2的所有元素迁移到list1的开头
    list1.splice(list1.begin(), list2);

    // 输出list1：4 5 6 1 2 3
    for (int num : list1) {
        std::cout << num << " ";
    }
    // 此时list2为空
    return 0;
}
```

- **迁移部分元素**：

```
std::list<int> list1 = {1, 2, 3};
std::list<int> list2 = {4, 5, 6, 7};

// 获取list2中5和7的迭代器（即[5,7)范围）
auto it1 = ++list2.begin(); // 指向5
auto it2 = --list2.end();   // 指向7（左闭右开，实际迁移5、6）

// 将list2中[it1, it2)的元素迁移到list1的末尾
list1.splice(list1.end(), list2, it1, it2);

// 输出list1：1 2 3 5 6
// 输出list2：4 7
```

### 3. 注意事项

- splice()执行后，源链表中的迁移元素会被移除，仅存在于目标链表中。

- 迁移操作不会触发元素的拷贝或析构，因此对于包含大型对象的链表，splice()是高效的选择。

- 不能将链表的元素迁移到自身的某个位置（可能导致迭代器失效），但可以在同一链表内迁移元素（例如调整内部顺序）。

## 三、总结

- sort()用于对容器元素排序，适用于支持随机访问迭代器的容器（如vector），list需使用自身的sort()成员函数。

- splice()是链表容器（list、forward_list）的特有函数，用于高效迁移元素，操作代价极低，适合需要频繁调整元素位置的场景。

