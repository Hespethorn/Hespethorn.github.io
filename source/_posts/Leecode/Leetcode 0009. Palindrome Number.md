---
title: Leetcode 0009. Palindrome Number
tags:
  - leetcode
categories:
  - Leetcode
  - string
series: Leetcode
abbrlink: 7f1b9ffc
date: 2022-06-01 20:40:44
---

# [9. Palindrome Number](https://leetcode.com/problems/palindrome-number/)


## 题目

Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward.

**Example 1**:

```
Input: 121
Output: true
```

**Example 2**:

```
Input: -121
Output: false
Explanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
```

**Example 3**:

```
Input: 10
Output: false
Explanation: Reads 01 from right to left. Therefore it is not a palindrome.
```

**Follow up**:

Coud you solve it without converting the integer to a string?

## 题目大意

判断一个整数是否是回文数。回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

## 解题思路

- 判断一个整数是不是回文数。
- 简单题。注意会有负数的情况，负数，个位数，10 都不是回文数。其他的整数再按照回文的规则判断。

```
class Solution {
public:
    bool isPalindrome(int x) {
        // 特殊情况处理：
        // 1. 负数不是回文数
        // 2. 如果数字的最后一位是0，只有数字本身是0才是回文数
        if (x < 0 || (x % 10 == 0 && x != 0)) {
            return false;
        }
        
        int reversed_num = 0;
        // 反转整数的后半部分
        while (x > reversed_num) {
            reversed_num = reversed_num * 10 + x % 10;
            x /= 10;
        }
        
        // 当数字长度为奇数时，reversed_num会比x多一位，需要除以10
        // 例如12321，循环结束后x=12，reversed_num=123，12 == 123/10 → 12 == 12
        return x == reversed_num || x == reversed_num / 10;
    }
};
```

解法2：转为string类型

```
#include <string>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // 将整数转换为字符串
        string s = to_string(x);
        
        // 获取字符串的反转
        string reversed_s = string(s.rbegin(), s.rend());
        
        // 检查原字符串和反转后的字符串是否相同
        return s == reversed_s;
    }
};
```

