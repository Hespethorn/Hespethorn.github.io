---


title: 《Linux C 语言 TCP Socket 编程详解》学习笔记
tags:
  - URL
  - 计算机网络
  - 网址
  - Computer-Networking
categories: [Networking]
abbrlink: 29e62ba
date: 2023-03-24
series: [Networking]
---

## 一、Socket 编程基础

### 1.1 Socket 概述

Socket 作为网络编程接口，构建了异构主机间进程通信的基础框架体系。在 Linux C 开发环境中，其作为网络通信实现的核心技术，通过标准化接口对底层协议进行封装，实现了跨平台的编程能力。从抽象层面来看，Socket 可类比为网络通信中的虚拟通信管道，不同主机间的进程借助这些管道进行数据交互，并遵循统一的通信规则，从而确保异构系统间的兼容性与通信稳定性。

### 1.2 TCP 与 UDP 协议特性比较

传输层协议栈的核心由 TCP 和 UDP 协议构成，二者在连接管理机制、数据传输可靠性以及通信模式等方面存在显著差异：

- **TCP 协议**：作为基于字节流的面向连接协议，TCP 通过三次握手机制建立可靠连接，并采用确认应答机制与滑动窗口算法，保障数据传输的完整性与有序性。该协议适用于文件传输、网页浏览等对数据准确性要求严苛的应用场景。
- **UDP 协议**：以数据报为基本传输单元的无连接协议，UDP 不具备数据重传与流量控制机制，因而具有低延迟特性。这种特性使其在视频直播、在线游戏等允许少量数据丢失的实时性场景中得到广泛应用。

## 二、TCP Socket 编程流程

基于经典的 C/S 架构模型，TCP Socket 编程实现网络通信需遵循以下标准化流程：

1. **服务器端初始化**：通过系统调用创建 Socket 描述符，并将其与指定的 IP 地址和端口号进行绑定，完成网络地址映射。
2. **监听状态设置**：将服务器 Socket 设置为监听模式，建立待处理连接队列，用于暂存客户端的连接请求。
3. **客户端连接建立**：客户端创建 Socket 后，通过 TCP 三次握手协议与服务器建立可靠连接。
4. **双向数据传输**：连接建立完成后，通信双方通过 Socket 描述符进行数据的读写操作。
5. **连接资源释放**：通信任务结束后，关闭 Socket 连接并释放相关系统资源。

## 三、核心函数详解

### 3.1 socket () 函数

```
#include <sys/socket.h>

int socket(int domain, int type, int protocol);
```

该函数用于创建 Socket 通信端点，其参数语义如下：

- **domain**：指定协议族，常见取值包括 `AF_INET`（IPv4 协议族）和 `AF_INET6`（IPv6 协议族）。
- **type**：定义 Socket 类型，`SOCK_STREAM` 对应 TCP 协议的字节流传输模式，`SOCK_DGRAM` 对应 UDP 协议的数据报传输模式。
- **protocol**：通常设置为 0，由系统自动选择适配的传输协议。

函数执行成功时返回非负整数的 Socket 描述符，失败时返回 -1，并设置 `errno` 错误码。示例代码如下：

```
int sockfd = socket(AF_INET, SOCK_STREAM, 0);

if (sockfd < 0) {
    perror("socket creation failed");
    exit(EXIT_FAILURE);
}
```

### 3.2 bind () 函数

```
#include <sys/socket.h>

int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

该函数实现 Socket 与网络地址的绑定操作，参数说明如下：

- **sockfd**：由 `socket` 函数返回的 Socket 描述符。
- **addr**：指向 `sockaddr` 结构的指针，用于存储目标网络地址信息。
- **addrlen**：指定地址结构的长度。

函数执行成功返回 0，失败返回 -1 并设置 `errno` 错误码。示例代码如下：

```
struct sockaddr_in server_addr;
server_addr.sin_family = AF_INET;
server_addr.sin_addr.s_addr = INADDR_ANY;
server_addr.sin_port = htons(8888);

if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
    perror("bind failed");
    exit(EXIT_FAILURE);
}
```

### 3.3 listen () 函数

```
#include <sys/socket.h>

int listen(int sockfd, int backlog);
```

该函数用于将服务器 Socket 设置为监听状态，参数定义如下：

- **sockfd**：已完成地址绑定的服务器 Socket 描述符。
- **backlog**：指定等待连接队列的最大长度。

函数执行成功返回 0，失败返回 -1 并设置 `errno` 错误码。示例代码如下：

```
if (listen(sockfd, 5) < 0) {
    perror("listen failed");
    exit(EXIT_FAILURE);
}
```

### 3.4 accept () 函数

```
#include <sys/socket.h>

