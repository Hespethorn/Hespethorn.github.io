---
title: 秒杀系统高并发优化实战（C++ / Drogon）：接入 MySQL 的第一个坑——getDbClient 为什么返回空
date: 2026-08-31
categories: [Seckill, Cpp]
tags: [Seckill, C++, Drogon, MySQL, DbClient, SIGSEGV, 排错]
series: [Seckill]
abbrlink: seckcpp0203
---

服务正常启动，日志干干净净地打出 `starting on :8080`，然后**第一个请求进来，进程当场 SIGSEGV**。gdb 抓到的栈只有函数名、没有行号，`SeckillService::doSeckill` 里的 `db_->newTransactionAsync(...)` 一声不吭地踩在空指针上——数据库客户端是空的，代码却把它当成已经连上数据库在用。

这不是什么玄学段错误，而是 Drogon 接入 MySQL 时**几乎人人都会踩、却极少被写进教程**的一个启动期大坑。本文把完整排查链展开：为什么服务能起来、为什么偏偏在请求时才崩、以及官方文档里那句被大多数人忽略的话到底是什么意思。

> 本文是「秒杀系统（C++ / Drogon）」系列的实战篇。配套仓库 `seckill-cpp`（GitHub: https://github.com/Hespethorn/seckill-cpp），修复涉及 `src/main.cc` 与 `src/service/SeckillService.cc`。真实编译在 WSL 完成，MySQL 走 `sql/schema.sql` 建库建表。

## 一、是什么：Drogon 里获取 DB 客户端只有一条正路

Drogon 的 ORM 把数据库连接池托管在框架内部，业务代码**不自己管理连接**，而是通过框架接口拿客户端：

```cpp
// 1. 从 config.json 的 db_clients 段按名字取（最常见的用法）
auto db = drogon::app().getDbClient("default");

// 2. 或代码里手动创建（不常用，连接参数写死在代码里）
// drogon::app().createDbClient(orm::MysqlConfig{...});
```

`config.json` 里声明好连接参数，框架负责建池、断线重连、按需分配连接：

```json
{
  "db_clients": [
    {
      "name": "default",
      "rdbms": "mysql",
      "host": "127.0.0.1",
      "port": 3306,
      "dbname": "seckill",
      "user": "seckill",
      "passwd": "seckill",
      "connection_number": 10
    }
  ]
}
```

看起来平平无奇：加载配置 → 取客户端 → 用。但这条链路里藏着一个**时序陷阱**，正是它让服务"启动成功、一请求就崩"。

## 二、坑在哪：服务能起来，第一个请求才崩

我把秒杀服务的依赖注入写成"标准"样子——启动时取好客户端，传给业务层：

```cpp
int main() {
    drogon::app().loadConfigFile("./config.json");

    // 危险写法：在 app.run() 之前调用 getDbClient()
    auto db = drogon::app().getDbClient("default");          // ← 拿到的是空指针！
    auto seckillSvc = std::make_shared<SeckillService>(db);  // ← 空客户端被存下来
    auto seckillCtrl = std::make_shared<SeckillController>(seckillSvc);

    drogon::app().registerHandler(
        "/api/seckill",
        [seckillCtrl](const drogon::HttpRequestPtr &req,
                      std::function<void(const drogon::HttpResponsePtr &)> &&cb) {
            seckillCtrl->seckill(req, std::move(cb));
        },
        {drogon::Post});

    drogon::app().run();   // 真正启动事件循环
    return 0;
}
```

`SeckillService::doSeckill` 里第一件事就是开事务：

```cpp
void SeckillService::doSeckill(int64_t userId, int64_t skuId,
                               std::function<void(bool, const std::string &)> &&callback) {
    db_->newTransactionAsync(        // ← 崩溃点：db_ 是空 shared_ptr
        [userId, skuId, cb = std::move(callback)](const auto &tx) { ... });
}
```

**现象链条**：

