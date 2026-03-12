---
title: Linux：文件系统编程函数统计
tags:
  - Linux
  - 文件系统
  - 进程
categories: Linux
series: Linux
abbrlink: 2402767f
date: 2022-09-31 22:55:12
---

------

### 一、基于 tar 命令的代码压缩技术实践

在日常软件开发工作流中，代码文件的压缩归档是一项基础且核心的操作。tar 命令结合 Gzip 压缩算法，是实现高效文件压缩存储的典型解决方案，该方案不仅能够显著减小文件存储体积，同时可完整保留文件目录结构信息。

1. **文件归档与压缩实现**
   通过`tar cfvz`参数组合，可将所有以`test`开头的文件及目录打包并压缩为`package.tar.gz`格式文件，从而实现文件体积的有效缩减，具体命令如下：

```bash
tar cfvz package.tar.gz test*  # 归档并压缩
```

其中，`c`参数表示创建新的归档文件，`f`参数用于指定归档文件名，`v`参数可在操作过程中显示详细执行信息，`z`参数则启用 `Gzip` 压缩功能。

2. **压缩文件解包操作**
使用`tar xzvf`命令可对已压缩的文件包进行解压缩处理，具体操作指令如下：

```bash
tar xzvf package.tar.gz  # 解压缩
```

### 二、Vim 文本编辑器核心操作指令解析

Vim 作为一款功能强大的文本编辑工具，熟练掌握其增删改查等核心操作命令，能够显著提升代码编辑效率。

1. **文本复制操作**
   - **快速多行复制**：利用`nyy`命令可实现从当前行开始的`n`行文本复制（包含当前行），例如执行`5yy`命令即可完成 5 行文本的复制操作。
   - **跨区域文本复制**：`:[m],[n]y`命令可实现对指定行范围（从第`m`行到第`n`行）的文本复制，该操作在完成命令输入后需通过回车键执行确认，适用于跨区域文本内容的复制需求。
2. **文本删除与替换**
   `dd`命令用于删除当前行文本内容，若结合数字参数`ndd`，则可实现`n`行文本的批量删除；`cc`命令在删除当前行文本的同时，自动进入插入编辑模式，便于快速完成整行文本内容的替换操作。
3. **文本搜索功能**
   `/pattern`命令用于在文本中向后搜索匹配`pattern`的内容；`?pattern`命令则用于向前搜索匹配`pattern`的内容，这两个命令为开发者快速定位目标文本提供了有效工具。

### 三、基于 Sed 命令的文本处理技术应用

`Sed（Stream Editor）`作为流文本处理工具，在批量文本替换、代码修改以及日志处理等场景中具有重要应用价值。

1. **全局文本替换**
   `%s/pattern/substitute/g`命令可实现对文本中所有匹配`pattern`内容的全局替换。例如，通过执行`sed -i '%s/old_text/new_text/g' file.txt`命令，可直接对`file.txt`文件进行修改，将其中所有的`old_text`替换为`new_text`。
2. **行内文本替换**
   `s/pattern/substitute`命令仅替换光标所在行的第一个匹配项，若需替换该行内所有匹配项，则可添加`g`标志，如`sed 's/old/new/g' file.txt`命令，将实现对`file.txt`文件中每行所有匹配项的替换操作。

### 四、Alias 命令的高效配置与使用

`Alias` 机制能够将复杂的命令行操作映射为简洁的别名形式，对于提升终端操作效率具有显著作用。开发者可通过在`.bashrc`或`.zshrc`配置文件中添加别名设置，例如：

```bash
alias ll='ls -la'  # 列出详细文件信息
alias tarall='tar cfvz all.tar.gz *'  # 一键压缩当前目录所有文件
```

完成配置后，通过执行`source ~/.bashrc`命令或重启终端，即可使新设置的别名生效。

### 五、`Coredump` 文件的调试分析方法

`Coredump` 文件记录了程序崩溃时的系统状态信息，是进行程序错误定位与问题分析的关键资源，其调试流程如下：

