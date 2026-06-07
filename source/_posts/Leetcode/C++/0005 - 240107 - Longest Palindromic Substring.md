---
title: Leetcode 0005. Longest Palindromic Substring
tags:
  - leetcode
  - 二分查找
categories:
  - Leetcode
  - 二分查找
series: Leetcode
abbrlink: 80ebb657
date: 2023-01-15 23:12:00
---

------

# [5. Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/)


## 题目

Given a string `s`, return *the longest palindromic substring* in `s`.

**Example 1:**

```
Input: s = "babad"
Output: "bab"
Note: "aba" is also a valid answer.

```

**Example 2:**

```
Input: s = "cbbd"
Output: "bb"

```

**Example 3:**

```
Input: s = "a"
Output: "a"

```

**Example 4:**

```
Input: s = "ac"
Output: "a"

```

**Constraints:**

- `1 <= s.length <= 1000`
- `s` consist of only digits and English letters (lower-case and/or upper-case),

## 解题思路

### 解法一:动态规划。

- 定义 `dp[i][j]` 表示从字符串第 `i` 个字符到第 `j` 个字符这一段子串是否是回文串。由回文串的性质可以得知，回文串去掉一头一尾相同的字符以后，剩下的还是回文串。所以状态转移方程是 `dp[i][j] = (s[i] == s[j]) && ((j-i < 3) || dp[i+1][j-1])`，注意特殊的情况，`j - i == 1` 的时候，即只有 2 个字符的情况，只需要判断这 2 个字符是否相同即可。`j - i == 2` 的时候，即只有 3 个字符的情况，只需要判断除去中心以外对称的 2 个字符是否相等。每次循环动态维护保存最长回文串即可。时间复杂度 O(n^2)，空间复杂度 O(n^2)。

```
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        if (n == 0) return "";
        
        // 创建二维数组记录子串是否为回文
        vector<vector<bool>> dp(n, vector<bool>(n, false));
        int start = 0;
        int maxLen = 1;
        
        // 单个字符都是回文
        for (int i = 0; i < n; ++i) {
            dp[i][i] = true;
        }
        
        // 检查长度为2的子串
        for (int i = 0; i < n - 1; ++i) {
            if (s[i] == s[i + 1]) {
                dp[i][i + 1] = true;
                start = i;
                maxLen = 2;
            }
        }
        
        // 检查长度大于2的子串
        for (int len = 3; len <= n; ++len) {
            for (int i = 0; i <= n - len; ++i) {
                int j = i + len - 1;
                if (s[i] == s[j] && dp[i + 1][j - 1]) {
                    dp[i][j] = true;
                    start = i;
                    maxLen = len;
                }
            }
        }
        
        return s.substr(start, maxLen);
    }
};
```

### 解法二：中心扩散法。

- 动态规划的方法中，我们将任意起始，终止范围内的字符串都判断了一遍。其实没有这个必要，如果不是最长回文串，无需判断并保存结果。所以动态规划的方法在空间复杂度上还有优化空间。判断回文有一个核心问题是找到“轴心”。如果长度是偶数，那么轴心是中心虚拟的，如果长度是奇数，那么轴心正好是正中心的那个字母。中心扩散法的思想是枚举每个轴心的位置。然后做两次假设，假设最长回文串是偶数，那么以虚拟中心往 2 边扩散；假设最长回文串是奇数，那么以正中心的字符往 2 边扩散。扩散的过程就是对称判断两边字符是否相等的过程。这个方法时间复杂度和动态规划是一样的，但是空间复杂度降低了。时间复杂度 O(n^2)，空间复杂度 O(1)。

```
class Solution {
public:
    string longestPalindrome(string s) {
        // 处理空字符串或单字符情况
        if(s.size()<2)return s;
        
        int n = s.size();    // 字符串长度
        int l = 0;           // 最长回文子串的起始索引
        int m = 1;           // 最长回文子串的长度（初始为1，单个字符）
        
        // 遍历每个可能的中心，优化点：当剩余长度不可能超过当前最长时提前退出
        for(int i=0; i<n && n-i > m/2; ){
            int x = i;       // 左指针（中心左边界）
            int y = i;       // 右指针（中心右边界）
            
            // 合并连续相同字符（处理偶数长度回文的特殊情况）
            // 例如"aaabaaa"中，i=3时y会直接跳到5（因为s[3]=s[4]=s[5]）
            while(y < n-1 && s[y] == s[y+1]){
                y++;
            }
            
            // 下一次遍历从y+1开始，跳过连续相同的字符（减少重复计算）
            i = y + 1;
            
            // 从当前中心向两侧扩展，寻找最长回文
            while(x > 0 && y < n-1 && s[x-1] == s[y+1]){
                x--;  // 左移扩大左边界
                y++;  // 右移扩大右边界
            }
            
            // 更新最长回文子串的信息
            if(y - x + 1 > m){
                m = y - x + 1;  // 更新长度
                l = x;          // 更新起始索引
            }
        }
        
        // 返回最长回文子串
        return s.substr(l, m);
    }
};
```

### 核心优化点解析

**合并连续相同字符**

- 通过while(y < n-1 && s[y] == s[y+1]){ y++; }将连续相同的字符合并为一个 "超级中心"

- 例如对于 "cbbd"，当 i=1 时，y 会从 1 扩展到 2（因为 s [1]=s [2]='b'），直接处理了偶数长度的回文中心

- 这一步将连续相同字符的多次检查合并为一次，减少了迭代次数

**提前跳过已处理的中心**

- 通过i = y + 1直接将 i 移动到合并后的字符右侧，避免对相同中心的重复处理

- 例如 "aaa" 中，第一次 i=0 时 y 会扩展到 2，i 直接变为 3，循环结束，无需再检查 i=1 和 i=2

**提前终止遍历**

- 循环条件i < n && n - i > m/2确保：当剩余未检查的长度不足以超过当前最长回文时，提前终止

- 例如当前最长回文长度为 5，剩余未检查的子串长度不足 3（5/2=2.5），则无需继续检查

**一次扩展处理两种中心类型**

- 代码同时处理了奇数长度（如 "aba"）和偶数长度（如 "abba"）的回文子串

- 连续相同字符的合并实际是将偶数中心转换为类似奇数中心的处理方式

执行流程示例

**以s = "babad"为例**：

**初始状态**：l=0, m=1

**i=0**：

- x=0, y=0（s [0]='b' 无连续相同字符）

- 扩展后x=0, y=0（无法扩展）

- 长度 1 不更新，i变为 1

**i=1**：

- x=1, y=1（s[1]='a'）

- 扩展检查：s [0]='b' 与 s [2]='b' 相等，x=0, y=2

- 长度 3 > 1，更新l=0, m=3

- i变为 2

**i=2**：

- 剩余长度5-2=3，m/2=1.5，满足循环条件

- x=2, y=2（s[2]='b'）

- 扩展检查：s [1]='a' 与 s [3]='a' 相等，x=1, y=3

- 长度 3 等于当前最长，i变为 4

**循环结束，返回s.substr(0,3)即 "bab"**