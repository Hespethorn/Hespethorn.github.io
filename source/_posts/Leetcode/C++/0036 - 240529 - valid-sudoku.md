---
title: Leetcode 0036.valid-sudoku
tags:
  - leetcode
  - Array
  - Hash Table
  - Matrix
categories: [Leetcode, C++]
series: Leetcode-Cpp
abbrlink: 4a5b6c7d
date: 2024-05-29
---

# [36. Valid Sudoku](https://leetcode.com/problems/valid-sudoku/)

## 题目

Determine if a `9 x 9` Sudoku board is valid. Only the filled cells need to be validated **according to the following rules**:

1. Each row must contain the digits `1-9` without repetition.
2. Each column must contain the digits `1-9` without repetition.
3. Each of the nine `3 x 3` sub-boxes of the grid must contain the digits `1-9` without repetition.

**Note:**

- A Sudoku board (partially filled) could be valid but is not necessarily solvable.
- Only the filled cells need to be validated according to the mentioned rules.

**Example 1:**

```
Input: board = 
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
Output: true
```

**Example 2:**

```
Input: board = 
[["8","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
Output: false
Explanation: Same as Example 1, except with the 5 in the top left corner being modified to 8. Since there are two 8's in the top left 3x3 sub-box, it is invalid.
```

## 题目大意

判断一个 9x9 的数独是否有效。只需要根据规则验证已填入的数字：每行、每列、每个 3x3 宫内数字 1-9 不能重复。

## 解题思路

### 方法：哈希表记录

#### 思路

使用哈希表（或数组）记录每一行、每一列、每一个 3x3 宫格中已经出现过的数字。遍历整个数独，对于每个已填入的数字：

1. 检查是否在当前行出现过
2. 检查是否在当前列出现过
3. 检查是否在当前 3x3 宫格出现过

如果任一检查发现重复，返回 false。

对于 3x3 宫格的索引计算：`box_index = (row / 3) * 3 + (col / 3)`

#### 复杂度分析

- **时间复杂度**：O(1)，因为数独固定为 9x9，遍历次数恒定。
- **空间复杂度**：O(1)，记录空间固定为 9x9 = 81 个元素。

## 代码实现

```cpp
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        bool rows[9][9] = {false};
        bool cols[9][9] = {false};
        bool boxes[9][9] = {false};
        
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') continue;
                
                int num = board[i][j] - '1';
                int box_index = (i / 3) * 3 + (j / 3);
                
                if (rows[i][num] || cols[j][num] || boxes[box_index][num]) {
                    return false;
                }
                
                rows[i][num] = true;
                cols[j][num] = true;
                boxes[box_index][num] = true;
            }
        }
        
        return true;
    }
};
```

