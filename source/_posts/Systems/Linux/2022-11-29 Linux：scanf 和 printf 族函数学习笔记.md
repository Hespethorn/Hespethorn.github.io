---

title: Linux：输入输出与文件操作函数学习笔记整理
tags:
  - Linux
  - 函数
categories: [Systems, Linux]
abbrlink: f3bb7775
date: 2022-11-29

---

# 导言

在 C 语言的编程世界里，输入输出以及文件操作是与外界交互、处理数据存储的重要环节。`scanf`、`printf`、`open`、`fopen`、`read`、`fread`、`write`、`fwrite`、`fseek`、`lseek`、`mmap`这些函数各司其职，共同构建起强大的数据处理体系。本文将详细介绍这些函数的功能、用法、示例，并进行对比分析。

# 一、标准输入输出函数：scanf 与 printf

## 1. printf 函数及其变体
`printf`函数是 C 标准输入输出库（`stdio.h`）中用于格式化输出的函数，其原型为`int printf(const char *format, ...)`。其中，`format`是格式控制字符串，包含普通文本和格式说明符；`...`表示可变参数列表。

```plaintext
#include <stdio.h>

int main() {
    int num = 10;
    float f = 3.14;
    char str[] = "Hello, World!";
    printf("整数：%d，浮点数：%f，字符串：%s\n", num, f, str);
    return 0;
}
```

在上述代码中，`%d`、`%f`、`%s`分别对应十进制整数、浮点数、字符串的输出格式，将变量的值以指定格式输出到标准输出流（通常是终端）。

### 格式说明符

| 格式说明符 | 功能描述                        | 示例                                     |
| ---------- | ------------------------------- | ---------------------------------------- |
| `%d`       | 输出带符号的十进制整数          | `printf("%d", 10);` 输出 `10`            |
| `%f`       | 输出浮点数（默认保留 6 位小数） | `printf("%f", 3.14);` 输出 `3.140000`    |
| `%.nf`     | 输出浮点数并指定保留 n 位小数   | `printf("%.2f", 3.1415926);` 输出 `3.14` |
| `%s`       | 输出以空字符`\0`结尾的字符串    | `printf("%s", "Hello");` 输出 `Hello`    |

`printf`还有两个重要变体：

- `fprintf`**函数**：用于将格式化数据输出到指定文件，原型为`int fprintf(FILE *stream, const char *format, ...)`。

```plaintext
#include <stdio.h>

int main() {
    FILE *fp;
    int num = 20;
    fp = fopen("test.txt", "w");
    if (fp != NULL) {
        fprintf(fp, "文件中的整数：%d\n", num);
        fclose(fp);
    }
    return 0;
}
```

- `sprintf`**函数**：将格式化数据写入字符数组，原型为`int sprintf(char *str, const char *format, ...)`。

```plaintext
#include <stdio.h>

int main() {
    char buffer[100];
    int num = 30;
    sprintf(buffer, "字符串中的整数：%d", num);
    printf("%s\n", buffer);
    return 0;
}
```

## 2. scanf 函数及其变体

`scanf`函数用于从标准输入设备（通常是键盘）读取格式化数据，原型为`int scanf(const char *format, ...)`。与`printf`不同，`scanf`的可变参数列表需要传入变量的地址，通过指针实现数据写入。

```plaintext
#include <stdio.h>

int main() {
    int num;
    printf("请输入一个整数：");
    scanf("%d", &num);
    printf("你输入的整数是：%d\n", num);
    return 0;
}
```

上述代码通过`%d`格式说明符读取整数，并使用`&num`获取变量`num`的地址，将输入的数据存储到`num`中。

`scanf`的变体：

- `fscanf`**函数**：从指定文件流中读取格式化数据，原型为`int fscanf(FILE *stream, const char *format, ...)`。

```plaintext
#include <stdio.h>

int main() {
    FILE *fp;
    int num;
    fp = fopen("test.txt", "r");
    if (fp != NULL) {
        fscanf(fp, "文件中的整数：%d", &num);
        printf("从文件中读取的整数是：%d\n", num);
        fclose(fp);
    }
    return 0;
}
```

- `sscanf`**函数**：从字符串中解析格式化数据，原型为`int sscanf(const char *str, const char *format, ...)`。

```plaintext
#include <stdio.h>

int main() {
    char str[] = "整数：15";
    int num;
    sscanf(str, "整数：%d", &num);
    printf("从字符串中读取的整数是：%d\n", num);
    return 0;
}
```

# 二、文件操作函数：open、fopen、read、fread、write、fwrite、fseek、lseek、mmap

## 1. 文件打开函数：open 与 fopen

### open 函数

`open`是 UNIX/Linux 系统下的底层文件操作函数，在``头文件中声明，原型如下：


```plaintext
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

int open(const char *pathname, int flags);
int open(const char *pathname, int flags, mode_t mode);
```

其中，`pathname`是文件路径名，`flags`指定打开方式（如`O_RDONLY`只读、`O_WRONLY`只写、`O_RDWR`读写），`mode`在创建新文件时指定权限。

