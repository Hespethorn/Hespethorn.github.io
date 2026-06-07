---
title: Leetcode 0007. Reverse Integer
tags:
  - leetcode
categories:
  - Leetcode
  - string
series: Leetcode
abbrlink: 1daf065e
date: 2023-01-20 21:21:00
---

# [7. Reverse Integer](https://leetcode.com/problems/reverse-integer/)


## 题目

Given a 32-bit signed integer, reverse digits of an integer.

**Example 1:**

    Input: 123
    Output: 321

**Example 2:**

    Input: -123
    Output: -321

**Example 3:**

    Input: 120
    Output: 21

**Note:**Assume we are dealing with an environment which could only store integers within the 32-bit signed integer range: [−2^31, 2^31 − 1]. For the purpose of this problem, assume that your function returns 0 when the reversed integer overflows.

## 题目大意

给出一个 32 位的有符号整数，需要将这个整数中每位上的数字进行反转。注意:假设我们的环境只能存储得下 32 位的有符号整数，则其数值范围为 [−2^31,  2^31 − 1]。请根据这个假设，如果反转后整数溢出那么就返回 0。

## 解题思路


- 这一题是简单题，要求反转 10 进制数。类似的题目有第 190 题。
- 这一题只需要注意一点，反转以后的数字要求在 [−2^31, 2^31 − 1]范围内，超过这个范围的数字都要输出 0 。

```
#include <climits> // 包含INT_MAX和INT_MIN的定义

class Solution {
public:
    int reverse(int x) {

        
        int result = 0;
        
        while (x != 0) {
            // 取出最后一位数字
            int digit = x % 10;
            x /= 10;
            
            // 检查是否会溢出
            // 正数溢出情况
            if (result > INT_MAX / 10 || (result == INT_MAX / 10 && digit > 7)) {
                return 0;
            }
            // 负数溢出情况
            if (result < INT_MIN / 10 || (result == INT_MIN / 10 && digit < -8)) {
                return 0;
            }
            
            // 更新结果
            result = result * 10 + digit;
        }
        
        return result;
    }
};
```
### 解法2：字符串反转

```
#include <string>
#include <algorithm>
#include <stdexcept>

class Solution {
public:
    int reverse(int x) {
        // 将整数转换为字符串
        std::string s = std::to_string(x);
        bool is_negative = (x < 0);
        
        // 如果是负数，只反转数字部分，保留负号在前面
        if (is_negative) {
            // 反转负号后面的所有字符
            std::reverse(s.begin() + 1, s.end());
        } else {
            // 正数全部反转
            std::reverse(s.begin(), s.end());
        }
        
        try {
            // 转换回整数
            int ans = std::stoi(s);
            return ans;
        } catch(const std::out_of_range&) {
            // 溢出情况
            return 0;
        } catch(...) {
            // 其他异常
            return 0;
        }
    }
};
```

