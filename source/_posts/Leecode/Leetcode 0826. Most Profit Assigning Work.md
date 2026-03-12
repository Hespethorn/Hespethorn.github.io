---
title: Leetcode 0826. Most Profit Assigning Work
tags:
  - leetcode
categories:
  - Leetcode
  - 双指针
series: Leetcode
abbrlink: edc6927a
date: 2023-11-13 20:19:31
---

## [826. Most Profit Assigning Work](https://leetcode.cn/problems/most-profit-assigning-work/)

You have `n` jobs and `m` workers. You are given three arrays: `difficulty`, `profit`, and `worker` where:

- `difficulty[i]` and `profit[i]` are the difficulty and the profit of the `ith` job, and
- `worker[j]` is the ability of `jth` worker (i.e., the `jth` worker can only complete a job with difficulty at most `worker[j]`).

Every worker can be assigned **at most one job**, but one job can be **completed multiple times**.

- For example, if three workers attempt the same job that pays `$1`, then the total profit will be `$3`. If a worker cannot complete any job, their profit is `$0`.

Return the maximum profit we can achieve after assigning the workers to the jobs.

**Example 1:**

```
Input: difficulty = [2,4,6,8,10], profit = [10,20,30,40,50], worker = [4,5,6,7]
Output: 100
Explanation: Workers are assigned jobs of difficulty [4,4,6,6] and they get a profit of [20,20,30,30] separately.
```

**Example 2:**

```
Input: difficulty = [85,47,57], profit = [24,66,99], worker = [40,25,25]
Output: 0
```

### 题目大意

有 `n` 个工作和 `m` 个工人。给定三个数组：`difficulty`、`profit` 和 `worker`，其中：

- `difficulty[i]` 和 `profit[i]` 分别是第 `i` 个工作的难度和收益
- `worker[j]` 是第 `j` 个工人的能力（即该工人只能完成难度不超过 `worker[j]` 的工作）

每个工人最多只能分配一个工作，但一个工作可以被多个工人完成。返回分配工作后能获得的最大总利润。

### 核心解题思路

1. **关联工作难度和收益**：将工作的难度和对应的收益关联起来，并按难度排序
2. **预处理最大收益**：对于每个难度，计算该难度及以下能获得的最大收益（因为可能存在低难度高收益的工作）
3. **为每个工人分配最优工作**：对于每个工人，找到其能力范围内能获得的最大收益

```
class Solution {
public:
    int maxProfitAssignment(vector<int>& difficulty, vector<int>& profit, vector<int>& worker) {
        // 将工作难度和收益配对
        vector<pair<int, int>> jobs;
        for (int i = 0; i < difficulty.size(); ++i) {
            jobs.emplace_back(difficulty[i], profit[i]);
        }
        
        // 按工作难度排序
        sort(jobs.begin(), jobs.end());
        
        // 预处理：计算每个难度下的最大收益
        vector<int> maxProfit;
        int currentMax = 0;
        for (auto& job : jobs) {
            currentMax = max(currentMax, job.second);
            maxProfit.push_back(currentMax);
        }
        
        // 为每个工人找到能完成的最高收益工作
        int totalProfit = 0;
        for (int ability : worker) {
            // 找到第一个难度大于工人能力的工作
            int left = 0, right = jobs.size();
            while (left < right) {
                int mid = left + (right - left) / 2;
                if (jobs[mid].first > ability) {
                    right = mid;
                } else {
                    left = mid + 1;
                }
            }
            
            // 如果存在能完成的工作，累加最大收益
            if (left > 0) {
                totalProfit += maxProfit[left - 1];
            }
        }
        
        return totalProfit;
    }
};
```

### 解法2：双指针

```
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxProfitAssignment(vector<int>& difficulty, vector<int>& profit, vector<int>& worker) {
        int n = difficulty.size();
        // 将工作难度和收益配对
        vector<pair<int, int>> jobs(n);
        for (int i = 0; i < n; i++) {
            jobs[i] = {difficulty[i], profit[i]};
        }
        
        // 对工作按难度排序，对工人按能力排序
        sort(jobs.begin(), jobs.end());  
        sort(worker.begin(), worker.end());
        
        int ans = 0;          // 总收益
        int j = 0;            // 工作指针
        int max_profit = 0;   // 当前能力范围内的最大收益
        
        // 遍历每个工人
        for (int w : worker) {
            // 找到该工人能完成的所有工作，并更新最大收益
            while (j < n && jobs[j].first <= w) {
                max_profit = max(max_profit, jobs[j++].second);
            }
            // 累加当前工人能获得的最大收益
            ans += max_profit;
        }
        
        return ans;
    }
};
```

1. **数据准备与排序**：

   - 将工作的难度和收益组成 pair 数组
   - 对工作按难度从小到大排序
   - 对工人按能力从小到大排序
   - 排序后，能力小的工人在前，难度低的工作在前

2. **双指针遍历**：

   - 工人指针：循环遍历每个工人（已按能力排序）
   - 工作指针`j`：从 0 开始，指向当前需要检查的工作
   - 对于每个工人，将工作指针向前移动到其能力无法完成的工作为止
   - 在此过程中，动态维护`max_profit`，即当前工人能完成的所有工作中的最大收益

3. **收益计算**：

   - 每个工人的贡献是当前`max_profit`（其能力范围内的最大收益）
   - 累加所有工人的贡献得到总收益

### 解法3：map

```
class Solution {
public:
    int maxProfitAssignment(vector<int>& difficulty, vector<int>& profit, vector<int>& worker) {
        // 创建一个map存储难度到最大收益的映射，按难度自动排序
     map<int, int> diffToProfit;
         
        // 首先填充map，保留每个难度的最大收益
        for (int i = 0; i < difficulty.size(); ++i) {
            int d = difficulty[i];
            int p = profit[i];
            // 如果难度已存在，保留最大的收益
            if (diffToProfit.find(d) != diffToProfit.end()) {
                diffToProfit[d] = max(diffToProfit[d], p);
            } else {
                 diffToProfit[d] = p;
            }
        }
          
        // 预处理map，确保每个难度对应的是当前及之前的最大收益
        int maxProfit = 0;
        for (auto& entry : diffToProfit) {
            maxProfit = max(maxProfit, entry.second);
            entry.second = maxProfit;
        }
           
        // 计算总收益
        int total = 0;
        for (int ability : worker) {
           // 找到第一个大于当前能力的难度
            auto it = diffToProfit.upper_bound(ability);
            // 如果存在不大于当前能力的难度，累加其最大收益
           if (it != diffToProfit.begin()) {
               --it;
               total += it->second;
            }
            // 否则该工人无法完成任何工作，贡献为0
         }
        
        return total;
    }
};
```
