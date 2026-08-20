---
title: Linux service 与 systemd
tags:
  - Linux
  - systemd
  - Service
  - OS
categories: [Linux, Internals]
series: Internals
abbrlink: 5ab37a67
date: 2025-11-23
---

在 Linux 系统运维与开发中，服务管理是核心基础能力之一。从早期的 SysV init 到如今主流的 systemd，服务管理机制经历了颠覆性的变革。作为工程师，理解二者的设计差异、systemd 的核心架构以及其与内核的交互逻辑，不仅能提升日常运维效率，更能在服务调优、故障排查中直击本质。

## 一、从 SysV init 到 systemd：服务管理的演进逻辑

在 systemd 普及之前，Linux 系统普遍采用 SysV init 作为初始化系统（PID 1），其核心是基于脚本的串行启动机制。每个服务对应 `/etc/init.d/` 目录下的一个 Shell 脚本，启动顺序由 `/etc/rc*.d/` 中的符号链接优先级（如 S01xxx、S99xxx）决定。这种设计简单直观，但存在三个致命缺陷：

- **串行启动效率低**：服务按顺序逐一启动，即使服务间无依赖关系，也需等待前一个服务启动完成，导致系统启动耗时过长；
- **依赖管理简陋**：依赖关系需通过脚本内的逻辑或启动优先级手动维护，易出现依赖缺失或顺序错乱问题；
- **监控与控制能力弱**：对服务的运行状态监控、异常重启、资源限制等支持不足，需依赖第三方工具（如 monit）。

为解决这些问题，systemd 应运而生。它并非对 SysV init 的简单改进，而是一套全新的系统与服务管理器，核心目标是“提高系统启动效率、增强服务管理的可靠性与灵活性”，其设计哲学完全颠覆了传统的串行初始化思路。

## 二、systemd 的核心设计哲学

systemd 的设计围绕“并行化、模块化、精细化”三大核心，通过三大核心机制实现：并行启动、依赖图、Unit 体系。三者相互支撑，构成了 systemd 服务管理的基石。

### 2.1 并行启动：突破串行瓶颈

systemd 最直观的优势是并行启动无依赖关系的服务。与 SysV init 按顺序执行脚本不同，systemd 在系统启动初期便解析所有服务的依赖关系，对于无依赖或依赖已满足的服务，同时启动多个进程，极大缩短了系统启动时间。

示例 ASCII 图：SysV init 与 systemd 启动流程对比

```text
# SysV init 串行启动
启动顺序：内核 → init(PID1) → rc.sysinit → S01network → S02sshd → S03nginx → ... → 登录界面
耗时：T1(network) + T2(sshd) + T3(nginx) + ...

# systemd 并行启动（无依赖服务）
启动逻辑：内核 → systemd(PID1) → 解析依赖 → 同时启动 network、sshd、nginx（无依赖）
耗时：max(T1, T2, T3) + 解析依赖时间
```

### 2.2 依赖图：理清服务间的“爱恨情仇”

并行启动的前提是清晰的依赖关系管理。systemd 通过“依赖图”模型描述服务间的依赖（如 A 服务需在 B 服务启动后启动）、冲突（如 A 服务与 B 服务不能同时运行）等关系。依赖图由服务的配置参数（如 After、Requires、Conflicts 等）构建，systemd 启动时先遍历所有配置，生成一张完整的依赖关系图，再基于该图调度服务启动顺序。

示例 ASCII 图：systemd 依赖图简化模型

```text
┌───────────┐     ┌───────────┐     ┌───────────┐
│  db.service  │ ←─ │  app.service │ ←─ │  nginx.service │
└───────────┘     └───────────┘     └───────────┘
       ↑                                     ↑
       │                                     │
┌───────────┐                             ┌───────────┐
│network.service│ ←───────────────────── │  firewalld.service│
└───────────┘                             └───────────┘
说明：
- app.service 依赖 db.service（Requires），且在 db 之后启动（After）
- nginx.service 依赖 app.service
- network.service 是 db、nginx 的间接依赖
- 无依赖的服务（如 chronyd.service）可与上述服务并行启动
```