| 阶段 | 表现 | 为什么 |
|------|------|--------|
| 启动 | 正常打印 `starting on :8080` | `loadConfigFile` 只"注册配置"，不建连接池，也没人碰那个空指针 |
| 首个请求 | `Thread "DrogonIoLoop" received SIGSEGV` | handler 执行 → `doSeckill` → `db_->...` 空指针解引用 |
| gdb bt | 只有 `SeckillService::doSeckill(...) ()`，没有行号 | Release `-O3 -DNDEBUG` 构建没带 `-g`，符号表只有函数名 |
| 玄学感 | 崩在"业务第一行"，跟配置、MySQL 都无关 | 根因在启动时那行"看起来没问题"的 `getDbClient` |

## 三、本质一句话

> **`getDbClient()` 返回的不是"配置里声明的客户端"，而是"已经创建好的客户端对象"；而这个对象要等 `app.run()` 启动事件循环时才真正创建。在此之前调用，拿到的永远是空 `shared_ptr`。**

配置注册（`loadConfigFile`）和对象创建（`run()`）是**两个阶段**。把 `getDbClient` 放在 `run()` 之前，等于在"注册表"里查一个还没实例化的条目——框架为了不抛异常，选择返回空指针。代码不崩在启动（因为没人用它），崩在第一个请求（因为业务真的去调它了）。

## 四、为什么会这样：Drogon 的启动生命周期

用一张图看清 Drogon 从 `main` 到服务可用的完整时间线：

<div align="center">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 320" font-family="-apple-system, Segoe UI, Microsoft YaHei, sans-serif" width="100%">
  <text x="340" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#1f2d3d">Drogon 启动生命周期：配置注册 ≠ 客户端创建</text>
  <!-- 时间轴 -->
  <line x1="60" y1="70" x2="620" y2="70" stroke="#409eff" stroke-width="3"/>
  <circle cx="120" cy="70" r="6" fill="#409eff"/>
  <circle cx="300" cy="70" r="6" fill="#f56c8e"/>
  <circle cx="500" cy="70" r="6" fill="#67c23a"/>
  <!-- 阶段 1 -->
  <rect x="70" y="90" width="140" height="86" rx="8" fill="#eef4ff" stroke="#409eff" stroke-width="2"/>
  <text x="140" y="112" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2d3d">① loadConfigFile()</text>
  <text x="140" y="132" text-anchor="middle" font-size="11" fill="#333">解析 config.json</text>
  <text x="140" y="150" text-anchor="middle" font-size="11" fill="#c0392b">只注册配置</text>
  <text x="140" y="168" text-anchor="middle" font-size="10.5" fill="#909399">db_clients 记入待建列表</text>
  <!-- 阶段 2 -->
  <rect x="250" y="90" width="140" height="86" rx="8" fill="#fdeef5" stroke="#f56c8e" stroke-width="2"/>
  <text x="320" y="112" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2d3d">② getDbClient()</text>
  <text x="320" y="132" text-anchor="middle" font-size="11" fill="#333">查"已创建"表</text>
  <text x="320" y="150" text-anchor="middle" font-size="11" fill="#c0392b">还没建 → 返回空</text>
  <text x="320" y="168" text-anchor="middle" font-size="10.5" fill="#909399">此处调用 = 拿空指针</text>
  <!-- 阶段 3 -->
  <rect x="440" y="90" width="140" height="86" rx="8" fill="#eafaf0" stroke="#67c23a" stroke-width="2"/>
  <text x="510" y="112" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2d3d">③ app.run()</text>
  <text x="510" y="132" text-anchor="middle" font-size="11" fill="#333">启动事件循环</text>
  <text x="510" y="150" text-anchor="middle" font-size="11" fill="#1f6f2f">创建连接池</text>
  <text x="510" y="168" text-anchor="middle" font-size="10.5" fill="#909399">此后 getDbClient 才有值</text>
  <!-- 危险标注 -->
  <rect x="180" y="200" width="320" height="52" rx="8" fill="#fff7e6" stroke="#e6a23c" stroke-width="2"/>
  <text x="340" y="222" text-anchor="middle" font-size="12" font-weight="bold" fill="#b7791f">危险区间：② 在 ① 之后、③ 之前调用</text>
  <text x="340" y="240" text-anchor="middle" font-size="11" fill="#333">服务能启动，但 db_ 为空 → 首个请求 SIGSEGV</text>
  <!-- 正确位置 -->
  <rect x="180" y="262" width="320" height="44" rx="8" fill="#eafaf0" stroke="#67c23a" stroke-width="2"/>
  <text x="340" y="282" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f6f2f">正确位置：handler 内（必然在 ③ 之后）</text>
  <text x="340" y="298" text-anchor="middle" font-size="10.5" fill="#909399">首个请求到达时框架已就绪，getDbClient 必非空</text>
