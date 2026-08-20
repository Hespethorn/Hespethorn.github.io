---
title: Leetcode 0027.Remove Element(python)
tags:
  - leetcode
  - python
  - 双指针
  - 数组
categories: [Leetcode, Python]
series: Leetcode-Python
abbrlink: 'remove-element'
date: 2024-05-11
---

# [27. Remove Element](https://leetcode.com/problems/remove-element/)

## 你选用何种方法解题？

本题的核心是**原地移除数组中等于给定值的元素**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 快慢指针 | O(n) | O(1) | **推荐** |

**方法选择理由**：
- **快慢指针**：只需一次遍历，空间复杂度 O(1)

---

## 解题过程

### 问题分析

输入：数组 `nums`，目标值 `val`
输出：移除目标值后的数组长度

关键约束：
- 原地修改数组，不能使用额外空间
- 不需要保持元素顺序

### 核心洞察

1. **双指针技巧**：使用两个指针，一个指向待填位置，另一个遍历数组
2. **原地修改**：直接在原数组上进行修改

### 算法流程

以 `nums = [3,2,2,3]`, `val = 3` 为例：

```
初始化: num = 0（指向待填位置）
遍历过程:
  i=0: nums[0]=3 == val=3，跳过
  i=1: nums[1]=2 != val=3
       nums[0] = 2, num = 1
       nums = [2,2,2,3]

  i=2: nums[2]=2 != val=3
       nums[1] = 2, num = 2
       nums = [2,2,2,3]

  i=3: nums[3]=3 == val=3，跳过

返回 num = 2
```

---

## 这些方法具体怎么运用？

### 方法：快慢指针（推荐）

**核心逻辑**：
1. **初始化指针**：`num = 0`（指向待填位置）
2. **遍历数组**：从索引 0 开始遍历
3. **判断条件**：如果 `nums[i] != val`，将元素复制到 `nums[num]`
4. **更新指针**：`num += 1`
5. **返回结果**：返回 `num`（数组长度）

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 空数组 | 直接返回 0 |
| 所有元素都等于 val | 直接返回 0 |
| 没有元素等于 val | 返回原数组长度 |

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|---|
| 快慢指针 | **O(n)** | **O(1)** | n 是数组长度 |

---

## 总结与最佳选择

**最快算法**：**快慢指针**。唯一的方法，时间效率高，空间效率好。

---

## Code

### 方法：快慢指针（推荐）

```python
from typing import List

class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        """
        快慢指针法：
        1. num 指向待填位置
        2. 遍历数组，遇到不等于 val 的元素就复制到 nums[num]
        3. 返回 num
        """
        num = 0
        for i in range(len(nums)):
            if nums[i] == val:
                continue
            nums[num] = nums[i]
            num += 1
        return num
```

### 方法二：双指针（更简洁写法）

```python
from typing import List

class Solution:
    def removeElement(self, nums: List[int], val: int) -> int:
        """
        双指针法：更简洁的写法
        slow 指向待填位置，fast 遍历数组
        """
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != val:
                nums[slow] = nums[fast]
                slow += 1
        return slow
```