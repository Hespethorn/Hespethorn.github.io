---
title: 规范化 Git 提交 -- commitlint + husky
tags:
  - Git
  - commitlint
  - husky
categories:
  - Git
series: Git
abbrlink: 1f0b0ac5
date: 2024-12-17 21:20:39
---
## 导言

在团队开发或开源项目协作中，Git 提交信息如同代码的 “说明书”，直接影响代码可维护性与问题追溯效率。然而实际开发中，提交信息往往存在格式混乱、描述模糊等问题，例如 “fix bug”“update code” 这类无意义的表述。本文将通过 **commitlint**（提交信息验证工具）与 **husky**（Git 钩子管理工具）的组合，带你实现提交信息规范化与自动化校验，彻底解决这一痛点。

## 一、提交信息的常见问题与规范需求

### 1.1 典型问题分析

在未实施规范的项目中，提交信息通常存在以下问题：

- **格式混乱**：无固定结构，有的包含类型，有的仅描述内容

- **描述模糊**：如 “修改样式”“优化代码”，无法快速理解变更目的

- **信息不全**：未关联需求编号或 Bug ID，问题追溯困难

- **语义缺失**：无法通过提交信息判断变更类型（如功能新增、Bug 修复、文档更新）

### 1.2 规范标准选择：Conventional Commits

目前行业广泛采用的 **Conventional Commits（约定式提交）** 标准，定义了结构化的提交信息格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

各部分含义如下：

- **type**：提交类型（必填），常见值包括：

- - feat：新功能

- - fix：Bug 修复

- - docs：文档更新

- - style：代码格式调整（不影响代码逻辑）

- - refactor：代码重构（既非新功能也非 Bug 修复）

- - test：添加或修改测试代码

- - chore：构建流程、依赖管理等辅助操作

- **scope**：提交范围（可选），指定变更影响的模块（如auth、user）

- **description**：简短描述（必填），不超过 50 字符，首字母小写，结尾不加句号

- **body**：详细描述（可选），用于补充说明变更细节

- **footer**：底部信息（可选），常用于关联 Issue（如Closes #123）

示例：

```
feat(auth): 实现短信验证码登录功能

- 添加短信发送接口调用逻辑
- 完善登录状态校验流程

Closes #456
```

## 二、基础配置流程：从环境准备到核心配置

### 2.1 环境要求与版本兼容性

- **Node.js**：v14.13.0+（建议 v16+，确保与最新版 husky 兼容）

- **husky**：v8+（当前稳定版，与 commitlint@17 + 完全兼容）

- **commitlint**：v17+（需与 husky 版本匹配，避免钩子触发异常）

### 2.2 步骤 1：初始化项目与安装依赖

首先在项目根目录执行以下命令（已初始化 Git 的项目可跳过git init）：

```
# 1. 初始化Git仓库（若未初始化）
git init

# 2. 初始化package.json（若未初始化）
npm init -y

# 3. 安装核心依赖
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
```

- @commitlint/cli：commitlint 核心命令行工具

- @commitlint/config-conventional：基于 Conventional Commits 的预设配置

- husky：Git 钩子管理工具，用于触发 commitlint 验证

### 2.3 步骤 2：配置 commitlint 规则

创建 commitlint 配置文件，有两种常见方式：

#### 方式 1：创建单独配置文件（推荐）

在项目根目录创建 .commitlintrc.js 文件，内容如下：

```
module.exports = {
  // 继承Conventional Commits预设规则
  extends: ['@commitlint/config-conventional'],
  // 自定义规则（覆盖预设）
  rules: {
    // type必须为指定值，且不能为空
    'type-enum': [
      2, // 错误级别：2=必须符合（报错），1=警告，0=忽略
      'always', // 应用时机：always=始终，never=从不
      [
        'feat', 'fix', 'docs', 'style', 'refactor', 
        'test', 'chore', 'perf', 'revert' // 允许的type值
      ]
    ],
    // subject（description）长度限制：1-100字符
    'subject-min-length': [2, 'always', 1],
    'subject-max-length': [2, 'always', 100],
    // 不允许使用句号结尾
    'subject-full-stop': [2, 'never', '.'],
    // scope可选（错误级别设为0）
    'scope-empty': [0, 'always']
  }
};
```

#### 方式 2：在 package.json 中配置

若需减少配置文件数量，可在 package.json 中添加 commitlint 字段：

```
{
  "commitlint": {
    "extends": ["@commitlint/config-conventional"],
    "rules": {
      "type-enum": [2, "always", ["feat", "fix", "docs", "chore"]]
    }
  }
}
```

### 2.4 步骤 3：配置 husky 钩子

husky 通过管理 Git 钩子（如commit-msg、pre-commit），在提交代码时自动触发 commitlint 验证。

#### 步骤 3.1 启用 husky

执行以下命令初始化 husky，并启用 Git 钩子：

```
# 初始化husky（创建.husky目录）
npx husky install

# 设置husky自动启用（在package.json中添加prepare脚本）
npm set-script prepare "husky install"
```

执行 npm run prepare 后，husky 会自动在项目中启用 Git 钩子管理。

#### 步骤 3.2 创建 commit-msg 钩子

commit-msg 钩子会在提交信息写入 commit 文件后、提交完成前触发，用于验证提交信息格式：

