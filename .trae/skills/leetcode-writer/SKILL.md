---
name: "leetcode-writer"
description: "生成符合规范的LeetCode题解文章，遵循统一的文件命名、Front-matter和章节结构要求。"
---

# LeetCode 题解文章生成器

## 技能概述

本技能用于生成符合统一格式规范的 LeetCode 题解文章。严格遵循 `source/_posts/Leetcode/` 目录下的格式要求，确保所有题解文章风格一致、结构清晰。

## 使用场景

- 为 LeetCode 题目编写结构化的题解文章
- 确保题解文章格式符合项目规范
- 生成包含多种解题方法对比的技术文章

## 核心规范

### 1. 文件命名规则

根据编程语言采用不同的命名格式：

| 语言 | 命名格式 | 示例 |
|-----|---------|------|
| Python | `leetcode NNNN - Problem Name.md` | `leetcode 0001 - two sum.md` |
| C++ | `NNNN - YYMMDD - ProblemName.md` | `0001 - 240101 - two sum.md` |

### 2. Front-matter 规范

每篇文章必须包含完整的 YAML 头部信息：

```yaml
---
title: Leetcode NNNN. ProblemName (python)  # 标题格式固定
tags:
  - leetcode                              # 必选标签
  - python                                # 语言标签
  - 核心算法标签                           # 如：哈希表、滑动窗口、二分查找等
categories:
  - Leetcode                              # 固定分类
series: Leetcode                          # 固定系列
abbrlink:                                 # 唯一标识符（英文短横线连接）
date: YYYY-MM-DD HH:MM:00                 # 时间规范见下方说明
---
```

**时间规范：**
- 从 2024-01-02 开始计算
- 每篇文章比上一篇晚 5 天
- 时间范围：19:00 - 23:30，随机分配

### 3. 正文章节结构（固定顺序）

文章必须包含以下 7 个章节：

| 序号 | 章节标题 | 内容要求 |
|:---:|---------|---------|
| 1 | `## 题目` | 英文标题 + 题目链接 |
| 2 | `## 你选用何种方法解题？` | 方法对比表，明确推荐方法及选型理由 |
| 3 | `## 解题过程` | 问题分析 → 核心洞察 |
| 4 | `## 这些方法具体怎么运用？` | 数据结构、步骤、边界情况处理表 |
| 5 | `## 复杂度` | 所有方法对比表 + 解释（含常数因子差异） |
| 6 | `## 总结与最佳选择` ⭐ | 最快算法（数据对比）+ 工程最优选择（2-4条理由）+ 适用场景 |
| 7 | `## Code` | 每个方法独立子标题 `### 方法N：名称`，推荐方法标注"（推荐）" |

### 4. 关键原则

1. **推荐必须明确** — 不给"各有优劣"，必须明确最佳方案及原因
2. **表格优于纯文本** — 方法对比、复杂度、边界处理都用表格呈现
3. **具体高于抽象** — 每个结论需有数值或例子支撑（如"n=10⁴时快100倍"）
4. **手推演示例不可省略** — 用题目输入逐步追踪算法执行过程
5. **全部解释用中文** — 除题目原文外所有内容使用中文
6. **代码完整可运行** — 包含 import、类型标注、关键逻辑中文注释

### 5. 代码规范

代码块需遵循以下规范：

```python
# Python 代码示例格式
from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    """
    两数之和：使用哈希表实现 O(n) 时间复杂度
    
    Args:
        nums: 输入数组
        target: 目标和
    
    Returns:
        两个数的索引，满足 nums[i] + nums[j] == target
    """
    num_map = {}  # 存储已遍历的数字及其索引
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []  # 题目保证有解，此处为防御性返回
```

**代码注释要求：**
- 函数需包含 docstring 说明功能、参数、返回值
- 关键逻辑步骤需添加中文注释
- 复杂算法需说明时间空间复杂度

## 输入输出规范

### 输入参数

```yaml
language: "python"         # 必需: python 或 cpp
problem_number: 1          # 必需: LeetCode 题目编号
problem_name: "Two Sum"    # 必需: 题目名称
methods:                   # 可选: 解题方法列表
  - name: "哈希表"
    recommended: true
    description: "使用哈希表存储已遍历元素，O(n) 时间复杂度"
    code: "..."
```

### 输出格式

生成的 Markdown 文件结构：

```markdown
---
title: Leetcode 0001. Two Sum (python)
tags:
  - leetcode
  - python
  - 哈希表
categories:
  - Leetcode
series: Leetcode
abbrlink: leetcode-0001-two-sum
date: 2024-01-02 19:30:00
---

## 题目

**Two Sum**  
https://leetcode.com/problems/two-sum/

## 你选用何种方法解题？

| 方法 | 时间复杂度 | 空间复杂度 | 推荐 | 理由 |
|------|-----------|-----------|:---:|------|
| 哈希表 | O(n) | O(n) | ⭐ | 最优时间复杂度，空间换时间 |
| 暴力枚举 | O(n²) | O(1) | | 简单但效率低 |

## 解题过程

问题分析：给定数组 nums 和目标值 target，找出两个数之和等于 target...

核心洞察：使用哈希表可以将查找补数的时间从 O(n) 降到 O(1)...

## 这些方法具体怎么运用？

### 哈希表方法

**数据结构：**
- `dict`: 存储已遍历数字及其索引

**步骤：**
1. 遍历数组，对于每个元素计算补数
2. 检查补数是否在哈希表中
3. 存在则返回结果，否则将当前元素加入哈希表

**边界情况处理：**

| 边界情况 | 处理方式 |
|---------|---------|
| 重复元素 | 哈希表存储最先出现的索引 |
| 负数 | 哈希表正常处理 |
| 大数 | Python 无整数溢出问题 |

## 复杂度

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|------|-----------|-----------|------|
| 哈希表 | O(n) | O(n) | 平均情况，哈希查找 O(1) |
| 暴力枚举 | O(n²) | O(1) | 双层循环 |

## 总结与最佳选择 ⭐

### 最快算法
哈希表方法在 n=10⁴ 时比暴力枚举快约 100 倍。

### 工程最优选择：哈希表

理由：
1. 时间复杂度最优，适合大规模数据
2. 实现简单，代码可读性高
3. 空间开销在可接受范围内

### 适用场景

| 方法 | 适用场景 |
|------|---------|
| 哈希表 | 大多数情况，追求最优性能 |
| 暴力枚举 | 数据量小或空间受限场景 |

## Code

### 方法一：哈希表（推荐）

```python
from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []
```

### 方法二：暴力枚举

```python
from typing import List

def twoSum(nums: List[int], target: int) -> List[int]:
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```
```

## 质量保证清单

- [ ] 文件命名符合规范
- [ ] Front-matter 完整包含所有必需字段
- [ ] 日期符合时间范围要求（19:00-23:30）
- [ ] 包含完整的 7 个章节
- [ ] 方法对比使用表格呈现
- [ ] 推荐方法明确标注
- [ ] 代码包含中文注释
- [ ] 所有解释使用中文

## 调用示例

```yaml
技能: leetcode-writer
参数:
  language: "python"
  problem_number: 1
  problem_name: "Two Sum"
  output_path: "source/_posts/Leetcode/Python/"
```

## 版本历史

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| 1.0 | 2026-06-07 | 初始版本，支持 Python 和 C++ 题解文章生成 |

---

*本技能遵循 Trae 技能框架规范，可随时调用生成符合要求的 LeetCode 题解文章。*
