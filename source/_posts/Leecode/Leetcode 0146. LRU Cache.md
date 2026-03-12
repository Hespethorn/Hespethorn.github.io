---
title: Leetcode 0146. LRU Cache
tags:
  - leetcode
categories:
  - Leetcode
  - null
series: Leetcode
abbrlink: 629dbba
date: 2023-05-08 20:12:53
---

## [146. LRU Cache](https://leetcode.cn/problems/lru-cache/)

Design a data structure that follows the constraints of a **[Least Recently Used (LRU) cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)**.

Implement the `LRUCache` class:

- `LRUCache(int capacity)` Initialize the LRU cache with **positive** size `capacity`.
- `int get(int key)` Return the value of the `key` if the key exists, otherwise return `-1`.
- `void put(int key, int value)` Update the value of the `key` if the `key` exists. Otherwise, add the `key-value` pair to the cache. If the number of keys exceeds the `capacity` from this operation, **evict** the least recently used key.

The functions `get` and `put` must each run in `O(1)` average time complexity.

## 二、题目大意（简述）

需要设计一个符合 LRU 缓存规则的数据结构，核心需求如下：

1. **初始化**：传入缓存的最大容量（capacity），缓存不能存储超过该容量的键值对。
2. **获取操作（get）**：根据传入的 key 查找缓存中的 value，若存在则返回 value，且该 key 变为 “最近使用” 状态；若不存在则返回 -1。
3. **插入 / 更新操作（put）**：
   - 若 key 已存在：更新其对应的 value，并将该 key 变为 “最近使用” 状态。
   - 若 key 不存在：插入新的键值对，若插入后缓存容量超过限制，需删除 “最近最少使用” 的键值对，再插入新数据。
4. **性能要求**：`get` 和 `put` 操作的平均时间复杂度必须为 O (1)，这是本题的核心难点。

## 三、解题思路

要满足 O (1) 时间复杂度的 `get` 和 `put`，需要结合两种数据结构的优势，先分析单一数据结构的局限性，再推导最优组合。

### 1. 单一数据结构的局限性

- **哈希表（Hash Map）**：
  - 优势：`get`（查找）和 `put`（插入 / 更新）操作可在 O (1) 时间完成，能快速定位键值对。
  - 劣势：哈希表是无序的，无法记录键值对的 “使用时间顺序”，因此无法快速找到 “最近最少使用” 的元素（淘汰时需要遍历，时间复杂度 O (n)）。
- **链表（Linked List）**：
  - 优势：可通过节点顺序记录使用时间（例如：表头为 “最近使用”，表尾为 “最近最少使用”），删除表尾元素（淘汰）和移动节点（更新使用状态）可在 O (1) 时间完成（需知道前驱节点）。
  - 劣势：查找节点需要遍历链表，时间复杂度 O (n)，无法满足 `get` 操作的 O (1) 要求。

### 2. 最优数据结构组合：哈希表 + 双向链表

结合两者优势，形成 “快速定位 + 有序维护” 的方案：

- **双向链表**：维护键值对的使用顺序，定义两个哨兵节点（`head` 和 `tail`）简化边界操作：
  - 规则：新访问 / 更新的节点移到 **`head` 之后**（成为 “最近使用”）；需要淘汰时，删除 **`tail` 之前**的节点（“最近最少使用”）。
  - 双向链表的必要性：移动节点时，需同时修改前驱和后继节点的指针，单向链表无法在 O (1) 时间找到前驱节点。
- **哈希表**：键为缓存的 `key`，值为双向链表中对应的**节点引用**（地址），通过 key 可直接定位到链表节点，实现 O (1) 查找。

```
#include <iostream>
#include <list>
#include <unordered_map>
using std::cout;
using std::endl;
using std::list;
using std::pair;
using std::string;
using std::unordered_map;
class LRUCache {
public:
    LRUCache(int capacity) : _capacity(capacity) {}

    int get(int key) {
        auto it = map.find(key);
        if (it == map.end()) {
            return -1;
        }
        cache.splice(cache.begin(), cache, it->second);
        return map[key]->second;
    }

    void put(int key, int value) {
        auto it = map.find(key);
        if (it != map.end()) {
            map[key]->second = value;
            cache.splice(cache.begin(), cache, map[key]);
        } else {
            if (cache.size() >= _capacity) {
                int lru_key = cache.back().first; // 找到
                cache.pop_back(); // 删除list中最后一个值
                map.erase(lru_key);
            }
            cache.emplace_front(std::make_pair(key, value
            map[key] = cache.begin();
        }
    }

private:
    int _capacity;
    std::list<std::pair<int, int>> cache;
    std::unordered_map<int, std::list<std::pair<int, int>
};
/**
 * Your LRUCache object will be instantiated and called a
 * LRUCache* obj = new LRUCache(capacity);
 * int param_1 = obj->get(key);
 * obj->put(key,value);
 */
int main() {
    LRUCache lRUCache(2);
    lRUCache.put(1, 1);           // cache is {1=1}
    lRUCache.put(2, 2);           // cache is {1=1, 2=2}
    std::cout << lRUCache.get(1) << std::endl;       // r
    lRUCache.put(3, 3);           // LRU key was 2, evict
    std::cout << lRUCache.get(2) << std::endl;       // r
    lRUCache.put(4, 4);           // LRU key was 1, evict
    std::cout << lRUCache.get(1) << std::endl;       // r
    std::cout << lRUCache.get(3) << std::endl;       // r
    std::cout << lRUCache.get(4) << std::endl;       // r
    return 0;
}
```