</svg>
</div>

Drogon 这样设计是刻意的：连接池要挂在事件循环（EventLoop）上，而事件循环是 `run()` 才启动的。在循环还没跑起来时建连接池，要么阻塞、要么拿到半成品，所以框架干脆把**实例化推迟到 run()**，并在 run() 之前对 `getDbClient` 一律返回空。

## 五、官方文档里那句话，值得加粗

Drogon 官方 Wiki 在 `getDbClient` 条目下有一句很容易被划过去的话：

> **"This method cannot be called before running app.run(), otherwise the user will get an empty shared_ptr."**
> —— `getDbClient()` 不能在 `app.run()` 之前调用，否则你会拿到一个空的 `shared_ptr`。

中文直译就是：**别在 run() 之前调，否则拿到空指针**。这句话和"服务能启动、请求才崩"的症状严丝合缝——空指针不立刻爆，是因为没人立即用它。

## 六、修复：把依赖注入推迟到第一个请求

保持"Controller 依赖 Service、Service 依赖 DbClient"的注入结构不变，只是把**取客户端的时机**挪到 handler 里——handler 执行必然在 `run()` 之后，此时客户端一定就绪。用 `static` 局部变量保证只初始化一次，且 C++11 的 magic static 保证多线程安全：

```cpp
// main.cc：延迟初始化，绕开 run() 之前的空指针陷阱
std::shared_ptr<SeckillController> getSeckillController() {
    // static 局部变量：首次调用时初始化，线程安全（magic static）
    static std::shared_ptr<SeckillController> ctrl = [] {
        auto db = drogon::app().getDbClient("default");   // 此时 run() 已启动，必非空
        if (!db) {                                        // 防御性判空，双保险
            LOG_FATAL << "getDbClient(\"default\") returned null after run()";
            exit(1);
        }
        return std::make_shared<SeckillController>(
            std::make_shared<SeckillService>(db));
    }();
    return ctrl;
}

int main() {
    drogon::app().loadConfigFile("./config.json");

    drogon::app().registerHandler(
        "/api/seckill",
        [](const drogon::HttpRequestPtr &req,
           std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
            getSeckillController()->seckill(req, std::move(callback));  // 请求时再取
        },
        {drogon::Post});

    drogon::app().run();
    return 0;
}
```

三处关键改动：

1. **`getDbClient` 移进 lambda**：执行时机从"启动时"变为"第一个请求时"，必然在 `run()` 之后。
2. **`static` 局部变量**：整个进程生命周期只组装一次 Controller，避免每个请求重复创建 Service/连接句柄。
3. **防御性判空保留**：即使未来有人把这段代码挪回启动阶段，也会得到明确的 `LOG_FATAL` 而不是神秘的 SIGSEGV。

## 七、可运行验证步骤

在 WSL（Ubuntu）里完整复现并验证修复：

