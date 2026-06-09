---
title: Leetcode 0071. Simplify Path
tags:
  - leetcode
categories:
  - Leetcode
  - Stack
series: Leetcode-Cpp
abbrlink: ed1ccd43
date: 2023-05-27 21:49:00
---

## [71. Simplify Path](https://leetcode.cn/problems/simplify-path/)

You are given an *absolute* path for a Unix-style file system, which always begins with a slash `'/'`. Your task is to transform this absolute path into its **simplified canonical path**.

The *rules* of a Unix-style file system are as follows:

- A single period `'.'` represents the current directory.
- A double period `'..'` represents the previous/parent directory.
- Multiple consecutive slashes such as `'//'` and `'///'` are treated as a single slash `'/'`.
- Any sequence of periods that does **not match** the rules above should be treated as a **valid directory or** **file** **name**. For example, `'...' `and `'....'` are valid directory or file names.

The simplified canonical path should follow these *rules*:

- The path must start with a single slash `'/'`.
- Directories within the path must be separated by exactly one slash `'/'`.
- The path must not end with a slash `'/'`, unless it is the root directory.
- The path must not have any single or double periods (`'.'` and `'..'`) used to denote current or parent directories.

Return the **simplified canonical path**.

## 题目大意

给定一个 Unix 风格的绝对路径（始终以斜杠 `/` 开头），需要将其转换为简化的规范路径。Unix 文件系统的规则和规范路径的要求如下：

### 路径规则

- 单个点 `.` 表示当前目录
- 双点 `..` 表示上一级目录（父目录）
- 多个连续斜杠（如 `//`、`///`）视为单个斜杠 `/`
- 除 `.` 和 `..` 之外的点序列（如 `...`、`....`）视为有效目录名

### 规范路径要求

- 必须以单个斜杠 `/` 开头
- 目录之间必须用恰好一个斜杠 `/` 分隔
- 路径不能以斜杠 `/` 结尾（除非是根目录）
- 路径中不能包含 `.` 和 `..`

## 解题思路

核心思路是使用**栈**（可用 `vector` 模拟）处理路径中的目录层级关系，步骤如下：

1. **分割路径**
   按斜杠 `/` 分割输入路径，得到所有目录组件（例如 `/home//foo/` 分割后得到 `["", "home", "", "foo", ""]`）。
2. **处理每个组件**
   - 忽略空字符串（由连续斜杠产生）和 `.`（当前目录，无需处理）。
   - 遇到 `..`（上一级目录）时，若栈不为空，弹出栈顶元素（回到上一级）。
   - 其他组件（有效目录名）直接压入栈中。
3. **构建规范路径**
   - 若栈为空，返回根目录 `/`。
   - 否则，将栈中所有目录用 `/` 连接，并在开头添加一个 `/`（确保路径以 `/` 开头）。

```
class Solution {
public:
    string simplifyPath(string path) {
        stringstream ss(path);  // 用于分割路径字符串
        string dir, res;        // dir存储当前目录组件，res存储结果
        vector<string> st;      // 用vector模拟栈，存储有效目录
        
        // 按'/'分割路径，获取每个目录组件
        while (getline(ss, dir, '/')) {
            // 忽略当前目录'.'和空字符串（由连续'/'产生）
            if (dir == "." || dir == "") continue;
            
            // 处理上一级目录'..'
            if (dir == "..") {
                // 如果栈不为空，则弹出栈顶元素（回到上一级）
                if (!st.empty()) st.pop_back();
            } else {
                // 有效目录名，压入栈中
                st.push_back(dir);
            }
        }
        
        // 拼接栈中的目录组件，形成规范路径
        for (auto& i : st) res += "/" + i;
        
        // 如果结果为空，说明是根目录，返回"/"
        if (res.empty()) res += "/";
        
        return res;
    }
};

```