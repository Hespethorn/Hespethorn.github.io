---
title: Leetcode 0016.3Sum Closest(python)
tags:
  - leetcode
  - python
  - 双指针
  - 排序
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: '3sum-closest'
date: 2024-03-17
---

# [16. 3Sum Closest](https://leetcode.com/problems/3sum-closest/)

## 题目

Given an integer array `nums` of length `n` and an integer `target`, find three integers in `nums` such that the sum is closest to `target`.

Return the sum of the three integers.

You may assume that each input would have exactly one solution.

**Example 1:**

```
Input: nums = [-1,2,1,-4], target = 1
Output: 2
Explanation: The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).
```

**Example 2:**

```
Input: nums = [0,0,0], target = 1
Output: 0
```

## 题目大意

在整数数组中找出三个数，使其和最接近给定的目标值 `target`。题目保证有且仅有一个解。

---

## 你选用何种方法解题？

本题的核心是**高效查找最接近目标值的三元组**。对于每个元素 `nums[i]`，我们需要在剩余元素中找到两个数，使其和与 `target - nums[i]` 最接近。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 排序 + 双指针 | O(n²) | O(log n) ~ O(n) | **推荐** |
| 暴力枚举 | O(n³) | O(1) | 不推荐 |

**方法选择理由**：
- **排序 + 双指针**：通过排序实现 O(n log n) 的预处理，然后用双指针将内层查找优化到 O(n)，整体 O(n²)。排序还便于进行剪枝优化。
- **暴力枚举**：O(n³) 时间复杂度，无法通过较大规模测试用例。

---

## 解题过程

### 问题分析

输入：整数数组 `nums`，目标值 `target`
输出：最接近 `target` 的三元组之和

关键约束：**最接近**。即找到 `sum` 使得 `|sum - target|` 最小。

### 核心洞察

1. **排序的价值**：排序后可以利用有序性进行双指针查找，同时便于进行剪枝优化。
2. **转化为两数之和**：固定第一个数 `nums[i]`，问题转化为在剩余元素中找两数之和，使其与 `target - nums[i]` 最接近。
3. **剪枝优化**：
   - 跳过重复元素避免重复计算
   - 最小和剪枝：如果当前最小可能和已大于 target，后续只会更大
   - 最大和剪枝：如果当前最大可能和仍小于 target，直接跳过当前 i

### 算法流程

以 `nums = [-1, 2, 1, -4]`, `target = 1` 为例：

**步骤 1**：排序 → `[-4, -1, 1, 2]`

**步骤 2**：遍历每个元素作为第一个数：

| i | nums[i] | min_sum | max_sum | 操作 |
|:---:|:---:|:---:|:---:|---|
| 0 | -4 | -4 + (-1) + 1 = -4 | -4 + 1 + 2 = -1 | max_sum < target，更新 ans=-1，跳过 |
| 1 | -1 | -1 + 1 + 2 = 2 | -1 + 1 + 2 = 2 | min_sum > target，更新 ans=2，退出 |

**步骤 3**：双指针查找（以 i=1 为例）：

| left | right | cur_sum | abs(cur - target) | ans | 操作 |
|:---:|:---:|:---:|:---:|:---:|---|
| 2 | 3 | -1 + 1 + 2 = 2 | 1 | 2 | cur > target，right-- |

---

## 这些方法具体怎么运用？

### 方法：排序 + 双指针（推荐）

**数据结构**：排序后的数组 + 两个指针（left, right）

**核心逻辑**：
1. **排序**：先对数组排序，时间 O(n log n)
2. **初始化答案**：取前三个元素之和作为初始答案
3. **外层循环**：遍历每个元素作为三元组的第一个数 `nums[i]`
   - 跳过重复的 `nums[i]`（与前一个相同则跳过）
   - 最小和剪枝：计算 `nums[i] + nums[i+1] + nums[i+2]`，若大于 target 且更接近则更新 ans 并 break
   - 最大和剪枝：计算 `nums[i] + nums[n-2] + nums[n-1]`，若小于 target 且更接近则更新 ans 并 continue
