---

title: Leetcode 0037.sudoku-solver
tags:
  - leetcode
  - Array
  - Backtracking
  - Matrix
  - Bit Manipulation
  - Heap
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 2b3c4d5e
date: 2024-05-30

---

# [37. Sudoku Solver](https://leetcode.com/problems/sudoku-solver/)

## 题目

Write a program to solve a Sudoku puzzle by filling the empty cells.

A sudoku solution must satisfy **all of the following rules**:

1. Each of the digits `1-9` must occur exactly once in each row.
2. Each of the digits `1-9` must occur exactly once in each column.
3. Each of the digits `1-9` must occur exactly once in each of the 9 `3x3` sub-boxes of the grid.

The `'.'` character indicates empty cells.

**Example 1:**

```
Input: board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]
Output: [["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","9"]]
```

**Constraints:**

- `board.length == 9`
- `board[i].length == 9`
- `board[i][j]` is a digit or `'.'`.
- It is **guaranteed** that the input Sudoku will have exactly one solution.

## 题目大意

编写一个程序通过填充空单元格来解决数独问题。数独解必须满足：每行、每列、每个 3x3 子网格中数字 1-9 恰好出现一次。

## 解题思路

### 方法一：基础回溯法

#### 思路

使用回溯算法求解数独问题。回溯算法的核心思想是：尝试在当前空单元格填入一个数字，检查是否有效，如果有效则继续下一个单元格，否则撤销当前操作并尝试下一个数字。

#### 复杂度分析

- **时间复杂度**：O(9^(空格数))，每个空格有 9 种选择，但实际远小于这个上界。
- **空间复杂度**：O(1)，递归深度最大为空格数，但不超过 81。

### 方法二：位运算优化

#### 思路

使用位掩码（bitmask）来快速表示和计算可用数字：

1. 用一个 9 位整数表示每行、每列、每个 3x3 宫格中已使用的数字
2. 通过位运算快速计算可用数字
3. 使用 `lowbit` 技巧快速获取最小的可用数字

#### 复杂度分析

- **时间复杂度**：大幅优化的 O(9^(空格数))，实际运行速度提升 10-100 倍。
- **空间复杂度**：O(1)，仅需 27 个整数存储状态。

### 方法三：启发式搜索 + 最小堆（最优解）