int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
```

该函数用于接受客户端的连接请求，在服务器处于监听状态时将阻塞执行。参数说明如下：

- **sockfd**：处于监听状态的服务器 Socket 描述符。
- **addr**：用于存储客户端地址信息的指针。
- **addrlen**：指向地址结构长度值的指针。

函数执行成功时返回新的 Socket 描述符，用于后续通信；失败时返回 -1 并设置 `errno` 错误码。示例代码如下：

```
struct sockaddr_in client_addr;
socklen_t client_addr_len = sizeof(client_addr);
int new_sockfd = accept(sockfd, (struct sockaddr *)&client_addr, &client_addr_len);

if (new_sockfd < 0) {
    perror("accept failed");
    exit(EXIT_FAILURE);
}
```

### 3.5 connect () 函数

```
#include <sys/socket.h>

int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

该函数用于客户端主动发起与服务器的连接请求，参数定义与 `bind` 函数类似。函数执行成功返回 0，失败返回 -1 并设置 `errno` 错误码。示例代码如下：

```
struct sockaddr_in server_addr;
server_addr.sin_family = AF_INET;
inet_pton(AF_INET, "127.0.0.1", &server_addr.sin_addr);
server_addr.sin_port = htons(8888);

if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
    perror("connect failed");
    exit(EXIT_FAILURE);
}
```

### 3.6 send () 与 recv () 函数

```
#include <sys/socket.h>

ssize_t send(int sockfd, const void *buf, size_t len, int flags);
ssize_t recv(int sockfd, void *buf, size_t len, int flags);
```

`send` 函数用于数据发送操作，`recv` 函数用于数据接收操作，参数说明如下：

- **sockfd**：已建立连接的 Socket 描述符。
- **buf**：在 `send` 函数中指向待发送数据的缓冲区，在 `recv` 函数中指向用于存储接收数据的缓冲区。
- **len**：指定数据缓冲区的长度。
- **flags**：通常设置为 0，用于控制数据传输的特殊行为。

函数执行成功时返回实际收发的字节数，失败时返回 -1 并设置 `errno` 错误码。示例代码如下：

```
// 发送数据
char send_buf[] = "Hello, Server!";
ssize_t send_bytes = send(new_sockfd, send_buf, sizeof(send_buf), 0);
if (send_bytes < 0) {
    perror("send failed");
    close(new_sockfd);
    exit(EXIT_FAILURE);
}

// 接收数据
char recv_buf[1024];
ssize_t recv_bytes = recv(new_sockfd, recv_buf, sizeof(recv_buf), 0);
if (recv_bytes < 0) {
    perror("recv failed");
    close(new_sockfd);
    exit(EXIT_FAILURE);
}
recv_buf[recv_bytes] = '\0';
```

### 3.7 close () 函数

```
#include <unistd.h>

int close(int fd);
```

该函数用于关闭 Socket 连接并释放相关系统资源，执行成功返回 0，失败返回 -1 并设置 `errno` 错误码。示例代码如下：

```
if (close(sockfd) < 0) {
    perror("close failed");
    exit(EXIT_FAILURE);
}
```

## 四、完整示例代码

{% tabs  %}

<!-- tab 服务器端代码 -->

