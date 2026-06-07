---
title: Leetcode 0844. Backspace String Compare
tags:
  - leetcode
  - 双指针
categories:
  - Leetcode
  - 双指针
series: Leetcode
abbrlink: d9f37d2f
date: 2024-03-01 21:53:00
---

# [844. Backspace String Compare](https://leetcode.com/problems/backspace-string-compare/)

## 题目

Given two strings S and T, return if they are equal when both are typed into empty text editors. # means a backspace character.


Example 1:

```c
Input: S = "ab#c", T = "ad#c"
Output: true
Explanation: Both S and T become "ac".
```

Example 2:

```c
Input: S = "ab##", T = "c#d#"
Output: true
Explanation: Both S and T become "".
```

Example 3:

```c
Input: S = "a##c", T = "#a#c"
Output: true
Explanation: Both S and T become "c".
```

Example 4:

```c
Input: S = "a#c", T = "b"
Output: false
Explanation: S becomes "c" while T becomes "b".
```


Note:

- 1 <= S.length <= 200
- 1 <= T.length <= 200
- S and T only contain lowercase letters and '#' characters.


Follow up:

- Can you solve it in O(N) time and O(1) space?

## 题目大意


给 2 个字符串，如果遇到 # 号字符，就回退一个字符。问最终的 2 个字符串是否完全一致。

## 解题思路

这一题可以用栈的思想来模拟，遇到 # 字符就回退一个字符。不是 # 号就入栈一个字符。比较最终 2 个字符串即可。

### 解法1：vector 

1. **辅助函数 `processString`**：

- 接收一个字符串，返回处理退格后的字符序列
- 使用 `vector` 模拟栈的行为
- 遍历字符串中的每个字符：
- 若为普通字符，直接压入栈中
   - 若为 `#` 且栈不为空，弹出栈顶元素（模拟删除前一个字符）

2. **主函数 `backspaceCompare`**：

- 分别处理两个输入字符串 `s` 和 `t`
- 比较处理后的两个栈是否完全相同
- 返回比较结果


##### 复杂度分析
- **时间复杂度**：O (n + m)，其中 n 和 m 分别是两个字符串的长度。每个字符只需处理一次
- **空间复杂度**：O (n + m)，在最坏情况下（没有退格字符）需要存储所有字符

```
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool backspaceCompare(string s, string t) {
        // 处理字符串s，得到处理后的结果
        vector<char> stackS = processString(s);
        // 处理字符串t，得到处理后的结果
        vector<char> stackT = processString(t);
        
        // 比较两个处理结果是否相同
        return stackS == stackT;
    }
    
private:
    // 辅助函数：处理字符串，应用退格操作
    vector<char> processString(string str) {
        vector<char> stack;
        for (char c : str) {
            if (c == '#') {
                // 遇到退格且栈不为空，弹出栈顶元素
                if (!stack.empty()) {
                    stack.pop_back();
                }
            } else {
                // 普通字符，压入栈中
                stack.push_back(c);
            }
        }
        return stack;
    }
};
```

### 解法2：双指针法：

- **慢指针（slow）**：
  - 标记处理后字符串的当前位置
  - 同时也代表了处理后字符串的长度
- **快指针（循环变量 ch）**：
  - 遍历原始字符串的每个字符
  - 决定哪些字符应保留在处理后的字符串中
- **核心逻辑**：
  - 遇到普通字符：放到慢指针位置，慢指针后移
  - 遇到退格符`#`：慢指针回退（但不小于 0）
  - 处理完成后截断字符串，只保留有效部分

```
class Solution {
public:
    bool backspaceCompare(string s, string t) {
        // 快指针遍历原字符串，慢指针指向新字符串的当前位置
        auto modifyString = [](string& s) {
            int slow = 0;  // 慢指针：记录处理后字符串的长度和位置
            for (auto& ch : s) {  // 快指针：遍历原字符串
                if (ch != '#') {
                    // 普通字符：放入慢指针位置并后移
                    s[slow++] = ch;
                } else {
                    // 退格字符：回退慢指针（防止越界）
                    slow = max(slow - 1, 0);
                }
            }
            // 截断字符串，只保留有效部分
            s.resize(slow);
            return s;
        };
        // 比较处理后的两个字符串
        return modifyString(s) == modifyString(t);
    }
};
```

