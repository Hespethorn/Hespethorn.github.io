---
title: CMake 案例实战：构建多文件计算项目
tags:
  - CMake
categories:
  - Linux
series: Linux
abbrlink: d5dbae0d
date: 2024-10-02 23:33:18
---
## 导言

在掌握 CMake 基础用法后，本文将通过一个完整的多文件计算项目案例，深入讲解 CMake 在实际开发中的应用。该案例包含加减乘除四个运算模块，通过 CMake 实现自动化构建，同时覆盖源文件搜索、头文件路径配置、变量使用等核心技巧，帮助你将 CMake 知识落地到实际项目中。

## 一、项目整体概览

### 1.1 项目功能

该项目实现了整数的加减乘除基本运算，通过main.cpp中的test()函数调用各运算模块，最终在控制台输出计算结果。项目结构清晰，将不同运算逻辑拆分到独立的源文件和头文件中，符合模块化开发思想。

### 1.2 完整文件结构

```
calc_project/
├── add.cpp        # 加法运算实现
├── add.h          # 加法运算声明
├── CMakeLists.txt # CMake配置文件
├── divi.cpp       # 除法运算实现
├── divi.h         # 除法运算声明
├── main.cpp       # 主程序（测试入口）
├── mult.cpp       # 乘法运算实现
├── mult.h         # 乘法运算声明
├── sub.cpp        # 减法运算实现
└── sub.h          # 减法运算声明
```

### 1.3 核心文件说明

| 文件名称        | 功能描述     | 关键内容                                                  |
| --------------- | ------------ | --------------------------------------------------------- |
| add.cpp/add.h   | 加法运算模块 | 声明并实现int add(int a, int b)函数                       |
| sub.cpp/sub.h   | 减法运算模块 | 声明并实现int sub(int a, int b)函数                       |
| mult.cpp/mult.h | 乘法运算模块 | 声明并实现int mult(int a, int b)函数                      |
| divi.cpp/divi.h | 除法运算模块 | 声明并实现double divi(int a, int b)函数（处理浮点数结果） |
| main.cpp        | 主程序入口   | 包含test()函数，调用各运算模块；main()函数作为程序入口    |

## 二、CMake 配置文件深度解析

### 2.1 基础版 CMakeLists.txt（案例中的配置）

首先分析你提供的基础版配置文件，理解其核心作用：

```
# case01 的 CMakeLists.txt
cmake_minimum_required(VERSION 3.15)  # 最低CMake版本要求（兼容3.15及以上）
project(case01)                      # 项目名称（会生成相关变量，如 PROJECT_NAME）

# 生成可执行文件：目标名为app，依赖的源文件包括main.cpp和四个运算模块的源文件
add_executable(app main.cpp add.cpp sub.cpp mult.cpp divi.cpp)
```

**配置文件解析**：

1. cmake_minimum_required(VERSION 3.15)：指定 CMake 最低版本为 3.15，避免因版本过低导致语法不兼容（如高版本 CMake 的新命令无法使用）。

1. project(case01)：定义项目名称为case01，同时自动生成一系列相关变量（如PROJECT_SOURCE_DIR表示项目根目录路径）。

1. add_executable(app ...)：核心命令，指定生成名为app的可执行文件，后面紧跟所有需要编译的源文件。这里直接列出所有.cpp文件，适合源文件数量较少的项目。

### 2.2 优化版 CMakeLists.txt（引入变量与搜索）

当项目源文件增多时，直接罗列文件会导致配置文件冗余。可通过set()命令定义变量存储源文件列表，或使用aux_source_directory/file(GLOB)搜索源文件，优化配置：

