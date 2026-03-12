---
title: Leetcode 0409. 最长回文串
tags:
  - leetcode
categories:
  - Leetcode
  - 贪心算法
series: Leetcode
abbrlink: 25ef34b3
date: 2025-05-25 20:39:32
---

## [409. 最长回文串](https://leetcode.cn/problems/longest-palindrome/)

给定一个包含大写字母和小写字母的字符串 `s` ，返回 *通过这些字母构造成的 **最长的 回文串*** 的长度。

在构造过程中，请注意 **区分大小写** 。比如 `"Aa"` 不能当做一个回文字符串。

 **示例 1:**

```
输入:s = "abccccdd"
输出:7
解释:
我们可以构造的最长的回文串是"dccaccd", 它的长度是 7。
```

**示例 2:**

```
输入:s = "a"
输出:1
解释：可以构造的最长回文串是"a"，它的长度是 1。
```

## 解题思路

核心思路是**统计字符频率**，利用回文串的特性计算最大长度：

1. **回文串特性**：

   - 回文串对称位置的字符相同；
   - 偶数长度的回文串：所有字符出现次数均为偶数；
   - 奇数长度的回文串：仅有一个字符出现奇数次（位于中心），其余均为偶数次。

2. **频率统计**：

   - 统计字符串中每个字符的出现次数；
   - 累计所有字符的**最大偶数次**（例如，出现 5 次的字符可贡献 4 次）；
   - 若存在出现奇数次的字符，可在结果中加 1（作为中心字符）。

3. **计算逻辑**：

   - 初始化结果 `max_len` 为 0，标记 `has_odd` 表示是否有奇数次字符；

   - 对每个字符的频率`count`：

     - `max_len += count // 2 * 2`（累加最大偶数部分）；
     - 若 `count` 为奇数，设置 `has_odd = true`；

   - 若 `has_odd` 为 true，`max_len += 1`（添加中心字符）。

## 代码实现

```
class Solution {
public:
    int longestPalindrome(string s) {
        unordered_map<char, int> freq;  // 统计每个字符的出现次数
        for (char c : s) {
            freq[c]++;
        }
        
        int max_len = 0;
        bool has_odd = false;  // 是否存在出现奇数次的字符
        
        for (auto& [c, count] : freq) {
            // 累加当前字符的最大偶数次贡献
            max_len += count / 2 * 2;
            // 若存在奇数次，标记为true
            if (count % 2 == 1) {
                has_odd = true;
            }
        }
        
        // 若有奇数次字符，可额外加1（作为中心）
        return has_odd ? max_len + 1 : max_len;
    }
};
```