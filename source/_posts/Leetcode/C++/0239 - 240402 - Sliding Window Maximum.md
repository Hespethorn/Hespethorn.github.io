---
title: Leetcode 0239. Sliding Window Maximum
tags:
  - leetcode
categories:
  - Leetcode
  - Stack
series: Leetcode-Cpp
abbrlink: 8e61f05c
date: 2023-11-19
---

## [239. Sliding Window Maximum](https://leetcode.cn/problems/sliding-window-maximum/)

You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.

Return *the max sliding window*.

 **Example 1:**

```
Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]
Explanation: 
Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

**Example 2:**

```
Input: nums = [1], k = 1
Output: [1]
```

 题目大意

给定一个整数数组 `nums` 和一个大小为 `k` 的滑动窗口，该窗口从数组的最左侧移动到最右侧。每次窗口向右移动一个位置，返回窗口中的最大值。

例如，对于数组 `[1,3,-1,-3,5,3,6,7]` 和 `k=3`，滑动窗口的最大值序列为 `[3,3,5,5,6,7]`。

## 解题思路

解决滑动窗口最大值的高效方法是使用**单调队列（Monotonic Queue）**，核心思路是维护一个队列，使其始终保持**递减顺序**，队首元素即为当前窗口的最大值。具体步骤如下：

1. **初始化单调队列**：队列存储数组元素的索引（而非值），确保队列中的元素对应的值是递减的。
2. **处理前 `k` 个元素**：
   - 对于每个元素，移除队列中所有小于当前元素的元素（它们不可能成为窗口最大值）。
   - 将当前元素的索引加入队列。
3. **滑动窗口移动**：
   - 移除队列中超出当前窗口范围的元素（索引 ≤ 当前索引 - `k`）。
   - 对新加入窗口的元素，重复步骤 2 的移除操作。
   - 将当前队列的队首元素（最大值）加入结果集。

```
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        vector<int> result;
        deque<int> dq;  // 单调队列，存储元素索引，保持对应值递减
        
        for (int i = 0; i < nums.size(); ++i) {
            // 移除队列中超出当前窗口范围的元素（左侧过期元素）
            if (!dq.empty() && dq.front() <= i - k) {
                dq.pop_front();
            }
            
            // 移除队列中所有小于当前元素的元素（它们不可能成为最大值）
            while (!dq.empty() && nums[dq.back()] < nums[i]) {
                dq.pop_back();
            }
            
            // 将当前元素索引加入队列
            dq.push_back(i);
            
            // 当窗口大小达到k时，开始记录最大值（队首元素）
            if (i >= k - 1) {
                result.push_back(nums[dq.front()]);
            }
        }
        
        return result;
    }
};
```