```
cmake_minimum_required(VERSION 3.15)
project(case01)

# 方式1：使用set()手动定义源文件列表（推荐，明确可控）
set(SRC_FILES 
    main.cpp 
    add.cpp 
    sub.cpp 
    mult.cpp 
    divi.cpp
)

# 方式2：使用aux_source_directory搜索当前目录下所有.cpp文件（简单但可能包含无关文件）
# aux_source_directory(${CMAKE_CURRENT_SOURCE_DIR} SRC_FILES)

# 方式3：使用file(GLOB)搜索指定模式的文件（灵活，支持通配符）
# file(GLOB SRC_FILES ${CMAKE_CURRENT_SOURCE_DIR}/*.cpp)

# 生成可执行文件，引用源文件变量
add_executable(app ${SRC_FILES})

# 可选：添加编译选项（如启用C++11标准）
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 可选：打印调试信息（查看变量值，辅助排查问题）
message(STATUS "项目根目录：${PROJECT_SOURCE_DIR}")
message(STATUS "源文件列表：${SRC_FILES}")
```

**优化点说明**：

- **变量管理**：通过set(SRC_FILES ...)将源文件集中管理，后续修改只需更新变量，无需修改add_executable命令。

- **源文件搜索**：aux_source_directory和file(GLOB)适合源文件较多的场景，但需注意：aux_source_directory仅搜索指定目录下的源文件，不包含子目录；file(GLOB)支持通配符（如*.cpp），灵活性更高。

- **编译标准**：添加CMAKE_CXX_STANDARD和CMAKE_CXX_STANDARD_REQUIRED，强制使用 C++11 标准，避免因编译器默认标准不同导致的兼容性问题。

- **调试信息**：message(STATUS ...)打印关键变量值，方便排查路径错误、源文件遗漏等问题（运行cmake ..时会在控制台显示）。

## 三、C++ 代码与头文件规范解析

### 3.1 头文件防护（避免重复包含）

所有头文件（如add.h、sub.h）都使用了**头文件防护宏**，这是 C/C++ 开发的基本规范，可防止头文件被重复包含导致的编译错误：

```
// add.h 示例
#ifndef __ADD_H__  // 如果__ADD_H__未定义
#define __ADD_H__  // 定义__ADD_H__
int add(int a, int b);  // 函数声明
#endif  // 结束条件编译
```

**原理**：第一次包含头文件时，__ADD_H__未定义，会执行#define __ADD_H__和函数声明；后续再次包含时，因__ADD_H__已定义，会跳过中间内容，避免函数重复声明。

### 3.2 函数实现与声明分离

项目采用 “头文件声明、源文件实现” 的模式，符合模块化开发思想：

- **头文件（.h）**：仅包含函数声明（如int add(int a, int b);），不包含具体实现，便于其他文件引用。

- **源文件（.cpp）**：包含函数实现（如int add(int a, int b) { return a + b; }），需包含对应的头文件（如#include "add.h"），确保声明与实现一致。

**优势**：

1. 减少编译依赖：修改源文件时，只需重新编译该源文件，无需重新编译所有引用头文件的文件。

1. 代码结构清晰：使用者只需查看头文件即可了解函数接口，无需关注实现细节。

### 3.3 除法运算的浮点数处理

divi.cpp中除法运算返回double类型，并通过1.0 * a / b确保浮点数计算：

```
// divi.cpp
#include "divi.h"
double divi(int a, int b) {
    return 1.0 * a / b;  // 1.0将计算转换为浮点数，避免整数除法（如12/8=1，而非1.5）
}
```

**关键细节**：

- C++ 中，若两个整数进行除法（如12 / 8），结果会自动取整（得到 1）；通过1.0 * a将a转换为浮点数，后续计算会按浮点数规则进行（得到 1.5）。

- 函数返回类型定义为double，匹配浮点数结果，确保精度不丢失。

## 四、项目构建与运行步骤

### 4.1 命令行构建流程（Linux/macOS）

遵循 CMake“**out-of-source build**”（源码外构建）的最佳实践，步骤如下：

#### 步骤 1：创建构建目录（推荐）

在项目根目录下创建build目录，用于存放 CMake 生成的构建文件（如 Makefile）和编译产物（如可执行文件app），避免污染源代码：

```
cd calc_project  # 进入项目根目录
mkdir build      # 创建build目录
cd build         # 进入build目录
```

#### 步骤 2：生成构建文件