> **方法来源**：[灵茶山艾府](https://leetcode.cn/u/endlesscheng/) - [数独？要玩题目就要玩透！](https://leetcode.cn/problems/sudoku-solver/solutions/3767438/shu-du-zen-yao-wan-ti-mu-jiu-zen-yao-zuo-ms2q/)  
> 出处：力扣（LeetCode）  
> 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。2025年09月22日修改

#### 思路

使用 MRV（Minimum Remaining Values）启发式搜索配合最小堆优化：

1. **预记录空格位置**：记录所有空格子的位置和每个格子的候选数字数量
2. **最小堆优先**：使用最小堆（优先队列），优先处理候选数最少的格子
3. **动态更新**：每次尝试后重新计算候选数，若失败则重新入堆

这种方法能在搜索树的早期就剪枝，大幅减少搜索空间，对于困难数独效果尤为显著。

#### 复杂度分析

- **时间复杂度**：大幅剪枝后的 O(9^(空格数))，实际运行速度提升 100-1000 倍。
- **空间复杂度**：O(n)，n 为空格数，用于堆存储。

## 代码实现

{% tabs test1 %}
<!-- tab 基础回溯法 -->

```cpp
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    void solveSudoku(vector<vector<char>>& board) {
        solve(board);
    }
    
    bool solve(vector<vector<char>>& board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    for (char c = '1'; c <= '9'; c++) {
                        if (isValid(board, i, j, c)) {
                            board[i][j] = c;
                            if (solve(board)) {
                                return true;
                            }
                            board[i][j] = '.';
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    bool isValid(vector<vector<char>>& board, int row, int col, char c) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == c) return false;
            if (board[i][col] == c) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == c) return false;
        }
        return true;
    }
};
```

<!-- endtab -->

<!-- tab 位运算优化 -->

```cpp
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int rows[9] = {0};
    int cols[9] = {0};
    int boxes[9] = {0};
    
    void solveSudoku(vector<vector<char>>& board) {
        memset(rows, 0, sizeof(rows));
        memset(cols, 0, sizeof(cols));
        memset(boxes, 0, sizeof(boxes));
        
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] != '.') {
                    int num = board[i][j] - '1';
                    int bit = 1 << num;
                    int box = 3 * (i / 3) + j / 3;
                    rows[i] |= bit;
                    cols[j] |= bit;
                    boxes[box] |= bit;
                }
            }
        }
        
        solve(board);
    }
    
    bool solve(vector<vector<char>>& board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    int box = 3 * (i / 3) + j / 3;
                    int available = ~(rows[i] | cols[j] | boxes[box]) & 0x3FE;
                    
                    while (available) {
                        int bit = available & -available;
                        available -= bit;
                        int num = __builtin_ctz(bit);
                        
                        board[i][j] = '1' + num;
                        rows[i] |= bit;
                        cols[j] |= bit;
                        boxes[box] |= bit;
                        
                        if (solve(board)) {
                            return true;
                        }
                        
                        board[i][j] = '.';
                        rows[i] ^= bit;
                        cols[j] ^= bit;
                        boxes[box] ^= bit;
                    }
                    return false;
                }
            }
        }
        return true;
    }
};
```

<!-- endtab -->

<!-- tab 启发式搜索 + 堆（最优解） -->

```cpp
#include <vector>
#include <string>
#include <queue>
#include <set>
using namespace std;

class Solution {
public:
    void solveSudoku(vector<vector<char>>& board) {
        // 记录每行、每列、每宫已填数字的集合
        set<int> row_set[9];
        set<int> col_set[9];
        set<int> box_set[3][3];
        vector<pair<int, int>> empty_pos;

        // 初始化
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    empty_pos.push_back({i, j});
                } else {
                    int x = board[i][j] - '0';
                    row_set[i].insert(x);
                    col_set[j].insert(x);
                    box_set[i / 3][j / 3].insert(x);
                }
            }
        }

        // lambda 计算候选数
        auto get_candidates = [&](int i, int j) {
            set<int> candidates;
            for (int k = 1; k <= 9; k++) {
                if (row_set[i].find(k) == row_set[i].end() &&
                    col_set[j].find(k) == col_set[j].end() &&
                    box_set[i / 3][j / 3].find(k) == box_set[i / 3][j / 3].end()) {
                    candidates.insert(k);
                }
            }
            return candidates.size();
        };

        // 最小堆：候选数最少的在堆顶
        // 存储格式：{候选数, 索引i, 索引j}
        priority_queue<tuple<int, int, int>, vector<tuple<int, int, int>>, greater<>> empty_heap;
        for (auto& pos : empty_pos) {
            int candidates = get_candidates(pos.first, pos.second);
            empty_heap.push({candidates, pos.first, pos.second});
        }

        // DFS
        function<bool()> dfs = [&]() -> bool {
            if (empty_heap.empty()) return true;

            auto [_, i, j] = empty_heap.top();
            empty_heap.pop();

            int candidates = 0;
            for (int x = 1; x <= 9; x++) {
                if (row_set[i].count(x) || col_set[j].count(x) || box_set[i / 3][j / 3].count(x)) {
                    continue;
                }

                // 尝试填入数字
                board[i][j] = '0' + x;
                row_set[i].insert(x);
                col_set[j].insert(x);
                box_set[i / 3][j / 3].insert(x);

                if (dfs()) return true;

                // 回溯
                row_set[i].erase(x);
                col_set[j].erase(x);
                box_set[i / 3][j / 3].erase(x);
                candidates++;
            }

            // 重新入堆
            empty_heap.push({candidates, i, j});
            return false;
        };

        dfs();
    }
};
```

<!-- endtab -->

{% endtabs %}