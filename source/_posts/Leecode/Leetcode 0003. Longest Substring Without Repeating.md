---
title: Leetcode 0003. Longest Substring Without Repeating Characters
tags:
  - leetcode
  - Hash Table
categories:
  - Leetcode
series: Leetcode
abbrlink: e19faaa2
date: 2022-04-01 22:27:00
---
------

# [3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)

## 题目

Given a string, find the length of the longest substring without repeating characters.



Example 1:

```c
Input: "abcabcbb"
Output: 3 
Explanation: The answer is "abc", with the length of 3. 
```

Example 2:

```c
Input: "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
```

Example 3:

```c
Input: "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3. 
             Note that the answer must be a substring, "pwke" is a subsequence and not a substring.
```

## 题目大意


在一个字符串中寻找没有重复字母的最长子串。

## 解题思路

这一题和第 438 题，第 3 题，第 76 题，第 567 题类似，用的思想都是"滑动窗口"。

滑动窗口的右边界不断的右移，只要没有重复的字符，就持续向右扩大窗口边界。一旦出现了重复字符，就需要缩小左边界，直到重复的字符移出了左边界，然后继续移动滑动窗口的右边界。以此类推，每次移动需要计算当前长度，并判断是否需要更新最大长度，最终最大的值就是题目中的所求。

### 方法一：基础滑动窗口（暴力收缩左边界）

**思路**

- 用一个数组cnt[128]记录窗口内每个字符出现的次数，数组大小为 128 是为了覆盖所有 ASCII 字符。
- 右指针right从 0 开始遍历字符串，每遍历到一个字符，就将其在cnt数组中的计数加 1。
- 当cnt[s[right]] > 1时，说明出现了重复字符，此时左指针left向右移动，同时将对应的字符计数减 1，直到cnt[s[right]] == 1，确保窗口内没有重复字符。

- 每次调整窗口后，计算当前窗口长度right - left + 1，并与最大长度比较，更新最大长度。

**复杂度分析**

- **时间复杂度**：O (n)，其中 n 是字符串的长度。虽然存在嵌套的 while 循环，但每个字符最多被左指针和右指针各访问一次。

- **空间复杂度**：O (1)，因为数组cnt的大小是固定的 128，不随输入字符串的长度变化而变化。

### 方法二：优化滑动窗口（直接定位左边界）

#### 思路

- 基础方法中，左边界是逐步收缩的，而优化方法则是直接定位到合适的左边界位置，减少不必要的移动。
- 用一个数组last_pos[128]记录每个字符最后一次出现的索引，初始值设为 - 1，表示该字符尚未出现过。
- 右指针right遍历字符串，对于当前字符c，如果last_pos[c] >= left，说明该字符在当前窗口内已经出现过，此时直接将左边界left更新为last_pos[c] + 1，跳过中间不必要的收缩过程。
- 更新last_pos[c]为当前的right值，并计算当前窗口长度，更新最大长度。

#### 复杂度分析

- **时间复杂度**：相比基础方法，该方法减少了左指针的移动次数，将左指针的 “逐步移动” 改为 “直接跳转”，在实际运行中效率更高。时间复杂度仍为 O (n)，空间复杂度为 O (1)，但实际性能更优。

### 方法三：针对特定字符集的进一步优化

#### 思路

- 如果已知输入字符串的字符集范围较小，比如仅包含小写字母，那么可以进一步优化空间使用。
- 对于仅包含小写字母的字符串，使用大小为 26 的数组来记录字符信息，通过c - 'a'将字符映射为 0-25 的索引。
- 其他逻辑与优化滑动窗口方法一致。

#### 优化点

- 该方法适用于明确知道输入字符集范围的情况，能有效节省内存空间，但通用性相对较差。如果输入字符串可能包含其他字符（如大写字母、数字、符号等），则不适用。

------

## 代码实现

{% tabs Longest Substring Without Repeating Characters %}

<!-- tab 基础滑动窗口 -->

```c
int lengthOfLongestSubstring(char* s) {
    int cnt[128] = {0};
    int left = 0;
    int max_len = 0;
    for (int right = 0; s[right] != '\0'; right++) {
        char c = s[right];
        cnt[c]++;
        // 出现重复字符，收缩左边界
        while (cnt[c] > 1) {
            cnt[s[left]]--;
            left++;
        }
        // 更新最大长度
        int current_len = right - left + 1;
        if (current_len > max_len) {
            max_len = current_len;
        }
    }
    return max_len;
}
```

<!-- endtab -->

<!-- tab 优化滑动窗口（直接定位左边界） -->

```c
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int last_pos[128];
    memset(last_pos, -1, sizeof(last_pos));
    int left = 0;
    int max_len = 0;
    for (int right = 0; s[right] != '\0'; right++) {
        char c = s[right];
        // 若字符在当前窗口内已出现，直接调整左边界
        if (last_pos[c] >= left) {
            left = last_pos[c] + 1;
        }
        last_pos[c] = right;
        // 更新最大长度
        int current_len = right - left + 1;
        if (current_len > max_len) {
            max_len = current_len;
        }
    }
    return max_len;
}
```

<!-- endtab -->

<!-- tab 针对特定字符集的进一步优化 -->

```c
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int last_pos[26];
    memset(last_pos, -1, sizeof(last_pos));
    int left = 0;
    int max_len = 0;
    for (int right = 0; s[right] != '\0'; right++) {
        char c = s[right] - 'a'; // 映射为0-25的索引
        if (last_pos[c] >= left) {
            left = last_pos[c] + 1;
        }
        last_pos[c] = right;
        int current_len = right - left + 1;
        if (current_len > max_len) {
            max_len = current_len;
        }
    }
    return max_len;
}
```

<!-- endtab -->

<!-- tab 官方答案 -->

```
#define MAX(a, b) ((b) > (a) ? (b) : (a))

int lengthOfLongestSubstring(char* s) {
    int ans = 0, left = 0;
    bool has[128] = {}; // 也可以用哈希集合，这里为了效率用的数组
    for (int right = 0; s[right]; right++) {
        char c = s[right];
        // 如果窗口内已经包含 c，那么再加入一个 c 会导致窗口内有重复元素
        // 所以要在加入 c 之前，先移出窗口内的 c
        while (has[c]) { // 窗口内有 c
            has[s[left]] = false;
            left++; // 缩小窗口
        }
        has[c] = true; // 加入 c
        ans = MAX(ans, right - left + 1); // 更新窗口长度最大值
    }
    return ans;
}
```

<!-- endtab -->

{% endtabs %}

