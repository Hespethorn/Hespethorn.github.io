---

title: Linux：类似ls -al的目录列表程序
tags:
  - Linux
  - ls -al
categories: [Systems, Linux]
abbrlink: 15bdd4f8
date: 2022-08-25
series: [鸟哥私房菜]
---


## 一、引言
-----
在 Linux 操作系统生态中，`ls - l`命令作为文件系统目录信息检索的核心工具，能够以列表形式结构化呈现文件及目录的详细元数据信息，在系统管理、软件开发、运维保障等场景中具有不可替代的作用。通过自主开发具备类似功能的程序，有助于深入理解文件系统接口规范、系统调用机制及 C 语言在底层编程中的应用范式。本文提出的`directory_lister.c`程序，旨在通过 C 语言编程实现`ls - l`命令的核心功能，为相关领域的学术研究与工程实践提供可复用的技术样本。

## 二、程序整体架构设计
-----
### 2.1 功能模块划分
`directory_lister.c`程序基于模块化设计理念，划分为四个核心功能模块，各模块通过清晰的接口定义实现协同工作，共同完成目录列表功能：

1. **参数解析模块**：该模块负责解析命令行输入参数，实现目标目录路径的动态确定。程序通过`argc`（命令行参数数量）和`argv`（参数数组）获取用户输入，若未指定目录路径，则自动将当前工作目录作为默认目标。这种设计符合 Linux 命令行程序的交互规范，显著提升了程序的适用性与灵活性。
2. **目录扫描模块**：利用`opendir`、`readdir`等系统调用函数，实现对目标目录下所有文件及子目录的遍历操作。遍历完成后，采用`qsort`函数对目录项进行基于文件名的升序排序，确保输出结果具备良好的一致性与可读性，便于用户快速定位和分析文件信息。
3. **元数据获取模块**：针对每个目录项，调用`lstat`函数获取完整的文件状态信息。相较于`stat`函数，`lstat`在处理符号链接时返回链接本身的元数据，这一特性确保了符号链接相关信息的准确获取。获取的元数据涵盖文件权限模式、硬链接计数、文件大小、修改时间等关键属性，为后续格式化输出提供数据支撑。
4. **格式化输出模块**：该模块将获取的文件元数据按照类`ls - l`命令的标准格式进行处理，并输出至终端设备。涉及字符串格式化、数据类型转换等操作，需熟练运用 C 语言字符串处理函数（如`snprintf`、`strftime`），以保证输出结果的规范性与准确性。

### 2.2 安全设计考量

在程序设计过程中，通过以下措施构建多层次安全防护体系，保障程序运行的稳定性与可靠性：

- **内存安全管理**：在动态内存分配环节采用`calloc`函数替代`malloc`函数，该函数在分配内存空间的同时执行零值初始化，有效规避了未初始化内存导致的数据污染问题，降低程序运行时的不确定性风险。
- **字符串操作安全**：所有字符串处理操作均使用`snprintf`和`strftime`函数。`snprintf`通过指定缓冲区大小防止溢出，`strftime`在时间格式化过程中采用安全的缓冲区处理机制，从源头上杜绝因字符串操作不当引发的安全漏洞。

## 三、关键函数实现分析
-----
### 3.1 错误检查宏`ERROR_CHECK`

```c
#define ERROR_CHECK(ret, error_val, msg) \
do { \
    if ((ret) == (error_val)) { \
        fprintf(stderr, "Error: %s (errno=%d)\n", (msg), errno); \
        exit(EXIT_FAILURE); \
    } \
} while (0)
```
该宏采用 Google 推荐的`do - while(0)`结构，确保在复杂控制流中保持一致的行为特性。其核心功能是实时监测函数返回值，当检测到与预设错误值匹配时，通过`fprintf`函数将包含自定义错误描述`msg`和系统错误码`errno`的详细信息输出至标准错误流`stderr`，为故障诊断提供完备信息。随后以`EXIT_FAILURE`状态码终止程序执行，避免错误状态下的程序继续运行引发系统异常或数据损坏。

### 3.2 权限与类型格式化函数`format_type_mode`

