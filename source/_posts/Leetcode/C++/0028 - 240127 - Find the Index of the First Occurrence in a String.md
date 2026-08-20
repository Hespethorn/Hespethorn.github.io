---
title: Leetcode 0028. Find the Index of the First Occurrence in a String
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: f6da8f42
date: 2023-04-03
---

## [28. Find the Index of the First Occurrence in a String](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)

Given two strings `needle` and `haystack`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` is not part of `haystack`.

**Example 1:**

```
Input: haystack = "sadbutsad", needle = "sad"
Output: 0
Explanation: "sad" occurs at index 0 and 6.
The first occurrence is at index 0, so we return 0.
```

**Example 2:**

```
Input: haystack = "leetcode", needle = "leeto"
Output: -1
Explanation: "leeto" did not occur in "leetcode", so we return -1.
```

 题目大意

给定两个字符串 `haystack` 和 `needle`，返回 `needle` 在 `haystack` 中第一次出现的位置。如果 `needle` 不是 `haystack` 的一部分，则返回 -1。

## 解题思路

可以使用**滑动窗口**的思想来解决这个问题：

1. 遍历 `haystack`，从每个可能的起始位置开始
2. 检查以当前位置为起点，长度为 `needle` 长度的子串是否与 `needle` 匹配
3. 如果找到匹配的子串，返回当前起始位置
4. 如果遍历结束仍未找到匹配，返回 -1

```
class Solution {
public:
    int strStr(string haystack, string needle) {
        int n = haystack.size();
        int m = needle.size();
        
        // 如果needle为空，返回0（根据题目隐含条件，实际测试用例中needle不为空）
        if (m == 0) return 0;
        
        // 如果haystack长度小于needle，直接返回-1
        if (n < m) return -1;
        
        // 遍历所有可能的起始位置
        for (int i = 0; i <= n - m; ++i) {
            bool match = true;
            // 检查从i开始的子串是否与needle匹配
            for (int j = 0; j < m; ++j) {
                if (haystack[i + j] != needle[j]) {
                    match = false;
                    break;
                }
            }
            // 如果匹配，返回当前起始位置
            if (match) {
                return i;
            }
        }
        
        // 未找到匹配
        return -1;
    }
};
```