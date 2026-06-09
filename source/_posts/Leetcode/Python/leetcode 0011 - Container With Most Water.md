---
title: Leetcode 0011. Container With Most Water (python)
tags:
  - leetcode
  - python
  - 双指针
  - 贪心算法
  - 数组
categories:
  - Leetcode
series: Leetcode-Cpp-Python
abbrlink: 'container-with-most-water'
date: 2024-02-22 20:49:00
---

# [11. Container With Most Water](https://leetcode.com/problems/container-with-most-water/)

## 题目

You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

**Notice** that you may not slant the container.

**Example 1:**

```
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. 
In this case, the max area of water (blue section) the container can contain is 49.
```

**Example 2:**

```
Input: height = [1,1]
Output: 1
```

**Constraints:**

- `n == height.length`
- `2 <= n <= 10^5`
- `0 <= height[i] <= 10^4`

## 题目大意

给定一个长度为 `n` 的整数数组 `height`，每个元素代表垂直高度。找出两条线，使得它们与 x 轴形成的容器能够容纳最多的水。返回最大容积。

---

## 你选用何种方法解题？

本题有两种主要解法：

| 方法 | 核心思路 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---|:---:|:---:|:---|
| 方法一：暴力枚举 | 遍历所有可能的两条线组合，计算面积 | O(n²) | O(1) | **超时**：对于 n=10^5 数据量无法通过 |
| 方法二：双指针法 | 从两端向中间收缩，每次移动较短的指针 | O(n) | O(1) | **最优解**：线性时间，常数空间 |

**方法二是推荐解**：双指针法利用贪心策略，每次移动较短的边界，因为移动较长边界无法增加面积。

---

## 解题过程

### 问题分析

容器的容积计算公式为：
```
面积 = 宽度 × 高度
    = (right - left) × min(height[left], height[right])
```

### 核心洞察

假设 `height[left] < height[right]`：
- 当前容器的高度由 `height[left]` 决定
- 如果移动 `right` 指针向左，宽度减小，高度不可能超过 `height[left]`
- 因此，以 `left` 为左边界的最大面积已经找到
- 应该移动 `left` 指针向右，寻找更高的边界

### 手推演示例

以 `height = [1,8,6,2,5,4,8,3,7]` 为例：

```
初始: left=0(1), right=8(7), area=8×1=8
移动 left: left=1(8), right=8(7), area=7×7=49 ✓
移动 right: left=1(8), right=7(3), area=6×3=18
移动 right: left=1(8), right=6(8), area=5×8=40
移动 right: left=1(8), right=5(4), area=4×4=16
移动 right: left=1(8), right=4(5), area=3×5=15
移动 right: left=1(8), right=3(2), area=2×2=4
移动 right: left=1(8), right=2(6), area=1×6=6

最大面积 = 49
```

### 提前终止优化

该解法中包含一个巧妙的优化技巧：

```python
maxH = max(height)
while left < right:
    distance = (right - left)
    if ans > distance * maxH:
        break  # 提前终止，不可能找到更大的面积
```

**优化原理**：提前计算数组中的最大高度 `maxH`。在每次迭代中，如果当前最大面积 `ans` 已经大于 `distance * maxH`，说明即使剩下的宽度全部用上最大高度，也无法超过当前答案，可以提前退出循环。这在某些情况下能显著减少迭代次数。

---

## 这些方法具体怎么运用？

### 方法一：暴力枚举（超时）

```python
def maxArea(height: List[int]) -> int:
    n = len(height)
    max_area = 0
    for i in range(n):
        for j in range(i + 1, n):
            width = j - i
            h = min(height[i], height[j])
            max_area = max(max_area, width * h)
    return max_area
```

**为什么超时**：对于 n=10^5，需要计算约 5×10^9 次，远远超出时间限制。

### 方法二：双指针法（推荐）

**数据结构**：两个指针 `left`（左边界）和 `right`（右边界）。

**核心逻辑**：
1. 初始化 `left=0`，`right=n-1`
2. 计算当前面积，更新最大值
3. 移动较短的指针（贪心策略）
4. 重复直到 `left >= right`

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 暴力枚举 | O(n²) | O(1) | 超时 |
| 双指针法 | O(n) | O(1) | 最优解 |

---

## 总结与最佳选择

**最快算法**：双指针法，只需遍历数组一次。

**工程最优选择**：**双指针法（带提前终止优化）**，理由：
1. **时间最优**：O(n) 时间复杂度
2. **空间最优**：O(1) 空间复杂度
3. **提前终止**：通过计算最大可能面积，避免不必要的循环

**核心思想**：贪心策略——每次移动较短的边界，因为移动较长边界无法增加容器高度。

---

## Code

### 方法一：暴力枚举（超时）

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        """暴力枚举：遍历所有可能的两条线组合。
        时间复杂度 O(n²)，空间复杂度 O(1)。
        """
        n = len(height)
        max_area = 0
        for i in range(n):
            for j in range(i + 1, n):
                width = j - i
                current_height = min(height[i], height[j])
                max_area = max(max_area, width * current_height)
        return max_area
```

### 方法二：双指针法（推荐）

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        """双指针法：从两端向中间收缩，每次移动较短的指针。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        left = 0
        right = len(height) - 1
        max_area = 0
        
        while left < right:
            width = right - left
            current_height = min(height[left], height[right])
            max_area = max(max_area, width * current_height)
            
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        
        return max_area
```

### 方法三：双指针法（带提前终止优化）

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        """双指针法优化版：提前计算最大高度，当不可能找到更大面积时提前退出。
        时间复杂度 O(n)，空间复杂度 O(1)。
        """
        n = len(height)
        left = 0
        right = n - 1
        ans = 0
        maxH = max(height)
        
        while left < right:
            distance = right - left
            # 提前终止优化：当前最大面积已超过剩余最大可能面积
            if ans > distance * maxH:
                break
            
            area = distance * min(height[left], height[right])
            ans = max(ans, area)
            
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        
        return ans
```