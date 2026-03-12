---
title: Leetcode 0048. Rotate Image
tags:
  - leetcode
categories:
  - Leetcode
  - 矩阵
series: Leetcode
abbrlink: 876d5341
date: 2025-08-07 23:20:09
---

## [48. Rotate Image](https://leetcode.cn/problems/rotate-image/)

You are given an `n x n` 2D `matrix` representing an image, rotate the image by **90** degrees (clockwise).

You have to rotate the image [**in-place**](https://en.wikipedia.org/wiki/In-place_algorithm), which means you have to modify the input 2D matrix directly. **DO NOT** allocate another 2D matrix and do the rotation.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/08/28/mat1.jpg)

```
Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [[7,4,1],[8,5,2],[9,6,3]]
```

**Example 2:**

![img](https://assets.leetcode.com/uploads/2020/08/28/mat2.jpg)

```
Input: matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
Output: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]
```

## 题目大意

给定一个 n×n 的二维矩阵，需要将其顺时针旋转 90 度，并且必须在原地旋转，不能使用额外的矩阵空间。

## 解题思路

最有效的原地旋转方法是通过**先转置矩阵，再反转每一行**：

1. 矩阵转置：将矩阵的行变为列（第 i 行第 j 列元素与第 j 行第 i 列元素交换）
2. 反转每行：将转置后的矩阵中每一行的元素进行反转

这种方法只需 O (1) 的额外空间，且操作直观易懂。

```
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        
        // 步骤1：转置矩阵
        for (int i = 0; i < n; ++i) {
            for (int j = i; j < n; ++j) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        
        // 步骤2：反转每一行
        for (int i = 0; i < n; ++i) {
            reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};
```