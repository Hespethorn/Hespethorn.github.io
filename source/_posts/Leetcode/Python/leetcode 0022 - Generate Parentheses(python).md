---
title: Leetcode 0022.Generate Parentheses(python)
tags:
  - leetcode
  - python
  - 回溯
  - dfs
  - 字符串
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'generate-parentheses'
date: 2024-04-16
---

# [22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/)

## 题目

Given `n` pairs of parentheses, write a function to *generate all combinations of well-formed parentheses*.

**Example 1:**

```
Input: n = 3
Output: ["((()))","(()())","(())()","()(())","()()()"]
```

**Example 2:**

```
Input: n = 1
Output: ["()"]
```

## 题目大意

数字 `n` 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 **有效的** 括号组合。

---

## 你选用何种方法解题？

本题的核心是**生成所有有效的括号组合**，属于经典的**回溯算法**（Backtracking）问题。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| DFS（字符串拼接） | $O(\frac{4^n}{\sqrt{n}})$ | $O(n)$ | **推荐** |
| DFS（字符数组） | $O(\frac{4^n}{\sqrt{n}})$ | $O(n)$ | 推荐 |
| DFS（左括号索引记录） | $O(\frac{4^n}{\sqrt{n}})$ | $O(n)$ | 推荐 |

**方法选择理由**：
- **DFS（字符串拼接）**：代码最简洁，利用字符串不可变的特性，每次递归自动产生新状态，逻辑清晰。
- **DFS（字符数组）**：避免了频繁创建字符串的开销，通过数组下标直接修改，是回溯的标准写法。
- **DFS（左括号索引记录）**：一种逆向思维，先构造全右括号的数组，再通过DFS决定左括号的位置，思路独特。

---

## 解题过程

### 问题分析

输入：整数 `n`
输出：所有长度为 `2n` 的有效括号组合列表

关键约束：
- 左括号数量必须等于 `n`。
- 右括号数量必须等于 `n`。
- **任意位置，左括号数量 $\ge$ 右括号数量**（剪枝关键）。

### 核心洞察

1. **有效括号特性**：只要在生成过程中保证“左括号数量不小于右括号数量”，最终生成的括号序列一定是有效的。
2. **DFS 剪枝**：
   - 可以加左括号的条件：当前左括号数量 `< n`。
   - 可以加右括号的条件：当前右括号数量 `< 左括号数量`。

### 算法流程（以方法一为例）

以 `n = 2` 为例：

```
开始 dfs(0, 0, '')
├── 选择 '(' -> dfs(1, 0, '(')
│   ├── 选择 '(' -> dfs(2, 0, '((')
│   │   ├── 不能选 '(' (l=n)
│   │   └── 选择 ')' -> dfs(2, 1, '(()')
│   │       ├── 不能选 '('
│   │       └── 选择 ')' -> dfs(2, 2, '(())') -> 加入结果
│   └── 选择 ')' -> dfs(1, 1, '()')
│       ├── 选择 '(' -> dfs(2, 1, '()(')
│       │   └── 选择 ')' -> dfs(2, 2, '()()') -> 加入结果
│       └── 不能选 ')' (r=l)
└── 不能选 ')' (r>l)

结果: ["(())", "()()"]
```

---

## 这些方法具体怎么运用？

### 方法一：DFS（字符串拼接）（推荐）

**核心逻辑**：
1. **参数定义**：`l` 记录左括号数量，`r` 记录右括号数量，` s` 记录当前字符串。
2. **终止条件**：字符串长度为 `2*n` 时加入结果集。
3. **剪枝条件**：如果 `l < r`（右括号多了）或 `l > n` 或 `r > n`，直接返回。
4. **递归逻辑**：先尝试加左括号，再尝试加右括号。

### 方法二：DFS（字符数组）

**核心逻辑**：
1. **预分配空间**：创建长度为 `2*n` 的数组 `path`。
2. **原地修改**：利用 `left + right` 确定当前填充位置 `index`。
3. **回溯**：修改数组值 -> 递归 ->（隐式回退，因为下次递归会覆盖值）。

