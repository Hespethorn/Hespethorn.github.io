---
title: Netty 源码研读 Phase0：准备环境、拉取源码与跑通 echo
date: 2025-08-21
categories: [Source-Reading, Netty]
tags: [Netty, 源码阅读, Java, NIO, Maven, IDEA]
series: [Netty]
abbrlink: nety0101
---

你下定决心读 Netty 源码，兴冲冲 clone 下来、打开 IDE——然后卡住三连：clone 哪个版本？为什么满屏模块不知道 import 哪个？官方那个 echo 例子到底怎么跑起来？本文把这套地基一次铺平，让你后面 30 篇能直接点进源码、能跑、能对照。

> 本文所有命令与现象均经过实跑验证：源码在沙箱（JDK 17）编译跑通 echo，并在读者本机（Windows + IntelliJ + Microsoft Build of OpenJDK 11.0.32）完整复现——包括下文列出的每一处编译/运行坑。

## 一、Phase0 是地基，不是源码分析

- **是什么**：Phase0 不分析任何 Netty 内部机制，只解决一件事——**环境就位**：版本锁定、IDE 能跳转、最小例子能跑。
- **坑**：很多人一上来就读 `ChannelPipeline` 源码，结果连代码都没 clone 对版本，类名对不上、行号对不上，越读越像在背天书。
- **本质一句话**：读源码的前提是"源码在你机器上能点得进去、能跑起来"，否则全是脑补。

## 二、锁定版本：为什么是 netty-4.1.110.Final

- **是什么**：Netty 有两条大线——`4.1`（长期主线，生产首选）和 `5`（官方已废弃，不跟）。本系列锁 `4.1` 的稳定 tag `netty-4.1.110.Final`。
- **坑**：Netty 的 `main` 分支每天都在变，类名和方法行号会漂移；今天文章写"第 66 行 `b.bind()`"，过两个月可能对到别的实现上。
- **本质一句话**：**读源码必须锁死一个 tag**，文章贴的行号才可复现、可对照。
- **怎么拉**（浅克隆，省空间，读源码不需要完整提交历史）：

```bash
git clone --depth 1 --branch netty-4.1.110.Final https://github.com/netty/netty.git
```

> 注：若本机 GitHub 直连受限（写作环境即如此），可用 Gitee 镜像 `https://gitee.com/mirrors/netty.git` 的**同名 tag** 拉取，内容与官方一致。克隆完成后 `git describe --tags` 应显示 `netty-4.1.110.Final`。

## 三、仓库结构：你要读的代码在哪

Netty 是典型的 **Maven 多模块**工程，根目录一个 `pom.xml` 统管 20+ 模块。看清模块分工，才知道后面每篇钻哪。

<div align="center">

