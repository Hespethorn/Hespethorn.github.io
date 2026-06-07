---
title: Leetcode 0008. String to Integer (atoi) (python)
tags:
  - leetcode
  - python
  - 字符串
  - 有限状态机
  - 整数溢出
categories:
  - Leetcode
series: Leetcode
abbrlink: 'f2a3b4d5'
date: 2024-02-06 22:17:00
---

# [8. String to Integer (atoi)](https://leetcode.com/problems/string-to-integer-atoi/)

## 题目

Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.

The algorithm for `myAtoi(string s)` is as follows:

1. **Whitespace**: Ignore any leading whitespace (`" "`).
2. **Signedness**: Determine the sign by checking if the next character is `'-'` or `'+'`, assuming positivity if neither present.
3. **Conversion**: Read the integer by skipping leading zeros until a non-digit character is encountered or the end of the string is reached. If no digits were read, then the result is `0`.
4. **Rounding**: If the integer is out of the 32-bit signed integer range `[-2³¹, 2³¹ - 1]`, then round the integer to remain in the range. Specifically, integers less than `-2³¹` should be rounded to `-2³¹`, and integers greater than `2³¹ - 1` should be rounded to `2³¹ - 1`.

Return the integer as the final result.

**Example 1:**

```
Input: s = "42"
Output: 42
Explanation:
The underlined characters are what is read in:
"42"
 ^^
```

**Example 2:**

```
Input: s = " -042"
Output: -42
Explanation:
"   -042"
   ^^^^^
```

**Example 3:**

```
Input: s = "1337c0d3"
Output: 1337
Explanation:
"1337c0d3"
 ^^^^
```

**Example 4:**

```
Input: s = "0-1"
Output: 0
Explanation:
"0-1"
 ^
```

**Example 5:**

```
Input: s = "words and 987"
Output: 0
Explanation:
"words and 987"
 ^
```

**Constraints:**

- `0 <= s.length <= 200`
- `s` consists of English letters (lower-case and upper-case), digits (`0-9`), `' '`, `'+'`, `'-'`, and `'.'`.

## 题目大意

实现标准的 `atoi` 函数，将字符串转换为 32 位有符号整数。处理流程严格按四步走：① 跳过前导空格 → ② 判断正负号 → ③ 读取连续数字（遇到非数字停止）→ ④ 溢出则截断到边界值 `[-2³¹, 2³¹ - 1]`。

---

## 你选用何种方法解题？

本题的核心是按顺序处理四种输入类型（空格、符号、数字、非法字符），本质上是一个**有限状态机**。两种主流实现方式：

| 方法 | 核心思路 | 时间复杂度 | 说明 |
|:---|:---|:---:|:---|
| 方法一：直接解析法（推荐） | 三个 while 循环按顺序处理空格、符号、数字 | O(n) | **最优工程解**：代码直观，逐步骤对应题目描述 |
| 方法二：DFA 状态机 | 定义状态转移表，每个字符触发状态跳转 | O(n) | 更结构化，适合复杂规则扩展 |

**方法一是推荐解**：题目描述的四个步骤是**严格线性**的（空格 → 符号 → 数字 → 结束），不存在状态回退。用三个 while 循环直接对应三步处理，代码的可读性和可调试性最佳。DFA 虽然更"工程化"，但在规则如此简单时属于过度设计。

---

## 解题过程

### 问题分析

- **输入**：字符串 `s`（长度 0 ≤ n ≤ 200）
- **输出**：32 位有符号整数，范围 `[-2147483648, 2147483647]`
- **核心规则**：前导空格忽略 → 可选一个符号字符 → 连续数字直到非数字出现

### 核心洞察

atoi 的处理流程天然分成四个**互不重叠的阶段**：

```
"   -042c3"
 ^^^ ^  ^^^ ^
 阶段1 阶段2 阶段3 阶段4 (停止，忽略后续)
 跳过空格 取符号 读数字 返回结果
```

每个阶段只关心一种字符类型，阶段之间不会回退。因此**不需要复杂的状态机**——三个 `while` 循环，每个负责一个阶段，读到不属于当前阶段的字符就进入下一阶段。

### 溢出检测的设计

Python 中整数无上限，需要显式检测。关键判断点：在每次 `num = num * 10 + digit` 之后，若 `num > INT_MAX`，立刻截断返回。

使用位运算计算边界值：
- `INT_MAX = (1 << 31) - 1 = 2147483647`
- `INT_MIN = -(1 << 31) = -2147483648`

**为什么用位运算？** `1 << 31` 直接表达了"第 31 位为 1 的 32 位整数"的语义，比写 `2147483648` 更不容易抄错，也比 `2**31` 更有底层感。

### 手推演示例

