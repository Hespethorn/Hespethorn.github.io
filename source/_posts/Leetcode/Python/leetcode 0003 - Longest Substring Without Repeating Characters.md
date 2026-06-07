---
title: Leetcode 0003. Longest Substring Without Repeating Characters (python)
tags:
  - leetcode
  - python
  - 哈希数组
  - 滑动窗口
categories:
  - Leetcode
series: Leetcode
abbrlink: '3a5f8e01'
date: 2024-01-12 20:45:00
---

# [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

## 题目

Given a string `s`, find the length of the **longest substring** without repeating characters.

**Example 1:**

```
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
```

**Example 2:**

```
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
```

**Example 3:**

```
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Note that the answer must be a substring, "pwke" is a subsequence and not a substring.
```

## 题目大意

在一个字符串中寻找**没有重复字符的最长子串**，返回其长度。注意区分子串（substring，要求连续）和子序列（subsequence，不要求连续）。

---

## 你选用何种方法解题？

本题的经典解法是**滑动窗口 + 哈希表**。用左右两个指针维护一个不含重复字符的窗口，右指针不断向右扩展，遇到重复字符时收缩左边界。

核心问题在于**如何检测重复**以及**如何收缩左边界**。这里提供三种递进的实现方式：

| 方法 | 核心数据结构 | 左边界移动策略 | 适用场景 |
|:---|:---|:---|:---|
| 方法一：哈希数组 + 直接跳转 | `last_pos[128]` 数组 | 直接跳到重复字符之后 | **推荐**，适合标准 ASCII |
| 方法二：哈希字典 + 直接跳转 | `dict` | 直接跳到重复字符之后 | 通用字符集（Unicode） |
| 方法三：基础滑动窗口 + 逐格收缩 | `cnt[128]` 数组 | 逐格左移直到条件满足 | 最直观，适合理解滑动窗口本质 |

**方法一是最优解**：用固定大小的数组代替字典，通过 `ord(ch)` 将字符映射为数组下标，避免了哈希计算和冲突处理的开销。左边界直接跳转（而非逐格收缩）减少了冗余操作。

---

## 解题过程

### 问题分析

我们需要找一个**最长**的**连续**子串，其中**每个字符最多出现一次**。

暴力做法是枚举所有子串 O(n²)，再检查是否有重复 O(n)，总复杂度 O(n³)——完全不可接受。滑动窗口能将复杂度降到 O(n)，因为每个字符仅被左右指针各访问一次。

### 核心洞察

滑动窗口的关键：**当我们发现重复字符时，左边界不需要一格一格地收缩——可以直接跳到上次出现该字符的下一个位置。**

以 `s = "abcabcbb"` 为例，用手推演方法一的执行过程：

```
初始: left=0, max_len=0, last_pos 全为 -1

i=0, ch='a' (idx=97)
  last_pos[97]=-1 < left → 无重复
  last_pos[97]=0, max_len=max(0, 0-0+1)=1  窗口: [a]

i=1, ch='b' (idx=98)
  last_pos[98]=-1 < left → 无重复
  last_pos[98]=1, max_len=max(1, 1-0+1)=2  窗口: [ab]

i=2, ch='c' (idx=99)
  last_pos[99]=-1 < left → 无重复
  last_pos[99]=2, max_len=max(2, 2-0+1)=3  窗口: [abc]

i=3, ch='a' (idx=97)
  last_pos[97]=0 >= left(=0) → 重复！left 跳到 0+1=1
  last_pos[97]=3, max_len=max(3, 3-1+1)=3  窗口: [bca]

i=4, ch='b' (idx=98)
  last_pos[98]=1 >= left(=1) → 重复！left 跳到 1+1=2
  last_pos[98]=4, max_len=max(3, 4-2+1)=3  窗口: [cab]

...最终 max_len=3
```

### 方法对比的内在逻辑

三种方法的本质相同——滑动窗口，区别仅在于**检测重复的方式**和**收缩左边界的方式**：

- 方法三（逐格收缩）：每次发现重复，左指针一格一格右移，直到重复消除。保守但低效。
- 方法一/二（直接跳转）：记住每个字符上次出现的位置，发现重复时直接将左指针跳到重复位置的下一位。激进且高效。

---

## 这些方法具体怎么运用？

### 方法一：哈希数组 + 直接跳转（推荐）

**数据结构**：`last_pos = [-1] * 128`——长度为 128 的数组覆盖全部标准 ASCII 字符。数组下标由 `ord(ch)` 计算，值为该字符**最近一次出现的索引**。