4. **内层双指针**：在 `[i+1, n-1]` 范围内查找
   - `left = i + 1`，`right = n - 1`
   - 计算当前和 `cur = nums[i] + nums[left] + nums[right]`
   - 更新最接近的答案
   - 若 `cur == target`，直接返回 target（最优解）
   - 若 `cur > target` → right--
   - 若 `cur < target` → left++

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 数组长度 == 3 | 直接返回三个元素之和 |
| 找到精确匹配 `cur == target` | 直接返回 target，无需继续 |
| 重复的第一个元素 | `if i > 0 and nums[i] == nums[i-1]` 跳过 |
| 最小和已大于 target | 更新 ans 后 break（后续只会更大） |
| 最大和仍小于 target | 更新 ans 后 continue（当前 i 不可能找到更优解） |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 排序 + 双指针 | **O(n²)** | **O(log n) ~ O(n)** | 排序 O(n log n) + 双指针 O(n²)；空间取决于排序算法的实现 |
| 暴力枚举 | O(n³) | O(1) | 三重循环，无法通过大数据测试 |

**常数因子分析**：排序 + 双指针的实际运行速度较快，因为：
- 排序后的数组具有更好的缓存局部性
- 剪枝优化可以提前终止无效搜索
- 无需额外的数据结构操作开销

---

## 总结与最佳选择

**最快算法**：**排序 + 双指针**。实际测试中，剪枝优化能显著减少迭代次数。

**工程最优选择**：**排序 + 双指针**。理由如下：
1. **时间效率高**：O(n²) 时间复杂度，配合剪枝优化效果更好
2. **空间效率好**：仅需排序所需的 O(log n) ~ O(n) 空间
3. **代码简洁**：逻辑清晰，剪枝优化易于理解
4. **稳定性强**：不会受哈希冲突影响，性能稳定

**各方法适用场景**：
- **排序 + 双指针**：首选方案，适用于绝大多数情况
- **暴力枚举**：仅用于教学对比

---

## Code

### 方法：排序 + 双指针（推荐）

```python
from typing import List

class Solution:
    def threeSumClosest(self, nums: List[int], target: int) -> int:
        """
        排序 + 双指针法：
        1. 先排序，便于双指针查找和剪枝优化
        2. 固定第一个数，转化为两数之和问题
        3. 用双指针在剩余区间查找最接近目标的组合
        """
        nums.sort()
        n = len(nums)
        ans = nums[0] + nums[1] + nums[2]
        
        for i in range(n - 2):
            # 剪枝：跳过重复元素
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            
            # 最小和大于target，更新ans并break
            min_sum = nums[i] + nums[i + 1] + nums[i + 2]
            if min_sum > target:
                if abs(min_sum - target) < abs(ans - target):
                    ans = min_sum
                break
            
            # 最大和小于target，跳过最左边的元素
            max_sum = nums[i] + nums[n - 2] + nums[n - 1]
            if max_sum < target:
                if abs(max_sum - target) < abs(ans - target):
                    ans = max_sum
                continue
            
            left = i + 1
            right = n - 1
            while left < right:
                cur = nums[i] + nums[left] + nums[right]
                if abs(cur - target) < abs(ans - target):
                    ans = cur
                
                if cur == target:
                    return target
                elif cur > target:
                    right -= 1
                else:
                    left += 1
        
        return ans
```

### 方法二：暴力枚举（不推荐，仅供对比）

```python
from typing import List

class Solution:
    def threeSumClosest(self, nums: List[int], target: int) -> int:
        """
        暴力枚举法：三重循环枚举所有组合
        时间复杂度 O(n³)，不推荐
        """
        n = len(nums)
        min_diff = float('inf')
        result = 0
        
        for i in range(n):
            for j in range(i + 1, n):
                for k in range(j + 1, n):
                    current_sum = nums[i] + nums[j] + nums[k]
                    diff = abs(current_sum - target)
                    if diff < min_diff:
                        min_diff = diff
                        result = current_sum
        
        return result
```