```plaintext
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd;
    fd = open("test.txt", O_RDONLY);
    if (fd == -1) {
        perror("open");
        return -1;
    }
    close(fd);
    return 0;
}
```

上述代码以只读方式打开`test.txt`文件，若失败通过`perror`输出错误信息。

### fopen 函数

`fopen`是 C 标准库提供的高层文件操作函数，在``中声明，原型为`FILE *fopen(const char *filename, const char *mode)`。其中，`filename`是文件名，`mode`指定打开模式（如`"r"`只读、`"w"`只写、`"a"`追加写）。
```
#include <stdio.h>

int main() {
    FILE *fp;
    fp = fopen("test.txt", "w");
    if (fp == NULL) {
        perror("fopen");
        return -1;
    }
    fclose(fp);
    return 0;
}
```

该代码以只写模式打开`test.txt`文件，若失败输出错误信息。

## 2. 文件读取函数：read 与 fread

### read 函数

`read`是与`open`配套的底层文件读取函数，原型为`ssize_t read(int fd, void *buf, size_t count)`。其中，`fd`是`open`返回的文件描述符，`buf`是数据缓冲区，`count`是期望读取的字节数。

```plaintext
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd;
    char buffer[100];
    ssize_t bytes_read;
    fd = open("test.txt", O_RDONLY);
    if (fd == -1) {
        perror("open");
        return -1;
    }
    bytes_read = read(fd, buffer, sizeof(buffer));
    if (bytes_read == -1) {
        perror("read");
    } else {
        buffer[bytes_read] = '\0';
        printf("读取的内容: %s\n", buffer);
    }
    close(fd);
    return 0;
}
```

上述代码从`test.txt`文件读取数据到`buffer`缓冲区并打印。

### fread 函数

`fread`是 C 标准库的文件读取函数，原型为`size_t fread(void *ptr, size_t size, size_t nmemb, FILE *stream)`。其中，`ptr`是缓冲区指针，`size`是每个数据项大小，`nmemb`是数据项数量，`stream`是`fopen`返回的文件指针。

```plaintext
#include <stdio.h>

typedef struct {
    int id;
    char name[50];
} Person;

int main() {
    FILE *fp;
    Person p[2];
    size_t items_read;
    fp = fopen("people.dat", "rb");
    if (fp == NULL) {
        perror("fopen");
        return -1;
    }
    items_read = fread(p, sizeof(Person), 2, fp);
    if (items_read < 2) {
        if (feof(fp)) {
            printf("已到达文件末尾，未读取到完整数据\n");
        } else {
            perror("fread");
        }
    } else {
        for (int i = 0; i < 2; i++) {
            printf("ID: %d, 姓名: %s\n", p[i].id, p[i].name);
        }
    }
    fclose(fp);
    return 0;
}
```

此代码从二进制文件`people.dat`中读取`Person`结构体数据。

## 3. 文件写入函数：write 与 fwrite

### write 函数

`write`是底层文件写入函数，原型为`ssize_t write(int fd, const void *buf, size_t count)`。其中，`fd`是文件描述符，`buf`是待写入数据缓冲区，`count`是写入字节数。

```plaintext
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd;
    char message[] = "Hello, file!";
    ssize_t bytes_written;
    fd = open("test.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1) {
        perror("open");
        return -1;
    }
    bytes_written = write(fd, message, sizeof(message));
    if (bytes_written == -1) {
        perror("write");
    }
    close(fd);
    return 0;
}
```

上述代码向`test.txt`文件写入字符串数据。

### fwrite 函数

`fwrite`用于向文件写入数据，原型为`size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream)`。

```plaintext
#include <stdio.h>

typedef struct {
    int id;
    char name[50];
} Person;

int main() {
    FILE *fp;
    Person p = {1, "Alice"};
    fp = fopen("people.dat", "wb");
    if (fp == NULL) {
        perror("fopen");
        return -1;
    }
    if (fwrite(&p, sizeof(Person), 1, fp) != 1) {
        perror("fwrite");
    }
    fclose(fp);
    return 0;
}
```

该示例将`Person`结构体数据写入二进制文件`people.dat`。

## 4. 文件定位函数：fseek 与 lseek

### fseek 函数

`fseek`是 C 标准库中的文件定位函数，用于设置文件指针的位置，原型为`int fseek(FILE *stream, long int offset, int whence)`。其中，`stream`是`fopen`返回的文件指针，`offset`是偏移量，`whence`指定起始位置（`SEEK_SET`文件开头、`SEEK_CUR`当前位置、`SEEK_END`文件末尾） 。

```c
#include <stdio.h>

int main() {
    FILE *fp;
    fp = fopen("test.txt", "r+");
    if (fp == NULL) {
        perror("fopen");
        return -1;
    }

    // 将文件指针移动到文件末尾
    if (fseek(fp, 0, SEEK_END) == 0) {
        // 写入新内容
        fputs(" appended text", fp);
    } else {
        perror("fseek");
    }

    fclose(fp);
    return 0;
}
```

上述代码以读写模式打开文件，使用`fseek`将文件指针移动到末尾，并追加新的文本内容。

### lseek 函数