<svg viewBox="0 0 680 300" width="100%" role="img">
  <title>Netty 4.1.110 模块结构</title>
  <desc>根 pom 统管多模块：common/buffer/transport/codec*/handler 是核心源码，example 是运行例子。transport/buffer/example 为本系列重点阅读。</desc>
  <rect x="30" y="20" width="620" height="250" rx="16" fill="#F3F4FB" stroke="#534AB7" stroke-width="1"/>
  <text x="50" y="48" font-family="sans-serif" font-size="14" font-weight="500" fill="#26215C">Netty 4.1.110.Final（根 pom.xml · Maven 多模块）</text>
  <g>
    <rect x="60" y="80" width="170" height="60" rx="10" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.8"/>
    <text x="145" y="108" font-family="sans-serif" font-size="14" font-weight="500" fill="#04342C" text-anchor="middle">common</text>
    <text x="145" y="126" font-family="sans-serif" font-size="12" fill="#0F6E56" text-anchor="middle">基础工具/抽象</text>
  </g>
  <g>
    <rect x="255" y="80" width="170" height="60" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.8"/>
    <text x="340" y="108" font-family="sans-serif" font-size="14" font-weight="500" fill="#412402" text-anchor="middle">buffer</text>
    <text x="340" y="126" font-family="sans-serif" font-size="12" fill="#854F0B" text-anchor="middle">ByteBuf ★</text>
  </g>
  <g>
    <rect x="450" y="80" width="170" height="60" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="1.2"/>
    <text x="535" y="108" font-family="sans-serif" font-size="14" font-weight="500" fill="#042C53" text-anchor="middle">transport</text>
    <text x="535" y="126" font-family="sans-serif" font-size="12" fill="#185FA5" text-anchor="middle">Channel/EventLoop ★</text>
  </g>
  <g>
    <rect x="60" y="160" width="170" height="60" rx="10" fill="#F1EFE8" stroke="#B4B2A9" stroke-width="0.5"/>
    <text x="145" y="188" font-family="sans-serif" font-size="14" font-weight="500" fill="#2C2C2A" text-anchor="middle">codec*</text>
    <text x="145" y="206" font-family="sans-serif" font-size="12" fill="#5F5E5A" text-anchor="middle">编解码器</text>
  </g>
  <g>
    <rect x="255" y="160" width="170" height="60" rx="10" fill="#F1EFE8" stroke="#B4B2A9" stroke-width="0.5"/>
    <text x="340" y="188" font-family="sans-serif" font-size="14" font-weight="500" fill="#2C2C2A" text-anchor="middle">handler</text>
    <text x="340" y="206" font-family="sans-serif" font-size="12" fill="#5F5E5A" text-anchor="middle">SSL/超时等</text>
  </g>
  <g>
    <rect x="450" y="160" width="170" height="60" rx="10" fill="#EEEDFE" stroke="#534AB7" stroke-width="1.2"/>
    <text x="535" y="188" font-family="sans-serif" font-size="14" font-weight="500" fill="#26215C" text-anchor="middle">example</text>
    <text x="535" y="206" font-family="sans-serif" font-size="12" fill="#534AB7" text-anchor="middle">跑例子(echo) ★</text>
  </g>
  <text x="50" y="252" font-family="sans-serif" font-size="12" fill="#5F5E5A">★ = 本系列重点阅读模块。导入根 pom 即可一次拿到全部模块与依赖。</text>
</svg>

</div>

- **`common`**：基础工具与抽象（`io.netty.util`、引用计数、`InternalThreadLocal` 等）。注意它 `pom.xml` 里把 `maven.compiler.target` 写死为 `1.6`（最大兼容老 JVM）——这是后面 IDEA 编译坑的元凶，见第五节。
- **`buffer`**：`ByteBuf` 体系（Phase5 重点）。
- **`transport`**：核心传输层——`Channel` / `EventLoop` / `Unsafe`（Phase2–3 重点）。
- **`codec*`**：各类编解码器（`http`/`http2`/`mqtt`/`redis`…，Phase6 重点）。
- **`handler`**：通用 `ChannelHandler`（SSL、空闲检测、日志等）。
- **`example`**：可运行例子集合，本文的 echo 就在这里。

- **坑**：新手只 `Open` 某个子模块目录，结果依赖不全、符号全红。**必须导入根 pom 整个工程**。
- **本质一句话**：根 pom 一次导入，全部模块与依赖就位，点哪个类都能跳转。

## 四、IDE 导入：以 Maven 工程打开根 pom

- **是什么**：用 IntelliJ IDEA（Community 版即可）把仓库当作 Maven 项目导入。
- **步骤**：`File → Open` → 选中仓库**根目录**（里面有 `pom.xml`）→ 选择"作为 Project 打开" → 等待 Maven 依赖解析完成（首次会下载一阵）。
- **关键预警**：导入后 IDEA 会按各模块 `pom.xml` 的 `maven.compiler` 来定语言级别，而 `netty-common` 是 `target=1.6`，会把一部分模块压到 language level 6。所以**导入后务必按第五节把 Project SDK 与所有模块的 Language level 都设成 8/11**，否则后面一片红。
- **本质一句话**：导入根 pom = 一次性拿到全部模块与依赖，源码随便跳。

## 五、本机环境约定（实跑验证，不是想当然）

翻根 `pom.xml`，主线 `maven.compiler.source/target = 1.8`；但 `netty-common` 模块为了最大兼容老 JVM，单独把 `maven.compiler.target` 设成了 **`1.6`**。别小看这一行——它是 IDEA 全模块导入时几乎所有编译报错的源头。

### 5.1 JDK 版本：必须 8 或 11，不能用 12+

`java.nio.file` 是 Java 7 的 API，而 `-target 6` 在 **JDK 12 起被 javac 彻底移除支持**（报"无法编译为 JVM 目标 6"）。因此：

