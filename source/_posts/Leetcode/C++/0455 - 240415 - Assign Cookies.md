---
title: Leetcode 0455. Assign Cookies
tags:
  - leetcode
categories:
  - Leetcode
  - 贪心算法
series: Leetcode
abbrlink: 3e66e07f
date: 2024-01-05 23:16:00
---

## [455. Assign Cookies](https://leetcode.cn/problems/assign-cookies/)

Assume you are an awesome parent and want to give your children some cookies. But, you should give each child at most one cookie.

Each child `i` has a greed factor `g[i]`, which is the minimum size of a cookie that the child will be content with; and each cookie `j` has a size `s[j]`. If `s[j] >= g[i]`, we can assign the cookie `j` to the child `i`, and the child `i` will be content. Your goal is to maximize the number of your content children and output the maximum number.

**Example 1:**

```
Input: g = [1,2,3], s = [1,1]
Output: 1
Explanation: You have 3 children and 2 cookies. The greed factors of 3 children are 1, 2, 3. 
And even though you have 2 cookies, since their size is both 1, you could only make the child whose greed factor is 1 content.
You need to output 1.
```

**Example 2:**

```
Input: g = [1,2], s = [1,2,3]
Output: 2
Explanation: You have 2 children and 3 cookies. The greed factors of 2 children are 1, 2. 
You have 3 cookies and their sizes are big enough to gratify all of the children, 
You need to output 2.
```

## 题目大意

给定两个数组：`g`（每个元素表示孩子的贪心因子，即孩子满足的最小饼干尺寸）和`s`（每个元素表示饼干的尺寸）。每个孩子最多分配一块饼干，只有当饼干尺寸`s[j] >= g[i]`时，孩子`i`才会满足。目标是找到能让最多孩子满足的数量并返回。

例如：

- 输入`g = [1,2,3], s = [1,1]`，输出`1`（仅贪心因子为 1 的孩子能得到尺寸为 1 的饼干）；
- 输入`g = [1,2], s = [1,2,3]`，输出`2`（两个孩子的贪心需求都能被满足）。

## 解题思路

核心思路是**贪心算法**，通过 “小饼干优先满足小贪心” 的策略最大化满足的孩子数量，具体步骤如下：

1. **排序预处理**：
   - 对孩子的贪心因子数组`g`按升序排序（从小到大处理孩子的需求）；
   - 对饼干尺寸数组`s`按升序排序（从小到大使用饼干，避免大饼干浪费在小需求上）。
2. **双指针匹配**：
   - 用两个指针`i`（指向当前未满足的孩子，初始为 0）和`j`（指向当前未分配的饼干，初始为 0）；
   - 遍历饼干数组：
     - 若当前饼干`s[j] >= g[i]`：该饼干能满足当前孩子，`i`和`j`同时后移（孩子满足，饼干分配）；
     - 若当前饼干`s[j] < g[i]`：该饼干太小，无法满足当前及后续孩子（因数组已排序），仅`j`后移（跳过该饼干）；
   - 当`i`遍历完所有孩子或`j`遍历完所有饼干时，停止匹配。
3. **结果返回**：
   - 指针`i`的最终值即为满足的孩子数量（`i`从 0 开始，每满足一个孩子加 1）。

## 代码实现

```
class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        // 对贪心因子和饼干尺寸排序
        sort (g.begin (), g.end ());
        sort (s.begin (), s.end ());
        int i = 0, j = 0; //i: 当前未满足的孩子索引，j: 当前未分配的饼干索引
        int childCount = g.size (), cookieCount = s.size ();
        while (i < childCount && j < cookieCount) {
            // 饼干能满足当前孩子，分配并处理下一个孩子和饼干
            if (s [j] >= g [i]) {
                i++;
                j++;
            }
            // 饼干太小，跳过当前饼干
            else {
                j++;
            }
        }
        return i; //i 的值即为满足的孩子数量
    }
};

```