运行cmake ..，CMake 会读取项目根目录（..表示上级目录）的CMakeLists.txt，生成对应的构建文件（Linux 下默认生成 Makefile）：

```
cmake ..
```

**预期输出**：

若配置正确，控制台会显示类似以下信息（包含项目名称、源文件列表等）：

```
-- The CXX compiler identification is GNU 9.4.0
-- Project root directory: /home/user/calc_project
-- Source files list: /home/user/calc_project/main.cpp;/home/user/calc_project/add.cpp;/home/user/calc_project/sub.cpp;/home/user/calc_project/mult.cpp;/home/user/calc_project/divi.cpp
-- Configuring done
-- Generating done
-- Build files have been written to: /home/user/calc_project/build
```

#### 步骤 3：编译项目

运行make命令，根据生成的 Makefile 编译项目：

```
# 基础编译（单线程）
make

# 多线程编译（推荐，加快速度，-j4表示4线程）
make -j4
```

**编译成功标志**：

控制台无错误信息，且build目录下会生成可执行文件app（Linux/macOS 下）。

#### 步骤 4：运行程序

在build目录下运行生成的app：

```
./app
```

**预期输出**：

```
a+b = 20
a-b = 4
a*b = 96
a/b = 1.5
```

## 六、CMake 核心知识点总结

通过本案例，我们可梳理出以下常用 CMake 知识点，帮助你举一反三：

### 6.1 核心命令与变量

| 命令 / 变量                | 功能描述                                 | 案例中的应用                                                 |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| cmake_minimum_required     | 指定最低 CMake 版本                      | cmake_minimum_required(VERSION 3.15)                         |
| project                    | 定义项目名称，生成项目相关变量           | project(case01)，生成PROJECT_SOURCE_DIR                      |
| set                        | 定义变量（如源文件列表、编译选项）       | set(SRC_FILES main.cpp add.cpp ...)                          |
| add_executable             | 生成可执行文件                           | add_executable(app ${SRC_FILES})                             |
| target_include_directories | 为目标指定头文件搜索路径                 | target_include_directories(app PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}) |
| message                    | 打印调试信息                             | message(STATUS "项目根目录：${PROJECT_SOURCE_DIR}")          |
| CMAKE_CURRENT_SOURCE_DIR   | 当前CMakeLists.txt所在目录               | 指定头文件搜索路径、源文件搜索路径                           |
| PROJECT_SOURCE_DIR         | 项目根目录（顶层CMakeLists.txt所在目录） | 全局路径配置                                                 |

### 6.2 最佳实践

1. **源码外构建**：始终在build目录下运行cmake和make，避免生成的文件污染源代码。

1. **变量管理**：通过set将源文件、路径等集中管理，提高配置文件的可维护性。

1. **头文件路径**：使用target_include_directories而非include_directories，实现目标级的精准配置，减少全局依赖。

1. **编译标准**：明确指定CMAKE_CXX_STANDARD，避免编译器默认标准不同导致的兼容性问题。

1. **调试信息**：使用message(STATUS ...)打印关键变量，方便排查问题。

## 七、扩展：从单目录到多目录项目

本案例是单目录项目（所有文件在同一目录下），若项目规模扩大，可拆分为多目录结构（如src存放源文件、include存放头文件）。以下是多目录项目的CMakeLists.txt示例：

### 7.1 多目录项目结构

```
calc_project/
├── CMakeLists.txt       # 顶层CMake配置
├── include/             # 头文件目录
│   ├── add.h
│   ├── sub.h
│   ├── mult.h
│   └── divi.h
└── src/                 # 源文件目录
    ├── main.cpp
    ├── add.cpp
    ├── sub.cpp
    ├── mult.cpp
    └── divi.cpp
```

### 7.2 顶层 CMakeLists.txt

```
cmake_minimum_required(VERSION 3.15)
project(case01)

# 设置C++标准
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 添加子目录（src目录下需有自己的CMakeLists.txt）
add_subdirectory(src)

# 打印调试信息
message</doubaocanvas>
```