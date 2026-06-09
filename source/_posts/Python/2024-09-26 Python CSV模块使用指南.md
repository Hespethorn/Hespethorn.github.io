---
title: Python CSV模块使用指南
tags:
  - Python
  - CSV
  - 数据处理
  - 文件操作
categories:
  - Python
series: Python
abbrlink: python-csv-module-guide
date: 2024-09-26
---

## 一、什么是CSV？

CSV（Comma-Separated Values）是一种简单的文件格式，用于存储表格数据，如电子表格或数据库。CSV文件中的每行代表表格中的一行，每行中的值用逗号（或其他分隔符）分隔。

## 二、Python的CSV模块

Python标准库中的`csv`模块提供了处理CSV文件的功能，它可以帮助你读取和写入CSV文件，处理各种CSV格式的变体。

## 三、读取CSV文件

### 1. 基本读取

```python
import csv

with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

### 2. 读取为字典

```python
import csv

with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)
```

## 四、写入CSV文件

### 1. 基本写入

```python
import csv

with open('output.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['姓名', '年龄', '城市'])
    writer.writerow(['Alice', 25, '北京'])
    writer.writerow(['Bob', 30, '上海'])
```

### 2. 写入字典

```python
import csv

fieldnames = ['姓名', '年龄', '城市']
with open('output.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerow({'姓名': 'Alice', '年龄': 25, '城市': '北京'})
    writer.writerow({'姓名': 'Bob', '年龄': 30, '城市': '上海'})
```

## 五、处理不同的分隔符

CSV文件不一定使用逗号作为分隔符，有时会使用制表符（\t）、分号（;）等。`csv`模块可以处理这些情况：

### 1. 读取使用制表符分隔的文件

```python
import csv

with open('data.tsv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    for row in reader:
        print(row)
```

### 2. 写入使用分号分隔的文件

```python
import csv

with open('output.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f, delimiter=';')
    writer.writerow(['姓名', '年龄', '城市'])
    writer.writerow(['Alice', 25, '北京'])
```

## 六、处理引号

CSV文件中的值有时会用引号包围，特别是当值中包含逗号、换行符等特殊字符时。`csv`模块可以处理这些情况：

### 1. 读取带引号的值

```python
import csv

with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, quotechar='"')
    for row in reader:
        print(row)
```

### 2. 写入带引号的值

```python
import csv

with open('output.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    writer.writerow(['姓名', '年龄', '城市'])
    writer.writerow(['Alice', 25, '北京'])
```

## 七、处理编码问题

在处理CSV文件时，编码问题是一个常见的挑战。特别是当CSV文件来自不同的系统时，可能会使用不同的编码：

### 1. 读取使用不同编码的文件

```python
import csv

with open('data.csv', 'r', encoding='gbk') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
```

### 2. 写入使用特定编码的文件

```python
import csv

with open('output.csv', 'w', newline='', encoding='gbk') as f:
    writer = csv.writer(f)
    writer.writerow(['姓名', '年龄', '城市'])
    writer.writerow(['Alice', 25, '北京'])
```

## 八、实际应用示例

### 1. 读取CSV文件并进行数据分析

```python
import csv

# 读取CSV文件
with open('sales.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    sales_data = list(reader)

# 计算总销售额
total_sales = 0
for row in sales_data:
    total_sales += float(row['销售额'])

print(f"总销售额：{total_sales}")

# 按产品类别统计销售额
category_sales = {}
for row in sales_data:
    category = row['产品类别']
    sales = float(row['销售额'])
    if category in category_sales:
        category_sales[category] += sales
    else:
        category_sales[category] = sales

print("按产品类别统计销售额：")
for category, sales in category_sales.items():
    print(f"{category}: {sales}")
```

### 2. 写入数据到CSV文件

```python
import csv

# 准备数据
data = [
    {'姓名': 'Alice', '年龄': 25, '城市': '北京'},
    {'姓名': 'Bob', '年龄': 30, '城市': '上海'},
    {'姓名': 'Charlie', '年龄': 35, '城市': '广州'}
]

# 写入到CSV文件
fieldnames = ['姓名', '年龄', '城市']
with open('people.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

print("数据已写入到people.csv文件")
```
