---
title: Leetcode 0014. Longest Common Prefix
tags:
  - leetcode
categories:
  - Leetcode
  - string
series: Leetcode-Cpp
abbrlink: fe879b15
date: 2023-02-14
---

## [14. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/)

## 题目

Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".

**Example 1**:

    Input: strs = ["flower","flow","flight"]
    Output: "fl"

**Example 2**:

    Input: strs = ["dog","racecar","car"]
    Output: ""
    Explanation: There is no common prefix among the input strings.

**Constraints:**

- 1 <= strs.length <= 200
- 0 <= strs[i].length <= 200
- strs[i] consists of only lower-case English letters.

## 题目大意

编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 ""。

## 解题思路

- **以第一个字符串为基准**：
  - 假设第一个字符串是最长公共前缀的候选者
  - 依次检查该字符串的每个字符位置
- **逐位比较所有字符串**：
  - 对于第一个字符串的第 i 个字符，与其他所有字符串的第 i 个字符进行比较
  - 如果所有字符串的第 i 个字符都相同，则继续检查下一位
  - 如果有任何不匹配，或者某个字符串已经没有第 i 个字符，则第 i 位之前的部分就是最长公共前缀
- **处理边界情况**：
  - 如果字符串数组为空，直接返回空字符串
  - 如果比较完第一个字符串的所有字符都完全匹配，则第一个字符串就是最长公共前缀

```
class Solution {
public:
    string longestCommonPrefix(vector<string>& strs) {
        // 处理空数组情况
        if (strs.empty()) {
            return "";
        }
        
        // 以第一个字符串作为初始前缀
        string prefix = strs[0];
        
        // 遍历其他字符串
        for (int i = 1; i < strs.size(); ++i) {
            // 计算当前前缀与第i个字符串的公共前缀
            int j = 0;
            while (j < prefix.size() && j < strs[i].size() && prefix[j] == strs[i][j]) {
                j++;
            }
            // 更新前缀
            prefix = prefix.substr(0, j);
            
            // 如果前缀为空，提前返回
            if (prefix.empty()) {
                return "";
            }
        }
        
        return prefix;
    }
};

```

