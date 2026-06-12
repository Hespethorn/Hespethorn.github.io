---
title: Leetcode 0014. Longest Common Prefix (python)
tags:
  - leetcode
  - python
  - 字符串
  - 二分查找
categories:
  - Leetcode
series: Leetcode-Python
abbrlink: 'longest-common-prefix'
date: 2024-03-07
---

# [14. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/)

---

## 你选用何种方法解题？

| 方法 | 核心思路 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---|:---:|:---:|:---|
| 方法一：横向扫描 | 依次比较相邻两个字符串的公共前缀 | O(S) | O(1) | **最直观**：逐个比较 |
| 方法二：纵向扫描 | 按字符位置逐列比较所有字符串 | O(S) | O(1) | **提前终止**：遇到不匹配立即返回 |
| 方法三：二分查找 | 在最短字符串长度范围内二分查找 | O(S×log(minLen)) | O(1) | **适合长字符串** |

**方法二是推荐解**：纵向扫描可以提前终止，实际性能更好。

---

## 解题过程

### 核心洞察

最长公共前缀的长度不可能超过最短字符串的长度。

### 纵向扫描步骤

```
输入: ["flower","flow","flight"]

第1列: f, f, f → 全部相同，继续
第2列: l, l, l → 全部相同，继续
第3列: o, o, i → 不相同，返回前2个字符 "fl"
```

### 边界情况

| 场景 | 输入 | 结果 |
|:---|:---|:---|
| 空数组 | [] | "" |
| 单元素 | ["a"] | "a" |
| 无公共前缀 | ["dog","racecar","car"] | "" |
| 完全相同 | ["aaa","aaa","aaa"] | "aaa" |

---

## 这些方法具体怎么运用？

### 方法一：横向扫描

**核心逻辑**：先找前两个字符串的公共前缀，再用这个前缀与第三个字符串比较，依此类推。

### 方法二：纵向扫描（推荐）

**核心逻辑**：按字符位置逐列比较，遇到不匹配立即返回。

### 方法三：二分查找

**核心逻辑**：在 `[0, minLen]` 范围内二分查找最长公共前缀的长度。

---

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|:---|:---:|:---:|:---|
| 横向扫描 | O(S) | O(1) | S 是所有字符串字符总数 |
| 纵向扫描 | O(S) | O(1) | 可能提前终止 |
| 二分查找 | O(S×log(minLen)) | O(1) | 适合长字符串 |

---

## 总结与最佳选择

**最快算法**：纵向扫描，可能提前终止。

**工程最优选择**：**纵向扫描（方法二）**，理由：
1. **提前终止**：遇到不匹配立即返回
2. **代码简洁**：逻辑清晰
3. **效率较高**：无需比较全部字符

---

## Code

### 方法一：横向扫描

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        if not strs:
            return ""
        
        prefix = strs[0]
        for s in strs[1:]:
            while not s.startswith(prefix):
                prefix = prefix[:-1]
                if not prefix:
                    return ""
        return prefix
```

### 方法二：纵向扫描（推荐）

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        if not strs:
            return ""
        
        for i in range(len(strs[0])):
            c = strs[0][i]
            for s in strs[1:]:
                if i >= len(s) or s[i] != c:
                    return strs[0][:i]
        return strs[0]
```

### 方法三：二分查找

```python
class Solution:
    def longestCommonPrefix(self, strs: List[str]) -> str:
        if not strs:
            return ""
        
        def is_common_prefix(length):
            prefix = strs[0][:length]
            return all(s.startswith(prefix) for s in strs)
        
        left, right = 0, min(len(s) for s in strs)
        while left < right:
            mid = (left + right + 1) // 2
            if is_common_prefix(mid):
                left = mid
            else:
                right = mid - 1
        return strs[0][:left]
```