```
#include <stdio.h>      // 标准输入输出库，提供printf、perror等函数
#include <stdlib.h>     // 标准库，提供exit、EXIT_FAILURE等定义
#include <string.h>     // 字符串处理库，提供strlen等函数
#include <sys/socket.h> // Socket编程核心库，提供socket、bind等系统调用
#include <arpa/inet.h>  // 网络地址转换库，提供htons、inet_pton等函数
#include <unistd.h>     // Unix标准库，提供close等函数

#define PORT 8888                   // 服务器监听端口
#define MAX_BUFFER_SIZE 1024        // 接收缓冲区大小

int main() {
    int sockfd, new_sockfd;         // sockfd:监听socket，new_sockfd:通信socket
    struct sockaddr_in server_addr, client_addr; // 服务器和客户端地址结构体
    socklen_t client_addr_len = sizeof(client_addr); // 客户端地址长度
    char buffer[MAX_BUFFER_SIZE];   // 数据接收缓冲区

    // 1. 创建TCP Socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket creation failed");
        exit(EXIT_FAILURE);
    }

    // 2. 配置并绑定服务器地址
    server_addr.sin_family = AF_INET;        // IPv4地址族
    server_addr.sin_addr.s_addr = INADDR_ANY; // 监听所有可用接口
    server_addr.sin_port = htons(PORT);      // 端口号(网络字节序)
    
    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    // 3. 设置监听状态
    if (listen(sockfd, 5) < 0) {
        perror("listen failed");
        exit(EXIT_FAILURE);
    }
    printf("Server listening on port %d...\n", PORT);

    // 4. 接受客户端连接(阻塞调用)
    new_sockfd = accept(sockfd, (struct sockaddr *)&client_addr, &client_addr_len);
    if (new_sockfd < 0) {
        perror("accept failed");
        exit(EXIT_FAILURE);
    }
    printf("Client connected: %s:%d\n", 
           inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));

    // 5. 接收客户端数据
    ssize_t recv_bytes = recv(new_sockfd, buffer, sizeof(buffer), 0);
    if (recv_bytes < 0) {
        perror("recv failed");
        close(new_sockfd);
        close(sockfd);
        exit(EXIT_FAILURE);
    }
    buffer[recv_bytes] = '\0'; // 添加字符串结束符
    printf("Received from client: %s\n", buffer);

    // 6. 发送响应数据
    const char *response = "Message received successfully";
    ssize_t send_bytes = send(new_sockfd, response, strlen(response), 0);
    if (send_bytes < 0) {
        perror("send failed");
    }

    // 7. 关闭连接
    close(new_sockfd);  // 关闭通信socket
    close(sockfd);      // 关闭监听socket
    return 0;
}
```

<!-- endtab -->

<!-- tab 客户端代码 -->

```
#include <stdio.h>      // 提供标准输入输出函数(printf,perror)
#include <stdlib.h>     // 提供标准库函数(exit,EXIT_FAILURE)
#include <string.h>     // 提供字符串处理函数(strlen)
#include <sys/socket.h> // 提供socket相关系统调用
#include <arpa/inet.h>  // 提供IP地址转换函数(inet_pton)
#include <unistd.h>     // 提供Unix标准函数(close)

// 定义服务器IP地址(本地回环地址)
#define SERVER_IP "127.0.0.1"
// 定义通信端口号
#define PORT 8888
// 定义接收缓冲区大小
#define MAX_BUFFER_SIZE 1024

int main() {
    // 存储socket文件描述符
    int sockfd;
    // 存储服务器地址信息的结构体
    struct sockaddr_in server_addr;
    // 接收数据的缓冲区
    char buffer[MAX_BUFFER_SIZE];

    // 1. 创建TCP Socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    // 检查socket创建是否成功
    if (sockfd < 0) {
        perror("socket creation failed");
        exit(EXIT_FAILURE);
    }

    // 2. 配置服务器地址信息
    server_addr.sin_family = AF_INET;  // 设置地址族为IPv4
    // 将点分十进制IP转换为二进制形式
    inet_pton(AF_INET, SERVER_IP, &server_addr.sin_addr);
    // 将端口号从主机字节序转为网络字节序
    server_addr.sin_port = htons(PORT);

    // 3. 连接到服务器
    if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("connect failed");
        exit(EXIT_FAILURE);
    }

    // 4. 发送数据到服务器
    const char *message = "Hello, Server!";
    ssize_t send_bytes = send(sockfd, message, strlen(message), 0);
    if (send_bytes < 0) {
        perror("send failed");
        close(sockfd);    // 发送失败时关闭socket
        exit(EXIT_FAILURE);
    }

    // 5. 接收服务器响应
    ssize_t recv_bytes = recv(sockfd, buffer, sizeof(buffer), 0);
    if (recv_bytes < 0) {
        perror("recv failed");
        close(sockfd);    // 接收失败时关闭socket
        exit(EXIT_FAILURE);
    }
    // 将接收到的数据转为C风格字符串
    buffer[recv_bytes] = '\0';
    printf("Received from server: %s\n", buffer);

    // 6. 关闭socket连接
    close(sockfd);
    return 0;
}
```

<!-- endtab -->

{% endtabs %}

## 五、编译与运行说明

### 5.1 编译

在终端环境下进入代码所在目录，执行以下编译命令：

```
gcc server.c -o server
gcc client.c -o client
```

上述命令将分别生成 `server` 和 `client` 可执行文件。

### 5.2 运行

开启一个终端窗口，运行服务器程序：

```
./server
```

开启另一个终端窗口，运行客户端程序：

```
./client
```

此时客户端将与服务器建立连接，并完成数据的发送与接收操作，通信数据将在终端窗口中显示。