| 你选的 JDK | 结果 |
|------|------|
| JDK 8 / 9 / 10 / **11** | ✅ 支持 `-target 1.6`，可编译全部模块 |
| JDK 17 / 21 / **26** 等 12+ | ❌ 报 `无法编译为 JVM 目标 6`（netty-common 模块） |

> 实测：读者本机最初用 Oracle OpenJDK 26，IDEA 直接报 `java: 无法编译为 JVM 目标 6 配置的模块 'netty-common'`；换成 **Microsoft Build of OpenJDK 11.0.32**（IDEA 自带 Download JDK 即可获取）后编译通过。本系列推荐 **JDK 11**。

### 5.2 IDEA 导入后必做三件事（否则满屏红）

1. **Project SDK = JDK 11**：`File → Project Structure → Project → SDK` 选 11（没有就 `Add SDK → Download JDK` 选 11）。
2. **所有模块 Language level 同步到 8/11**：`Project Structure → Modules` 左侧 `Ctrl+A` 全选 → `Sources` 标签 → Language level 设 8 或 11。**光换 SDK 不够**——`netty-common` 的 `target=1.6` 会把它的 language level 压到 6，于是 `transport` 等用到 `java.nio.file`（Java 7 API）的模块就报 `程序包 java.nio.file 不存在`；连 `netty-common` 自己若被压到 6，下游还会报 `io.netty.util.collection 不存在`。这两个错都是 language level 没拉齐的连锁反应。
3. **模块依赖要接上**：`Maven` 工具窗右键根 `pom.xml` → **Reload Project**，让 IDEA 重建 module-to-module 依赖图；再 **Build → Rebuild Project** 按依赖顺序全量编译（common 先出 `classes`，下游才找得到）。若仍报 `io.netty.*`（netty 自身类）不存在，就是 common 没产出 classes 或依赖没接——Reload + Rebuild 基本能解。

| 项目 | 要求 | 说明 |
|------|------|------|
| JDK | **8 或 11（必须 ≤11）** | 12+ 因 netty-common 的 target=1.6 直接报错 |
| Language level | 所有模块统一 8/11 | 不能留 6，否则 java.nio.file / io.netty.util.collection 报不存在 |
| 构建 | 仓库自带 `mvnw` / `mvnw.cmd` | 优先用包装器，免装 Maven；也可本机装 Maven 3.6+ |
| IDE | IntelliJ IDEA（Community 足够） | 本文以 IDEA 为例 |
| 源码版本 | netty-4.1.110.Final | 已浅克隆并锁定 |

## 六、跑通 echo：最小可运行标本

- **是什么**：`echo` 是 Netty 官方最简例子——服务端收到什么字节，原样回显给客户端。它是理解 `Channel` / `Pipeline` / `EventLoop` 的**最小标本**，一条链路把后面要讲的核心组件全亮了相。
- **真实路径**（已核对）：`example/src/main/java/io/netty/example/echo/`
  - `EchoServer.java` / `EchoServerHandler.java`
  - `EchoClient.java` / `EchoClientHandler.java`
- **怎么启动**（推荐方式 A；想用命令行见方式 B）：
  - **方式 A（IDEA Run，已在本机实测跑通）**：先按第五节设好 JDK 11 + Language level 8/11 并 Rebuild；然后右键 `EchoServer` 的 `main()` → `Run`，再右键 `EchoClient` 的 `main()` → `Run`。服务端控制台会打印 `BIND: 0.0.0.0/0.0.0.0:8007` / `ACTIVE`，即成功。
  - **方式 B（命令行，需本机装 Maven）**：在**仓库根目录的 Git Bash** 里执行 `./run-example.sh echo-server`（脚本会 `cd example` 后调用 `mvn exec:exec`，自动带上正确主类）；客户端同理 `./run-example.sh echo-client`。

