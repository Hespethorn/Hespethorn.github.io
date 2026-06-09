---
title: Leetcode 1089. Duplicate Zeros
tags:
  - leetcode
  - 双指针
categories:
  - Leetcode
  - 双指针
series: Leetcode-Cpp
abbrlink: 5ddd6610
date: 2024-04-01 20:49:00
---

# [1089. Duplicate Zeros](https://leetcode.com/problems/duplicate-zeros/)


## 题目

Given a fixed length array `arr` of integers, duplicate each occurrence of zero, shifting the remaining elements to the right.

Note that elements beyond the length of the original array are not written.

Do the above modifications to the input array **in place**, do not return anything from your function.

**Example 1**:

```
Input: [1,0,2,3,0,4,5,0]
Output: null
Explanation: After calling your function, the input array is modified to: [1,0,0,2,3,0,0,4]
```

**Example 2**:

```
Input: [1,2,3]
Output: null
Explanation: After calling your function, the input array is modified to: [1,2,3]
```

**Note**:

1. `1 <= arr.length <= 10000`
2. `0 <= arr[i] <= 9`

解法1：库函数

使用resize()和insert()实现按照位置插入和数组长度不变。

```
class Solution {
public:
    void duplicateZeros(vector<int>& arr) {
        int n = arr.size();
        for (int i = 0; i < n; ++i) {
            if (arr[i] == 0) {
                arr.insert(arr.begin() + i, 0);
                ++i;
            }
        }
        arr.resize(n);
    }
};
```

解法2：双指针

```
#include <vector>
using namespace std;

class Solution {
public:
    void duplicateZeros(vector<int>& arr) {
        int n = arr.size();
        int i = 0, j = 0;
        
        // 第一阶段：计算最终需要保留的元素位置
        while (j < n) {
            if (arr[i] == 0) {
                j += 2;  // 遇到零，需要多占一个位置
            } else {
                j += 1;  // 非零元素只占一个位置
            }
            i++;
        }
        
        // 调整指针到正确位置
        i--;
        j--;
        
        // 第二阶段：从后向前复写元素
        while (i >= 0) {
            // 处理当前元素
            if (j < n) {
                arr[j] = arr[i];
            }
            
            // 如果是零，需要复写一次
            if (arr[i] == 0) {
                j--;
                if (j < n) {
                    arr[j] = 0;
                }
            }
            
            // 移动指针
            i--;
            j--;
        }
    }
};
```

