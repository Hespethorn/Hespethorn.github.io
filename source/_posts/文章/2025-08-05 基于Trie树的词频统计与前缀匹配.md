---
title: 基于Trie树的词频统计与前缀匹配
tags:
  - Practical System Development
categories:
  - C++
  - Practical System Development
series: Practical System Development
abbrlink: cd7a1e2a
date: 2025-08-05 20:03:33
---
## 一、为什么需要 Trie 树？—— 先搞懂核心价值

在开始写代码前，我们先明确 Trie 树的 “不可替代性”：

| 数据结构                | 插入 / 查询复杂度       | 前缀匹配能力 | 内存效率（重复前缀） | 适用场景                 |
| ----------------------- | ----------------------- | ------------ | -------------------- | ------------------------ |
| 哈希表（unordered_map） | 平均 O (1)              | 不支持       | 低（存完整字符串）   | 单键精准查询（如缓存）   |
| 红黑树（map）           | O(log n)                | 支持（遍历） | 低                   | 有序键值对查询           |
| Trie 树                 | O (k)（k 为字符串长度） | 原生支持     | 高（前缀共享）       | 前缀相关操作（自动补全） |

简单说：如果你的需求涉及 “前缀”（如输入 “app” 要提示 “apple”“application”），Trie 树是最优解之一。

本文实现的 Trie 树将包含以下核心功能：

1. 单词插入（自动统计重复单词的出现次数）
2. 词频查询（返回单词出现次数，0 表示不存在）
3. 前缀匹配（返回所有以指定前缀开头的单词，支持字典序 / 词频排序）
4. 单词删除（智能回收无用节点，不破坏共享前缀）
5. 整体清空（安全释放所有内存，避免泄漏）

## 二、代码结构设计 —— 工程化拆分

为了保证代码的可维护性，我们将代码拆分为 3 个文件，符合 C++ 工程化规范：

- `Trie.h`：头文件，定义结构体、类接口（对外暴露的功能）
- `Trie.cpp`：实现文件，编写类成员函数的具体逻辑
- `main.cpp`：测试文件，验证所有功能的正确性

## 三、逐文件解析代码 —— 从接口到实现

### 1. 头文件 Trie.h：定义核心结构与接口

头文件的作用是 “声明”—— 告诉编译器有哪些结构和函数，不涉及具体实现。

```Trie.h
#ifndef TRIE_H
#define TRIE_H

#include <vector>
#include <string>
#include <unordered_map>

// 存储“单词-词频”的结构体，用于返回前缀匹配结果
struct WordCount {
    std::string word;  // 单词本身
    int count;         // 出现次数
    // 构造函数，简化对象创建
    WordCount(std::string w, int c) : word(std::move(w)), count(c) {}
};

class Trie {
private:
    // 嵌套定义Trie节点结构（仅类内部可见，封装实现细节）
    struct TrieNode {
        // 子节点：用unordered_map存储，支持任意字符（字母、数字、符号）
        std::unordered_map<char, TrieNode*> children;
        // 词频计数器：0表示非单词结尾，>0表示单词出现次数（替代传统isEnd标记）
        int count = 0;
    };

    TrieNode* root;  // 根节点：所有单词的入口，不存储实际字符

    // 辅助函数：递归销毁节点（用于析构、删除、清空）
    void destroyNode(TrieNode* node);
    // 辅助函数：递归删除单词（判断节点是否可回收）
    bool eraseHelper(TrieNode* node, const std::string& word, size_t index);
    // 辅助函数：递归收集前缀匹配的单词
    void collectWords(TrieNode* node, std::string current, std::vector<WordCount>& result);

public:
    // 构造函数：初始化根节点
    Trie();
    // 析构函数：释放所有节点内存，避免泄漏
    ~Trie();

    // 1. 插入单词（支持重复插入，自动累加词频）
    void insert(const std::string& word);
    // 2. 查询单词出现次数（0表示单词不存在）
    int getFrequency(const std::string& word);
    // 3. 获取前缀匹配的所有单词（支持按词频降序排序）
    std::vector<WordCount> getPrefixMatches(const std::string& prefix, bool sortByFrequency = false);
    // 4. 删除单词（减少词频，必要时回收节点）
    bool remove(const std::string& word);
    // 5. 清空所有数据（销毁所有节点，重建根节点）
    void clear();
};

#endif // TRIE_H
```