### 2.3 Unit 体系：模块化管理所有系统资源

systemd 引入“Unit”概念，将系统中的服务、设备、挂载点、定时器等所有资源统一抽象为 Unit，每个 Unit 对应一个配置文件（后缀为 `.service`、`.device`、`.mount` 等），存放于 `/usr/lib/systemd/system/`（系统默认）或 `/etc/systemd/system/`（用户自定义）目录。

Unit 体系的核心优势是“统一管理”——无论管理的是服务（.service）、磁盘挂载（.mount）还是定时任务（.timer），都可通过统一的 `systemctl` 命令操作（如 start、stop、status），简化了资源管理的复杂度。其中，`.service` 是最常用的 Unit 类型，对应传统的“服务”。

常见 Unit 类型及用途：

| Unit 类型  | 后缀     | 用途                                            |
| :--------- | :------- | :---------------------------------------------- |
| 服务单元   | .service | 管理系统服务（如 nginx、sshd）                  |
| 设备单元   | .device  | 管理硬件设备（如 /dev/sda1）                    |
| 挂载单元   | .mount   | 管理文件系统挂载（如 /mnt/data）                |
| 定时器单元 | .timer   | 替代 crontab，管理定时任务                      |
| 目标单元   | .target  | 分组 Unit，实现运行级别（如 multi-user.target） |

## 三、服务管理在内核中的运转：PID 1 与 cgroups

systemd 作为系统初始化进程，其核心角色是 PID 1——内核启动后创建的第一个用户态进程，所有其他用户态进程都是它的子进程或后代进程。systemd 正是通过 PID 1 的“父进程”身份，结合 Linux 内核的 cgroups 机制，实现对服务的生命周期管理和资源控制。

### 3.1 PID 1 的核心职责

PID 1 是系统的“进程鼻祖”，其核心职责包括：

- **启动与管理子进程**：启动所有核心服务（如 network、sshd），并监控其运行状态；
- **回收僵尸进程（Zombie Process）**：当子进程退出后，若父进程未及时回收，会变成僵尸进程。PID 1 会主动回收所有无人认领的僵尸进程，避免资源泄漏；
- **处理信号传递**：接收内核或用户发送的信号（如 SIGTERM、SIGKILL），并转发给对应的子进程，实现服务的停止、重启等操作。

示例 ASCII 图：PID 1 与子进程关系

```text
内核
  ↓
systemd (PID 1)
  ├─ sshd (PID 100)
  │   └─ sshd: user@pts/0 (PID 200)
  ├─ nginx (PID 101)
  │   ├─ nginx: master process (PID 101)
  │   └─ nginx: worker process (PID 102)
  ├─ db (PID 103)
  └─ chronyd (PID 104)
```

### 3.2 cgroups：服务的资源“枷锁”

cgroups（Control Groups）是 Linux 内核提供的资源限制机制，可对进程组的 CPU、内存、IO、网络等资源进行精细化控制。systemd 深度集成 cgroups，每个 Unit（尤其是 .service）都会对应一个独立的 cgroup 目录（默认位于 `/sys/fs/cgroup/` 下），通过该目录下的内核接口配置资源限制。

systemd 利用 cgroups 实现的核心功能：

- **资源限制**：为服务分配固定的 CPU 配额、内存上限（如限制 nginx 最多使用 1GB 内存）；
- **进程组管理**：服务的所有子进程会自动加入该服务的 cgroup，即使子进程 fork 新进程，也不会脱离控制，实现“一锅端”式的生命周期管理（如停止服务时，杀死 cgroup 内的所有进程）；
- **资源使用监控**：通过 cgroup 目录下的 `cpuacct.usage`、`memory.usage_in_bytes` 等文件，实时获取服务的资源使用情况，为 `systemctl status` 命令提供数据支撑。

示例：nginx.service 对应的 cgroup 目录结构（简化）

