---


tags:
  - C++
  - splice
  - LRU
  - Data-Structures-and-Algorithms
categories: [Algorithms, DSA]
abbrlink: ea55cb67
title: C++ 中使用splice( )函数实现LRU算法
date: 2024-06-21
series: [STL]
---

# 导言

LRU（Least Recently Used，最近最少使用）算法是一种常用的缓存淘汰策略，其核心思想是：当缓存空间满时，优先淘汰最近最少使用的元素。在 C++ 中，结合list容器的splice()函数可以高效实现 LRU 算法，因为splice()能以 O (1) 的时间复杂度调整元素位置，非常适合维护元素的访问顺序。

## 一、LRU 算法的核心需求

实现 LRU 算法需要支持以下操作：

1. **访问元素**：如果元素存在于缓存中，将其标记为 “最近使用”；如果不存在，需要插入新元素。

1. **插入元素**：当缓存未满时直接插入；当缓存已满时，删除 “最近最少使用” 的元素后再插入新元素。

1. **维护顺序**：始终保持元素的排列顺序与访问时间相关（最近使用的在前端，最少使用的在末端）。

## 二、数据结构设计

为了高效实现 LRU，我们需要两种数据结构配合：

- **list**容器：用于存储缓存元素，最近使用的元素放在链表头部，最少使用的放在尾部。

- **unordered_map**容器：用于快速查找元素在list中的位置（存储元素键与list迭代器的映射），支持 O (1) 时间复杂度的查找。

示例数据结构定义：

```
#include <list>
#include <unordered_map>
#include <iostream>
using namespace std;

template <typename K, typename V>
class LRUCache {
private:
    int capacity; // 缓存容量
    list<pair<K, V>> cacheList; // 存储键值对，头部为最近使用元素
    unordered_map<K, typename list<pair<K, V>>::iterator> cacheMap; // 键到迭代器的映射
};
```

## 三、利用 splice () 实现核心操作

splice()函数的核心作用是**调整元素在链表中的位置**，这恰好满足 LRU 算法中 “将最近访问元素移到头部” 的需求。下面详解各操作的实现：

### 1. 访问元素（get 操作）

- 若元素存在（通过cacheMap查找）：

  - 使用splice()将该元素迁移到list的头部（标记为最近使用）。

  - 返回元素的值。

- 若元素不存在，返回默认值（如-1）。

代码实现：

```
V get(const K& key) {
    auto it = cacheMap.find(key);
    if (it == cacheMap.end()) {
        return V(); // 元素不存在，返回默认值
    }
    // 将找到的元素迁移到链表头部（最近使用）
    cacheList.splice(cacheList.begin(), cacheList, it->second);
    // 更新map中该键对应的迭代器（此时迭代器已指向头部）
    cacheMap[key] = cacheList.begin();
    return it->second->second;
}
```

### 2. 插入元素（put 操作）

- 若元素已存在：

  - 先删除旧元素（从list和map中移除）。

  - 插入新元素到list头部，并更新map。

- 若元素不存在：

  - 若缓存已满，删除list尾部元素（最少使用）及map中的对应项。

  - 插入新元素到list头部，并添加到map。

代码实现：

```
void put(const K& key, const V& value) {
    auto it = cacheMap.find(key);
    // 元素已存在，先删除旧值
    if (it != cacheMap.end()) {
        cacheList.erase(it->second);
        cacheMap.erase(it);
    }
    // 缓存已满，删除最少使用的元素（尾部）
    if (cacheList.size() >= capacity) {
        K lastKey = cacheList.back().first;
        cacheList.pop_back();
        cacheMap.erase(lastKey);
    }
    // 插入新元素到头部
    cacheList.emplace_front(key, value);
    cacheMap[key] = cacheList.begin();
}
```

## 四、完整示例与测试

下面是完整的 LRU 缓存实现及测试代码：

```
template <typename K, typename V>
class LRUCache {
private:
    int capacity;
    list<pair<K, V>> cacheList;
    unordered_map<K, typename list<pair<K, V>>::iterator> cacheMap;

public:
    LRUCache(int cap) : capacity(cap) {}

    V get(const K& key) {
        auto it = cacheMap.find(key);
        if (it == cacheMap.end()) {
            return V(); // 假设V为int时返回0，实际可根据需求调整
        }
        // 将元素移到头部
        cacheList.splice(cacheList.begin(), cacheList, it->second);
        cacheMap[key] = cacheList.begin();
        return it->second->second;
    }

    void put(const K& key, const V& value) {
        auto it = cacheMap.find(key);
        if (it != cacheMap.end()) {
            cacheList.erase(it->second);
            cacheMap.erase(it);
        }
        if (cacheList.size() >= capacity) {
            K lastKey = cacheList.back().first;
            cacheList.pop_back();
            cacheMap.erase(lastKey);
        }
        cacheList.emplace_front(key, value);
        cacheMap[key] = cacheList.begin();
    }

    // 辅助函数：打印缓存内容（头部到尾部）
    void printCache() {
        for (const auto& p : cacheList) {
            cout << "(" << p.first << "," << p.second << ") ";
        }
        cout << endl;
    }
};

// 测试代码
int main() {
    LRUCache<int, int> cache(2); // 容量为2的缓存

    cache.put(1, 1);
    cache.printCache(); // 输出：(1,1)

    cache.put(2, 2);
    cache.printCache(); // 输出：(2,2) (1,1)

    cache.get(1); // 访问1，移到头部
    cache.printCache(); // 输出：(1,1) (2,2)

    cache.put(3, 3); // 容量满，删除最少使用的2
    cache.printCache(); // 输出：(3,3) (1,1)

    cache.get(2); // 2已被删除，返回0
    cache.printCache(); // 输出：(3,3) (1,1)

    return 0;
}
```

