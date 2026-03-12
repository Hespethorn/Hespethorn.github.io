---
title: Leetcode 0093. Restore IP Addresses
tags:
  - leetcode
categories:
  - Leetcode
  - 回溯算法
series: Leetcode
abbrlink: aaa2c424
date: 2025-02-10 21:51:49
---

## [93. Restore IP Addresses](https://leetcode.cn/problems/restore-ip-addresses/)

A **valid IP address** consists of exactly four integers separated by single dots. Each integer is between `0` and `255` (**inclusive**) and cannot have leading zeros.

- For example, `"0.1.2.201"` and `"192.168.1.1"` are **valid** IP addresses, but `"0.011.255.245"`, `"192.168.1.312"` and `"192.168@1.1"` are **invalid** IP addresses.

Given a string `s` containing only digits, return *all possible valid IP addresses that can be formed by inserting dots into* `s`. You are **not** allowed to reorder or remove any digits in `s`. You may return the valid IP addresses in **any** order.

**Example 1:**

```
Input: s = "25525511135"
Output: ["255.255.11.135","255.255.111.35"]
```

**Example 2:**

```
Input: s = "0000"
Output: ["0.0.0.0"]
```

**Example 3:**

```
Input: s = "101023"
Output: ["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]
```

##  题目大意

给定一个仅包含数字的字符串 `s`，通过在其中插入点号来形成有效的 IP 地址。一个有效的 IP 地址由恰好四个整数组成，整数之间用单个点号分隔，每个整数需满足：

- 取值范围在 0 到 255 之间（包含 0 和 255）；
- 不能有前导零（如 "01" 无效，但 "0" 有效）。

返回所有可能的有效 IP 地址，不允许重排或删除任何数字。

例如：

- 输入 `s = "25525511135"`，输出 `["255.255.11.135","255.255.111.35"]`；
- 输入 `s = "0000"`，输出 `["0.0.0.0"]`。

## 解题思路

核心思路是**递归回溯 + 有效性校验**，通过逐步分割字符串生成四个整数，验证每个部分的有效性：

1. **递归状态设计**

   - 递归函数`dfs(i, j, ip_val)`表示：

     - `i`：当前处理到字符串的第`i`个字符
- `j`：已分割出的 IP 段数量（0-4）
     - `ip_val`：当前正在构建的 IP 段的数值值（累加计算）
     
   - `path`数组记录每段 IP 的结束位置 + 1（右开区间），用于最终拼接

2. **核心决策逻辑**

   - 不分割：当前字符继续加入当前 IP 段

     - 需满足：当前数值`ip_val > 0`（避免前导零，如 "01"）
- 更新数值：`ip_val = ip_val * 10 + (s[i] - '0')`
     - 递归处理下一个字符：`dfs(i+1, j, ip_val)`
     
   - 分割：以当前字符作为当前 IP 段的结尾

     - 记录当前段的结束位置：`path[j] = i + 1`
- 开始构建下一段：`dfs(i+1, j+1, 0)`（重置`ip_val`）
  
3. **终止与校验条件**

   - 若`i == n`（处理完所有字符）：

     - 必须恰好分割出 4 段（`j == 4`）才有效，拼接 IP 地址加入结果

   - 若`j == 4`（已分割 4 段）：

     - 剩余字符必须为 0，否则无效

   - 若`ip_val > 255`：

     - 当前段数值超出范围，终止递归

4. **数值计算优化**

   - 直接通过整数累加计算 IP 段数值（避免`stoi`转换）
   - 实时判断数值是否超过 255，提前剪枝

## 代码实现

```
class Solution {
public:
    vector<string> restoreIpAddresses(string s) {
        int n = s.size();
        vector<string> ans;
        int path[4]; // path[i] 表示第 i 段的结束位置 + 1（右开区间）

        // 分割 s[i] 到 s[n-1]，现在在第 j 段（j 从 0 开始），数值为 ip_val
        auto dfs = [&](this auto&& dfs, int i, int j, int ip_val) -> void {
            if (i == n) { // s 分割完毕
                if (j == 4) { // 必须有 4 段
                    auto [a, b, c, _] = path;
                    ans.emplace_back(s.substr(0, a) + "." + s.substr(a, b - a) + "." + s.substr(b, c - b) + "." + s.substr(c));
                }
                return;
            }

            if (j == 4) { // j=4 的时候必须分割完毕，不能有剩余字符
                return;
            }

            // 手动把字符串转成整数，这样字符串转整数是严格 O(1) 的
            ip_val = ip_val * 10 + (s[i] - '0');
            if (ip_val > 255) { // 不合法
                return;
            }

            // 不分割，不以 s[i] 为这一段的结尾
            if (ip_val > 0) { // 无前导零
                dfs(i + 1, j, ip_val);
            }

            // 分割，以 s[i] 为这一段的结尾
            path[j] = i + 1; // 记录下一段的开始位置
            dfs(i + 1, j + 1, 0);
        };

        dfs(0, 0, 0);
        return ans;
    }
};
```

作者：灵茶山艾府
链接：https://leetcode.cn/problems/restore-ip-addresses/solutions/3727037/liang-chong-fang-fa-san-zhong-xun-huan-h-hxak/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。