以 `s = " -042c3"` 为例：

```
s = "   - 0 4 2 c 3"
      0 1 2 3 4 5 6 7 8
      ↑
      i=0

阶段1 — 跳过空格
  i=0: s[0]=' ' → i=1
  i=1: s[1]=' ' → i=2
  i=2: s[2]=' ' → i=3
  i=3: s[3]='-' ≠ ' ' → 停止

阶段2 — 处理符号
  s[3]='-' → sign = -1, i=4

阶段3 — 读取数字
  i=4: s[4]='0', digit=0
       num = 0*10 + 0 = 0, num ≤ INT_MAX ✓, i=5
  i=5: s[5]='4', digit=4
       num = 0*10 + 4 = 4, num ≤ INT_MAX ✓, i=6
  i=6: s[6]='2', digit=2
       num = 4*10 + 2 = 42, num ≤ INT_MAX ✓, i=7
  i=7: s[7]='c', 非数字 → 停止

结果: sign * num = -1 * 42 = -42 ✓
```

再以溢出案例 `s = "2147483648"` 为例（INT_MAX = 2147483647）：

```
阶段1: 无前导空格
阶段2: 无符号字符，sign=1
阶段3:
  ...前9位 "214748364" → num = 214748364
  i=9: s[9]='8', digit=8
       num = 214748364 * 10 + 8 = 2147483648
       2147483648 > INT_MAX(2147483647) → 返回 INT_MAX ✓
```

再以负溢出 `s = "-2147483649"` 为例：

```
sign = -1
...读取到 num = 2147483649 > INT_MAX
sign < 0 → 返回 -(1<<31) = -2147483648 = INT_MIN ✓
```

**注意**：INT_MIN 的绝对值比 INT_MAX 大 1（即 2147483648），所以在正溢出判断中统一用 `num > INT_MAX`，溢出后根据符号选择返回 INT_MAX 还是 INT_MIN。

---

## 这些方法具体怎么运用？

### 方法一：直接解析法（推荐）

**数据结构**：一个游标指针 `i`，一个累加器 `num`，一个符号标志 `sign`。

**核心逻辑**——三个 while 循环 + 一个 match：

**阶段一：跳过空格**
```python
while i < n and s[i] == " ":
    i += 1
```
简单的前导空格消耗。若 `i == n`（全空格串），返回 0。

**阶段二：处理符号**
```python
match s[i]:
    case "-": sign = -1; i += 1
    case "+": i += 1
    case ch if ch.isdigit(): pass   # 无符号，直接进入数字阶段
    case _: return 0                # 首字符既非符号也非数字，非法
```

Python 3.10+ 的 `match` 语句在这里非常优雅——四种情况一目了然：
- `-`：负号
- `+`：正号（默认 `sign=1`，只需跳过字符）
- 数字：无符号，保持 `sign=1`，`pass` 进入下一阶段
- 其他：非法输入，返回 0

**阶段三：读取数字 + 溢出检测**
```python
MX = (1 << 31) - 1
while i < n and s[i].isdigit():
    num = num * 10 + int(s[i])
    if num > MX:
        return MX if sign > 0 else -(1 << 31)
    i += 1
```

每读入一位数字立即检查溢出——**在 num 已经超过 INT_MAX 的瞬间截断**，而不是等读到更多位再处理。

**为什么溢出检查放在 `num * 10 + digit` 之后而非之前？** 第 7 题的溢出检测需要预判（因为不能存超过 INT_MAX 的值），而 Python 的整数无上限——`num` 可以存任意大的值。先算出来再比较更简洁，且完全等价。

**边界情况**：

| 场景 | 输入 | 关键点 | 结果 |
|:---|:---|:---|:---|
| 全空格 | `"   "` | 阶段一后 `i==n`，返回 0 | `0` |
| 空串 | `""` | `n=0`，阶段一跳过，`i==n` | `0` |
| 无数字 | `"abc"` | match 的 `_` 分支捕获 | `0` |
| 符号后无数字 | `"+"` 或 `"-"` | 阶段二中 `i+=1`，阶段三 `isdigit` 失败 | `0` |
| 数字中间有非法字符 | `"1337c0d3"` | 读到 `c` 时 `isdigit` 失败，停止 | `1337` |
| 前导零 | `"00042"` | `0*10+0=0`，前导零自然消除 | `42` |
| 正溢出 | `"2147483648"` | 最后一位 `8` 使 num 超过 INT_MAX | `2147483647` |
| 负溢出 | `"-2147483649"` | num 超过 INT_MAX，sign<0 → INT_MIN | `-2147483648` |
| 小数 | `"3.14"` | `.` 不是数字，停止于 `3` | `3` |
| 多个符号 | `"+-12"` | match 匹配第一个 `+`，后续 `-` 在阶段三取数字时失败 | `0` |

