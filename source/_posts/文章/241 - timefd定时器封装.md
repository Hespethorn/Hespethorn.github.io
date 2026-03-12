---
title: timefd定时器封装
tags:
  - timefd
  - Practical System Development
categories:
  - C++
  - Practical System Development
series: Practical System Development
abbrlink: 2db0d1c
date: 2025-09-16 20:42:09
---

## 导言

在 Linux 系统开发中，定时器是一个非常常见的需求。除了传统的`setitimer`、`alarm`等接口，Linux 还提供了一种基于文件描述符的定时器机制 ——`timerfd`。这种机制将定时器事件转化为文件描述符的可读事件，非常适合与 I/O 多路复用（如`poll`、`epoll`）结合使用。

## 一、简介

`timerfd`是 Linux 内核 2.6.25 版本后引入的接口，它将定时器功能抽象为一个文件描述符：当定时器到期时，该文件描述符会变为可读状态，我们可以通过`read`操作获取到期次数，从而处理定时事件。

相比传统定时器，`timerfd`的优势在于：

- 可以无缝集成到 I/O 多路复用模型中，无需单独的信号处理逻辑
- 支持绝对时间和相对时间，支持周期性触发
- 线程安全，可在多线程环境中安全使用

## 二、定时器类设计（`Timerfd.h`）

我们首先设计一个`Timerfd`类，封装`timerfd`的创建、设置、启动、停止等操作，核心思路是通过回调函数处理定时事件。

```cpp
#ifndef _TIMERFD_H
#define _TIMERFD_H

#include <functional>
using std::function;
using std::bind;

// 定义回调函数类型
using TimerfdCallback = function<void()>;

class Timerfd {
public: 
    /**
     * 构造函数
     * @param cb：定时到期的回调函数
     * @param initSec：初始延迟时间（秒）
     * @param peridoSec：周期时间（秒，0表示只触发一次）
     */
    Timerfd(TimerfdCallback && cb, int initSec, int peridoSec);

    ~Timerfd();

    // 启动定时器
    void start();

    // 停止定时器
    void stop();

private: 
    // 创建timerfd
    int createTimerFd();

    // 处理读事件（必须读取，否则timerfd不会再次触发）
    void handleRead();

    // 设置定时器参数
    void setTimerFd(int initSec, int peridoSec);

    int _timerfd;               // timerfd文件描述符
    TimerfdCallback _cb;        // 定时回调函数
    bool _isStarted;            // 定时器是否启动的标志
    int _initSec;               // 初始延迟时间
    int _peridoSec;             // 周期时间
};

#endif //_TIMERFD_H
```

类的核心成员包括：

- `_timerfd`：存储`timerfd`创建的文件描述符
- `_cb`：`std::function`类型的回调函数，定时器到期时执行
- `_isStarted`：控制定时器事件循环的开关
- 初始化和周期时间参数

## 三、定时器类实现（`Timerfd.cc`）

接下来实现`Timerfd`类的具体方法，重点关注`timerfd`的创建、参数设置和事件监听逻辑。

### 1. 构造与析构

```cpp
#include "Timerfd.h"
#include <unistd.h>
#include <stdio.h>
#include <poll.h>
#include <sys/timerfd.h>
#include <errno.h>
#include <iostream>
using std::cout;
using std::endl;

Timerfd::Timerfd(TimerfdCallback && cb, int initSec, int peridoSec) 
: _timerfd(createTimerFd())       // 初始化列表创建timerfd
, _cb(std::move(cb))              // 移动语义接收回调函数
, _initSec(initSec)
, _peridoSec(peridoSec)
, _isStarted(false)               // 初始化为未启动
{
}

Timerfd::~Timerfd() {
    close(_timerfd);  // 关闭文件描述符
}
```

构造函数通过初始化列表完成成员初始化，其中`createTimerFd`负责实际创建`timerfd`。

### 2. 创建 `timerfd`

```cpp
int Timerfd::createTimerFd() {
    // CLOCK_REALTIME：系统实时时间，会受NTP调整影响
    // TFD_NONBLOCK（可选）：非阻塞模式，这里未使用
    int fd = timerfd_create(CLOCK_REALTIME, 0);
    if(fd == -1) {
        perror("timerfd_create error");   
        return -1;
    }
    return fd;
}
```

`timerfd_create`的第一个参数指定时钟类型（`CLOCK_REALTIME`或`CLOCK_MONOTONIC`），第二个参数可设置非阻塞或关闭时自动清理等标志。

