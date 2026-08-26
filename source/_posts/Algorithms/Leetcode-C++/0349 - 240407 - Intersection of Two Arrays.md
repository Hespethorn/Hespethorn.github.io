---

title: Leetcode 0349. Intersection of Two Arrays
tags:
  - Hash
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: 21b9229c
date: 2023-12-06

---

## [349. Intersection of Two Arrays](https://leetcode.cn/problems/intersection-of-two-arrays/)

Given two integer arrays `nums1` and `nums2`, return *an array of their intersection*. Each element in the result must be **unique** and you may return the result in **any order**.

 **Example 1:**

```
Input: nums1 = [1,2,2,1], nums2 = [2,2]
Output: [2]
```

**Example 2:**

```
Input: nums1 = [4,9,5], nums2 = [9,4,9,8,4]
Output: [9,4]
Explanation: [4,9] is also accepted.
```

## 题目大意

给定两个整数数组 nums1 和 nums2，返回它们的交集。结果中的每个元素必须是唯一的，并且可以按任意顺序返回。

## 解题思路

可以使用哈希集合来高效求解：

1. 先将第一个数组中的元素存入一个哈希集合，自动去除重复元素
2. 遍历第二个数组，检查每个元素是否存在于第一个数组的哈希集合中
3. 若存在，将其加入结果集合（自动去重）
4. 最后将结果集合转换为数组返回

```
class Solution {
public:
    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {
        // 存储第一个数组的元素（去重）
        unordered_set<int> set1(nums1.begin(), nums1.end());
        // 存储交集结果（自动去重）
        unordered_set<int> resultSet;
        
        // 遍历第二个数组，查找在第一个数组中存在的元素
        for (int num : nums2) {
            if (set1.count(num)) {
                resultSet.insert(num);
            }
        }
        
        // 将结果集合转换为向量
        return vector<int>(resultSet.begin(), resultSet.end());
    }
};
```