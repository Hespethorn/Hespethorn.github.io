---
title: Leetcode 0076. Minimum Window Substring
tags:
  - leetcode
categories:
  - Leetcode
  - 哈希表
series: Leetcode
abbrlink: b6d25d96
date: 2023-06-13 21:50:00
---

# [76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)

## 题目

Given a string S and a string T, find the minimum window in S which will contain all the characters in T in complexity O(n).

Example:

```c
Input: S = "ADOBECODEBANC", T = "ABC"
Output: "BANC"
```

Note:    

- If there is no such window in S that covers all characters in T, return the empty string "".
- If there is such window, you are guaranteed that there will always be only one unique minimum window in S.

## 题目大意

给定一个源字符串 s，再给一个字符串 T，要求在源字符串中找到一个窗口，这个窗口包含由字符串各种排列组合组成的，窗口中可以包含 T 中没有的字符，如果存在多个，在结果中输出最小的窗口，如果找不到这样的窗口，输出空字符串。

## 解题思路

**滑动窗口（双指针）+ 哈希表**的组合：

**哈希表预处理**：

- 用哈希表（`map`或数组）统计`t`中每个字符的出现次数（记为`need`）
- 用另一个哈希表（`window`）记录当前窗口中各字符的出现次数

**滑动窗口操作**：

- 右指针`right`扩大窗口，将字符加入`window`，直到窗口包含`t`中所有字符
- 左指针`left`缩小窗口，尝试找到最小长度的有效子串
- 用变量`valid`记录窗口中满足`need`要求的字符数量，当`valid`等于`t`中不同字符的数量时，窗口有效

**更新结果**：

- 每次窗口有效时，比较并更新最小子串的起始位置和长度

```
#include <string>
#include <unordered_map>
#include <climits>
using namespace std;

class Solution {
public:
    string minWindow(string s, string t) {
        // 哈希表记录t中字符的需求数量
        unordered_map<char, int> need;
        // 哈希表记录当前窗口中字符的数量
        unordered_map<char, int> window;
        
        // 初始化need哈希表
        for (char c : t) {
            need[c]++;
        }
        
        int left = 0, right = 0;  // 窗口左右指针
        int valid = 0;            // 记录满足需求的字符种类数
        int start = 0, len = INT_MAX;  // 记录最小子串的起始位置和长度
        
        while (right < s.size()) {
            // 扩大窗口：将右指针字符加入窗口
            char c = s[right];
            right++;
            
            // 如果是需要的字符，更新窗口计数
            if (need.count(c)) {
                window[c]++;
                // 当窗口中该字符数量满足需求时，valid加1
                if (window[c] == need[c]) {
                    valid++;
                }
            }
            
            // 当窗口包含所有需要的字符时，尝试缩小窗口
            while (valid == need.size()) {
                // 更新最小子串
                if (right - left < len) {
                    start = left;
                    len = right - left;
                }
                
                // 缩小窗口：移除左指针字符
                char d = s[left];
                left++;
                
                // 如果是需要的字符，更新窗口计数
                if (need.count(d)) {
                    // 当窗口中该字符数量不再满足需求时，valid减1
                    if (window[d] == need[d]) {
                        valid--;
                    }
                    window[d]--;
                }
            }
        }
        
        // 返回最小子串（如果存在）
        return len == INT_MAX ? "" : s.substr(start, len);
    }
};
```

**哈希表初始化**：

- `need`存储`t`中每个字符的出现次数（如`t="ABC"`，`need`为`{'A':1, 'B':1, 'C':1}`）
- `window`动态记录当前窗口中各字符的出现次数

**扩大窗口（右指针移动）**：

- 每次将`s[right]`加入`window`，如果该字符是`t`中需要的，且数量达到`need`中的要求，则`valid`加 1
- 当`valid`等于`need.size()`时，说明窗口已包含`t`中所有字符

**缩小窗口（左指针移动）**：

- 窗口有效时，尝试左移左指针以减小窗口长度
- 每次移除`s[left]`，如果该字符是`t`中需要的，且数量从满足需求变为不满足，则`valid`减 1
- 每次缩小窗口前，先检查当前窗口是否是最小长度，更新`start`和`len`

**结果处理**：

- 如果`len`仍为`INT_MAX`，说明没有找到有效子串，返回`""`
- 否则返回从`start`开始、长度为`len`的子串





