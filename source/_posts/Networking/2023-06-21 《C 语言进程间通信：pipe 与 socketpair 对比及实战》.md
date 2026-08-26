---


title: 进程间通信：pipe 与 socketpair 对比
tags:
  - 进程间通信 (IPC)
  - Unix 系统编程
  - pipe
  - socketpair
  - 文件描述符
  - fork
  - Computer-Networking
categories: [Networking]
abbrlink: d568c8d6
date: 2023-06-21


---

## 一、pipe 机制详解

### 1.1 管道的基本概念

管道 (pipe) 是 Unix 系统中最古老的 IPC 机制之一，它通过一对文件描述符实现进程间的单向通信：


*   一个文件描述符用于读取数据 (`fd[0]`)


*   另一个文件描述符用于写入数据 (`fd[1]`)


*   数据在管道中以先进先出 (FIFO) 的方式传输


管道本质上是内核维护的一个缓冲区，其大小因系统而异 (通常为 64KB)，当缓冲区满时，写入操作会阻塞；当缓冲区空时，读取操作会阻塞。


### 1.2 pipe () 系统调用

```
#include <unistd.h>
int pipe(int pipefd[2]);
```

*   成功时返回 0，失败时返回 -1 并设置 errno


*   `pipefd[0]`：读取端文件描述符


*   `pipefd[1]`：写入端文件描述符


### 1.3 父子进程通信实现

使用 pipe 进行父子进程通信的典型流程：


1.  创建管道


2.  调用 `fork()` 创建子进程


3.  关闭不需要的文件描述符


4.  进行数据读写操作


5.  关闭所有文件描述符


```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
int main() {

   int pipefd[2];
   pid_t pid;
   char buf[1024];

   // 创建管道
   if (pipe(pipefd) == -1) {
       perror("pipe创建失败");
       exit(EXIT_FAILURE);
   }

   // 创建子进程
   pid = fork();
   if (pid == 0) {  // 子进程
       // 子进程关闭写入端
       close(pipefd[1]);
       // 从管道读取数据
       ssize_t n = read(pipefd[0], buf, sizeof(buf) - 1);
       if (n == -1) {
           perror("读取失败");
           exit(EXIT_FAILURE);
       }
       buf[n] = '0';
       printf("子进程收到: %sn", buf);
       // 关闭读取端
       close(pipefd[0]);
       exit(EXIT_SUCCESS);
   } else {  // 父进程
       // 父进程关闭读取端
       close(pipefd[0]);
       // 向管道写入数据
       const char *msg = "Hello from parent";
       if (write(pipefd[1], msg, strlen(msg)) == -1) {
           perror("写入失败");
           exit(EXIT_FAILURE);
       }

       // 关闭写入端
       close(pipefd[1]);
       // 等待子进程结束
       wait(NULL);
       exit(EXIT_SUCCESS);
   }
}
```

### 1.4 双向通信实现

管道本身是单向的，要实现双向通信需要创建两个管道：

```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
int main() {
   int parent_to_child[2];  // 父进程到子进程的管道
   int child_to_parent[2];  // 子进程到父进程的管道
   pid_t pid;
   char buf[1024];
   // 创建两个管道
   if (pipe(parent_to_child) == -1 || pipe(child_to_parent) == -1) {
       perror("pipe创建失败");
       exit(EXIT_FAILURE);
   }
   pid = fork();
   if (pid == -1) {
       perror("fork失败");
       exit(EXIT_FAILURE);
   }
   if (pid == 0) {  // 子进程
       // 关闭不需要的文件描述符
       close(parent_to_child[1]);  // 关闭父->子管道的写入端
       close(child_to_parent[0]);  // 关闭子->父管道的读取端
       // 从父进程读取数据
       ssize_t n = read(parent_to_child[0], buf, sizeof(buf) - 1);
       if (n == -1) {
           perror("子进程读取失败");
           exit(EXIT_FAILURE);
       }
       buf[n] = '0';
       printf("子进程收到: %sn", buf);
       // 向父进程发送数据
      const char *msg = "Hello from child";
       if (write(child_to_parent[1], msg, strlen(msg)) == -1) {
           perror("子进程写入失败");
           exit(EXIT_FAILURE);
       }
       // 关闭所有文件描述符
       close(parent_to_child[0]);
       close(child_to_parent[1]);
       exit(EXIT_SUCCESS);
   } else {  // 父进程
       // 关闭不需要的文件描述符
       close(parent_to_child[0]);  // 关闭父->子管道的读取端
       close(child_to_parent[1]);  // 关闭子->父管道的写入端
       // 向子进程发送数据
       const char *msg = "Hello from parent";
       if (write(parent_to_child[1], msg, strlen(msg)) == -1) {
           perror("父进程写入失败");
           exit(EXIT_FAILURE);
       }
       // 等待子进程响应
       sleep(1);
       // 从子进程读取数据
       ssize_t n = read(child_to_parent[0], buf, sizeof(buf) - 1);
       if (n == -1) {
           perror("父进程读取失败");
           exit(EXIT_FAILURE);
       }
       buf[n] = '0';
      printf("父进程收到: %sn", buf);
       // 关闭所有文件描述符
       close(parent_to_child[1]);
       close(child_to_parent[0]);
       // 等待子进程结束
       wait(NULL);
       exit(EXIT_SUCCESS);
   }
}
```

