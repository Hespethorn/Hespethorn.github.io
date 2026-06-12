---
title: Leetcode 0026.Remove Duplicates from Sorted Array(python)
tags:
  - leetcode
  - python
  - 双指针
  - 数组
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'remove-duplicates-from-sorted-array'
date: 2024-05-06
---

# [26. Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

## 你选用何种方法解题？

本题的核心是**原地删除有序数组中的重复元素**。

| 方法 | 时间复杂度 | 空间复杂度 | 是否推荐 |
|:---|:---:|:---:|:---:|
| 快慢指针 | O(n) | O(1) | **推荐** |

**方法选择理由**：
- **快慢指针**：只需一次遍历，空间复杂度 O(1)

---

## 解题过程

### 问题分析

输入：有序数组 `nums`
输出：删除重复元素后的数组长度

关键约束：
- 原地修改数组，不能使用额外空间
- 相同元素只保留一个

### 核心洞察

1. **双指针技巧**：使用两个指针，一个指向不重复元素的最后一个位置，另一个遍历数组
2. **原地修改**：直接在原数组上进行修改

### 算法流程

以 `nums = [1,1,2,2,3,4,4,5]` 为例：

```
初始化: num = 0（指向第一个元素）
遍历过程:
  i=1: nums[0]=1, nums[1]=1, 1 < 1 不成立，跳过
  i=2: nums[0]=1, nums[2]=2, 1 < 2 成立
       num = 1, nums[1] = 2
       nums = [1,2,2,2,3,4,4,5]

  i=3: nums[1]=2, nums[3]=2, 2 < 2 不成立，跳过
  i=4: nums[1]=2, nums[4]=3, 2 < 3 成立
       num = 2, nums[2] = 3
       nums = [1,2,3,2,3,4,4,5]

  i=5: nums[2]=3, nums[5]=4, 3 < 4 成立
       num = 3, nums[3] = 4
       nums = [1,2,3,4,3,4,4,5]

  i=6: nums[3]=4, nums[6]=4, 4 < 4 不成立，跳过
  i=7: nums[3]=4, nums[7]=5, 4 < 5 成立
       num = 4, nums[4] = 5
       nums = [1,2,3,4,5,4,4,5]

返回 num + 1 = 5
```

---

## 这些方法具体怎么运用？

### 方法：快慢指针（推荐）

**核心逻辑**：
1. **初始化指针**：`num = 0`（指向第一个元素）
2. **遍历数组**：从索引 1 开始遍历
3. **判断条件**：如果 `nums[num] < nums[i]`，说明发现了新的不重复元素
4. **原地修改**：`num += 1`, `nums[num] = nums[i]`
5. **返回结果**：返回 `num + 1`（数组长度）

**边界情况处理**：

| 边界情况 | 处理方式 |
|:---|:---|
| 空数组 | 直接返回 0 |
| 只有一个元素 | 直接返回 1 |
| 所有元素都相同 | 直接返回 1 |

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
    def removeDuplicates(self, nums: List[int]) -> int:
        """
        快慢指针法：
        1. num 指向当前不重复元素的最后一个位置
        2. 遍历数组，当发现比 nums[num] 大的元素时，复制到 nums[num+1]
        3. 返回 num + 1
        """
        num = 0
        for i in range(1, len(nums)):
            if nums[num] < nums[i]:
                num += 1
                nums[num] = nums[i]
        return num + 1
```

### 方法二：双指针（更直观写法）

```python
from typing import List

class Solution:
    def removeDuplicates(self, nums: List[int]) -> int:
        """
        双指针法：更直观的写法
        slow 指向待填位置，fast 遍历数组
        """
        if not nums:
            return 0
        
        slow = 0
        for fast in range(1, len(nums)):
            if nums[fast] != nums[slow]:
                slow += 1
                nums[slow] = nums[fast]
        
        return slow + 1
```