---
title: getaddrinfo 查找网络IP
tags:
  - getaddrinfo
categories:
  - C++
  - Foundational Syntax and Core Concepts
series: Foundational Syntax and Core Concepts
abbrlink: 70d59293
date: 2025-09-04
---

## 一、网络地址解析的必要性

在网络通信中，应用程序通常需要通过**域名**（如[www.example.com](http://www.example.com)）而非直接使用 IP 地址（如[93.184.216.34](http://93.184.216.34)）来定位目标主机，同时需要通过**服务名**（如http）而非直接使用端口号（如80）来指定通信端口。这种抽象带来了以下核心需求：

- **用户友好性**：人类更容易记忆域名而非数字 IP

- **协议兼容性**：需同时支持 IPv4 与 IPv6，避免硬编码地址类型

- **服务灵活性**：服务端口可能动态分配，通过服务名解析更可靠

- **网络拓扑适应**：同一域名可能对应多个 IP（负载均衡场景），需支持多地址选择

传统地址解析方法（如`gethostbyname`、`getservbyname`）存在明显局限性：仅支持 IPv4、无法统一处理主机名与服务名、线程安全性差。`getaddrinfo`作为 POSIX 标准接口，完美解决了这些问题，是现代 C++ 网络编程的首选地址解析方案。

## 二、`getaddrinfo` 函数

`getaddrinfo`是一个**统一的地址解析接口**，可同时处理主机名→IP 地址、服务名→端口号的解析，并返回可直接用于socket调用的地址结构。

### 2.1 函数原型

```
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>

int `getaddrinfo`(const char *node,        // 主机名/IP地址字符串
                const char *service,     // 服务名/端口号字符串
                const struct addrinfo *hints,  // 解析参数提示
                struct addrinfo **res);  // 输出：解析结果链表
```

### 2.2 参数详解

#### 2.2.1 输入参数

| 参数名  | 含义与取值                                                   | 典型用法                                |
| ------- | ------------------------------------------------------------ | --------------------------------------- |
| node    | 目标主机标识：- 域名（如"www.baidu.com"）- IPv4 地址（如"192.168.1.1"）- IPv6 地址（如"2001:0db8:85a3:0000:0000:8a2e:0370:7334"）- NULL（服务器端绑定场景，配合AI_PASSIVE） | 客户端："www.example.com"服务器端：NULL |
| service | 目标服务标识：- 服务名（如"http"、"ssh"，需系统服务数据库支持）- 端口号字符串（如"80"、"22"）- NULL（需手动指定端口） | 客户端："http"或"8080"服务器端："80"    |
| hints   | 解析策略提示（结构体指针）：- 为NULL时，返回所有可能的地址类型- 非NULL时，按结构体字段过滤结果 | 见 2.2.3 小节                           |

#### 2.2.2 输出参数

res：指向`struct addrinfo`结构体链表的指针，每个节点包含一个可用的网络地址信息。结构体定义如下：

```
struct addrinfo {
    int ai_flags;         // 标志位（如AI_PASSIVE、AI_CANONNAME）
    int ai_family;        // 地址族（AF_INET=IPv4，AF_INET6=IPv6，AF_UNSPEC=任意）
    int ai_socktype;      // 套接字类型（SOCK_STREAM=TCP，SOCK_DGRAM=UDP）
    int ai_protocol;      // 协议类型（IPPROTO_TCP=TCP，IPPROTO_UDP=UDP，0=任意）
    socklen_t ai_addrlen; // ai_addr指向的地址结构体长度
    char *ai_canonname;   // 主机的规范域名（仅当指定AI_CANONNAME时有效）
    struct sockaddr *ai_addr; // 指向sockaddr_in（IPv4）或sockaddr_in6（IPv6）的指针
    struct addrinfo *ai_next; // 指向下一个结果节点的指针（链表结构）
};
```

#### 2.2.3 hints 关键字段配置

hints是控制解析行为的核心，常见配置组合如下：

| 字段        | 取值与含义                                                   |
| ----------- | ------------------------------------------------------------ |
| ai_family   | - AF_INET：仅返回 IPv4 地址- AF_INET6：仅返回 IPv6 地址- AF_UNSPEC：返回所有兼容地址（默认） |
| ai_socktype | - SOCK_STREAM：仅返回 TCP 相关地址- SOCK_DGRAM：仅返回 UDP 相关地址- 0：返回所有类型（默认） |
| ai_protocol | - IPPROTO_TCP：强制 TCP 协议- IPPROTO_UDP：强制 UDP 协议- 0：自动匹配（默认） |
| ai_flags    | - AI_PASSIVE：返回适用于服务器绑定（bind）的地址（如0.0.0.0）- AI_CANONNAME：获取主机规范域名- AI_NUMERICHOST：强制node为 IP 地址（不触发 DNS 解析）- AI_NUMERICSERV：强制service为端口号（不查服务数据库） |

### 2.3 返回值处理

- **成功**：返回0，解析结果存储在res指向的链表中

- **失败**：返回非0错误码（如EAI_NONAME、EAI_AGAIN），可通过gai_strerror(int errcode)获取人类可读的错误描述

## 三、完整示例代码

```#include <iostream>
#include <cstring>
#include <netdb.h>
#include <arpa/inet.h>
using std::cout;
using std::endl;
using std::cin;

void getAddrInfo(const char* domain) {
    struct addrinfo hints, *res;
    // 初始化hints结构体，避免随机值影响
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_UNSPEC;    // 同时支持IPv4和IPv6
    hints.ai_socktype = SOCK_STREAM;

    int ret = getaddrinfo(domain, NULL, &hints, &res);
    // 处理getaddrinfo调用失败的情况
    if (ret != 0) {
        cout << "域名解析失败: " << gai_strerror(ret) << endl;
        return;
    }

    bool found = false;
    struct addrinfo *p = res;
    for (; p != nullptr; p = p->ai_next) {
        char ipstr[INET6_ADDRSTRLEN];
        void* addr;
        const char* ipVersion;

        if (p->ai_family == AF_INET) {
            struct sockaddr_in* ipv4 = (struct sockaddr_in*)p->ai_addr;
            addr = &(ipv4->sin_addr);
            ipVersion = "IPv4";
        } else {
            struct sockaddr_in6* ipv6 = (struct sockaddr_in6*)p->ai_addr;
            addr = &(ipv6->sin6_addr);
            ipVersion = "IPv6";
        }
        // 将二进制IP地址转换为字符串
        inet_ntop(p->ai_family, addr, ipstr, sizeof(ipstr));
        cout << "  " << ipVersion << ": " << ipstr << endl;
        found = true;
    }

    freeaddrinfo(res); // 释放内存

    if (!found) {
        cout << "  未找到该域名的IP地址" << endl;
    }
}

int main(int argc, char* argv[]) {
    cout << "请输入你想查询的网址" << endl;

    char domain[1024] = {0};

    while (cin >> domain) {
        getAddrInfo(domain);
        memset(domain, 0, sizeof(domain));
        cout << "请输入你想查询的网址" << endl;
    }

    return 0;
}
```