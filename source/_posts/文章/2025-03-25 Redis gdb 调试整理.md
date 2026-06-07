---
title: Redis gdb 调试整理
tags:
  - Redis
categories:
  - Redis
series: Redis
abbrlink: c119195b
date: 2025-03-25 22:15:38
---
## 一、调试前环境准备（必须配置）

调试 Redis 的核心前提是**保留调试符号**与**开启核心日志**，否则无法定位源码问题。

### 1. Redis 编译配置（带调试符号）

默认make会开启优化（-O2）并剥离调试符号，需重新编译保留调试信息：

```
# 1. 清理原有编译结果
make distclean

# 2. 编译时保留调试符号（-g）+ 关闭优化（-O0，避免代码指令重排）
make CFLAGS="-g -O0"

# 3. 验证调试符号是否存在（输出包含 "with debug_info" 即正常）
file src/redis-server | grep debug
```

### 2. Redis 核心日志配置（辅助调试）

修改redis.conf，开启详细日志以定位问题上下文：

```
# 日志级别：调试阶段设为 verbose（输出核心操作）
loglevel verbose

# 日志文件：指定路径便于后续分析
logfile "/var/log/redis/redis-debug.log"

# 记录客户端命令（调试命令处理流程时开启）
log-commands yes

# 记录慢查询（阈值设为1ms，捕捉潜在性能问题）
slowlog-log-slower-than 1000
slowlog-max-len 1000
```

重启 Redis 加载配置：

```
# 停止原有进程（测试环境操作，生产需谨慎）
redis-cli shutdown

# 以调试配置启动（前台启动便于观察，或加 --daemonize yes 后台运行）
src/redis-server redis.conf
```

## 二、gdb 附加 Redis 进程（基础操作）

调试 Redis 有两种方式：**启动时调试**（适合初始化问题）、**运行中附加**（适合线上问题，不中断服务）。

### 1. 方式 1：运行中附加 Redis 进程（推荐）

适用于调试已启动的 Redis 服务，步骤如下：

```
# 1. 查找Redis进程PID（获取 redis-server 的PID，如 12345）
ps -ef | grep redis-server
# 输出示例：redis    12345     1  0 10:00 ?        00:00:05 src/redis-server *:6379

# 2. 附加进程到gdb（附加时进程会暂停，调试完需执行 continue 恢复）
gdb attach 12345

# 3. 附加成功后，先执行 "continue" 让Redis恢复运行（避免服务中断）
(gdb) continue
```

### 2. 方式 2：启动时直接调试（适合初始化问题）

适用于调试 Redis 启动阶段的问题（如配置加载、端口绑定失败）：

```
# 直接用gdb启动Redis，指定配置文件
gdb --args src/redis-server redis.conf

# 启动后执行 "run" 开始运行Redis
(gdb) r
Starting program: /usr/local/bin/redis-server
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
4461:C 03 Sep 2025 23:26:40.692 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
4461:C 03 Sep 2025 23:26:40.692 # Redis version=6.2.6, bits=64, commit=00000000, modified=0, pid=4461, just started
4461:C 03 Sep 2025 23:26:40.692 # Warning: no config file specified, using the default config. In order to specify a config file use /usr/local/bin/redis-server /path/to/redis.conf
4461:M 03 Sep 2025 23:26:40.694 * Increased maximum number of open files to 10032 (it was originally set to 1024).
4461:M 03 Sep 2025 23:26:40.694 * monotonic clock:POSIX clock_gettime
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 6.2.6 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running instandalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 4461
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           https://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

4461:M 03 Sep 2025 23:26:40.699 # Server initialized
4461:M 03 Sep 2025 23:26:40.699 # WARNING overcommit_memory is set to 0! Background save may fail under low memory condition. To fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf and thenreboot or run the command 'sysctl vm.overcommit_memory=1' for this to take effect.
[New Thread 0x7ffff69ff640 (LWP 4464)]
[New Thread 0x7ffff61fe640 (LWP 4465)]
[New Thread 0x7ffff59fd640 (LWP 4466)]
[New Thread 0x7ffff51fc640 (LWP 4467)]
4461:M 03 Sep 2025 23:26:40.704 * Ready to accept connections
```

## 三、gdb 核心调试技巧（Redis 场景化应用）

以下命令结合 Redis 源码逻辑设计，覆盖**命令处理、键操作、线程行为**等核心场景。

### 1. 断点设置（精准定位核心流程）