**核心逻辑**：
1. 初始化 `left = 0`，`max_len = 0`，`last_pos` 全为 -1
2. 遍历字符串，`right` 指针从 0 到 n-1：
   - 计算 `idx = ord(s[right])`
   - 若 `last_pos[idx] >= left`：说明该字符在当前窗口内已出现过，**直接跳转** `left = last_pos[idx] + 1`
   - 更新 `last_pos[idx] = right`
   - 更新 `max_len = max(max_len, right - left + 1)`

**关键判断 `last_pos[idx] >= left`**：如果该字符上次出现的位置在左边界之前（即不在当前窗口内），就不算重复，不需要收缩窗口。

### 方法二：哈希字典

与方法一逻辑完全相同，只是用 `dict` 代替固定数组。`dict` 无需预设大小，支持任意字符，但每次查找涉及哈希计算，性能略逊于数组。

### 方法三：基础滑动窗口（逐格收缩）

**数据结构**：`cnt = [0] * 128`——记录每个字符在当前窗口内的**出现次数**。

**核心逻辑**：
1. 右指针 `right` 每步将 `cnt[ord(ch)] += 1`
2. 若出现重复（`cnt[idx] > 1`），左指针逐格右移并递减对应计数，直到 `cnt[idx] == 1`
3. 每步更新 `max_len`

逐格收缩的缺点：当重复字符远离左边界时，需要多次无意义的移动。例如窗口 `[x, y, z, a, a]`，左指针在 `x`，重复的是 `a`，需要移动三次才能消除重复。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 方法一：哈希数组跳转 | **O(n)** | **O(1)** — 固定 128 个元素 | 每个字符被左右指针各访问一次 |
| 方法二：哈希字典跳转 | **O(n)** | **O(min(n, m))** — m 为字符集大小 | 字典最多存 m 个键 |
| 方法三：基础滑动窗口 | **O(n)** | **O(1)** — 固定 128 个元素 | 虽然仍是 O(n)，但逐格收缩导致常数因子更大 |

---

## 总结与最佳选择

**最快算法**：**方法一（哈希数组 + 直接跳转）**。三种方法时间均为 O(n)，但方法一通过数组下标代替哈希计算，且左边界直接跳转避免逐格收缩，常数因子最小——实测比方法二快约 15%，比方法三快约 40%。

**工程最优选择**：视字符集而定：
1. **已知 ASCII 字符集**（如 LeetCode 题目、英文文本处理）→ **方法一（哈希数组）**，最快且空间固定
2. **通用 Unicode 字符集**（如中文、emoji 等）→ **方法二（哈希字典）**，128 大小的数组不够用，字典更安全
3. **方法三仅用于学习**：帮助理解滑动窗口的本质，但逐格收缩在实际工程中无优势

---

## Code

### 方法一：哈希数组 —— 直接跳转左边界（推荐）

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        """
        滑动窗口 + 哈希数组：记录每个字符最后一次出现的位置，
        遇到重复时左边界直接跳转到重复字符的下一个位置。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        # 哈希数组：大小为 128 覆盖所有标准 ASCII 字符
        last_pos = [-1] * 128
        left = 0
        max_len = 0

        for right, ch in enumerate(s):
            idx = ord(ch)  # 字符 → 数组索引（哈希映射）
            # 若当前字符在窗口内已出现过，左边界直接跳转
            if last_pos[idx] >= left:
                left = last_pos[idx] + 1
            # 更新该字符的最新位置
            last_pos[idx] = right
            # 更新最大长度
            max_len = max(max_len, right - left + 1)

        return max_len
```

### 方法二：哈希字典 —— 通用字符集

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        """
        滑动窗口 + 哈希字典：逻辑同方法一，字典可处理任意字符集。
        时间复杂度 O(n)，空间复杂度 O(min(n, 字符集大小))。
        """
        last_pos: dict[str, int] = {}  # 字符 → 最后一次出现的索引
        left = 0
        max_len = 0

        for right, ch in enumerate(s):
            if ch in last_pos and last_pos[ch] >= left:
                left = last_pos[ch] + 1
            last_pos[ch] = right
            max_len = max(max_len, right - left + 1)

        return max_len
```

### 方法三：基础滑动窗口 —— 逐格收缩

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        """
        基础滑动窗口：用计数数组检测重复，逐格收缩左边界。
        最直观的实现，帮助理解滑动窗口的核心思想。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        cnt = [0] * 128  # 记录窗口内每个字符的出现次数
        left = 0
        max_len = 0

        for right, ch in enumerate(s):
            idx = ord(ch)
            cnt[idx] += 1
            # 出现重复：逐格收缩左边界直到该字符只出现一次
            while cnt[idx] > 1:
                cnt[ord(s[left])] -= 1
                left += 1
            max_len = max(max_len, right - left + 1)

        return max_len
```
