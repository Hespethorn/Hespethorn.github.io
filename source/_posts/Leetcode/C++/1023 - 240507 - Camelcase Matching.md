---
title: Leetcode 1023. Camelcase Matching
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: b659dbb2
date: 2024-03-23
---

## [1023. Camelcase Matching](https://leetcode.com/problems/camelcase-matching/)

Given an array of strings queries and a string pattern, return a boolean array answer where answer[i] is true if queries[i] matches pattern, and false otherwise.

A query word queries[i] matches pattern if you can insert lowercase English letters into the pattern so that it equals the query. You may insert a character at any position in pattern or you may choose not to insert any characters at all.

**Example 1:**

```
Input: queries = ["FooBar","FooBarTest","FootBall","FrameBuffer","ForceFeedBack"], pattern = "FB"
Output: [true,false,true,true,false]
Explanation: "FooBar" can be generated like this "F" + "oo" + "B" + "ar".
"FootBall" can be generated like this "F" + "oot" + "B" + "all".
"FrameBuffer" can be generated like this "F" + "rame" + "B" + "uffer".
```

**Example 2:**

```
Input: queries = ["FooBar","FooBarTest","FootBall","FrameBuffer","ForceFeedBack"], pattern = "FoBa"
Output: [true,false,true,false,false]
Explanation: "FooBar" can be generated like this "Fo" + "o" + "Ba" + "r".
"FootBall" can be generated like this "Fo" + "ot" + "Ba" + "ll".
```

**Example 3:**

```
Input: queries = ["FooBar","FooBarTest","FootBall","FrameBuffer","ForceFeedBack"], pattern = "FoBaT"
Output: [false,true,false,false,false]
Explanation: "FooBarTest" can be generated like this "Fo" + "o" + "Ba" + "r" + "T" + "est".
```

## 题目大意

给定字符串数组 `queries` 和字符串 `pattern`，返回一个布尔数组 `answer`，其中 `answer[i]` 为 `true` 表示 `queries[i]` 与 `pattern` 匹配，否则为 `false`。

匹配规则：若能在 `pattern` 中**插入任意数量的小写英文字母**（也可插入 0 个），使其最终等于 `queries[i]`，则认为两者匹配。插入操作不改变 `pattern` 原有字符的顺序，且只能插入小写字母。

## 解题思路

核心是通过**双指针遍历**验证 `query` 是否能由 `pattern` 插入小写字母得到，关键在于先定义 “判断字符是否为大写字母” 的函数对象，再基于此实现匹配逻辑：

1. **函数对象定义**：创建 `IsUpper` 函数对象，用于快速判断单个字符是否为大写英文字母（A-Z）。
2. **双指针匹配逻辑**：
   - 对每个 `query` 和 `pattern` 分别用指针 `q_idx` 和 `p_idx` 遍历；
   - 若 `query[q_idx] == pattern[p_idx]`：说明当前字符匹配，两个指针同时后移；
   - 若 `query[q_idx]` 是大写字母：此时若无法与 `pattern` 当前字符匹配（`p_idx` 已越界或字符不相等），则 `query` 必不匹配；
   - 若 `query[q_idx]` 是小写字母：直接跳过（视为插入的字符），仅 `q_idx` 后移；
3. **最终校验**：遍历结束后，需确保 `pattern` 已完全匹配（`p_idx` 到达末尾），且 `query` 剩余字符无大写字母（避免未匹配的大写字母残留）。

```
#include <vector>
#include <string>
using namespace std;

// 函数对象：判断字符是否为大写英文字母
struct IsUpper {
    bool operator()(char c) const {
        // 大写字母的ASCII范围：A(65) ~ Z(90)
        return c >= 'A' && c <= 'Z';
    }
};

class Solution {
public:
    vector<bool> camelMatch(vector<string>& queries, string pattern) {
        vector<bool> answer;
        IsUpper is_upper; // 实例化函数对象，用于判断大写字母
        
        for (const string& query : queries) {
            int q_idx = 0; // query的遍历指针
            int p_idx = 0; // pattern的遍历指针
            int q_len = query.size();
            int p_len = pattern.size();
            bool is_match = true;
            
            while (q_idx < q_len) {
                if (p_idx < p_len && query[q_idx] == pattern[p_idx]) {
                    // 当前字符匹配，双指针同时后移
                    q_idx++;
                    p_idx++;
                } else if (is_upper(query[q_idx])) {
                    // query出现未匹配的大写字母，直接判定不匹配
                    is_match = false;
                    break;
                } else {
                    // query是小写字母，视为插入字符，仅移动query指针
                    q_idx++;
                }
            }
            
            // 需确保pattern完全匹配，且query无残留未匹配的大写字母
            if (is_match && p_idx == p_len) {
                answer.push_back(true);
            } else {
                answer.push_back(false);
            }
        }
        
        return answer;
    }
};
```