Redis 的核心函数是调试重点，需掌握「普通断点」「条件断点」「函数断点」的用法。

| 调试场景                   | gdb 命令示例                                              | 说明                                                         |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| 拦截所有命令处理           | break processCommand                                      | processCommand是所有客户端命令的入口函数（如 GET/SET），断点后可跟踪命令流程 |
| 拦截特定命令（如 SET）     | break processCommand if strcasecmp(cmd->name, "SET") == 0 | 条件断点：仅当命令为 SET 时触发，避免无关命令干扰            |
| 拦截键查找（如 lookupKey） | break lookupKey                                           | lookupKey是 Redis 查找键的核心函数，调试键缺失 / 过期问题必备 |
| 拦截内存分配失败           | break zmalloc if ret == NULL                              | Redis 用zmalloc封装内存分配，断点后可定位内存耗尽问题        |

**断点管理命令**：

- 查看所有断点：info breakpoints

- 删除断点：delete 断点编号（如 delete 1）

- 禁用断点：disable 断点编号（临时关闭，不删除）

### 2. 变量 / 内存查看（定位数据异常）

断点触发后，需查看 Redis 核心数据结构（如redisObject、client、db）的内容，定位数据异常。

#### （1）查看键对象（redisObject）

Redis 中所有键值都是redisObject类型，断点在lookupKey后可查看：

```
# 1. 查看当前查找的键名（key是sds类型，通过sdslen/sdsptr获取内容）
(gdb) print key->ptr  # 输出键名的内存地址
(gdb) print (char*)key->ptr  # 强制转换为字符串，查看具体键名
(gdb) print sdslen(key)  # 查看键名长度

# 2. 查看键对应的value对象（假设val是lookupKey的返回值）
(gdb) print val->type  # 查看value类型（0=string,1=list,2=set,3=zset,4=hash）
(gdb) print val->encoding  # 查看编码方式（如REDIS_ENCODING_RAW/INT）
(gdb) print *(redisDb*)val->ptr  # 若为hash类型，查看hash表内容
```

#### （2）查看客户端连接（client）

调试连接问题（如客户端超时、命令阻塞）时，查看client结构体：

```
# 1. 查看当前客户端的FD（文件描述符）
(gdb) print client->fd

# 2. 查看客户端状态（flags）：如 REDIS_CLIENT_MASTER（主从客户端）、REDIS_CLIENT_BLOCKED（阻塞）
(gdb) print client->flags
(gdb) print (client->flags & REDIS_CLIENT_BLOCKED) != 0  # 判断是否阻塞

# 3. 查看客户端当前执行的命令
(gdb) print (char*)client->argv[0]->ptr  # argv[0]是命令名
```

#### （3）查看数据库（redisDb）

Redis 每个数据库是redisDb类型，包含键空间字典（dict）：

```
# 1. 查看当前数据库的键数量
(gdb) print server.db[0].dict->ht[0].size  # db[0]是默认数据库，ht[0]是主哈希表

# 2. 查看数据库中是否存在某个键（通过dictFind函数）
(gdb) call dictFind(&server.db[0].dict, key)  # 调用dictFind，返回非NULL则存在
```

### 3. 多线程调试（分析子线程行为）

Redis 主线程是单线程事件循环，但存在**AOF 子线程、RDB 子线程、IO 子线程**（Redis 6.0+），需用 gdb 的线程命令跟踪。

#### （1）线程基础操作

```
# 1. 查看所有线程（含主线程+子线程，标注线程ID和状态）
(gdb) info threads

# 2. 切换到指定线程（如切换到线程2）
(gdb) thread 2

# 3. 锁定当前线程（避免调试时切换到其他线程，关键！）
(gdb) set scheduler-locking on  # 开启锁定：仅当前线程执行
(gdb) set scheduler-locking off # 关闭锁定：所有线程正常调度
```

#### （2）实战：调试 AOF 子线程

AOF 持久化由子线程处理（aofWrite函数），步骤如下：

-  查找 AOF 子线程：info threads 中找到标注 aof-write 的线程（如线程 3）
-  切换线程并锁定：thread 3 → set scheduler-locking on
-  设置断点：break aofWrite（AOF 写文件的核心函数）
-  触发 AOF 写入：redis-cli set test aof（触发 AOF 日志）
-  查看子线程状态：print aof_state（AOF 状态：REDIS_AOF_ON/WAIT_REWRITE）