1. **系统资源限制检查**：使用`ulimit -a`命令查看系统对 core 文件大小等资源参数的限制设置。
2. **解除 core 文件大小限制**：通过`ulimit -c unlimited`命令临时取消对 core 文件大小的限制。
3. **系统配置生效**（需 root 权限）：执行`sudo sysctl -p`命令使系统配置变更生效，但需注意该配置在每次会话重启后可能需要重新执行。
4. **使用 GDB 进行调试**：通过`gdb program_name core_file_name`命令对 core 文件进行调试分析，例如`gdb hello core_hello_1679196427`。
5. **调用堆栈分析**：在 GDB 调试环境中，执行`bt`或`backtrace`命令，可追溯程序崩溃时的函数调用链信息。

### 六、C 语言头文件与目标文件的编译链接机制

在 C 语言程序开发过程中，正确处理头文件与目标文件的编译链接过程，是确保程序正确构建与运行的重要环节。

1. **目标文件生成**
   使用`gcc -c sub.c -o sub.o`命令可将`sub.c`源文件编译生成`sub.o`目标文件。
2. **可执行程序链接**
   通过`gcc main.c sub.o -g -Wall -O0 -o`命令，指示 gcc 编译器将主程序文件与外部目标文件进行链接，生成可执行程序。其中，`-g`参数用于生成调试信息，`-Wall`参数开启所有编译警告提示，`-O0`参数关闭编译优化选项。

### 七、`Makefile` 自动化编译工具的实践应用

`Makefile`作为自动化编译工具，能够显著提升项目编译效率。以下是一个简单的 `Makefile` 示例：

```makefile
SRCS := $(wildcard *.c)
OUTS := $(patsubst %.c,%,$(SRCS))
CC := gcc
COM_OP := -Wall -g

.PHONY: clean rebuild all

all: $(OUTS)

% : %.c
    $(CC) $^ -o $@ $(COM_OP)

clean:
    $(RM) $(OUTS)

rebuild: clean all
```

上述 `Makefile` 中，`SRCS`变量通过`wildcard`函数获取所有`.c`源文件，`OUTS`变量将`.c`文件转换为对应的可执行文件名。`all`目标用于生成所有可执行文件，`clean`目标用于清理编译生成的文件，`rebuild`目标则按照先清理后重新生成的顺序执行编译操作。

### 八、函数功能模块分类解析

1. **目录流操作**
   - **当前工作目录获取**：`getcwd`函数用于获取当前工作目录的绝对路径，其函数原型为`char *getcwd(char *buf, size_t size)`。
   - **工作目录变更**：`chdir`函数可实现当前工作目录的变更操作，函数原型为`int chdir(const char *path)`。
   - **目录创建**：`mkdir`函数用于在程序运行过程中创建新目录，函数原型为`int mkdir(const char *pathname, mode_t mode)`，其中`mode`参数可通过`sscanf(argv[2], "%o", &mode);`语句将命令行参数字符串转换为八进制无符号整数进行设置。
   - **目录流操作**：包括`opendir`（打开目录流）、`closedir`（关闭目录流）、`readdir`（读取目录项，每次调用后目录流内部指针自动指向下一个条目）等操作函数。
   - **目录流定位**：`telldir`函数用于记录当前目录流位置，`seekdir`函数用于移动目录流到指定位置，`rewinddir`函数则将目录流重置为初始打开位置。
   - **文件信息获取**：`stat`函数用于获取文件详细信息，通过`int stat(const char *path, struct stat *buf);`调用，可获取文件修改时间（如`stat_buf.st_mtim.tv_sec`或`stat_buf.st_mtime`）、文件占用磁盘空间大小等信息。
   - **用户信息获取**：`getpwuid`和`getgrgid`函数分别用于根据用户 ID 和组 ID 获取用户和组的详细信息。
2. **无缓冲流操作**
   - **文件打开与关闭**：`open`函数用于打开文件，`close`函数用于关闭已打开的文件。
   - **文件读写操作**：`read`和`write`函数实现文件的读写功能，函数参数包括文件描述符、读写内容以及数据长度。
   - **文件大小调整**：`ftruncate`函数可实现文件大小的调整，当文件大小增加时，新增部分将填充为零字节；当文件大小减小时，超出新长度部分的数据将被丢弃，函数原型为`ftruncate(int fd, off_t length)`。
