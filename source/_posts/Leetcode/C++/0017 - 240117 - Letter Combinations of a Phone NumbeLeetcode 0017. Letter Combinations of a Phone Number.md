---
title: Leetcode 0017. Letter Combinations of a Phone Number
tags:
  - leetcode
categories:
  - Leetcode
  - 哈希表
series: Leetcode-Cpp
abbrlink: 1156fe0d
date: 2023-02-26 22:23:00
---

# [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)


## 题目

Given a string containing digits from `2-9` inclusive, return all possible letter combinations that the number could represent.

A mapping of digit to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.

**Example:**

```c
Input: "23"
Output: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"].
```

**Note:**

Although the above answer is in lexicographical order, your answer could be in any order you want.

## 题目大意

给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。


## 解题思路

- **DFS 递归深搜**
  - `digits`：输入的数字字符串
  - `pos`：当前处理的数字位置（索引）
  - `len`：数字字符串的长度
- **执行流程**：
  - 边界检查：若输入为空（`len == 0`），直接返回
  - 终止条件：当`pos == len`时，说明已生成一个完整组合，将其加入结果集处理当前数字：
    - 计算当前数字在映射表中的索引
    - 遍历该数字对应的所有字母
    - 对每个字母执行：加入临时组合→递归处理下一位→回溯移除字母

```
class Solution {
public:

    void dfs(string digits, int pos, int len) {
        // 边界处理：输入为空字符串
        if (len == 0) return;

        // 递归终止条件：处理完所有数字
        if (pos == len) {
            ans.emplace_back(t);  // 将当前组合加入结果集
            return;
        }

        // 获取当前数字对应的字母列表
        int d = digits[pos] - '2';  // 计算映射表索引
        int n = table[d].size();    // 字母数量

        // 遍历所有可能的字母
        for (int i = 0; i < n; ++i) {
            t += table[d][i];               // 加入当前字母
            dfs(digits, pos + 1, len);      // 递归处理下一个数字
            t.pop_back();                   // 回溯：移除当前字母
        }
    }

    vector<string> letterCombinations(string digits) {
        dfs(digits, 0, digits.length());

        return ans;
    }

private:
    string t = "";
    vector<string> ans;
    vector<vector<char>> table{{'a', 'b', 'c'},
                                   {'d', 'e', 'f'},
                                   {'g', 'h', 'i'},
                                   {'j', 'k', 'l'},
                                   {'m', 'n', 'o'},
                                   {'p', 'q', 'r', 's'},
                                   {'t', 'u', 'v'},
                                   {'w', 'x', 'y', 'z'}};
};
```