### 方法三：DFS（左括号索引记录）

**核心逻辑**：
1. **逆向思维**：初始化一个全为右括号 `)` 的字符串，只记录左括号 `(` 放置的位置。
2. **参数定义**：`i` 为当前决策的左括号是第几个（0到n-1），`balance` 为当前开口数量（左括号多出来的数量）。
3. **位置决策**：第 `i` 个左括号可以放在哪些位置？通过循环 `right` 决定在放置当前左括号前，先放置多少个右括号（消耗 `balance`）。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| DFS（字符串拼接） | $O(\frac{4^n}{\sqrt{n}})$ | $O(n)$ | 结果数量为卡特兰数，递归深度为 2n |
| DFS（字符数组） | $O(\frac{4^n}{\sqrt{n}})$ | $O(n)$ | 同上，省去了字符串拼接的额外开销 |
| DFS（左括号索引） | $O(\frac{4^n}{\sqrt{n}})$ | $O(n)$ | 同上 |

---

## 总结与最佳选择

**最快算法**：三种方法时间复杂度一致，均为卡特兰数级别。方法二和方法三避免了频繁的字符串拷贝，在 Python 中可能略快于方法一。

**工程最优选择**：**方法一（字符串拼接）**。
理由如下：
1. **代码简洁**：最符合直觉，易于编写和调试。
2. **无副作用**：字符串不可变，无需手动“撤销”操作（回溯时的 pop 或还原），不易出错。

**各方法适用场景**：
- **方法一**：面试首选，逻辑最清晰。
- **方法二**：对性能有微优化需求时使用。
- **方法三**：用于拓展思路，理解“位置决策”类的回溯模型。

---

## Code

### 方法一：DFS（字符串拼接）（推荐）

```python
from typing import List

class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        def dfs(l, r, s):  # l:左括号数量，r:右括号数量
            if l<r or l>n or r>n:  # 剪枝：右括号多于左括号，或数量超标
                return
            if len(s)==2*n:
                ans.append(s)
                return
            dfs(l+1, r, s+'(')  # 尝试放左括号
            dfs(l, r+1, s+')')  # 尝试放右括号
        
        dfs(0, 0, '')
        return ans
```

### 方法二：DFS（字符数组）

```python
from typing import List

class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        path = [''] * (2 * n) # 预分配数组空间
        
        def dfs(left: int, right: int) -> None:
            # left: 已使用的左括号数量, right: 已使用的右括号数量
            if right == n:
                ans.append(''.join(path))
                return
            if left < n:
                path[left + right] = '(' # 在当前位置放入左括号
                dfs(left + 1, right)
            if right < left:
                path[left + right] = ')' # 在当前位置放入右括号
                dfs(left, right + 1)
                
        dfs(0, 0)
        return ans
```

### 方法三：DFS（左括号索引记录）

```python
from typing import List

class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        ans = []
        path = [] # 记录左括号的下标
        
        def dfs(i: int, balance: int) -> None:
            # i: 当前决策的是第 i 个左括号 (0 到 n-1)
            # balance: 当前未匹配的左括号数量 (相当于净开放数量)
            
            if len(path) == n: # 所有左括号已放置完毕
                s = [')'] * (n * 2) # 初始化全为右括号
                for j in path:
                    s[j] = '(' # 根据记录的下标放置左括号
                ans.append(''.join(s))
                return
            
            # 决策当前左括号之前可以先放多少个右括号
            # right 表示相对于当前位置偏移多少放左括号，中间的位置留给右括号
            # 范围受限于当前的 balance (右括号不能多于左括号)
            for right in range(balance + 1):
                path.append(i + right) # 记录左括号放置位置
                # 放置了一个左括号，balance 更新为: balance - right(消耗的右括号) + 1(新增的左括号)
                dfs(i + right + 1, balance - right + 1)
                path.pop()
                
        dfs(0, 0)
        return ans
```