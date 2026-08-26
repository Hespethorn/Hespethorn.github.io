---


title: git pull 与 git pull --rebase 的差异
tags:
  - Git
  - git pull
  - git rebase
  - 版本控制
  - 工作流
categories: [Systems, Git]
abbrlink: e3f5a7b1
date: 2026-06-15
series: [Git]
---

日常使用 Git 时，`git pull` 是最频繁的命令之一。但很多人不知道，`git pull` 实际上有两种截然不同的工作方式，它们在提交历史上产生的影响天差地别。本文将深入对比 `git pull`（默认 merge 模式）与 `git pull --rebase` 的核心差异，帮你做出合适的选择。

## 一、git pull 的本质：两步操作的快捷方式

先厘清一个基本事实：`git pull` 不是原子操作，它是两条命令的组合。

```bash
git pull = git fetch + git merge   # 默认行为
git pull --rebase = git fetch + git rebase   # rebase 模式
```

第一步永远是 `git fetch`：从远程仓库下载最新的提交对象，更新本地的远程跟踪分支（`origin/main`），但不会动你的本地分支。

第二步才是差异所在——用什么方式把远程的更新"合入"你当前的工作。

## 二、默认模式：fetch + merge

假设你和同事都在 `main` 分支上工作。你本地有两个新提交，同事推送了三个新提交。执行 `git pull`（默认）后，Git 会创建一个**合并提交**（merge commit），把两条分支线缝合在一起。

```
执行前：
  A---B---C  (origin/main)
       \
        D---E  (main, HEAD)

执行 git pull 后：
  A---B---C---M  (main, HEAD)  ← M 是合并提交
       \     /
        D---E
```

这个 `M` 就是 merge commit。如果合并过程没有冲突，Git 会自动生成这个提交，提交信息通常是 `Merge branch 'main' of github.com:xxx/xxx`。

**优点**：
- 完整保留分支历史，清晰记录"什么时候合并过"
- 不会改写已存在的提交，安全性高
- 适合需要严格审计和追溯的团队

**缺点**：
- 产生大量的合并提交，历史图变得杂乱
- 多人频繁 push/pull 时，提交历史会充满无意义的 merge commit
- 增加 `git log` 和 `git bisect` 的噪音

## 三、rebase 模式：fetch + rebase

`git pull --rebase` 的第二步换成 `git rebase`。它不是创建合并提交，而是把你的本地提交"挪到"远程最新提交的后面，像接龙一样续上去。

```
执行前：
  A---B---C  (origin/main)
       \
        D---E  (main, HEAD)

执行 git pull --rebase 后：
  A---B---C---D'---E'  (main, HEAD)
```

注意 `D'` 和 `E'`：它们是**全新的提交**，有新的哈希值，但内容和你原来的 `D`、`E` 一样。原来的 `D`、`E` 被丢弃了。

**优点**：
- 提交历史是一条干净的直线，没有多余的 merge commit
- `git log --oneline` 清晰可读
- 方便做 `git bisect` 定位 bug
- 适合追求干净历史的团队和开源项目

**缺点**：
- 改写了提交历史（提交哈希变了）
- 如果有冲突，解决过程比 merge 稍复杂
- **绝对不能**对已推送到公共分支的提交执行 rebase

## 四、冲突处理方式的差异

两种模式遇到冲突时的体验也不同。

### merge 模式的冲突处理

```bash
$ git pull
CONFLICT (content): Merge conflict in file.txt
# Git 自动进入合并状态

# 解决冲突后：
$ git add file.txt
$ git commit   # 完成合并提交
```

一次解决，一次提交。冲突解决过程包裹在一个 merge commit 中。

### rebase 模式的冲突处理

```bash
$ git pull --rebase
CONFLICT (content): Merge conflict in file.txt
# Git 暂停 rebase 过程

# 解决冲突后：
$ git add file.txt
$ git rebase --continue   # 继续 rebase
# 或者：
$ git rebase --skip       # 跳过当前提交
# 或者：
$ git rebase --abort      # 放弃整个 rebase
```

如果你的本地有两个提交，而远程有三个提交，rebase 会逐个应用你的提交。这意味着**你可能需要解决多次冲突**——每个本地提交遇到冲突时都要处理一次。

这点是 rebase 最让人头疼的地方。但反过来看，它强迫你将冲突化解在每个独立的提交中，最终历史更干净。

## 五、核心差异对比