```bash
# 1. 复现崩溃（修复前代码）：服务起来，curl 一发就崩
gdb -batch -ex run -ex bt --args ./build/src/seckill-cpp
# 另开终端：
curl -s -X POST http://127.0.0.1:8080/api/seckill \
  -H 'Content-Type: application/json' -d '{"userId":1001,"skuId":1}'
# 期望：Thread "DrogonIoLoop" received SIGSEGV

# 1.5 随时进库查看数据（MySQL 连接本身正常，只是 Drogon 侧没拿到客户端）
mysql -h127.0.0.1 -P3306 -useckill -pseckill seckill
# 进去后：SELECT id, name, stock FROM seckill_sku; 应能看到 100 件库存

# 2. 修复后重新构建并验证
cmake --build build-debug -j"$(nproc)"
./build-debug/src/seckill-cpp &
curl -s -X POST http://127.0.0.1:8080/api/seckill \
  -H 'Content-Type: application/json' -d '{"userId":1001,"skuId":1}'
# 期望：{"code":0,"msg":"success"}，不再 SIGSEGV

# 3. 验证幂等（同一用户同一商品第二次应被拒）
curl -s -X POST http://127.0.0.1:8080/api/seckill \
  -H 'Content-Type: application/json' -d '{"userId":1001,"skuId":1}'
# 期望：409 {"code":1,"msg":"DUPLICATE_ORDER"}
```

## 八、排错方法论：这次是怎么定位的

这次排查的每一步都值得记下来，下次遇到"启动正常、请求崩溃"可以直接套用：

| 步骤 | 动作 | 结论 |
|------|------|------|
| 1 | `gdb -batch -ex run -ex bt` | 确认崩在 `SeckillService::doSeckill`，但 Release 无 `-g` 拿不到行号 |
| 2 | 用 `-DCMAKE_BUILD_TYPE=Debug` 重编 + ASan | 直接报 `SeckillService.cc:26: member access within null pointer`——空指针实锤 |
| 3 | 查 Drogon 库是否带 MySQL：`nm libdrogon.a | grep MysqlClient` | 符号在，排除"编译时没带 MySQL 后端" |
| 4 | 查 config 是否被解析：打印 `getCustomConfig()` | 返回 null 会**误判**为"config 没加载"——注意 `getCustomConfig()` 只返回 `custom_config` 子段，不是整个文件 |
| 5 | 查文档：`getDbClient` 调用时机 | **命中：必须在 `app.run()` 之后调用** |

第 4 步是个容易误导人的点：`getCustomConfig()` 返回的是配置文件里 `custom_config` 字段（用户自定义区），如果没写这个字段就返回 null——**它不能用来判断整个 config.json 是否加载成功**。判断加载成功与否，直接看 `loadConfigFile` 有没有抛异常即可（它失败会 `LOG_FATAL` 并退出）。

## 九、设计取舍总结

| 决策点 | 选定方案 | 放弃方案 | 放弃的代价 |
|--------|----------|----------|------------|
| DB 客户端获取时机 | 延迟到 handler（run() 之后） | 启动时在 main() 里取 | 首次请求多一次 static 初始化（可忽略） |
| 依赖注入方式 | static 延迟单例 + 注入 Service | 全局裸指针 / 每次请求现取 | 全局单例状态，测试时需重置 |
| 空指针防御 | 判空 + `LOG_FATAL` | 不判空裸用 | 无（纯收益，把神秘 SIGSEGV 变明确报错） |
| 构建类型 | Debug（`-g`）用于排错 | 只跑 Release | Debug 性能略低，但排错必须有符号 |
| ORM 选型 | Drogon 内置 orm `DbClient` | 规划中的 mysql-connector-cpp + 自管连接池 | 框架绑定；换来连接池/重连/异步 API 全托管 |

一句话收尾：**Drogon 的 `getDbClient()` 是一条"只有 run() 之后才开门"的通道，启动阶段调用不是"可能出错"，而是"必然拿到空指针"**。把依赖注入推迟到 handler，用 static 保证只初始化一次，既保住了注入结构，又踩在了框架的正确时机上——这是阶段一里第一次尝到"Drogon 有自己的生命周期，不能按普通 C++ 类的直觉来"的滋味，后面接入 Redis、MQ 时还会反复遇到同样的思维转变。

> 配套仓库：`https://github.com/Hespethorn/seckill-cpp`（本文对应修复后的 `src/main.cc` 延迟初始化写法，扣减逻辑见 `src/service/SeckillService.cc`）。本系列是作者个人的 C++ 秒杀系统实战记录，所有方案、代码与压测数据均为原创。