`lseek`是 UNIX/Linux 系统下的底层文件定位函数，原型为`off_t lseek(int fd, off_t offset, int whence)`。其中，`fd`是`open`返回的文件描述符，`offset`和`whence`含义与`fseek`类似 。

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd;
    off_t new_position;
    fd = open("test.txt", O_RDWR);
    if (fd == -1) {
        perror("open");
        return -1;
    }

    // 将文件指针移动到文件开头后5个字节的位置
    new_position = lseek(fd, 5, SEEK_SET);
    if (new_position == -1) {
        perror("lseek");
    } else {
        // 进行读写操作...
    }

    close(fd);
    return 0;
}
```
上述代码通过`lseek`实现文件指针的底层定位，可用于后续的读写操作。

## 5. 内存映射函数：mmap

`mmap`是 UNIX/Linux 系统下用于内存映射的函数，它可以将文件内容映射到内存区域，实现高效的数据访问。其原型为`void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset)`。其中，`addr`指定映射的起始地址（通常设为`NULL`由系统分配），`length`是映射的字节数，`prot`指定内存保护模式（如`PROT_READ`可读、`PROT_WRITE`可写），`flags`指定映射标志（如`MAP_SHARED`共享映射），`fd`是文件描述符，`offset`是文件内的偏移量 。

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>

int main() {
    int fd;
    void *map_start;
    struct stat file_stat;
    fd = open("test.txt", O_RDWR);
    if (fd == -1) {
        perror("open");
        return -1;
    }

    if (fstat(fd, &file_stat) == -1) {
        perror("fstat");
        close(fd);
        return -1;
    }

    map_start = mmap(NULL, file_stat.st_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if (map_start == MAP_FAILED) {
        perror("mmap");
        close(fd);
        return -1;
    }

    // 修改映射区域的数据
    char *data = (char *)map_start;
    data[0] = 'X';

    if (munmap(map_start, file_stat.st_size) == -1) {
        perror("munmap");
    }
    close(fd);
    return 0;
}
```
上述代码通过`mmap`将文件内容映射到内存，直接修改内存中的数据，实现高效的文件数据修改，最后通过`munmap`解除映射。

# 三、函数对比与总结

| 功能分类     | 函数名    | 特点与应用场景                                               | 注意事项                                                     |
| ------------ | --------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **标准输出** | `printf`  | 格式化输出到标准输出流（通常为终端），支持 % d、% s 等格式控制符，用于实时展示程序运行结果。 | 输出缓存可能导致数据延迟显示，可使用`fflush(stdout)`强制刷新；格式控制符需与参数类型匹配。 |
|              | `fprintf` | 格式化输出到指定文件流，用于持久化存储结构化数据，如日志文件或配置文件写入。 | 文件指针需提前通过`fopen`打开，且注意文件打开模式对写入权限的影响。 |
|              | `sprintf` | 将格式化数据写入字符数组，常用于动态生成字符串（如拼接 URL、格式化时间戳）。 | 目标数组需确保足够大，避免缓冲区溢出；结果字符串以`\0`结尾。 |
| **标准输入** | `scanf`   | 从标准输入流（通常为键盘）读取格式化数据，通过变量地址传递结果，需注意输入验证。 | 容易引发缓冲区溢出（如`%s`不限制长度），推荐使用`fgets`结合`sscanf`替代。 |
|              | `fscanf`  | 从文件流中解析格式化数据，适用于读取结构化文件（如 CSV、配置文件）。 | 需配合`fopen`打开文件，注意文件指针位置及读取失败时的错误处理。 |
|              | `sscanf`  | 从字符串中提取格式化数据，常用于文本分析或协议解析（如解析 HTTP 请求头）。 | 源字符串必须以`\0`结尾，支持`%n`等特殊控制符获取读取字符数。 |
| **文件打开** | `open`    | 底层系统调用，返回文件描述符（整数），支持设置文件权限、O_CREAT/O_RDWR 等标志位。 | 底层系统调用，返回文件描述符（整数），支持设置文件权限、O_CREAT/O_RDWR 等标志位。 |
|              | `fopen`   | 高层文件操作函数，返回文件指针（`FILE*`），支持`r`、`w`、`a`等简易模式及缓冲机制。 | 返回`NULL`时需检查`errno`判断错误原因（如文件不存在、权限不足）。 |
| **文件读取** | `read`    | 基于文件描述符的底层读取操作，按字节读取数据，常用于高性能、非格式化文件读取。 | 需手动计算读取字节数，适合处理二进制文件，不支持文本模式转换。 |
|              | `fread`   | 从文件流中读取指定长度的数据块，适用于读取结构体、数组等二进制数据。 | 需指定数据项大小及数量，返回实际读取的项数，可能因文件尾或错误中断。 |
| **文件写入** | `write`   | 基于文件描述符的底层写入操作，按字节写入数据，常用于高效写入二进制文件。 | 需处理返回值判断写入成功字节数，注意文件描述符可写权限。     |
|              | `fwrite`  | 向文件流写入指定长度的数据块，适合写入结构体、数组等二进制数据。 | 需指定数据项大小及数量，写入失败时检查`ferror`获取错误信息。 |

