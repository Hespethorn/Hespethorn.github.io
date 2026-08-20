---
title: Leetcode 0073. Set Matrix Zeroes
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: 3be42325
date: 2023-06-03
---

# [73. Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/)


## 题目

Given an *`m* x *n*` matrix. If an element is **0**, set its entire row and column to **0**. Do it **[in-place](https://en.wikipedia.org/wiki/In-place_algorithm)**.

**Follow up:**

- A straight forward solution using O(*mn*) space is probably a bad idea.
- A simple improvement uses O(*m* + *n*) space, but still not the best solution.
- Could you devise a constant space solution?

**Example 1:**

```
Input: matrix = [[1,1,1],[1,0,1],[1,1,1]]
Output: [[1,0,1],[0,0,0],[1,0,1]]
```

**Example 2:**

```
Input: matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]
Output: [[0,0,0,0],[0,4,5,0],[0,3,1,0]]
```

**Constraints:**

- `m == matrix.length`
- `n == matrix[0].length`
- `1 <= m, n <= 200`
- `2^31 <= matrix[i][j] <= 2^31 - 1`

## 题目大意

给定一个 `m x n` 的矩阵，如果一个元素为 0，则将其所在行和列的所有元素都设为 0。请使用原地算法。

## 解题思路

- 此题考查对程序的控制能力，无算法思想。题目要求采用原地的算法，所有修改即在原二维数组上进行。在二维数组中有 2 个特殊位置，一个是第一行，一个是第一列。它们的特殊性在于，它们之间只要有一个 0，它们都会变为全 0 。先用 2 个变量记录这一行和这一列中是否有 0，防止之后的修改覆盖了这 2 个地方。然后除去这一行和这一列以外的部分判断是否有 0，如果有 0，将它们所在的行第一个元素标记为 0，所在列的第一个元素标记为 0 。最后通过标记，将对应的行列置 0 即可。

## 代码

```go
#include <vector>
using namespace std;

class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size();
        if (m == 0) return;
        int n = matrix[0].size();
        
        // 初始化行和列的零标记数组
        vector<bool> rowzero(m, false);  // 标记每行是否有零
        vector<bool> colzero(n, false);  // 标记每列是否有零
        
        // 第一遍遍历：记录有零的行和列
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (matrix[i][j] == 0) {
                    rowzero[i] = true;
                    colzero[j] = true;
                }
            }
        }
        
        // 第二遍遍历：根据标记置零
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (rowzero[i] || colzero[j]) {
                    matrix[i][j] = 0;
                }
            }
        }
    }
};
```