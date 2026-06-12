---
title: Leetcode 0006. Zigzag Conversion (python)
tags:
  - leetcode
  - python
  - 字符串
  - 模拟
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'c7d8e4a1'
date: 2024-01-27
---

# [6. Zigzag Conversion](https://leetcode.com/problems/zigzag-conversion/)

## 题目

The string `"PAYPALISHIRING"` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)

```
P   A   H   N
A P L S I I G
Y   I   R
```

And then read line by line: `"PAHNAPLSIIGYIR"`

Write the code that will take a string and make this conversion given a number of rows:

```
string convert(string s, int numRows);
```

**Example 1:**

```
Input: s = "PAYPALISHIRING", numRows = 3
Output: "PAHNAPLSIIGYIR"
```

**Example 2:**

```
Input: s = "PAYPALISHIRING", numRows = 4
Output: "PINALSIGYAHRPI"
Explanation:
P     I    N
A   L S  I G
Y A   H R
P     I
```

**Example 3:**

```
Input: s = "A", numRows = 1
Output: "A"
```

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consists of English letters (lower-case and upper-case), `','` and `'.'`.
- `1 <= numRows <= 1000`

## 题目大意

将字符串按 Z 字形排列成指定的行数，然后按行逐行读取，返回新的字符串。注意当 `numRows = 1` 或 `numRows >= len(s)` 时，Z 字形退化为单列或单行，直接返回原串即可。

---

## 你选用何种方法解题？

本题的核心是**确定每个字符落入哪一行，然后按行收集**。两种主流思路：

| 方法 | 核心思路 | 时间复杂度 | 说明 |
|:---|:---|:---:|:---|
| 方法一：方向模拟法（推荐） | 维护行游标 + 方向标志，一趟遍历分配字符 | O(n) | **最优工程解**：逻辑直观、不易写错 |
| 方法二：直接索引法 | 利用 Z 字形的周期公式，直接计算每行字符在原串中的下标 | O(n) | 常数更小，但下标公式推导和边界处理易出错 |

**方法一是推荐解**：用 `numRows` 个字符串构建器收集字符，维护一个行游标 `row` 和方向步长 `step`（`+1` 向下，`-1` 向上）。当游标到达顶部或底部时翻转方向。一趟遍历即可完成，代码清晰，面试中 3 分钟写出来无 bug。

方法二的数学推导虽然优雅，但需分三种情况处理行下标（首行、末行、中间行），考试或面试场景下性价比不高。

---

## 解题过程

### 问题分析

- **输入**：字符串 `s`（长度 n ≤ 1000），行数 `numRows`
- **输出**：按 Z 字形排列后逐行读取的结果字符串
- **Z 字形定义**：字符先从上到下填满一列（`numRows` 个字符），然后沿对角线向上走到第二行，再从上到下填下一列，如此往复

### 核心洞察

**Z 字形的本质是一个"来回扫描"的过程**：行号的变化规律是 `0 → 1 → … → numRows-1 → numRows-2 → … → 1 → 0 → …`，不断循环。模拟这个过程只需要一个方向变量——到达边界时翻转。

关键认知：**我们不需要构造二维矩阵**。只需为每一行准备一个字符串构建器，在遍历原串时，根据当前行号把字符追加到对应行，最后将所有行拼接即可。

### 方向翻转的时机

`step` 翻转发生在 `row == 0`（触顶）或 `row == numRows - 1`（触底）时。注意**判断必须在更新 `row` 之前**——因为我们需要知道当前是否在边界：

```python
if row == 0 or row == numRows - 1:
    step = -step   # 翻转方向
row += step        # 移动到下一行
```

正确做法是**先判断是否在边界并翻转，再更新行号**，但**初始方向应为向下**，且只有当 `numRows > 1` 时才进入模拟逻辑。

实际上更简洁的写法是：先更新 `row`，再判断是否到达边界并翻转：

```python
row += step
if row == 0 or row == numRows - 1:
    step = -step
```

这样的好处是：初始 `row = 0, step = 1`，第一次 `row += step` 使 `row = 1`（不会错误触发边界判断），后续自然在 0 和 `numRows-1` 之间摆动。

---

## 这些方法具体怎么运用？

### 方法一：方向模拟法（推荐）

**数据结构**：一个长度为 `numRows` 的字符串列表 `rows`，`rows[i]` 存储第 `i` 行的所有字符。

**核心逻辑**：
1. 若 `numRows == 1` 或 `numRows >= n`：直接返回 `s`（退化情况）
2. 初始化 `rows = [""] * numRows`，`row = 0`，`step = 1`
3. 遍历 `s` 中每个字符 `ch`：
   - `rows[row] += ch`
   - `row += step`
   - 若 `row == 0` 或 `row == numRows - 1`：`step = -step`（翻转方向）
4. 返回 `"".join(rows)`

**为什么先更新 `row` 再判断边界？** 见上文推演——这样可以避免初始 `row=0` 时错误触发翻转。初始 `row=0`，第一次 `row += step` 后 `row=1`，不触发边界判断，后续一切正常。

**边界情况**：

