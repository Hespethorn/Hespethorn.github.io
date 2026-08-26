---

title: Leetcode 0030.Substring with Concatenation of All Words(C++)
tags:
  - leetcode
  - c++
  - 滑动窗口
  - 哈希表
  - 字符串
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 'substring-with-concatenation-cpp'
date: 2024-05-26

---

# [30. Substring with Concatenation of All Words](https://leetcode.com/problems/substring-with-concatenation-of-all-words/)

## 题目

You are given a string `s` and an array of strings `words` of the same length. Return all starting indices of substring(s) in `s` that is a concatenation of each word in `words` exactly once, in any order, and without any intervening characters.

You can return the answer in **any order**.

**Example 1:**

```
Input: s = "barfoothefoobarman", words = ["foo","bar"]
Output: [0,9]
Explanation: Substrings starting at index 0 and 9 are "barfoo" and "foobar" respectively.
The output order does not matter, returning [9,0] is fine too.
```

**Example 2:**

```
Input: s = "wordgoodgoodgoodbestword", words = ["word","good","best","word"]
Output: []
```

**Example 3:**

```
Input: s = "barfoofoobarthefoobarman", words = ["bar","foo","the"]
Output: [6,9,12]
```

## 题目大意

给定一个字符串 `s` 和一个字符串数组 `words`，找出 `s` 中所有恰好由 `words` 中所有单词串联形成的子串的起始索引。

---

## 解题思路

### 核心思想

1. **滑动窗口**：使用双指针维护一个动态窗口，窗口大小为 `word_len * word_count`
2. **哈希表统计**：使用 `unordered_map` 统计目标单词次数和当前窗口单词次数
3. **分组处理**：根据起始位置对 `word_len` 取模，将问题分解为 `word_len` 个子问题

### 算法流程

1. **统计目标次数**：使用 `unordered_map` 统计 `words` 中每个单词的出现次数
2. **分组处理**：对于每个起始偏移量（0 到 `word_len - 1`），使用滑动窗口遍历
3. **动态调整窗口**：维护 `left` 和 `right` 指针，动态调整窗口大小
4. **匹配检查**：当窗口内单词次数与目标次数完全匹配时，记录起始索引

---

## 代码

### 方法一：滑动窗口（推荐）

```cpp
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> findSubstring(string s, vector<string>& words) {
        vector<int> result;
        if (s.empty() || words.empty()) {
            return result;
        }
        
        int word_len = words[0].size();
        int word_count = words.size();
        int window_len = word_len * word_count;
        int s_len = s.size();
        
        if (s_len < window_len) {
            return result;
        }
        
        // 统计目标单词次数
        unordered_map<string, int> target_cnt;
        for (const string& word : words) {
            target_cnt[word]++;
        }
        
        // 按单词长度分组处理
        for (int offset = 0; offset < word_len; offset++) {
            int left = offset;
            int right = offset;
            unordered_map<string, int> curr_cnt;
            int matched = 0;
            
            while (right + word_len <= s_len) {
                // 右移窗口，加入新单词
                string word = s.substr(right, word_len);
                right += word_len;
                
                if (target_cnt.count(word)) {
                    curr_cnt[word]++;
                    if (curr_cnt[word] == target_cnt[word]) {
                        matched++;
                    }
                }
                
                // 窗口大小超过 window_len，左移窗口
                while (right - left > window_len) {
                    string left_word = s.substr(left, word_len);
                    left += word_len;
                    
                    if (target_cnt.count(left_word)) {
                        if (curr_cnt[left_word] == target_cnt[left_word]) {
                            matched--;
                        }
                        curr_cnt[left_word]--;
                    }
                }
                
                // 检查是否匹配所有单词
                if (matched == target_cnt.size()) {
                    result.push_back(left);
                }
            }
        }
        
        return result;
    }
};
```

### 代码解释

1. **统计目标次数**：使用 `unordered_map` 统计 `words` 中每个单词的出现次数
2. **分组处理**：根据起始偏移量对 `word_len` 取模，将问题分解为 `word_len` 个子问题
3. **滑动窗口**：维护 `left` 和 `right` 两个指针，动态调整窗口大小
4. **匹配检查**：维护 `matched` 计数器，当 `matched == target_cnt.size()` 时说明窗口内单词次数完全匹配

### 方法二：滑动窗口（简化版）

```cpp
#include <vector>
#include <string>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> findSubstring(string s, vector<string>& words) {
        vector<int> result;
        if (s.empty() || words.empty()) {
            return result;
        }
        
        int word_len = words[0].size();
        int word_count = words.size();
        int window_len = word_len * word_count;
        int s_len = s.size();
        
        if (s_len < window_len) {
            return result;
        }
        
        unordered_map<string, int> target_cnt;
        for (const string& word : words) {
            target_cnt[word]++;
        }
        
        // 遍历所有可能的起始位置
        for (int i = 0; i <= s_len - window_len; i++) {
            unordered_map<string, int> curr_cnt;
            bool valid = true;
            
            // 检查窗口内的每个单词
            for (int j = 0; j < word_count; j++) {
                string word = s.substr(i + j * word_len, word_len);
                
                if (!target_cnt.count(word)) {
                    valid = false;
                    break;
                }
                
                curr_cnt[word]++;
                if (curr_cnt[word] > target_cnt[word]) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                result.push_back(i);
            }
        }
        
        return result;
    }
};
```

---

## 复杂度分析

| 复杂度 | 说明 |
|:---|:---|
| 时间复杂度 | O(n × k)（推荐版），O(n × m × k)（简化版） |
| 空间复杂度 | O(m × k) |

其中：
- n 是字符串 `s` 的长度
- m 是 `words` 中单词的数量
- k 是每个单词的长度

---

## 注意事项

1. **分组处理的必要性**：由于单词长度固定，按起始偏移量分组可以避免重复计算
2. **哈希表的使用**：`unordered_map` 的查找和插入操作平均时间复杂度为 O(1)
3. **窗口大小控制**：窗口大小必须严格等于 `word_len * word_count`