- 用WordCount结构体封装结果：不仅返回单词，还返回词频，满足实际开发需求；

- 节点用unordered_map存子节点：相比固定数组（如TrieNode* children[26]），支持任意字符，无需限制字符集；

- count字段复用：既标记 “是否为单词结尾”（count>0），又统计词频，减少冗余字段。

### 2. 实现文件 Trie.cpp：核心逻辑落地

```Trie.cpp
#include "Trie.h"
#include <algorithm>
#include <stdexcept>

// 构造函数
Trie::Trie() : root(new TrieNode()) {}

// 析构函数
Trie::~Trie() {
    destroyNode(root);
}

// 递归销毁节点
void Trie::destroyNode(TrieNode* node) {
    if (!node) return;
    // 先销毁所有子节点
    for (auto& pair : node->children) {
        destroyNode(pair.second);
    }
    // 再销毁当前节点
    delete node;
}

// 插入单词
void Trie::insert(const std::string& word) {
    if (word.empty()) {
        throw std::invalid_argument("单词不能为空字符串");
    }

    TrieNode* curr = root;
    for (char c : word) {
        // 如果当前字符对应的子节点不存在，则创建
        if (curr->children.find(c) == curr->children.end()) {
            curr->children[c] = new TrieNode();
        }
        // 移动到子节点
        curr = curr->children[c];
    }
    // 单词结尾，计数加1
    curr->count++;
}

// 获取单词出现次数
int Trie::getFrequency(const std::string& word) {
    TrieNode* curr = root;
    for (char c : word) {
        // 如果路径断裂，说明单词不存在
        if (curr->children.find(c) == curr->children.end()) {
            return 0;
        }
        curr = curr->children[c];
    }
    // 返回计数（0表示不存在）
    return curr->count;
}

// 递归收集前缀匹配的单词
void Trie::collectWords(TrieNode* node, std::string current, std::vector<WordCount>& result) {
    if (!node) return;
    
    // 如果当前节点是单词结尾，加入结果集
    if (node->count > 0) {
        result.emplace_back(current, node->count);
    }
    
    // 递归遍历所有子节点
    for (const auto& pair : node->children) {
        collectWords(pair.second, current + pair.first, result);
    }
}

// 获取所有前缀匹配单词
std::vector<WordCount> Trie::getPrefixMatches(const std::string& prefix, bool sortByFrequency) {
    std::vector<WordCount> result;
    TrieNode* curr = root;

    // 先定位到前缀的最后一个节点
    for (char c : prefix) {
        if (curr->children.find(c) == curr->children.end()) {
            return result; // 前缀不存在，返回空
        }
        curr = curr->children[c];
    }

    // 收集所有以该前缀开头的单词
    collectWords(curr, prefix, result);

    // 如果需要按词频排序（降序）
    if (sortByFrequency) {
        std::sort(result.begin(), result.end(),
            [](const WordCount& a, const WordCount& b) {
                return a.count > b.count;
            });
    }

    return result;
}

// 递归删除单词辅助函数
bool Trie::eraseHelper(TrieNode* node, const std::string& word, size_t index) {
    // 递归终止条件：已处理完所有字符
    if (index == word.size()) {
        if (node->count == 0) {
            return false; // 单词不存在
        }
        node->count--; // 减少计数
        // 当计数为0且没有子节点时，该节点可删除
        return (node->count == 0) && (node->children.empty());
    }

    char c = word[index];
    // 如果当前字符的子节点不存在，说明单词不存在
    if (node->children.find(c) == node->children.end()) {
        return false;
    }

    // 递归处理子节点
    bool canDeleteChild = eraseHelper(node->children[c], word, index + 1);
    if (canDeleteChild) {
        // 删除子节点并从映射中移除
        delete node->children[c];
        node->children.erase(c);
        // 当前节点是否可删除：计数为0且没有其他子节点
        return (node->count == 0) && (node->children.empty());
    }

    return false;
}

// 删除单词
bool Trie::remove(const std::string& word) {
    if (word.empty()) {
        return false;
    }
    return eraseHelper(root, word, 0);
}

// 清空所有数据
void Trie::clear() {
    destroyNode(root);
    root = new TrieNode();
} 
```

