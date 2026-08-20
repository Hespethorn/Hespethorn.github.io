---
title: Leetcode 0027. Remove Element
tags:
  - leetcode
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 559d22c1
date: 2023-03-29
---

# [27. Remove Element](https://leetcode.com/problems/remove-element/)

给你一个数组 `nums` 和一个值 `val`，你需要 **[原地](https://baike.baidu.com/item/原地算法)** 移除所有数值等于 `val` 的元素。元素的顺序可能发生改变。然后返回 `nums` 中与 `val` 不同的元素的数量。

假设 `nums` 中不等于 `val` 的元素数量为 `k`，要通过此题，您需要执行以下操作：

- 更改 `nums` 数组，使 `nums` 的前 `k` 个元素包含不等于 `val` 的元素。`nums` 的其余元素和 `nums` 的大小并不重要。
- 返回 `k`。

**用户评测：**

评测机将使用以下代码测试您的解决方案：

```
int[] nums = [...]; // 输入数组
int val = ...; // 要移除的值
int[] expectedNums = [...]; // 长度正确的预期答案。
                            // 它以不等于 val 的值排序。

int k = removeElement(nums, val); // 调用你的实现

assert k == expectedNums.length;
sort(nums, 0, k); // 排序 nums 的前 k 个元素
for (int i = 0; i < actualLength; i++) {
    assert nums[i] == expectedNums[i];
}
```

如果所有的断言都通过，你的解决方案将会 **通过**。

## 1.vector解题思路

这里数组的删除并不是真的删除，只是将删除的元素移动到数组后面的空间内，然后返回数组实际剩余的元素个数，最终判断题目的时候会读取数组剩余个数的元素进行输出。

```
class Solution {
public:
    /**
     * 移除向量中所有值为val的元素，并返回新的长度
     * 注意：题目要求在原向量上修改，不需要考虑超出新长度的元素
     * @param nums 存储整数的向量
     * @param val 需要移除的目标值
     * @return 移除元素后向量的新长度
     */
    int removeElement(std::vector<int>& nums, int val) {
        // std::remove将所有不等于val的元素移到向量前端，返回指向新结尾的迭代器
        // 注意：此函数不会实际删除元素，只是将元素前移并返回新的逻辑结尾
        auto it = std::remove(nums.begin(), nums.end(), val);
        
        // erase函数实际删除从it到结尾的元素，完成物理删除
        nums.erase(it, nums.end());
        
        // 返回新的向量长度
        return nums.size();
    }
};
```

### 核心函数解析

1. **std::remove**
   - 功能：将所有不等于`val`的元素 "移动" 到向量的前端
   - 原理：通过覆盖的方式，将后续元素前移填补等于`val`的元素位置
   - 返回值：指向新的逻辑结尾的迭代器（即最后一个保留元素的下一个位置）
   - 注意：不会改变向量的实际大小，也不会真正删除元素，只是重新排列了元素
2. **vector::erase**
   - 功能：删除向量中从`it`到`end()`的所有元素
   - 作用：配合`std::remove`，将逻辑上需要移除的元素进行物理删除
   - 结果：向量的大小会减小，等于移除的元素数量

### 算法流程

以`nums = [3,2,2,3], val = 3`为例：

1. `std::remove`操作后：
   - 向量变为`[2,2,3,3]`（元素被重新排列）
   - 返回的迭代器`it`指向索引 2 的位置（即第一个 3 的位置）
2. `erase(it, nums.end())`操作后：
   - 删除从索引 2 到结尾的元素
   - 向量变为`[2,2]`，大小为 2
3. 返回新的大小 2

## 2.双指针解法解析

这种方法通过两个指针在同一数组上进行操作，实现了原地移除元素的功能，不需要额外的存储空间。

### 核心思路

1. **定义两个指针**：

   `slow`（慢指针）：表示已经处理好的数组的尾部，即下一个需要填充的位置

   `fast`（快指针）：用于遍历整个数组，寻找需要保留的元素

2. **算法流程**：

快指针依次遍历数组中的每个元素

当快指针遇到的值不等于目标值`val`时：
   - 将该值复制到慢指针指向的位置

   - 慢指针向前移动一步

当快指针遇到的值等于目标值`val`时：

   - 不做任何操作，直接移动快指针
   - 遍历结束后，慢指针的位置就是新数组的长度

```
class Solution {
public:
    int removeElement(std::vector<int>& nums, int val) {
        // 慢指针：指向当前需要填充的位置
        int slow = 0;
        
        // 快指针：遍历整个数组
        for (int fast = 0; fast < nums.size(); ++fast) {
            // 当快指针指向的元素不等于目标值时
            if (nums[fast] != val) {
                // 将快指针指向的元素复制到慢指针位置
                nums[slow] = nums[fast];
                // 慢指针向前移动一步
                slow++;
            }
            // 当快指针指向的元素等于目标值时，不做操作，直接移动快指针
        }
        
        // 慢指针的位置就是新数组的长度
        return slow;
    }
};
```

## 3.使用迭代器

```
#include <vector>

class Solution {
public:
    int removeElement(std::vector<int>& nums, int val) {
        for (auto it = nums.begin(); it != nums.end(); ) {
            if (*it == val) {
                it = nums.erase(it);
            } else {
                ++it;
            }
        }
        return nums.size();
    }
};
```

