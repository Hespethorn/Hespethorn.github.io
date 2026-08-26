---

title: Leetcode 0011. Container With Most Water
tags:
  - leetcode
categories: [Algorithms, Leetcode-C++]
series: [Leetcode-C++]
abbrlink: b1e67904
date: 2023-02-04

---

# [11. Container With Most Water](https://leetcode.com/problems/container-with-most-water/)

## 题目

Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of line i is at (i, ai) and (i, 0). Find two lines, which together with x-axis forms a container, such that the container contains the most water.

Note: You may not slant the container and n is at least 2.

![](https://s3-lc-upload.s3.amazonaws.com/uploads/2018/07/17/question_11.jpg)

The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.

Example 1:

```c
Input: [1,8,6,2,5,4,8,3,7]
Output: 49
```


## 题目大意

给出一个非负整数数组 a1，a2，a3，…… an，每个整数标识一个竖立在坐标轴 x 位置的一堵高度为 ai 的墙，选择两堵墙，和 x 轴构成的容器可以容纳最多的水。

## 解题思路


这一题也是对撞指针的思路。首尾分别 2 个指针，每次移动以后都分别判断长宽的乘积是否最大。

```
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0;                  // 左指针，从最左侧开始
        int right = height.size() - 1; // 右指针，从最右侧开始
        int max_area = 0;              // 记录最大面积
        
        while (left < right) {
            // 计算当前左右指针构成的容器容量
            int current_width = right - left;
            int current_height = min(height[left], height[right]);
            int current_area = current_width * current_height;
            
            // 更新最大面积
            max_area = max(max_area, current_area);
            
            // 移动较矮的指针，寻找可能更大的容量
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        
        return max_area;
    }
};
```