### 3. 设置定时器参数

```cpp
void Timerfd::setTimerFd(int initSec, int peridoSec) {
    struct itimerspec newValue;
    // 初始到期时间
    newValue.it_value.tv_sec = initSec;
    newValue.it_value.tv_nsec = 0;

    // 周期时间（0表示只触发一次）
    newValue.it_interval.tv_sec = peridoSec;
    newValue.it_interval.tv_nsec = 0;

    // 设置定时器（第二个参数为0表示相对时间，TFD_TIMER_ABSTIME表示绝对时间）
    int ret = timerfd_settime(_timerfd, 0, &newValue, nullptr);
    if(ret < 0) {
        perror("timerfd_settime error");
        return;
    }
}
```

`timerfd_settime`用于设置定时器的初始触发时间（`it_value`）和周期触发时间（`it_interval`），当`it_value`为 0 时定时器不工作，`it_interval`为 0 时只触发一次。

### 4. 启动与停止定时器

```cpp
void Timerfd::start() {
    struct pollfd pfd;
    pfd.fd = _timerfd;       // 监听timerfd
    pfd.events = POLLIN;     // 关注可读事件

    setTimerFd(_initSec, _peridoSec);  // 启动时设置定时器
    _isStarted = true;

    while(_isStarted) {
        // 超时时间5秒（可根据需求调整）
        int nready = poll(&pfd, 1, 5000);
        if(-1 == nready && errno == EINTR) {
            // 被信号中断，继续循环
            continue;
        } else if(-1 == nready) {
            //  poll出错
            perror("poll error");
            break;
        } else if(0 == nready) {
            // 超时，可做一些心跳操作
            cout << ">> poll timeout!" << endl;
        } else {
            // 检查是否是timerfd可读
            if(pfd.revents & POLLIN) {
                handleRead();  // 必须读取数据，否则不会再次触发
                if(_cb) {
                    _cb();     // 执行回调函数
                }
            }
        }
    }
}

void Timerfd::stop() {
    _isStarted = false;  // 退出事件循环
}
```

`start`方法是定时器的核心逻辑：

- 使用`poll`监听`timerfd`的可读事件
- 当定时器到期，`timerfd`变为可读，触发`POLLIN`事件
- 调用`handleRead`读取数据（`timerfd`到期后会写入 8 字节的计数，必须读取才能继续触发）
- 执行用户注册的回调函数

`stop`方法通过设置`_isStarted`为`false`，使事件循环退出，从而停止定时器。

### 5. 处理可读事件

```cpp
void Timerfd::handleRead() {
    uint64_t u;  // 存储到期次数（每次到期为1，周期触发会累计）
    ssize_t s = read(_timerfd, &u, sizeof(uint64_t));
    if (s != sizeof(uint64_t)) {
        perror("read timerfd error");
    }
}
```

`timerfd`到期后，内核会向其写入一个 8 字节的无符号整数，表示从上次读取后定时器到期的次数。必须读取该数据，否则`timerfd`会一直处于可读状态，导致持续触发事件。

## 四、使用示例（`Test.cc`）

下面通过一个测试示例，展示如何使用`Timerfd`类：

```cpp
#include "Timerfd.h"
#include <unistd.h>
#include <iostream>
#include <functional>
#include <thread>

using std::cout;
using std::endl;
using std::bind;
using std::thread;

// 自定义任务类
class MyTask {
public:
    void process() {
        cout << ">> MyTask is running" << endl;
    }
};

void test() {
    MyTask task;
    // 创建定时器：初始延迟1秒，周期4秒，回调绑定MyTask::process
    Timerfd tfd(bind(&MyTask::process, &task), 1, 4);

    // 启动子线程定时器（避免阻塞主线程）
    thread th(bind(&Timerfd::start, &tfd));

    // 主线程休眠30秒后停止定时器
    sleep(30);
    tfd.stop();
    th.join();  // 等待子线程结束
}

int main(int argc, char *argv[]) {
    test();
    return 0;
}
```

测试逻辑说明：

1. 定义`MyTask`类，其中`process`方法为定时任务的具体逻辑
2. 创建`Timerfd`对象，绑定`MyTask::process`作为回调，设置初始延迟 1 秒，每 4 秒触发一次
3. 使用子线程定时器的`start`方法（因为`start`会阻塞）
4. 主线程 30 秒后，调用`stop`停止定时器，并等待子线程结束