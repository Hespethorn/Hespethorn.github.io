---


title: C++/MySQL/Redis 锁机制 - 3
tags:
  - Redis
categories: [Database, Redis]
abbrlink: 807c926c
date: 2025-05-16
series: [Redis]
---
## Redis 锁机制：分布式集群的并发控制

Redis 作为分布式缓存与数据库，其锁机制主要解决**跨节点、跨进程的分布式并发问题**（如微服务集群中共享资源的互斥访问）。核心是 “分布式锁”，基于 Redis 原子命令和 Lua 脚本实现，支持可重入、公平锁等特性。

### 1. 基础分布式锁：基于 SETNX 命令

#### 核心定义

利用 Redis 的 SETNX（SET if Not Exists）原子命令实现的分布式锁：**若键不存在则设置值（获取锁），若已存在则失败（锁已被持有）**，确保同一时间仅一个节点的一个线程获取锁。

#### 底层实现

- 核心命令：SET lock_key thread_id NX EX 10（NX：不存在才设置，EX：过期时间 10 秒）；

- 锁标识：用 thread_id（如 “node1_thread2”）标记持有锁的线程，避免误释放其他线程的锁；

- 过期时间：防止线程崩溃导致锁无法释放（死锁），需设置合理的过期时间（大于业务执行时间）。

#### 代码示例（Redis CLI 实现）

```
# 1. 获取锁：SETNX + 过期时间（原子操作）
127.0.0.1:6379> SET order_lock "node1_thread1" NX EX 10
OK # 成功获取锁

# 2. 其他节点/线程尝试获取锁（失败）
127.0.0.1:6379> SET order_lock "node2_thread1" NX EX 10
(nil) # 锁已被持有，获取失败

# 3. 释放锁：先检查锁标识，再删除（需用 Lua 脚本保证原子性）
127.0.0.1:6379> EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end" 1 order_lock "node1_thread1"
(integer) 1 # 释放成功

# 4. 锁过期自动释放（10秒后）
127.0.0.1:6379> GET order_lock
(nil) # 锁已过期
```

#### 优缺点与适用场景

| 维度            | 说明                                                         |
| --------------- | ------------------------------------------------------------ |
| **优点**        | 实现简单，基于 Redis 原子命令；支持分布式场景；避免死锁（过期时间）。 |
| **缺点**        | 不支持可重入（同一线程无法多次获取）；单 Redis 节点存在 “单点故障” 风险；锁过期可能导致业务未完成。 |
| **适用场景**    | 简单分布式场景（如单节点 Redis）；短耗时业务（如订单状态更新）；无重入需求的场景。 |
| **与 C++ 对比** | 类似 C++ 的 SpinLock（基于原子操作），但 Redis 锁是 “分布式” 的（跨节点），C++ 锁是 “本地” 的（单进程）。 |

### 2. 可重入分布式锁：基于 Redisson 框架

#### 核心定义

由 Redis 客户端框架 Redisson 实现的高级分布式锁，支持**同一线程多次获取同一把锁**（重入性），同时解决基础分布式锁的 “单点故障”“锁过期” 等问题。

#### 底层实现

- 基于 Redis Hash 结构存储锁信息：lock_key 的 Hash 中，thread_id 为字段，reentrant_count 为值（记录重入次数）；

- 重入逻辑：同一线程再次获取锁时，reentrant_count +1；释放时 reentrant_count -1，直到为 0 时删除锁；

- 支持 “看门狗机制”：自动延长锁过期时间（避免业务未完成时锁过期）；支持 Redis Cluster/Sentinel 集群（解决单点故障）。

#### 代码示例（Java + Redisson 实现）

```
import org.redisson.Redisson;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;

public class RedissonReentrantLockDemo {
    public static void main(String[] args) {
        // 1. 配置 Redisson（连接 Redis Cluster）
        Config config = new Config();
        config.useClusterServers()
              .addNodeAddress("redis://192.168.1.101:6379")
              .addNodeAddress("redis://192.168.1.102:6379");
        
        // 2. 创建 Redisson 客户端
        RedissonClient redissonClient = Redisson.create(config);
        
        // 3. 获取可重入分布式锁
        RLock reentrantLock = redissonClient.getLock("order_lock");
        
        try {
            // 4. 第一次获取锁（成功）
            reentrantLock.lock(10, java.util.concurrent.TimeUnit.SECONDS);
            System.out.println("第一次获取锁成功");
            
            // 5. 同一线程第二次获取锁（重入，成功）
            reentrantLock.lock(10, java.util.concurrent.TimeUnit.SECONDS);
            System.out.println("第二次获取锁成功（重入）");
            
            // 6. 业务逻辑（如订单创建）
            Thread.sleep(5000);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            // 7. 释放锁（需调用与获取次数相同的 unlock()）
            if (reentrantLock.isHeldByCurrentThread()) {
                reentrantLock.unlock(); // 第一次释放，reentrant_count=1
                reentrantLock.unlock(); // 第二次释放，reentrant_count=0，锁删除
                System.out.println("锁释放完成");
            }
            // 8. 关闭客户端
            redissonClient.shutdown();
        }
    }
}
```

