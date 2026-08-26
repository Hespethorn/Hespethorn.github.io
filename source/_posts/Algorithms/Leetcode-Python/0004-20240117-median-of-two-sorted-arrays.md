---

title: Leetcode 0004. Median of Two Sorted Arrays (python)
tags:
  - leetcode
  - python
  - 二分查找
  - 双指针
categories: [Algorithms, Leetcode-Python]
series: [Leetcode-Python]
abbrlink: '4b6e9c02'
date: 2024-01-17

---

# [4. Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/)

## 题目

Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays.

The overall run time complexity should be **O(log (m+n))**.

**Example 1:**

```
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.
```

**Example 2:**

```
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
```

## 题目大意

给定两个已排序的数组 `nums1` 和 `nums2`，找出这两个有序数组的中位数。要求时间复杂度为 **O(log(m+n))**。

**中位数定义**：
- 若总元素数为奇数，中位数是第 `(m+n+1)//2` 个元素
- 若总元素数为偶数，中位数是第 `(m+n)//2` 和 `(m+n)//2 + 1` 个元素的平均值

---

## 你选用何种方法解题？

| 方法 | 核心思路 | 时间复杂度 | 说明 |
|:---|:---|:---:|:---|
| 方法一：二分查找切分点 | 在较短数组上二分，确定两个数组的切分位置 | **O(log min(m,n))** | **推荐**，满足 O(log(m+n)) 要求 |
| 方法二：双指针归并 | 模拟归并排序的 merge 过程，走到第 k 个元素 | **O(m+n)** | 直观易懂，不满足对数要求 |
| 方法三：合并排序 | 直接合并两个数组后排序取中位数 | **O((m+n)log(m+n))** | 仅用于快速验证 |

**方法一是唯一满足题目 O(log(m+n)) 要求的解法**。其核心思想是：不实际合并数组，而是通过二分查找确定一个切分点，将两个数组各自分为左右两部分，使得左半部分的元素全部 ≤ 右半部分的元素，中位数就藏在切分线的两侧。

---

## 解题过程

### 问题分析

中位数将合并后的有序数组分成左右两半，且左半部分的每个元素都 ≤ 右半部分的每个元素。如果能在两个数组中各找到一个切分点 `i` 和 `j`，使得：

```
nums1[0..i-1] + nums2[0..j-1]  ← 左半部分
nums1[i..m-1] + nums2[j..n-1]  ← 右半部分
```

满足 `左半最大值 ≤ 右半最小值`，那么中位数就可以通过切分线两侧的元素直接计算出来。

### 核心洞察

**不需要真的合并数组**。只需要找到正确的切分位置。

关键约束：
1. `i + j = (m + n + 1) // 2` —— 左半部分的元素总数（整数除法使左半多一个）
2. `nums1[i-1] ≤ nums2[j]` 且 `nums2[j-1] ≤ nums1[i]` —— 交叉大小关系

一旦确定了 `i`，`j` 就由约束 1 导出：`j = (m + n + 1) // 2 - i`。因此问题转化为：**在较短数组上二分查找 `i`**。

### 算法流程

以 `nums1 = [1, 3]`, `nums2 = [2]` 为例：

```
m=2, n=1, total=3 (奇数), left_total = (3+1)//2 = 2

在 nums1 上二分 i ∈ [0, 2]:

尝试 i=1 → j = 2-1 = 1:
  nums1: [1 | 3]       leftA=1, rightA=3
  nums2: [2 | ]        leftB=2, rightB=∞
  检查: leftA(1) ≤ rightB(∞) ✓ 且 leftB(2) ≤ rightA(3) ✓
  切分正确！总数为奇数，中位数 = max(1, 2) = 2
```

以 `nums1 = [1, 2]`, `nums2 = [3, 4]` 为例：

```
m=2, n=2, total=4 (偶数), left_total = (4+1)//2 = 2

尝试 i=1 → j = 2-1 = 1:
  nums1: [1 | 2]       leftA=1, rightA=2
  nums2: [3 | 4]       leftB=3, rightB=4
  检查: leftA(1) ≤ rightB(4) ✓ 但 leftB(3) ≤ rightA(2) ✗
  → nums2 左半太大，需要增大 i（让 nums1 的切分线右移）

尝试 i=2 → j = 2-2 = 0:
  nums1: [1, 2 | ]     leftA=2, rightA=∞
  nums2: [ | 3, 4]     leftB=-∞,rightB=3
  检查: leftA(2) ≤ rightB(3) ✓ 且 leftB(-∞) ≤ rightA(∞) ✓
  切分正确！总数为偶数，中位数 = (max(2, -∞) + min(∞, 3)) / 2 = (2+3)/2 = 2.5
```

---

## 这些方法具体怎么运用？

### 方法一：二分查找切分点

**步骤**：

1. **确保 nums1 是较短数组**：二分操作在较短数组上进行，复杂度 O(log min(m,n))

2. **二分范围**：`left = 0, right = m`（nums1 的切分点可能在 0 到 m 之间，包括两端）

3. **每次迭代**：
   - `i = (left + right) // 2`
   - `j = (m + n + 1) // 2 - i`
   - 获取切分线两侧的四个值：`leftA, rightA, leftB, rightB`
   - 边界处理：切分点在最左端时 `left = -∞`，在最右端时 `right = +∞`

