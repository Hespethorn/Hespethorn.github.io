---
title: Leetcode 0001.two sum
tags:
  - leetcode
  - Hash Table
categories: 
  - Leetcode
series: Leetcode
abbrlink: 83dcefb7
date: 2022-04-01 21:01:53
---

# [1. Two Sum](https://leetcode.com/problems/two-sum/)

## 题目

Given an array of integers, return indices of the two numbers such that they add up to a specific target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:

```
Given nums = [2, 7, 11, 15], target = 9,

Because nums[0] + nums[1] = 2 + 7 = 9,
return [0, 1].
```



## 题目大意

在数组中找到两个数，它们的和等于给定的目标值 `target`，并返回这两个数在数组中的下标。要求每个元素只能使用一次，且保证有且仅有一个解。

------

## 解题思路

### 方法一：双层循环（暴力枚举）

#### 思路

  通过双重循环遍历数组中的每一对元素，检查它们的和是否等于目标值 `target`。外层循环控制第一个元素的索引 `i`，内层循环控制第二个元素的索引 `j`（`j > i` 以避免重复使用同一元素）。

#### 复杂度分析

  - **时间复杂度**：O(n²)，其中 `n` 是数组的长度。最坏情况下需要遍历所有可能的元素对。
  - **空间复杂度**：O(1)，仅使用常数额外空间。

------

### 方法二：哈希表（优化查找）

#### 思路

  利用哈希表（字典）存储已遍历元素的值及其下标。对于当前遍历的元素 `nums[i]`，计算需要的补数 `complement = target - nums[i]`，并检查补数是否已存在于哈希表中：

  - 若存在，则返回哈希表中补数的下标和当前元素的下标 `i`。
  - 若不存在，则将当前元素的值和下标存入哈希表，继续遍历。

  这种方法通过空间换时间，将查找补数的时间复杂度从 O(n) 降为 O(1)。

#### 复杂度分析

  - **时间复杂度**：O(n)，仅需遍历数组一次。
  - **空间复杂度**：O(n)，最坏情况下需要存储所有元素到哈希表中。

------

## 代码实现

{% tabs test1 %}
<!-- tab 双层循环 -->

```
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// 使用结果数组替代全局变量，提高可维护性
void find_two(int arr[], int target, int len, int *result) {
    result[0] = -1; // 初始化为-1表示未找到
    result[1] = -1;
    int found = 0; // 标记是否找到目标数对

    for (int i = 0; i < len && !found; i++) {
        // 优化：若当前元素已大于target，无需继续（因数组元素非负）
        if (arr[i] > target) continue;
    
        for (int j = i + 1; j < len && !found; j++) {
            // 优化：若当前元素已大于target，无需继续
            if (arr[j] > target) continue;
    
            // 找到和为target的两个数
            if (arr[i] + arr[j] == target) {
                result[0] = i;
                result[1] = j;
                found = 1; // 标记已找到，触发循环终止
                break;   // 退出内层循环
            }
        }
    }
}

int main(void) {
    int num[100] = { 0 };
    srand(time(NULL));
    int len = rand() % 100 + 1; // 数组长度至少为1（避免无效遍历）
    for (int i = 0; i < len; i++) {
        num[i] = rand() % 100; // 元素范围0-99（非负）
    }
    int target = rand() % 100; // 目标值范围0-99
    int result[2];             // 存储结果下标

    find_two(num, target, len, result);
    
    // 输出数组元素（仅输出有效部分）
    printf("数组元素（前%d个）：\n", len);
    for (int i = 0; i < len; i++) {
        if(i%15==0)
            printf("\n");
        printf("%d\t", num[i]);
    }
    printf("\n目标和为%d\n", target);
    
    if (result[0] == -1 || result[1] == -1) {
        printf("没找到两个数的和等于%d\n", target);
    }
    else {
        printf("找到两个数，下标分别为%d和%d，对应的值为%d和%d，和为%d\n",
            result[0], result[1], num[result[0]], num[result[1]], target);
    }
    
    return 0;
}
```
<!-- endtab -->

<!-- tab Hash表 -->