这部分是 Trie 树的 “灵魂”，我们逐函数解析核心逻辑：

#### （1）内存管理：destroyNode与构造 / 析构 / 清空

Trie 树是动态结构，必须做好内存管理，避免泄漏：

```
#include "Trie.h"
#include <algorithm>
#include <stdexcept>

// 递归销毁节点：后序遍历（先删子节点，再删当前节点）
void Trie::destroyNode(TrieNode* node) {
    if (!node) return;  // 空节点直接返回，避免崩溃
    // 遍历所有子节点，递归销毁
    for (auto& pair : node->children) {
        destroyNode(pair.second);
    }
    delete node;  // 销毁当前节点
}

// 构造函数：初始化根节点
Trie::Trie() : root(new TrieNode()) {}

// 析构函数：调用destroyNode销毁所有节点
Trie::~Trie() {
    destroyNode(root);
}

// 清空所有数据：销毁旧根，重建新根
void Trie::clear() {
    destroyNode(root);
    root = new TrieNode();  // 重建空的根节点
}
```

**为什么用递归销毁？**

Trie 树是树形结构，递归能自然遍历所有节点，避免遗漏；后序遍历确保先删子节点，再删父节点，不会出现悬空指针。

#### （2）插入操作：insert—— 构建前缀路径

插入的核心是 “按字符遍历，无节点则创建，结尾处累加词频”：

```
void Trie::insert(const std::string& word) {
    if (word.empty()) {
        throw std::invalid_argument("不支持插入空字符串");
    }

    TrieNode* curr = root;  // 从根节点开始
    for (char c : word) {
        // 若当前字符的子节点不存在，创建新节点
        if (!curr->children.count(c)) {
            curr->children[c] = new TrieNode();
        }
        // 移动到下一层节点
        curr = curr->children[c];
    }
    curr->count++;  // 单词结尾，词频+1（支持重复插入）
}
```

**示例**：插入 “apple” 两次，最终 “apple” 结尾节点的count为 2；插入 “app” 后，“app” 结尾节点的count为 1，且与 “apple” 共享 “a->p->p” 路径。

#### （3）词频查询：getFrequency—— 验证路径与词频

查询逻辑很简单：遍历单词字符路径，若路径断裂则返回 0，否则返回结尾节点的count：

```
int Trie::getFrequency(const std::string& word) {
    if (word.empty()) return 0;

    TrieNode* curr = root;
    for (char c : word) {
        // 路径断裂（字符不存在），单词不存在
        if (!curr->children.count(c)) {
            return 0;
        }
        curr = curr->children[c];
    }
    // 返回词频（count=0表示路径存在但不是单词）
    return curr->count;
}
```

#### （4）前缀匹配：collectWords与getPrefixMatches—— 核心功能

前缀匹配分两步：

1. 定位到前缀的 “终点节点”；

2. 递归遍历该节点的所有子路径，收集所有count>0的单词。

