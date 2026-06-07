---
title: Leetcode 1048. Longest String Chain
tags:
  - leetcode
categories:
  - Leetcode
  - 递归
series: Leetcode
abbrlink: 694b7d2
date: 2024-03-30 19:04:00
---

## [1048. Longest String Chain](https://leetcode.com/problems/longest-string-chain/)

You are given an array of words where each word consists of lowercase English letters.

wordA is a predecessor of wordB if and only if we can insert exactly one letter anywhere in wordA without changing the order of the other characters to make it equal to wordB.

For example, "abc" is a predecessor of "abac", while "cba" is not a predecessor of "bcad".
A word chain is a sequence of words [word1, word2, ..., wordk] with k >= 1, where word1 is a predecessor of word2, word2 is a predecessor of word3, and so on. A single word is trivially a word chain with k == 1.

Return the lenth of the longest possible word chain with words chosen from the given list of words.

## 题目大意

给定一个由小写英文字母组成的单词数组 `words`，定义 “前驱” 关系：若能在 `wordA` 中**恰好插入一个字符**（不改变原有字符顺序）得到 `wordB`，则 `wordA` 是 `wordB` 的前驱。

“单词链” 是由单词组成的序列 `[word1, word2, ..., wordk]`（k≥1），满足 `word1` 是 `word2` 的前驱、`word2` 是 `word3` 的前驱，以此类推。单个单词默认是长度为 1 的单词链。

要求返回从给定单词中选出的最长单词链的长度。

## 示例

- **示例 1**：
  输入：`words = ["a","b","ba","bca","bda","bdca"]`
  输出：4
  解释：最长单词链之一是 `["a","ba","bda","bdca"]`
- **示例 2**：
  输入：`words = ["xbc","pcxbcf","xb","cxbc","pcxbc"]`
  输出：5
  解释：所有单词可组成链 `["xb", "xbc", "cxbc", "pcxbc", "pcxbcf"]`
- **示例 3**：
  输入：`words = ["abcd","dbqca"]`
  输出：1
  解释：最长链是单个单词（如 `["abcd"]`），两单词无法形成链（字符顺序改变）

## 解题思路

采用了**递归 + 记忆化**的方法来解决最长字符串链问题

1. 先将所有单词存入哈希表，便于快速判断某个字符串是否存在
2. 对每个单词，递归计算以它为起点的最长字符串链长度
3. 使用记忆化技术存储已计算的结果，避免重复计算

```
class Solution {
public:
    int longestStrChain(vector<string>& words) {
        // 存储所有单词，值为以该单词为起点的最长链长度（0表示未计算）
        unordered_map<string, int> ws;
        for (auto& s : words) {
            ws[s] = 0; // 0 表示未被计算
        }
        
        // 定义递归lambda函数，this捕获支持递归调用（C++17可用）
        auto dfs = [&](this auto&& dfs, const string& s) -> int {
            int res = ws[s];
            if (res) {
                return res; // 之前计算过，直接返回缓存结果
            }
            
            // 枚举删除s中每个位置的字符，生成可能的前驱
            for (int i = 0; i < s.length(); i++) { 
                // 删除第i个字符得到候选前驱t
                auto t = s.substr(0, i) + s.substr(i + 1);
                
                if (ws.count(t)) { // 如果t在单词列表中
                    // 递归计算t的最长链长度，并更新当前结果
                    res = max(res, dfs(t));
                }
            }
            
            // 记忆化存储结果：当前单词的最长链 = 最长前驱链 + 1
            return ws[s] = res + 1; 
        };
        
        int ans = 0;
        // 对每个单词计算最长链长度，并更新全局最大值
        for (auto& [s, _] : ws) {
            ans = max(ans, dfs(s));
        }
        
        return ans;
    }
};
```