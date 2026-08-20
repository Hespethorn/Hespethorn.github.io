---
title: Leetcode 0026. Remove Duplicates from Sorted Array
tags:
  - leetcode
  - 双指针
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: 43f159fc
date: 2023-03-24
---

# [26. Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

给你一个 **非严格递增排列** 的数组 `nums` ，请你**[ 原地](http://baike.baidu.com/item/原地算法)** 删除重复出现的元素，使每个元素 **只出现一次** ，返回删除后数组的新长度。元素的 **相对顺序** 应该保持 **一致** 。然后返回 `nums` 中唯一元素的个数。

考虑 `nums` 的唯一元素的数量为 `k` ，你需要做以下事情确保你的题解可以被通过：

- 更改数组 `nums` ，使 `nums` 的前 `k` 个元素包含唯一元素，并按照它们最初在 `nums` 中出现的顺序排列。`nums` 的其余元素与 `nums` 的大小不重要。
- 返回 `k` 。

**判题标准:**

系统会用下面的代码来测试你的题解:

```
int[] nums = [...]; // 输入数组
int[] expectedNums = [...]; // 长度正确的期望答案

int k = removeDuplicates(nums); // 调用

assert k == expectedNums.length;
for (int i = 0; i < k; i++) {
    assert nums[i] == expectedNums[i];
}
```

如果所有断言都通过，那么您的题解将被 **通过**。

### 解法1：使用unique()和erase()函数

```
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        auto last = std::unique(nums.begin(), nums.end());
        nums.erase(last, nums.end());
        return nums.size();
    }
};
```
### 解法2：双指针

```
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        // 处理空数组情况
        if (nums.empty()) {
            return 0;
        }
        
        // 初始化慢指针
        int i = 0;
        
        // 快指针遍历数组
        for (int j = 1; j < nums.size(); ++j) {
            // 找到不重复的元素
            if (nums[j] != nums[i]) {
                ++i;
                // 将新元素移到前面
                nums[i] = nums[j];
            }
        }
        
        // 返回唯一元素的个数
        return i + 1;
    }
};
```

