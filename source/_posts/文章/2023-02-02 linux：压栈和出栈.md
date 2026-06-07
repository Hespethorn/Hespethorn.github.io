---
title: 'linux:从源码视角解析 pthread_cleanup_push 与 pthread_cleanup_pop 的成对出现机制'
tags:
  - Linux
  - 宏定义
  - 线程
categories: Linux
series: 函数 个人文章 小型项目实战 Leecode
abbrlink: 43a5e50b
date: 2023-02-02 20:37:13
---

# 导言

在多线程编程领域，线程资源的正确释放是保障程序稳定性与可靠性的关键环节。`pthread_cleanup_push`和`pthread_cleanup_pop`作为线程资源清理的重要机制，其成对出现的要求并非随意设定，而是由底层源码实现逻辑所决定。本文将从源码角度深入剖析这一要求的根本原因，并结合具体代码示例说明其在实际资源管理中的重要性。

## 一、宏定义的语法约束

在多数系统的实现中，`pthread_cleanup_push`和`pthread_cleanup_pop`并非以普通函数的形式存在，而是通过宏定义来实现功能。从语法结构上看，很多实现里`pthread_cleanup_push`会以类似左花括号 “{” 的形式结束，而`pthread_cleanup_pop`则以类似右花括号 “}” 的形式开始。

这种宏定义的结构设计，是为了确保两者之间的代码块形成一个完整的语法单元。若不成对出现，会直接破坏代码的语法结构，导致编译器在解析过程中出现语法错误，使得程序无法通过编译。这一语法层面的约束，从根本上要求这两个宏必须成对使用。

## 二、清理栈的维护逻辑

线程的清理机制依赖于一个内部的清理栈，`pthread_cleanup_push`和`pthread_cleanup_pop`分别负责清理栈的入栈和出栈操作。

```c
#define pthread_cleanup_push(routine, arg) \
    do { \
        // 模拟向清理栈压入函数指针与参数（实际涉及复杂栈操作）
        cleanup_stack_push((void (*)(void*))routine, arg); \
    } while (0)
```

```c
#define pthread_cleanup_pop(execute) \
    do { \
        void (*cleanup_routine)(void*); \
        void *cleanup_arg; \
        // 模拟从清理栈弹出函数指针与参数
        cleanup_stack_pop(&cleanup_routine, &cleanup_arg); \
        if (execute) { \
            cleanup_routine(cleanup_arg); \
        } \
    } while (0)
```

只有当`pthread_cleanup_push`和`pthread_cleanup_pop`成对出现时，才能保证清理栈的入栈和出栈操作保持平衡，确保清理栈的状态始终处于正确的状态。若不成对使用，会导致清理栈的深度失衡，进而使线程在退出（无论是正常退出还是被取消）时，清理函数无法按照正确的顺序执行，可能引发资源泄漏或其他不可预期的错误。

## 三、清理函数信息的关联与匹配

`pthread_cleanup_pop`需要准确找到`pthread_cleanup_push`压入清理栈的清理函数信息，这种关联与匹配依赖于两者在代码中的配对关系。简化的源码实现中，`pthread_cleanup_push`压入的清理函数信息在清理栈中具有特定的位置和标识，`pthread_cleanup_pop`在执行出栈操作时，正是依据这种配对关系来准确获取对应的清理函数信息。若两者不成对出现，`pthread_cleanup_pop`将无法正确找到对应的清理函数信息，导致清理操作失败，无法实现预期的资源清理功能。

## 四、代码示例：堆内存与文件资源的清理

以下通过一个子线程的代码示例，展示`pthread_cleanup_push`和`pthread_cleanup_pop`如何配合清理堆内存和文件资源：

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

// 清理堆内存的函数
void free_heap(void *arg) {
    free(arg);
    printf("Heap memory freed\n");
}

// 关闭文件的函数
void close_file(void *arg) {
    FILE *fp = (FILE *)arg;
    fclose(fp);
    printf("File closed\n");
}

void* thread_function(void* arg) {
    // 分配堆内存
    int *heap_data = (int *)malloc(sizeof(int));
    if (heap_data == NULL) {
        perror("malloc");
        pthread_exit(NULL);
    }

    // 打开文件
    FILE *file = fopen("test.txt", "w");
    if (file == NULL) {
        perror("fopen");
        free(heap_data);
        pthread_exit(NULL);
    }

    // 将清理函数压入清理栈
    pthread_cleanup_push(free_heap, heap_data);
    pthread_cleanup_push(close_file, file);

    // 模拟线程执行任务
    // ...

    // 弹出清理函数并执行（第二个参数为非0时执行清理函数）
    pthread_cleanup_pop(1);
    pthread_cleanup_pop(1);

    pthread_exit(NULL);
}

int main() {
    pthread_t thread;
    if (pthread_create(&thread, NULL, thread_function, NULL) != 0) {
        perror("pthread_create");
        return 1;
    }

    if (pthread_join(thread, NULL) != 0) {
        perror("pthread_join");
        return 1;
    }

    return 0;
}
```

在上述代码中，子线程`thread_function`分配了堆内存并打开了一个文件。通过`pthread_cleanup_push`将`free_heap`和`close_file`两个清理函数分别与对应的资源（堆内存指针和文件指针）关联并压入清理栈。当线程执行完毕，`pthread_cleanup_pop`按顺序弹出清理函数并执行，确保堆内存被释放、文件被关闭。若省略任何一个`pthread_cleanup_pop`，将导致资源无法正常清理，引发内存泄漏或文件句柄占用等问题。

综上所述，`pthread_cleanup_push`和`pthread_cleanup_pop`必须成对出现，是由宏定义的语法约束、清理栈的维护逻辑以及清理函数信息的关联匹配等源码层面的因素共同决定的，这一要求是保障线程资源正确清理、确保程序稳定运行的重要前提。