| 维度 | `git pull`（merge） | `git pull --rebase` |
|:---|:---|:---|
| 第二步操作 | `git merge` | `git rebase` |
| 提交历史形态 | 分叉 + 合并提交 | 线性，一条直线 |
| 是否改写历史 | 否 | 是（本地提交被重建） |
| 额外提交 | 产生 merge commit | 不产生额外提交 |
| 冲突解决 | 一次性 | 可能多次（每个提交一次） |
| 回滚难度 | 简单（merge commit 可 revert） | 较难（历史已改写） |
| 公共分支安全性 | 安全 | 危险，永远不要 rebase 公共分支 |
| `git log` 可读性 | 较差 | 好 |

## 六、什么时候用哪个

### 适合 `git pull --rebase` 的场景

1. **个人开发分支**：你还没推送的本地提交，用 rebase 保持干净
2. **开源贡献**：在 fork 的分支上开发，提交 PR 前 rebase 到 upstream 最新
3. **团队约定线性历史**：某些团队强制要求 `main` 分支保持线性历史
4. **从同一个分支频繁拉取**：你和同事在同一个 feature 分支协作，避免 merge commit 泛滥

### 适合默认 `git pull`（merge）的场景

1. **公共共享分支**：多人直接推送到同一个分支，保持历史真实性
2. **需要审计追溯**：必须记录每一次合并的发生时间和来源
3. **长期存在的并行分支**：release 分支合入 main，需要保存合并记录
4. **新手团队**：merge 的心智负担低于 rebase，出错了更容易挽救

### 一个简单的判断原则

> 如果你本地的提交**还没推送过**，用 rebase。如果提交**已经推送过**，用 merge。

因为 rebase 会改写提交哈希，已推送的提交被改写后，`git push` 需要 `--force`，这会让拉过你代码的人陷入混乱。

## 七、将 --rebase 设为默认行为

如果你决定在大部分场景使用 rebase，可以修改 Git 配置，让 `git pull` 默认使用 rebase。

### 针对当前仓库

```bash
git config pull.rebase true
```

### 全局生效

```bash
git config --global pull.rebase true
```

### 只为特定分支设置

某些场景下你可能想混合使用——比如 feature 分支用 rebase，main 分支用 merge：

```bash
# 在 main 分支上，pull 默认用 merge
git config branch.main.rebase false

# 在 feature 分支上，pull 默认用 rebase
git config branch.feature-xxx.rebase true
```

### 更安全的选项：--ff-only

还有一个中间地带——`git pull --ff-only`。它只允许快进合并（fast-forward），如果远程有更新而本地也有提交，它会直接报错而不是自动创建 merge commit。

```bash
git config --global pull.ff only
```

这样你在合并前必须明确决定用 merge 还是 rebase，避免了无意识的合并行为。很多资深开发者推崇这种做法。

## 八、常见误区

### 误区一："git pull --rebase 不会产生冲突"

rebase 和 merge 一样会产生冲突。区别在于 rebase 可能让你解决多次——因为在逐个应用本地提交的过程中，每个提交都可能遇到同一个冲突。

### 误区二："rebase 完就没事了"

rebase 后你的本地提交哈希全变了。如果你之前已经把这些提交 push 到远程，下次 push 必须 `--force`。请确认没人基于这些提交工作时再 force push。

### 误区三："pull.rebase true 对所有情况都安全"

如果你从一个多人共享的分支 pull，而你又在这个分支上有本地提交，rebase 后 force push 会覆盖别人的提交。**任何已经推送到公共仓库的提交都不应该被 rebase。**

### 误区四："两个命令的结果一样"

不一样。merge 产生合并提交，历史分叉；rebase 产生线性历史。如果你用 `git log --graph` 看，两者的差异一目了然。

## 九、总结

`git pull` 和 `git pull --rebase` 的核心差异在于**第二步的合并策略**：merge 保留分支轨迹但引入合并提交，rebase 改写历史但保持线性。

没有绝对的优劣。关键看两件事：**你的提交是否已经公开**，以及**团队对提交历史的约定**。

最简单安全的实践：

```
本地未推送 → git pull --rebase（保持干净）
已推送共享 → git pull（保留历史真实）
不确定时   → git pull --ff-only（不自动合并，等你想清楚）
```

**Git 真正的能力不在于记住命令，而在于理解每次操作在提交图上的效果——那才是在历史混乱时你能不乱的原因。**