3. **管道文件操作**
   - **命名管道创建**：`mkfifo`函数用于创建命名管道，例如`mkfifo("myfifo", 0600);`。
   - **管道删除**：`unlink`函数用于删除已创建的管道，如`unlink("myfifo");`。
   - **匿名管道创建**：`pipe`函数用于创建匿名管道，是实现父子进程间通信的常用方式。
4. **文件映射操作**
   - **文件偏移调整**：`lseek`函数用于调整文件偏移量，`whence`参数指定偏移基准点（`SEEK_SET`表示相对于文件开头，`SEEK_CUR`表示相对于当前位置，`SEEK_END`表示相对于文件末尾），`offset`参数表示偏移量，正数表示向后偏移，负数表示向前偏移，例如`off_t src_size = lseek(src_fd, 0, SEEK_END);`可用于获取源文件大小。
   - **文件状态获取**：`fstat`函数用于获取文件状态信息，功能与`stat`函数类似，但针对文件描述符进行操作。
   - **内存映射操作**：`mmap`函数作为直接与内核交互的读写函数，用于将文件映射到内存空间，函数原型为`mmap(NULL,size_length,PROT_READ|PORT_WRITE,MAP_SHARED,int fd,off_t offset)`。
   - **内存操作**：`memcpy`函数用于内存数据复制，`munmap`函数用于释放已映射的内存空间。
5. **重定向操作**
   - **文件描述符获取**：`fileno`函数可根据指向文件的指针，获取已打开文件流的文件描述符，例如`FILE *p=fopen("","");`。
   - **文件描述符复制**：`dup`和`dup2`函数用于实现文件描述符的复制操作，其中`dup2`函数可将新文件描述符指向旧文件描述符。在进行重定向操作时，需注意使用`fflush(stdout);`等语句刷新缓冲区，以避免数据丢失问题。
6. **管道与 IO 多路复用**
   - **命名管道应用**：通过`mkfifo name.pipe`命令创建命名管道，例如`echo hello > 1.pipe`可实现向管道写入数据操作。
   - **IO 多路复用 - Select 机制**：`select`函数用于监听多个文件描述符，其函数原型为`int select（int nfds ,fd_set *readfds,fd_set *writefds,fd_set *exceptfds,struct timeval *timeout）`。其中，`nfds`表示文件描述符总数加一，`readfds`、`writefds`、`exceptfds`分别为读操作、写操作和异常操作的文件描述符集合，`timeout`参数指定监听操作的阻塞时间。在实际使用中，需通过`FD_ZERO`、`FD_SET`、`FD_CLR`、`FD_ISSET`等宏进行监听描述符集合的构建与管理。
7. **进程操作**
   - **进程管理 Shell 指令**：`ps -elf`和`ps aux`命令用于查看系统进程信息，`free -h`命令用于查看内存使用情况，`top`命令用于实时监控系统进程状态，`kill`命令用于终止指定进程。此外，通过`&`符号可将命令置于后台执行，利用`jobs`、`fg`、`bg`命令可实现前台与后台进程的管理操作。
   - **进程创建**：`system`函数用于执行外部程序，`fork`函数用于创建子进程并返回进程 ID，`execl`和`execv`函数用于子进程执行新的命令，其中`execv`函数采用数组形式传递命令参数。
   - **进程退出**：包括`exit`（C 语言标准库函数）、`_exit`（系统调用函数）、`_Exit`（C 语言标准库函数）和`abort`（库函数）等多种进程退出方式。
   - **进程控制**：`wait`和`waitpid`函数用于等待子进程结束并获取其执行状态信息。
   - **守护进程操作**：通过`getpid`获取进程 ID，`getpgrp`获取进程组 ID，`setpgid`设置进程组 ID，`getsid`获取会话 ID，`setsid`创建新的会话等操作，实现守护进程的相关管理功能。

-----
<img src="/img/PageCode/56.1.png" alt=" Linux：文件系统编程函数统计" style="width: 90%;height: auto;margin: 0 auto;display: block;border: 3px solid #f0f0f0;border-radius: 12px;box-shadow: 0 4px 8px rgba(0,0,0,0.1);">