```
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

void find_two(int arr[], int target, int len, int *result) {
    if (len < 2) { // 数组长度不足2，直接返回-1,-1
        result[0] = -1;
        result[1] = -1;
        return;
    }
    int hash_map[100]; // 哈希表记录值对应的下标，初始化为-1（未出现）
    for (int i = 0; i < 100; i++) {
        hash_map[i] = -1;
    }
    for (int i = 0; i < len; i++) {
        int complement = target - arr[i];
        // 检查补数是否在有效范围（0-99）且已出现过
        if (complement >= 0 && complement < 100 && hash_map[complement] != -1) {
            result[0] = hash_map[complement]; // 补数的下标
            result[1] = i;                    // 当前元素的下标
            return;
        }
        // 记录当前元素的下标（覆盖之前的，确保找到最近的或任意一个解）
        if (arr[i] >= 0 && arr[i] < 100) { // 确保元素在哈希表范围内
            hash_map[arr[i]] = i;
        }
    }
    // 未找到符合条件的数对
    result[0] = -1;
    result[1] = -1;
}

int main(void) {
    int num[100] = { 0 };
    srand(time(NULL));
    int len = rand() % 100 + 1; // 数组长度至少为1（避免len=0时死循环）
    for (int i = 0; i < len; i++) {
        num[i] = rand() % 100; // 元素范围0-99
    }
    int target = rand() % 100; // 目标值范围0-99
    int result[2] = { -1, -1 };

    find_two(num, target, len, result);
    
    // 输出数组元素（仅输出有效部分）
    printf("数组元素（前%d个）：\n", len);
    for (int i = 0; i < len; i++) {
        printf("%d\t", num[i]);
    }
    printf("\n目标和为%d\n", target);
    
    if (result[0] == -1 || result[1] == -1) {
        printf("没找到两个数的和等于%d\n", target);
    }
    else {
        printf("找到两个数，下标分别为%d和%d，对应的值为%d和%d，和为%d\n",
            result[0], result[1], num[result[0]], num[result[1]], target);
    }
    
    return 0;
}
```
<!-- endtab -->

<!-- tab 标准答案 -->

```
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[j] == target - nums[i]) {
                int* result = malloc(sizeof(int) * 2);
                result[0] = i;
                result[1] = j;
                *returnSize = 2;
                return result;
            }
        }
    }
    // Return an empty array if no solution is found
    *returnSize = 0;
    return malloc(sizeof(int) * 0);
}

```

<!-- endtab -->

<!-- tab C使用哈希函数 -->
```
#include <stdlib.h>
#include <stdbool.h>

// 定义哈希表节点结构体（键：元素值，值：下标）
typedef struct HashNode {
    int key;        // 数组元素的值
    int value;      // 元素的下标
    struct HashNode* next; // 链表指针（处理哈希冲突）
} HashNode;

// 定义哈希表结构体（桶数组+大小）
typedef struct {
    HashNode** buckets; // 桶数组（每个元素是链表头）
    int size;           // 桶的数量（哈希表大小）
} HashTable;

// 哈希函数：将key映射到桶的索引（处理负数）
static int hashFunction(HashTable* table, int key) {
    int hash = key % table->size;
    return hash < 0 ? hash + table->size : hash; // 确保索引非负
}

// 创建哈希表（初始化桶数组）
HashTable* hashTableCreate(int size) {
    HashTable* table = (HashTable*)malloc(sizeof(HashTable));
    table->size = size;
    table->buckets = (HashNode**)calloc(size, sizeof(HashNode*)); // 初始化为NULL
    return table;
}

// 在哈希表中查找key对应的value（不存在返回-1）
static int hashFind(HashTable* table, int key) {
    int index = hashFunction(table, key);
    HashNode* current = table->buckets[index];
    while (current != NULL) {
        if (current->key == key) {
            return current->value; // 找到键，返回下标
        }
        current = current->next;
    }
    return -1; // 未找到
}

// 向哈希表中插入key-value对（头插法）
static void hashInsert(HashTable* table, int key, int value) {
    int index = hashFunction(table, key);
    // 创建新节点并插入链表头部
    HashNode* newNode = (HashNode*)malloc(sizeof(HashNode));
    newNode->key = key;
    newNode->value = value;
    newNode->next = table->buckets[index]; // 头插法覆盖旧值（本题中无需担心）
    table->buckets[index] = newNode;
}

// 释放哈希表所有内存（避免泄漏）
static void hashTableFree(HashTable* table) {
    for (int i = 0; i < table->size; i++) {
        HashNode* current = table->buckets[i];
        while (current != NULL) {
            HashNode* temp = current;
            current = current->next;
            free(temp); // 释放链表节点
        }
    }
    free(table->buckets); // 释放桶数组
    free(table);          // 释放哈希表结构体
}

// 两数之和主函数
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 0; // 初始化返回数组长度为0
    if (numsSize < 2) { // 数组长度不足2，直接返回NULL
        return NULL;
    }

    // 创建哈希表（选择较大的质数10007减少冲突）
    HashTable* hashTable = hashTableCreate(10007);

    for (int i = 0; i < numsSize; i++) {
        int complement = target - nums[i]; // 计算补数：target - 当前元素值

        // 查找补数是否存在于哈希表中
        int complementIndex = hashFind(hashTable, complement);
        if (complementIndex != -1) {
            // 找到符合条件的数对，分配结果数组并返回
            int* result = (int*)malloc(2 * sizeof(int));
            result[0] = complementIndex;
            result[1] = i;
            *returnSize = 2;

            // 释放哈希表内存
            hashTableFree(hashTable);
            return result;
        }

        // 未找到补数，将当前元素插入哈希表
        hashInsert(hashTable, nums[i], i);
    }

    // 遍历结束未找到符合条件的数对，释放哈希表内存
    hashTableFree(hashTable);
    return NULL; // 返回NULL表示未找到
}
```
<!-- endtab -->

{% endtabs %}

本文案例是通过随机生成数组内容来检查函数，实际刷题时写出函数即可，不需要全部写出。