#### 优缺点与适用场景

| 维度              | 说明                                                         |
| ----------------- | ------------------------------------------------------------ |
| **优点**          | 支持重入、看门狗机制、集群部署；解决基础分布式锁的单点故障与锁过期问题；API 友好。 |
| **缺点**          | 依赖 Redisson 框架；集群环境下性能略低于单节点；需维护 Redis 集群。 |
| **适用场景**      | 复杂分布式场景（如微服务集群）；有重入需求的业务（如嵌套调用的分布式任务）；高可用要求高的场景。 |
| **与 MySQL 对比** | 均用于 “跨进程并发控制”，但 Redis 锁是 “内存级”（速度快，非持久化），MySQL 锁是 “磁盘级”（速度慢，持久化）。 |

### 3. 公平分布式锁：基于 Redisson 的有序队列

#### 核心定义

保证 “线程按请求锁的先后顺序获取锁” 的分布式锁，避免 “线程饥饿”（某线程长期无法获取锁）。由 Redisson 基于 Redis 的 Sorted Set（有序集合）实现。

#### 底层实现

- 维护 “等待队列”：线程获取锁失败时，将线程标识作为 Sorted Set 的成员，以 “请求时间戳” 为分数排序；

- 锁释放时：先删除当前持有锁的线程标识，再从 Sorted Set 中取出分数最小的线程（最早请求的线程），通过 Redis 发布订阅机制通知其获取锁；

- 确保 “先请求先获取”，避免线程饥饿。

#### 适用场景

- 对 “锁获取顺序” 敏感的分布式场景（如金融交易订单处理、分布式任务调度）；

- 需避免线程饥饿的业务（如长时间运行的分布式计算任务）。

## 二、三大技术栈锁机制横向对比与选型指南

### 1. 核心特性横向对比表

| 对比维度   | C++ 锁机制                      | MySQL 锁机制                     | Redis 锁机制                          |
| ---------- | ------------------------------- | -------------------------------- | ------------------------------------- |
| 适用场景   | 单进程内多线程并发              | 单数据库实例内多事务并发         | 跨节点、跨进程的分布式并发            |
| 锁粒度     | 内存资源（变量、对象）          | 表 / 行记录（磁盘数据）          | 分布式键值对（内存数据）              |
| 核心实现   | 操作系统互斥量、原子操作        | 索引树（InnoDB）、事务日志       | 原子命令、Lua 脚本、有序集合          |
| 高可用支持 | 不支持（单进程）                | 支持主从复制（需手动处理锁同步） | 支持 Cluster/Sentinel（自动故障转移） |
| 重入性     | 需显式使用 std::recursive_mutex | 行锁支持重入（同一事务内）       | Redisson 锁支持重入                   |
| 典型工具   | <mutex> <atomic> 标准库         | InnoDB 存储引擎                  | Redisson 客户端框架                   |

### 2. 技术栈选型四步法则

**判断并发范围**：

- 单进程内多线程：选 **C++ 锁**（如 std::mutex、自旋锁）；
- 单数据库实例多事务：选 **MySQL 锁**（如 InnoDB 行锁、乐观锁）；
- 跨节点 / 跨进程分布式：选 **Redis 锁**（如 Redisson 可重入锁）。

**判断数据存储位置**：

- 内存中的共享资源：选 C++ 锁（本地）或 Redis 锁（分布式）；
- 磁盘中的结构化数据：选 MySQL 锁（行锁 / 表锁）。

**判断并发强度与类型**：

- 高并发读多写少：C++ 读写锁、MySQL 行锁、Redis 乐观锁；

- 高并发写多读少：C++ 互斥锁、MySQL 行锁、Redis 可重入锁；

- 低并发简单场景：C++ 自旋锁、MySQL 表锁、Redis 基础分布式锁。

**判断高可用需求**：

- 无高可用需求（单节点）：C++ 锁、MySQL 单机锁、Redis 单节点锁；

- 高可用需求（集群）：MySQL 主从锁（需同步）、Redis 集群锁（Redisson）。

## 三、总结：三大技术栈锁机制的核心思想

C++、MySQL、Redis 锁机制的设计，均围绕 “**在并发效率与数据一致性之间找平衡**”，但因运行环境差异，呈现出不同的技术特性：

- C++ 锁：聚焦 “本地进程内多线程”，以 “用户态 / 内核态同步原语” 为核心，追求 “内存级” 的高效控制；

- MySQL 锁：聚焦 “数据库事务并发”，以 “表 / 行粒度” 为核心，结合事务隔离级别，保障 “磁盘级” 的数据一致性；

- Redis 锁：聚焦 “分布式集群并发”，以 “原子命令与有序结构” 为核心，解决 “跨节点” 的互斥与高可用问题。

实际开发中，需根据 “并发范围、数据位置、业务特性” 选择合适的技术栈锁机制，甚至组合使用（如 “Redis 分布式锁 + MySQL 行锁”：分布式场景下先加 Redis 锁，再操作 MySQL 加行锁），才能在保障数据安全的同时，最大化并发效率。