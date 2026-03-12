---
title: 'linux:POSIX 线程库 (`pthread`) 详解与多线程编程实践'
tags:
  - Linux
  - pthread
  - 互斥锁
  - 信号
categories: Linux
series: Linux
abbrlink: ae1b13b2
date: 2023-02-09 20:37:13
---

### 一、`pthread` 库概述

POSIX 线程 (POSIX Threads)，简称 `pthread`，是 C 语言中实现多线程编程的标准库。它提供了一套丰富的 API，用于创建、同步和管理线程。`pthread` 库在 Unix、Linux 和 macOS 等系统上广泛支持，是开发高性能并发程序的重要工具。

### 核心组件

- **线程管理**：创建、终止和等待线程
- **同步机制**：互斥锁 (Mutex)、读写锁、条件变量
- **线程同步**：信号量、屏障
- **线程特定数据**：每个线程独立的数据存储

### 二、线程的基本操作

#### 1. 线程创建与终止

##### `pthread_create` 函数

```c
int pthread_create(pthread_t *thread, const pthread_attr_t *attr,
                   void *(*start_routine) (void *), void *arg);
```

- **参数说明**：
  - `thread`：指向` pthread_t` 类型的指针，用于存储新创建线程的 ID
  - `attr`：线程属性设置，NULL 表示使用默认属性
  - `start_routine`：线程入口函数，返回值和参数类型均为 void*
  - `arg`：传递给线程函数的参数

##### `pthread_exit` 函数

```c
void pthread_exit(void *retval);
```

- 用于线程主动退出
- `retval`：线程返回值，可通过` pthread_join `获取

##### `pthread_join` 函数

```c
int pthread_join(pthread_t thread, void **retval);
```

- 等待指定线程结束并回收资源
- `retval`：指向线程返回值的指针

#### 2. 线程属性设置

```c
pthread_attr_t attr;
pthread_attr_init(&attr);
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
pthread_create(&tid, &attr, thread_func, NULL);
pthread_attr_destroy(&attr);
```

- 可设置线程分离状态、调度策略等属性
- 分离状态的线程结束后自动释放资源，无法被 join

### 三、线程同步机制

#### 1. 互斥锁 (Mutex)

互斥锁是最基本的同步原语，用于保护临界区，防止多个线程同时访问共享资源。

##### 主要函数

```c
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, NULL);      // 初始化互斥锁
pthread_mutex_lock(&mutex);           // 加锁
pthread_mutex_unlock(&mutex);         // 解锁
pthread_mutex_destroy(&mutex);        // 销毁互斥锁
```

##### 示例代码

```c
pthread_mutex_t count_mutex;
int count = 0;

void *increment(void *arg) {
    pthread_mutex_lock(&count_mutex);
    count++;
    pthread_mutex_unlock(&count_mutex);
    return NULL;
}
```

#### 2. 条件变量 (Condition Variable)

条件变量用于线程间的等待 - 通知机制，通常与互斥锁配合使用。

##### 主要函数

```c
pthread_cond_t cond;
pthread_cond_init(&cond, NULL);       // 初始化条件变量
pthread_cond_wait(&cond, &mutex);     // 等待条件
pthread_cond_signal(&cond);           // 通知一个等待线程
pthread_cond_broadcast(&cond);        // 通知所有等待线程
pthread_cond_destroy(&cond);          // 销毁条件变量
```

##### 生产者 - 消费者示例

```c
pthread_mutex_t mutex;
pthread_cond_t cond_producer, cond_consumer;
int buffer = 0;

// 消费者线程
void *consumer(void *arg) {
    pthread_mutex_lock(&mutex);
    while (buffer == 0) {
        pthread_cond_wait(&cond_consumer, &mutex);
    }
    buffer--;  // 消费一个产品
    pthread_cond_signal(&cond_producer);
    pthread_mutex_unlock(&mutex);
    return NULL;
}
```

#### 3. 读写锁 (Read-Write Lock)

读写锁允许多个线程同时读共享资源，但写操作时需要独占访问。

##### 主要函数

```c
pthread_rwlock_t rwlock;
pthread_rwlock_init(&rwlock, NULL);   // 初始化读写锁
pthread_rwlock_rdlock(&rwlock);       // 获取读锁
pthread_rwlock_wrlock(&rwlock);       // 获取写锁
pthread_rwlock_unlock(&rwlock);       // 释放锁
pthread_rwlock_destroy(&rwlock);      // 销毁读写锁
```

#### 4. 信号量 (Semaphore)

信号量是更通用的同步原语，可以实现互斥锁和条件变量的功能。

##### POSIX 信号量函数

```c
#include <semaphore.h>
sem_t sem;
sem_init(&sem, 0, 1);                 // 初始化信号量(值为1表示互斥锁)
sem_wait(&sem);                       // P操作，信号量减1
sem_post(&sem);                       // V操作，信号量加1
sem_destroy(&sem);                    // 销毁信号量
```

### 四、线程安全与可重入性

#### 1. 线程安全函数

线程安全函数可以被多个线程同时调用而不会产生竞态条件。例如：

```c
// 线程安全的随机数生成
int rand_r(unsigned int *seedp);
```

#### 2. 可重入函数

可重入函数在被中断时可以安全地被再次调用。例如：

