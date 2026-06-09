---
title: Leetcode 0131. Palindrome Partitioning
tags:
  - leetcode
categories:
  - Leetcode
  - 回溯算法
series: Leetcode-Cpp
abbrlink: f9b1fe92
date: 2023-09-09 21:14:00
---

## [131. Palindrome Partitioning](https://leetcode.cn/problems/palindrome-partitioning/)

Given a string `s`, partition `s` such that every substring of the partition is a **palindrome**. Return *all possible palindrome partitioning of* `s`.

 **Example 1:**

```
Input: s = "aab"
Output: [["a","a","b"],["aa","b"]]
```

**Example 2:**

```
Input: s = "a"
Output: [["a"]]
```

## 题目大意

给定一个字符串 `s`，将其分割成若干个子串，使得每个子串都是回文串。返回所有可能的分割方案。

例如：

- 输入 `s = "aab"`，输出 `[["a","a","b"],["aa","b"]]`（两种分割方式，每个子串都是回文）；
- 输入 `s = "a"`，输出 `[["a"]]`（仅一种分割方式）。

## 解题思路

核心思路是**递归回溯 + 回文判断**，通过逐步划分字符串寻找所有有效分割方案：

1. **递归状态设计**

   - 递归函数`dfs(i, start)`表示：处理到字符串第`i`个字符，当前正在构建的回文子串从`start`位置开始
   - `path`存储当前分割方案，`ans`存储所有有效方案

2. **核心决策逻辑**

   - **不分割**：不在`i`和`i+1`之间添加分割符，继续处理下一个字符（`i+1`），当前子串的起始位置仍为`start`

   - 分割：在`i`和`i+1`之间添加分割符，此时需判断`s[start..i]`是否为回文串：

     - 若是，则将该子串加入`path`，并开始构建下一个子串（起始位置设为`i+1`）
     - 递归返回后回溯，移除刚加入的子串

3. **终止条件**

   - 当`i == n`（处理完所有字符）时，说明已完成一次有效分割，将`path`加入结果列表

4. **回文判断**

   - 辅助函数`is_palindrome`通过双指针法判断`s[left..right]`是否为回文串
   - 左右指针从两端向中间移动，若所有对应字符相等则为回文

## 代码实现

```
class Solution {
    bool is_palindrome(const string& s, int left, int right) {
        while (left < right) {
            if (s[left++] != s[right--]) {
                return false;
            }
        }
        return true;
    }

public:
    vector<vector<string>> partition(string s) {
        int n = s.size();
        vector<vector<string>> ans;
        vector<string> path;

        // 考虑 i 后面的逗号怎么选
        // start 表示当前这段回文子串的开始位置
        auto dfs = [&](this auto&& dfs, int i, int start) {
            if (i == n) { // s 分割完毕
                ans.emplace_back(path);
                return;
            }

            // 不分割，不选 i 和 i+1 之间的逗号
            if (i < n - 1) { // i=n-1 时只能分割
                // 考虑 i+1 后面的逗号怎么选
                dfs(i + 1, start);
            }

            // 分割，选 i 和 i+1 之间的逗号（把 s[i] 作为子串的最后一个字符）
            if (is_palindrome(s, start, i)) {
                path.emplace_back(s.substr(start, i - start + 1));
                // 考虑 i+1 后面的逗号怎么选
                // start=i+1 表示下一个子串从 i+1 开始
                dfs(i + 1, i + 1);
                path.pop_back(); // 恢复现场
            }
        };

        dfs(0, 0);
        return ans;
    }
};
```