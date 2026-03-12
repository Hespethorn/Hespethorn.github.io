---
title: Leetcode 0078. Subsets
tags:
  - leetcode
categories:
  - Leetcode
  - 回溯算法
series: Leetcode
abbrlink: ff682ccd
date: 2025-02-10 23:02:59
---

## [78. Subsets](https://leetcode.cn/problems/subsets/)

Given an integer array `nums` of **unique** elements, return *all possible* *subsets* *(the power set)*.

The solution set **must not** contain duplicate subsets. Return the solution in **any order**.

 **Example 1:**

```
Input: nums = [1,2,3]
Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
```

**Example 2:**

```
Input: nums = [0]
Output: [[],[0]]
```

## 题目大意

给定一个**无重复元素**的整数数组 `nums`，返回该数组所有可能的子集（即幂集）。幂集需包含所有可能的子集（包括空集和数组本身），且不能有重复子集，结果顺序可任意。

例如：

- 输入 `nums = [1,2,3]`，输出 `[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`（共 2³=8 个子集）；
- 输入 `nums = [0]`，输出 `[[],[0]]`（共 2¹=2 个子集）。

### 解题思路

#### 1. 子集与二进制的映射关系

数组的每个元素对应二进制数的一位，通过**二进制位的 “0/1” 状态**表示元素 “不选 / 选”：

- 若数组长度为 `n`，则共有 `2ⁿ` 个子集（对应从 `0` 到 `2ⁿ - 1` 的所有整数，共 `2ⁿ` 个）；
- 对每个整数 `i`（代表一个子集），其二进制的第 `j` 位（从 0 开始计数）若为 `1`，表示选择数组第 `j` 个元素（`nums[j]`）；若为 `0`，表示不选。

例如数组 `nums = [1,2,3]`（`n=3`），`2ⁿ=8` 个子集对应整数 `0~7`：

- `i=0`（二进制 `000`）：所有位为 0 → 子集 `[]`；
- `i=1`（二进制 `001`）：第 0 位为 1 → 子集 `[1]`；
- `i=2`（二进制 `010`）：第 1 位为 1 → 子集 `[2]`；
- `i=3`（二进制 `011`）：第 0、1 位为 1 → 子集 `[1,2]`；
- 以此类推，直到 `i=7`（二进制 `111`）→ 子集 `[1,2,3]`。

#### 2. 核心步骤

1. **初始化结果数组**：结果 `ans` 的大小为 `2ⁿ`（`1 << n`，即 `2` 的 `n` 次方），每个元素对应一个子集；

2. **枚举所有子集**：遍历从 `0` 到 `2ⁿ - 1` 的所有整数 `i`（每个 `i` 对应一个子集）；

3. **构建子集**：对每个`i` ，检查其二进制的每一位`j`（`0 ≤ j < n`）：
- 若 `i >> j & 1` 为 `1`（表示第 `j` 位为 1），则将 `nums[j]` 加入 `ans[i]` 对应的子集；
  
4. **返回结果**：所有 `i` 遍历完成后，`ans` 即包含所有子集。

#### 3. 关键位运算解释

- `1 << n`：计算 `2ⁿ`，用于确定结果数组的大小（子集总数）；
- `i >> j`：将整数 `i` 的二进制右移 `j` 位，使第 `j` 位移动到最低位；
- `& 1`：与 1 进行按位与运算，提取最低位的值（0 或 1），判断第 `j` 位是否为 1。

### 代码实现

```
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> ans(1 << n);
        for (int i = 0; i < (1 << n); i++) { // 枚举全集 U 的所有子集 i
            for (int j = 0; j < n; j++) {
                if (i >> j & 1) { // j 在集合 i 中
                    ans[i].push_back(nums[j]);
                }
            }
        }
        return ans;
    }
};
```

作者：灵茶山艾府
链接：https://leetcode.cn/problems/subsets/solutions/2059409/hui-su-bu-hui-xie-tao-lu-zai-ci-pythonja-8tkl/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。