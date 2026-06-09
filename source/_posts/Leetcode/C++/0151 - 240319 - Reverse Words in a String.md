---
title: Leetcode 0151. Reverse Words in a String
tags:
  - leetcode
categories:
  - Leetcode
  - String
series: Leetcode-Cpp
abbrlink: ef2e4aa2
date: 2023-10-01 19:57:00
---

## [151. Reverse Words in a String](https://leetcode.cn/problems/reverse-words-in-a-string/)

Given an input string `s`, reverse the order of the **words**.

A **word** is defined as a sequence of non-space characters. The **words** in `s` will be separated by at least one space.

Return *a string of the words in reverse order concatenated by a single space.*

**Note** that `s` may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.

**Example 1:**

```
Input: s = "the sky is blue"
Output: "blue is sky the"
```

**Example 2:**

```
Input: s = "  hello world  "
Output: "world hello"
Explanation: Your reversed string should not contain leading or trailing spaces.
```

**Example 3:**

```
Input: s = "a good   example"
Output: "example good a"
Explanation: You need to reduce multiple spaces between two words to a single space in the reversed string.
```

## 题目分析

需要将字符串中的单词顺序反转，同时处理多余的空格（包括前导、尾随和单词间的多个空格），最终返回单词间仅用单个空格分隔的结果。

## 解题思路

1. 首先处理字符串，去除多余的空格
2. 反转整个字符串
3. 再反转每个单词，得到最终结果

这种方法可以在 O (n) 时间复杂度内完成，且不需要额外的空间存储单词列表。

```
class Solution {
public:
    string reverseWords(string s) {
        // 1. 移除多余空格
        int slow = 0;
        for (int i = 0; i < s.size(); ++i) {
            if (s[i] != ' ') {  // 遇到非空格字符
                if (slow != 0) s[slow++] = ' ';  // 不是第一个单词则先加空格
                // 复制整个单词
                while (i < s.size() && s[i] != ' ') {
                    s[slow++] = s[i++];
                }
            }
        }
        s.resize(slow);  // 截断字符串，去除多余部分
        
        // 2. 反转整个字符串
        reverse(s.begin(), s.end());
        
        // 3. 反转每个单词
        int start = 0;
        for (int i = 0; i <= s.size(); ++i) {
            if (i == s.size() || s[i] == ' ') {  // 遇到空格或字符串结尾
                reverse(s.begin() + start, s.begin() + i);
                start = i + 1;  // 更新下一个单词的起始位置
            }
        }
        
        return s;
    }
};
```