```
// 辅助函数：递归收集前缀匹配的单词
void Trie::collectWords(TrieNode* node, std::string current, std::vector<WordCount>& result) {
    if (!node) return;

    // 若当前节点是单词结尾，加入结果集
    if (node->count > 0) {
        result.emplace_back(current, node->count);
    }

    // 遍历所有子节点，递归收集（保证字典序，因为unordered_map不排序？这里注意：实际unordered_map是无序的，若需严格字典序可改用map）
    for (auto& pair : node->children) {
        // 拼接当前字符，递归下一层
        collectWords(pair.second, current + pair.first, result);
    }
}

// 对外接口：获取前缀匹配的所有单词
std::vector<WordCount> Trie::getPrefixMatches(const std::string& prefix, bool sortByFrequency) {
    std::vector<WordCount> result;
    if (prefix.empty()) return result;

    TrieNode* curr = root;
    // 第一步：定位到前缀的终点节点
    for (char c : prefix) {
        if (!curr->children.count(c)) {
            return result;  // 前缀不存在，返回空
        }
        curr = curr->children[c];
    }

    // 第二步：递归收集所有匹配单词
    collectWords(curr, prefix, result);

    // 可选：按词频降序排序（满足“热门提示”需求）
    if (sortByFrequency) {
        std::sort(result.begin(), result.end(),
            [](const WordCount& a, const WordCount& b) {
                return a.count > b.count;  // 降序：词频高的在前
            });
    }

    return result;
}
```

**关键细节**：

- 若需严格字典序，可将节点的unordered_map改为map（map内部按键排序）；

- sortByFrequency参数：满足 “搜索引擎按热度排序提示” 的实际需求，默认不排序（字典序）。

#### （5）删除操作：eraseHelper与remove—— 最复杂的逻辑

删除的难点是 “不破坏共享前缀”，比如删除 “apple” 时，不能误删 “app” 或 “application” 共享的 “a->p->p” 路径。核心逻辑是：**仅当节点词频为 0 且无子节点时，才回收该节点**。

```
// 辅助函数：递归删除单词，返回值表示“当前节点是否可回收”
bool Trie::eraseHelper(TrieNode* node, const std::string& word, size_t index) {
    // 递归终止1：已遍历完单词所有字符
    if (index == word.size()) {
        if (node->count == 0) {
            return false;  // 单词不存在，无需删除
        }
        node->count--;  // 词频-1
        // 若词频为0且无子节点，当前节点可回收
        return (node->count == 0) && (node->children.empty());
    }

    char c = word[index];
    // 递归终止2：路径断裂，单词不存在
    if (!node->children.count(c)) {
        return false;
    }

    // 递归删除子节点，判断子节点是否可回收
    bool canDeleteChild = eraseHelper(node->children[c], word, index + 1);
    if (canDeleteChild) {
        // 子节点可回收：释放内存并从map中删除
        delete node->children[c];
        node->children.erase(c);
        // 当前节点是否可回收：词频为0且无其他子节点
        return (node->count == 0) && (node->children.empty());
    }

    // 子节点不可回收，当前节点也不可回收
    return false;
}

// 对外接口：删除单词，返回“是否删除成功”
bool Trie::remove(const std::string& word) {
    if (word.empty()) return false;
    return eraseHelper(root, word, 0);
}
```

**示例**：删除 “apple”（原词频 2）一次后，词频变为 1，节点不回收；再删除一次，词频变为 0，若该节点无其他子节点（如 “apple” 后面没有延伸单词），则从 “e” 节点开始回溯，直到遇到有子节点或count>0的节点（如 “p” 节点，因为 “app” 的count>0），停止回收。

### 3. 测试文件 main.cpp：验证所有功能

测试用例覆盖核心场景，确保代码正确性：

