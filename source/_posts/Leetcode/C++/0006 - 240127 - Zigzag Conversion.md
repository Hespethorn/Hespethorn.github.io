---
title: Leetcode 0006. Zigzag Conversion
tags:
  - leetcode
  - 字符串
  - 模拟
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: d9e0f5b2
date: 2023-01-17
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

## 解题思路

### 解法一：方向模拟法（推荐）

Z 字形的本质是一个"来回扫描"的过程：行号从 0 递增到 `numRows - 1`，然后递减回 0，再递增……如此循环。维护一个行游标 `row` 和方向步长 `step`（`+1` 向下，`-1` 向上），当游标到达顶部或底部时翻转方向。一趟遍历即可将每个字符分配到对应行，最后按行拼接。

以 `s = "PAYPALISHIRING", numRows = 4` 为例：

```
s = P A Y P A L I S H I R I N G
    0 1 2 3 4 5 6 7 8 9 10 11 12 13

初始: rows = ["", "", "", ""], row = 0, step = 1

i=0, ch='P', rows[0]+="P", row=0 → row=1
i=1, ch='A', rows[1]+="A", row=1 → row=2
i=2, ch='Y', rows[2]+="Y", row=2 → row=3
i=3, ch='P', rows[3]+="P", row=3 → 触底, step=-1, row=2
i=4, ch='A', rows[2]+="A", row=2 → row=1
i=5, ch='L', rows[1]+="L", row=1 → row=0
i=6, ch='I', rows[0]+="I", row=0 → 触顶, step=1, row=1
i=7, ch='S', rows[1]+="S", row=1 → row=2
i=8, ch='I', rows[2]+="I", row=2 → row=3
i=9, ch='R', rows[3]+="R", row=3 → 触底, step=-1, row=2
i=10,ch='I', rows[2]+="I", row=2 → row=1
i=11,ch='N', rows[1]+="N", row=1 → row=0
i=12,ch='G', rows[0]+="G", row=0 → 触顶, step=1, row=1

最终各行:
  rows[0] = "PIN"
  rows[1] = "ALSIG"
  rows[2] = "YAHR"
  rows[3] = "PI"

拼接: "PINALSIGYAHRPI" ✓
```

**核心代码逻辑**：

1. 若 `numRows == 1` 或 `numRows >= n`，直接返回 `s`（退化情况）
2. 初始化 `numRows` 个空字符串，`row = 0`，`step = 1`
3. 遍历每个字符：追加到当前行 → 移动行游标 → 到达边界时翻转方向
4. 拼接所有行

时间复杂度 O(n)，空间复杂度 O(n)（存储结果，不计输出则为 O(1) 额外空间）。

```
class Solution {
public:
    string convert(string s, int numRows) {
        int n = s.size();
        // 退化情况：只有一行，或行数不比串长短
        if (numRows == 1 || numRows >= n) {
            return s;
        }

        // rows[i] 存储第 i 行的字符
        vector<string> rows(numRows);
        int row = 0;   // 当前行游标
        int step = 1;  // 方向：+1 向下，-1 向上

        for (char ch : s) {
            rows[row] += ch;

            // 先移动行游标
            row += step;

            // 到达边界时翻转方向
            if (row == 0 || row == numRows - 1) {
                step = -step;
            }
        }

        // 按行拼接
        string result;
        for (const string& r : rows) {
            result += r;
        }
        return result;
    }
};
```

### 核心优化点解析

**方向翻转的时机**

先 `row += step`，再判断 `row == 0 || row == numRows - 1`。这样初始 `row = 0, step = 1` 时，第一次 `row += step` 使 `row = 1`，不会错误触发边界翻转。后续 `row` 在 0 和 `numRows - 1` 之间自然摆动。

**退化情况处理**

当 `numRows == 1` 时，`step` 会一直在 `row == 0` 时翻转（触顶又触底同时满足），导致 `row` 在 0 和 -1 之间震荡。因此必须在进入模拟前处理这个特殊情况。同理，`numRows >= n` 时每个字符独占一行，无 Z 字形可言，直接返回原串即可。

**使用 `vector<string>` 而非二维数组**

不需要真的构建 Z 字形的二维矩阵，用 `numRows` 个字符串收集字符即可。这避免了预先计算矩阵宽度，也省去了填充空格的开销。

---

### 解法二：直接索引法

Z 字形的排列是周期性的。设 `cycle = 2 × numRows - 2`（当 `numRows > 1` 时），每个周期包含一次"下降"（`numRows` 个字符）和一次"上升"（`numRows - 2` 个字符）。

以 `numRows = 4` 为例，`cycle = 6`：

```
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

时间复杂度 O(n)，空间复杂度 O(1)（不计输出）。

```
class Solution {
public:
    string convert(string s, int numRows) {
        int n = s.size();
        if (numRows == 1 || numRows >= n) {
            return s;
        }

        int cycle = 2 * numRows - 2;  // 每个 Z 字周期的字符数
        string result;
        result.reserve(n);            // 预分配空间

        // 逐行构建
        for (int r = 0; r < numRows; ++r) {
            int k = 0;                // 周期编号
            while (true) {
                // 第一个下标：每个周期中"下降段"该行的字符
                int idx1 = k * cycle + r;
                if (idx1 >= n) break;
                result += s[idx1];

                // 中间行还有第二个下标："上升段"该行的字符
                if (r > 0 && r < numRows - 1) {
                    int idx2 = k * cycle + cycle - r;
                    if (idx2 < n) {
                        result += s[idx2];
                    }
                }

                ++k;
            }
        }

        return result;
    }
};
```

### 两种解法对比

| 维度 | 方向模拟法 | 直接索引法 |
|:---|:---|:---|
| 时间复杂度 | O(n) | O(n) |
| 空间复杂度 | O(n)（`vector<string>`） | O(1)（不计输出） |
| 代码可读性 | ★★★★★ 极直观 | ★★★☆☆ 需理解周期公式 |
| 边界处理 | 仅需 `numRows==1` 特判 | 需分三种行类型处理 |
| 适用场景 | 面试、日常开发 | 追求极致内存的场景 |

**推荐方向模拟法**：代码逻辑与人对 Z 字形的直觉完全一致——"向下走到底，再向上走到顶"，三句话讲清。直接索引法的周期公式虽然优雅，但面试中容易因下标计算失误写出 bug。