```text
/sys/fs/cgroup/
  ├─ system.slice/
  │   └─ nginx.service/  # nginx 服务的 cgroup 目录
  │       ├─ cpu.acct.usage  # CPU 使用总量
  │       ├─ memory.limit_in_bytes  # 内存上限
  │       ├─ tasks  # 该 cgroup 内的所有进程 PID
  │       └─ ...
```

## 四、为什么 systemd 比 SysV init 更快？

systemd 的启动速度远超 SysV init，核心原因并非单一优化，而是“并行启动、依赖预解析、减少 Shell 脚本开销、核心服务异步启动”四大机制的协同作用，具体可拆解为以下几点：

### 4.1 并行启动无依赖服务（核心原因）

如前文所述，SysV init 采用串行启动，即使服务间无依赖，也需按优先级顺序逐一执行；而 systemd 通过依赖图解析，同时启动所有无依赖或依赖已满足的服务，将启动时间从“所有服务耗时之和”缩短为“耗时最长的服务耗时 + 依赖解析时间”。对于包含数十个服务的系统，这种优化带来的提升极为显著。

### 4.2 预解析依赖，避免运行时阻塞

systemd 在启动初期（加载 Unit 配置文件时）便完成所有依赖关系的解析，生成依赖图；而 SysV init 的依赖关系需在脚本运行时通过逻辑判断（如 `if [ -f /var/run/network.pid ]`）实现，易出现运行时阻塞（如等待某个文件生成）。预解析机制避免了运行时的条件判断开销，进一步提升启动效率。

### 4.3 减少 Shell 脚本开销

SysV init 的服务脚本是 Shell 脚本，执行时需启动 Shell 进程（如 /bin/bash），且脚本内的命令需逐行解释执行，开销较大；而 systemd 的 Unit 配置文件是静态配置（INI 格式），无需启动 Shell 进程，直接由 systemd 进程解析执行，减少了进程创建和命令解释的开销。

### 4.4 核心服务异步启动，非关键服务延迟启动

systemd 支持“异步启动”——对于无需等待用户交互的核心服务（如 network、sshd），启动时不阻塞后续服务的并行启动；同时，可通过 `OnBootSec` 等参数设置非关键服务（如日志归档、软件更新）在系统启动一段时间后延迟启动，进一步缩短核心服务的启动耗时。

## 五、服务依赖解析：After、Wants、Requires 的区别与实践

服务依赖是 systemd 管理的核心，而 `After`、`Wants`、`Requires` 是 `.service` 配置文件中最常用的三个依赖参数，三者功能不同，组合使用可实现精细化的依赖控制。很多工程师容易混淆这三个参数，核心是要区分“启动顺序”和“依赖必要性”两个维度。

### 5.1 核心参数定义与区别

| 参数     | 核心作用     | 依赖必要性                       | 启动顺序                                             | 异常处理                                                     |
| :------- | :----------- | :------------------------------- | :--------------------------------------------------- | :----------------------------------------------------------- |
| After    | 定义启动顺序 | 无依赖关系，仅管顺序             | 当前服务在指定服务之后启动                           | 指定服务启动失败，不影响当前服务                             |
| Wants    | 定义“弱依赖” | 依赖服务是“期望”启动的，但非必需 | 默认当前服务在依赖服务之后启动（可通过 Before 覆盖） | 依赖服务启动失败，当前服务仍正常启动                         |
| Requires | 定义“强依赖” | 依赖服务是必需的，缺一不可       | 默认当前服务在依赖服务之后启动                       | 依赖服务启动失败，当前服务也会启动失败；依赖服务停止，当前服务也会被停止 |

### 5.2 实践组合示例

假设我们有一个 Web 应用服务（app.service），依赖数据库服务（db.service）和网络服务（network.service），且希望：

- app 必须在 db 和 network 启动后启动（顺序控制）；
- db 是 app 的必需依赖（db 启动失败，app 不能启动）；
- network 是 app 的弱依赖（网络异常时，app 仍尝试启动，用于本地调试）。

则 app.service 的依赖配置如下：

