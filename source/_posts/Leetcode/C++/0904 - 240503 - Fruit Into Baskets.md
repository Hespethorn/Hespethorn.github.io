---
title: Leetcode 0904. Fruit Into Baskets
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 4b5dc48c
date: 2024-03-06
---

# [904. Fruit Into Baskets](https://leetcode.com/problems/fruit-into-baskets/)

## 题目

In a row of trees, the i-th tree produces fruit with type tree[i].

You start at any tree of your choice, then repeatedly perform the following steps:

1. Add one piece of fruit from this tree to your baskets.  If you cannot, stop.
2. Move to the next tree to the right of the current tree.  If there is no tree to the right, stop.

Note that you do not have any choice after the initial choice of starting tree: you must perform step 1, then step 2, then back to step 1, then step 2, and so on until you stop.

You have two baskets, and each basket can carry any quantity of fruit, but you want each basket to only carry one type of fruit each.

What is the total amount of fruit you can collect with this procedure?


Example 1:

```c
Input: [1,2,1]
Output: 3
Explanation: We can collect [1,2,1].
```

Example 2:

```c
Input: [0,1,2,2]
Output: 3
Explanation: We can collect [1,2,2].
If we started at the first tree, we would only collect [0, 1].
```

Example 3:

```c
Input: [1,2,3,2,2]
Output: 4
Explanation: We can collect [2,3,2,2].
If we started at the first tree, we would only collect [1, 2].
```

Example 4:

```c
Input: [3,3,3,1,2,1,1,2,3,3,4]
Output: 5
Explanation: We can collect [1,2,1,1,2].
If we started at the first tree or the eighth tree, we would only collect 4 fruits.
```

Note:

- 1 <= tree.length <= 40000
- 0 <= tree[i] < tree.length

## 题目大意

这道题考察的是滑动窗口的问题。

给出一个数组，数组里面的数字代表每个果树上水果的种类，1 代表一号水果，不同数字代表的水果不同。现在有 2 个篮子，每个篮子只能装一个种类的水果，这就意味着只能选 2 个不同的数字。摘水果只能从左往右摘，直到右边没有水果可以摘就停下。问可以连续摘水果的最长区间段的长度。


## 解法1：map

维护一个滑动窗口（由`left`和`right`指针界定），窗口内最多包含两种水果类型。当窗口中水果类型超过两种时，通过移除数量最少的那种水果来保证窗口的有效性，同时追踪窗口的最大长度。

- 右指针`right`从 0 开始遍历所有水果，每次将当前水果加入`basket`（数量 + 1）。

- 当`basket`中水果类型超过 2 种时，进入循环收缩窗口
- 每次取出左指针指向的水果类型，将其数量减 1
- 如果数量减为 0，说明窗口中已没有这种水果，从 map 中删除该键
- 左指针右移，缩小窗口范围
- 重复操作直到`basket`中只剩 2 种或更少的水果类型

每次调整窗口后，计算当前窗口的长度（`right - left + 1`），并与`max_count`比较，保留较大值。

```
#include <vector>
#include <map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        map<int, int> basket;  // 用于存储当前篮子中的水果类型及数量
        int left = 0;          // 滑动窗口左边界
        int max_count = 0;     // 最大水果数量
        int n = fruits.size();
        
        for (int right = 0; right < n; ++right) {
            // 将当前水果加入篮子
            basket[fruits[right]]++;
            
            // 当篮子中水果类型超过2种时，移动左边界直到只剩2种
            while (basket.size() > 2) {
                int left_fruit = fruits[left];
                basket[left_fruit]--;
                // 如果该类型水果数量为0，从篮子中移除
                if (basket[left_fruit] == 0) {
                    basket.erase(left_fruit);
                }
                left++;
            }
            
            // 更新最大水果数量
            max_count = max(max_count, right - left + 1);
        }
        
        return max_count;
    }
};

```

### 解法2：哈希

```
#include <vector>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        int n = fruits.size();
        if (n <= 2) return n;  // 特殊情况：水果数量不超过2，直接返回
        
        unordered_map<int, int> basket;  // 记录当前篮子中的水果类型及数量
        int left = 0;                    // 窗口左边界
        int max_count = 0;               // 最大水果数量
        
        for (int right = 0; right < n; ++right) {
            // 将当前水果加入篮子
            basket[fruits[right]]++;
            
            // 当篮子中水果类型超过两种时，缩小左边界
            while (basket.size() > 2) {
                int left_fruit = fruits[left];
                basket[left_fruit]--;
                // 如果该类型水果数量为0，从篮子中移除
                if (basket[left_fruit] == 0) {
                    basket.erase(left_fruit);
                }
                left++;  // 左边界右移
            }
            
            // 更新最大水果数量
            max_count = max(max_count, right - left + 1);
        }
        
        return max_count;
    }
};
```

1. **初始化处理**：
   - 若水果总数不超过 2，直接返回总数（必然可以全部采摘）
   - `basket` 用于记录当前窗口中两种水果的数量
   - `left` 为窗口左边界，初始为 0
   - `max_count` 记录最大采摘数量
2. **扩大窗口（右指针移动）**：
   - 右指针从 0 开始遍历数组，将当前水果加入`basket`
   - 若该水果类型已存在，数量加 1；否则新增类型并设数量为 1
3. **收缩窗口（左指针移动）**：
   - 当`basket`中水果类型超过 2 种时，需要收缩窗口
   - 左指针右移，减少对应水果的数量，若数量减为 0 则从`basket`中移除
   - 直到`basket`中仅剩 1 种水果，此时可以加入新的水果类型
4. **更新最大值**：
   - 每次调整窗口后，计算当前窗口长度（`right - left + 1`）
   - 与`max_count`比较，更新最大值