---

title: Leetcode 0216. Combination Sum III
tags:
  - 回溯算法
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 51ba5778
date: 2023-10-30

---

## [216. Combination Sum III](https://leetcode.cn/problems/combination-sum-iii/)

Find all valid combinations of `k` numbers that sum up to `n` such that the following conditions are true:

- Only numbers `1` through `9` are used.
- Each number is used **at most once**.

Return *a list of all possible valid combinations*. The list must not contain the same combination twice, and the combinations may be returned in any order.

**Example 1:**

```
Input: k = 3, n = 7
Output: [[1,2,4]]
Explanation:
1 + 2 + 4 = 7
There are no other valid combinations.
```

**Example 2:**

```
Input: k = 3, n = 9
Output: [[1,2,6],[1,3,5],[2,3,4]]
Explanation:
1 + 2 + 6 = 9
1 + 3 + 5 = 9
2 + 3 + 4 = 9
There are no other valid combinations.
```

**Example 3:**

```
Input: k = 4, n = 1
Output: []
Explanation: There are no valid combinations.
Using 4 different numbers in the range [1,9], the smallest sum we can get is 1+2+3+4 = 10 and since 10 > 1, there are no valid combination.
```

## 题目大意

找出所有由 `k` 个不同数字组成的组合，这些数字只能是 `1` 到 `9` 之间的整数，且每个数字最多使用一次，同时这些数字的和等于 `n`。返回所有可能的有效组合，组合中不能有重复，顺序不限。

例如：

- 输入 `k=3, n=7`，输出 `[[1,2,4]]`（1+2+4=7）；
- 输入 `k=3, n=9`，输出 `[[1,2,6],[1,3,5],[2,3,4]]`。

## 解题思路

该问题是组合问题的变种，核心思路基于**递归回溯**，并增加了**和的约束**与**数字范围限制**：

1. **倒序枚举与递归框架**
   从数字 9 开始倒序枚举（避免重复组合），递归函数跟踪两个关键状态：

   - `i`：当前可选择的最大数字（确保组合内数字不重复且无序）；
   - `left_sum`：还需要凑齐的目标和（初始为 n，随选择逐步递减）。

2. **核心剪枝条件**
   计算还需选择的数字数量 `d = k - 当前组合长度`，通过数学公式快速判断是否可能凑出目标和：

   - 若 `left_sum < 0`：当前和已超过目标，终止递归；
   - 若 `left_sum > (i*2 - d + 1)*d/2`：剩余最大可能和（从 j 到 j-d+1 的连续 d 个数之和）仍小于所需和，终止递归。

3. **递归逻辑**

   - 终止条件：当 `d = 0` 时，说明已选够 k 个数字且和符合要求，将当前组合加入结果；

   - 枚举范围：从`i`到`d`（确保至少有 d 个数字可选），每个数字 j 被选后：
     - 加入临时组合 `path`，更新剩余和 `left_sum -= j`；
     - 递归处理下一个更小的数字（`j-1`）；
     - 回溯：移除 j，恢复现场，尝试其他数字。

```
class Solution {
public:
    vector<vector<int>> combinationSum3(int k, int n) {
        vector<vector<int>> ans;
        vector<int> path;

        auto dfs = [&](this auto&& dfs, int i, int left_sum) -> void {
            int d = k - path.size(); // 还要选 d 个数
            if (left_sum < 0 || left_sum > (i * 2 - d + 1) * d / 2) { // 剪枝
                return;
            }
            if (d == 0) { // 找到一个合法组合
                ans.emplace_back(path);
                return;
            }
            // 枚举的数不能太小，否则后面没有数可以选
            for (int j = i; j >= d; j--) {
                path.push_back(j);
                dfs(j - 1, left_sum - j);
                path.pop_back(); // 恢复现场
            }
        };

        dfs(9, n); // 从 i=9 开始倒着枚举
        return ans;
    }
};
```