> **⚠️ Windows 命令行踩坑实录（实跑验证，共 5 条）**
> 1. **`.sh` 别在 PowerShell/双击跑**：Windows 可能把 `.sh` 关联到 Node，会掉进 Node REPL（看到 `Welcome to Node.js`）；必须 `bash run-example.sh echo-server` 显式用 Git Bash 执行。
> 2. **`mvnw.cmd` 会把 `-DexampleClass=全限定名` 的 `=` 拆掉**：PowerShell/CMD 里手敲 `mvnw.cmd ... -DexampleClass=io.netty...` 时，Windows 把 `=` 当分隔符，Maven 收不到类名（报"找不到或无法加载主类"且类名为空）。命令行务必走 **Git Bash + 已安装的 `mvn`**（即方式 B），别在 PowerShell 手敲 `mvnw.cmd` 带 `-D类名`。
> 3. **PowerShell 跑 `mvnw.cmd` 须加 `.\` 前缀**：PowerShell 默认不从当前目录加载命令，直接 `mvnw.cmd` 会报"无法将…识别为 cmdlet"；要 `.\mvnw.cmd …`。
> 4. **WSL 里 `./mvnw` 报 `^M: bad interpreter`**：克隆的 `mvnw` 是 CRLF，Linux 读 shebang 失败；`sed -i 's/\r$//' mvnw` 去回车即可（且 WSL 需另配 JDK）。
> 5. **根目录直接 `mvnw exec:exec` 会失败**：`exec:exec` 会套到所有模块，`netty-dev-tools` 等模块缺 `executable` 配置而报错；必须先 `cd example`（正是 `run-example.sh` 的做法）。
>
> 结论：**想省事用法 A（IDEA Run）；想走命令行就 Git Bash + 装好的 Maven + `./run-example.sh`，别在 PowerShell 里手敲 `mvnw.cmd` 带 `-D类名`。**

### 6.1 "看不到回显"是正常的——别误判没跑通

这是最容易让人以为"没跑通"的点，务必看清：

- 官方 `EchoClientHandler.channelRead` **只有 `ctx.write(msg)`（把收到的回显再写回服务器），没有任何打印语句**；且 `EchoClient.java` 里客户端的 `LoggingHandler` **默认被注释掉**。所以客户端控制台本来就是空的——"没回显"是 example 的**正常设计**，不代表链路断了。
- 服务端日志里 `BIND / ACTIVE` 加上 `READ: ... R:/127.0.0.1:<客户端端口>` 表示客户端已连上，这就是跑通的证据。
- **想真正"看到"回显**，给客户端加上日志即可：把 `EchoClient.java` 第 60 行的注释 `//p.addLast(new LoggingHandler(LogLevel.INFO));` 去掉，并在文件头部补两行 import：
  ```java
  import io.netty.handler.logging.LoggingHandler;
  import io.netty.handler.logging.LogLevel;
  ```
  重新 Run `EchoClient`，窗口会刷出 `WRITE: 256B` / `READ` / `FLUSH` 事件（默认发的是 0x00–0xFF 共 256 字节二进制，不是明文字符串），证明数据在原样往返。
- **日志"不停"也是正常的**：因为客户端 `channelRead` 收到回显后又 `ctx.write` 写回服务器，服务器再回显，客户端再写回……形成**无限 ping-pong**。点 Run 窗口的红色方块（Stop）即可停止。

**真实片段**（`EchoServer.java` 第 35–66 行，已贴行号）：

```java
public final class EchoServer {
    static final int PORT = Integer.parseInt(System.getProperty("port", "8007")); // 默认 8007
    public static void main(String[] args) throws Exception {
        final SslContext sslCtx = ServerUtil.buildSslContext();
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);   // 第 44 行：接收连接
        EventLoopGroup workerGroup = new NioEventLoopGroup();  // 第 45 行：处理已连接通道
        final EchoServerHandler serverHandler = new EchoServerHandler();
        try {
            ServerBootstrap b = new ServerBootstrap();          // 第 48 行
            b.group(bossGroup, workerGroup)
             .channel(NioServerSocketChannel.class)             // 第 50 行
             .option(ChannelOption.SO_BACKLOG, 100)
             .handler(new LoggingHandler(LogLevel.INFO))
             .childHandler(new ChannelInitializer<SocketChannel>() { /* 挂 Handler */ });
            ChannelFuture f = b.bind(PORT).sync();              // 第 66 行：绑定并阻塞等待
            f.channel().closeFuture().sync();
        } finally { ... }
    }
}
```

<div align="center">