### 1.5 pipe 使用注意事项

*   管道是半双工的，默认情况下不支持双向通信
*   管道只能在具有亲缘关系的进程间使用 (父子进程、兄弟进程)
*   必须正确关闭不需要的文件描述符，否则可能导致读取端阻塞


*   管道有容量限制，写入数据超过缓冲区大小时会阻塞


*   当所有写入端关闭后，读取端读取会返回 0 (EOF)


*   当所有读取端关闭后，写入操作会导致进程收到 SIGPIPE 信号

## 二、socketpair 机制详解

### 2.1 socketpair 的基本概念

socketpair 创建一对相互连接的套接字，与 pipe 相比：


*   支持全双工通信


*   可用于任意进程间通信 (不仅限于亲缘进程)


*   提供更多的控制选项


*   可通过 `sendmsg/recvmsg` 传递文件描述符


### 2.2 socketpair () 系统调用

```
#include <sys/types.h>
#include <sys/socket.h>
int socketpair(int domain, int type, int protocol, int sv[2]);
```

*   `domain`：协议族，通常使用 `AF_UNIX` (本地通信)


*   `type`：套接字类型，`SOCK_STREAM` (字节流) 或 `SOCK_DGRAM` (数据报)


*   `protocol`：协议，通常为 0 (默认协议)


*   `sv`：输出参数，存储创建的两个套接字描述符


*   成功时返回 0，失败时返回 -1 并设置 errno


### 2.3 进程间通信实现

使用 socketpair 进行双向通信的示例：


```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/wait.h>
int main() {
   int sv[2];
   pid_t pid;
   char buf[1024];
   // 创建套接字对
   if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) == -1) {
       perror("socketpair创建失败");
       exit(EXIT_FAILURE);
   }
   // 创建子进程
   pid = fork();
   if (pid == -1) {
       perror("fork失败");
       exit(EXIT_FAILURE);
   }
   if (pid == 0) {  // 子进程
       // 关闭一个套接字(每个进程使用一个)
       close(sv[1]);
       // 从套接字读取数据
       ssize_t n = read(sv[0], buf, sizeof(buf) - 1);
       if (n == -1) {
           perror("子进程读取失败");
           exit(EXIT_FAILURE);
       }
       buf[n] = '0';
       printf("子进程收到: %sn", buf);
       // 向父进程发送数据
       const char *msg = "Hello from child";
       if (write(sv[0], msg, strlen(msg)) == -1) {
           perror("子进程写入失败");
           exit(EXIT_FAILURE);
       }
      // 关闭套接字
       close(sv[0]);
       exit(EXIT_SUCCESS);
   } else {  // 父进程
       // 关闭一个套接字
       close(sv[0]);
       // 向子进程发送数据
       const char *msg = "Hello from parent";
       if (write(sv[1], msg, strlen(msg)) == -1) {
           perror("父进程写入失败");
           exit(EXIT_FAILURE);
       }
       // 从子进程读取数据
       ssize_t n = read(sv[1], buf, sizeof(buf) - 1);
       if (n == -1) {
           perror("父进程读取失败");
           exit(EXIT_FAILURE);
       }
       buf[n] = '0';
       printf("父进程收到: %sn", buf);
       // 关闭套接字
       close(sv[1]);
       // 等待子进程结束
       wait(NULL);
       exit(EXIT_SUCCESS);
   }
}
```

### 2.4 通过 socketpair 传递文件描述符

socketpair 的一个强大功能是能够传递文件描述符，这在许多场景下非常有用：


