---
title: Codex Desktop gpt-5.5调用失败解决方案
tags:
  - 文章
  - Codex
  - 故障排查
  - AI工具
  - 解决方案
categories:
  - 文章
series: 文章
abbrlink:
date: 2026-06-29
---

## 一、遇到问题

今天在使用 **Codex Desktop 0.142.2** 时，发现一个非常令人困扰的问题：当我切换到 **gpt-5.5** 模型时，每次发送请求都会立即失败，错误信息是：

```
This model is not supported when using X-OpenAI-Internal-Codex-Responses-Lite.
```

具体表现就是：
- 在 Windows 上打开 Codex Desktop，进入某个线程
- 切换模型到 gpt-5.5
- 发送任何提示词，请求都会立刻失败
- 没有任何助手回复产生

最奇怪的是，同一台机器上的 **gpt-5.4** 模型完全正常，而且就在同一天稍早的时候，gpt-5.5 在其他线程里还正常工作过。这说明不是简单的配置问题，而是某个动态变化导致的。

## 二、我的排查过程

### 2.1 从错误信息入手

看到这个错误信息，我首先注意到了 **X-OpenAI-Internal-Codex-Responses-Lite** 这个 HTTP 头。从命名来看，这应该是一种"轻量级响应模式"。

问题很明显：Codex 在请求时发送了这个 Lite 头，但 gpt-5.5 的后端不支持这种模式。

既然之前 gpt-5.5 是正常的，那为什么突然不行了？我想到了几种可能性：
1. 服务器端对 gpt-5.5 的路由做了调整
2. Codex 的某个配置文件被更新，启用了 Lite 模式
3. 模型缓存文件中的配置发生了变化

我检查了本地会话文件，发现记录的模型确实是 gpt-5.5，但 `last_agent_message` 是 null，说明请求确实发出去了，但被服务器拒绝了。

### 2.2 找到问题根源

既然错误信息提到了 `X-OpenAI-Internal-Codex-Responses-Lite`，那客户端肯定有个配置项控制这个行为。我开始搜索 Codex 的配置文件。

首先想到的是 Codex 的数据目录。在 Windows 上，用户数据通常存放在 `C:\Users\<用户名>\.codex\` 目录下。我打开这个目录，发现里面有一个 `model_cache.json` 文件。

打开一看，果然找到了关键配置：

```json
"use_responses_lite": true
```

这就是问题所在。当这个值为 true 时，Codex 会使用轻量级响应模式，但 gpt-5.5 不支持这种模式。

## 三、解决方案

### 3.1 修改 model_cache.json

**解决步骤：**

1. 关闭 Codex Desktop
2. 打开文件资源管理器，导航到：
   ```
   C:\Users\<你的用户名>\.codex\
   ```
3. 找到并编辑 `model_cache.json` 文件
4. 将 `"use_responses_lite": true` 改为 `"use_responses_lite": false`
5. 保存文件并重新启动 Codex Desktop

### 3.2 我的操作过程

我的用户名为 `zcx`，所以完整路径是：

```
C:\Users\zcx\.codex\model_cache.json
```

原始文件中 gpt-5.5 的配置：

```json
"gpt-5.5": {
  "use_responses_lite": true,
  "capabilities": {...}
}
```

修改后：

```json
"gpt-5.5": {
  "use_responses_lite": false,
  "capabilities": {...}
}
```

验证修改是否生效：

```powershell
(Get-Content "$env:USERPROFILE\.codex\model_cache.json" -Raw) -match '"use_responses_lite":\s*false'
```

运行结果：

```
True
```

### 3.3 验证解决方案

修改完成后，我重新启动了 Codex Desktop：

1. 打开 Codex Desktop
2. 选择 gpt-5.5 模型
3. 发送测试提示词：
   ```
   1+11
   ```
4. 收到了助手回复22，问题解决！

## 四、我的思考

### 4.1 为什么 gpt-5.4 可以正常工作

既然 gpt-5.4 在同一台机器上可以正常使用，说明 Responses-Lite 模式对 gpt-5.4 是支持的。问题确实只出在 gpt-5.5 的路由配置上，服务器端可能只更新了 gpt-5.5 的路由，而没有更新 gpt-5.4 的。

### 4.2 为什么配置会突然变化

既然之前 gpt-5.5 是正常工作的，那为什么配置会突然变成 true？我想到了几种可能：

1. **Codex 更新**：应用程序自动更新时，`model_cache.json` 被重置或覆盖
2. **后台同步**：Codex 从服务器同步模型配置，覆盖了本地设置
3. **缓存刷新**：模型缓存过期后重新下载，新配置启用了 Lite 模式

不管是哪种原因，这个问题给我提了个醒：当遇到新功能或新版本模型出现问题时，配置文件往往是排查的重点。

## 五、我的预防措施

### 5.1 备份配置文件

为了防止配置丢失，我决定定期备份 `model_cache.json` 文件：

```powershell
# 创建备份
Copy-Item "$env:USERPROFILE\.codex\model_cache.json" "$env:USERPROFILE\.codex\model_cache.json.backup"
```

运行结果：

```
已复制 1 个文件。
```

```powershell
# 恢复备份
Copy-Item "$env:USERPROFILE\.codex\model_cache.json.backup" "$env:USERPROFILE\.codex\model_cache.json"
```

运行结果：

```
已复制 1 个文件。
```

### 5.2 监控配置变化

我打算用文件监控工具来追踪 `model_cache.json` 的变化，及时发现配置被覆盖的情况。这样下次再遇到类似问题时，就能更快定位原因。

### 5.3 及时更新应用

虽然这次是更新导致的问题，但保持应用最新版本仍然是最佳实践。后续版本可能会修复这个兼容性问题。

## 六、总结

经过这次排查，我发现问题的本质是 **配置不兼容**：Codex Desktop 的 `use_responses_lite` 配置启用了轻量级响应模式，但 gpt-5.5 模型的后端路由不支持这种模式。

**解决方案非常简单**：在 `model_cache.json` 文件中将 `"use_responses_lite": true` 改为 `"use_responses_lite": false`，即可恢复 gpt-5.5 的正常使用。

这次经历给了我几个启发：
1. **错误信息是最好的线索**：仔细阅读错误信息，往往能直接指向问题根源
2. **配置文件是排查重点**：很多应用问题都与配置有关，尤其是缓存配置
3. **版本兼容性是关键**：新版本模型可能需要新的配置或路由支持

如果你也遇到了类似问题，不妨检查一下 `model_cache.json` 文件中的 `use_responses_lite` 配置。如果问题仍然存在，欢迎在评论区留言讨论。