```c
// 可重入的strtok函数
char *strtok_r(char *str, const char *delim, char **saveptr);
```

### 五、多线程编程最佳实践

#### 1. 减少共享数据

```c
// 线程局部存储
__thread int thread_local_data;
```

#### 2. 避免死锁

- 按相同顺序获取锁
- 设置锁获取超时

```c
pthread_mutex_trylock(&mutex);  // 尝试加锁，立即返回
```

#### 3. 使用线程池

线程池可以避免频繁创建和销毁线程的开销：

```c
// 线程池基本结构
typedef struct {
    pthread_t *threads;
    int thread_count;
    // 任务队列和同步机制
} ThreadPool;
```

### 六、多线程调试与性能分析

#### 1. 调试工具

- **`gdb`**：支持多线程调试
- **`valgrind`**：检测内存泄漏和竞态条件
- **`helgrind`**：专门检测线程竞态条件

#### 2. 性能分析工具

- **`oprofile`**：系统级性能分析
- **`gprof`**：分析程序热点
- **`perf`**：Linux 性能分析工具

## 七、线程同步机制分析

程序使用了两种线程同步机制：

### 1. 互斥锁（Mutex）

```c
pthread_mutex_lock(&mutex);
// 临界区代码
pthread_mutex_unlock(&mutex);
```

互斥锁用于保护对共享链表的操作，确保子线程插入节点和主线程删除节点这两个操作不会同时进行，避免数据竞争。

### 2. 标志变量（Flag）

```c
while(flag==0){}; // 主线程等待
flag=1; // 子线程设置
```

标志变量 `flag` 用于线程间的简单通信，子线程完成插入操作后将其置为 1，主线程通过循环检测该标志来判断何时可以开始删除操作。

## 八、多线程环境下的链表操作实现与解析

在多线程编程中，对共享资源的操作需要特别谨慎，本文将详细解析一个基于 POSIX 线程的链表操作程序，分析其实现原理、线程同步机制以及潜在的问题。

### 1.程序功能概述

这个程序展示了主线程与子线程协作完成链表操作的过程：

1. 主线程创建一个带头结点的空链表，并将其传递给子线程
2. 子线程通过尾插法向链表中插入 10 个数据节点，打印链表内容后退出
3. 主线程等待子线程完成插入操作，然后逐个删除链表节点直至链表为空

### 2.代码结构与实现分析

#### 数据结构定义

```c
typedef struct NODE{
    int val;
    struct NODE *next;
}node;

typedef struct Linklist{
    node *head;
    int size;
}Linklist;
```

程序定义了两个核心数据结构：

- `node` 结构体表示链表节点，包含整数值 `val` 和指向下一个节点的指针 `next`
- `Linklist` 结构体管理链表，包含头指针 `head` 和记录节点数量的 `size`

#### 全局变量

```c
int flag=0;
pthread_mutex_t mutex;
```

- `flag` 作为标志变量，用于主线程判断子线程是否完成链表插入操作
- `mutex` 是 POSIX 线程互斥锁，用于保护对共享链表的并发访问

#### 子线程处理函数

```c
void *handle(void *arg){
    Linklist *list=(Linklist*)arg;
    node *tail=list->head;
    pthread_mutex_lock(&mutex);
    for(int i=0;i<10;i++){
        node *new_node=(node*)calloc(1,sizeof(node));
        new_node->val=(i+2)*5;
        tail->next=new_node;
        tail=new_node;
        list->size++;
    }
    flag=1;
    node *p=list->head;
    for(int i=0;i<list->size;i++){
        printf("  %d  ",p->val);
        p=p->next;
    }
    printf("\n");
    pthread_mutex_unlock(&mutex);
    pthread_exit(NULL);
}
```

这个函数是子线程的入口点，主要完成以下工作：

1. 获取主线程传递的链表指针
2. 加锁后开始向链表尾部插入 10 个节点（值为 10, 15, 20, ..., 55）
3. 设置标志变量 `flag` 为 1，表示插入操作已完成
4. 遍历链表并打印所有节点的值
5. 解锁并退出线程

#### 主函数实现

```c
int main(int argc, char *argv[]){                                  
    Linklist *list=(Linklist*)malloc(sizeof(Linklist));
    node *head=(node*)calloc(1,sizeof(node));
    list->head=head;
    list->size=1;
    ERROR_CHECK(head,NULL,"node");
    ERROR_CHECK(list,NULL,"Linklist");
    
    pthread_t thread;
    pthread_create(&thread,NULL,handle,list);
    
    while(flag==0){};
    
    pthread_mutex_lock(&mutex);
    node *p=list->head;
    int num=list->size;
    for(int i=0;i<num;i++){
        list->head=list->head->next;
        free(p);
        list->size--;
        p=list->head;
        if(p==NULL){
            printf("链表删除完毕\n");
        }
    }
    pthread_mutex_unlock(&mutex);
    free(list);
    pthread_join(thread,NULL);
    return 0;
}
```

**主函数的执行流程**：

1. 创建链表结构并初始化头结点
2. 创建子线程处理链表插入操作
3. 通过忙等待（spin-wait）方式等待子线程完成
4. 加锁后遍历链表，逐个删除节点
5. 释放链表结构内存并等待子线程结束