4. **判断条件**：
   - `leftA ≤ rightB` 且 `leftB ≤ rightA` → 找到正确切分，计算中位数
   - `leftA > rightB` → nums1 左半太大，`right = i - 1`
   - `leftB > rightA` → nums2 左半太大（即 nums1 左半太小），`left = i + 1`

5. **计算中位数**：
   - 总数为奇数：`max(leftA, leftB)`
   - 总数为偶数：`(max(leftA, leftB) + min(rightA, rightB)) / 2.0`

**为什么用 `float('inf')` 和 `float('-inf')` 处理边界？**
当切分点落在数组的最左端或最右端时，某一侧没有元素。用 ±∞ 表示"不存在的端点"可以让大小比较和 max/min 运算自然而正确地处理这些情况，避免繁冗的 `if` 分支。

### 方法二：双指针归并

**步骤**：

1. 维护两个指针 `i, j` 分别指向 `nums1` 和 `nums2` 的当前位置
2. 用循环模拟归并过程，每次取较小的元素前进，同时记录前一个值 `prev` 和当前值 `curr`
3. 走到第 `k = total // 2` 个元素后停止
4. 总数为奇数时返回 `curr`，偶数时返回 `(prev + curr) / 2.0`

**缺点**：需要遍历一半的元素，O(m+n) 时间，不满足题目要求的 O(log(m+n))。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 |
|:---|:---:|:---:|
| 二分查找切分点 | **O(log min(m, n))** | **O(1)** |
| 双指针归并 | **O(m + n)** | **O(1)** |
| 合并排序 | **O((m+n)log(m+n))** | **O(m + n)** |

---

## 总结与最佳选择

**最快算法**：**二分查找切分点**（O(log min(m,n))）。在大数据量下优势巨大——m = n = 10⁶ 时，二分法约 20 次迭代即可，双指针需要 10⁶ 次，差距是 5 万倍。

**工程最优选择**：**二分查找切分点**。理由：
1. **满足题目要求**：O(log(m+n)) 是这道 Hard 题的核心考察点
2. **大数据量优势碾压**：海量日志、数据库分片合并等场景下，O(m+n) 的归并法不可接受
3. **代码不复杂**：虽然思路需要理解，但实现只有 ~20 行，没有理由不用最优解

双指针法适合以下场景：数据量已知很小（< 10³）且需要快速写出正确代码（如原型验证）。合并排序法仅用于一行代码的快速测试。

---

## Code

### 方法一：二分查找切分点（推荐，O(log min(m,n))）

```python
from typing import List

class Solution:
    def findMedianSortedArrays(
        self, nums1: List[int], nums2: List[int]
    ) -> float:
        """
        二分查找法：在较短数组上二分切分点，通过交叉比较
        确定中位数位置。时间复杂度 O(log min(m,n))。
        """
        # 确保 nums1 是较短的数组，缩小二分搜索范围
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1

        m, n = len(nums1), len(nums2)
        total_left = (m + n + 1) // 2  # 左半部分的目标元素数
        left, right = 0, m

        while left <= right:
            i = (left + right) // 2     # nums1 的切分点
            j = total_left - i          # nums2 的切分点（由总数约束导出）

            # 切分线两侧的四个值，边界用 ±inf 处理
            left_a  = nums1[i - 1] if i > 0 else float('-inf')
            right_a = nums1[i]     if i < m else float('inf')
            left_b  = nums2[j - 1] if j > 0 else float('-inf')
            right_b = nums2[j]     if j < n else float('inf')

            if left_a <= right_b and left_b <= right_a:
                # 切分正确：左半全部 ≤ 右半全部
                if (m + n) % 2 == 1:
                    return float(max(left_a, left_b))
                else:
                    return (max(left_a, left_b) + min(right_a, right_b)) / 2.0
            elif left_a > right_b:
                # nums1 左半太大，切分线左移
                right = i - 1
            else:
                # left_b > right_a，nums2 左半太大（nums1 左半太小），切分线右移
                left = i + 1

        return 0.0  # 题目保证不会执行到这里
```

### 方法二：双指针归并（O(m+n)，直观易懂）

```python
from typing import List

class Solution:
    def findMedianSortedArrays(
        self, nums1: List[int], nums2: List[int]
    ) -> float:
        """
        双指针法：模拟归并排序的 merge 过程，走到中位数位置。
        时间复杂度 O(m+n)，空间复杂度 O(1)。
        """
        m, n = len(nums1), len(nums2)
        total = m + n
        k = total // 2          # 需要走到第 k 个元素（0-indexed）
        i = j = 0
        prev = curr = 0

        # 归并前进到第 k 个元素
        for _ in range(k + 1):
            prev = curr
            if i >= m:                    # nums1 已耗尽
                curr = nums2[j]
                j += 1
            elif j >= n:                  # nums2 已耗尽
                curr = nums1[i]
                i += 1
            elif nums1[i] < nums2[j]:     # 取较小的
                curr = nums1[i]
                i += 1
            else:
                curr = nums2[j]
                j += 1

        if total % 2 == 1:
            return float(curr)
        else:
            return (prev + curr) / 2.0
```

### 方法三：合并排序（仅供快速验证）

```python
from typing import List

class Solution:
    def findMedianSortedArrays(
        self, nums1: List[int], nums2: List[int]
    ) -> float:
        """合并排序法：最简单但不满足题目复杂度要求。"""
        merged = sorted(nums1 + nums2)
        n = len(merged)
        if n % 2 == 1:
            return float(merged[n // 2])
        else:
            return (merged[n // 2 - 1] + merged[n // 2]) / 2.0
```