```c
void format_type_mode(mode_t mode, char* tm_str) {
    // 文件类型处理
    switch (mode & S_IFMT) {
    case S_IFDIR:   tm_str[0] = 'd'; break;
    case S_IFCHR:   tm_str[0] = 'c'; break;
    case S_IFBLK:   tm_str[0] = 'b'; break;
    case S_IFIFO:   tm_str[0] = 'p'; break;
    case S_IFLNK:   tm_str[0] = 'l'; break;
    case S_IFREG:   tm_str[0] = '-'; break;
    case S_IFSOCK:  tm_str[0] ='s'; break;
    default:        tm_str[0] = '?'; break;
    }
    // 权限位处理
    tm_str[1] = (mode & S_IRUSR)? 'r' : '-';
    tm_str[2] = (mode & S_IWUSR)? 'w' : '-';
    tm_str[3] = (mode & S_IXUSR)? 'x' : '-';
    tm_str[4] = (mode & S_IRGRP)? 'r' : '-';
    tm_str[5] = (mode & S_IWGRP)? 'w' : '-';
    tm_str[6] = (mode & S_IXGRP)? 'x' : '-';
    tm_str[7] = (mode & S_IROTH)? 'r' : '-';
    tm_str[8] = (mode & S_IWOTH)? 'w' : '-';
    tm_str[9] = (mode & S_IXOTH)? 'x' : '-';
    // 特殊权限位处理
    if (mode & S_ISUID) tm_str[2] = (tm_str[2] == '-')? 's' : 'S';
    if (mode & S_ISGID) tm_str[5] = (tm_str[5] == '-')? 's' : 'S';
    if (mode & S_ISVTX) tm_str[8] = (tm_str[8] == '-')? 't' : 'T';
    tm_str[10] = '\0';
}
```
该函数实现文件类型与权限信息的格式化转换。首先通过位运算`mode & S_IFMT`提取文件类型标识位，根据不同类型值（如`S_IFDIR`代表目录，`S_IFREG`代表普通文件）将对应字符写入输出缓冲区`tm_str`首位置，完成文件类型标识。

在权限位处理阶段，利用`S_IRUSR`、`S_IWUSR`等标准宏，通过位运算判断文件对用户、组及其他用户的读写执行权限状态，并将相应权限字符写入缓冲区对应位置。对于特殊权限位（SUID、SGID、Sticky Bit），根据权限存在状态及对应执行位状态进行差异化处理：权限开启且执行位有效时显示小写字母，权限开启但执行位无效时显示大写字母，从而实现特殊权限特性的可视化呈现。最后添加字符串终止符`\0`，确保输出字符串格式正确。
### 3.3 时间格式化函数`format_time`

```c
void format_time(time_t mtime, char* time_str) {
    struct tm* st_tm = localtime(&mtime);
    if (!st_tm) {
        snprintf(time_str, 20, "InvalidTime");
        return;
    }
    strftime(time_str, 20, "%b %e %H:%M", st_tm);
}
```

该函数实现文件时间戳（以秒为单位的`mtime`）到人类可读日期时间字符串的转换。首先调用`localtime`函数将时间戳转换为本地时间结构`struct tm`，需注意该函数在多线程环境下因使用静态存储导致的线程安全问题，建议在多线程场景中采用`localtime_r`函数替代。

若`localtime`函数执行失败（返回`NULL`），则通过`snprintf`函数将默认错误字符串`"InvalidTime"`写入输出缓冲区`time_str`并终止函数执行。转换成功时，利用`strftime`函数按照`"%b %e %H:%M"`格式字符串（`%b`代表月份缩写，`%e`代表带空格日期，`%H:%M`代表 24 小时制时间）将本地时间结构格式化为目标字符串，完成时间格式化任务。

### 3.4 目录项读取与排序函数`read_and_sort_dir`

```c
struct dirent** read_and_sort_dir(const char* dir_path, int* out_count) {
    DIR* dirp = opendir(dir_path);
    ERROR_CHECK(dirp, NULL, "opendir failed");
    // 统计数量
    int count = 0;
    struct dirent* p;
    while ((p = readdir(dirp)) != NULL) count++;
    // 分配内存
    struct dirent** entries = (struct dirent**)calloc(count, sizeof(struct dirent*));
    ERROR_CHECK(entries, NULL, "calloc failed");
    // 读取并排序
    rewinddir(dirp);
    for (int i = 0; i < count; i++) {
        entries[i] = readdir(dirp);
        ERROR_CHECK(entries[i], NULL, "readdir failed");
    }
    qsort(entries, count, sizeof(struct dirent*), compare_strings);
    closedir(dirp);
    *out_count = count;
    return entries;
}
```

该函数是实现目录扫描与排序功能的核心模块。首先调用`opendir`函数打开目标目录获取目录流指针`dirp`，并通过`ERROR_CHECK`宏进行错误检查，确保目录打开操作成功。

