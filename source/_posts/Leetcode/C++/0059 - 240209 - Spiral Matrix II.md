---
title: Leetcode 0059. Spiral Matrix II
tags:
  - leetcode
categories: [Leetcode, C++]
  - 矩阵
series: Leetcode-Cpp
abbrlink: e5de6d3b
date: 2023-05-17
---

## [59. Spiral Matrix II](https://leetcode.cn/problems/spiral-matrix-ii/)

Given a positive integer `n`, generate an `n x n` `matrix` filled with elements from `1` to `n2` in spiral order.

 **Example 1:**

![img](https://assets.leetcode.com/uploads/2020/11/13/spiraln.jpg)

```
Input: n = 3
Output: [[1,2,3],[8,9,4],[7,6,5]]
```

**Example 2:**

```
Input: n = 1
Output: [[1]]
```

 **Constraints:**

- `1 <= n <= 20`

## 题目大意

给定一个正整数 n，生成一个 n×n 的矩阵，其中元素从 1 到 n² 按螺旋顺序填充。

## 解题思路

1. 创建一个 n×n 的空矩阵
2. 定义四个边界：上、下、左、右
3. 按顺时针方向（右→下→左→上）填充数字
4. 每填充完一行或一列就调整相应的边界
5. 重复步骤 3-4 直到所有数字都被填充

```
class Solution {
public:
    vector<vector<int>> generateMatrix(int n) {
        // 创建n×n的结果矩阵
        vector<vector<int>> matrix(n, vector<int>(n, 0));
        
        int num = 1; // 要填充的数字
        int top = 0, bottom = n - 1; // 上下边界
        int left = 0, right = n - 1; // 左右边界
        
        while (num <= n * n) {
            // 从左到右填充上边界
            for (int i = left; i <= right; ++i) {
                matrix[top][i] = num++;
            }
            top++; // 上边界下移
            
            // 从上到下填充右边界
            for (int i = top; i <= bottom; ++i) {
                matrix[i][right] = num++;
            }
            right--; // 右边界左移
            
            // 从右到左填充下边界
            for (int i = right; i >= left; --i) {
                matrix[bottom][i] = num++;
            }
            bottom--; // 下边界上移
            
            // 从下到上填充左边界
            for (int i = bottom; i >= top; --i) {
                matrix[i][left] = num++;
            }
            left++; // 左边界右移
        }
        
        return matrix;
    }
};
```

```
/*
方向向量定义：
dirs 数组定义了四个方向的坐标变化：右 (0,1)、下 (1,0)、左 (0,-1)、上 (-1,0)
dir 变量记录当前方向索引（0-3 分别对应四个方向）
填充逻辑：
从 1 到 n² 依次填充数字
每次填充后计算下一个位置的坐标
通过检查下一个位置是否越界或已填充来判断是否需要转向
转向机制：
当遇到边界或已填充的单元格时，通过 dir = (dir + 1) % 4 顺时针切换方向
切换方向后重新计算下一个位置
*/
class Solution {
public:
    vector<vector<int>> generateMatrix(int n) {
        vector<vector<int>> matrix(n, vector<int>(n, 0));
        // 定义四个方向的向量：右、下、左、上
        vector<pair<int, int>> dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
        int dir = 0; // 当前方向索引（初始向右）
        int row = 0, col = 0; // 当前位置
        
        for (int num = 1; num <= n * n; ++num) {
            matrix[row][col] = num;
            
            // 计算下一个位置
            int next_row = row + dirs[dir].first;
            int next_col = col + dirs[dir].second;
            
            // 判断是否需要改变方向：越界或已填充
            if (next_row < 0 || next_row >= n || 
                next_col < 0 || next_col >= n || 
                matrix[next_row][next_col] != 0) {
                dir = (dir + 1) % 4; // 顺时针转向下一个方向
                next_row = row + dirs[dir].first;
                next_col = col + dirs[dir].second;
            }
            
            // 更新当前位置
            row = next_row;
            col = next_col;
        }
        
        return matrix;
    }
};
```

