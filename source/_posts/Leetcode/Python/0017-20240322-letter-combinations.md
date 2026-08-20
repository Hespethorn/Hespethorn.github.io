---
title: Leetcode 0017.Letter Combinations of a Phone Number(python)
tags:
  - leetcode
  - python
  - 回溯
  - 递归
categories: [Leetcode, Python]
series: Leetcode-Python
abbrlink: 'letter-combinations'
date: 2024-03-22
---

# [17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)

## 题目

Given a string containing digits from `2-9` inclusive, return all possible letter combinations that the number could represent. Return the answer in **any order**.

A mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.

```
2 -> "abc"
3 -> "def"
4 -> "ghi"
5 -> "jkl"
6 -> "mno"
7 -> "pqrs"
8 -> "tuv"
9 -> "wxyz"
```

**Example 1:**

```
Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
```

**Example 2:**

```
Input: digits = ""
Output: []
```

**Example 3:**

```
Input: digits = "2"
Output: ["a","b","c"]
```

## 题目大意

给定一个包含数字 2-9 的字符串，返回所有可能的字母组合。数字到字母的映射与电话按键相同，1 不映射任何字母。

---

## 你选用何种方法解题？

本题的核心是**生成所有可能的字母组合**，属于典型的组合问题。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 回溯（DFS） | O(3^m × 4^n) | O(m + n) | **推荐** |
| BFS（队列） | O(3^m × 4^n) | O(3^m × 4^n) | 可选 |
| 迭代 | O(3^m × 4^n) | O(3^m × 4^n) | 可选 |

**方法选择理由**：
- **回溯（DFS）**：代码简洁，逻辑清晰，空间复杂度最优（只需存储当前路径）
- **BFS（队列）**：需要存储所有中间结果，空间复杂度较高
- **迭代**：代码较复杂，可读性较差

---

## 解题过程

### 问题分析

输入：数字字符串 `digits`
输出：所有可能的字母组合列表

关键约束：数字范围为 2-9，每个数字对应 3-4 个字母

### 核心洞察

1. **递归结构**：每个数字对应多个字母选择，选择一个字母后继续处理下一个数字
2. **回溯思想**：尝试所有可能的选择，当到达字符串末尾时记录结果
3. **映射关系**：用数组或字典存储数字到字母的映射

### 算法流程

以 `digits = "23"` 为例：

**步骤 1**：数字映射 → `2: "abc"`, `3: "def"`

**步骤 2**：DFS 递归过程：

```
第1层（i=0, digit='2'）:
  ├─ 选 'a' → 进入第2层
  │   └─ 选 'd' → ["ad"]
  │   └─ 选 'e' → ["ae"]
  │   └─ 选 'f' → ["af"]
  ├─ 选 'b' → 进入第2层
  │   └─ 选 'd' → ["bd"]
  │   └─ 选 'e' → ["be"]
  │   └─ 选 'f' → ["bf"]
  └─ 选 'c' → 进入第2层
      └─ 选 'd' → ["cd"]
      └─ 选 'e' → ["ce"]
      └─ 选 'f' → ["cf"]
```

---

## 这些方法具体怎么运用？

### 方法：回溯（DFS）（推荐）

**数据结构**：字符串数组存储数字到字母的映射

**核心逻辑**：
1. **建立映射**：用数组存储数字到字母的对应关系，索引即为数字
2. **边界处理**：若输入为空字符串，直接返回空列表
3. **DFS 函数**：
   - 参数：当前处理位置 `i`，当前路径 `path`
   - 终止条件：`i == len(digits)`，将 `path` 添加到结果列表
   - 递归过程：遍历当前数字对应的所有字母，递归调用 DFS

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 输入为空字符串 | 直接返回空列表 |
| 输入只有一个数字 | 返回该数字对应的所有字母 |
| 输入包含无效字符 | 题目保证输入为 2-9，无需处理 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 回溯（DFS） | **O(3^m × 4^n)** | **O(m + n)** | m 是对应 3 个字母的数字个数，n 是对应 4 个字母的数字个数；空间为递归栈深度 |
| BFS（队列） | O(3^m × 4^n) | O(3^m × 4^n) | 需要存储所有中间结果 |
| 迭代 | O(3^m × 4^n) | O(3^m × 4^n) | 需要存储所有中间结果 |

---

## 总结与最佳选择

**最快算法**：**回溯（DFS）**。递归调用开销较小，代码简洁。

**工程最优选择**：**回溯（DFS）**。理由如下：
1. **代码简洁**：递归结构清晰，易于理解和维护
2. **空间效率高**：只需存储当前路径，空间复杂度 O(m + n)
3. **逻辑直观**：符合人类思考组合问题的方式

**各方法适用场景**：
- **回溯（DFS）**：首选方案，适用于绝大多数情况
- **BFS（队列）**：需要按层处理时考虑
- **迭代**：不推荐使用

---

## Code

### 方法：回溯（DFS）（推荐）

```python
from typing import List

class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        """
        回溯法：
        1. 建立数字到字母的映射
        2. 使用 DFS 递归生成所有组合
        3. 当到达字符串末尾时记录结果
        """
        if not digits:
            return []
        
        # 数字到字母的映射，索引对应数字
        letters = [
            "", "",     # 0, 1 不映射
            "abc",      # 2
            "def",      # 3
            "ghi",      # 4
            "jkl",      # 5
            "mno",      # 6
            "pqrs",     # 7
            "tuv",      # 8
            "wxyz"      # 9
        ]
        
        ans = []
        
        def dfs(i, path):
            # 终止条件：处理完所有数字
            if i == len(digits):
                ans.append(path)
                return
            
            # 遍历当前数字对应的所有字母
            for ch in letters[int(digits[i])]:
                dfs(i + 1, path + ch)
        
        # 从第0个数字开始，初始路径为空
        dfs(0, "")
        return ans
```

### 方法二：BFS（队列）

```python
from typing import List
from collections import deque

class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        """
        BFS 法：使用队列逐层生成组合
        """
        if not digits:
            return []
        
        letters = [
            "", "", "abc", "def", "ghi", "jkl", 
            "mno", "pqrs", "tuv", "wxyz"
        ]
        
        queue = deque([""])
        
        for digit in digits:
            level_size = len(queue)
            for _ in range(level_size):
                current = queue.popleft()
                for ch in letters[int(digit)]:
                    queue.append(current + ch)
        
        return list(queue)
```

### 方法三：迭代

```python
from typing import List

class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        """
        迭代法：逐步构建结果列表
        """
        if not digits:
            return []
        
        letters = [
            "", "", "abc", "def", "ghi", "jkl", 
            "mno", "pqrs", "tuv", "wxyz"
        ]
        
        result = [""]
        
        for digit in digits:
            temp = []
            for s in result:
                for ch in letters[int(digit)]:
                    temp.append(s + ch)
            result = temp
        
        return result
```