通过循环调用`readdir`函数遍历目录条目，统计目录项总数`count`。获取数量后使用`calloc`函数动态分配内存存储目录项指针，同样通过`ERROR_CHECK`宏保障内存分配操作成功。调用`rewinddir`函数重置目录流指针后，再次循环读取目录项并存储至分配的内存数组`entries`，同时对每次读取操作进行错误检查。

最后调用`qsort`函数基于自定义的`compare_strings`函数（按文件名升序比较）对目录项指针数组进行排序。排序完成后关闭目录流释放资源，通过指针`out_count`返回目录项数量，并返回存储目录项指针的数组`entries`，为后续文件信息处理提供数据基础。

### 3.5 主函数`main`

```c
int main(int argc, char* argv[]) {
    // 处理命令行参数
    const char* target_dir = (argc == 2)? argv[1] : ".";
    // 读取并排序目录项
    int entry_count = 0;
    struct dirent** entries = read_and_sort_dir(target_dir, &entry_count);
    ERROR_CHECK(entries, NULL, "read_and_sort_dir failed");
    // 打印表头
    printf("total %d\n", entry_count);
    // 遍历并打印文件信息
    for (int i = 0; i < entry_count; i++) {
        const char* filename = entries[i]->d_name;
        struct stat stat_buf;
        // 跳过.和..
        if (strcmp(filename, ".") == 0 || strcmp(filename, "..") == 0) {
            continue;
        }
        // 获取文件状态
        int ret = lstat(filename, &stat_buf);
        if (ret == -1) {
            if (errno == ENOENT) {
                fprintf(stderr, "Warning: %s not found, skipping\n", filename);
                continue;
            }
            ERROR_CHECK(ret, -1, "lstat failed");
        }
        // 打印文件信息
        print_file_info(entries[i], &stat_buf);
    }
    // 清理资源
    free(entries);
    return 0;
}
```

`main`函数作为程序执行的入口点，负责协调各功能模块有序运行。首先解析命令行参数`argc`和`argv`，确定目标目录路径`target_dir`，默认采用当前工作目录。

调用`read_and_sort_dir`函数完成目录项读取与排序操作，并通过`ERROR_CHECK`宏进行错误监测。读取成功后打印表头信息`"total %d"`展示目录项总数。

通过循环遍历目录项数组，对每个条目进行处理：跳过`.`和`..`特殊目录项；调用`lstat`函数获取文件状态信息，针对文件不存在（`ENOENT`错误码）情况输出警告并跳过，其他错误则通过`ERROR_CHECK`宏终止程序；成功获取信息后调用`print_file_info`函数完成文件信息格式化输出。

程序执行结束前，调用`free`函数释放动态分配的目录项指针数组内存，避免内存泄漏，确保系统资源合理回收与程序稳定运行。

## 四、程序运行与测试

-----

### 4.1 编译与运行

程序编译与运行遵循标准 C 语言程序执行流程。在 Linux 系统环境下，使用以下命令完成编译：

```bash
gcc directory_lister.c -o directory_lister
```

该命令通过`gcc`编译器对`directory_lister.c`源文件进行编译，生成可执行文件`directory_lister`。编译成功后，可按以下方式运行程序：

- **查看当前目录信息**：

```bash
./directory_lister
```

- **查看指定目录（如`/etc`）信息**：

```bash
./directory_lister /etc
```

### 4.2 输出结果分析

程序运行后，以类`ls - l`命令格式输出目录中文件及目录的详细元数据信息，包含以下关键字段：

- **文件类型与权限**：以字符串形式展示文件类型标识（如`d`表示目录，`-`表示普通文件）及权限设置（如`rwxr-xr-x`对应不同用户组权限），特殊权限位采用标准字符表示。
- **硬链接数**：显示文件或目录的硬链接计数，反映文件系统中的链接关系。
- **所有者与组**：输出文件所有者用户名及所属组组名，体现文件访问控制策略。
- **文件大小**：以字节为单位展示文件存储容量，直观反映磁盘占用情况。
- **修改时间**：以人类可读日期时间格式（如`Jul 5 14:30`）呈现文件最后修改时间，便于追踪文件更新状态。
- **文件名**：显示文件或目录名称，作为用户识别与操作的关键标识。

通过对输出结果的系统性分析，可验证程序对文件元数据信息的获取准确性与输出完整性，评估程序功能实现的正确性。