```
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <errno.h>
// 传递文件描述符的辅助函数
ssize_t send_fd(int sockfd, int fd) {
   struct msghdr msg = {0};
   struct iovec iov;
   char buf[1] = {'x'};  // 发送一个虚拟字节
   // 设置消息头
   union {
       struct cmsghdr cm;
       char control[CMSG_SPACE(sizeof(int))];
   } control_un;
   msg.msg_control = control_un.control;
   msg.msg_controllen = sizeof(control_un.control);
   // 设置控制消息
   struct cmsghdr *cmptr = CMSG_FIRSTHDR(&msg);
   cmptr->cmsg_len = CMSG_LEN(sizeof(int));
   cmptr->cmsg_level = SOL_SOCKET;
   cmptr->cmsg_type = SCM_RIGHTS;  // 用于传递文件描述符
  *((int *)CMSG_DATA(cmptr)) = fd;
   // 设置数据部分
   msg.msg_iov = &iov;
   msg.msg_iovlen = 1;
   iov.iov_base = buf;
   iov.iov_len = 1;
   return sendmsg(sockfd, &msg, 0);
}
// 接收文件描述符的辅助函数
ssize_t recv_fd(int sockfd, int *fd) {
   struct msghdr msg = {0};
   struct iovec iov;
   char buf[1];
   // 设置数据部分
   iov.iov_base = buf;
   iov.iov_len = 1;
   msg.msg_iov = &iov;
   msg.msg_iovlen = 1;
   // 设置控制消息缓冲区
   union {
       struct cmsghdr cm;
       char control[CMSG_SPACE(sizeof(int))];
   } control_un;
   msg.msg_control = control_un.control;
   msg.msg_controllen = sizeof(control_un.control);
   // 接收消息
   ssize_t n = recvmsg(sockfd, &msg, 0);
   if (n <= 0) {
       return n;
   }
   // 提取文件描述符
   struct cmsghdr *cmptr = CMSG_FIRSTHDR(&msg);
   if (cmptr == NULL) {
       return -1;  // 没有控制消息
  }
   if (cmptr->cmsg_level != SOL_SOCKET ||
       cmptr->cmsg_type != SCM_RIGHTS) {
       return -1;  // 不是预期的控制消息
   }
   *fd = *((int *)CMSG_DATA(cmptr));
   return n;
}
int main() {
   int sv[2];
   pid_t pid;
   int fd, new_fd;
   char buf[1024];
   // 创建套接字对
   if (socketpair(AF_UNIX, SOCK_STREAM, 0, sv) == -1) {
       perror("socketpair创建失败");
       exit(EXIT_FAILURE);
   }
   // 创建测试文件
   fd = open("test.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
   if (fd == -1) {
       perror("文件打开失败");
       exit(EXIT_FAILURE);
   }
   write(fd, "测试文件内容", strlen("测试文件内容"));
   close(fd);
   // 重新以只读方式打开
   fd = open("test.txt", O_RDONLY);
   if (fd == -1) {
       perror("文件打开失败");
       exit(EXIT_FAILURE);
   }
   // 创建子进程
   pid = fork();
   if (pid == 0) {  // 子进程
       close(sv[1]);  // 关闭不使用的套接字
       // 接收文件描述符
       // 读取通过传递的文件描述符打开的文件
       ssize_t n = read(new_fd, buf, sizeof(buf) - 1);
       buf[n] = '0';
       printf("子进程读取到的文件内容: %sn", buf);
       // 关闭文件和套接字
       close(new_fd);
       close(sv[0]);
       exit(EXIT_SUCCESS);
   } else {  // 父进程
       close(sv[0]);  // 关闭不使用的套接字
       // 发送文件描述符
       if (send_fd(sv[1], fd) == -1) {
           perror("发送文件描述符失败");
           exit(EXIT_FAILURE);
       }
       // 关闭文件和套接字
       close(fd);
       close(sv[1]);
       // 等待子进程结束
       wait(NULL);
       // 清理测试文件
       unlink("test.txt");
       exit(EXIT_SUCCESS);
   }
}
```

### 2.5 socketpair 使用注意事项

*   socketpair 创建的套接字是全双工的，支持双向通信


*   套接字对可以在任意进程间使用，不限于亲缘进程


*   可以通过 `SCM_RIGHTS` 控制消息传递文件描述符


*   与 pipe 不同，不需要关闭一个方向来使用另一个方向


*   使用 `SOCK_STREAM` 类型时提供字节流服务，保证数据有序且不丢失


*   使用 `SOCK_DGRAM` 类型时提供数据报服务，保留消息边界

## 三、pipe 与 socketpair 对比分析

| 特性   | pipe      | socketpair     |
| --------- | -------------- | ------------------- |
| 通信方向 | 半双工       | 全双工            |
| 适用进程 | 主要用于亲缘进程  | 可用于任意进程        |
| 通信方式 | 仅支持数据传输   | 支持数据传输和文件描述符传递 |
| 创建方式 | 简单，单一系统调用 | 稍复杂，需要指定协议族和类型 |
| 灵活性  | 较低        | 较高，支持多种选项      |
