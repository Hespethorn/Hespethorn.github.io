---
title: Leetcode 0030.Substring with Concatenation of All Words(python)
tags:
  - leetcode
  - python
  - 滑动窗口
  - 哈希表
  - 字符串
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'substring-with-concatenation'
date: 2024-05-26
---

# [30. Substring with Concatenation of All Words](https://leetcode.com/problems/substring-with-concatenation-of-all-words/)

## 一、问题描述

给定一个字符串 `s` 和一个字符串数组 `words`，找出 `s` 中所有恰好由 `words` 中所有单词串联形成的子串的起始索引。

注意：`words` 中的单词可以以任意顺序串联。

**示例 1**：
```
输入：s = "barfoothefoobarman", words = ["foo","bar"]
输出：[0,9]
```

**示例 2**：
```
输入：s = "wordgoodgoodgoodbestword", words = ["word","good","best","word"]
输出：[]
```

**示例 3**：
```
输入：s = "barfoofoobarthefoobarman", words = ["bar","foo","the"]
输出：[6,9,12]
```

---

## 二、核心概念

### 2.1 问题分析

这道题的核心是**滑动窗口 + 哈希表**的组合应用。

关键观察：
- `words` 中的所有单词长度相同
- 需要找到所有包含 `words` 中所有单词的子串

### 2.2 滑动窗口思想

滑动窗口是一种常用的双指针技巧，用于在一维数据结构中维护一个动态的窗口。

### 2.3 哈希表统计

使用哈希表（字典）来统计 `words` 中每个单词的出现次数。

---

## 三、解题思路

### 3.1 滑动窗口优化法

优化思路：
1. 单词长度相同，记为 `word_len`
2. 窗口大小固定为 `window_len = word_len * len(words)`
3. 根据起始位置对 `word_len` 取模，将问题分解为 `word_len` 个子问题

---

## 四、代码实现

### 4.1 方法一：滑动窗口（推荐）

```python
from collections import Counter
from typing import List

class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        if not s or not words:
            return []
        
        word_len = len(words[0])
        word_count = len(words)
        window_len = word_len * word_count
        s_len = len(s)
        
        if s_len < window_len:
            return []
        
        # Counter: 统计 words 中每个单词出现的次数（哈希表）
        target_cnt = Counter(words)  # 例如: {"foo": 2, "bar": 1}
        result = []
        
        for offset in range(word_len):
            left = offset
            right = offset
            # curr_cnt: 记录当前窗口中每个单词出现的次数
            curr_cnt = Counter()
            # matched: 记录当前窗口中已有多少个单词达到目标次数
            matched = 0
            
            while right + word_len <= s_len:
                word = s[right:right+word_len]
                right += word_len
                
                if word in target_cnt:
                    curr_cnt[word] += 1
                    if curr_cnt[word] == target_cnt[word]:
                        matched += 1
                
                while right - left > window_len:
                    left_word = s[left:left+word_len]
                    left += word_len
                    
                    if left_word in target_cnt:
                        if curr_cnt[left_word] == target_cnt[left_word]:
                            matched -= 1
                        curr_cnt[left_word] -= 1
                
                if matched == len(target_cnt):
                    result.append(left)
        
        return result
```

### 4.2 方法二：滑动窗口（简化版）

```python
from collections import Counter
from typing import List

class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        if not s or not words:
            return []
        
        word_len = len(words[0])
        word_count = len(words)
        window_len = word_len * word_count
        s_len = len(s)
        
        if s_len < window_len:
            return []
        
        # Counter: 统计 words 中每个单词出现的次数（哈希表）
        target_cnt = Counter(words)
        result = []
        
        # 枚举所有可能的起始位置
        for i in range(s_len - window_len + 1):
            curr_cnt = Counter()
            valid = True
            
            # 检查窗口内的每个单词
            for j in range(word_count):
                word = s[i + j * word_len : i + (j + 1) * word_len]
                
                if word not in target_cnt:
                    valid = False
                    break
                
                curr_cnt[word] += 1
                if curr_cnt[word] > target_cnt[word]:
                    valid = False
                    break
            
            if valid:
                result.append(i)
        
        return result
```

---

## 五、复杂度分析

| 方法 | 时间复杂度 | 空间复杂度 |
|:---|:---:|:---:|
| 滑动窗口（推荐） | O(n × k) | O(m × k) |
| 滑动窗口（简化版） | O(n × m × k) | O(m × k) |

---

## 六、测试用例

```python
# 测试用例 1
s = "barfoothefoobarman"
words = ["foo", "bar"]
# 输出: [0, 9]

# 测试用例 2
s = "wordgoodgoodgoodbestword"
words = ["word", "good", "best", "word"]
# 输出: []

# 测试用例 3
s = "barfoofoobarthefoobarman"
words = ["bar", "foo", "the"]
# 输出: [6, 9, 12]
```