```
# 创建commit-msg钩子
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

执行后会在 .husky 目录下生成 commit-msg 文件，内容如下（无需手动修改）：

```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
```

#### 步骤 3.3 （可选）创建 pre-commit 钩子

若需在提交前执行代码校验（如 ESLint、Prettier），可添加 pre-commit 钩子：

```
# 创建pre-commit钩子
npx husky add .husky/pre-commit 'npx eslint . --ext .js,.vue'
```

上述命令会在提交前自动执行 ESLint 校验，若校验失败则阻止提交。

## 三、钩子配置与验证逻辑深度解析

### 3.1 commit-msg 钩子工作流程

1. 开发者执行 git commit -m "提交信息"
2. Git 触发 commit-msg 钩子，将提交信息写入临时文件（路径通过 $1 传递）
3. husky 调用 commitlint --edit $1，读取临时文件内容并执行规则校验
4. 若校验通过：继续执行提交流程
5. 若校验失败：终止提交，输出错误信息（如 “type 必须为 feat、fix 等指定值”）

### 3.2 错误示例与解决方案

#### 示例 1：type 错误

提交命令：git commit -m "new: 添加用户列表页面"

错误信息：

```
⧗   input: new: 添加用户列表页面
✖   type must be one of [feat, fix, docs, style, refactor, test, chore] [type-enum]

✖   found 1 problems, 0 warnings
ⓘ   Get help: https://commitlint.js.org/#/concepts-shareable-config
```

解决方案：将 new 改为合法 type（如 feat），正确命令：git commit -m "feat(user): 添加用户列表页面"

#### 示例 2：subject 过长

提交命令：git commit -m "fix: 修复在用户未登录状态下点击个人中心按钮导致页面白屏的问题"

错误信息：

```
⧗   input: fix: 修复在用户未登录状态下点击个人中心按钮导致页面白屏的问题
✖   subject must not be longer than 100 characters [subject-max-length]

✖   found 1 problems, 0 warnings
```

解决方案：简化 subject，详细描述放入 body：

```
git commit -m "fix: 修复未登录点击个人中心导致白屏问题

详细说明：用户未登录时点击个人中心按钮，因未处理token为空场景，导致Vue渲染异常。
解决方案：添加token存在性校验，跳转至登录页。"
```

## 四、进阶使用技巧与场景适配

### 4.1 自定义提交模板

为减少开发者记忆成本，可创建提交模板，自动生成规范格式：

#### 步骤 1：创建模板文件

在项目根目录创建 .gitmessage 文件：

```
# <type>[optional scope]: <description>
# |<---- 最好不超过50字符 ---->|

# [optional body]
# |<---- 每行不超过72字符 ------------------------------>|

# [optional footer(s)]
# Closes #123, #456（关联Issue）

# 提交类型（type）：
# feat: 新功能
# fix: Bug修复
# docs: 文档更新
# style: 代码格式调整
# refactor: 代码重构
# test: 测试相关
# chore: 构建/依赖等辅助操作
```

#### 步骤 2：配置 Git 使用模板

```
git config --local commit.template .gitmessage
```

此后执行 git commit 会自动打开模板文件，按提示填写即可。

### 4.2 与 CI/CD 集成（以 GitHub Actions 为例）

在 CI 流程中添加 commitlint 验证，确保所有提交都符合规范：

在项目根目录创建 .github/workflows/commitlint.yml 文件：

```
name: Commitlint Check
on: [pull_request, push]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: 拉取代码
        uses: actions/checkout@v3
        with:
          fetch-depth: 0 # 拉取所有历史提交，确保能验证所有变更

      - name: 设置Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: 安装依赖
        run: npm install

      - name: 执行commitlint验证
        run: npx commitlint --from HEAD~${{ github.event.pull_request.commits }} --to HEAD
```

提交配置文件后，GitHub Actions 会在 PR 或 Push 时自动执行 commitlint 验证，若失败则阻断流程。

### 4.3 团队协作场景优化

#### 场景 1：新成员上手引导

- 在项目 README 中添加提交规范说明，附正确 / 错误示例

- 配置 husky 自动安装：在 package.json 中添加 postinstall 脚本，新成员安装依赖后自动启用 husky：

```
{
  "scripts": {
    "prepare": "husky install",
    "postinstall": "npm run prepare"
  }
}
```

#### 场景 2：特殊提交豁免规则

若需允许某些特殊提交（如紧急修复）跳过验证，可在 commitlint 配置中添加例外：

```
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许type为"hotfix"（预设中无此类型）
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'hotfix']],
    // 若subject包含"紧急修复"，允许长度超过100字符
    'subject-max-length': [
      2, 
      'always', 
      100,
      { ignore: ['subject', '紧急修复'] }
    ]
  }
};
```

## 五、常见问题与解决方案

### 5.1 husky 钩子不触发

**问题现象**：执行git commit时，未触发 commitlint 验证。

**可能原因与解决**：

1. husky 未启用：执行 npm run prepare 重新启用。
2. Git 钩子路径错误：检查 .git/hooks 目录下是否有 husky 的软链接（正常情况下应为软链接指向.husky目录）。
3. Node.js 环境问题：确保终端使用的 Node.js 版本与项目依赖兼容（可通过nvm use切换版本）。

### 5.2 commitlint 规则不生效

**问题现象**：提交不符合规则的信息时，未报错。

**可能原因与解决**：

1. 配置文件路径错误：commitlint 配置文件需放在项目根目录，且文件名正确（如.commitlintrc.js）。
2. 规则错误级别设置为 0：检查规则数组第一个参数是否为 2（如'type-enum': [2, 'always', [...]]）。
3. 依赖版本不兼容：确保@commitlint/cli与@commitlint/config-conventional版本一致（建议同时升级到最新版）。

### 5.3 特殊场景需要跳过验证

**问题现象**：紧急修复时需快速提交，暂时跳过验证。

**解决方案**：使用 Git 的--no-verify参数跳过所有钩子：

```
git commit -m "fix: 紧急修复生产环境白屏问题" --no-verify
```

> 注意：仅在紧急情况下使用，后续需补充规范的提交信息。