<svg viewBox="0 0 680 170" width="100%" role="img">
  <title>echo 启动与回显流程</title>
  <desc>启动 EchoServer(bind 8007) → 启动 EchoClient(连 8007) → 服务端读字节原样写回 → 客户端收到后又写回服务端，形成无限 ping-pong。</desc>
  <defs>
    <marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <g>
    <rect x="30" y="55" width="145" height="56" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.8"/>
    <text x="102" y="79" font-family="sans-serif" font-size="13" font-weight="500" fill="#042C53" text-anchor="middle">EchoServer</text>
    <text x="102" y="97" font-family="sans-serif" font-size="12" fill="#185FA5" text-anchor="middle">bind(8007)</text>
  </g>
  <line x1="175" y1="83" x2="200" y2="83" stroke="#5F5E5A" stroke-width="1.5" marker-end="url(#ar2)"/>
  <g>
    <rect x="200" y="55" width="145" height="56" rx="10" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.8"/>
    <text x="272" y="79" font-family="sans-serif" font-size="13" font-weight="500" fill="#04342C" text-anchor="middle">EchoClient</text>
    <text x="272" y="97" font-family="sans-serif" font-size="12" fill="#0F6E56" text-anchor="middle">connect 8007</text>
  </g>
  <line x1="345" y1="83" x2="370" y2="83" stroke="#5F5E5A" stroke-width="1.5" marker-end="url(#ar2)"/>
  <g>
    <rect x="370" y="55" width="160" height="56" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.8"/>
    <text x="450" y="79" font-family="sans-serif" font-size="13" font-weight="500" fill="#412402" text-anchor="middle">服务端</text>
    <text x="450" y="97" font-family="sans-serif" font-size="12" fill="#854F0B" text-anchor="middle">read → 原样 write</text>
  </g>
  <line x1="530" y1="83" x2="548" y2="83" stroke="#5F5E5A" stroke-width="1.5" marker-end="url(#ar2)"/>
  <g>
    <rect x="548" y="55" width="120" height="56" rx="10" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.8"/>
    <text x="608" y="79" font-family="sans-serif" font-size="13" font-weight="500" fill="#26215C" text-anchor="middle">客户端</text>
    <text x="608" y="97" font-family="sans-serif" font-size="12" fill="#534AB7" text-anchor="middle">收到回显</text>
  </g>
  <text x="30" y="148" font-family="sans-serif" font-size="12" fill="#5F5E5A">客户端收到后又写回服务端 → 无限 ping-pong（日志会不停刷 WRITE/READ）。一条链路把 ServerBootstrap / EventLoopGroup / Channel / Pipeline / Handler 全亮了相。</text>
</svg>

</div>

- **坑**：① echo 默认监听 `8007`，别和本机其他服务抢端口（可用 `-Dport=xxxx` 改）；② `ServerUtil.buildSslContext()` 那段 SSL 是自签可选配置，不影响回显主逻辑，初读可忽略；③ 客户端不打印回显、且日志不停，是例子设计，不是 bug（见 6.1）。
- **本质一句话**：`bind → accept → read → write` 一条链路，把 `ServerBootstrap` / `EventLoopGroup` / `Channel` / `Pipeline` / `Handler` 一次性摆在你眼前。

## 七、本系列读法约定

为避免"读完还是串不起来"，全系列统一读法：

1. **先骨架后血肉**：Phase0/1 看全景（架构 + 启动流程），再下钻 Phase3–5（事件循环 / Pipeline / 内存），最后 Phase7 把读/写/连接主链路串一遍、Phase8 收口。
2. **每篇固定结构**：开场钩子 →「是什么 / 坑 / 本质一句话」→ 真实源码片段 + 行号 → 可运行 demo → 裸内联 SVG 图 → 对比小结。
3. **两条铁律**：图一律用**裸内联 SVG**（不写 ASCII 图）；文章内**不预测下一篇**——每篇自成一体。

## 八、小结

Phase0 结束时，你应该已经：

- ✅ 源码锁在 `netty-4.1.110.Final`，`git describe --tags` 可验证；
- ✅ IDEA 以 Maven 工程导入根 pom，**Project SDK = JDK 11、所有模块 Language level = 8/11、模块依赖已接**（否则会卡在 target 1.6 / java.nio.file / io.netty.util.collection 三连报错）；
- ✅ `EchoServer` 跑起来打印 `BIND 8007` / `ACTIVE`，`EchoClient` 连上后数据在 ping-pong 往返（想看回显就给客户端加 `LoggingHandler` + 两行 import）。

地基就位，后面就能安心逐行走读了。
