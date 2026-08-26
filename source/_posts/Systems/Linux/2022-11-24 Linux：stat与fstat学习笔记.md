---

title: Linux：stat 与 fstat 函数学习笔记
tags:
  - Linux
  - 函数
categories: [Systems, Linux]
abbrlink: 977e2aa9
date: 2022-11-24

---

## 一、函数概述

在 UNIX 和 Linux 系统编程中，`stat`和`fstat`用于获取文件状态信息，如大小、权限、修改时间等，信息存于`struct stat`结构体。二者功能相似，但参数类型和使用场景不同，合理使用可提升文件操作效率。

## 二、函数原型与参数对比

| 函数  | 原型                                                  | 参数说明                                            |
| ----- | ----------------------------------------------------- | --------------------------------------------------- |
| stat  | int stat(const char *pathname, struct stat *statbuf); | pathname：文件路径；statbuf：存储信息的结构体指针   |
| fstat | int fstat(int fd, struct stat *statbuf);              | fd：已打开文件描述符；statbuf：存储信息的结构体指针 |

stat依赖文件路径，适用于文件未打开时；`fstat`基于文件描述符，需文件已打开。

## 三、返回值与结构体信息

成功返回0，填充`struct stat`结构体；失败返回-1，设置`errno`。结构体常见字段包括设备 ID、`inode `编号、权限等。

## 四、核心差异分析

### 4.1 参数类型差异

stat用路径名，如stat("example.txt", &file_stat);；fstat用文件描述符，需先open文件，如：

```
int fd = open("example.txt", O_RDONLY);
if (fd != -1) {
    fstat(fd, &file_stat);
    close(fd);
}
```

### 4.2 使用场景差异

- `stat`：用于检查文件存在性、获取基础属性，如备份前判断文件大小。

- `fstat`：适用于文件已打开场景，如多线程操作中获取当前文件大小。

### 4.3 符号链接处理差异

默认二者跟随符号链接，获取链接本身属性用`lstat`。

## 五、底层实现与性能差异

stat需路径查找，可能多次磁盘 I/O；`fstat`基于文件描述符，性能更优。但stat获取最新元数据，`fstat`获取打开时状态，需按需选择。

## 六、与其他系统调用的关联

常与文件操作函数配合，如复制文件前用stat获取大小，内存映射前用fstat确定区域长度。并发场景需考虑同步。

## 七、示例代码对比

### 7.1 stat 示例

```
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>
int main() {
    struct stat file_stat;
    if (stat("test.txt", &file_stat) == -1) {
        perror("stat failed");
        return 1;
    }
    printf("File size: %ld bytes\n", (long)file_stat.st_size);
    return 0;
}
```

### 7.2 fstat 示例

```
#include <stdio.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>
int main() {
    int fd = open("test.txt", O_RDONLY);
    if (fd == -1) {
        perror("open failed");
        return 1;
    }
    struct stat file_stat;
    if (fstat(fd, &file_stat) == -1) {
        perror("fstat failed");
        close(fd);
        return 1;
    }
    printf("File size: %ld bytes\n", (long)file_stat.st_size);
    close(fd);
    return 0;
}
```