## 五、代码实现

-----

```
/**
 * directory_lister.c - 类似 `ls -l` 的目录列表程序
 *
 * 整体架构：
 * 1. 参数解析：处理命令行参数，确定目标目录
 * 2. 目录扫描：读取目录项并排序
 * 3. 元数据获取：通过lstat获取每个文件的详细信息
 * 4. 格式化输出：按照ls -l的格式展示结果
 *
 * 安全注意事项：
 * - 使用calloc而非malloc确保内存初始化为0
 * - 所有字符串操作使用snprintf/strftime避免缓冲区溢出
 */

// C系统库头文件（按功能相关性有序排列）
#include <stdio.h>      
#include <stdlib.h>     
#include <string.h>     
#include <sys/stat.h>   
#include <dirent.h>     
#include <unistd.h>     
#include <time.h>       
#include <sys/types.h>  
#include <pwd.h>        
#include <grp.h>        

/* 宏定义：错误检查（Google风格do-while(0)结构） */
#define ERROR_CHECK(ret, error_val, msg) \
do { \
    if ((ret) == (error_val)) { \
        fprintf(stderr, "Error: %s (errno=%d)\n", (msg), errno); \
        exit(EXIT_FAILURE); \
    } \
} while (0)

/**
 * 格式化文件类型和权限字符串（如 "-rwxr-xr-x"）
 * @param mode 文件模式（来自lstat.st_mode）
 * @param tm_str 输出缓冲区（至少11字节，含终止符）
 *
 * 实现细节：
 * - 使用标准宏（如S_IRUSR）代替位运算硬编码，提高可读性
 * - 特殊权限位（SUID/SGID/Sticky）处理逻辑：
 *   - 若执行位开启，显示小写字母（如's'、't'）
 *   - 若执行位关闭，显示大写字母（如'S'、'T'）
 */
void format_type_mode(mode_t mode, char* tm_str) {
   // 文件类型处理
  switch (mode & S_IFMT) {
  case S_IFDIR:   tm_str[0] = 'd'; break;
  case S_IFCHR:   tm_str[0] = 'c'; break;
  case S_IFBLK:   tm_str[0] = 'b'; break;
  case S_IFIFO:   tm_str[0] = 'p'; break;
  case S_IFLNK:   tm_str[0] = 'l'; break;
  case S_IFREG:   tm_str[0] = '-'; break;
  case S_IFSOCK:  tm_str[0] = 's'; break;
  default:        tm_str[0] = '?'; break;
  }

  // 权限位处理（使用标准宏提高可读性）
  tm_str[1] = (mode & S_IRUSR) ? 'r' : '-';  // 用户读
  tm_str[2] = (mode & S_IWUSR) ? 'w' : '-';  // 用户写
  tm_str[3] = (mode & S_IXUSR) ? 'x' : '-';  // 用户执行
  tm_str[4] = (mode & S_IRGRP) ? 'r' : '-';  // 组读
  tm_str[5] = (mode & S_IWGRP) ? 'w' : '-';  // 组写
  tm_str[6] = (mode & S_IXGRP) ? 'x' : '-';  // 组执行
  tm_str[7] = (mode & S_IROTH) ? 'r' : '-';  // 其他读
  tm_str[8] = (mode & S_IWOTH) ? 'w' : '-';  // 其他写
  tm_str[9] = (mode & S_IXOTH) ? 'x' : '-';  // 其他执行

  // 特殊权限位说明：
// - S_ISUID: 执行时设置用户ID（如/bin/su）
// - S_ISGID: 执行时设置组ID（如某些共享目录）
// - S_ISVTX: 粘滞位（如/tmp目录的防删除保护）
  if (mode & S_ISUID) tm_str[2] = (tm_str[2] == '-') ? 's' : 'S';
  if (mode & S_ISUID) tm_str[2] = (tm_str[2] == '-') ? 's' : 'S';
  if (mode & S_ISGID) tm_str[5] = (tm_str[5] == '-') ? 's' : 'S';
  if (mode & S_ISVTX) tm_str[8] = (tm_str[8] == '-') ? 't' : 'T';

  tm_str[10] = '\0';  // 终止符
}

/**
 * 格式化时间为"Mon dd HH:MM"（如 "Jul  5 14:30"）
 * @param mtime 文件修改时间戳（来自lstat.st_mtime）
 * @param time_str 输出缓冲区（至少20字节）
 *
 * 注意事项：
 * - localtime非线程安全（多线程环境需改用localtime_r）
 * - strftime格式说明：
 *   - %b: 月份缩写（如"Jan"）
 *   - %e: 日期（带前导空格，如" 5"）
 *   - %H:%M: 24小时制时间（如"14:30"）
 */
void format_time(time_t mtime, char* time_str) {
  struct tm* st_tm = localtime(&mtime);
  if (!st_tm) {
    snprintf(time_str, 20, "InvalidTime");
    return;
  }
  strftime(time_str, 20, "%b %e %H:%M", st_tm);
}

/**
 * 比较函数：按文件名升序排序目录项（供qsort使用）
 * @param a 目录项指针的指针
 * @param b 目录项指针的指针
 * @return 比较结果（负数/0/正数）
 */
int compare_strings(const void* a, const void* b) {
  const struct dirent* const* pa = (const struct dirent* const*)a;
  const struct dirent* const* pb = (const struct dirent* const*)b;
  return strcmp((*pa)->d_name, (*pb)->d_name);
}

/**
* 读取并排序目录项（调用者需释放内存）
* 实现流程：
* 1. 打开目录并统计条目数量
* 2. 动态分配内存存储所有条目指针
* 3. 重读目录并填充数组
* 4. 使用qsort按文件名排序（升序）
*/
struct dirent** read_and_sort_dir(const char* dir_path, int* out_count) {
  DIR* dirp = opendir(dir_path);
  ERROR_CHECK(dirp, NULL, "opendir failed");

  // 统计目录项数量
  int count = 0;
  struct dirent* p;
  while ((p = readdir(dirp)) != NULL) count++;

  // 分配内存存储目录项指针
  struct dirent** entries = (struct dirent**)calloc(count, sizeof(struct dirent*));
  ERROR_CHECK(entries, NULL, "calloc failed");

  // 重置目录流并读取所有项
  rewinddir(dirp);
  for (int i = 0; i < count; i++) {
    entries[i] = readdir(dirp);
    ERROR_CHECK(entries[i], NULL, "readdir failed");
  }

  // 按文件名排序
  qsort(entries, count, sizeof(struct dirent*), compare_strings);

  closedir(dirp);
  *out_count = count;
  return entries;
}

/**
 * 打印单个文件/目录的详细信息（类似ls -l）
 * @param dent 目录项结构体指针
 * @param stat_buf 文件状态信息
*/
void print_file_info(const struct dirent* dent, const struct stat* stat_buf) {
  char type_mode[11];
  format_type_mode(stat_buf->st_mode, type_mode);

  // 获取用户/组名（处理空指针）
  struct passwd* pw = getpwuid(stat_buf->st_uid);
  char* username = pw ? pw->pw_name : "unknown";
  struct group* gr = getgrgid(stat_buf->st_gid);
  char* groupname = gr ? gr->gr_name : "unknown";

  // 格式化时间
  char time_str[20];
  format_time(stat_buf->st_mtime, time_str);

  // 输出（格式与ls -l一致）
  printf("%s %2lu %s %s %6lu %s %s\n",
    type_mode,
    (unsigned long)stat_buf->st_nlink,
    username,
    groupname,
    (unsigned long)stat_buf->st_size,
    time_str,
    dent->d_name);
}

int main(int argc, char* argv[]) {
    // 处理命令行参数
  const char* target_dir = (argc == 2) ? argv[1] : ".";

  // 读取并排序目录项
  int entry_count = 0;
  struct dirent** entries = read_and_sort_dir(target_dir, &entry_count);
  ERROR_CHECK(entries, NULL, "read_and_sort_dir failed");

  // 打印表头（类似ls -l）
  printf("total %d\n", entry_count);

  // 遍历并打印文件信息
  for (int i = 0; i < entry_count; i++) {
    const char* filename = entries[i]->d_name;
    struct stat stat_buf;

    // 跳过.和..
    if (strcmp(filename, ".") == 0 || strcmp(filename, "..") == 0) {
      continue;
    }

    // 获取文件状态（处理符号链接）
    int ret = lstat(filename, &stat_buf);
    if (ret == -1) {
      if (errno == ENOENT) {
        fprintf(stderr, "Warning: %s not found, skipping\n", filename);
        continue;
      }
      ERROR_CHECK(ret, -1, "lstat failed");
    }

    // 打印文件信息
    print_file_info(entries[i], &stat_buf);
  }

  // 清理资源
  free(entries);
  return 0;
}
```

