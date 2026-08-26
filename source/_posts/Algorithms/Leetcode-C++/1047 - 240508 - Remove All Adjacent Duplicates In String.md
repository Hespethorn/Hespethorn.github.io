---

title: Leetcode 1047. Remove All Adjacent Duplicates In String
tags:
  - leetcode
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 64e2f268
date: 2024-03-26

---

## [1047. Remove All Adjacent Duplicates In String](https://leetcode.cn/problems/remove-all-adjacent-duplicates-in-string/)

You are given a string `s` consisting of lowercase English letters. A **duplicate removal** consists of choosing two **adjacent** and **equal** letters and removing them.

We repeatedly make **duplicate removals** on `s` until we no longer can.

Return *the final string after all such duplicate removals have been made*. It can be proven that the answer is **unique**.

 **Example 1:**

```
Input: s = "abbaca"
Output: "ca"
Explanation: 
For example, in "abbaca" we could remove "bb" since the letters are adjacent and equal, and this is the only possible move.  The result of this move is that the string is "aaca", of which only "aa" is possible, so the final string is "ca".
```

**Example 2:**

```
Input: s = "azxxzy"
Output: "ay"
```

## 题目大意

给定一个由小写英文字母组成的字符串 `s`，重复执行 "删除相邻且相等的两个字符" 的操作，直到无法再删除为止，返回最终的字符串。题目保证结果是唯一的。

例如，对于 "abbaca"：

1. 先删除 "bb" 得到 "aaca"
2. 再删除 "aa" 得到 "ca"
3. 无法继续删除，返回 "ca"

## 解题思路

解决这类 "反复删除相邻重复元素" 的问题，最佳方法是使用**栈**数据结构，核心思路如下：

1. 遍历字符串中的每个字符
2. 若栈不为空且栈顶元素与当前字符相同，说明出现相邻重复，弹出栈顶元素（相当于删除这对重复字符）
3. 若栈为空或栈顶元素与当前字符不同，将当前字符压入栈中
4. 遍历结束后，栈中剩余字符即为最终结果

```

class Solution {
public:
    string removeDuplicates(string s) {
        // 用vector模拟栈，效率比stack更高
        vector<char> stack;
        
        for (char c : s) {
            // 若栈不为空且栈顶元素与当前字符相同，则弹出栈顶（删除重复）
            if (!stack.empty() && stack.back() == c) {
                stack.pop_back();
            } else {
                // 否则将当前字符压入栈
                stack.push_back(c);
            }
        }
        
        // 将栈中剩余字符转换为字符串返回
        return string(stack.begin(), stack.end());
    }
};

```