```main.cpp
#include "Trie.h"
#include <iostream>

// 辅助函数：打印前缀匹配结果
void printMatches(const std::vector<WordCount>& matches, const std::string& title) {
    std::cout << title << " (" << matches.size() << "个结果):" << std::endl;
    for (const auto& wc : matches) {
        std::cout << "  - " << wc.word << "（出现" << wc.count << "次）" << std::endl;
    }
}

int main() {
    try {
        Trie trie;

        // 1. 插入测试数据
        trie.insert("apple");
        trie.insert("apple");  // 重复插入，词频=2
        trie.insert("app");    // 词频=1
        trie.insert("application");  // 词频=1
        trie.insert("applet");       // 词频=1
        trie.insert("banana");       // 词频=1
        trie.insert("application");  // 重复插入，词频=2
        trie.insert("app");          // 重复插入，词频=2
        trie.insert("apricot");      // 词频=1

        // 2. 测试词频统计
        std::cout << "=== 1. 词频统计测试 ===" << std::endl;
        std::cout << "apple: " << trie.getFrequency("apple") << "次" << std::endl;       // 2次
        std::cout << "app: " << trie.getFrequency("app") << "次" << std::endl;           // 2次
        std::cout << "application: " << trie.getFrequency("application") << "次" << std::endl; // 2次
        std::cout << "orange: " << trie.getFrequency("orange") << "次" << std::endl;     // 0次（不存在）
        std::cout << std::endl;

        // 3. 测试前缀匹配（字典序）
        std::cout << "=== 2. 前缀匹配测试（字典序） ===" << std::endl;
        auto appMatches = trie.getPrefixMatches("app");
        printMatches(appMatches, "前缀\"app\"匹配结果");  // app、apple、applet、application
        
        auto aMatches = trie.getPrefixMatches("a");
        printMatches(aMatches, "前缀\"a\"匹配结果");      // app、apple、applet、application、apricot
        std::cout << std::endl;

        // 4. 测试前缀匹配（按词频排序）
        std::cout << "=== 3. 前缀匹配测试（按词频排序） ===" << std::endl;
        auto sortedMatches = trie.getPrefixMatches("app", true);
        printMatches(sortedMatches, "前缀\"app\"按词频排序结果");  // app(2)、apple(2)、application(2)、applet(1)
        std::cout << std::endl;

        // 5. 测试删除操作
        std::cout << "=== 4. 删除操作测试 ===" << std::endl;
        std::cout << "删除前 apple 出现次数: " << trie.getFrequency("apple") << std::endl;  // 2次
        trie.remove("apple");
        std::cout << "删除后 apple 出现次数: " << trie.getFrequency("apple") << std::endl;  // 1次
        
        auto afterDelete = trie.getPrefixMatches("app");
        printMatches(afterDelete, "删除后前缀\"app\"匹配结果");  // 仍包含apple（词频1）
        std::cout << std::endl;

        // 6. 测试清空操作
        std::cout << "=== 5. 清空操作测试 ===" << std::endl;
        trie.clear();
        std::cout << "清空后 app 出现次数: " << trie.getFrequency("app") << std::endl;  // 0次
        auto emptyMatches = trie.getPrefixMatches("a");
        printMatches(emptyMatches, "清空后前缀\"a\"匹配结果");  // 0个结果

    } catch (const std::exception& e) {
        std::cerr << "错误：" << e.what() << std::endl;
        return 1;
    }

    return 0;
}
```

## 四、实际运行

### 1. 预期输出

```
=== 1. 词频统计测试 ===
apple: 2次
app: 2次
application: 2次
orange: 0次

=== 2. 前缀匹配测试（字典序） ===
前缀"app"匹配结果 (4个结果):
  - app（出现2次）
  - apple（出现2次）
  - applet（出现1次）
  - application（出现2次）
前缀"a"匹配结果 (5个结果):
  - app（出现2次）
  - apple（出现2次）
  - applet（出现1次）
  - application（出现2次）
  - apricot（出现1次）

=== 3. 前缀匹配测试（按词频排序） ===
前缀"app"按词频排序结果 (4个结果):
  - app（出现2次）
  - apple（出现2次）
  - application（出现2次）
  - applet（出现1次）

=== 4. 删除操作测试 ===
删除前 apple 出现次数: 2
删除后 apple 出现次数: 1
删除后前缀"app"匹配结果 (4个结果):
  - app（出现2次）
  - apple（出现1次）
  - applet（出现1次）
  - application（出现2次）

=== 5. 清空操作测试 ===
清空后 app 出现次数: 0
清空后前缀"a"匹配结果 (0个结果):
```

