---

title: Leetcode 0028.Implement strStr()(python)
tags:
  - leetcode
  - python
  - 字符串匹配
  - KMP
  - 暴力匹配
categories: [Algorithms, Leetcode-Python]
series: [Leetcode-Python]
abbrlink: 'implement-strstr'
date: 2024-05-16

---

# [28. Implement strStr()](https://leetcode.com/problems/implement-strstr/)

## 你选用何种方法解题？

本题的核心是**实现字符串匹配算法**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 暴力匹配 | O(n×m) | O(1) | 简单场景 |
| KMP 算法 | O(n + m) | O(m) | **推荐** |

**方法选择理由**：
- **暴力匹配**：代码简单，适合短字符串
- **KMP 算法**：时间效率更高，适合长字符串

---

## 解题过程

### 问题分析

输入：主串 `haystack`，模式串 `needle`
输出：`needle` 在 `haystack` 中第一次出现的索引，不存在返回 -1

### 核心洞察

1. **暴力匹配**：逐个比较，不匹配时回溯
2. **KMP 算法**：利用部分匹配信息，避免不必要的回溯

### 暴力匹配算法流程

以 `haystack = "hello"`, `needle = "ll"` 为例：

```
i=0: h vs l -> 不匹配
i=1: e vs l -> 不匹配
i=2: l vs l -> 匹配，继续
     i+j=3: l vs l -> 匹配，j=1 == lenn-1=1，返回 2
```

---

## 这些方法具体怎么运用？

### 方法一：暴力匹配

**核心逻辑**：
1. **获取长度**：`lenn = len(needle)`, `lenh = len(haystack)`
2. **遍历主串**：从每个位置开始比较
3. **边界检查**：`if i + lenn > lenh` 时跳出
4. **字符比较**：逐个比较字符，全部匹配则返回索引

### 方法二：KMP 算法

**核心逻辑**：
1. **构建 next 数组**：记录模式串的最长相等前后缀
2. **利用 next 数组**：不匹配时根据 next 值跳转，避免回溯

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| `needle` 为空 | 返回 0 |
| `haystack` 长度小于 `needle` | 返回 -1 |
| `needle` 不在 `haystack` 中 | 返回 -1 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 暴力匹配 | O(n×m) | O(1) | n 为主串长度，m 为模式串长度 |
| KMP 算法 | O(n + m) | O(m) | 预处理 O(m)，匹配 O(n) |

---

## 总结与最佳选择

**最快算法**：**KMP 算法**。时间效率更高。

**工程最优选择**：根据场景选择：
- **暴力匹配**：代码简单，适合短字符串或面试快速实现
- **KMP 算法**：适合长字符串或性能要求高的场景

---

## Code

### 方法一：暴力匹配

```python
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        """
        暴力匹配法：
        1. 遍历主串每个位置
        2. 检查从该位置开始的子串是否匹配模式串
        """
        lenn = len(needle)
        lenh = len(haystack)
        
        for i in range(lenh):
            if i + lenn > lenh:
                break
            if haystack[i] == needle[0]:
                for j in range(lenn):
                    if haystack[i + j] != needle[j]:
                        break
                    if j == lenn - 1:
                        return i
        
        return -1
```

### 方法二：KMP 算法

```python
class Solution:
    def strStr(self, haystack: str, needle: str) -> int:
        """
        KMP 算法：
        1. 构建 next 数组
        2. 利用 next 数组进行匹配
        """
        if not needle:
            return 0
        
        n, m = len(haystack), len(needle)
        
        # 构建 next 数组
        next_arr = [0] * m
        j = 0
        for i in range(1, m):
            while j > 0 and needle[i] != needle[j]:
                j = next_arr[j - 1]
            if needle[i] == needle[j]:
                j += 1
            next_arr[i] = j
        
        # KMP 匹配
        j = 0
        for i in range(n):
            while j > 0 and haystack[i] != needle[j]:
                j = next_arr[j - 1]
            if haystack[i] == needle[j]:
                j += 1
            if j == m:
                return i - m + 1
        
        return -1
```