### 方法二：DFA 状态机

**核心思路**：定义 `start → sign → number → end` 四个状态，用状态转移表驱动。

```
状态转移表:
           ' '    +/-     digit    other
start      start  sign    number   end
sign       end    end     number   end
number     end    end     number   end
end        end    end     end      end
```

DFA 的优势在于规则复杂时容易扩展（比如加入十六进制、科学计数法），但对 atoi 这种简单的线性规则，四个 `if` 或 `match` 语句就够了。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 直接解析法 | **O(n)** | **O(1)** | 每个字符最多被访问一次，游标单向移动 |
| DFA 状态机 | **O(n)** | **O(1)** | 同样的单次遍历，额外维护状态变量 |

两种方法均 O(n) 时间、O(1) 空间。区别仅在代码组织方式——直接解析法的三个 while 每个循环完毕后游标自然指向下一阶段的起点，无需显式状态转移。

---

## 总结与最佳选择

**最快算法**：两种方法等价（均为 O(n) 单次遍历）。

**工程最优选择**：**直接解析法（方法一）**，理由：
1. **与题目描述的映射关系是最直接的**：四个步骤 → 三块代码，读者可以逐步骤对照
2. **`match` 语句极优雅**：Python 3.10+ 的模式匹配让符号判断的四种情况一目了然
3. **溢出检测简单准确**：利用 Python 大整数特性，先算后比，无需预判
4. **游标单向移动保证正确性**：每个 while 循环结束时的 `i` 就是下一阶段的起点，绝不错位

**各方法的使用场景**：
- **直接解析法**：面试和工程首选，代码直译题目描述
- **DFA 状态机**：当 atoi 需求扩展时（如支持十六进制 `0x`、科学计数法 `1e5`），状态机更容易维护

**一句话**：atoi 的核心不是算法而是**边界条件的完备处理**——空格、符号、非法字符、溢出，四类边界各有一个专门的 while/match 分支，缺一不可。

---

## Code

### 方法一：直接解析法（推荐）

```python
class Solution:
    def myAtoi(self, s: str) -> int:
        """直接解析法：三个 while 循环依次处理空格、符号、数字。
        利用 Python 大整数特性，溢出检测在乘法之后进行。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        i = 0
        num = 0
        sign = 1
        n = len(s)

        # ── 阶段一：跳过前导空格 ──
        while i < n and s[i] == " ":
            i += 1

        # 全空格或空串
        if i == n:
            return 0

        # ── 阶段二：处理符号字符 ──
        # Python 3.10+ match 语句：四种情况一目了然
        match s[i]:
            case "-":
                sign = -1
                i += 1
            case "+":
                i += 1
            case ch if ch.isdigit():
                pass          # 无符号，直接进入数字阶段
            case _:
                return 0      # 首字符既非符号也非数字

        # ── 阶段三：读取连续数字 ──
        MX = (1 << 31) - 1    # 2147483647，INT_MAX

        while i < n and s[i].isdigit():
            num = num * 10 + int(s[i])

            # 溢出截断：num 超过 INT_MAX 的瞬间立即返回边界值
            if num > MX:
                return MX if sign > 0 else -(1 << 31)

            i += 1

        return sign * num
```

### 方法二：DFA 状态机（供参考）

```python
from typing import Callable

class Solution:
    def myAtoi(self, s: str) -> int:
        """DFA 状态机：用状态转移表驱动，每个状态对应一种处理逻辑。
        适合规则扩展场景（如支持十六进制、科学计数法）。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        INT_MAX = (1 << 31) - 1
        INT_MIN = -(1 << 31)

        num = 0
        sign = 1
        state = "start"

        # 状态转移表
        TRANS: dict[str, dict[str, str]] = {
            "start":  {" ": "start", "+-": "sign", "digit": "number", "other": "end"},
            "sign":   {" ": "end",   "+-": "end",  "digit": "number", "other": "end"},
            "number": {" ": "end",   "+-": "end",  "digit": "number", "other": "end"},
            "end":    {" ": "end",   "+-": "end",  "digit": "end",    "other": "end"},
        }

        def char_type(ch: str) -> str:
            if ch == " ":
                return " "
            if ch in "+-":
                return "+-"
            if ch.isdigit():
                return "digit"
            return "other"

        for ch in s:
            state = TRANS[state][char_type(ch)]

            if state == "sign":
                sign = -1 if ch == "-" else 1
            elif state == "number":
                num = num * 10 + int(ch)
                if num > INT_MAX:
                    return INT_MAX if sign > 0 else INT_MIN
            elif state == "end":
                break

        return sign * num
```