```ini
[Unit]
Description=Web Application Service
After=db.service network.service  # 启动顺序：db、network 之后
Requires=db.service  # 强依赖 db，db 失败则 app 失败
Wants=network.service  # 弱依赖 network，network 失败不影响 app

[Service]
ExecStart=/usr/bin/app
Restart=on-failure
```

### 5.3 补充：Before 与 Conflicts

除上述三个核心参数外，还有两个常用依赖参数：

- **Before**：与 After 相反，指定当前服务在另一服务之前启动（如 `Before=nginx.service` 表示当前服务启动后，再启动 nginx）；
- **Conflicts**：定义冲突关系，若指定服务启动，则当前服务必须停止；反之亦然（如 `Conflicts=apache.service` 表示 nginx 与 apache 不能同时运行）。

## 六、服务失败的处理机制：RestartSec 与 StartLimitBurst

服务运行过程中难免出现异常（如程序崩溃、资源耗尽），systemd 提供了完善的失败处理机制，核心通过 `Restart`、`RestartSec`、`StartLimitBurst`、`StartLimitIntervalSec` 四个参数组合实现，避免服务异常后直接退出，提升系统可靠性。

### 6.1 核心参数定义

- **Restart**：定义服务在何种情况下需要重启，常用值包括：        `no`：默认值，服务退出后不重启；
- `on-failure`：仅当服务异常退出（退出码非 0、被信号杀死等）时重启；
- `always`：无论服务正常还是异常退出，都重启；
- `on-abort`：仅当服务被信号中止（如 SIGABRT）时重启。

**RestartSec**：服务异常退出后，等待多久再重启（默认 100ms），避免频繁重启导致资源耗尽；

**StartLimitBurst**：在 `StartLimitIntervalSec` 时间内，服务最大重启次数（默认 5 次）；

**StartLimitIntervalSec**：重启次数统计的时间窗口（默认 10 秒）。

### 6.2 失败处理逻辑与示例

systemd 的失败处理逻辑可概括为：“当服务异常退出时，按 RestartSec 等待后重启；若在 StartLimitIntervalSec 内重启次数达到 StartLimitBurst，则停止重启，标记服务为失败状态”。

示例 ASCII 图：服务失败重启流程

```text
服务异常退出
  ↓
判断 Restart 参数 → 符合重启条件？
  ├─ 否 → 服务标记为失败
  └─ 是 → 等待 RestartSec 时间
      ↓
启动服务 → 记录重启次数
  ↓
判断 (当前时间 - 首次重启时间) ≤ StartLimitIntervalSec？
  ├─ 是 → 重启次数 ≥ StartLimitBurst？
  │   ├─ 是 → 停止重启，标记为失败
  │   └─ 否 → 等待下次异常（循环）
  └─ 否 → 重置重启次数，继续监控
```

实践配置示例（nginx.service 失败处理）：

```ini
[Service]
ExecStart=/usr/sbin/nginx -g 'daemon off;'
Restart=on-failure  # 异常退出时重启
RestartSec=2s  # 等待 2 秒后重启
StartLimitBurst=3  # 10 秒内最多重启 3 次
StartLimitIntervalSec=10s  # 时间窗口 10 秒
```

上述配置表示：nginx 异常退出后，等待 2 秒重启；若 10 秒内重启次数达到 3 次仍失败，则停止重启，标记为失败状态。

## 七、总结

systemd 作为 Linux 服务管理的主流方案，其核心优势源于“并行化启动、精细化依赖管理、内核级资源控制”的设计理念。从工程师视角来看，理解 systemd 不仅要掌握 `systemctl` 命令的使用，更要深入其设计哲学——通过 Unit 体系统一管理资源，通过依赖图支撑并行启动，通过 PID 1 和 cgroups 实现生命周期与资源控制，通过失败处理机制提升系统可靠性。

相比传统的 SysV init，systemd 虽然学习成本更高，但带来的效率提升和管理灵活性是革命性的。在实际运维中，合理配置 Unit 依赖参数、资源限制参数及失败处理参数，能大幅提升服务的稳定性和可维护性。后续可进一步深入研究 systemd 的定时器（.timer）、快照（systemctl snapshot）等高级功能，挖掘其更多潜力。