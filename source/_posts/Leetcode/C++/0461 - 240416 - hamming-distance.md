---
title: Leetcode 0461.hamming-distance
tags:
  - leetcode
  - Hash Table
categories: [Leetcode, C++]
series: Leetcode-C++
abbrlink: '42330e94'
date: 2024-01-10
---

## [461. 汉明距离](https://leetcode.cn/problems/hamming-distance/)

两个整数之间的 [汉明距离](https://baike.baidu.com/item/汉明距离) 指的是这两个数字对应二进制位不同的位置的数目。

给你两个整数 `x` 和 `y`，计算并返回它们之间的汉明距离。

**示例 1：**

```
输入：x = 1, y = 4
输出：2
解释：
1   (0 0 0 1)
4   (0 1 0 0)
       ↑   ↑
上面的箭头指出了对应二进制位不同的位置。
```

**示例 2：**

```
输入：x = 3, y = 1
输出：1
```

 题目大意

汉明距离是指两个整数的二进制表示中，**对应位置二进制位不同的数目**。给定两个整数 `x` 和 `y`，计算并返回它们之间的汉明距离。

例如：

- 输入 `x=1, y=4`，二进制分别为 `0001` 和 `0100`，对应位不同的位置有 2 处，输出 `2`；
- 输入 `x=3, y=1`，二进制分别为 `0011` 和 `0001`，对应位不同的位置有 1 处，输出 `1`。

## 解题思路

核心思路是**利用异或运算 + 统计 1 的个数**，步骤如下：

1. **异或运算（XOR）**：异或的特性是 “相同为 0，不同为 1”。对 `x` 和 `y` 做异或操作，得到的结果 `xor_result` 中，**每一位的 1 都对应 `x` 和 `y` 二进制位不同的位置**；
2. **统计 1 的个数**：计算 `xor_result` 中 1 的总数，这个总数就是 `x` 和 `y` 的汉明距离。

统计 1 的个数有两种常用方法：

- **方法 1（直观）**：将 `xor_result` 转为二进制字符串，直接统计字符串中 `'1'` 的数量；
- **方法 2（高效）**：使用 **Brian Kernighan 算法**（每次清除最右侧的 1，直到结果为 0，统计清除次数），时间复杂度更优（仅遍历 1 的个数次）。

### 方法 1：遍历二进制位（直观易懂）

```cpp
class Solution {
public:
    int hammingDistance(int x, int y) {
        int xor_result = x ^ y;
        int count = 0;
        
        // 遍历二进制的每一位，统计1的个数
        while (xor_result) {
            count += xor_result & 1;  // 若最低位为1，则加1
            xor_result >>= 1;         // 右移一位，检查下一位
        }
        
        return count;
    }
};
```

### 方法 2：Brian Kernighan 算法（高效统计 1 的个数）

```cpp
class Solution {
public:
    int hammingDistance(int x, int y) {
        int xor_result = x ^ y;  // 异或结果：不同位为1，相同位为0
        int count = 0;
        
        // 循环清除最右侧的1，统计清除次数（即1的个数）
        while (xor_result) {
            xor_result &= xor_result - 1;  // 清除最右侧的1
            count++;
        }
        
        return count;
    }
};
```