| 场景 | 输入 | 处理 | 结果 |
|:---|:---|:---|:---|
| 单行 | `s="ABC", numRows=1` | 直接返回 `s` | `"ABC"` |
| 行数 ≥ 串长 | `s="AB", numRows=5` | 直接返回 `s`（每行最多一个字符，无 Z 字形可言） | `"AB"` |
| 恰好一列 | `s="ABC", numRows=3` | 从上到下填满一列即结束 | `"ABC"` |
| Z 形成一周期 | `s="ABCD", numRows=3` | 行0: A, 行1: B D, 行2: C | `"ABDC"` |

### 方法二：直接索引法

**核心思路**：Z 字形的排列是周期性的。设 `cycle = 2 × numRows - 2`（当 `numRows > 1` 时），每个周期包含一次"下降"（`numRows` 个字符）和一次"上升"（`numRows - 2` 个字符）：

```
以 numRows=4 为例，cycle=6:
周期0: P(0)         周期1: I(6)
       A(1)   L(5)         S(7)   G(11)
       Y(2) A(4)           I(8) R(10)
       P(3)                I(9)

行0的字符: 0, 6, 12, ...          = k × cycle
行1的字符: 1, 5, 7, 11, 13, ...   = k × cycle ± 1
行2的字符: 2, 4, 8, 10, ...       = k × cycle ± 2
行3的字符: 3, 9, ...              = k × cycle + 3
```

**每行下标公式**（`k = 0, 1, 2, …`，保证下标 < n）：
- **首行** (`r = 0`)：`k × cycle`
- **末行** (`r = numRows - 1`)：`k × cycle + numRows - 1`
- **中间行** (`0 < r < numRows - 1`)：每个周期有两个下标——`k × cycle + r` 和 `k × cycle + cycle - r`

这个方法虽然避免构建字符串数组，但三种情况的处理增加了出错概率。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 方向模拟法 | **O(n)** | **O(n)** | 一趟遍历 + 存储结果字符串（不计输出则为 O(1) 额外空间） |
| 直接索引法 | **O(n)** | **O(1)** | 直接计算结果字符串，不存储中间行；不计输出则为 O(1) |

两种方法的时间复杂度都是 **O(n)**——每个字符被访问恰好一次。空间上，两种方法都需要 O(n) 存储输出字符串。区别在于方向模拟法额外使用 O(numRows) 的字符串构建器（可视为 O(1)，因为 numRows 通常远小于 n），而直接索引法不需要。

**关于 "直接返回 s" 的优化**：当 `numRows == 1` 时，方向模拟法的循环体不会执行（步长翻转逻辑失效），直接索引法的 `cycle = 0` 会导致除零或死循环。因此两种方法都需要这个前置判断。

---

## 总结与最佳选择

**最快算法**：两种方法时间均为 O(n)，实际运行中方向模拟法略快——因为 Python 的 `"".join(rows)` 是高度优化的 C 级操作，而直接索引法的双层循环有更多的 Python 解释器开销。

**工程最优选择**：**方向模拟法（方法一）**，理由：
1. **代码最直观**：`row += step` + 边界翻转，三句话讲清逻辑
2. **不易出错**：无需推导周期公式，无需处理三种行类型
3. **Python 友好**：列表的 `append` 式字符串构建 + `"".join()` 是 Python 的最佳实践
4. **可扩展**：若需求变为"输出 Z 字形的二维数组"，方向模拟法只需改 `rows[row].append(ch)` 即可

**各方法的使用场景**：
- **方向模拟法**：面试首选，代码短、逻辑顺、无边界坑
- **直接索引法**：适合追求极致内存的场景（如嵌入式），或对数学推导有偏好的竞赛选手

---

## Code

### 方法一：方向模拟法（推荐）

```python
class Solution:
    def convert(self, s: str, numRows: int) -> str:
        """方向模拟法：维护行游标和方向，一趟遍历将字符分配到对应行。
        到达首行或末行时翻转方向。
        时间复杂度 O(n)，空间复杂度 O(n)。
        """
        n = len(s)
        # 退化情况：只有一行，或行数不比串长短
        if numRows == 1 or numRows >= n:
            return s

        # rows[i] 存储第 i 行的字符
        rows: list[str] = [""] * numRows
        row = 0       # 当前行游标
        step = 1      # 方向：+1 向下，-1 向上

        for ch in s:
            rows[row] += ch

            # 先移动行游标
            row += step

            # 到达边界时翻转方向
            if row == 0 or row == numRows - 1:
                step = -step

        # 按行拼接
        return "".join(rows)
```

### 方法二：直接索引法（供参考）

```python
class Solution:
    def convert(self, s: str, numRows: int) -> str:
        """直接索引法：利用 Z 字形的周期公式直接计算每行的字符下标。
        时间复杂度 O(n)，空间复杂度 O(1)（不计输出）。
        """
        n = len(s)
        if numRows == 1 or numRows >= n:
            return s

        cycle = 2 * numRows - 2       # 每个 Z 字周期的字符数
        result: list[str] = []

        # 逐行构建
        for r in range(numRows):
            k = 0                     # 周期编号
            while True:
                # 第一个下标：每个周期中"下降段"该行的字符
                idx1 = k * cycle + r
                if idx1 >= n:
                    break
                result.append(s[idx1])

                # 中间行还有第二个下标："上升段"该行的字符
                if 0 < r < numRows - 1:
                    idx2 = k * cycle + cycle - r
                    if idx2 < n:
                        result.append(s[idx2])

                k += 1

        return "".join(result)
```