## 四、性能瓶颈定位（gdb + perf）

gdb 适合断点调试，但定位**热点函数、CPU 占用高**的问题需结合perf工具（采样分析）。

### 1. 用 perf 定位热点函数

```
# 1. 实时查看Redis进程的CPU占用Top函数（-p 指定PID）
perf top -p 12345

# 2. 记录10秒内的调用栈（-g 记录调用栈，-o 输出到文件）
perf record -p 12345 -g -F 1000 -- sleep 10  # -F 1000：每秒采样1000次

# 3. 分析采样结果（查看热点函数的调用链）
perf report -i perf.data
```

### 2. 用 gdb 验证热点函数

若perf发现dictFind函数 CPU 占比高，用 gdb 统计其调用次数：

```
# 1. 设置断点并开启计数
(gdb) break dictFind
(gdb) commands  # 断点触发时执行的命令
> silent  # 不输出断点信息（避免刷屏）
> set $count++  # 计数器自增
> continue  # 自动继续运行
> end

# 2. 运行一段时间后（如10秒），查看计数
(gdb) print $count  # 输出dictFind的调用次数

# 3. 进一步查看参数：修改commands，打印每次查找的键名
(gdb) commands
> silent
> print (char*)key->ptr  # 打印当前查找的键名
> set $count++
> continue
> end
```

## 五、内存泄漏检测（gdb + valgrind）

Redis 内存泄漏多源于「内存分配后未释放」，需用valgrind检测泄漏点，再用 gdb 定位代码。

### 1. valgrind 检测内存泄漏

```
# 1. 用valgrind启动Redis（--leak-check=full 检测所有泄漏）
valgrind --leak-check=full --show-leak-kinds=all --log-file=valgrind.log src/redis-server redis.conf

# 2. 模拟业务操作（如执行批量SET命令）
redis-cli -r 10000 set key:{1..10000} value  # 执行10000次SET

# 3. 关闭Redis，查看valgrind日志（搜索 "definitely lost" 定位泄漏）
redis-cli shutdown
cat valgrind.log | grep "definitely lost"
```

### 2. gdb 定位泄漏点

若 valgrind 发现zmalloc分配的内存未释放，用 gdb 跟踪内存分配：

```
# 1. 附加进程，设置zmalloc断点（记录分配的内存地址）
(gdb) break zmalloc
(gdb) commands
> silent
> print "zmalloc: ptr=%p, size=%zu", ptr, size  # 打印分配的地址和大小
> continue
> end

# 2. 执行泄漏相关操作（如触发泄漏的命令）
# 3. 找到valgrind日志中的泄漏地址（如 0x55f8a000），用gdb查看该地址的分配栈
(gdb) info malloc 0x55f8a000  # 查看该内存的分配调用栈
(gdb) bt  # 查看完整调用链，定位泄漏代码行
```

## 六、调试实战案例：键过期异常

假设问题：GET test返回nil，但未手动删除，怀疑过期逻辑异常。

### 调试步骤：

- **查看日志**：cat /var/log/redis/redis-debug.log，发现test键的过期时间设置为 10 秒前。
- **附加 gdb**：gdb attach 12345 → continue。
- **设置断点**：break lookupKey（键查找入口）→ break expireIfNeeded（过期检查函数）。
- **触发断点**：redis-cli GET test，触发lookupKey断点。

**查看键信息**：

```
(gdb) print (char*)key->ptr  # 确认键名是 "test"
(gdb) print expireIfNeeded(&server.db[0], key)  # 调用过期检查函数，返回1表示已过期
(gdb) print key->expire  # 查看过期时间（Unix时间戳），确认是否早于当前时间
```

- **定位根因**：若key->expire异常（如被误设置为过去时间），设置break setExpire断点，跟踪谁修改了过期时间。

## 七、调试注意事项（生产环境安全）

1. **禁止生产直接附加**：gdb attach 会暂停进程，导致服务不可用，需在**测试环境复现问题**后调试，或使用gdb --batch批量执行调试命令（非交互）。

1. **避免长时间调试**：断点停留过久会导致 Redis 超时（如主从断开、客户端连接超时），调试后立即continue恢复。

1. **验证数据一致性**：调试结束后，用redis-cli执行INFO、KEYS等命令，确认数据未被破坏。

1. **清理调试配置**：调试完成后，恢复 Redis 日志级别（如notice）、关闭log-commands，避免日志量过大。

